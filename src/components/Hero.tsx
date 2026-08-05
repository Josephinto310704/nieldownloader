"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import ResultCard, { ResultData } from "./ResultCard";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Gagal mengekstrak video');
      }
    } catch (err: any) {
      setError('Terjadi kesalahan jaringan atau server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate px-6 lg:px-8 min-h-[calc(100vh-3.5rem)] flex flex-col justify-center pb-24 sm:pb-0">
      <div className="mx-auto max-w-4xl py-4 sm:py-6 lg:py-8 w-full">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 to-indigo-500 pb-2 leading-tight font-poppins">
            Unduh Video TikTok, YouTube & Instagram Secara Instan
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 max-w-2xl mx-auto">
            Layanan terbaik untuk mengunduh video favorit anda dengan kualitas terbaik
          </p>
          
          <div className="mt-6 flex flex-col items-center justify-center gap-y-6 w-full">
            <form onSubmit={handleDownload} className="w-full max-w-2xl relative shadow-xl rounded-xl">
              <div className="relative flex items-center w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <Icon icon="lucide:link" width="20" height="20" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Tempel tautan TikTok, YouTube, atau Instagram di sini..."
                  className="block w-full rounded-xl border-0 py-3 sm:py-4 pl-10 sm:pl-12 pr-[90px] sm:pr-[180px] text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-sm sm:text-lg sm:leading-6 bg-white transition-all"
                  required
                />
                
                <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1 sm:gap-2">
                  {url ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUrl("");
                        setResult(null);
                        setError(null);
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white hover:bg-red-50 rounded-lg"
                      title="Hapus tautan"
                    >
                      <Icon icon="lucide:x" width="20" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setUrl(text);
                        } catch (err) {
                          console.error('Failed to read clipboard', err);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Paste dari clipboard"
                    >
                      <Icon icon="lucide:clipboard-paste" width="20" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-full rounded-lg bg-indigo-600 px-4 sm:px-6 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all flex items-center gap-1 sm:gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Icon icon="lucide:loader-2" className="animate-spin h-4 w-4 text-white" />
                        <span className="hidden sm:inline">Memproses</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Unduh</span>
                        <Icon icon="lucide:download" width="18" height="18" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 max-w-2xl w-full flex items-center justify-center gap-2">
                <Icon icon="lucide:alert-circle" />
                {error}
              </div>
            )}

            {result && (
              <ResultCard data={result} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
