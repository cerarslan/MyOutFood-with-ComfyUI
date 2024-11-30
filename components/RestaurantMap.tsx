import React, { useEffect, useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import GoogleMapsWrapper from './GoogleMapsWrapper';

interface Restaurant {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface RestaurantMapProps {
  restaurants: Restaurant[];
}

// Extended Map interface to include mapId
interface ExtendedMap extends google.maps.Map {
  mapId?: string;
}

const MAP_ID = '8e0a97af9386fef';

const RestaurantMap: React.FC<RestaurantMapProps> = ({ restaurants }) => {
  const [map, setMap] = useState<ExtendedMap | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [activeInfoWindow, setActiveInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  const mapContainerStyle = {
    height: "400px",
    width: "100%"
  };

  const defaultCenter = restaurants[0]?.location || {
    lat: 41.0082,  // Default to Istanbul coordinates
    lng: 28.9784
  };

  const mapOptions = {
    mapId: MAP_ID,
    center: defaultCenter,
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: true,
  };

  useEffect(() => {
    if (map && window.google?.maps?.marker) {
      // Clear existing markers and info windows
      markers.forEach(marker => marker.map = null);
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }

      // Create new markers
      const newMarkers = restaurants.map((restaurant, index) => {
        // Create pin element
        const pinElement = new google.maps.marker.PinElement({
          glyph: `${index + 1}`,
          background: '#ff4081',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
        });

        // Create info window content
        const infoContent = document.createElement('div');
        infoContent.innerHTML = `
          <div style="
            padding: 12px;
            background: white;
            border-radius: 8px;
            min-width: 150px;
          ">
            <h3 style="
              margin: 0 0 8px 0;
              color: black;
              font-size: 16px;
              font-weight: 600;
            ">${restaurant.name}</h3>
            <div style="
              font-size: 12px;
              color: #666;
            ">
              ${restaurant.location.lat.toFixed(6)}, ${restaurant.location.lng.toFixed(6)}
            </div>
          </div>
        `;

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: infoContent,
        });

        // Create advanced marker
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: restaurant.location,
          content: pinElement.element,
          title: restaurant.name,
        });

        // Add click listener using gmp-click event
        marker.addEventListener('gmp-click', () => {
          if (activeInfoWindow) {
            activeInfoWindow.close();
          }
          infoWindow.open(map, marker);
          setActiveInfoWindow(infoWindow);
        });

        return marker;
      });

      setMarkers(newMarkers);

      // Fit bounds if multiple restaurants
      if (restaurants.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        restaurants.forEach(restaurant => {
          bounds.extend(restaurant.location);
        });
        map.fitBounds(bounds);
      }
    }

    return () => {
      markers.forEach(marker => marker.map = null);
      if (activeInfoWindow) {
        activeInfoWindow.close();
      }
    };
  }, [map, restaurants]);

  return (
    <div className="w-full h-[400px] relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        options={mapOptions}
        onLoad={(map: ExtendedMap) => {
          setMap(map);
        }}
      />
    </div>
  );
};

export default RestaurantMap;
