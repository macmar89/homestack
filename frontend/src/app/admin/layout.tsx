import { API_ROUTES } from "@/lib/api-routes"
import { serverFetch } from "@/lib/api-server";
import { UserResponseSchema } from "@/schema/user.schema";
import { notFound } from "next/navigation";

export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: { slug: string }
}) {
    const res = await serverFetch(API_ROUTES.AUTH.ME);
    const resData = await res.json()

    const validation = UserResponseSchema.safeParse(resData.data)

    if (!validation.success) {
        notFound()
        return
    }

    const user = validation.data.user

    if (!user?.isSuperadmin) {
        notFound()
    }

    return (
        <div className="flex">
            <main>{children}</main>
        </div>
    );
}