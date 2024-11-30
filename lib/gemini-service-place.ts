import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export interface PlaceSuggestion {
  restaurantName: string;
  cuisineType: string;
  location: string;
  proximity: string;
  rating: string;
  description: string;
}

export async function getPlaceSuggestions(foodDescription: string, location: string): Promise<PlaceSuggestion[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Based on this food description: "${foodDescription}", suggest 3 restaurants in or near ${location}. 
    For each restaurant, provide:
    Restaurant Name:
    Cuisine Type:
    Location: (provide exact coordinates in format: latitude, longitude - e.g., 41.0082, 28.9784)
    Proximity: (distance from ${location})
    Rating: (out of 5 stars)
    Brief Description: (max 2 sentences about ambiance and specialties)

    Format each restaurant suggestion exactly as shown above, separated by newlines. Ensure coordinates are real and accurate for the location specified.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const suggestions = parseSuggestions(text);
    return suggestions;
  } catch (error) {
    console.error('Error getting place suggestions:', error);
    throw new Error('Failed to get place suggestions');
  }
}

function parseSuggestions(text: string): PlaceSuggestion[] {
  const suggestions: PlaceSuggestion[] = [];
  const restaurantBlocks = text.split('\n\n');

  for (const block of restaurantBlocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n');
    const suggestion: Partial<PlaceSuggestion> = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      switch (key.trim()) {
        case 'Restaurant Name':
          suggestion.restaurantName = value;
          break;
        case 'Cuisine Type':
          suggestion.cuisineType = value;
          break;
        case 'Location':
          suggestion.location = value;
          break;
        case 'Proximity':
          suggestion.proximity = value;
          break;
        case 'Rating':
          suggestion.rating = value;
          break;
        case 'Brief Description':
          suggestion.description = value;
          break;
      }
    }

    if (suggestion.restaurantName) {
      suggestions.push(suggestion as PlaceSuggestion);
    }
  }

  return suggestions;
}
