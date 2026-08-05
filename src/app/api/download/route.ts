import { NextResponse } from 'next/server';
import axios from 'axios';

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

        return NextResponse.json({
          success: true,
          platform: 'tiktok',
          title: item.title || 'Video TikTok',
          thumbnail: item.cover,
          media: media
        });
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

      return NextResponse.json({
        success: true,
        platform: 'youtube',
        title: title,
        thumbnail: bestThumbnail,
        media: media
      });
      
    } else if (isInstagram) {
      const match = url.match(/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
      if (!match) {
        return NextResponse.json({ success: false, error: 'Tautan Instagram tidak valid atau media diprivate.' }, { status: 400 });
      }
      const shortcode = match[1];

      try {
        const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
        const res = await axios.get(embedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: 8000
        });

        const html = res.data;
        const media: any[] = [];

        const mp4Matches = [...html.matchAll(/video_url\\":\\"([^\\"]+)\\"/gi)].map(m => m[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/'));
        const imgMatches = [...html.matchAll(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/gi)].map(m => m[1].replace(/&amp;/g, '&'));

        if (mp4Matches.length > 0) {
          media.push({ type: 'video', quality: 'Reel / Video HD', url: mp4Matches[0] });
        } else if (imgMatches.length > 0) {
          imgMatches.forEach((imgUrl, idx) => {
            media.push({ type: 'image', quality: imgMatches.length > 1 ? `Foto Slide ${idx + 1}` : 'Foto HD', url: imgUrl });
          });
        }

        const captionMatch = html.match(/class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
        const title = captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 100) : 'Media Instagram';
        const thumbnail = imgMatches[0] || '';

        if (media.length > 0) {
          return NextResponse.json({
            success: true,
            platform: 'instagram',
            title,
            thumbnail,
            media
          });
        }
      } catch (e) {
        console.error('Embed extraction fallback:', e);
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
