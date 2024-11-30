export async function generateImageCaption(file: File): Promise<string> {
  try {
    // Convert File to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Remove data URL prefix
    const base64Content = base64Data.split(',')[1];

    const response = await fetch('/api/gemini-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Content,
        mimeType: file.type
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from Gemini API');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error generating outfit-based food suggestion:', error);
    throw new Error('Failed to generate outfit-based food suggestion');
  }
}
