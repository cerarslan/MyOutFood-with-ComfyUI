import { NextApiRequest, NextApiResponse } from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { IncomingMessage, ServerResponse } from 'http';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const FAL_API_KEY = process.env.NEXT_PUBLIC_FAL_API_KEY;

const onProxyRes = (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
  console.log('Proxy response:', proxyRes.statusCode);
};

const onProxyReq = (proxyReq: any, req: IncomingMessage, res: ServerResponse) => {
  // Add the FAL API key to the request headers
  proxyReq.setHeader('Authorization', `Key ${FAL_API_KEY}`);
};

const options = {
  target: 'https://gateway.fal.ai',
  changeOrigin: true,
  pathRewrite: {
    '^/api/comfyui-proxy': '',
  },
  onProxyRes,
  onProxyReq,
  secure: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Proxy request received:', req.url);
  // @ts-ignore
  return createProxyMiddleware(options)(req, res);
}
