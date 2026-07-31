import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-y-2.5 gap-x-6 md:order-2">
          <Link href="#" className="text-xs leading-5 text-slate-500 hover:text-indigo-600 transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="#" className="text-xs leading-5 text-slate-500 hover:text-indigo-600 transition-colors">
            Ketentuan Layanan
          </Link>
          <Link href="#" className="text-xs leading-5 text-slate-500 hover:text-indigo-600 transition-colors">
            Hubungi Dukungan
          </Link>
        </div>
        <div className="mt-6 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-6 text-slate-900 font-semibold mb-1">
            NielDownloader
          </p>
          <p className="text-center text-xs leading-5 text-indigo-600/80">
            &copy; {new Date().getFullYear()} NielDownloader. Ekstraksi media performa tinggi.
          </p>
        </div>
      </div>
    </footer>
  );
}
