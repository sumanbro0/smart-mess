import { registerRegisterAuthRegisterPost, RegisterRegisterAuthRegisterPostData } from "@/client";
import { useMutation } from "@tanstack/react-query";

export const useRegister = () => {
    return useMutation({
        mutationFn: async (data: RegisterRegisterAuthRegisterPostData["body"]) => {
            const response = await registerRegisterAuthRegisterPost({
                body: data,
            })

            if (response.error) {
                const errorMessage = (response.error as { detail: string }).detail
                throw new Error(errorMessage.replace(/_/g, " ").trim().toLocaleLowerCase() || "Something went wrong. Please try again.")
            }

            return response.data
        },

    })
}