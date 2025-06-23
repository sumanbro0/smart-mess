import React from "react";
import Image from "next/image";
import {
  X,
  ExternalLink,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDeleteFile } from "../api/use-file-api";
import { DEFAULT_AVATAR } from "@/lib/constant";
import { Button } from "@/components/ui/button";

interface ImagePreviewProps {
  src: string | string[];
  alt?: string;
  width?: number;
  height?: number;
  enableDelete?: boolean;
  onFilesChange?: (urls: string[]) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = "Image Preview",
  width = 120,
  height = 120,
  enableDelete = false,
  onFilesChange,
}) => {
  console.log(src);
  const images = Array.isArray(src) ? src : [src];
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [imageError, setImageError] = React.useState(false);

  const deleteMutation = useDeleteFile();
  const isMultiple = images.length > 1;
  const currentSrc = images[currentIndex];

  const handleImageError = () => setImageError(true);

  const handleView = () => {
    if (currentSrc) {
      window.open(currentSrc, "_blank", "noopener,noreferrer");
    }
  };

  const handleRemove = async () => {
    if (enableDelete && currentSrc) {
      try {
        await deleteMutation.mutateAsync(currentSrc, {
          onSuccess: () => {
            const newImages = images.filter((_, i) => i !== currentIndex);
            onFilesChange?.(newImages);
          },
          onError: (error) => {
            console.error("Failed to delete file:", error);
          },
        });
      } catch (error) {
        console.error("Failed to delete file:", error);
      }
    }
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setImageError(false);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setImageError(false);
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Image Container */}
      <div className="relative p-6 bg-muted/20 rounded-xl border">
        <div className="text-center space-y-4">
          <div
            className="relative mx-auto rounded-lg overflow-hidden border bg-background"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            {/* Image */}
            {!imageError ? (
              <Image
                src={currentSrc ?? DEFAULT_AVATAR}
                alt={`${alt}${isMultiple ? ` (${currentIndex + 1}/${images.length})` : ""}`}
                className="w-full h-full object-cover"
                width={width}
                height={height}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                <Building2 className="h-8 w-8" />
              </div>
            )}

            {/* Navigation for multiple images */}
            {isMultiple && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80"
                  disabled={deleteMutation.isPending}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80"
                  disabled={deleteMutation.isPending}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* View Link */}
          {!imageError && (
            <div className="flex items-center gap-2 justify-center">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={handleView}
                className="text-sm text-primary hover:underline"
              >
                View Full Size
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={handleRemove}
          disabled={deleteMutation.isPending}
          className="text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
          Remove{isMultiple ? " Image" : ""}
        </Button>
      </div>
    </div>
  );
};
