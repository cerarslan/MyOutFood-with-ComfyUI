"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, ChevronLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getHistory, deleteHistoryEntry, FoodSuggestion } from '@/lib/historyService'
import { PlaceSuggestion } from '@/lib/gemini-service-place'
import ZoomableImage from '@/components/ZoomableImage'
import { useToast } from '@/hooks/use-toast'

interface HistoryEntry {
  suggestion: FoodSuggestion;
  imageCaption: string | null;
  placeSuggestion: PlaceSuggestion[];
  date: string;
}

const dropInAnimation = {
  hidden: { 
    y: -50,
    opacity: 0,
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      type: 'spring',
      damping: 15,
      stiffness: 500,
    },
  },
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const historyData = getHistory();
    setHistory(historyData);
  }, []);

  const handleDelete = (date: string) => {
    deleteHistoryEntry(date);
    setHistory(prev => prev.filter(entry => entry.date !== date));
    toast({
      title: "Silindi",
      description: "Geçmiş kaydı başarıyla silindi",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.h1
        variants={dropInAnimation}
        initial="hidden"
        animate="visible"
        className="text-3xl md:text-4xl font-bold text-center mb-8"
      >
        OutFood Geçmişi
      </motion.h1>
      <motion.div
        variants={dropInAnimation}
        initial="hidden"
        animate="visible"
        className="mb-4"
      >
        <Link href="/" passHref>
          <Button variant="outline" className="inline-flex items-center">
            <ChevronLeft className="mr-2 h-4 w-4" />
            OutFood'a Dön
          </Button>
        </Link>
      </motion.div>
      {history.length === 0 ? (
        <motion.div
          variants={dropInAnimation}
          initial="hidden"
          animate="visible"
          className="text-center mt-8"
        >
          <History className="mx-auto h-12 w-12 opacity-50 mb-4" />
          <p className="text-lg">Henüz geçmiş kaydı yok</p>
          <p className="text-sm text-muted-foreground mt-2">
            OutFood önerileriniz burada görünecek
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {history.map((entry, index) => (
            <motion.div
              key={entry.date}
              variants={dropInAnimation}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-muted">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">
                    {formatDate(entry.date)}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(entry.date)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {entry.suggestion.generatedImage && (
                      <div>
                        <ZoomableImage
                          src={getImageSrc(entry.suggestion.generatedImage)}
                          alt="Oluşturulan yemek"
                          width={400}
                          height={400}
                        />
                      </div>
                    )}
                    <div>
                      {entry.imageCaption && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">Açıklama</h3>
                          <p className="text-sm">{entry.imageCaption}</p>
                        </div>
                      )}
                      {entry.placeSuggestion && entry.placeSuggestion.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Önerilen Mekanlar</h3>
                          <div className="space-y-2">
                            {entry.placeSuggestion.map((place, placeIndex) => (
                              <div
                                key={placeIndex}
                                className="p-3 bg-secondary/50 backdrop-blur-sm rounded-lg"
                              >
                                <h4 className="font-medium">{place.restaurantName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {place.cuisineType} • {place.rating} • {place.proximity}
                                </p>
                                <p className="text-sm mt-1">{place.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
