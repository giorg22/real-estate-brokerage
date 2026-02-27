"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Check, ChevronRight, ListPlus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocationModal({ isOpen, data, selectedItems = [], onClose, onSelect }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [navStack, setNavStack] = useState<any[][]>([data]);
  const [pathNames, setPathNames] = useState<string[]>([]);
  const [tempSelected, setTempSelected] = useState<any[]>(selectedItems);
  const [expandedStreets, setExpandedStreets] = useState<Record<string, boolean>>({});

  const currentLevelData = navStack[navStack.length - 1];
  const isRoot = navStack.length === 1;

  // --- Logic: Selection ---
  const getAllDescendants = (item: any): any[] => {
    let results = [item];
    if (item.c) {
      item.c.forEach((child: any) => {
        results = [...results, ...getAllDescendants(child)];
      });
    }
    return results;
  };

  const handleToggleSelection = (item: any) => {
    const allRelated = getAllDescendants(item);
    const allRelatedIds = allRelated.map(i => i.i);
    const isAlreadySelected = tempSelected.some(s => s.i === item.i);

    setTempSelected((prev) => {
      if (isAlreadySelected) {
        return prev.filter(p => !allRelatedIds.includes(p.i));
      } else {
        const filteredPrev = prev.filter(p => !allRelatedIds.includes(p.i));
        return [...filteredPrev, ...allRelated];
      }
    });
  };

  const isItemSelected = (id: string | number) => tempSelected.some(s => s.i === id);

  const handleDrillDown = (item: any) => {
    if (item.c && item.c.length > 0) {
      setNavStack([...navStack, item.c]);
      setPathNames([...pathNames, item.t]);
      setSearchTerm("");
    }
  };

  const resetToLevel = (index: number) => {
    setNavStack(navStack.slice(0, index + 1));
    setPathNames(pathNames.slice(0, index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-[1440px] h-[90vh] rounded-[32px] flex flex-col overflow-hidden shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
              <h2 className="text-2xl font-black shrink-0">Location</h2>
              {pathNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 shrink-0">
                  {name}
                  <button onClick={() => resetToLevel(index)}><X size={12} /></button>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
          </div>

          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search districts or streets..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none text-lg"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/30">
          {isRoot ? (
            <div className="flex flex-wrap gap-4">
               {data.map((city: any) => (
                 <button 
                    key={city.i} 
                    onClick={() => handleDrillDown(city)} 
                    className="flex-1 min-w-[220px] p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all flex justify-between items-center group font-bold"
                 >
                   {city.t}
                   <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500" />
                 </button>
               ))}
            </div>
          ) : (
            /* Using grid for high-level columns, but flex-col inside for tight packing */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-start">
              {currentLevelData.map((district) => (
                <div 
                  key={district.i} 
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col"
                >
                  {/* District Header */}
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4 mb-4">
                    <div 
                      onClick={() => handleToggleSelection(district)} 
                      className={cn(
                        "w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all shrink-0", 
                        isItemSelected(district.i) ? "bg-blue-600 border-blue-600" : "border-slate-300"
                      )}
                    >
                      {isItemSelected(district.i) && <Check size={12} className="text-white" strokeWidth={4} />}
                    </div>
                    <span className="font-bold text-lg text-slate-900 leading-tight">{district.t}</span>
                  </div>

                  {/* Subdistrict List - Using tight Flexbox spacing */}
                  {district.c && (
                    <div className="flex flex-col space-y-3">
                      {district.c.map((sub: any) => (
                        <div key={sub.i} className="flex flex-col">
                          <div className="flex items-center justify-between py-1 group">
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                              <div 
                                onClick={() => handleToggleSelection(sub)} 
                                className={cn(
                                  "w-4 h-4 border rounded flex items-center justify-center cursor-pointer transition-all shrink-0", 
                                  isItemSelected(sub.i) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                                )}
                              >
                                {isItemSelected(sub.i) && <Check size={10} className="text-white" strokeWidth={4} />}
                              </div>
                              <span className={cn("text-sm font-bold transition-colors truncate", isItemSelected(sub.i) ? "text-blue-600" : "text-slate-700")}>
                                {sub.t}
                              </span>
                            </div>
                            
                            {sub.c && sub.c.length > 0 && (
                              <button 
                                onClick={() => setExpandedStreets(prev => ({ ...prev, [sub.i]: !prev[sub.i] }))}
                                className={cn(
                                    "p-1 rounded-md transition-all shrink-0",
                                    expandedStreets[sub.i] ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                )}
                              >
                                {expandedStreets[sub.i] ? <ChevronDown size={14} /> : <ListPlus size={14} />}
                              </button>
                            )}
                          </div>

                          {/* Street List (Level 4) */}
                          {expandedStreets[sub.i] && sub.c && (
                            <div className="ml-7 border-l-2 border-blue-100 pl-4 flex flex-col space-y-2 py-2 mt-1">
                              {sub.c.map((street: any) => (
                                <div 
                                  key={street.i} 
                                  className="flex items-center gap-3 cursor-pointer" 
                                  onClick={() => handleToggleSelection(street)}
                                >
                                  <div className={cn("w-3.5 h-3.5 border rounded flex items-center justify-center transition-all shrink-0", isItemSelected(street.i) ? "bg-blue-500 border-blue-500" : "border-slate-200")}>
                                    {isItemSelected(street.i) && <Check size={8} className="text-white" strokeWidth={5} />}
                                  </div>
                                  <span className={cn("text-[13px] transition-colors", isItemSelected(street.i) ? "text-blue-600 font-bold" : "text-slate-500")}>
                                    {street.t}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-white border-t flex items-center justify-between shrink-0">
           <p className="text-sm font-medium text-slate-500">
             Selected: <span className="text-blue-600 font-bold">{tempSelected.length}</span>
           </p>
           <div className="flex gap-6">
              <button onClick={() => setTempSelected([])} className="text-sm font-bold text-slate-400 hover:text-red-500">Clean up</button>
              <button 
                onClick={() => { onSelect(tempSelected); onClose(); }}
                className="bg-blue-600 text-white px-20 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95"
              >
                Apply
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}