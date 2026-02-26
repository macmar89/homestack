import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { LoginInput } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";

export const handlePostLogin = async (values: LoginInput) => {
    const { setUser } = useAuthStore.getState()

    try {
        const { data } = await api.post(API_ROUTES.AUTH.LOGIN, values);


        setUser(data);

        console.log(data)

        return {
            success: true
        };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "UNEXPECTED_ERROR";
        const errorField = error.response?.data?.field; // Backend môže poslať napr. "password"

        return {
            success: false,
            message: errorMessage,
            field: errorField,
        };
    }
}