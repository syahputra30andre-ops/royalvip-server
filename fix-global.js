import fs from "fs";
import path from "path";

const targetDir = "./"; // ubah kalau file kamu ada di folder lain
const searchPatterns = ["https://royalvip-server.onrender.com/upload", "https://royalvip-server.onrender.com/upload", "https://royalvip-server.onrender.com/upload", "https://royalvip-server.onrender.com/upload"];
const replaceURL = "https://royalvip-server.onrender.com";

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let updated = content;
  for (const pattern of searchPatterns) {
    const regex = new RegExp(pattern, "g");
    updated = updated.replace(regex, replaceURL);
  }
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDirectory(fullPath);
    } else if (file.endsWith(".js") || file.endsWith(".html")) {
      replaceInFile(fullPath);
    }
  }
}

console.log("🚀 Converting local endpoints to global...");
traverseDirectory(targetDir);
console.log("✅ All done! Now zip and upload to Cloudflare Pages.");
