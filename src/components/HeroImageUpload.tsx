"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Image from "next/image";

interface HeroImageUploadProps {
  currentImage?: string;
  onUpload: (storageId: string) => void;
}

export function HeroImageUpload({ currentImage, onUpload }: HeroImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  // Resolve storage ID to URL if it looks like a Convex ID
  const isStorageId = currentImage && !currentImage.startsWith("http") && !currentImage.startsWith("data:");
  const resolvedUrl = useQuery(
    api.storage.getUrl,
    isStorageId ? { storageId: currentImage as Id<"_storage"> } : "skip"
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be less than 10MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Convex
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();
      onUpload(storageId);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // Use preview first, then resolved URL, then direct URL
  const displayImage = preview || resolvedUrl || (currentImage?.startsWith("http") ? currentImage : null);

  return (
    <div className="space-y-3">
      <label className="block text-xs text-zinc-500 uppercase mb-1">
        Hero Image (16:9 recommended)
      </label>
      
      {/* Preview */}
      {displayImage && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
          <Image
            src={displayImage}
            alt="Hero preview"
            fill
            className="object-cover"
            unoptimized={displayImage.startsWith("data:")}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-amber-400 animate-pulse">Uploading...</div>
            </div>
          )}
        </div>
      )}
      
      {/* Upload button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-mono transition-colors disabled:opacity-50"
        >
          {uploading ? "UPLOADING..." : displayImage ? "📷 CHANGE IMAGE" : "📷 UPLOAD IMAGE"}
        </button>
        
        {displayImage && !uploading && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onUpload("");
            }}
            className="px-4 py-3 bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 rounded-lg text-sm font-mono text-red-400 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-zinc-500">
        Upload a 16:9 hero image for the recipe page. Max 10MB.
      </p>
    </div>
  );
}
