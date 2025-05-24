/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { marked } from 'marked';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface StreamPart {
  text: string;
}

interface PuterAI {
  chat: (
    input: string | { role: string; content: string }[],
    options: { model: string; stream?: boolean }
  ) => Promise<AsyncIterable<StreamPart>>;
}

interface Puter {
  ai: PuterAI;
  print: (content: string) => void;
}

declare global {
  interface Window {
    puter: Puter;
  }
}

const formatAIResponse = async (text: string): Promise<string> => {
  let formattedText = text
    .trim()
    .replace(/\n{3,}/g, '\n\n')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang = '', code) => {
      const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="bg-gray-800 p-3 rounded-lg"><code class="language-${lang}">${escapedCode}</code></pre>`;
    })
    .replace(/^-{3,}$/gm, '<hr class="border-gray-600">')
    .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold text-gray-200">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

  try {
    formattedText = (await marked.parse(formattedText)) as string;
  } catch (error) {
    console.warn('Failed to parse Markdown:', error);
  }

  // Only sanitize if in browser environment
  if (typeof window !== 'undefined') {
    const { default: DOMPurify } = await import('dompurify');
    return DOMPurify.sanitize(formattedText);
  }
  return formattedText; // Return unsanitized on server (safe fallback)
};

const formatUserInput = (text: string): string => {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className={`mb-4 ${role === 'user' ? 'text-right' : 'text-left'}`}
  >
    <div
      className={`inline-block rounded-lg p-4 max-w-[90%] sm:max-w-[80%] break-words ${
        role === 'user' ? 'bg-blue-600/80 text-white' : 'bg-gray-700/80 text-gray-200'
      } shadow-md`}
    >
      <strong className={`block mb-1 ${role === 'user' ? 'text-blue-200' : 'text-green-400'}`}>
        {role === 'user' ? 'You' : 'Grok'}:
      </strong>
      <div
        className="prose prose-invert max-w-none text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  </motion.div>
);

export default function AIPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: '',
    },
  ]);

  // Initialize the assistant message with formatAIResponse
  useEffect(() => {
    const initializeMessages = async () => {
      const initialMessage = await formatAIResponse(
        "Hi there! I'm Grok, your witty AI assistant. I'm here to help you with anything you'd like to know about. What's on your mind?"
      );
      setMessages([{ role: 'assistant', content: initialMessage }]);
    };
    initializeMessages();
  }, []);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const askQuestion = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, content: formatUserInput(input) };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await window.puter.ai.chat(input, {
        model: 'x-ai/grok-3-beta',
        stream: true,
      });

      let assistantResponse = '';
      for await (const part of response) {
        assistantResponse += part.text;
        const formattedResponse = await formatAIResponse(assistantResponse);
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            updatedMessages[updatedMessages.length - 1] = {
              role: 'assistant',
              content: formattedResponse,
            };
          } else {
            updatedMessages.push({ role: 'assistant', content: formattedResponse });
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Error fetching Grok response:', error);
      const errorMessage = await formatAIResponse('Oops, something went wrong. Please try again!');
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isLoading) {
      askQuestion();
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
    tap: { scale: 0.95 },
    loading: { opacity: 0.7, scale: 1 },
  };

  const iconVariants = {
    initial: { rotate: 0, scale: 1 },
    hover: { rotate: [0, 10, -10, 0], scale: 1.1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 font-sans text-gray-100 transition-colors duration-500">
      <div className="relative overflow-hidden">
        {/* Background effects for visual appeal */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute h-64 w-64 sm:h-96 sm:w-96 animate-pulse rounded-full bg-blue-500/20 blur-3xl"
            style={{ top: '10%', left: '10%' }}
          />
          <div
            className="absolute h-64 w-64 sm:h-96 sm:w-96 animate-pulse rounded-full bg-purple-500/20 blur-3xl delay-1000"
            style={{ bottom: '20%', right: '15%' }}
          />
        </div>

        <Navbar />

        {/* Main chat section with adjusted padding-top */}
        <section className="relative flex min-h-screen items-center justify-center px-4 pt-24 sm:pt-28 md:pt-32 lg:pt-36">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mx-auto w-full max-w-4xl"
          >
            <h1 className="mb-6 bg-clip-text text-center text-3xl font-bold text-transparent sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-blue-400 to-purple-500">
              Chat with Grok
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-8 text-center text-base sm:text-lg md:text-xl text-gray-300"
            >
              Ask Grok anything and get witty, insightful responses!
            </motion.p>
            <div className="rounded-xl border border-blue-500/30 bg-gray-800/40 p-4 sm:p-6 shadow-lg backdrop-blur-md">
              <div className="mb-4 h-[50vh] sm:h-[60vh] overflow-y-auto rounded-lg border border-blue-500/30 bg-gray-900/50 p-4 scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-gray-900/50">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <ChatMessage key={index} role={message.role} content={message.content} />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask Grok anything... (Press Ctrl+Enter to send)"
                  className="flex-grow rounded-lg border border-blue-500/30 bg-gray-900/50 p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                  disabled={isLoading}
                  aria-label="Chat input"
                />
                <motion.button
                  onClick={askQuestion}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  animate={isLoading ? 'loading' : 'initial'}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 rounded-lg border border-green-500/30 bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2 sm:py-3 text-white shadow-md transition-all duration-300 hover:from-green-500 hover:to-teal-500 hover:shadow-xl"
                  aria-label="Send message"
                >
                  <motion.span variants={iconVariants}>
                    <Send size={18} />
                  </motion.span>
                  <span className="font-semibold hidden sm:inline">Ask</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>
        <Footer />
      </div>
    </div>
  );
}