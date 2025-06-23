import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadMultipleImages } from "../api/use-file-api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FileUploadProps {
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ["image/*", "application/pdf", ".doc", ".docx"],
  className,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadMultipleImages();

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];

    if (file.size > maxSize) {
      errors.push(
        `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      );
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return fileName.endsWith(type);
      }
      if (type.includes("*")) {
        const baseType = type.split("/")[0] || "";
        return fileType.startsWith(baseType);
      }
      return fileType === type;
    });

    if (!isValidType) {
      errors.push(
        `File type not supported. Accepted types: ${acceptedTypes.join(", ")}`
      );
    }

    return errors;
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;

    uploadMutation.mutate(filesToUpload, {
      onSuccess: (data) => {
        onChange?.(data);
      },
      onError: (error) => {
        console.error("Upload failed:", error);
        setErrors((prev) => [
          ...prev,
          "Failed to upload files. Please try again.",
        ]);
      },
    });
  };

  const processFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const validFiles: File[] = [];
    const newErrors: string[] = [];
    console.log(fileList);

    // Check max files limit
    if (fileList.length > maxFiles) {
      setErrors([`Maximum ${maxFiles} files allowed`]);
      return;
    }

    // Validate each file
    newFiles.forEach((file) => {
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        newErrors.push(...validationErrors);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    uploadFiles(validFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled || !e.dataTransfer.files) return;
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    processFiles(e.target.files);
    e.target.value = ""; // Reset for re-selection
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Prevent double-opening by checking if click is directly on the container
    if (!disabled && e.target === e.currentTarget) {
      fileInputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          disabled && "border-gray-200 bg-gray-50 cursor-not-allowed",
          !disabled && isDragOver && "border-primary bg-primary/5",
          !disabled && !isDragOver && "border-gray-300 hover:border-gray-400"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleContainerClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          disabled={disabled || uploadMutation.isPending}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload
            className={cn(
              "h-10 w-10 mb-4",
              disabled ? "text-gray-300" : "text-gray-400"
            )}
          />
          <p
            className={cn(
              "text-lg font-medium mb-2",
              disabled ? "text-gray-400" : "text-gray-900"
            )}
          >
            Drop files here or click to browse
          </p>
          <p
            className={cn(
              "text-sm mb-4",
              disabled ? "text-gray-400" : "text-gray-500"
            )}
          >
            Upload up to {maxFiles} files, max{" "}
            {Math.round(maxSize / 1024 / 1024)}MB each
          </p>
          <p
            className={cn(
              "text-xs",
              disabled ? "text-gray-300" : "text-gray-400"
            )}
          >
            Supported formats: {acceptedTypes.join(", ")}
          </p>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
