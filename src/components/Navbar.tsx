"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
        </div>

        <div className="flex items-center gap-2 md:gap-8">
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
      </nav>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-full sm:w-[320px] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-end p-6">
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <Icon icon="lucide:x" width="24" height="24" />
          </button>
        </div>
        
        <div className="px-6 flex flex-col flex-1 pb-6">
          {/* Produk Lain Section */}
          <div className="flex flex-col space-y-4">
            <span className="font-semibold text-slate-800">Produk lain</span>
            <a 
              href="https://nieldoc.vercel.app/" 
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col justify-center px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors group"
            >
              <span className="font-bold text-base font-poppins text-black transition-colors">
                <span>niel</span>
                <span className="text-[#fca311]">doc</span>
              </span>
              <span className="text-xs text-slate-500 mt-0.5">ubah dokumenmu</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
