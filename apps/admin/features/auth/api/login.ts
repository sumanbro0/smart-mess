import { authDatabaseLoginAuthLoginPost, AuthDatabaseLoginAuthLoginPostData } from "@/client";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
    return useMutation({
        mutationFn: async (data: AuthDatabaseLoginAuthLoginPostData["body"]) => {
            const response = await authDatabaseLoginAuthLoginPost({
                body: data,
            })

            if (response.error) {
                throw new Error((response.error as { detail: string }).detail || "Something went wrong. Please try again.")
            }

            return response.data

        },
        onError: (error) => {
            console.log(error, "**********************")
        }


    })
}