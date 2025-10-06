// === KONFIGURASI ===
const SUPABASE_URL = "https://ulyuvqcqtjpmekvwpqtm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVseXV2cWNxdGpwbWVrdndwcXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MzkwNTIsImV4cCI6MjA3MjAxNTA1Mn0.K695w_lcRWnhVxUhPzLDs6UfQteHjnofhRakOCUh29A";
const API_URL = "https://royalvip-server.onrender.com/upload";

const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
const statusEl = document.getElementById("status");
const videoList = document.getElementById("video-list");

// === SUPABASE CLIENT ===
async function listVideos() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/videos?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const data = await res.json();
    videoList.innerHTML = "";
    data.reverse().forEach(v => {
      const vid = document.createElement("video");
      vid.src = v.url;
      vid.controls = true;
      videoList.appendChild(vid);
    });
  } catch (err) {
    console.error("❌ Gagal ambil video:", err);
  }
}

// === UPLOAD VIDEO ===
uploadBtn.addEventListener("click", async () => {
  const selectedFile = fileInput.files[0];
  if (!selectedFile) return alert("Pilih file dulu!");

  statusEl.textContent = "⏳ Uploading...";

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(API_URL, { method: "POST", body: formData });
    const data = await res.json();
    console.log("✅ Uploaded:", data.url);
    statusEl.textContent = "✅ Upload berhasil!";

    await fetch(`${SUPABASE_URL}/rest/v1/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify({ url: data.url, created_at: new Date().toISOString() })
    });

    await listVideos();
  } catch (err) {
    console.error("❌ Upload gagal:", err);
    statusEl.textContent = "❌ Upload gagal.";
  }
});

// === LOAD DATA SAAT AWAL ===
listVideos();
