import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ZoomableImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt, width, height }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const isBase64 = src.startsWith('data:');

  const ImageComponent = isBase64 ? (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="rounded-lg w-full h-auto"
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="rounded-lg w-full h-auto"
    />
  );

  const ZoomedImageComponent = isBase64 ? (
    <img
      src={src}
      alt={alt}
      width={width * 2}
      height={height * 2}
      className="rounded-lg max-w-full max-h-full"
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width * 2}
      height={height * 2}
      className="rounded-lg"
    />
  );

  return (
    <>
      <div className="relative cursor-pointer" onClick={toggleZoom}>
        {ImageComponent}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
          Click to zoom
        </div>
      </div>

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={toggleZoom}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="relative max-w-[90vw] max-h-[90vh]"
            >
              {ZoomedImageComponent}
              <button
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2"
                onClick={toggleZoom}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ZoomableImage;
