
import { ListingGrid2 } from "@/components/listings/listing-grid2";
import { Apartment } from "@/types/Apartment";

async function getApartments() {
  // Use http instead of https for local dev if SSL is causing issues
  const res = await fetch("https://localhost:7075/Apartment/GetApartments", {
    cache: 'no-store', 
  });

  if (!res.ok) throw new Error("Failed to fetch apartments");
  return res.json();
}

export default async  function ApartmentsPage() {
  const apartments = await getApartments();
  console.log(apartments);
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Property Listings</h1>
        <p className="text-muted-foreground">Explore our available properties.</p>
      </header>
      <ListingGrid2 listings={apartments} />
    </div>
  );
}