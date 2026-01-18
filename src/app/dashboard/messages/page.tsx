
"use client"

import { useState, useRef, useEffect } from "react";
import { useMessages } from "@/context/MessageContext";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from "@/lib/types";

export default function MessagesPage() {
    const { 
        conversations, 
        selectedConversation, 
        selectConversation,
        messages,
        loadingConversations,
        loadingMessages,
        sendMessage 
    } = useMessages();
    const { user } = useAuth();
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const getOtherParticipant = (convo: Conversation) => {
        if (!user || !convo.participantDetails) return { fullName: 'User', avatarUrl: '' };
        const otherId = convo.participants.find((pId: string) => pId !== user.uid);
        if (!otherId) return { fullName: 'User', avatarUrl: '' };
        return convo.participantDetails[otherId] || { fullName: 'User', avatarUrl: '' };
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsSending(true);
        await sendMessage(newMessage);
        setNewMessage("");
        setIsSending(false);
    }
    
    const ConversationList = () => {
        if (loadingConversations) {
            return (
                <div className="p-4 space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            );
        }

        if (conversations.length === 0) {
            return <p className="p-4 text-center text-muted-foreground">No conversations yet.</p>
        }

        return conversations.map(convo => {
            const otherParticipant = getOtherParticipant(convo);
            const unreadCount = user ? convo.unreadCounts?.[user.uid] || 0 : 0;

            return (
                <div
                    key={convo.id}
                    className={cn(
                        "flex items-center gap-4 p-4 cursor-pointer border-b",
                        selectedConversation?.id === convo.id ? "bg-muted" : "hover:bg-muted/50"
                    )}
                    onClick={() => selectConversation(convo.id)}
                >
                    <Avatar>
                        <AvatarImage src={otherParticipant.avatarUrl} />
                        <AvatarFallback>{otherParticipant.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate">{otherParticipant.fullName}</p>
                        <p className="text-sm text-muted-foreground truncate">{convo.lastMessageContent}</p>
                    </div>
                    {unreadCount > 0 && <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">{unreadCount}</div>}
                </div>
            )
        });
    }

    const MessageArea = () => {
        if (loadingMessages) {
             return (
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )
        }
        
        return (
             <div className="space-y-4">
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-sm lg:max-w-md p-3 rounded-lg ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'sending...'}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
             </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow flex min-h-0">
                <aside className="w-[300px] border-r flex flex-col shrink-0">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold">Chats</h2>
                    </div>
                    <ScrollArea className="flex-1">
                        <ConversationList />
                    </ScrollArea>
                </aside>
                <main className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={getOtherParticipant(selectedConversation).avatarUrl} />
                                    <AvatarFallback>{getOtherParticipant(selectedConversation).fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h3 className="text-lg font-semibold">{getOtherParticipant(selectedConversation).fullName}</h3>
                            </div>
                             <ScrollArea className="flex-1 p-6">
                                <MessageArea />
                            </ScrollArea>
                            <div className="p-4 border-t bg-background">
                                <form onSubmit={handleSendMessage} className="relative">
                                    <Input 
                                        placeholder="Type a message..." 
                                        className="pr-12" 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isSending || loadingMessages}
                                    />
                                    <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isSending || loadingMessages || !newMessage.trim()}>
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
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
