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
      
    } else {
      return NextResponse.json({ success: false, error: 'Platform tidak didukung. Harap masukkan tautan TikTok atau YouTube.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Download API Error:', error);
    const detail = error.response?.data?.message || error.message || String(error);
    return NextResponse.json({ success: false, error: `Gagal mengekstrak video: ${detail}` }, { status: 500 });
  }
}
