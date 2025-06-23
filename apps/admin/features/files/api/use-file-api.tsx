import {
  uploadFileFilesUploadPost,
  uploadMultipleFilesFilesUploadMultiplePost,
  deleteFileFilesCategoryFilenameDelete,
} from "@/client";
import { useMutation } from "@tanstack/react-query";

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const data = await uploadFileFilesUploadPost({
        body: {
          file: file,
        },
      });

      if (data.status !== 200) {
        throw new Error("Failed to upload file");
      }

      return data.data?.url ?? "";
    },
  });
};

export const useUploadMultipleImages = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const data = await uploadMultipleFilesFilesUploadMultiplePost({
        body: {
          files: files,
        },
      });

      if (data.status !== 200) {
        throw new Error("Failed to upload files");
      }

      return data.data?.files.map((file) => file.url) ?? [];
    },
  });
};

export const useDeleteFile = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      console.log("DELETING URL", url);
      const path = url.split("/media/")[1]?.split("/");
      console.log("PATH", path);
      const data = await deleteFileFilesCategoryFilenameDelete({
        path: {
          category: path?.[0] ?? "",
          filename: path?.[1] ?? "",
        },
      });

      if (data.status !== 200) {
        throw new Error("Failed to delete file");
      }
    },
  });
};
