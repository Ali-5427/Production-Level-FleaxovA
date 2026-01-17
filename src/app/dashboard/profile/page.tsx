
"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
    const { user, profile, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    
    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
    const [avatarPreview, setAvatarPreview] = useState("https://picsum.photos/seed/user-avatar/200/200");

    // Sync state with profile changes from auth context
    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setBio(profile.bio || '');
            setSkills(profile.skills?.join(', ') || '');
        }

        // Determine avatar URL, prioritizing Firestore profile, then auth, then fallback.
        const newAvatarUrl = profile?.avatarUrl || user?.photoURL || "https://picsum.photos/seed/user-avatar/200/200";
        setAvatarPreview(newAvatarUrl);

    }, [profile, user]);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const profileUpdates = {
                fullName,
                bio,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
            };
            await updateProfile(profileUpdates, avatarFile);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
            setAvatarFile(undefined); // Reset file input after submission
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
            <Card>
                <CardContent className="pt-6">
                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={avatarPreview} />
                                <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <Label htmlFor="avatar-file">Update Profile Picture</Label>
                                <Input 
                                    id="avatar-file" 
                                    type="file" 
                                    onChange={handleAvatarChange} 
                                    accept="image/png, image/jpeg, image/gif" 
                                    disabled={isLoading}
                                />
                                <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={user?.email || ''} disabled />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." disabled={isLoading}/>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills</Label>
                            <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Next.js, Figma" disabled={isLoading}/>
                            <p className="text-sm text-muted-foreground">Comma-separated list of your top skills.</p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
