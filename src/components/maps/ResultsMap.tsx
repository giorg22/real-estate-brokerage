"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter, useParams } from "next/navigation";
import { createRoot, Root } from "react-dom/client";
import { ListingCardMini } from "../listings/listing-card-mini";

interface ResultsMapProps {
  listings: any[];
}

export function ResultsMap({ listings }: ResultsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  
  // Track the active React root for the popup to clean it up correctly
  const activeRootRef = useRef<Root | null>(null);

  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [44.8271, 41.7151], 
      zoom: 11,
    });

    return () => {
      if (activeRootRef.current) activeRootRef.current.unmount();
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !listings) return;

    // Cleanup old markers
    markers.current.forEach(m => m.remove());
    markers.current = [];

    const hoverPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 15,
      maxWidth: 'none',
      // This class is important for the CSS fix below
      className: 'mini-card-hover-popup'
    });

    const bounds = new maplibregl.LngLatBounds();
    let hasCoords = false;

    listings.forEach((listing) => {
      const { latitude, longitude } = listing.address;
      
      if (latitude && longitude) {
        hasCoords = true;
        
        // 1. Create Price Tag
        const el = document.createElement('div');
        el.className = 'bg-blue-600 text-white px-2 py-1 rounded-md font-bold text-[10px] shadow-md border border-white hover:bg-slate-900 cursor-pointer transition-all hover:scale-110 active:scale-95 z-10';
        el.innerText = listing.priceFormatted;

        // 2. HOVER IN: Render Mini Card
        el.addEventListener('mouseenter', () => {
          const popupNode = document.createElement("div");
          
          // Cleanup any existing root before creating a new one
          if (activeRootRef.current) {
            activeRootRef.current.unmount();
          }

          const root = createRoot(popupNode);
          activeRootRef.current = root;
          
          root.render(<ListingCardMini listing={listing} locale={locale} />);

          hoverPopup
            .setLngLat([longitude, latitude])
            .setDOMContent(popupNode)
            .addTo(map.current!);
        });

        // 3. HOVER OUT: Remove Popup & Unmount React
        el.addEventListener('mouseleave', () => {
          hoverPopup.remove();
          if (activeRootRef.current) {
            activeRootRef.current.unmount();
            activeRootRef.current = null;
          }
        });

        // 4. CLICK: Navigate to Modal
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          router.push(`/${locale}/apartments/${listing.id}`, { scroll: false });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        markers.current.push(marker);
        bounds.extend([longitude, latitude]);
      }
    });

    if (hasCoords) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [listings, locale, router]);

  return <div ref={mapContainer} className="h-full w-full rounded-2xl border bg-slate-50" />;
}