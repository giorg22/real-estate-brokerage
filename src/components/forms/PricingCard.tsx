"use client";

import React, { useState } from "react";
import { DollarSign, Calculator, ArrowRightLeft, Info, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

// Mock exchange rate
const GEL_RATE = 2.70;

const PricingCard = ({ form }: { form: any }) => {
  const [viewMode, setViewMode] = useState<"total" | "m2">("total");
  
  // Watch area and price from the main form
  const area = form.watch("area") || 0;
  const usdTotal = form.watch("price") || 0;

  // Computed values
  const gelTotal = (usdTotal * GEL_RATE).toFixed(0);
  const usdPerM2 = area > 0 ? (usdTotal / area).toFixed(2) : "0";
  const gelPerM2 = area > 0 ? ((usdTotal * GEL_RATE) / area).toFixed(2) : "0";

  // Dynamic Styles based on mode
  const isTotal = viewMode === "total";
  const themeClass = isTotal 
    ? "border-emerald-500 bg-emerald-50/50 shadow-sm" 
    : "border-blue-500 bg-blue-50/50 shadow-sm";
  
  const badgeClass = isTotal
    ? "bg-emerald-100 text-emerald-700"
    : "bg-blue-100 text-blue-700";

  return (
    <Card className={cn("overflow-hidden border-2 transition-all duration-300", isTotal ? "border-emerald-100" : "border-blue-100")}>
      <CardHeader className="bg-white border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex gap-2 text-lg items-center">
            <DollarSign className={cn("h-5 w-5", isTotal ? "text-emerald-600" : "text-blue-600")} /> 
            Pricing & Currency
          </CardTitle>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border">
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(v) => v && setViewMode(v as "total" | "m2")}
            >
              <ToggleGroupItem 
                value="total" 
                className="px-4 data-[state=on]:bg-emerald-600 data-[state=on]:text-white transition-colors"
              >
                Full Price
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="m2" 
                className="px-4 data-[state=on]:bg-blue-600 data-[state=on]:text-white transition-colors"
              >
                Price per m²
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {area <= 0 && viewMode === "m2" && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <Info className="h-4 w-4" />
            Please enter the <strong>Area</strong> above to calculate price per m².
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          {/* USD Section */}
          <div className={cn("space-y-3 p-5 rounded-xl border-2 transition-all duration-300", themeClass)}>
            <div className="flex justify-between items-center">
              <Label className="font-bold text-slate-700">USD Price ($)</Label>
              <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded", badgeClass)}>
                {isTotal ? "Total Amount" : "Unit Price"}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400">$</span>
              <Input
                type="number"
                disabled={viewMode === "m2" && area <= 0}
                className="pl-8 text-lg font-semibold bg-white border-slate-200 focus-visible:ring-offset-0"
                value={isTotal ? (usdTotal || "") : (usdPerM2 === "0.00" ? "" : usdPerM2)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  form.setValue("price", viewMode === "m2" ? val * area : val);
                }}
              />
            </div>
          </div>

          {/* GEL Section */}
          <div className={cn("space-y-3 p-5 rounded-xl border-2 transition-all duration-300", themeClass)}>
            <div className="flex justify-between items-center">
              <Label className="font-bold text-slate-700">GEL Price (₾)</Label>
              <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded", badgeClass)}>
                 {isTotal ? "Total Amount" : "Unit Price"}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400">₾</span>
              <Input
                type="number"
                disabled={viewMode === "m2" && area <= 0}
                className="pl-8 text-lg font-semibold bg-white border-slate-200 focus-visible:ring-offset-0"
                value={isTotal ? (gelTotal === "0" ? "" : gelTotal) : (gelPerM2 === "0.00" ? "" : gelPerM2)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const usdVal = val / GEL_RATE;
                  form.setValue("price", viewMode === "m2" ? usdVal * area : usdVal);
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className={cn("transition-colors py-3 text-white flex justify-between", isTotal ? "bg-emerald-900" : "bg-blue-900")}>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> 1$ = {GEL_RATE}₾</span>
          <span className="flex items-center gap-1"><Calculator className="h-3 w-3" /> Area: {area} m²</span>
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">
          {isTotal ? "Mode: Total" : "Mode: m² Calculation"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;