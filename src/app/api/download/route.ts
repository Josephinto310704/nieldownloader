import { NextResponse } from 'next/server';
import axios from 'axios';
import ytdl from '@distube/ytdl-core';

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
      // Fetch YouTube info using @distube/ytdl-core
      const info = await ytdl.getInfo(url);
      const videoDetails = info.videoDetails;
      const formats = info.formats || [];

      const media: any[] = [];
      
      // 1. Combined (video + audio)
      const combinedFormats = formats.filter((f: any) => f.hasVideo && f.hasAudio);
      
      // 2. Video only
      const videoOnlyFormats = formats.filter((f: any) => f.hasVideo && !f.hasAudio);
      
      const allVideoFormats = [...combinedFormats, ...videoOnlyFormats];

      if (allVideoFormats.length > 0) {
        const seenQualities = new Set();
        for (const f of allVideoFormats) {
          const qualityLabel = f.qualityLabel || (f.height ? `${f.height}p` : '');
          if (qualityLabel && !seenQualities.has(qualityLabel)) {
            seenQualities.add(qualityLabel);
            const hasAudio = f.hasAudio;
            const label = `${qualityLabel}${hasAudio ? '' : ' (Tanpa Suara)'}`;
            const sizeStr = formatBytes(parseInt(f.contentLength || f.filesize || 0));
            media.push({ type: 'video', quality: label, url: f.url, size: sizeStr });
          }
          if (media.length >= 8) break;
        }
      }

      // Audio only
      const audioFormats = formats.filter((f: any) => !f.hasVideo && f.hasAudio);
      if (audioFormats.length > 0) {
        const bestAudio = audioFormats.reduce((prev: any, current: any) => {
          return (prev.audioBitrate || 0) > (current.audioBitrate || 0) ? prev : current;
        });
        const sizeStr = formatBytes(parseInt(bestAudio.contentLength || bestAudio.filesize || 0));
        media.push({ type: 'audio', quality: `${bestAudio.audioBitrate || 128}kbps`, url: bestAudio.url, size: sizeStr });
      }

      const thumbnails = videoDetails.thumbnails || [];
      const bestThumbnail = thumbnails[thumbnails.length - 1]?.url || '';

      return NextResponse.json({
        success: true,
        platform: 'youtube',
        title: videoDetails.title || 'Video YouTube',
        thumbnail: bestThumbnail,
        media: media
      });
      
    } else {
      return NextResponse.json({ success: false, error: 'Platform tidak didukung. Harap masukkan tautan TikTok atau YouTube.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Download API Error:', error);
    const detail = error.message || String(error);
    return NextResponse.json({ success: false, error: `Gagal mengekstrak video: ${detail}` }, { status: 500 });
  }
}
