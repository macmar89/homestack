'use client'

import { Button } from "@/components/ui/button";
import { handleLogout } from "@/services/auth";

export default function AdminDashboard() {
    return <div>
        <h1>Admin dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
    </div>
}
