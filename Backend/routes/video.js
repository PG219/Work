import { Storage } from "@google-cloud/storage";
import express from "express";

const router = express.Router();

const storage = new Storage({
  keyFilename: "service.json", // service account key
});

router.get("/demo", async (req, res) => {
  try {
    const bucketName = "governance-bucket";
    const fileName = "rakfort-videos/governance-demo.mp4";

    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    const [url] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options);

    return res.json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

export default router;
