// components/listings/listing-card-mini.tsx
export function ListingCardMini({ listing, locale }: { listing: any, locale: string }) {
  // Use props instead of useLocale()
  const imageUrl = listing.images?.[0]?.url || "/placeholder-property.jpg";

  return (
    <div className="w-48 bg-white rounded-lg overflow-hidden">
       <img src={imageUrl} className="w-full h-24 object-cover" />
       <div className="p-2">
          <p className="font-bold text-sm text-blue-600">${listing.price}</p>
          <p className="text-xs text-slate-600 truncate">{listing.title || 'Apartment'}</p>
          <a className="text-[10px] text-blue-500 underline">
            View Details
          </a>
       </div>
    </div>
  );
}