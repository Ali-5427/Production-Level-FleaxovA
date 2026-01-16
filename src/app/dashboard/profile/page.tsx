
"use client"

import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
    const { user, profile } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
            <Card>
                <CardContent className="pt-6">
                    <form className="space-y-8">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={user?.photoURL || profile?.avatarUrl || "https://picsum.photos/seed/user-avatar/200/200"} />
                                <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Label htmlFor="avatar-file">Update Profile Picture</Label>
                                <Input id="avatar-file" type="file" />
                                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={profile?.fullName || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" rows={4} defaultValue={profile?.bio || ''} placeholder="Tell us about yourself..."/>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills</Label>
                            <Input id="skills" defaultValue={profile?.skills?.join(', ') || ''} placeholder="e.g. React, Next.js, Figma"/>
                            <p className="text-sm text-muted-foreground">Comma-separated list of your top skills.</p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
