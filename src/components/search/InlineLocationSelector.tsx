import React, { useState } from "react";
import { cn } from "@/lib/utils";
import locationDataEn from "@/data/location.en.json"; 

export const InlineLocationSelector = ({ onFinalSelect }: any) => {
  // We store the selection path as an array of objects: [City, District, Village]
  const [selectionPath, setSelectionPath] = useState<any[]>([]);

  // Calculate what options to show at each level
  const levels = [
    { label: "City / Region", data: locationDataEn }, // Level 0 (v0)
    { label: "District / Suburb", data: selectionPath[0]?.c }, // Level 1 (v1)
    { label: "Sub-district / Village", data: selectionPath[1]?.c } // Level 2 (v2)
  ];

  const handleSelect = (item: any, levelIndex: number) => {
    // 1. Update the path: keep everything before this level, add new item
    const newPath = selectionPath.slice(0, levelIndex);
    newPath[levelIndex] = item;
    setSelectionPath(newPath);

    // 2. If it's a leaf node (no children), trigger final callback
    if (!item.c || item.c.length === 0) {
      onFinalSelect?.(item);
    }
  };

  return (
    <div className="space-y-6 w-full py-4">
      {levels.map((level, idx) => {
        // Only show a level if the previous level has a selection OR it's the first level
        if (idx > 0 && !levels[idx].data) return null;

        return (
          <div key={idx} className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest ml-1">
              {level.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {level.data?.map((item: any) => {
                const isSelected = selectionPath[idx]?.i === item.i;
                return (
                  <button
                    key={item.i}
                    onClick={() => handleSelect(item, idx)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                    )}
                  >
                    {item.t}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};