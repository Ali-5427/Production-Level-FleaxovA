"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminWithdrawalsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Review and process withdrawal requests from freelancers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">Withdrawal management functionality coming soon.</p>
                </CardContent>
            </Card>
        </div>
    );
}
