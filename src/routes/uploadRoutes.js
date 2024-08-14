const express = require("express");
const multer = require("multer");
const { processDocuments } = require("../services/documentProcessor");
const { saveToVectorDb } = require("../services/vectorDbService");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// router.post("/documents", upload.array("files", 10), async (req, res) => {
//   try {
//     const { files } = req;
//     if (!files || files.length === 0) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     const processedContents = await processDocuments(files);
//     console.log("Processed Contents:", processedContents);

//     for (const content of processedContents) {
//       await saveToVectorDb(content);
//     }

//     res.status(200).json({
//       message: `${files.length} document(s) processed and saved successfully`,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/documents", upload.array("files", 10), async (req, res) => {
  try {
    const { files } = req;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log(`Processing ${files.length} files...`);
    const processedContents = await processDocuments(files);
    console.log("Documents processed successfully");

    for (const content of processedContents) {
      console.log(`Saving document to vector database: ${content.filename}`);
      await saveToVectorDb(content);
      console.log(`Document saved successfully: ${content.filename}`);
    }

    res.status(200).json({
      message: `${files.length} document(s) processed and saved successfully`,
    });
  } catch (error) {
    console.error("Error in document upload:", error);
    res.status(500).json({
      error: "An error occurred during document processing",
      details: error.message,
    });
  }
});

// // In queryRoutes.js
// router.post(
//   "/generate-code",
//   upload.fields([
//     { name: "images", maxCount: 5 },
//     { name: "json", maxCount: 1 },
//     { name: "text", maxCount: 1 },
//   ]),
//   async (req, res) => {
//     try {
//       const { files, body } = req;
//       const { prompt } = body;

//       if (!prompt) {
//         return res.status(400).json({ error: "Prompt is required" });
//       }

//       console.log("Querying vector database...");
//       const relevantDocs = await queryVectorDb(prompt);
//       console.log(`Retrieved ${relevantDocs.length} relevant documents`);

//       console.log("Generating code...");
//       const generatedCode = await generateCode(
//         prompt,
//         files,
//         body,
//         relevantDocs
//       );
//       console.log("Code generated successfully");

//       res.status(200).json({ code: generatedCode });
//     } catch (error) {
//       console.error("Error in code generation:", error);
//       res
//         .status(500)
//         .json({
//           error: "An error occurred during code generation",
//           details: error.message,
//         });
//     }
//   }
// );

module.exports = router;
