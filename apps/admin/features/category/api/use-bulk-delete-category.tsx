import { deleteCategoryMessSlugMenuCategoriesCategoryIdDelete } from "@/client";
import { getQueryClient } from "@/providers/get-query-client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBulkDeleteCategoryMutation = (messSlug: string) => {
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: async (categoryIds: string[]) => {
      const deletePromises = categoryIds.map(async (categoryId) => {
        const result =
          await deleteCategoryMessSlugMenuCategoriesCategoryIdDelete({
            path: { mess_slug: messSlug, category_id: categoryId },
          });

        if (result.error) {
          throw new Error(
            result.error.detail?.[0]?.msg ??
              `Failed to delete category ${categoryId}`
          );
        }

        return result.data;
      });

      const results = await Promise.allSettled(deletePromises);

      // Check if any deletions failed
      const failedDeletions = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletions.length > 0) {
        throw new Error(
          `Failed to delete ${failedDeletions.length} out of ${categoryIds.length} categories`
        );
      }

      return results;
    },
    onSuccess: async (_, deletedIds) => {
      queryClient.invalidateQueries({ queryKey: ["category", messSlug] });
      queryClient.invalidateQueries({ queryKey: ["menu-items", messSlug] });

      toast.success(
        `Successfully deleted ${deletedIds.length} categor${deletedIds.length === 1 ? "y" : "ies"}`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete categories");
    },
  });
};
