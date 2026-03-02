"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, X, Check, ChevronRight, ListPlus, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocationModal({ isOpen, data, selectedItems = [], onClose, onSelect }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [navStack, setNavStack] = useState<any[][]>([data]);
  const [pathNames, setPathNames] = useState<string[]>([]);
  const [tempSelected, setTempSelected] = useState<any[]>(selectedItems);
  const [expandedStreets, setExpandedStreets] = useState<Record<string, boolean>>({});

  // Sync temp state with external state when modal opens
  useEffect(() => {
    if (isOpen) setTempSelected(selectedItems);
  }, [isOpen, selectedItems]);

  const currentLevelData = navStack[navStack.length - 1];
  const isRoot = navStack.length === 1;

  // --- Search Logic ---
  const filteredData = useMemo(() => {
    if (!searchTerm) return currentLevelData;
    const s = searchTerm.toLowerCase();
    
    // Recursive search through the current level
    const searchRecursive = (items: any[]): any[] => {
      return items.reduce((acc: any[], item: any) => {
        const matches = item.t.toLowerCase().includes(s);
        const childrenMatches = item.c ? searchRecursive(item.c) : [];
        
        if (matches || childrenMatches.length > 0) {
          acc.push({ ...item, c: childrenMatches.length > 0 ? childrenMatches : item.c });
        }
        return acc;
      }, []);
    };
    return searchRecursive(currentLevelData);
  }, [searchTerm, currentLevelData]);

  // --- Selection Logic ---
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
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-6xl h-[85vh] rounded-[40px] flex flex-col overflow-hidden shadow-2xl border border-white/20" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <h2 className="text-xl font-black text-slate-900 mr-4">Select Location</h2>
              {pathNames.map((name, index) => (
                <div key={index} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-100 shrink-0">
                  {name}
                  <button onClick={() => resetToLevel(index)} className="hover:text-blue-800"><X size={10} /></button>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} /></button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by city, district or street..."
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50/50">
          {isRoot ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {filteredData.map((city: any) => (
                 <button 
                    key={city.i} 
                    onClick={() => handleDrillDown(city)} 
                    className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex justify-between items-center group"
                 >
                   <span className="font-bold text-slate-700 text-sm">{city.t}</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                 </button>
               ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
              {filteredData.map((district: any) => (
                <div key={district.i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  {/* District Header */}
                  <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-50">
                    <div 
                      onClick={() => handleToggleSelection(district)} 
                      className={cn(
                        "w-4 h-4 border-2 rounded flex items-center justify-center cursor-pointer transition-all shrink-0", 
                        isItemSelected(district.i) ? "bg-blue-600 border-blue-600" : "border-slate-300"
                      )}
                    >
                      {isItemSelected(district.i) && <Check size={10} className="text-white" strokeWidth={4} />}
                    </div>
                    <span className="font-bold text-sm text-slate-900 leading-tight">{district.t}</span>
                  </div>

                  {/* Subdistrict List */}
                  {district.c && (
                    <div className="flex flex-col space-y-2">
                      {district.c.map((sub: any) => (
                        <div key={sub.i} className="flex flex-col">
                          <div className="flex items-center justify-between py-0.5 group">
                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                              <div 
                                onClick={() => handleToggleSelection(sub)} 
                                className={cn(
                                  "w-3.5 h-3.5 border rounded flex items-center justify-center cursor-pointer transition-all shrink-0", 
                                  isItemSelected(sub.i) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                                )}
                              >
                                {isItemSelected(sub.i) && <Check size={8} className="text-white" strokeWidth={4} />}
                              </div>
                              <span className={cn("text-xs font-semibold truncate transition-colors", isItemSelected(sub.i) ? "text-blue-600" : "text-slate-600")}>
                                {sub.t}
                              </span>
                            </div>
                            
                            {sub.c && sub.c.length > 0 && (
                              <button 
                                onClick={() => setExpandedStreets(prev => ({ ...prev, [sub.i]: !prev[sub.i] }))}
                                className={cn(
                                  "p-1 rounded transition-all shrink-0",
                                  expandedStreets[sub.i] ? "bg-blue-50 text-blue-600" : "text-slate-300 hover:text-blue-500"
                                )}
                              >
                                {expandedStreets[sub.i] ? <ChevronDown size={12} /> : <ListPlus size={12} />}
                              </button>
                            )}
                          </div>

                          {/* Level 4 Streets */}
                          {expandedStreets[sub.i] && sub.c && (
                            <div className="ml-5 border-l border-blue-100 pl-3 flex flex-col space-y-1.5 py-1.5 mt-0.5">
                              {sub.c.map((street: any) => (
                                <div key={street.i} className="flex items-center gap-2 cursor-pointer group/st" onClick={() => handleToggleSelection(street)}>
                                  <div className={cn("w-3 h-3 border rounded-sm flex items-center justify-center transition-all", isItemSelected(street.i) ? "bg-blue-500 border-blue-500" : "border-slate-200")}>
                                    {isItemSelected(street.i) && <Check size={7} className="text-white" strokeWidth={5} />}
                                  </div>
                                  <span className={cn("text-[11px] font-medium transition-colors", isItemSelected(street.i) ? "text-blue-600" : "text-slate-400 group-hover/st:text-slate-600")}>
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
        <div className="px-10 py-5 bg-white border-t flex items-center justify-between shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Selection</span>
              <span className="text-lg font-black text-blue-600">{tempSelected.length} <span className="text-slate-300 text-sm font-bold">Items</span></span>
           </div>
           <div className="flex gap-4 items-center">
              <button 
                onClick={() => setTempSelected([])} 
                className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} /> Clear All
              </button>
              <button 
                onClick={() => { onSelect(tempSelected); onClose(); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Apply Selection
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}