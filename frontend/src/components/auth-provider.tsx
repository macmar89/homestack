"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { API_ROUTES } from "@/lib/api-routes";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const res = await api.get(API_ROUTES.AUTH.ME);
                setUser(res.data);
            } catch (err) {
                setUser(null);
            }
        };

        initAuth();
    }, [setUser]);

    return <>{children}</>;
}