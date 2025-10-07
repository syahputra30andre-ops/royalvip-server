import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.resolve();
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\.-]/g, "");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});
const upload = multer({ storage });

app.get("/", (req, res) => {
  res.status(200).send("✅ RoyalVIP Server Aktif");
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Tidak ada file yang diunggah." });
  }

  const fileUrl = `https://royalvip-server.onrender.com/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

app.use("/uploads", express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di port ${PORT}`);
});
