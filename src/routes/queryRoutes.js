const express = require("express");
const multer = require("multer");
const { generateCode } = require("../services/codeGenerationService");
// const { queryVectorDb } = require("../services/vectorDbService");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post(
  "/generate-code",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "json", maxCount: 1 },
    { name: "text", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { files, body } = req;
      const { prompt } = body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      //   console.log("Querying vector database...");
      //   const relevantDocs = await queryVectorDb(prompt);
      //   console.log(`Retrieved ${relevantDocs.length} relevant documents`);

      console.log("Generating code...");
      //   const result = await generateCode(prompt, files, body, relevantDocs);
      const result = await generateCode(prompt, files, body);
      console.log("Code generated successfully");

      res
        .status(200)
        .json({ code: result.generatedCode, explanation: result.explanation });
    } catch (error) {
      console.error("Error in code generation:", error);
      res.status(500).json({
        error: "An error occurred during code generation",
        details: error.message,
      });
    }
  }
);

module.exports = router;
