import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ImageDropzone from './components/ImageDropzone';
import Spinner from './components/Spinner';
import { ImageSet, ImagePreviewSet, ImageType, GeneratedImageSet } from './types';
import { PHOTO_STYLES } from './constants';
import { generateCompositions } from './services/geminiService';

const Icons = {
    scenario: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" fillRule="evenodd" opacity="0" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
    ),
    model: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
    ),
    clothing: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" opacity="0"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v-.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v.75m-6 1.5V18a2.25 2.25 0 002.25 2.25h3.75a2.25 2.25 0 002.25-2.25V6m-1.5-1.5h-3.75a.75.75 0 00-.75.75v1.5m4.5-1.5V6" /></svg>
    ),
    accessory: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A3.375 3.375 0 006.375 8.25v2.25H17.625V8.25A3.375 3.375 0 0012 4.875z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v6.75" opacity="0" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75v6.75" opacity="0" /><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.75v6.75" opacity="0" /></svg>
    ),
};

const App: React.FC = () => {
  const [images, setImages] = useState<ImageSet>({ scenario: null, model: null, clothing: null, accessory: null });
  const [previews, setPreviews] = useState<ImagePreviewSet>({ scenario: null, model: null, clothing: null, accessory: null });
  const [style, setStyle] = useState<string>(PHOTO_STYLES[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageSet>({ artistic: null, expository: null });

  const allImagesUploaded = useMemo(() => Object.values(images).every(img => img !== null), [images]);

  useEffect(() => {
    // Cleanup object URLs to prevent memory leaks
    return () => {
      Object.values(previews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const handleDrop = useCallback((file: File, id: ImageType) => {
    setImages(prev => ({ ...prev, [id]: file }));
    setPreviews(prev => {
      if (prev[id]) {
        URL.revokeObjectURL(prev[id]!);
      }
      return { ...prev, [id]: URL.createObjectURL(file) };
    });
  }, []);

  const handleGenerate = async () => {
    if (!allImagesUploaded) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImages({ artistic: null, expository: null });

    try {
      const results = await generateCompositions(images, style);
      setGeneratedImages(results);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Ocurrió un error desconocido durante la generación de imágenes.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const dropzones: { id: ImageType; label: string; icon: JSX.Element; }[] = [
    { id: 'scenario', label: 'Escenario', icon: Icons.scenario },
    { id: 'model', label: 'Modelo', icon: Icons.model },
    { id: 'clothing', label: 'Ropa', icon: Icons.clothing },
    { id: 'accessory', label: 'Accesorio', icon: Icons.accessory },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
            Compositor de Moda IA
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Combina cuatro elementos visuales en una impresionante fotografía de moda generada por IA.
          </p>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {dropzones.map(({id, label, icon}) => (
              <ImageDropzone
                key={id}
                id={id}
                label={label}
                icon={icon}
                onDrop={handleDrop}
                imagePreview={previews[id]}
              />
            ))}
          </div>

          <div
            className={`transition-all duration-500 ease-in-out transform ${
              allImagesUploaded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden`}
          >
            <div className="bg-gray-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="w-full sm:w-auto flex-grow">
                <label htmlFor="style-select" className="block text-sm font-medium text-gray-300 mb-2">
                  Estilo Fotográfico
                </label>
                <select
                  id="style-select"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-3"
                >
                  {PHOTO_STYLES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={!allImagesUploaded || isLoading}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 rounded-lg font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center shadow-lg hover:shadow-indigo-500/50"
              >
                {isLoading ? <><Spinner /> Generando...</> : 'Componer Imágenes'}
              </button>
            </div>
          </div>
          
          {error && <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}

          {isLoading && (
             <div className="mt-12 text-center">
                <div className="animate-pulse">
                    <h2 className="text-2xl font-semibold text-gray-400 mb-4">Creando tu visión...</h2>
                    <p className="text-gray-500">La IA está analizando los estilos y componiendo tus imágenes. Esto puede tomar un momento.</p>
                </div>
             </div>
          )}

          {generatedImages.artistic && generatedImages.expository && (
            <div className="mt-12">
                <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    Composiciones Generadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 p-4 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-semibold mb-3 text-center text-gray-300">Composición Artística</h3>
                        <img src={generatedImages.artistic} alt="Composición Artística" className="w-full h-auto object-cover rounded-xl"/>
                    </div>
                     <div className="bg-gray-800 p-4 rounded-2xl shadow-xl">
                        <h3 className="text-xl font-semibold mb-3 text-center text-gray-300">Escaparate Expositivo</h3>
                        <img src={generatedImages.expository} alt="Escaparate Expositivo" className="w-full h-auto object-cover rounded-xl"/>
                    </div>
                </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;