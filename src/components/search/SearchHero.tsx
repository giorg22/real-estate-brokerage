import React, { useState, useMemo, forwardRef } from "react";
import { MapPin, ChevronRight, ArrowLeft, Check, Search, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import locationDataEn from "@/data/location.en.json"; // v0, v1, v2 structure

export const SearchHero = () => {
  const [locOpen, setLocOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Navigation Stack: [RootData, SelectedCity, SelectedDistrict]
  const [navStack, setNavStack] = useState<any[]>([locationDataEn]);
  const [selectionPath, setSelectionPath] = useState<any[]>([]);

  const currentLevelData = navStack[navStack.length - 1];
  const isRoot = navStack.length === 1;

  // Filter logic for current level
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentLevelData.slice(0, 50);
    
    // If searching at root, we search everything. 
    // If searching inside a city, we search only its children.
    return currentLevelData.filter((item: any) => 
      item.t.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [searchQuery, currentLevelData]);

  const handleSelect = (item: any) => {
    if (item.c && item.c.length > 0) {
      // If it has children, "Drill Down"
      setNavStack([...navStack, item.c]);
      setSelectionPath([...selectionPath, item]);
      setSearchQuery(""); // Clear search for next level
    } else {
      // Final selection
      console.log("Final Selection:", item);
      setLocOpen(false);
      // Reset stack for next time it opens
      setTimeout(() => {
        setNavStack([locationDataEn]);
        setSelectionPath([]);
      }, 300);
    }
  };

  const goBack = () => {
    setNavStack(navStack.slice(0, -1));
    setSelectionPath(selectionPath.slice(0, -1));
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-slate-900 rounded-b-[40px]">
      <div className="bg-white rounded-2xl shadow-2xl flex items-stretch p-2 w-full max-w-4xl">
        
        <Popover open={locOpen} onOpenChange={setLocOpen}>
          <PopoverTrigger asChild>
            <SearchSection 
              icon={<MapPin className="w-5 h-5" />} 
              label={selectionPath.length > 0 
                ? selectionPath.map(p => p.t).join(" > ") 
                : "Select Location"} 
              className="flex-1"
            />
          </PopoverTrigger>
          
          <PopoverContent className="w-[350px] p-0 shadow-2xl border-none overflow-hidden" align="start">
            {/* Header / Breadcrumbs */}
            <div className="bg-slate-50 border-b p-2">
              <div className="flex items-center gap-2 mb-2">
                {!isRoot && (
                  <button onClick={goBack} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    className="w-full pl-8 pr-4 py-1.5 text-sm bg-white border rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {selectionPath.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                  {selectionPath.map((p, i) => (
                    <React.Fragment key={p.i}>
                      <span className="text-[10px] font-bold text-indigo-600 whitespace-nowrap">{p.t}</span>
                      {i < selectionPath.length - 1 && <ChevronRight size={10} className="text-slate-300" />}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Level List */}
            <div className="max-h-[350px] overflow-y-auto">
              {filteredItems.map((item: any) => (
                <button
                  key={item.i}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">
                      {item.t}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                      {item.v === 0 ? "City" : item.v === 1 ? "District" : "Area/Village"}
                    </span>
                  </div>
                  {item.c && item.c.length > 0 ? (
                    <ChevronRight size={14} className="text-slate-300" />
                  ) : (
                    <Check size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

      </div>
    </div>
  );
};

// --- Reusable SearchSection with Ref ---
const SearchSection = forwardRef<HTMLDivElement, any>(({ icon, label, className, ...props }, ref) => (
    <div 
      ref={ref} 
      {...props} 
      className={cn("group flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors rounded-xl min-w-0", className)}
    >
      <div className="text-slate-400 group-hover:text-indigo-600 mr-3 transition-colors">{icon}</div>
      <div className="flex flex-col text-left overflow-hidden">
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight leading-none mb-1">Location</span>
        <span className="text-sm font-bold text-slate-800 truncate">{label}</span>
      </div>
      <ChevronsUpDown className="ml-auto w-4 h-4 text-slate-300 flex-shrink-0" />
    </div>
));