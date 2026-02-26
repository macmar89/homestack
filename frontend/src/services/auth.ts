import { redirect } from "@/i18n/routing";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { LoginInput } from "@/schema/auth.schema";
import { useAuthStore } from "@/store/useAuthStore";

export const handlePostLogin = async (values: LoginInput) => {
    const { setUser } = useAuthStore.getState()

    try {
        const { data } = await api.post(API_ROUTES.AUTH.LOGIN, values);

        setUser(data);

        const { data: { user } } = data
        return { success: true, isSuperadmin: user?.isSuperadmin, defaultOrgSlug: user?.defaultOrgSlug };
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || "UNEXPECTED_ERROR";

        return {
            success: false,
            message: errorMessage,
        };
    }
}

export const handleLogout = async () => {
    try {
        await api.post(API_ROUTES.AUTH.LOGOUT)
        return { success: true };
    } catch (error) {
        return { success: false, message: "logout_failed" };
    } finally {
        useAuthStore.getState().logout();
        window.location.href = '/';
    }
}