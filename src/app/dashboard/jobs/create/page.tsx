
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateJobPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Post a New Job</CardTitle>
                    <CardDescription>Fill out the details below to find the perfect freelancer for your project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input id="title" placeholder="e.g., Senior React Developer needed for a web app" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description</Label>
                            <Textarea id="description" placeholder="Describe your project in detail..." rows={6} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget ($)</Label>
                                <Input id="budget" type="number" placeholder="e.g., 1000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skills">Required Skills</Label>
                                <Input id="skills" placeholder="e.g., React, TypeScript, Node.js" />
                            </div>
                        </div>
                        <Button type="submit" className="w-full">Post Job</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
