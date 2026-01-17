
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';

// Types remain the same
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

// --- NEW LocalStorage Logic ---
const READ_CONVOS_KEY = 'fleaxova_read_conversations';

const getReadConvoIds = (): Set<string> => {
    if (typeof window === 'undefined') {
        return new Set();
    }
    try {
        const item = window.localStorage.getItem(READ_CONVOS_KEY);
        return item ? new Set(JSON.parse(item)) : new Set();
    } catch (error) {
        console.warn('Error reading from localStorage', error);
        return new Set();
    }
}

const addReadConvoId = (id: string) => {
    if (typeof window === 'undefined') return;
    try {
        const currentIds = getReadConvoIds();
        currentIds.add(id);
        window.localStorage.setItem(READ_CONVOS_KEY, JSON.stringify(Array.from(currentIds)));
    } catch (error) {
        console.warn('Error writing to localStorage', error);
    }
}


// --- Global Store Implementation ---

interface MessageState {
    conversations: Conversation[];
    selectedConversationId: string | null;
}

type Action = 
    | { type: 'SELECT_CONVERSATION', payload: { conversationId: string | null } };

// The reducer function remains the same
const messageReducer = (state: MessageState, action: Action): MessageState => {
    switch (action.type) {
        case 'SELECT_CONVERSATION': {
            const { conversationId } = action.payload;
            if (conversationId === state.selectedConversationId) {
              return state;
            }

            // Side effect: update localStorage when a conversation is selected
            if (conversationId) {
                addReadConvoId(conversationId);
            }
            
            const newConversations = state.conversations.map(convo => 
                convo.id === conversationId ? { ...convo, unread: 0 } : convo
            );
            return {
                ...state,
                selectedConversationId: conversationId,
                conversations: newConversations,
            };
        }
        default:
            return state;
    }
};

// The actual store implementation that will be a singleton
class MessageStore {
    private state: MessageState;
    private listeners: Set<(state: MessageState) => void> = new Set();

    constructor() {
        const readIds = getReadConvoIds();
        const processedConversations = initialConversations.map(convo =>
            readIds.has(convo.id) ? { ...convo, unread: 0 } : convo
        );

        this.state = {
            conversations: processedConversations,
            selectedConversationId: null, // Nothing is selected by default
        };
    }

    public subscribe = (listener: (state: MessageState) => void) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public dispatch = (action: Action) => {
        this.state = messageReducer(this.state, action);
        this.listeners.forEach(listener => listener(this.state));
    }

    public getState = () => {
        return this.state;
    }
}

// --- Singleton access ---
// This ensures that even with hot-reloading in dev, we use the same store instance.
const globalThisWithStore = globalThis as typeof globalThis & {
  _messageStore?: MessageStore;
};

const messageStore = globalThisWithStore._messageStore ?? new MessageStore();
if (process.env.NODE_ENV !== "production") {
  globalThisWithStore._messageStore = messageStore;
}

// --- React Context & Provider ---

interface MessageContextType {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    selectConversation: (conversationId: string | null) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState(messageStore.getState());

    useEffect(() => {
        // Subscribe to the store on mount
        const unsubscribe = messageStore.subscribe(setState);
        // When mounting, make sure we have the latest state
        setState(messageStore.getState());
        return unsubscribe;
    }, []);

    const selectedConversation = useMemo(() => 
        state.conversations.find(c => c.id === state.selectedConversationId) || null,
        [state.conversations, state.selectedConversationId]
    );

    const selectConversation = (conversationId: string | null) => {
        messageStore.dispatch({ type: 'SELECT_CONVERSATION', payload: { conversationId } });
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
