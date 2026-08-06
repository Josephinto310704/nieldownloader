import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, platform } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (platform === "tiktok") {
      return NextResponse.json({
        success: true,
        data: {
          platform: "tiktok",
          type: "video",
          title: "Simulasi Video TikTok",
          author: "@username_tiktok",
          thumbnail: "https://placehold.co/600x400/1e293b/ffffff?text=TikTok+Thumbnail",
          duration: "15s",
          downloads: [
            { format: "mp4", quality: "HD", watermark: false, url: "#" },
            { format: "mp4", quality: "SD", watermark: true, url: "#" },
            { format: "mp3", quality: "Audio", watermark: false, url: "#" }
          ]
        }
      });
    }

    if (platform === "youtube") {
      return NextResponse.json({
        success: true,
        data: {
          platform: "youtube",
          type: "video",
          title: "Simulasi Video YouTube",
          author: "Channel YouTube",
          thumbnail: "https://placehold.co/1280x720/ef4444/ffffff?text=YouTube+Thumbnail",
          duration: "10:05",
          downloads: [
            { format: "mp4", quality: "1080p", watermark: false, url: "#" },
            { format: "mp4", quality: "720p", watermark: false, url: "#" },
            { format: "mp3", quality: "Audio", watermark: false, url: "#" }
          ]
        }
      });
    }

    return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
