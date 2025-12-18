import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '@/types/poll';

import { useToast } from '@/hooks/use-toast';

interface ChatProps {
    pollId: string;
    senderName: string;
    senderId: string;
}

export const Chat = ({ pollId, senderName, senderId }: ChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        // Fetch existing messages
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .eq('poll_id', pollId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data as unknown as Message[]);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `poll_id=eq.${pollId}`,
                },
                (payload) => {
                    const newMsg = payload.new as Message;
                    setMessages((prev) => [...prev, newMsg]);
                    if (!isOpen && newMsg.sender_id !== senderId) {
                        setUnreadCount((prev) => prev + 1);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [pollId, isOpen, senderId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await supabase.from('messages').insert({
                poll_id: pollId,
                sender_name: senderName,
                sender_id: senderId,
                content: newMessage.trim(),
            });
            setNewMessage('');
        } catch (error: any) {
            console.error('Error sending message:', error);
            toast({
                title: 'Failed to send message',
                description: error.message || 'Unknown error occurred',
                variant: 'destructive'
            });
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setUnreadCount(0);
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <Button
                onClick={toggleChat}
                className={cn(
                    "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-300",
                    isOpen ? "rotate-90 scale-0 opacity-0" : "scale-100 opacity-100"
                )}
                size="icon"
            >
                <MessageCircle className="w-8 h-8" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </Button>

            {/* Chat Panel */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-card rounded-2xl shadow-2xl border border-border z-50 flex flex-col transition-all duration-300 origin-bottom-right",
                    isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Live Chat</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                            No messages yet. Say hello!
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === senderId;
                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex flex-col max-w-[80%]",
                                        isMe ? "ml-auto items-end" : "items-start"
                                    )}
                                >
                                    <span className="text-[10px] text-muted-foreground mb-1 px-1">
                                        {msg.sender_name}
                                    </span>
                                    <div
                                        className={cn(
                                            "px-3 py-2 rounded-2xl text-sm break-words",
                                            isMe
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-muted text-foreground rounded-bl-none"
                                        )}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </>
    );
};
