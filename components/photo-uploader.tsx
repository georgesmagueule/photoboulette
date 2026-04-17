"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PhotoFile {
  id: string;
  url: string;
  name: string;
  size: number;
}

export function PhotoUploader() {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newPhotos: PhotoFile[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${f.name}-${f.lastModified}-${Math.random()}`,
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.url);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setPhotos((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Photo Boulette</h1>
        <p className="text-muted-foreground mt-1">
          Upload photos from your phone or desktop
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-2xl border-2 border-dashed p-10 cursor-pointer
          transition-colors select-none
          ${dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
          }
        `}
      >
        <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
          <UploadIcon />
          <p className="text-sm font-medium">
            Tap to select photos
          </p>
          <p className="text-xs text-muted-foreground">
            or drag & drop — HEIC, JPG, PNG, WEBP supported
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          capture={false}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
          onClick={(e) => {
            // Reset value so same files can be re-added after clearing
            (e.target as HTMLInputElement).value = "";
          }}
        />
      </div>

      {/* Controls */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}

      {/* Gallery */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                  className="self-end rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                  aria-label="Remove photo"
                >
                  <XIcon />
                </button>
                <p className="text-xs text-white/90 truncate leading-tight">
                  {photo.name}
                  <span className="block text-white/60">{formatSize(photo.size)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {photos.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No photos selected yet
        </p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
