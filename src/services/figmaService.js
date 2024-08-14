const axios = require("axios");

class FigmaService {
  constructor(accessToken) {
    this.api = axios.create({
      baseURL: "https://api.figma.com/v1",
      headers: { "X-Figma-Token": accessToken },
    });
  }

  //   async getFileComponents(fileId) {
  //     try {
  //       const response = await this.api.get(`/files/${fileId}`);
  //       return this.extractComponents(response.data);
  //     } catch (error) {
  //       console.error("Error fetching Figma file:", error);
  //       throw error;
  //     }
  //   }

  async getFileComponents(json) {
    try {
      //   const response = await this.api.get(`/files/${fileId}`);
      return this.extractComponents(json);
    } catch (error) {
      console.error("Error fetching Figma file:", error);
      throw error;
    }
  }

  extractComponents(data) {
    const components = [];
    const traverse = (node) => {
      if (node.type === "COMPONENT" || node.type === "INSTANCE") {
        console.log("node check:", node);
        components.push({
          id: node.id,
          name: node.name,
          type: node.type,
        });
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(data);
    return components;
  }
}

module.exports = FigmaService;
