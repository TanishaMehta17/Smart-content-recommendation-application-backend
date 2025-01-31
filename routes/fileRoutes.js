// const express = require("express");
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");
// const pdfParse = require("pdf-parse");
// const summarizeContent = require("../controllers/fileController");

// const fileRouter = express.Router();

// // Multer setup for handling file uploads
// const upload = multer({ dest: "uploads/" });

// fileRouter.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     const filePath = req.file.path;
//     let fileText = "";

//     // Determine file type based on extension
//     const fileExt = path.extname(req.file.originalname).toLowerCase();

//     if (fileExt === ".txt") {
//       fileText = fs.readFileSync(filePath, "utf8"); // Read text file
//     } else if (fileExt === ".pdf") {
//       const pdfBuffer = fs.readFileSync(filePath);
//       const pdfData = await pdfParse(pdfBuffer);
//       fileText = pdfData.text; // Extract text from PDF
//     } else {
//       fs.unlinkSync(filePath); // Delete the unsupported file
//       return res.status(400).json({ error: "Unsupported file type. Only TXT and PDF are allowed." });
//     }

//     // Log extracted text for debugging
//     console.log("Extracted text:", fileText);

//     if (!fileText.trim()) {
//       fs.unlinkSync(filePath);
//       return res.status(400).json({ error: "Extracted text is empty. Ensure the file contains readable text." });
//     }

//     // Get the summary from Google Gemini AI
//     let summary;
//     try {
//       summary = await summarizeContent(fileText);
//       if (!summary || summary.trim().length === 0) {
//         throw new Error("Summary is empty or failed to generate.");
//       }
//     } catch (err) {
//       console.error("AI Summary Generation Error:", err);
//       fs.unlinkSync(filePath);
//       return res.status(500).json({ error: "Failed to generate summary. Try again later." });
//     }

//     // Delete the uploaded file after successful processing
//     fs.unlinkSync(filePath);

//     // Send response
//     res.json({ summary });

//   } catch (error) {
//     console.error("Error processing file:", error);
//     res.status(500).json({ error: "Internal server error. Please try again." });
//   }
// });

// module.exports = fileRouter;
const express = require("express");
const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const pdfParse = require("pdf-parse");
const summarizeContent = require("../controllers/fileController");
require("dotenv").config();

const fileRouter = express.Router();

// AWS S3 Configuration
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer S3 storage configuration
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: "private", // "public-read" if you want public files
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `uploads/${Date.now()}_${file.originalname}`);
    },
  }),
});

// Upload File Route
fileRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileKey = req.file.key; // File path in S3
    console.log("Uploaded file key:", fileKey);

    // Download the file from S3 to process it
    const fileData = await s3.getObject({ Bucket: process.env.S3_BUCKET_NAME, Key: fileKey }).promise();
    let fileText = "";

    // Extract file content based on type
    const fileExt = req.file.originalname.split(".").pop().toLowerCase();
    if (fileExt === "txt") {
      fileText = fileData.Body.toString("utf-8"); // Read TXT content
    } else if (fileExt === "pdf") {
      const pdfData = await pdfParse(fileData.Body);
      fileText = pdfData.text; // Extract text from PDF
    } else {
      return res.status(400).json({ error: "Unsupported file type. Only TXT and PDF allowed." });
    }

    if (!fileText.trim()) {
      return res.status(400).json({ error: "Extracted text is empty." });
    }

    // Generate AI Summary
    let summary;
    try {
      summary = await summarizeContent(fileText);
    } catch (err) {
      console.error("AI Summary Generation Error:", err);
      return res.status(500).json({ error: "Failed to generate summary." });
    }

    // Respond with the summary
    res.json({ summary, fileUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}` });

  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = fileRouter;
