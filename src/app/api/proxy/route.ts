import { NextResponse } from 'next/server';

// Memastikan route ini bisa melakukan streaming file besar tanpa batas waktu default serverless
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  let title = searchParams.get('title') || 'NielDownloader';
  const ext = searchParams.get('ext') || 'mp4';
  const isInline = searchParams.get('inline') === 'true';

  if (!url) {
    return new Response('URL tidak ditemukan', { status: 400 });
  }

  try {
    // Menyamarkan karakter aneh pada judul agar aman untuk nama file
    title = title.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50).trim();
    const filename = `${title}.${ext}`;

    const targetUrlObj = new URL(url);
    const headersInit: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    if (targetUrlObj.hostname.includes('youtube.com') || targetUrlObj.hostname.includes('googlevideo.com') || targetUrlObj.hostname.includes('ytimg.com')) {
      headersInit['Referer'] = 'https://www.youtube.com/';
    } else if (targetUrlObj.hostname.includes('instagram.com') || targetUrlObj.hostname.includes('cdninstagram.com')) {
      headersInit['Referer'] = 'https://www.instagram.com/';
    } else {
      headersInit['Referer'] = targetUrlObj.origin;
    }

    const res = await fetch(url, {
      headers: headersInit
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil media dari sumber: ${res.statusText}`);
    }

    const headers = new Headers(res.headers);
    if (isInline) {
      headers.set('Content-Disposition', 'inline');
    } else {
      // Memaksa browser untuk langsung mendownload file, bukan memutarnya
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    }
    
    // Hapus header yang bisa bikin konflik proxy
    headers.delete('content-encoding');

    return new Response(res.body, {
      status: res.status,
      headers
    });
  } catch (error) {
    console.error('Proxy Stream Error:', error);
    return new Response('Gagal mendownload file', { status: 500 });
  }
}
