import { Apartment } from "@/types/Apartment";
import { getApartmentTitle } from "@/utils/listing-helpers";
import Image from "next/image";

export default async function ApartmentFullPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 2. AWAIT the params
  const { id } = await params; 
  
  // 3. Add http:// and the port (7075 or 5075)
  // Ensure the port matches your C# backend
  const res = await fetch(
    `https://localhost:7075/Apartment/${id}`, 
    { cache: "no-store" }
  );

  if (!res.ok) return <div>Property not found</div>;
  const listing: Apartment = await res.json();

  return (
    <main className="container mx-auto py-10 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4">{getApartmentTitle(listing, 'en')}</h1>
      <div className="relative h-[500px] w-full mb-8">
        <Image 
          src={listing.images[0]?.url || "/placeholder-property.jpg"} 
          fill 
          className="object-cover rounded-xl" 
          alt="Property"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-gray-600">{listing.description.en || listing.description.ka}</p>
        </div>
        <div className="bg-muted p-6 rounded-xl h-fit">
          <p className="text-3xl font-bold mb-4">${listing.price.toLocaleString()}</p>
          <button className="w-full bg-primary text-white py-3 rounded-lg font-bold">
            Contact Owner
          </button>
        </div>
      </div>
    </main>
  );
}