import cloudinary from "./src/config/cloudinary.js"; // pastikan path sesuai

async function testPing() {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected:", result);
  } catch (err) {
    console.error("❌ Cloudinary connection failed:", err);
  }
}

testPing();