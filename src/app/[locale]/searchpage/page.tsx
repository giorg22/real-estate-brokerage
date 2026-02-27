"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Home, Ruler, DollarSign, ChevronDown } from "lucide-react";

// 1. Import your data
import locationEn from "@/data/location.en.json";
import locationKa from "@/data/location.ka.json";
import locationRu from "@/data/location.ru.json";

// 2. Import your LocationModal component 
// (Ensure the path matches where you saved the modal code)
import { LocationModal } from "@/components/forms/LocationModal";

const locationMaps: Record<string, any> = {
  en: locationEn,
  ka: locationKa,
  ru: locationRu,
};

export default function SearchPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const currentData = locationMaps[locale] || locationEn;

  // --- STATE FOR INTEGRATION ---
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<any>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar Section */}
      <section className="relative w-full h-[480px] flex items-center justify-center bg-slate-900 rounded-b-[40px]">
        <div className="w-full max-w-6xl px-4">
          <h1 className="text-white text-5xl font-bold text-center mb-10">Find the best for you</h1>

          <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row items-center p-2 gap-1 w-full">
            <SearchField icon={<Home size={20} />} label="Apartment" />
            
            <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />

            {/* CLICKING THIS OPENS THE MODAL */}
            <div className="flex-1 w-full cursor-pointer" onClick={() => setIsLocationOpen(true)}>
              <SearchField 
                icon={<MapPin size={20} />} 
                label={selectedLoc ? selectedLoc.t : "Location"} 
                isActive={!!selectedLoc}
              />
            </div>

            <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />
            
            <SearchField icon={<Ruler size={20} />} label="Area" />
            <SearchField icon={<DollarSign size={20} />} label="Price" />
            
            <button className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold ml-2 hover:bg-blue-700 transition-all">
              Find
            </button>
          </div>
        </div>
      </section>

      {/* --- THE MODAL INTEGRATION --- */}
      <LocationModal 
        isOpen={isLocationOpen} 
        data={currentData}
        selectedId={selectedLoc?.i} // Highlights the item if already selected
        onClose={() => setIsLocationOpen(false)} 
        onSelect={(loc: any) => setSelectedLoc(loc)} 
      />
    </div>
  );
}

// Simple Helper for the Search Bar UI
function SearchField({ icon, label, isActive }: any) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 flex-1 rounded-xl transition-all ${isActive ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
      <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>{icon}</span>
      <span className={`text-sm font-bold truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
        {label}
      </span>
      <ChevronDown size={14} className="ml-auto text-slate-300" />
    </div>
  );
}