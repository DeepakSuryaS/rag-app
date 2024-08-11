const express = require("express");
const dotenv = require("dotenv");
const { initVectorDb } = require("./services/vectorDbService");
const uploadRoutes = require("./routes/uploadRoutes");
const queryRoutes = require("./routes/queryRoutes");
const {
  testAnthropicConnection,
  initAnthropicClient,
} = require("./services/codeGenerationService");

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/query", queryRoutes);

const PORT = process.env.PORT || 3000;

app.get("/test-pinecone", async (req, res) => {
  try {
    await initVectorDb();
    console.log("Pinecone response:", res);
    res.json({ message: "Pinecone connection successful" });
  } catch (error) {
    console.error("Pinecone connection failed:", error);
    res
      .status(500)
      .json({ error: "Pinecone connection failed", details: error.message });
  }
});

app.get("/test-anthropic", async (req, res) => {
  try {
    const result = await testAnthropicConnection();
    res.json({ message: result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Anthropic connection failed", details: error.message });
  }
});

async function startServer() {
  try {
    await initVectorDb();
    console.log("Vector database initialized successfully");

    initAnthropicClient();

    // if (!process.env.ANTHROPIC_API_KEY) {
    //   throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
    // }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
