import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, FileImage, Loader2 } from 'lucide-react';
import { api } from '@/api/client';

export default function ExamUploader({ onExamUploaded, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    onExamUploaded(file_url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <Card
      dir="rtl"
      className={`relative border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer
        ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      
      {isLoading ? (
        <div className="space-y-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium">מנתח את המבחן... ⏳</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
              <FileImage className="w-6 h-6 text-accent-foreground" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">העלי תמונה של המבחן 📸</p>
            <p className="text-muted-foreground text-sm mt-1">
              גררי לכאן או לחצי לבחירת תמונה
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}