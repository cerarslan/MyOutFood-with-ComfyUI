let isLoading = false;
let isLoaded = false;

export const loadGoogleMaps = (): Promise<void> => {
  // Return existing load if already loaded
  if (isLoaded) {
    return Promise.resolve();
  }

  // Return existing promise if already loading
  if (isLoading) {
    return new Promise((resolve, reject) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Google Maps yükleme zaman aşımı'));
      }, 10000);
    });
  }

  isLoading = true;

  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement('script');
      // Add map ID and use async loading pattern
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=beta&map_ids=8e0a97af9386fef&callback=initMap&loading=async`;
      script.async = true;

      // Define the callback function
      window.initMap = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };

      script.addEventListener('error', () => {
        isLoading = false;
        reject(new Error('Google Maps yüklenemedi'));
      });

      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!isLoaded) {
          isLoading = false;
          reject(new Error('Google Maps yükleme zaman aşımı'));
        }
      }, 10000);
    } catch (error) {
      isLoading = false;
      reject(error);
    }
  });
};

export const isGoogleMapsLoaded = () => isLoaded;

// Extended Map interface to include mapId
interface ExtendedMap extends google.maps.Map {
  mapId?: string;
}

// Declare global window interface
declare global {
  interface Window {
    initMap: () => void;
    google: {
      maps: {
        Map: {
          new (div: Element, options?: google.maps.MapOptions): ExtendedMap;
        };
        LatLngBounds: any;
        InfoWindow: any;
        LatLng: any;
        marker: {
          AdvancedMarkerElement: {
            new (options: {
              map: ExtendedMap;
              position: google.maps.LatLngLiteral;
              content: Element;
              title?: string;
            }): google.maps.marker.AdvancedMarkerElement;
          };
          PinElement: {
            new (options: {
              glyph: string;
              background: string;
              borderColor: string;
              glyphColor: string;
            }): {
              element: Element;
            };
          };
        };
      };
    };
  }
}
