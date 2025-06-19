import { usersCurrentUserUsersMeGet } from "@/client/sdk.gen"
import { getPersistentCookie } from "@/lib/cookie"
import { useQuery } from "@tanstack/react-query"

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