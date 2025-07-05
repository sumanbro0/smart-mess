import { usersCurrentUserUsersMeGet } from "@/client/sdk.gen"
import { getPersistentCookie } from "@/lib/cookie"
import { queryOptions, useQuery } from "@tanstack/react-query"

export const useGetMe = () => useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
        const response = await usersCurrentUserUsersMeGet()
        if (response?.error) {
            throw new Error((response.error as { detail: string }).detail)
        }
        return response?.data ?? null

    },
    enabled: !!getPersistentCookie(),
})


export const useGetUserQueryOptions = () => {
    return queryOptions({
        queryKey: ["user", "me"],
        queryFn: async () => {
            const response = await usersCurrentUserUsersMeGet();
            if (response?.error) {
                throw new Error((response.error as { detail: string }).detail ?? "Failed to get user")
            }
            return response?.data ?? null
        },
    });
};

