import { NextResponse } from 'next/server';
import axios from 'axios';
import youtubedl from 'youtube-dl-exec';

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
      // Execute youtube-dl
      const ytData: any = await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0'],
        extractorArgs: 'youtube:player_client=android,web'
      });

      const media: any[] = [];
      const formats = ytData.formats || [];
      
      // 1. Ambil format yang memiliki video DAN audio (Combined)
      const combinedFormats = formats.filter((f: any) => f.vcodec !== 'none' && f.acodec !== 'none' && (f.ext === 'mp4' || f.ext === '3gp'));
      
      // 2. Ambil format video-only untuk semua resolusi (akan dilabeli Tanpa Suara nanti jika yang combined tidak ada)
      const videoOnlyFormats = formats.filter((f: any) => f.vcodec !== 'none' && f.acodec === 'none' && f.ext === 'mp4');
      
      const allVideoFormats = [...combinedFormats, ...videoOnlyFormats];

      if (allVideoFormats.length > 0) {
        // Sort by height descending, then by whether it has audio
        allVideoFormats.sort((a: any, b: any) => {
          if (b.height !== a.height) return (b.height || 0) - (a.height || 0);
          const aHasAudio = a.acodec !== 'none' ? 1 : 0;
          const bHasAudio = b.acodec !== 'none' ? 1 : 0;
          return bHasAudio - aHasAudio; // Yang punya audio didahulukan
        });
        
        // Take unique heights >= 144p
        const seenHeights = new Set();
        for (const f of allVideoFormats) {
          if (!seenHeights.has(f.height) && f.height >= 144) {
            seenHeights.add(f.height);
            const hasAudio = f.acodec !== 'none';
            const qualityLabel = `${f.height}p${hasAudio ? '' : ' (Tanpa Suara)'}`;
            const sizeStr = formatBytes(f.filesize || f.filesize_approx || 0);
            media.push({ type: 'video', quality: qualityLabel, url: f.url, size: sizeStr });
          }
          if (media.length >= 8) break;
        }
      } else {
         // Fallback if no combined formats
         if (ytData.url) {
            media.push({ type: 'video', quality: 'Best', url: ytData.url });
         }
      }

      // Audio only
      const audioFormats = formats.filter((f: any) => f.vcodec === 'none' && f.acodec !== 'none');
      if (audioFormats.length > 0) {
        // Get best audio
        const bestAudio = audioFormats.reduce((prev: any, current: any) => {
           return (prev.abr || 0) > (current.abr || 0) ? prev : current;
        });
        const sizeStr = formatBytes(bestAudio.filesize || bestAudio.filesize_approx || 0);
        media.push({ type: 'audio', quality: `${Math.round(bestAudio.abr || 128)}kbps`, url: bestAudio.url, size: sizeStr });
      }

      return NextResponse.json({
        success: true,
        platform: 'youtube',
        title: ytData.title,
        thumbnail: ytData.thumbnail,
        media: media
      });
      
    } else {
      return NextResponse.json({ success: false, error: 'Platform tidak didukung. Harap masukkan tautan TikTok atau YouTube.' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Download API Error:', error);
    const detail = error.message || String(error);
    return NextResponse.json({ success: false, error: detail.includes('Sign in') ? 'YouTube memblokir permintaan ini. Harap coba lagi.' : `Terjadi kesalahan: ${detail}` }, { status: 500 });
  }
}
