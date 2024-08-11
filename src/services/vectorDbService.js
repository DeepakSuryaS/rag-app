const { Pinecone } = require("@pinecone-database/pinecone");
const { Document } = require("langchain/document");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

let pinecone = null;
let index = null;
let embeddings = null;

// const vector_index = pinecone.Index(process.env.VECTOR_DB_INDEX_NAME);

async function initVectorDb() {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.VECTOR_DB_API_KEY,
      // environment: process.env.VECTOR_DB_ENVIRONMENT,
      // environment: "us-east-1",
    });
  }

  if (!index) {
    // index = pinecone.Index(process.env.VECTOR_DB_INDEX_NAME);
    index = pinecone.index(process.env.VECTOR_DB_INDEX_NAME);
  }

  if (!embeddings) {
    embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }
}

async function ensureInitialized() {
  if (!pinecone || !index) {
    await initVectorDb();
  }
}

async function saveToVectorDb(document) {
  try {
    await ensureInitialized();

    console.log("Creating embedding for document...");
    const embeddingVector = await embeddings.embedQuery(document.content);
    console.log("Embedding created successfully");

    const stats = await index.describeIndexStats();
    console.log("Pinecone index stats: ", stats);

    console.log("Upserting document to Pinecone...");
    await index.upsert([
      {
        id: `doc_${Date.now()}`,
        values: embeddingVector,
        metadata: {
          type: document.type,
          filename: document.filename,
          content: document.content,
        },
      },
    ]);
    console.log("Document upserted successfully");
  } catch (error) {
    console.error("Error in saveToVectorDb:", error);
    throw error;
  }
}

async function queryVectorDb(query) {
  try {
    await ensureInitialized();

    console.log("Creating embedding for query...");
    const queryEmbedding = await embeddings.embedQuery(query);
    console.log("Query embedding created successfully");

    console.log("Querying Pinecone...");
    const queryResult = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });
    console.log("Pinecone query completed successfully");

    return queryResult.matches.map(
      (match) =>
        new Document({
          pageContent: match.metadata.content,
          metadata: {
            type: match.metadata.type,
            filename: match.metadata.filename,
          },
        })
    );
  } catch (error) {
    console.error("Error in queryVectorDb:", error);
    throw error;
  }
}

module.exports = { initVectorDb, saveToVectorDb, queryVectorDb };
