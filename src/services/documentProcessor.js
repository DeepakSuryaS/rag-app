const pdfParse = require("pdf-parse");
const sharp = require("sharp");
const cheerio = require("cheerio");
const fs = require("fs").promises;

async function processDocuments(files) {
  const processedContents = await Promise.all(files.map(processDocument));
  return processedContents.flat(); // Flatten the array in case any processors return arrays
}

async function processDocument(file) {
  switch (file.mimetype) {
    case "application/pdf":
      return processPdf(file);
    case "image/png":
    case "image/jpeg":
      return processImage(file);
    case "text/markdown":
    case "text/plain":
      return processText(file);
    case "application/json":
      return processJson(file);
    default:
      throw new Error(`Unsupported file type: ${file.mimetype}`);
  }
}

async function processPdf(file) {
  const dataBuffer = await fs.readFile(file.path);
  const data = await pdfParse(dataBuffer);
  return [{ type: "pdf", content: data.text, filename: file.originalname }];
}

async function processImage(file) {
  // Implement image processing logic (e.g., OCR)
  // For this example, we'll just return image metadata
  const metadata = await sharp(file.path).metadata();
  return [
    {
      type: "image",
      content: JSON.stringify(metadata),
      filename: file.originalname,
    },
  ];
}

async function processText(file) {
  const content = await fs.readFile(file.path, "utf8");
  return [{ type: "text", content, filename: file.originalname }];
}

async function processJson(file) {
  const jsonContent = await fs.readFile(file.path, "utf8");
  const parsedContent = JSON.parse(jsonContent);
  // If the JSON represents a Figma API response, you might want to process it differently
  return [
    {
      type: "json",
      content: JSON.stringify(parsedContent),
      filename: file.originalname,
    },
  ];
}

module.exports = { processDocuments };
