"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
// Import the specific flags
import { US, GE } from 'country-flag-icons/react/3x2';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ChevronDown } from "lucide-react";

const LANGUAGES = [
  { 
    code: "en", 
    label: "English", 
    // Pass the component directly
    flag: <US title="English" className="h-3 w-4 rounded-[1px]" /> 
  },
  { 
    code: "ka", 
    label: "ქართული", 
    flag: <GE title="Georgian" className="h-3 w-4 rounded-[1px]" /> 
  },
];

export function LocaleSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const onLanguageChange = (nextLocale: string) => {
    if (nextLocale === locale) return;
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const newPath = segments.join("/");
    startTransition(() => {
      router.push(newPath);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isPending}
          className="flex items-center gap-2 px-3 h-9 rounded-full border-muted-foreground/20 hover:bg-muted"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            /* Render the SVG flag component */
            <div className="flex-shrink-0 shadow-sm border border-black/5">
              {currentLanguage.flag}
            </div>
          )}
          
          <span className="text-xs font-bold uppercase tracking-wider">
            {currentLanguage.code}
          </span>
          
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 text-muted-foreground ${isPending ? 'opacity-0' : 'opacity-100'}`} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[160px] p-1">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="flex items-center justify-between cursor-pointer rounded-md py-2 px-3 focus:bg-primary/5"
            onClick={() => onLanguageChange(lang.code)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-4 shadow-sm">
                {lang.flag}
              </div>
              <span className={`text-sm ${locale === lang.code ? "font-bold" : "font-medium"}`}>
                {lang.label}
              </span>
            </div>
            {locale === lang.code && <Check className="h-3 w-3 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}