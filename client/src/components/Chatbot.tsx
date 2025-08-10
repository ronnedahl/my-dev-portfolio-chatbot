import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { IoSend } from 'react-icons/io5';
import { BeatLoader } from 'react-spinners';
import { FaTimes } from 'react-icons/fa'; // För stäng-knappen
import profilfoto from '../assets/profilfoto.jpg'; // Relativ sökväg till din bild

// --- Types ---
interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai' | 'error';
}

// --- Component ---
const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        // Initial AI message
        { id: Date.now(), text: 'Hej! Jag är Peter. Vad vill du veta om mig?', sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false); // För att visa/dölja chatboten
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    // --- Auto-scroll Effect ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- Send Message Handler ---
    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            text: trimmedInput,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        // setError(null);

        try {
            const response = await fetch(`${apiBaseUrl}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    query: trimmedInput,
                    conversation_id: 'frontend_chat',
                    user_id: 'web_user'
                }),
            });

            if (!response.ok) {
                let errorMsg = `Error: ${response.status} ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (jsonError) {
                    // Ignore if response body isn't valid JSON
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (!data.response) {
                throw new Error("Received an empty response from the server.");
            }

            const aiMessage: Message = {
                id: Date.now() + 1,
                text: data.response,
                sender: 'ai',
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (err: any) {
            console.error("Failed to send message:", err);
            // setError(err.message || 'Failed to connect to the chat service. Please try again later.');
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: err.message || 'Kunde inte ge dig ett svar, prova igen',
                sender: 'error',
            };
            setMessages(prev => [...prev, errorMessage]);

        } finally {
            setIsLoading(false);
        }
    };

    // --- Toggle Chat Visibility ---
    const toggleChatVisibility = () => {
        setIsVisible(!isVisible);
    };

    // --- Render ---
    return (
        <>
            {/* Chatbot Toggle Button */}
            <button 
                onClick={toggleChatVisibility}
                className={`fixed bottom-20 sm:bottom-4 md:bottom-4 right-4 rounded-full shadow-lg hover:opacity-90 transition-all z-50 p-0 overflow-hidden w-14 h-14 flex items-center justify-center border border-white ${!isVisible ? 'animate-pulse' : ''}`}
                aria-label={isVisible ? "Dölj chat" : "Visa chat"}
                style={{ boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.5), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            >
                <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                        src={profilfoto} 
                        alt="Chat bot" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </button>

            {/* Chat Window */}
            {isVisible && (
                <div className="fixed w-full h-full bottom-0 right-0 sm:bottom-20 sm:right-6 sm:w-[90vw] sm:max-w-sm sm:h-[65vh] sm:max-h-[500px] sm:rounded-lg
                md:bottom-20 md:right-8 md:w-[90vw] md:max-w-sm md:h-[65vh] md:max-h-[500px] md:rounded-lg
                bg-gray-900 shadow-xl flex flex-col overflow-hidden z-40 border-0 sm:border sm:border-gray-700 transition-all">
                    {/* Header */}
                    <div className="bg-blue-600 text-white font-bold p-3 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center">
                            <div className="mr-2 w-6 h-6 rounded-full overflow-hidden">
                                <img 
                                    src={profilfoto} 
                                    alt="Chat bot" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            AI Assistant
                        </div>
                        <button 
                            onClick={toggleChatVisibility} 
                            className="text-white hover:text-gray-200 p-2"
                            aria-label="Stäng chat"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    {/* Message Area */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-800">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${
                                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                <div
                                    className={`p-3 rounded-lg max-w-[85%] text-sm md:text-base ${
                                        msg.sender === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : msg.sender === 'ai'
                                            ? 'bg-gray-700 text-white'
                                            : 'bg-red-500 text-white'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-700 text-white p-3 rounded-lg">
                                    <BeatLoader color="#ffffff" size={8} />
                                </div>
                            </div>
                        )}
                        {/* Invisible div to mark the end for scrolling */}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-700 bg-gray-900 flex-shrink-0">
                        <form onSubmit={handleSend} className="flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Skriv ditt meddelande..."
                                disabled={isLoading}
                                className="flex-grow bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-l-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                aria-label="Send message"
                                disabled={isLoading || !inputValue.trim()}
                                className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 h-[42px] flex items-center justify-center w-12 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <BeatLoader color="#ffffff" size={8} />
                                ) : (
                                    <IoSend size={18} />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWindow;