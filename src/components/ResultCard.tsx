import { Icon } from "@iconify/react";

interface Media {
  type: string;
  quality: string;
  url: string;
  size?: string;
}

export interface ResultData {
  success: boolean;
  platform: string;
  title: string;
  thumbnail?: string;
  media: Media[];
}

export default function ResultCard({ data }: { data: ResultData }) {
  if (!data || !data.success) return null;

  return (
    <div className="mt-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden transform transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail Section */}
        {data.thumbnail && (
          <div className="relative w-full md:w-2/5 h-48 sm:h-64 md:h-auto bg-slate-900 group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.thumbnail} 
              alt={data.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
              {data.platform === 'youtube' ? (
                <Icon icon="lucide:youtube" className="text-red-500" />
              ) : (
                <Icon icon="ic:outline-tiktok" />
              )}
              {data.platform}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-4" title={data.title}>
              {data.title}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 sm:max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {data.media.map((item, idx) => {
                const isMuted = item.quality.includes('(Tanpa Suara)');
                const qualityText = item.quality.replace(' (Tanpa Suara)', '');
                
                // Gunakan proxy untuk memaksa download otomatis dan menetapkan nama file
                const proxyUrl = `/api/proxy?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(data.title)}&ext=${item.type === 'audio' ? 'mp3' : 'mp4'}`;

                return (
                  <a
                    key={idx}
                    href={proxyUrl}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-colors group gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`p-1.5 rounded-lg shrink-0 ${item.type === 'video' || item.type === 'image' ? 'bg-indigo-100 text-indigo-600' : 'bg-fuchsia-100 text-fuchsia-600'}`}>
                        {item.type === 'video' && <Icon icon="lucide:video" width="16" />}
                        {item.type === 'audio' && <Icon icon="lucide:music" width="16" />}
                        {item.type === 'image' && <Icon icon="lucide:image" width="16" />}
                      </div>
                      <div className="flex flex-col items-start text-left gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 whitespace-nowrap w-full">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 leading-none shrink-0">
                            {item.type === 'video' ? 'Video' : item.type === 'audio' ? 'Audio' : 'Gambar'}
                          </span>
                          <span className="text-slate-300 text-xs shrink-0">•</span>
                          <span className="text-xs font-bold text-slate-500 truncate">
                            {qualityText}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.size && (
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors shadow-sm">
                              {item.size}
                            </span>
                          )}
                          {isMuted && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                              <Icon icon="lucide:volume-x" width="12" /> Tanpa Suara
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Icon icon="lucide:download" width="18" className="text-slate-400 group-hover:text-indigo-600 flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
