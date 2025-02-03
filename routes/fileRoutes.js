
const express = require("express");
const multer = require("multer");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const pdfParse = require("pdf-parse");
const summarizeContent = require("../controllers/fileController");
require("dotenv").config();

const fileRouter = express.Router();

// AWS S3 Configuration using AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer configuration (memory storage for buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Utility function to convert stream to buffer
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

// Upload File Route
fileRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload file to S3
    const fileKey = `uploads/${Date.now()}_${req.file.originalname}`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "private",
    };

    const uploadCommand = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await uploadCommand.done();
    console.log("Uploaded file to S3:", fileKey);

    // Retrieve the file from S3
    const getObjectParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    };
    const getObjectCommand = new GetObjectCommand(getObjectParams);
    const s3Response = await s3Client.send(getObjectCommand);

    const fileBuffer = await streamToBuffer(s3Response.Body);
    let extractedText = "";

    // Extract text based on file type
    const fileExt = req.file.originalname.split(".").pop().toLowerCase();
    if (fileExt === "txt") {
      extractedText = fileBuffer.toString("utf-8");
    } else if (fileExt === "pdf") {
      const pdfData = await pdfParse(fileBuffer);
      extractedText = pdfData.text;
    } else {
      return res.status(400).json({ error: "Unsupported file type. Only TXT and PDF allowed." });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "Extracted text is empty." });
    }

    // Generate AI Summary
    let summary;
    try {
      summary = await summarizeContent(extractedText);
    } catch (err) {
      console.error("AI Summary Generation Error:", err);
      return res.status(500).json({ error: "Failed to generate summary." });
    }

    // Respond with summary and file URL
    res.json({
      summary,
      fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
    });

  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = fileRouter;
