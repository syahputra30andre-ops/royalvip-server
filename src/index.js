import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pastikan folder uploads ada
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});
const upload = multer({ storage });

// Endpoint upload (POST)
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

// Serve file uploads statis
app.use("/uploads", express.static(uploadDir));

// Tidak ubah root route
// Render / frontend akan menangani tampilan sendiri

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
