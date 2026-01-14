"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

export default function MessagesPage() {
    const conversations = [
        { id: '1', name: 'Olivia Smith', lastMessage: 'Sure, I can do that.', avatar: 'https://picsum.photos/seed/olivia/100/100', unread: 2 },
        { id: '2', name: 'Liam Johnson', lastMessage: 'Perfect, thank you!', avatar: 'https://picsum.photos/seed/liam/100/100' },
        { id: '3', name: 'Emma Brown', lastMessage: 'See you then!', avatar: 'https://picsum.photos/seed/emma/100/100' },
    ];

    const messages = [
        { from: 'other', text: 'Hey, how is the project going?', time: '10:00 AM' },
        { from: 'me', text: 'Hi Olivia, it\'s going well. I should have an update for you by end of day.', time: '10:01 AM' },
        { from: 'other', text: 'Great to hear. Can you also include the source files?', time: '10:02 AM' },
        { from: 'me', text: 'Sure, I can do that.', time: '10:03 AM' },
    ]

    return (
        <div className="h-[calc(100vh-theme(spacing.16))] flex">
            <aside className="w-1/3 border-r">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Chats</h2>
                </div>
                <ScrollArea className="h-[calc(100%-theme(spacing.16))]">
                {conversations.map(convo => (
                    <div key={convo.id} className="flex items-center gap-4 p-4 hover:bg-muted cursor-pointer border-b">
                        <Avatar>
                            <AvatarImage src={convo.avatar} />
                            <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{convo.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                        </div>
                        {convo.unread && <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{convo.unread}</div>}
                    </div>
                ))}
                </ScrollArea>
            </aside>
            <main className="w-2/3 flex flex-col">
                <div className="p-4 border-b flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/olivia/100/100" />
                        <AvatarFallback>OS</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold">Olivia Smith</h3>
                </div>
                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p>{msg.text}</p>
                                    <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <div className="relative">
                        <Input placeholder="Type a message..." className="pr-12" />
                        <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}
