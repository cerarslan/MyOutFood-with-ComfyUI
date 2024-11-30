import { generateImageCaption } from "./gemini-service-caption";

export interface FoodSuggestion {
  suggestion: string;
  generatedImage: string | null;
}

interface ApiResponse {
  success?: boolean;
  url?: string;
  error?: string;
  message?: string;
}

export async function checkComfyUIStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: 'test' }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error checking API status:", error);
    return false;
  }
}

export async function generateImage(prompt: string): Promise<string> {
  try {
    console.log("Starting image generation with prompt:", prompt);
    
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      switch (response.status) {
        case 429:
          throw new Error("Rate limit exceeded. Please wait a minute before trying again.");
        case 402:
          throw new Error("API quota exceeded. Please try again later.");
        case 408:
          throw new Error("Image generation timed out. Please try again.");
        default:
          throw new Error(result.message || 'Failed to generate image');
      }
    }

    if (!result.url) {
      throw new Error("No image URL in response");
    }

    console.log("Image URL generated:", result.url);
    return result.url;
  } catch (error) {
    console.error("Detailed error in generateImage:", error);
    throw error;
  }
}

export async function generateFoodSuggestions(file: File): Promise<FoodSuggestion[]> {
  try {
    console.log("Starting food suggestion generation");
    
    // Generate caption from the outfit image
    const caption = await generateImageCaption(file);
    console.log("Generated caption:", caption);

    // Generate food image based on the caption
    const imageUrl = await generateImage(caption);

    if (!imageUrl) {
      throw new Error("No suggestions generated");
    }

    console.log("Food suggestion generated successfully");
    return [{
      suggestion: caption,
      generatedImage: imageUrl
    }];
  } catch (error: any) {
    console.error("Error generating food suggestions:", error);
    
    // Enhance error message based on the type of error
    if (error.message.includes("Rate limit")) {
      throw new Error("You've made too many requests. Please wait a minute before trying again.");
    } else if (error.message.includes("quota")) {
      throw new Error("We've reached our daily limit. Please try again tomorrow.");
    } else if (error.message.includes("timeout")) {
      throw new Error("The request took too long. Please try again with a simpler outfit.");
    }
    
    throw error;
  }
}
