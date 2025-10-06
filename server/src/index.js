import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'crypto';
import path from 'path';

dotenv.config();

const {
  PORT = 8080,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_BUCKET = 'videos',
  CORS_ORIGINS = '*'
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[BOOT] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { 'X-Client-Info': 'royalvip-server/1.0' } }
});

const app = express();

// CORS
const corsOptions = CORS_ORIGINS === '*' 
  ? { origin: true, credentials: true }
  : { origin: CORS_ORIGINS.split(',').map(s => s.trim()), credentials: true };
app.use(cors(corsOptions));

// Security and logging
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rate limit basic
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// Multer for multipart
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024  // 1GB
  }
});

// Helper: ensure bucket exists (idempotent)
async function ensureBucket(bucket) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucket)) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 1024 * 1024 * 1024
      });
      if (error) {
        console.error('[bucket] create error', error);
      } else {
        console.log(`[bucket] created: ${bucket}`);
      }
    }
  } catch (e) {
    console.warn('[bucket] ensure skipped (requires service role permission).', e?.message || e);
  }
}
ensureBucket(SUPABASE_BUCKET);

// Upload endpoint
app.post('/api/videos/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
    const userId = (req.body.userId || 'anonymous').toString();
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.mp4';
    const key = `${userId}/${randomUUID()}${ext}`;

    const { error: upErr } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .upload(key, req.file.buffer, {
        contentType: req.file.mimetype || 'video/mp4',
        cacheControl: '3600',
        upsert: false
      });

    if (upErr) {
      return res.status(500).json({ error: upErr.message });
    }

    // Create a signed URL for playback (1 day)
    const { data: signed, error: signErr } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .createSignedUrl(key, 60 * 60 * 24);

    if (signErr) {
      return res.status(500).json({ error: signErr.message });
    }

    res.json({
      path: key,
      bucket: SUPABASE_BUCKET,
      signedUrl: signed?.signedUrl
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upload failed', detail: e?.message });
  }
});

// List user videos (prefix by userId)
app.get('/api/videos', async (req, res) => {
  try {
    const userId = (req.query.userId || 'anonymous').toString();
    const prefix = `${userId}/`;

    const { data, error } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .list(prefix, { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) return res.status(500).json({ error: error.message });

    // Build signed URLs for each file (short-lived)
    const results = [];
    for (const item of data || []) {
      const fullPath = `${prefix}${item.name}`;
      const { data: signed, error: sErr } = await supabase
        .storage
        .from(SUPABASE_BUCKET)
        .createSignedUrl(fullPath, 60 * 60); // 1h
      results.push({
        name: item.name,
        path: fullPath,
        size: item.metadata?.size ?? null,
        signedUrl: signed?.signedUrl,
        createdAt: item.created_at ?? null
      });
    }

    res.json({ items: results });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'List failed' });
  }
});

// Generate signed URL for a specific path
app.get('/api/videos/signed-url', async (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Missing path' });
  try {
    const { data, error } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .createSignedUrl(filePath, 60 * 60); // 1h
    if (error) return res.status(500).json({ error: error.message });
    res.json({ signedUrl: data?.signedUrl });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Failed' });
  }
});

// Delete file (server-protected; you may add auth)
app.delete('/api/videos', async (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Missing path' });
  try {
    const { error } = await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .remove([filePath]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'Delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[royalvip] server listening on :${PORT}`);
});
