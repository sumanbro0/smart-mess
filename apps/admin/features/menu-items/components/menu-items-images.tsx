import React from "react";
import { Star, X, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/features/files/components/file-upload";
import { useDeleteFile } from "@/features/files/api/use-file-api";

interface MenuItemsImagesProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onPrimaryImageChange: (primaryImage: string | undefined) => void;
  primaryImage?: string;
  maxFiles?: number;
  maxSize?: number;
}

const MenuItemsImages = ({
  images = [],
  onImagesChange,
  onPrimaryImageChange,
  primaryImage,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
}: MenuItemsImagesProps) => {
  const deleteMutation = useDeleteFile();

  const handleImageUpload = (urls: string[]) => {
    // Add new images to the existing images array
    const newImages = [...images, ...urls];
    onImagesChange(newImages);

    // Set first uploaded image as primary if no primary image exists
    if (!primaryImage && urls.length > 0) {
      onPrimaryImageChange(urls[0]);
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      await deleteMutation.mutateAsync(imageUrl, {
        onSuccess: () => {
          // Remove the image from the images array
          const updatedImages = images.filter((img) => img !== imageUrl);
          onImagesChange(updatedImages);

          // If removed image was primary, set first remaining image as primary
          if (primaryImage === imageUrl) {
            if (updatedImages.length > 0) {
              onPrimaryImageChange(updatedImages[0]);
            } else {
              onPrimaryImageChange("");
            }
          }
        },
        onError: (error) => {
          console.error("Failed to delete file:", error);
        },
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const setPrimaryImage = (imageUrl: string) => {
    let updatedImages = [...images];

    // If the new primary image is not in the images array, add it
    if (!images.includes(imageUrl)) {
      updatedImages.push(imageUrl);
    }

    // If there was a previous primary image, add it back to the images array
    if (
      primaryImage &&
      primaryImage !== imageUrl &&
      !images.includes(primaryImage)
    ) {
      updatedImages.push(primaryImage);
    }

    // Update images array and set new primary image
    onImagesChange(updatedImages);
    onPrimaryImageChange(imageUrl);
  };

  // Combine all images for display (primary + other images)
  const allImages = primaryImage
    ? [primaryImage, ...images.filter((img) => img !== primaryImage)]
    : images;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Item Images</CardTitle>
        <CardDescription>
          Upload and manage images for this menu item. Set one as primary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Images</label>
          <FileUpload
            onChange={handleImageUpload}
            maxFiles={maxFiles}
            maxSize={maxSize}
            acceptedTypes={["image/*"]}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Upload up to {maxFiles} images. Maximum size:{" "}
            {maxSize / (1024 * 1024)}MB per image.
          </p>
        </div>

        {allImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Uploaded Images</h4>
              <Badge variant="secondary">{allImages.length} images</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-md border">
                    <img
                      src={imageUrl}
                      alt={`Item image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {primaryImage && primaryImage === imageUrl && (
                    <Badge className="absolute top-2 left-2 text-xs bg-primary">
                      <Star className="w-3 h-3 mr-1" />
                      Primary
                    </Badge>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(!primaryImage || primaryImage !== imageUrl) && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setPrimaryImage(imageUrl)}
                        title="Set as primary"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeImage(imageUrl)}
                      title="Remove image"
                      disabled={deleteMutation.isPending}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Image Index */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Primary Image Info */}
            {primaryImage && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Primary image selected. This will be displayed first to
                  customers.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {allImages.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-muted rounded-md">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No images uploaded yet. Upload images to showcase this menu item.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MenuItemsImages;
