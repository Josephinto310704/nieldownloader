import { NextResponse } from 'next/server';
import axios from 'axios';

// Cache sederhana untuk menghindari pemanggilan API berulang yang menyebabkan rate-limiting
const downloadCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

function getCachedResult(url: string) {
  const cached = downloadCache.get(url);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  return null;
}

function setCachedResult(url: string, data: any) {
  downloadCache.set(url, {
    data,
    expiry: Date.now() + CACHE_TTL_MS
  });
}

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    const normalizedUrl = url.trim();
    const cachedData = getCachedResult(normalizedUrl);
    if (cachedData) {
      console.log('Returning cached result for:', normalizedUrl);
      return NextResponse.json(cachedData);
    }

    const isTikTok = url.includes('tiktok.com') || url.includes('vt.tiktok.com');
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isInstagram = url.includes('instagram.com') || url.includes('instagr.am');

    if (isTikTok) {
      // Fetch from TikWM API
      const tikwmResponse = await axios.get(`https://tikwm.com/api/`, {
        params: { url, hd: 1 } // Request HD if possible
      });

      const data = tikwmResponse.data;

      if (data.code === 0 && data.data) {
        const item = data.data;
        
        // Cek jika ini adalah slideshow (postingan foto)
        const isImages = item.images && item.images.length > 0;
        
        const media = [];
        if (isImages) {
          // Slide postingan foto
          item.images.forEach((imgUrl: string, idx: number) => {
            media.push({ type: 'image', quality: `Slide ${idx + 1}`, url: imgUrl });
          });
        } else {
          // Video
          if (item.play) {
            media.push({ type: 'video', quality: 'Normal', url: item.play, size: formatBytes(item.size) });
          }
          if (item.hdplay) {
            media.push({ type: 'video', quality: 'HD', url: item.hdplay, size: formatBytes(item.hd_size || item.size) });
          }
        }
        
        // Add Audio
        if (item.music) {
          media.push({ type: 'audio', quality: 'MP3', url: item.music });
        }

        const result = {
          success: true,
          platform: 'tiktok',
          title: item.title || 'Video TikTok',
          thumbnail: item.cover,
          media: media
        };
        setCachedResult(normalizedUrl, result);
        return NextResponse.json(result);
      } else {
        return NextResponse.json({ success: false, error: 'Gagal mengekstrak video TikTok. Tautan mungkin salah atau video diprivate.' }, { status: 500 });
      }

    } else if (isYouTube) {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        return NextResponse.json({ success: false, error: 'ID Video YouTube tidak ditemukan dalam tautan.' }, { status: 400 });
      }

      const response = await axios.request({
        method: 'GET',
        url: 'https://youtube-media-downloader.p.rapidapi.com/v2/video/details',
        params: { videoId },
        headers: {
          'x-rapidapi-key': 'e67e20d88fmshbcee78df6ab9608p16b613jsn8e615f583f81',
          'x-rapidapi-host': 'youtube-media-downloader.p.rapidapi.com'
        }
      });

      const data = response.data;
      if (!data || (data.errorId && data.errorId !== 'Success')) {
        return NextResponse.json({ success: false, error: 'Gagal mendapatkan informasi video dari YouTube.' }, { status: 500 });
      }

      const title = data.title || 'Video YouTube';
      const thumbnails = data.thumbnails || [];
      const bestThumbnail = thumbnails[thumbnails.length - 1]?.url || '';

      const rawVideos = data.videos?.items || data.videos || [];
      const rawAudios = data.audios?.items || data.audios || [];

      // Urutkan: Format yang ADA SUARA (hasAudio: true) didahulukan ke paling atas
      rawVideos.sort((a: any, b: any) => {
        const aAudio = a.hasAudio ? 1 : 0;
        const bAudio = b.hasAudio ? 1 : 0;
        if (bAudio !== aAudio) return bAudio - aAudio;
        return (b.height || 0) - (a.height || 0);
      });

      const media: any[] = [];
      const seenQualities = new Set();

      for (const v of rawVideos) {
        const q = v.quality || (v.height ? `${v.height}p` : '');
        const labelKey = `${q}-${v.hasAudio ? 'audio' : 'noaudio'}`;
        if (q && !seenQualities.has(labelKey)) {
          seenQualities.add(labelKey);
          const label = `${q}${v.hasAudio ? '' : ' (Tanpa Suara)'}`;
          media.push({
            type: 'video',
            quality: label,
            url: v.url,
            size: v.sizeText || formatBytes(v.size || 0)
          });
        }
        if (media.length >= 8) break;
      }

      if (rawAudios.length > 0) {
        const bestAudio = rawAudios[0];
        media.push({
          type: 'audio',
          quality: `${bestAudio.audioBitrate || 'MP3'}`,
          url: bestAudio.url,
          size: bestAudio.sizeText || formatBytes(bestAudio.size || 0)
        });
      }

      const result = {
        success: true,
        platform: 'youtube',
        title: title,
        thumbnail: bestThumbnail,
        media: media
      };
      setCachedResult(normalizedUrl, result);
      return NextResponse.json(result);
      
    } else if (isInstagram) {
      const cleanUrl = url.split('?')[0];

      try {
        const response = await axios.get('https://instagram-post-reels-stories-downloader-api.p.rapidapi.com/instagram/', {
          params: { url: cleanUrl },
          headers: {
            'x-rapidapi-key': 'e67e20d88fmshbcee78df6ab9608p16b613jsn8e615f583f81',
            'x-rapidapi-host': 'instagram-post-reels-stories-downloader-api.p.rapidapi.com'
          },
          timeout: 10000
        });

        const data = response.data;
        if (data && data.status && Array.isArray(data.result) && data.result.length > 0) {
          const media: any[] = [];
          data.result.forEach((item: any, idx: number) => {
            const isVideo = item.type?.includes('video') || item.url?.includes('.mp4');
            const mediaType = isVideo ? 'video' : 'image';
            const label = data.result.length > 1
              ? `Slide ${idx + 1} (${isVideo ? 'Video' : 'Foto'})`
              : (isVideo ? 'Reel / Video HD' : 'Foto HD');

            media.push({
              type: mediaType,
              quality: label,
              url: item.url,
              size: item.size ? formatBytes(parseInt(item.size)) : ''
            });
          });

          const thumbnail = data.result[0]?.thumb || data.result[0]?.url || '';

          const result = {
            success: true,
            platform: 'instagram',
            title: 'Media Instagram',
            thumbnail,
            media
          };
          const hasVideo = media.some(m => m.type === 'video');
          const isReelUrl = normalizedUrl.includes('/reel/') || normalizedUrl.includes('/reels/') || normalizedUrl.includes('/tv/');
          if (hasVideo || !isReelUrl) {
            setCachedResult(normalizedUrl, result);
          }
          return NextResponse.json(result);
        }
      } catch (e: any) {
        console.error('RapidAPI Instagram extraction error:', e.message);
      }

      return NextResponse.json({
        success: false,
        error: 'Gagal mengekstrak media Instagram. Tautan mungkin diprivate atau tidak valid.'
      }, { status: 500 });

    } else {
      return NextResponse.json({ success: false, error: 'Platform tidak didukung. Harap masukkan tautan TikTok, YouTube, atau Instagram.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Download API Error:', error);
    const detail = error.response?.data?.message || error.message || String(error);
    return NextResponse.json({ success: false, error: `Gagal mengekstrak video: ${detail}` }, { status: 500 });
  }
}
