"use client";

import React, { createContext, useContext, useState } from 'react';
import type { PlaceSuggestion } from './gemini-service-place';
import type { FoodSuggestion } from './image-generate-service';

type AppContextType = {
  uploadedImage: string | null;
  setUploadedImage: (image: string | null) => void;
  currentSuggestion: FoodSuggestion | null;
  setCurrentSuggestion: (suggestion: FoodSuggestion | null) => void;
  imageCaption: string | null;
  setImageCaption: (caption: string | null) => void;
  currentPlaceSuggestions: PlaceSuggestion[] | null;
  setCurrentPlaceSuggestions: (suggestions: PlaceSuggestion[] | null) => void;
};

const AppContext = createContext<AppContextType>({
  uploadedImage: null,
  setUploadedImage: () => {},
  currentSuggestion: null,
  setCurrentSuggestion: () => {},
  imageCaption: null,
  setImageCaption: () => {},
  currentPlaceSuggestions: null,
  setCurrentPlaceSuggestions: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<FoodSuggestion | null>(null);
  const [imageCaption, setImageCaption] = useState<string | null>(null);
  const [currentPlaceSuggestions, setCurrentPlaceSuggestions] = useState<PlaceSuggestion[] | null>(null);

  return (
    <AppContext.Provider
      value={{
        uploadedImage,
        setUploadedImage,
        currentSuggestion,
        setCurrentSuggestion,
        imageCaption,
        setImageCaption,
        currentPlaceSuggestions,
        setCurrentPlaceSuggestions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
