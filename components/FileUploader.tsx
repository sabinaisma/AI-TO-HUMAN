import React, { useRef, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { extractTextFromFile } from '../services/fileParsing';
import { ACCEPTED_FILE_TYPES } from '../constants';

interface FileUploaderProps {
  onTextExtracted: (text: string, fileName: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onTextExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error("File is too large. Max 10MB.");
      }

      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        throw new Error("Could not extract any text from this file.");
      }

      onTextExtracted(text, file.name);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10' 
            : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center">
               <FileText className="w-12 h-12 text-indigo-400 mb-2" />
               <span className="text-slate-300">Extracting text...</span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <Upload className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200">
                  Click to upload or drag and drop
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  PDF, DOCX, TXT, MD (Max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;