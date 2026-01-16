
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const initialConversations: Conversation[] = [
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


interface MessageContextType {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    selectConversation: (conversationId: string | null) => void;
    markAsRead: (conversationId: string) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(conversations[0]?.id || null);

    const selectConversation = (conversationId: string | null) => {
        setSelectedConversationId(conversationId);
        if (conversationId) {
            markAsRead(conversationId);
        }
    };
    
    const markAsRead = (conversationId: string) => {
        setConversations(prev => 
            prev.map(convo => 
                convo.id === conversationId ? { ...convo, unread: 0 } : convo
            )
        );
    };

    const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

    return (
        <MessageContext.Provider value={{ conversations, selectedConversation, selectConversation, markAsRead }}>
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
