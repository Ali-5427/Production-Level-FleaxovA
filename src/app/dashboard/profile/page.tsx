
"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Github, Linkedin, Star, Twitter, Edit, Trash2, PlusCircle } from "lucide-react";
import type { PortfolioItem } from "@/lib/types";
import { PortfolioFormDialog } from "@/components/profile/PortfolioFormDialog";

export default function ProfilePage() {
    const { user, profile, updateProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form state for basic info
    const [fullName, setFullName] = useState('');
    const [title, setTitle] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState('');
    const [github, setGithub] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [twitter, setTwitter] = useState('');
    
    // Avatar state
    const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
    const [avatarPreview, setAvatarPreview] = useState("https://picsum.photos/seed/user-avatar/200/200");

    // Portfolio state
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
    const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);

    // Sync state with profile changes from auth context
    useEffect(() => {
        if (profile) {
            setFullName(profile.fullName || '');
            setTitle(profile.title || '');
            setBio(profile.bio || '');
            setSkills(profile.skills?.join(', ') || '');
            setGithub(profile.socialLinks?.github || '');
            setLinkedin(profile.socialLinks?.linkedin || '');
            setTwitter(profile.socialLinks?.twitter || '');
            setPortfolio(profile.portfolio || []);
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

    const handleProfileSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Sanitize portfolio data to prevent Firestore errors by removing any 'undefined' properties.
            const sanitizedPortfolio = portfolio.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                url: item.url || '',
                // Conditionally add imageUrl only if it has a value
                ...(item.imageUrl && { imageUrl: item.imageUrl }),
            }));

            const profileUpdates = {
                fullName,
                title,
                bio,
                skills: skills.split(',').map(s => s.trim()).filter(Boolean),
                socialLinks: { github, linkedin, twitter },
                portfolio: sanitizedPortfolio,
            };
            await updateProfile(profileUpdates, avatarFile);
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
            setAvatarFile(undefined); // Reset file input after submission
        }
    };

    const handleOpenPortfolioDialog = (item: PortfolioItem | null = null) => {
        setEditingPortfolioItem(item);
        setIsPortfolioDialogOpen(true);
    };

    const handleSavePortfolioItem = (itemData: Omit<PortfolioItem, 'id'|'imageUrl'> & {id?:string}) => {
        let updatedPortfolio: PortfolioItem[];

        if (itemData.id) { // Editing existing item
            updatedPortfolio = portfolio.map(p => p.id === itemData.id ? { ...p, ...itemData } as PortfolioItem : p);
        } else { // Adding new item
            const newItem: PortfolioItem = {
                id: `temp_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`, // More unique temporary ID for client-side key
                ...itemData,
            } as PortfolioItem;
            updatedPortfolio = [...portfolio, newItem];
        }
        
        setPortfolio(updatedPortfolio);
        setIsPortfolioDialogOpen(false);
        setEditingPortfolioItem(null);
    };

    const handleDeletePortfolioItem = (itemId: string) => {
        const updatedPortfolio = portfolio.filter(p => p.id !== itemId);
        setPortfolio(updatedPortfolio);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <PortfolioFormDialog
                open={isPortfolioDialogOpen}
                onOpenChange={setIsPortfolioDialogOpen}
                onSave={handleSavePortfolioItem}
                initialData={editingPortfolioItem}
            />
            <form className="space-y-8" onSubmit={handleProfileSubmit}>
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold">Edit Profile</h1>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save All Changes'}
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={avatarPreview} />
                                    <AvatarFallback>{profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 w-full space-y-2">
                                    <Label htmlFor="avatar-file">Update Profile Picture</Label>
                                    <Input 
                                        id="avatar-file" 
                                        type="file" 
                                        onChange={handleAvatarChange} 
                                        accept="image/png, image/jpeg, image/gif" 
                                        disabled={isLoading}
                                    />
                                    <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 1MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="title">Professional Title</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Senior Web Developer" disabled={isLoading} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={user?.email || ''} disabled />
                                </div>
                                {profile?.role === 'freelancer' && (
                                    <div className="space-y-2">
                                        <Label>Overall Rating</Label>
                                        <div className="flex items-center gap-2 h-10">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            <span className="font-bold">{(profile.rating || 0).toFixed(1)}</span>
                                            <span className="text-muted-foreground">({profile.reviewsCount || 0} reviews)</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." disabled={isLoading}/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 {profile?.role === 'freelancer' && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Professional Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="space-y-2">
                                    <Label htmlFor="skills">Skills</Label>
                                    <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Next.js, Figma" disabled={isLoading}/>
                                    <p className="text-sm text-muted-foreground">Comma-separated list of your top skills.</p>
                                </div>

                                <div className="space-y-4">
                                    <Label>Social Links</Label>
                                    <div className="relative">
                                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input value={github} onChange={e => setGithub(e.target.value)} className="pl-10" placeholder="github.com/username" disabled={isLoading} />
                                    </div>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="pl-10" placeholder="linkedin.com/in/username" disabled={isLoading} />
                                    </div>
                                    <div className="relative">
                                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input value={twitter} onChange={e => setTwitter(e.target.value)} className="pl-10" placeholder="twitter.com/username" disabled={isLoading} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>My Portfolio</CardTitle>
                                    <CardDescription>Showcase your best work to clients.</CardDescription>
                                </div>
                                <Button type="button" onClick={() => handleOpenPortfolioDialog()}>
                                    <PlusCircle className="mr-2" /> Add Item
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {portfolio.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {portfolio.map(item => (
                                            <Card key={item.id}>
                                                <CardHeader>
                                                    <CardTitle className="truncate">{item.title}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground line-clamp-3 h-[60px]">{item.description}</p>
                                                </CardContent>
                                                <CardFooter className="flex justify-end gap-2">
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenPortfolioDialog(item)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePortfolioItem(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                        <h3 className="text-lg font-semibold">Your portfolio is empty</h3>
                                        <p className="text-sm text-muted-foreground mt-1">Add items to showcase your skills.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                 )}
            </form>
        </div>
    )
}
