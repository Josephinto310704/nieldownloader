"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold tracking-tight text-indigo-700 font-poppins">
            nieldownloader
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          {/* Desktop Menu */}
          <div className="hidden md:flex md:gap-x-8">
            <Link href="#fitur" className="text-sm font-semibold leading-6 text-slate-700 hover:text-indigo-600 transition-colors">
              Fitur
            </Link>
            <Link href="#cara-pakai" className="text-sm font-semibold leading-6 text-slate-700 hover:text-indigo-600 transition-colors">
              Cara Pakai
            </Link>
          </div>

          {/* Hamburger Icon (Always Visible) */}
          <div className="flex">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <Icon icon={isMenuOpen ? "lucide:x" : "lucide:menu"} width="24" height="24" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute left-0 right-0 md:left-auto md:right-4 top-14 w-full md:w-80 z-50 animate-in slide-in-from-top-2 fade-in duration-200 md:mt-2">
          <div className="bg-white border-t md:border border-slate-200 shadow-xl rounded-b-2xl md:rounded-2xl flex flex-col space-y-1 p-3">
            
            {/* Mobile Only Primary Links */}
            <div className="md:hidden flex flex-col space-y-1 mb-2 pb-2 border-b border-slate-100">
              <Link 
                href="#fitur" 
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Fitur
              </Link>
              <Link 
                href="#cara-pakai" 
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-base font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                Cara Pakai
              </Link>
            </div>

            {/* Other Websites Section */}
            <div className="px-3 pt-2 pb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jaringan Kami</p>
            </div>
            
            <a 
              href="#" 
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
            >
              <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Icon icon="lucide:globe" width="18" />
              </div>
              <div className="flex flex-col">
                <span>Web Converter</span>
                <span className="text-xs font-normal text-slate-500 group-hover:text-indigo-400">Ubah format file apa saja</span>
              </div>
            </a>
            
            <a 
              href="#" 
              target="_blank"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
            >
              <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <Icon icon="lucide:layout-template" width="18" />
              </div>
              <div className="flex flex-col">
                <span>Portofolio Niel</span>
                <span className="text-xs font-normal text-slate-500 group-hover:text-indigo-400">Lihat karya terbaik kami</span>
              </div>
            </a>

          </div>
        </div>
      )}
    </nav>
  );
}
