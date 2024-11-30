"use client";

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

interface LocationInputProps {
  onLocationChange: (location: string) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationChange }) => {
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useTheme();

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    onLocationChange(value);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            // Extract city and district from the response
            const city = data.address.city || data.address.town || data.address.state;
            const district = data.address.suburb || data.address.district || data.address.neighbourhood;
            const locationString = district ? `${district}, ${city}` : city;
            
            setLocation(locationString);
            onLocationChange(locationString);
          } catch (error) {
            console.error('Error getting location:', error);
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="input-wrapper relative">
        <MapPin 
          className={`lucide lucide-map-pin absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary`}
        />
        <motion.input
          type="text"
          value={location}
          onChange={handleLocationInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Konumunuzu girin..."
          className={`flex h-12 w-full rounded-lg border-2 px-3 pl-10 py-2 text-sm text-theme-primary placeholder:text-theme-muted
                     transition-all duration-200 backdrop-blur-sm
                     ${theme === 'dark' 
                       ? 'bg-white/5 hover:bg-white/10 border-white/20' 
                       : 'bg-black/5 hover:bg-black/10 border-black/30'}
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                     ${isFocused ? 'shadow-lg shadow-primary/10' : 'shadow-sm'}`}
        />
        <motion.button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className={`absolute right-2 px-4 py-1.5 rounded-md text-theme-secondary hover:text-theme-primary
                     transition-all duration-200 border-2 z-10
                     ${theme === 'dark'
                       ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                       : 'bg-black/10 hover:bg-black/15 text-black border-black/30'}
                     text-sm font-medium shadow-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:hover:bg-white/10 dark:disabled:hover:bg-white/10`}
          whileTap={{ scale: 0.97 }}
        >
          {isGettingLocation ? (
            <motion.div
              className={`h-4 w-4 border-2 border-t-transparent rounded-full
                         ${theme === 'dark' ? 'border-white' : 'border-black'}`}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ) : (
            "Konumumu Bul"
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default LocationInput;
