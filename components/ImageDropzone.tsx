import React, { useState, useCallback } from 'react';
import { ImageType } from '../types';

interface ImageDropzoneProps {
  id: ImageType;
  label: string;
  icon: JSX.Element;
  onDrop: (file: File, id: ImageType) => void;
  imagePreview: string | null;
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ id, label, icon, onDrop, imagePreview }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onDrop(file, id);
      }
      e.dataTransfer.clearData();
    }
  }, [id, onDrop]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
            onDrop(file, id);
        }
      }
  }, [id, onDrop]);

  const baseClasses = "relative aspect-square w-full rounded-2xl border-2 border-dashed flex flex-col justify-center items-center text-center p-6 cursor-pointer transition-all duration-300 ease-in-out";
  const idleClasses = "border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-400";
  const draggingClasses = "border-indigo-500 bg-indigo-500 bg-opacity-10 scale-105 shadow-lg shadow-indigo-500/10";
  
  return (
    <div
        onClick={() => document.getElementById(`file-input-${id}`)?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${baseClasses} ${isDraggingOver ? draggingClasses : idleClasses}`}
    >
      <input type="file" id={`file-input-${id}`} className="hidden" accept="image/*" onChange={handleFileChange} />
      {imagePreview ? (
        <>
            <img src={imagePreview} alt={`Vista previa de ${label}`} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-xl font-bold text-white">{label}</h3>
                <p className="text-sm text-gray-300">Haz clic o arrastra para reemplazar</p>
            </div>
        </>
      ) : (
        <>
          <div className="mb-2">{icon}</div>
          <h3 className="text-xl font-bold text-gray-300">{label}</h3>
          <p className="text-sm">Arrastra y suelta o haz clic para subir</p>
        </>
      )}
    </div>
  );
};

export default ImageDropzone;