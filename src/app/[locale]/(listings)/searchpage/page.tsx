"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  MapPin, Ruler, DollarSign, ChevronDown,
  Loader2, Search, Home, Tag, LayoutGrid, Map as MapIcon
} from "lucide-react";

// Data & Config
import locationEn from "@/data/location.en.json";
import locationKa from "@/data/location.ka.json";
import locationRu from "@/data/location.ru.json";
import { PROPERTY_TYPES, DEAL_TYPES, ICON_MAP } from "@/constants/filterData";

// Components & Hooks
import { LocationModal } from "@/components/forms/LocationModal";
import { useSearchStore } from "@/store/useSearchStore";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import { cn } from "@/lib/utils";
import { ListingGrid2 } from "@/components/listings/listing-grid2";
import { ResultsMap } from "@/components/maps/ResultsMap"; // Ensure this is created
import { useTranslations } from 'next-intl';


const locationMaps: Record<string, any> = { en: locationEn, ka: locationKa, ru: locationRu };

export default function SearchPage() {
  const { locale } = useParams();
  const currentData = locationMaps[locale as string] || locationEn;
  const t = useTranslations('searchPage');

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const store = useSearchStore();

  const searchParams = {
    type: store.propertyType,
    deal: store.dealType,
    locations: store.locations.map((l) => l.i),
    minPrice: store.minPrice,
    maxPrice: store.maxPrice,
    minArea: store.minArea,
    maxArea: store.maxArea,
  };

  const { data: results, isFetching } = useSearchQuery(searchParams, hasSearched);
  const currentTypeObj = PROPERTY_TYPES.find(t => t.id === store.propertyType) || PROPERTY_TYPES[0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- HERO / SEARCH SECTION --- */}
      <section className="bg-slate-900 pt-12 pb-20 px-4 rounded-b-[40px] shadow-2xl relative z-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white text-3xl md:text-4xl font-bold text-center mb-8">Find Your Place</h1>

          {/* Compact Deal Type Switcher */}
          <div className="flex justify-center gap-2 mb-6">
            {DEAL_TYPES.map((dt) => (
              <button
                key={dt.id}
                onClick={() => { store.setField("dealType", dt.id); setHasSearched(false); }}
                className={cn(
                  "px-5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                  store.dealType === dt.id ? "bg-blue-600 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                )}
              >
                {React.createElement(ICON_MAP[dt.iconName] || Tag, { size: 14 })}
                {dt.name}
              </button>
            ))}
          </div>

          {/* COMPACT Search Bar */}
          <div className="bg-white p-1.5 rounded-2xl shadow-xl flex flex-col lg:row items-center gap-0.5 lg:flex-row">
            <div className="relative w-full lg:w-48">
              <div onClick={() => setIsTypeOpen(!isTypeOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center gap-2 transition-colors">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
                  {React.createElement(ICON_MAP[currentTypeObj.iconName] || Home, { size: 16 })}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[9px] uppercase font-bold text-slate-400 leading-tight">Type</span>
                  <span className="font-bold text-slate-800 truncate text-xs">{currentTypeObj.label}</span>
                </div>
                <ChevronDown size={12} className="ml-auto text-slate-300" />
              </div>
              {isTypeOpen && (
                <div className="absolute top-full mt-1 left-0 w-full bg-white border border-slate-100 shadow-lg rounded-xl py-1 z-50">
                  {PROPERTY_TYPES.map((t) => (
                    <div key={t.id} onClick={() => { store.setField("propertyType", t.id); setIsTypeOpen(false); }} className="px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-xs font-semibold text-slate-700">
                      {React.createElement(ICON_MAP[t.iconName], { size: 14 })} {t.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Divider />

            <div className="flex-1 w-full p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center gap-2 transition-colors" onClick={() => setIsLocationOpen(true)}>
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md"><MapPin size={16} /></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400 leading-tight">Location</span>
                <span className="font-bold text-slate-800 text-xs truncate">
                  {store.locations.length > 0 ? `${store.locations[0].t} (+${store.locations.length - 1})` : "Anywhere"}
                </span>
              </div>
            </div>

            <Divider />
            <RangeInput label="Area" icon={<Ruler size={16} />} minField="minArea" maxField="maxArea" unit="m²" />
            <Divider />
            <RangeInput label="Price" icon={<DollarSign size={16} />} minField="minPrice" maxField="maxPrice" unit="$" />

            <button
              onClick={() => { setHasSearched(true); setViewMode("grid"); }}
              disabled={isFetching}
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md ml-1"
            >
              {isFetching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
              <span className="text-sm">{t("find")}</span>
            </button>
          </div>
        </div>
      </section>

      {/* --- RESULTS SECTION --- */}
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Available Properties</h2>
              <p className="text-sm text-slate-500">{results?.length || 0} listings found</p>
            </div>

            {/* View Toggler */}
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
              >
                <LayoutGrid size={14} /> Grid
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                  viewMode === "map" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
              >
                <MapIcon size={14} /> Map
              </button>
            </div>
          </div>

          {isFetching && !results ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-medium">Loading properties...</p>
            </div>
          ) : (
            <div className="w-full">
              {viewMode === "grid" ? (
                <ListingGrid2 listings={results || []} />
              ) : (
                <div className="h-[75vh] w-full relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                  <ResultsMap listings={results || []}/>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <LocationModal
        isOpen={isLocationOpen} data={currentData} selectedItems={store.locations}
        onClose={() => setIsLocationOpen(false)} onSelect={(val: any) => store.setField("locations", val)}
      />
    </div>
  );
}

// --- SUB COMPONENTS ---

function Divider() { return <div className="hidden lg:block w-[1px] h-8 bg-slate-100 mx-0.5" />; }

function RangeInput({ label, icon, minField, maxField, unit }: any) {
  const store: any = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);
  const min = store[minField];
  const max = store[maxField];

  return (
    <div className="relative w-full lg:w-36">
      <div onClick={() => setIsOpen(!isOpen)} className="p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center gap-2 transition-colors">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[9px] uppercase font-bold text-slate-400 leading-tight">{label}</span>
          <span className="font-bold text-slate-800 truncate text-xs">
            {min || max ? `${min || 0}-${max || '∞'} ${unit}` : `Any`}
          </span>
        </div>
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-1 left-0 w-56 bg-white border p-4 shadow-xl rounded-xl z-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wider">Set {label}</span>
              <button onClick={() => { store.setField(minField, ""); store.setField(maxField, ""); }} className="text-[10px] text-red-500 font-bold hover:underline">Clear</button>
            </div>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder="Min" className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg outline-none ring-blue-500 focus:ring-2 text-xs transition-all" value={min} onChange={(e) => store.setField(minField, e.target.value)} />
              <span className="text-slate-300 text-xs">-</span>
              <input type="number" placeholder="Max" className="w-full bg-slate-50 border border-slate-100 p-2 rounded-lg outline-none ring-blue-500 focus:ring-2 text-xs transition-all" value={max} onChange={(e) => store.setField(maxField, e.target.value)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}