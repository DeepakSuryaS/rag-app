const { OpenAIEmbeddings } = require("langchain/embeddings/openai");

const embeddings = new OpenAIEmbeddings();

async function createEmbedding(text) {
  return await embeddings.embedQuery(text);
}

module.exports = { createEmbedding };
