import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";

export function MapPicker({
  value,
  onChange,
  flyToCoords
}: {
  value: { lat: number; lng: number } | null | undefined;
  onChange: (coords: { lat: number; lng: number }) => void;
  flyToCoords?: { lat: number; lng: number }
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  const DEFAULT_VIEW = { lat: 41.7151, lng: 44.8271 };

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [value?.lng || DEFAULT_VIEW.lng, value?.lat || DEFAULT_VIEW.lat],
      zoom: value ? 14 : 11,
      trackResize: true
    });

    map.current.on('load', () => {
      map.current?.resize();
    });

    // Initialize Marker
    marker.current = new maplibregl.Marker({ draggable: true });

    // If we have an initial value, add it to the map immediately
    if (value && map.current) {
      marker.current.setLngLat([value.lng, value.lat]).addTo(map.current);
    }

    marker.current.on('dragend', () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        onChange({ lat: lngLat.lat, lng: lngLat.lng });
      }
    });

    map.current.on('click', (e) => {
      if (!map.current || !marker.current) return;

      marker.current.setLngLat(e.lngLat);
      marker.current.addTo(map.current);

      onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (map.current && marker.current && flyToCoords) {
      map.current.flyTo({
        center: [flyToCoords.lng, flyToCoords.lat],
        zoom: 15,
        essential: true
      });

      // Visual update only
      if (!marker.current.getElement().parentNode) {
        marker.current.addTo(map.current);
      }
      marker.current.setLngLat([flyToCoords.lng, flyToCoords.lat]);
    }
  }, [flyToCoords]);

  return (
    <div className="space-y-2">
      <div
        ref={mapContainer}
        className="h-[350px] w-full rounded-xl border shadow-inner bg-slate-100 overflow-hidden"
      />
      <div className="flex justify-between items-center px-1">
        <p className="text-[11px] text-muted-foreground italic flex gap-1 items-center">
          <MapPin className="h-3 w-3" />
          {value ? "Location set! Drag pin to refine." : "Click map to set exact location"}
        </p>
        {value && (
          <p className="text-[10px] font-mono text-muted-foreground">
            {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
          </p>
        )}
      </div>
    </div>
  );
}