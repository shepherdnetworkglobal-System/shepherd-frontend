"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/api";

interface FileUploadProps {
  label: string;
  onUploadComplete: (url: string) => void;
  acceptedTypes?: string;
}

export default function FileUpload({ label, onUploadComplete, acceptedTypes = ".jpg,.jpeg,.png,.pdf" }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const result = await uploadFile(file);
      onUploadComplete(result.url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed");
      }
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setFileName(null);
    setError(null);
    onUploadComplete("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          fileName
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="ml-2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-500">
            <Upload className="w-5 h-5" />
            <span className="text-xs font-medium">Click to upload or drag file</span>
            <span className="text-[11px] text-gray-400">{acceptedTypes}</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}