import { authDatabaseLoginAuthLoginPost, AuthDatabaseLoginAuthLoginPostData } from "@/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLogin = () => {
    return useMutation({
        mutationFn: (data: AuthDatabaseLoginAuthLoginPostData["body"]) => authDatabaseLoginAuthLoginPost({
            body: data,
        }),
        onSuccess: () => {
            toast.success("Login successful!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong. Please try again.");
        }
    })
}