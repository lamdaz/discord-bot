// Get Music Info API
import { video_info, stream } from 'play-dl';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = req.query?.url || req.body?.url;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    let info = null;

    try {
      // Try to get info using play-dl
      const videoInfo = await video_info(url);
      info = {
        id: videoInfo.video_details.id,
        title: videoInfo.video_details.title,
        description: videoInfo.video_details.description?.slice(0, 200) + '...',
        thumbnail: videoInfo.video_details.thumbnail?.url || `https://img.youtube.com/vi/${videoInfo.video_details.id}/0.jpg`,
        duration: videoInfo.video_details.durationRaw,
        channel: videoInfo.video_details.channel?.name,
        views: videoInfo.video_details.views?.toString(),
        likes: videoInfo.video_details.likes?.toString(),
        uploadedAt: videoInfo.video_details.uploadedAt
      };
    } catch (playDlError) {
      console.log('play-dl info failed, using fallback:', playDlError.message);
      
      // Extract video ID from URL
      const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      const videoId = match ? match[1] : 'unknown';
      
      info = {
        id: videoId,
        title: 'Video Info (Demo Mode)',
        description: 'Full video info requires proper setup',
        thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
        duration: 'Unknown',
        channel: 'Unknown',
        views: '0'
      };
    }

    return res.status(200).json({
      success: true,
      info
    });

  } catch (error) {
    console.error('Info error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
