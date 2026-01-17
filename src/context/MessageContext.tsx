
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';

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

// --- Robust Store Logic ---
interface MessageState {
    conversations: Conversation[];
    selectedConversationId: string | null;
}

type Action = 
    | { type: 'SELECT_CONVERSATION', payload: string | null };

const reducer = (state: MessageState, action: Action): MessageState => {
    switch (action.type) {
        case 'SELECT_CONVERSATION': {
            if (action.payload === state.selectedConversationId) {
                return state;
            }
             // Mark as read when selecting
            const newConversations = state.conversations.map(convo => 
                convo.id === action.payload ? { ...convo, unread: 0 } : convo
            );
            return {
                ...state,
                selectedConversationId: action.payload,
                conversations: newConversations,
            };
        }
        default:
            return state;
    }
}

const listeners: Array<(state: MessageState) => void> = [];

let memoryState: MessageState = {
    conversations: initialConversations,
    selectedConversationId: null,
};

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
// --- End of Store Logic ---

interface MessageContextType {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    selectConversation: (conversationId: string | null) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState(memoryState);

    useEffect(() => {
        listeners.push(setState);
        // Set initial state without marking as read, but select the first conversation
        if (memoryState.conversations.length > 0 && !memoryState.selectedConversationId) {
            // This just sets the initial view, it doesn't run the 'read' logic
            memoryState.selectedConversationId = memoryState.conversations[0].id;
        }
        setState({...memoryState}); // Ensure component has the initial state
        
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);

    const selectedConversation = useMemo(() => 
        state.conversations.find(c => c.id === state.selectedConversationId) || null
    , [state.conversations, state.selectedConversationId]);

    const selectConversation = (conversationId: string | null) => {
        dispatch({ type: 'SELECT_CONVERSATION', payload: conversationId });
    };

    const value = {
        conversations: state.conversations,
        selectedConversation,
        selectConversation,
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
