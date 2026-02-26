import { redirect } from "@/i18n/routing";
import { cookies } from "next/headers";

export async function serverFetch(endpoint: string) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${endpoint}`, {
        headers: {
            Cookie: `access_token=${accessToken}`,
        },
        cache: 'no-store',
    });

    if (res.status === 401) {
        const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
        redirect({ href: '/', locale });
    }

    return res;
}