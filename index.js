import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'videos';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// Layani file statis dari root (index.html)
app.use(express.static(rootDir));

// Upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(req.file.originalname);
    const fileName = `${randomUUID()}${ext}`;
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
    });

    if (error) return res.status(500).json({ error: error.message });

    const { data: signedUrlData } = await supabase.storage.from(SUPABASE_BUCKET).createSignedUrl(fileName, 60 * 60 * 24);
    return res.json({ url: signedUrlData.signedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', detail: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
