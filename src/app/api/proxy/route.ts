import { NextResponse } from 'next/server';

// Memastikan route ini bisa melakukan streaming file besar tanpa batas waktu default serverless
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  let title = searchParams.get('title') || 'NielDownloader';
  const ext = searchParams.get('ext') || 'mp4';

  if (!url) {
    return new Response('URL tidak ditemukan', { status: 400 });
  }

  try {
    // Menyamarkan karakter aneh pada judul agar aman untuk nama file
    title = title.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50).trim();
    const filename = `${title}.${ext}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.youtube.com/'
      }
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil media dari sumber: ${res.statusText}`);
    }

    const headers = new Headers(res.headers);
    // Memaksa browser untuk langsung mendownload file, bukan memutarnya
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
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
