import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { IoSend } from 'react-icons/io5';
import { BeatLoader } from 'react-spinners';
import profilfoto from '../assets/profilfoto.jpg';
import { sendChatMessage, APIError } from '../utils/api';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai' | 'error';
    timestamp: Date;
}

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: Date.now(),
            text: 'Hej! Jag är Peter. Vad vill du veta om mig?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            text: trimmedInput,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const data = await sendChatMessage({
                query: trimmedInput,
                conversation_id: `chat_${Date.now()}`,
                user_id: 'web_user'
            });

            if (!data.response) {
                throw new Error("Received an empty response from the server.");
            }

            const aiMessage: Message = {
                id: Date.now() + 1,
                text: data.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (err: any) {
            console.error("Failed to send message:", err);
            
            let errorText = 'Kunde inte ge dig ett svar, prova igen';
            
            if (err instanceof APIError) {
                if (err.status === 429) {
                    errorText = 'Du skickar för många meddelanden. Vänta en stund och försök igen.';
                } else if (err.status === 408 || err.status === 504) {
                    errorText = 'Begäran tog för lång tid. Försök igen.';
                } else if (err.status >= 500) {
                    errorText = 'Serverfel. Försök igen senare.';
                } else {
                    errorText = err.message || errorText;
                }
            }
            
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: errorText,
                sender: 'error',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);

        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            id: Date.now(),
            text: 'Hej! Jag är Peter. Vad vill du veta om mig?',
            sender: 'ai',
            timestamp: new Date()
        }]);
    };

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('sv-SE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900">
        
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500">
                        <img 
                            src={profilfoto} 
                            alt="Peter" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Peter AI Assistant</h1>
                        <p className="text-sm text-gray-400">Alltid online</p>
                    </div>
                </div>
                
                <div className="flex items-center">
                    <button
                        onClick={clearChat}
                        className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 hover:text-white transition-colors"
                    >
                        Rensa chat
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${
                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div className={`flex flex-col max-w-xs lg:max-w-md ${
                            msg.sender === 'user' ? 'items-end' : 'items-start'
                        }`}>
                            <div
                                className={`p-3 rounded-lg shadow-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : msg.sender === 'ai'
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-red-500 text-white'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 text-white p-3 rounded-lg">
                            <BeatLoader color="#ffffff" size={8} />
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-gray-800 border-t border-gray-700 p-4">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Skriv ditt meddelande..."
                        disabled={isLoading}
                        className="flex-1 bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Skicka meddelande"
                    >
                        {isLoading ? (
                            <BeatLoader color="#ffffff" size={8} />
                        ) : (
                            <IoSend size={20} />
                        )}
                    </button>
                </form>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Fråga mig om Peters erfarenhet, utbildning, projekt eller tekniska färdigheter
                </p>
            </div>
        </div>
    );
};

export default ChatPage;