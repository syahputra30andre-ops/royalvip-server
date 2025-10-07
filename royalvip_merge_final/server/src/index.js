const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Pastikan folder uploads ada
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sajikan file statis dari root project (frontend)
const rootDir = path.join(__dirname, '..', '..');
app.use(express.static(rootDir));

// Sajikan folder uploads agar file bisa diakses global
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Setup penyimpanan file upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = path.basename(file.originalname).replace(/[\r\n]/g, '');
    cb(null, safeName);
  }
});

const upload = multer({ storage });

// Endpoint upload file
app.post('/upload', upload.any(), (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: 'No file received' });
    }
    const saved = req.files[0];
    const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${encodeURIComponent(path.basename(saved.filename))}`;
    return res.status(200).json({ url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// Fallback agar route apa pun mengarah ke index.html (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ RoyalVIP Server berjalan di port ${PORT}`);
});
