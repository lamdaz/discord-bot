// Health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Discord Music Bot API',
    version: '1.0.0'
  });
}
