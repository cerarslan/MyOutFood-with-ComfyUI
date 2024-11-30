"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Image as ImageIcon, X, Upload } from 'lucide-react';
import { useAppContext } from "@/lib/AppContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

const ImageUpload = () => {
  const { uploadedImage, setUploadedImage } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir resim dosyası yükleyin",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 10MB'dan küçük olmalıdır",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [setUploadedImage, toast]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: false,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => {
      setIsDragging(false);
      toast({
        title: "Hata",
        description: "Geçersiz dosya formatı veya boyutu",
        variant: "destructive",
      });
    },
  });

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      const canvas = document.createElement('canvas');
      
      video.addEventListener('loadeddata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
              onDrop([file]);
              
              // Stop the camera stream
              stream.getTracks().forEach(track => track.stop());
            }
          }, 'image/jpeg', 0.8);
        }
      });
    } catch (error) {
      console.error('Kamera erişimi hatası:', error);
      toast({
        title: "Hata",
        description: "Kameraya erişilemedi. Lütfen kamera izinlerini kontrol edin.",
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
  };

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-xl border-4 border-dashed transition-all duration-300 backdrop-blur-sm
        cursor-pointer group
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : theme === 'dark'
            ? 'border-white/40 hover:border-white/60 hover:bg-white/5'
            : 'border-black/40 hover:border-black/60 hover:bg-black/5'
        }
        ${theme === 'dark' ? 'shadow-lg shadow-black/5' : 'shadow-lg shadow-black/10'}
        hover:scale-[1.01] hover:shadow-xl
      `}
    >
      <input {...getInputProps()} />
      
      <AnimatePresence mode="wait">
        {uploadedImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-[3/2] w-full overflow-hidden rounded-lg flex items-center justify-center bg-black/5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={uploadedImage}
              alt="Uploaded"
              className="max-w-full max-h-full object-contain"
            />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white/90 backdrop-blur-sm
                       transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-6 p-8"
          >
            <Upload 
              className={`h-12 w-12 mb-2 transition-colors duration-300
                ${theme === 'dark' 
                  ? 'text-white/60 group-hover:text-white/80' 
                  : 'text-black/60 group-hover:text-black/80'}`}
            />
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCamera();
                  }}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 h-11"
                >
                  <Camera className="h-5 w-5" />
                  Kamera
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  variant="outline"
                  className={`inline-flex items-center gap-2 border-2 px-6 h-11
                    ${theme === 'dark'
                      ? 'border-white/30 hover:border-white/50 hover:bg-white/5'
                      : 'border-black/40 hover:border-black/60 hover:bg-black/5'}`}
                >
                  <ImageIcon className="h-5 w-5" />
                  Galeri
                </Button>
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-black/80'}`}>
              Resmi sürükleyip bırakın veya seçmek için tıklayın
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
              Desteklenen formatlar: JPEG, PNG, GIF, WebP (max 10MB)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
