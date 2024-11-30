import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MapPin, Star } from "lucide-react";
import { PlaceSuggestion } from '@/lib/gemini-service-place';
import RestaurantMap from './RestaurantMap';
import { motion, AnimatePresence } from 'framer-motion';

interface RestaurantCarouselProps {
  restaurants: PlaceSuggestion[];
}

const RestaurantCarousel: React.FC<RestaurantCarouselProps> = ({ restaurants }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === restaurants.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? restaurants.length - 1 : prevIndex - 1
    );
  };

  // Parse coordinates from location string
  const getCoordinates = (locationStr: string) => {
    try {
      const coords = locationStr.match(/\d+\.\d+/g);
      if (coords && coords.length >= 2) {
        return {
          lat: parseFloat(coords[0]),
          lng: parseFloat(coords[1])
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing coordinates:', error);
      return null;
    }
  };

  // Format restaurants for map
  const mapRestaurants = restaurants.map(restaurant => ({
    name: restaurant.restaurantName,
    location: getCoordinates(restaurant.location) || {
      lat: 41.0082,  // Default to Istanbul coordinates
      lng: 28.9784
    }
  }));

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="space-y-6">
      <div className="relative h-[200px] md:h-[250px]">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="w-full h-full overflow-hidden relative">
          <AnimatePresence initial={false} custom={1}>
            <motion.div
              key={currentIndex}
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full h-full"
            >
              <Card className="h-full p-6 bg-card/80 backdrop-blur-sm border-muted">
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-xl">
                      {restaurants[currentIndex].restaurantName}
                    </h4>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm">
                        {restaurants[currentIndex].rating}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {restaurants[currentIndex].proximity}
                    </div>
                    <div>{restaurants[currentIndex].cuisineType}</div>
                  </div>
                  
                  <p className="text-sm mt-auto">
                    {restaurants[currentIndex].description}
                  </p>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {restaurants.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-primary/20'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-muted shadow-lg">
        <RestaurantMap restaurants={mapRestaurants} />
      </div>
    </div>
  );
};

export default RestaurantCarousel;
