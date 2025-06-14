import { registerRegisterAuthRegisterPost, RegisterRegisterAuthRegisterPostData } from "@/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRegister = () => {
    return useMutation({
        mutationFn: (data: RegisterRegisterAuthRegisterPostData["body"]) => registerRegisterAuthRegisterPost({
            body: data,
        }),
        onSuccess: () => {
            toast.success("Account created successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong. Please try again.");
        }
    })
}