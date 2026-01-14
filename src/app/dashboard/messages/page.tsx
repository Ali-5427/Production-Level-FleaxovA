
"use client"

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

type Message = {
    from: 'me' | 'other';
    text: string;
    time: string;
};

type Conversation = {
    id: string;
    name: string;
    lastMessage: string;
    avatar: string;
    unread?: number;
    messages: Message[];
};


export default function MessagesPage() {
    const conversations: Conversation[] = [
        { 
            id: '1', 
            name: 'Olivia Smith', 
            lastMessage: 'Sure, I can do that.', 
            avatar: 'https://picsum.photos/seed/olivia/100/100', 
            unread: 2,
            messages: [
                { from: 'other', text: 'Hey, how is the project going?', time: '10:00 AM' },
                { from: 'me', text: 'Hi Olivia, it\'s going well. I should have an update for you by end of day.', time: '10:01 AM' },
                { from: 'other', text: 'Great to hear. Can you also include the source files?', time: '10:02 AM' },
                { from: 'me', text: 'Sure, I can do that.', time: '10:03 AM' },
            ] 
        },
        { 
            id: '2', 
            name: 'Liam Johnson', 
            lastMessage: 'Perfect, thank you!', 
            avatar: 'https://picsum.photos/seed/liam/100/100',
            messages: [
                { from: 'other', text: 'Just confirming the delivery. Looks great!', time: 'Yesterday' },
                { from: 'me', text: 'Awesome! Glad you like it.', time: 'Yesterday' },
                { from: 'other', text: 'Perfect, thank you!', time: 'Yesterday' },
            ]
        },
        { 
            id: '3', 
            name: 'Emma Brown', 
            lastMessage: 'See you then!', 
            avatar: 'https://picsum.photos/seed/emma/100/100',
            messages: [
                 { from: 'me', text: 'Meeting is set for 3 PM tomorrow.', time: '2 days ago' },
                 { from: 'other', text: 'See you then!', time: '2 days ago' },
            ]
        },
    ];

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0] || null);

    const handleConversationSelect = (conversation: Conversation) => {
        setSelectedConversation(conversation);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow flex min-h-0">
                <aside className="w-[350px] border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold">Chats</h2>
                    </div>
                    <ScrollArea className="flex-1">
                    {conversations.map(convo => (
                        <div 
                            key={convo.id} 
                            className={cn(
                                "flex items-center gap-4 p-4 cursor-pointer border-b",
                                selectedConversation?.id === convo.id ? "bg-muted" : "hover:bg-muted/50"
                            )}
                            onClick={() => handleConversationSelect(convo)}
                        >
                            <Avatar>
                                <AvatarImage src={convo.avatar} />
                                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">{convo.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            </div>
                            {convo.unread && <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">{convo.unread}</div>}
                        </div>
                    ))}
                    </ScrollArea>
                </aside>
                <main className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={selectedConversation.avatar} />
                                    <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-semibold">{selectedConversation.name}</h3>
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-4">
                                    {selectedConversation.messages.map((msg, index) => (
                                        <div key={index} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <p>{msg.text}</p>
                                                <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-background">
                                <div className="relative">
                                    <Input placeholder="Type a message..." className="pr-12" />
                                    <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="flex flex-1 items-center justify-center">
                            <p className="text-muted-foreground">Select a conversation to start chatting.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
