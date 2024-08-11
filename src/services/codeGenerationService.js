const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs").promises;

let anthropic;

function initAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment variables");
  }

  anthropic = new Anthropic({
    apiKey: apiKey,
  });

  console.log("Anthropic client initialized");
}

async function testAnthropicConnection() {
  try {
    if (!anthropic) {
      initAnthropicClient();
    }

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 100,
      messages: [{ role: "user", content: "Hello, Claude!" }],
    });
    console.log("Anthropic test response:", response.content[0].text);
    return "Anthropic connection successful";
  } catch (error) {
    console.error("Error testing Anthropic connection:", error);
    throw error;
  }
}

async function generateCode(prompt, files, body, relevantDocs) {
  try {
    if (!anthropic) {
      throw new Error("Anthropic client is not initialized");
    }

    const context = relevantDocs.map((doc) => doc.pageContent).join("\n\n");

    let imagesContent = "";
    let jsonContent = "";
    let textContent = body.text || "";

    if (files && files.images) {
      imagesContent = files.images
        .map((img) => `Image: ${img.originalname}`)
        .join("\n");
    }

    if (files && files.json && files.json[0]) {
      jsonContent = await fs.readFile(files.json[0].path, "utf8");
    }

    // const systemPrompt = `You are an AI assistant specialized in generating react-native-web code based on UI design specifications and component library documentation. Use the following context to inform your code generation: ${context}`;

    const systemPrompt = `
    ## Context
You are tasked with creating a webpage using a specific components library and a Figma design file. Your goal is to produce react-native-web code that precisely replicates the provided Figma design, strictly adhering to the provided documentation and JSON structure.

## Instructions
1. Carefully analyze the components library documentation.
2. Meticulously review the JSON structure of the Figma design file.
		- Imagine the frame as a 12 column layout. The frame is divided into 12 equal columns.
		- Discard all contents outside the frame.
		- Start from the top left, go in a diagonal axis (downwards and rightwards) and create an inventory of all the elements present in the frame.
		- Calculate the distance of the elements from each other and from the edges of the frame based on the columns and make note of the measurements along with each element.
		- After creating the inventory, use the measurements to position the elements properly using CSS as necessary.
		- Always use flex-box layout.
		- Treat each component as an independent element, regardless of its apparent relationship to other components. Do not assume any text is a label for another component unless explicitly stated.
		- Compare the image and the Figma api response to do the above mentioned steps
3. Create a detailed inventory of ALL elements in the Figma design, including:
		- Interactive components (buttons, toggles, etc.)
		- Static components (cards, dividers, etc.)
		- Text elements (headings, labels, paragraphs)
		- Icons and images
		- Spacing and layout elements
4. Create react-native-web code for the webpage based solely on the information provided in these two sources.
5. Ensure that every single element from your inventory is included in the implementation.
6. Do not include any elements, styles, or functionality that are not explicitly defined in either the documentation or the JSON structure.
7. Use only the components and styles described in the library documentation.
8. Follow the layout, hierarchy, and design specifications as outlined in the Figma JSON structure with utmost precision.
9. Ensure all items mentioned in the Figma JSON structure are added to the webpage exactly as per the styles, positioning, and arrangement specified in the JSON structure.
10. Verify that all class names, IDs, and custom attributes match those specified in the documentation and JSON structure.
11. If there are any conflicts between the documentation and the JSON structure, prioritize the JSON structure as it represents the most recent design decisions.
12. Replicate the Figma design with pixel-perfect accuracy, including the exact layout, positioning, and arrangement of elements.
13. Pay meticulous attention to the spacing between elements, ensuring it matches the Figma design precisely.
14. Focus only on implementing the elements and styles within the specified frame or artboard in the Figma design.
15. Carefully review and implement the correct orientation (horizontal/vertical) of layouts as specified in the Figma design.
16. Accurately reproduce any spacing or padding between elements as shown in the Figma design.
17. Implement the correct sizing (width/height) of elements as defined in the Figma JSON structure.
18. Ensure that the positioning of elements (top, left, right, bottom) matches the Figma design exactly.
19. Verify that the correct variant of each component (e.g., single vs. group) is used as per the Figma design.
20. Double-check that all text elements, including labels, headings, and any other textual content, are accurately reproduced in terms of content, font, size, weight, and color.
21. Pay special attention to the positioning of the components in the frame(s), padding and gaps around and in between the components in the frame(s)
22. Do not implement any extra variations of the components other than what's mentioned in the Figma design. Strictly stick to the Figma design.
23. Perform a design QA on all the elements present, check the count, position, colours, labels and values, paddings and margins etc

## Verification Checklist
Before submitting your code, verify the following:
- [ ] All elements from the inventory are included in the implementation
- [ ] Layout orientation (horizontal/vertical) matches the Figma design
- [ ] Spacing between elements is accurate
- [ ] Element sizes are correct
- [ ] Element positioning is precise
- [ ] Correct component variants are used
- [ ] All styles (colors, fonts, etc.) match the Figma design
- [ ] No elements or styles outside the main frame/artboard are included
- [ ] All interactive elements (buttons, toggles, etc.) are functional
- [ ] All text elements (headings, labels, paragraphs) are accurately reproduced
- [ ] Code uses only the provided component library and react-native-web

## Additional Notes
- Do not use any external libraries or resources beyond what is provided in the components library documentation.
- Do not recreate components. Import and use the existing library as mentioned in the documentation.
- Ensure the code is semantic, accessible, and follows best practices for react-native-web.
- If any part of the design or functionality is unclear based on the provided information, do not make assumptions. Instead, note these areas as needing clarification.
- Use exact measurements, positions, and spacing as defined in the Figma JSON structure.
- Before implementing the design, create a detailed inventory of all components and elements used in the Figma design. For each item, specify its exact variant, size, state, and any other relevant properties. Cross-check this inventory against the Figma JSON structure to ensure accuracy.
- Provide a clear breakdown of the layout structure, including how components are grouped and labeled.
- If you find any discrepancies between the component library documentation and the Figma design, explain them.
- Justify your choice of components, especially when multiple similar variants are available.
- After implementation, perform a final verification where you compare your code against the Figma design, component by component and element by element, to ensure accurate representation.

Using the attached components library documentation and the following Figma design JSON structure, create a webpage:

Please provide the complete react-native-web code for this webpage, strictly following the documentation and JSON structure. Ensure that your implementation passes all points in the verification checklist.

## Related context
${context}
    `;

    const userMessage = `
Prompt: ${prompt}

${imagesContent ? `Image Descriptions: ${imagesContent}` : ""}

${jsonContent ? `JSON Content: ${jsonContent}` : ""}

${textContent ? `Additional Text: ${textContent}` : ""}

Based on the above information, please generate the appropriate react-native-web code.`;

    console.log("Preparing to send request to Anthropic API...");
    // console.log("System prompt:", systemPrompt);
    // console.log("User message:", userMessage);

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        // { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    console.log("Received response from Anthropic API");
    return response.content[0].text;
  } catch (error) {
    console.error("Error in generateCode:", error);
    throw error;
  }
}

module.exports = { generateCode, testAnthropicConnection, initAnthropicClient };
