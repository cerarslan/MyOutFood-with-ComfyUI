import { NextApiRequest, NextApiResponse } from 'next';
import { model-provider } from "@model-provider/client";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    },
    responseLimit: '10mb'
  }
};

if (!process.env.NEXT_PUBLIC_MODEL_PROVIDER_API_KEY) {
  throw new Error('NEXT_PUBLIC_MODEL_PROVIDER_API_KEY');
}

// Initialize client with API key on server side
model-provider.config({
  credentials: process.env.NEXT_PUBLIC_MODEL_PROVIDER_API_KEY
});

type ImageSize = "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const requests = requestLog.get(ip) || [];
  
  // Remove requests outside the window
  const recentRequests = requests.filter(time => time > now - RATE_LIMIT_WINDOW);
  requestLog.set(ip, recentRequests);
  
  return recentRequests.length >= MAX_REQUESTS_PER_WINDOW;
}

function logRequest(ip: string) {
  const requests = requestLog.get(ip) || [];
  requests.push(Date.now());
  requestLog.set(ip, requests);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Method validation
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Method not allowed',
        message: 'Only POST requests are accepted'
      });
    }

    // Get client IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const clientIp = Array.isArray(ip) ? ip[0] : ip;

    // Rate limiting
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please wait a minute before trying again'
      });
    }

    const { prompt } = req.body;

    // Input validation
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Prompt is required'
      });
    }

    if (typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Prompt must be a string'
      });
    }

    if (prompt.length > 500) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Prompt is too long (max 500 characters)'
      });
    }

    // Log the request for rate limiting
    logRequest(clientIp);

    // Generate image
    const result = await model.provider.subscribe("model-provider", {
      input: {
        prompt,
        image_size: "landscape_4_3" as ImageSize,
        style: "realistic_image",
      },
      pollInterval: 1000,
      logs: true,
    });

    if (!result.data?.images?.[0]?.url) {
      throw new Error("No image generated");
    }

    // Success response
    return res.status(200).json({
      success: true,
      url: result.data.images[0].url
    });

  } catch (error: any) {
    // Log the error server-side
    console.error('Error generating image:', error);

    // Determine if it's a known error type
    if (error.name === 'AbortError') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Image generation took too long'
      });
    }

    if (error.response?.status === 402) {
      return res.status(402).json({
        error: 'Payment required',
        message: 'API quota exceeded'
      });
    }

    // Generic error response
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred'
    });
  }
}
