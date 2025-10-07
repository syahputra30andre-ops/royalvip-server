const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (frontend must not change)
app.use(cors());

// Ensure uploads directory exists under /server
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads so /uploads/<file> is accessible
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    // Allow cross-origin access to uploaded files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Simple health check
app.get('/', (_req, res) => {
  res.type('text/plain').send('✅ RoyalVIP Server Aktif');
});

// Multer storage config: keep original filename; if collision, auto-rename by multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Sanitize filename minimally to remove path separators
    const safeName = path.basename(file.originalname).replace(/[\r\n]/g, '');
    cb(null, safeName);
  }
});

const upload = multer({ storage });

// Accept file(s) sent via FormData; support any field name by using .any()
app.post('/upload', upload.any(), (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: 'No file received' });
    }
    const saved = files[0];
    const baseUrl = process.env.BASE_URL || 'https://royalvip-server.onrender.com';
    const fileUrl = `${baseUrl}/uploads/${encodeURIComponent(path.basename(saved.filename))}`;

    return res.status(200).json({ url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`RoyalVIP server running on port ${PORT}`);
});
