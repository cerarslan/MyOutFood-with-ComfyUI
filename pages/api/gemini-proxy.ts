import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const { base64Content, mimeType } = req.body;
    if (!base64Content || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check file size (10MB limit)
    const sizeInBytes = Buffer.from(base64Content, 'base64').length;
    if (sizeInBytes > 10 * 1024 * 1024) {
      return res.status(413).json({ 
        error: 'Dosya boyutu çok büyük. Lütfen 10MB\'dan küçük bir dosya yükleyin.' 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = "Analyze this outfit image and suggest what type of food or cuisine would match well with this style. Consider the formality, colors, and overall vibe of the outfit. Keep the suggestion concise but specific.";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Content
        }
      }
    ]);

    const response = await result.response;
    res.status(200).json({ text: response.text() });
  } catch (error: any) {
    console.error('Error in Gemini API:', error);
    const errorMessage = error.message || 'Failed to generate response';
    res.status(500).json({ 
      error: `İşlem sırasında bir hata oluştu: ${errorMessage}` 
    });
  }
}
