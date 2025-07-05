import {
  createCategoryMessSlugMenuCategoriesPost,
  getCategoryMessSlugMenuCategoriesCategoryIdGet,
  updateCategoryMessSlugMenuCategoriesCategoryIdPut,
  deleteCategoryMessSlugMenuCategoriesCategoryIdDelete,
  getCategoriesMessSlugMenuCategoriesGet,
} from "@/client";
import { type MenuItemCategoryType } from "@/features/category/schema";
import { getQueryClient } from "@/providers/get-query-client";
import { queryOptions, useMutation } from "@tanstack/react-query";

export const categoryQueryOptions = (messSlug: string) => {
  return queryOptions({
    queryKey: ["category", messSlug],
    queryFn: async () => {
      const categories = await getCategoriesMessSlugMenuCategoriesGet({
        path: { mess_slug: messSlug },
      });

      if (categories.error) {
        console.log("categories.error", categories.error);
        throw new Error(
          categories.error.detail?.[0]?.msg ?? "Failed to get categories"
        );
      }

      return categories.data ?? [];
    },
    enabled: !!messSlug,
  });
};

export const categoryQueryOptionsWithId = (
  messSlug: string,
  categoryId: string | null
) => {
  return queryOptions({
    queryKey: ["category", messSlug, categoryId],
    queryFn: async () => {
      if (!categoryId) {
        return null;
      }
      const category = await getCategoryMessSlugMenuCategoriesCategoryIdGet({
        path: { mess_slug: messSlug, category_id: categoryId },
      });

      if (category.error) {
        throw new Error(
          category.error.detail?.[0]?.msg ?? "Failed to get category"
        );
      }

      return category.data ?? null;
    },
    enabled: !!categoryId && !!messSlug,
  });
};

export const useCreateCategoryMutation = (messSlug: string) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (data: MenuItemCategoryType) => {
      const category = await createCategoryMessSlugMenuCategoriesPost({
        path: { mess_slug: messSlug },
        body: {
          name: data.name,
          description: data.description,
          image: data.image,
          slug: data.slug,
          is_active: data.is_active,
          mess_id: undefined,
        },
      });

      if (category.error) {
        throw new Error(
          category.error.detail?.toString() ?? "Failed to create category"
        );
      }

      return category.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["category", messSlug] });
      queryClient.invalidateQueries({ queryKey: ["menu-items", messSlug] });
    },
  });
};

export const useUpdateCategoryMutation = (messSlug: string) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (data: MenuItemCategoryType) => {
      if (!data.id) {
        throw new Error("Category ID is required");
      }

      const category = await updateCategoryMessSlugMenuCategoriesCategoryIdPut({
        path: { mess_slug: messSlug, category_id: data.id },
        body: {
          name: data.name,
          description: data.description,
          image: data.image,
          slug: data.slug,
          is_active: data.is_active,
          mess_id: data.mess_id,
        },
      });

      if (category.error) {
        throw new Error(
          category.error.detail?.[0]?.msg ?? "Failed to update category"
        );
      }

      return category.data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["category", messSlug] });
      queryClient.invalidateQueries({
        queryKey: ["category", messSlug, data?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["menu-items", messSlug] });
    },
  });
};

export const useDeleteCategoryMutation = (messSlug: string) => {
  const queryClient = getQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const category =
        await deleteCategoryMessSlugMenuCategoriesCategoryIdDelete({
          path: { mess_slug: messSlug, category_id: categoryId },
        });

      if (category.error) {
        throw new Error(
          category.error.detail?.[0]?.msg ?? "Failed to delete category"
        );
      }

      return category.data;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["category", messSlug] });
      queryClient.invalidateQueries({ queryKey: ["menu-items", messSlug] });
    },
  });
};
