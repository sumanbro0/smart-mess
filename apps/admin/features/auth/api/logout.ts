import { authDatabaseLogoutAuthLogoutPost } from "@/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLogout = () => {
    return useMutation({
        mutationFn: () => authDatabaseLogoutAuthLogoutPost(),
        onSuccess: () => {
            toast.success("Logout successful!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong. Please try again.");
        }
    })
}