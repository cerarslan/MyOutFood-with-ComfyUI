"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, AlertCircle } from 'lucide-react';
import ImageUpload from "@/components/ImageUpload";
import LocationInput from "@/components/LocationInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProgressSteps from "@/components/ProgressSteps";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAppContext } from "@/lib/AppContext";
import { generateFoodSuggestions } from "@/lib/image-generate-service";
import { getPlaceSuggestions } from "@/lib/gemini-service-place";
import ZoomableImage from "@/components/ZoomableImage";
import { saveToHistory } from "@/lib/historyService";
import RestaurantCarousel from "@/components/RestaurantCarousel";
import GoogleMapsWrapper from "@/components/GoogleMapsWrapper";
import { useTheme } from 'next-themes';
import confetti from 'canvas-confetti';
import SocialShare from "@/components/SocialShare";

type Step = {
  label: string;
  status: 'waiting' | 'current' | 'completed' | 'error';
};

const initialSteps: Step[] = [
  { label: 'Upload', status: 'waiting' },
  { label: 'Analyze', status: 'waiting' },
  { label: 'Generate', status: 'waiting' },
  { label: 'Find Places', status: 'waiting' }
];

const textDrippingAnimation = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.01,
      duration: 0.25,
      type: 'spring',
      damping: 10,
      stiffness: 100,
    },
  }),
};

const AnimatedText = ({ text }: { text: string }) => {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.p
          className={`text-center text-lg ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}
        >
          {text.split('').map((char, index) => (
            <motion.span
              key={index}
              variants={textDrippingAnimation}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              {char}
            </motion.span>
          ))}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

const dropInAnimation = {
  hidden: { 
    y: -50,
    opacity: 0,
    transform: 'scale(0.9)',
  },
  visible: { 
    y: 0,
    opacity: 1,
    transform: 'scale(1)',
    transition: {
      duration: 0.3,
      type: 'spring',
      damping: 15,
      stiffness: 500,
    },
  },
};

const Home = () => {
  const {
    uploadedImage,
    currentSuggestion,
    setCurrentSuggestion,
    imageCaption,
    setImageCaption,
    currentPlaceSuggestions,
    setCurrentPlaceSuggestions,
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const { toast } = useToast();
  const { theme } = useTheme();

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleGetOutFood = async () => {
    if (!uploadedImage) {
      setError("Lütfen önce bir resim yükleyin");
      toast({
        title: "Hata",
        description: "Lütfen önce bir resim yükleyin",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      setError("Lütfen konum bilgisi girin");
      toast({
        title: "Hata",
        description: "Lütfen konum bilgisi girin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentSuggestion(null);
    setImageCaption(null);
    setCurrentPlaceSuggestions(null);
    setSteps(initialSteps);

    try {
      // Convert base64 to File
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      // Generate food suggestions
      setLoadingState('Kıyafetiniz analiz ediliyor...');
      const result = await generateFoodSuggestions(file);
      
      if (!result || !result[0]) {
        throw new Error("Yemek önerileri oluşturulamadı");
      }

      setCurrentSuggestion(result[0]);
      triggerConfetti();
      
      if (result[0].suggestion) {
        // Get place suggestions based on the food suggestion
        setLoadingState('Yakındaki restoranlar bulunuyor...');
        const places = await getPlaceSuggestions(result[0].suggestion, location);
        setCurrentPlaceSuggestions(places);

        // Save to history
        saveToHistory({
          suggestion: result[0],
          imageCaption: result[0].suggestion,
          placeSuggestion: places,
          date: new Date().toISOString()
        });

        toast({
          title: "Başarılı",
          description: "Yemek ve mekan önerileri oluşturuldu!",
        });
      }
    } catch (error: any) {
      console.error('Hata:', error);
      setError(error.message || "İşlem sırasında bir hata oluştu");
      toast({
        title: "Hata",
        description: error.message || "İşlem sırasında bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingState('');
    }
  };

  const getImageSrc = (generatedImage: any): string => {
    if (Array.isArray(generatedImage) && generatedImage.length > 0) {
      return `data:image/png;base64,${generatedImage[0]}`;
    } else if (typeof generatedImage === 'string') {
      return generatedImage;
    } else if (typeof generatedImage === 'object' && generatedImage !== null) {
      if (generatedImage.image) {
        return `data:image/png;base64,${generatedImage.image}`;
      } else if (generatedImage.data) {
        return `data:image/png;base64,${generatedImage.data}`;
      } else if (generatedImage.base64) {
        return `data:image/png;base64,${generatedImage.base64}`;
      }
    }
    console.error('Geçersiz görüntü verisi:', generatedImage);
    return '';
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="container relative mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          variants={dropInAnimation}
          initial="hidden"
          animate="visible"
          className="relative z-10 mb-6 backdrop-blur-sm p-2 rounded-lg bg-white/80 dark:bg-black/80"
        >
          <h1 className={`text-4xl md:text-5xl font-bold text-center 
                     text-foreground
                     relative after:absolute after:inset-0 after:bg-gradient-to-b 
                     after:from-transparent after:to-background/50 after:-z-10
                     border-b-2 border-border`}
          >
            MyOutFood
          </h1>
        </motion.div>

        <motion.div
          variants={dropInAnimation}
          initial="hidden"
          animate="visible"
          className="relative z-10 mb-6"
        >
          <div className="flex justify-center">
            <Link href="/history">
              <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 backdrop-blur-sm px-8">
                <History className="h-5 w-5" />
                Eski OutFoodlar
              </Button>
            </Link>
          </div>
        </motion.div>

        <Card className="glass">
          <CardHeader className="space-y-2 pb-6 px-8">
            <CardTitle className="text-2xl md:text-3xl text-center font-bold bg-clip-text text-transparent 
                                bg-gradient-to-b from-foreground/90 to-foreground/70">
              Kıyafetinizi Yükleyin
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Kıyafetinizin fotoğrafını yükleyin ve size uygun yemek önerilerini keşfedin
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-6 relative">
              <div className="flex justify-center mb-8">
                <ProgressSteps steps={steps} />
              </div>
              <div>
                <LocationInput onLocationChange={setLocation} />
              </div>
              <ImageUpload />
            </div>
            
            <motion.div variants={dropInAnimation} initial="hidden" animate="visible">
              <Button 
                className="button-primary w-full h-14 text-base font-medium"
                onClick={handleGetOutFood}
                disabled={isLoading || !uploadedImage || !location}
              >
                {isLoading ? loadingState || "İşleniyor..." : "OutFood'unu Al!"}
              </Button>
            </motion.div>
            
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                variants={dropInAnimation}
                initial="hidden"
                animate="visible"
                className="py-4"
              >
                <LoadingSpinner />
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {loadingState}
                </p>
              </motion.div>
            )}

            {!isLoading && currentSuggestion && currentSuggestion.generatedImage && (
              <motion.div
                variants={dropInAnimation}
                initial="hidden"
                animate="visible"
                className="mt-10 space-y-8"
              >
                <div className="relative">
                  <h2 className="text-2xl font-bold mb-6 text-center bg-clip-text text-transparent 
                                bg-gradient-to-b from-foreground/90 to-foreground/70">
                    Yemek Eşleşmeniz
                  </h2>
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <ZoomableImage
                        src={getImageSrc(currentSuggestion.generatedImage)}
                        alt="Oluşturulan yemek önerisi"
                        width={400}
                        height={400}
                      />
                    </div>
                    {currentSuggestion.suggestion && (
                      <AnimatedText text={currentSuggestion.suggestion} />
                    )}
                    {currentPlaceSuggestions && currentPlaceSuggestions.length > 0 && (
                      <div className="mt-10">
                        <h3 className="text-xl font-bold mb-6 text-center bg-clip-text text-transparent 
                                     bg-gradient-to-b from-foreground/90 to-foreground/70">
                          Yakındaki Mekanlar
                        </h3>
                        <GoogleMapsWrapper>
                          <RestaurantCarousel restaurants={currentPlaceSuggestions} />
                        </GoogleMapsWrapper>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="flex justify-center items-center">
            <SocialShare />
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
