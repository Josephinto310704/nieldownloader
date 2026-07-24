import { Icon } from "@iconify/react";

export default function FeatureCards() {
  const features = [
    {
      title: "Ekstraksi Cepat",
      description: "Mesin multi-thread kami memastikan pengunduhan selesai dalam hitungan detik, bukan menit.",
      icon: (
        <Icon icon="lucide:zap" width="24" height="24" />
      ),
      highlight: true
    },
    {
      title: "Kualitas HD",
      description: "Ekstrak resolusi asli hingga 4K tanpa artefak kompresi.",
      icon: (
        <Icon icon="lucide:monitor-play" width="24" height="24" />
      ),
      highlight: false
    },
    {
      title: "Tanpa Watermark",
      description: "Dapatkan konten bersih yang siap untuk diedit ulang atau diarsipkan.",
      icon: (
        <Icon icon="lucide:image-off" width="24" height="24" />
      ),
      highlight: false
    }
  ];

  return (
    <div id="fitur" className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`flex flex-col rounded-3xl p-6 ring-1 ring-slate-200 transition-all duration-300 hover:shadow-xl ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white ring-indigo-500 shadow-lg shadow-indigo-200 relative overflow-hidden' 
                    : 'bg-slate-50 text-slate-900 hover:bg-white'
                }`}
              >
                {feature.highlight && (
                  <div className="absolute -right-10 -top-10 opacity-10">
                    <Icon icon="lucide:zap" width="160" height="160" />
                  </div>
                )}
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  feature.highlight ? 'bg-indigo-500/30 text-white' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  {feature.icon}
                </div>
                <h3 className={`text-lg font-bold leading-7 ${feature.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {feature.title}
                </h3>
                <p className={`mt-2 flex-auto text-sm leading-6 ${feature.highlight ? 'text-indigo-100' : 'text-slate-600'}`}>
                  {feature.description}
                </p>
                {feature.highlight && (
                  <div className="mt-6 pt-4 border-t border-indigo-500/30">
                    <div className="w-full bg-indigo-900/50 rounded-full h-1.5 mb-4">
                      <div className="bg-white h-1.5 rounded-full w-3/4"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
