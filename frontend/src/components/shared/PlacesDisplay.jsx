import React from "react";
import ResultSection from "./ResultSection";

const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=400&q=80"
];

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80"
];

function getRandomImages(arr, count) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const PlaceCard = ({ place, imageUrl }) => (
  <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-xs min-w-[260px] mx-auto my-2 transition-transform hover:scale-105">
    <div className="h-36 w-full bg-gray-100 flex items-center justify-center">
      <img
        src={imageUrl}
        alt={place.categories?.[0] || place.name}
        className="object-cover h-full w-full"
        style={{ background: "#f3f4f6" }}
      />
    </div>
    <div className="flex flex-col flex-1 px-4 py-3">
      <div className="font-bold text-lg text-gray-800 mb-1 text-center">{place.name}</div>
      <div className="text-xs text-gray-500 text-center mb-1">{place.categories?.[0]}</div>
      <div className="text-sm text-gray-700 text-center mb-2 break-words">{place.address}</div>
      {place.rating && (
        <div className="text-xs text-yellow-600 font-semibold mb-1 text-center">Rating: {place.rating}★</div>
      )}
      {place.website && (
        <a
          href={place.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 underline mt-auto text-center"
        >
          Website
        </a>
      )}
    </div>
  </div>
);

const PlacesDisplay = ({ places, color = "amber" }) => {
  const hasRestaurants = places?.restaurants?.length > 0;
  const hasHotels = places?.hotels?.length > 0;

  const restaurantImages = React.useMemo(
    () => getRandomImages(RESTAURANT_IMAGES, Math.min(4, places?.restaurants?.length || 0)),
    [places?.restaurants?.length]
  );
  const hotelImages = React.useMemo(
    () => getRandomImages(HOTEL_IMAGES, Math.min(4, places?.hotels?.length || 0)),
    [places?.hotels?.length]
  );


  if (!hasRestaurants && !hasHotels) {
    return (
      <ResultSection
        title="Nearby Restaurants & Hotels"
        color={color}
        isEmpty={true}
        emptyMessage="No restaurants or hotels found."
      />
    );
  }

  return (
    <ResultSection title="Nearby Restaurants & Hotels" color={color}>
      <div className="flex flex-col gap-8">
        {hasRestaurants && (
          <div>
            <div className="font-semibold text-amber-700 mb-3 text-xl text-center">Restaurants</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {places.restaurants.map((r, i) => (
                <PlaceCard key={i} place={r} imageUrl={restaurantImages[i % restaurantImages.length]} />
              ))}
            </div>
          </div>
        )}
        {hasHotels && (
          <div>
            <div className="font-semibold text-amber-700 mb-3 text-xl text-center">Hotels</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {places.hotels.map((h, i) => (
                <PlaceCard key={i} place={h} imageUrl={hotelImages[i % hotelImages.length]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ResultSection>
  );
};

export default PlacesDisplay;
