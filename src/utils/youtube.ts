export interface YouTubeVideoInfo {
  title: string;
  videoId: string;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

export async function fetchYouTubeTitle(url: string): Promise<YouTubeVideoInfo | null> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  try {
    // Sử dụng oEmbed API của YouTube (không cần API key)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    const response = await fetch(oembedUrl);
    if (!response.ok) throw new Error('Không thể lấy thông tin video');
    
    const data = await response.json();
    
    return {
      title: data.title || 'Video YouTube',
      videoId
    };
  } catch (error) {
    console.error('Error fetching YouTube title:', error);
    
    // Fallback: Sử dụng cors proxy để lấy title từ meta tag
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const html = data.contents;
      
      // Extract title từ meta tag hoặc title tag
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                        html.match(/<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\'][^>]*>/i);
      
      if (titleMatch) {
        let title = titleMatch[1].trim();
        // Loại bỏ " - YouTube" ở cuối
        title = title.replace(/\s*-\s*YouTube\s*$/i, '');
        // Decode HTML entities
        title = title.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        return {
          title,
          videoId
        };
      }
    } catch (fallbackError) {
      console.error('Fallback method failed:', fallbackError);
    }
    
    // Last fallback: tạo title từ videoId
    return {
      title: `Video YouTube (${videoId})`,
      videoId
    };
  }
}
