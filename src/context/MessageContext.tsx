
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Conversation, Message } from '@/lib/types';
import { getConversationsListener, getMessagesListener, sendMessage as firebaseSendMessage, markConversationAsRead } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface MessageContextType {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    messages: Message[];
    loadingConversations: boolean;
    loadingMessages: boolean;
    selectConversation: (conversationId: string | null) => void;
    sendMessage: (content: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    
    // Subscribe to user's conversations
    useEffect(() => {
        if (!user) {
            setConversations([]);
            setLoadingConversations(false);
            return;
        }

        setLoadingConversations(true);
        const unsubscribe = getConversationsListener(user.uid, (loadedConversations) => {
            setConversations(loadedConversations);
            setLoadingConversations(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Subscribe to messages of the selected conversation
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        const unsubscribe = getMessagesListener(selectedConversationId, (loadedMessages) => {
            setMessages(loadedMessages);
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [selectedConversationId]);
    
    const selectedConversation = useMemo(() => 
        conversations.find(c => c.id === selectedConversationId) || null,
        [conversations, selectedConversationId]
    );

    const selectConversation = useCallback((conversationId: string | null) => {
        setSelectedConversationId(conversationId);
        if (conversationId && user) {
            markConversationAsRead(conversationId, user.uid).catch(console.error);
        }
    }, [user]);

    const sendMessage = async (content: string) => {
        if (!content.trim() || !selectedConversationId || !user) {
            return;
        }

        try {
            await firebaseSendMessage({
                conversationId: selectedConversationId,
                senderId: user.uid,
                content: content.trim(),
            });
        } catch (error: any) {
            toast({
                title: "Message Not Sent",
                description: error.message || "An unexpected error occurred.",
                variant: "destructive"
            });
        }
    };
    

    const value = {
        conversations,
        selectedConversation,
        messages,
        loadingConversations,
        loadingMessages,
        selectConversation,
        sendMessage,
    };

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
};
