const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function getImageCaption(base64Image: any): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı bulunamadı');
  }

  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-lastest:generateContent';
  
  // Base64 verisi kontrolü ve temizleme
  let cleanedBase64: string;
  if (typeof base64Image === 'string') {
    cleanedBase64 = base64Image;
  } else if (typeof base64Image === 'object' && base64Image !== null) {
    if (Array.isArray(base64Image) && base64Image.length > 0) {
      cleanedBase64 = base64Image[0];
    } else {
      cleanedBase64 = base64Image.generatedImage || base64Image.data || base64Image.image || '';
    }
  } else {
    console.error('Geçersiz görüntü verisi:', typeof base64Image, JSON.stringify(base64Image));
    throw new Error('Geçersiz görüntü verisi');
  }

  if (!cleanedBase64) {
    console.error('Boş görüntü verisi:', JSON.stringify(base64Image));
    throw new Error('Boş görüntü verisi');
  }

  // Base64 önekini kaldır
  if (cleanedBase64.includes('base64,')) {
    cleanedBase64 = cleanedBase64.split('base64,')[1];
  }

  // Base64 formatını kontrol et
  if (!/^[A-Za-z0-9+/=]+$/.test(cleanedBase64)) {
    console.error('Geçersiz base64 formatı:', cleanedBase64.substring(0, 100) + '...');
    throw new Error('Geçersiz base64 formatı');
  }

  const requestBody = {
    contents: [
      {
        parts: [
          { text: "You're a food critic and fashion guru. Analyze the outfit and the menu/meal photo in detail in the best way you can accordingly. You can add emoji without exaggerating. And please don't use '*'(star sign) in any title or content " },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: cleanedBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_ONLY_HIGH"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_ONLY_HIGH"
      }
    ]
  };

  try {
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API isteği başarısız oldu: ${response.status} ${response.statusText}. Hata: ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      // Güvenlik kontrolü
      if (candidate.finishReason === "SAFETY") {
        const safetyRatings = candidate.safetyRatings;
        const highProbabilityCategories = safetyRatings
          .filter((rating: any) => rating.probability === "HIGH")
          .map((rating: any) => rating.category);

        if (highProbabilityCategories.length > 0) {
          throw new Error(`Görüntü güvenlik nedeniyle reddedildi. Yüksek olasılıklı kategoriler: ${highProbabilityCategories.join(', ')}`);
        }
      }

      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const textParts = candidate.content.parts.filter((part: any) => part.text);
        if (textParts.length > 0) {
          return textParts.map((part: any) => part.text).join(' ');
        }
      }
    }

    // Daha detaylı hata mesajı
    console.error('Beklenmeyen API yanıt yapısı:', JSON.stringify(data, null, 2));
    throw new Error(`Beklenmeyen API yanıt yapısı: Metin içeriği bulunamadı. Yanıt: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Gemini API ile caption alınırken hata oluştu:', error);
    throw error;
  }
}

export async function getMenuSuggestions(base64Image: any, location: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API anahtarı bulunamadı');
  }

  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  
  // Base64 verisi kontrolü ve temizleme
  let cleanedBase64: string;
  if (typeof base64Image === 'string') {
    cleanedBase64 = base64Image;
  } else if (typeof base64Image === 'object' && base64Image !== null) {
    if (Array.isArray(base64Image) && base64Image.length > 0) {
      cleanedBase64 = base64Image[0];
    } else {
      cleanedBase64 = base64Image.generatedImage || base64Image.data || base64Image.image || '';
    }
  } else {
    console.error('Geçersiz görüntü verisi:', typeof base64Image, JSON.stringify(base64Image));
    throw new Error('Geçersiz görüntü verisi');
  }

  if (!cleanedBase64) {
    console.error('Boş görüntü verisi:', JSON.stringify(base64Image));
    throw new Error('Boş görüntü verisi');
  }

  // Base64 önekini kaldır
  if (cleanedBase64.includes('base64,')) {
    cleanedBase64 = cleanedBase64.split('base64,')[1];
  }

  // Base64 formatını kontrol et
  if (!/^[A-Za-z0-9+/=]+$/.test(cleanedBase64)) {
    console.error('Geçersiz base64 formatı:', cleanedBase64.substring(0, 100) + '...');
    throw new Error('Geçersiz base64 formatı');
  }

  const requestBody = {
    contents: [
      {
        parts: [
          { text: `You're a food critic and fashion guru. Describe the outfit in the image and suggest a menu or meal that would complement the outfit. Consider the location: ${location}. Provide detailed suggestions and explanations. You can add emoji without exaggerating. You don't have to say food described or something.` },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: cleanedBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  try {
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API isteği başarısız oldu: ${response.status} ${response.statusText}. Hata: ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      // Güvenlik kontrolü
      if (candidate.finishReason === "SAFETY") {
        const safetyRatings = candidate.safetyRatings;
        const highProbabilityCategories = safetyRatings
          .filter((rating: any) => rating.probability === "HIGH")
          .map((rating: any) => rating.category);

        if (highProbabilityCategories.length > 0) {
          throw new Error(`Görüntü güvenlik nedeniyle reddedildi. Yüksek olasılıklı kategoriler: ${highProbabilityCategories.join(', ')}`);
        }
      }

      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const textParts = candidate.content.parts.filter((part: any) => part.text);
        if (textParts.length > 0) {
          return textParts.map((part: any) => part.text).join(' ');
        }
      }
    }

    // Daha detaylı hata mesajı
    console.error('Beklenmeyen API yanıt yapısı:', JSON.stringify(data, null, 2));
    throw new Error(`Beklenmeyen API yanıt yapısı: Metin içeriği bulunamadı. Yanıt: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Gemini API ile menü önerileri alınırken hata oluştu:', error);
    throw error;
  }
}
