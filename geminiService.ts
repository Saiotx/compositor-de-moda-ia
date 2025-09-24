import { GoogleGenAI } from "@google/genai";
import { ImageSet } from '../types';
if (!process.env.GEMINI_API_KEY) {
  throw new Error("La variable de entorno GEMINI_API_KEY no está configurada");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  const base64EncodedData = await base64EncodedDataPromise;
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

const describeImage = async (file: File): Promise<string> => {
    const imagePart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                imagePart,
                { text: "Describe esta imagen para un prompt de IA de texto a imagen detallado. Enfócate en el sujeto principal, los colores, el estilo y los elementos clave. Sé descriptivo y evocador." }
            ]
        },
    });
    return response.text;
};

const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '3:4',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  }
  throw new Error("La generación de la imagen falló.");
};


export const generateCompositions = async (images: ImageSet, style: string): Promise<{ artistic: string; expository: string }> => {
  if (!images.scenario || !images.model || !images.clothing || !images.accessory) {
    throw new Error("Se deben proporcionar las cuatro imágenes.");
  }
  
  const [scenarioDesc, modelDesc, clothingDesc, accessoryDesc] = await Promise.all([
    describeImage(images.scenario),
    describeImage(images.model),
    describeImage(images.clothing),
    describeImage(images.accessory),
  ]);

  const styleLabel = style.replace(/-/g, ' ');

  const artisticPrompt = `Crea un anuncio editorial de alta costura, visualmente impactante, con una estética de "${styleLabel}".
  - Escenario: ${scenarioDesc}.
  - Modelo: ${modelDesc}.
  - Ropa: La modelo lleva puesta ${clothingDesc}.
  - Accesorio: La modelo luce ${accessoryDesc}.
  - La composición general debe ser artística, coherente y de la más alta calidad fotográfica, adecuada para una campaña de marca de lujo. Los elementos deben integrarse a la perfección. Asegúrate de que la iluminación y el ambiente coincidan con el estilo solicitado.`;
  
  const expositoryPrompt = `Genera una composición limpia y de alta gama para un escaparate de productos de e-commerce sobre un fondo neutro y minimalista.
  - La imagen debe mostrar de forma clara y atractiva los siguientes artículos:
  - Ropa: ${clothingDesc}.
  - Accesorio: ${accessoryDesc}.
  - Los artículos deben presentarse como si los llevara un maniquí o modelo que refleje la esencia de: ${modelDesc}.
  - La sensación general debe estar inspirada en la atmósfera de: ${scenarioDesc}.
  - La composición debe estar bien iluminada, nítida y centrada en los productos, con una disposición ordenada y estéticamente agradable.`;

  const [artisticImage, expositoryImage] = await Promise.all([
    generateImageFromPrompt(artisticPrompt),
    generateImageFromPrompt(expositoryPrompt)
  ]);

  return { artistic: artisticImage, expository: expositoryImage };
};