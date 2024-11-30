import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { loadGoogleMaps, isGoogleMapsLoaded } from '@/lib/maps-service';

interface GoogleMapsWrapperProps {
  children: React.ReactNode;
}

const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      loadGoogleMaps()
        .then(() => {
          console.log('Google Maps loaded successfully');
          setIsLoaded(true);
          setError(null);
        })
        .catch((err) => {
          console.error('Failed to load Google Maps:', err);
          setError(err.message || 'Google Maps yüklenemedi');
          setIsLoaded(false);
        });
    }
  }, [isLoaded]);

  if (error) {
    return (
      <div className="h-[400px] w-full flex flex-col items-center justify-center bg-secondary/50 backdrop-blur-sm rounded-lg border border-muted p-6">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Harita Yüklenemedi</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error}
          </p>
          <Button
            variant="outline"
            className="mb-4"
            onClick={() => {
              setError(null);
              setIsLoaded(false);
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
          <p className="text-xs text-muted-foreground">
            Sorun devam ederse, lütfen internet bağlantınızı kontrol edin.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-secondary/50 backdrop-blur-sm rounded-lg border border-muted">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm text-muted-foreground">Harita yükleniyor...</p>
          <p className="text-xs text-muted-foreground mt-1">Bu işlem birkaç saniye sürebilir</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default GoogleMapsWrapper;
