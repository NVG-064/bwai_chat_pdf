import { gemini20Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit/beta'; // chat is a beta feature
import pdf from 'pdf-parse';
import fs from 'fs';
import { createInterface } from "node:readline/promises";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Genkit with Google AI
const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

// Main function to handle the chat with PDF
async function chatWithPDF(filename: string, customPrompt?: string) {
  try {
    console.log(`Loading PDF file: ${filename}`);
    const dataBuffer = fs.readFileSync(filename);
    const { text } = await pdf(dataBuffer);
    
    // TODO: Add custom prompt
    const defaultPrompt = "You are a helpful assistant that can answer question about the content of this PDF file. Please provide accurate and relevant information based on the document conntent.";
    const prompt = `
      ${customPrompt || defaultPrompt}
      
      Document Content:
      ${text}
    `;

    // Initialize chat
    const chat = ai.chat({ system: prompt });
    const readline = createInterface(process.stdin, process.stdout);
    
    console.log("\nChat with PDF initialized. You can now ask questions about the document.");
    console.log("Type 'exit' to quit.\n");

    // Handle chat loop
    while (true) {
      const userInput = await readline.question("> ");
      
      if (userInput.toLowerCase() === 'exit') {
        console.log("Goodbye!");
        break;
      }

      try {
        const { text: response } = await chat.send(userInput);
        console.log("\nAssistant:", response, "\n");
      } catch (error) {
        console.error("Error getting response:", error);
      }
    }

    readline.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Check if a filename was provided
const filename = process.argv[2];
if (!filename) {
  console.error("Please provide a PDF filename as a command line argument.");
  console.error("Usage: npx tsx src/index.ts <path-to-pdf> [custom-prompt]");
  process.exit(1);
}


// TODO: Read custom prompt

// TODO: Chat with PDF
chatWithPDF(filename);
