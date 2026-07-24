import { Icon } from "@iconify/react";

export default function Steps() {
  const steps = [
    {
      id: 1,
      title: "Salin Tautan",
      description: "Temukan video yang Anda sukai di TikTok atau YouTube dan salin URL-nya ke papan klip.",
      icon: (
        <Icon icon="lucide:copy" width="24" height="24" />
      )
    },
    {
      id: 2,
      title: "Tempel Tautan",
      description: "Kembali ke NielDownloader dan tempel tautan ke kolom input performa tinggi kami.",
      icon: (
        <Icon icon="lucide:clipboard-paste" width="24" height="24" />
      )
    },
    {
      id: 3,
      title: "Unduh",
      description: "Tekan unduh dan lihat sistem kami memproses permintaan Anda dalam waktu singkat.",
      icon: (
        <Icon icon="lucide:download" width="24" height="24" />
      )
    }
  ];

  return (
    <div id="cara-pakai" className="py-12 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Tiga Langkah Mudah</h2>
        </div>
        <div className="mx-auto mt-10 max-w-2xl sm:mt-14 lg:mt-16 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 text-indigo-600 transition-transform hover:scale-110 hover:shadow-md hover:ring-indigo-200">
                  {step.icon}
                </div>
                <dt className="text-xl font-semibold leading-7 text-slate-900">
                  {step.id}. {step.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">{step.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </div>
  );
}
