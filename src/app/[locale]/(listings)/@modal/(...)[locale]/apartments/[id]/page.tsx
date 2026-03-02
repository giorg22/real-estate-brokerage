
import { ListingDetailModal2 } from "@/components/listings/listing-detail-modal2";

export default async function ApartmentModal({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  try {
    const url = `https://127.0.0.1:7075/Apartment/${id}`;
    
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error("Modal fetch failed with status:", res.status, res.statusText);
      return null;
    }

    const listing = await res.json();
    console.log("Fetched listing data:", listing); // Debug log

    return <ListingDetailModal2 listing={listing} isOpen={true} />;
    
  } catch (error) {
    console.error("Modal Server Error:", error);
    return null;
  }
}