
"use client"

import { useMessages } from "@/context/MessageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";

export default function MessagesPage() {
    const { conversations, selectedConversation, selectConversation } = useMessages();

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow flex min-h-0">
                <aside className="w-[300px] border-r flex flex-col shrink-0">
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
                            onClick={() => selectConversation(convo.id)}
                        >
                            <Avatar>
                                <AvatarImage src={convo.avatar} />
                                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold truncate">{convo.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                            </div>
                            {convo.unread ? <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">{convo.unread}</div> : null}
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
