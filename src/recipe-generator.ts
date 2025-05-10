import { gemini20Flash, googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit/beta';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Genkit with Google AI
const ai = genkit({
  plugins: [googleAI()],
  model: gemini20Flash,
});

// Define the recipe structure
interface Recipe {
  title: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

// Create a type-safe schema object
const recipeSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          amount: { type: 'string' },
          unit: { type: 'string' }
        },
        required: ['name', 'amount', 'unit']
      }
    },
    instructions: {
      type: 'array',
      items: { type: 'string' }
    },
    prepTime: { type: 'string' },
    cookTime: { type: 'string' },
    servings: { type: 'number' },
    difficulty: { 
      type: 'string',
      enum: ['Easy', 'Medium', 'Hard']
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['title', 'description', 'ingredients', 'instructions', 'prepTime', 'cookTime', 'servings', 'difficulty', 'tags']
} as const;

// Function to generate a recipe based on ingredients
async function generateRecipe(ingredients: string[]): Promise<Recipe> {
  const prompt = `
    Generate a recipe using the following ingredients: ${ingredients.join(', ')}.
    The recipe should be structured and include:
    - A creative title
    - A brief description
    - List of ingredients with amounts and units
    - Step-by-step instructions
    - Preparation time
    - Cooking time
    - Number of servings
    - Difficulty level (Easy, Medium, or Hard)
    - Relevant tags (e.g., vegetarian, gluten-free, etc.)
    
    IMPORTANT: Return ONLY the raw JSON object matching this schema, without any markdown formatting or code blocks:
    ${JSON.stringify(recipeSchema, null, 2)}
  `;

  try {
    const { text } = await ai.generate(prompt);
    // Clean the response by removing any markdown formatting
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText) as Recipe;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
}

// Main function to handle recipe generation
async function main() {
  try {
    // Example ingredients
    const ingredients = [
      "chicken breast",
      "bell peppers",
      "onion",
      "garlic",
      "olive oil",
      "rice"
    ];

    console.log("Generating recipe with ingredients:", ingredients.join(", "));
    const recipe = await generateRecipe(ingredients);
    
    // Output the recipe in JSON format
    console.log(JSON.stringify(recipe, null, 2));
    
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Run the main function
main(); 