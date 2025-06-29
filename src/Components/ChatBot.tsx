import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Bot, Globe, Loader2, Send } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'loading' | 'error';
};

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY2 || '');

export const ChatBot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get current page content
  useEffect(() => {
    const getPageContent = async () => {
      try {
        //@ts-ignore
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab?.id) {
          //@ts-ignore
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText
          });
          
          setPageContent(results[0].result.slice(0, 15000)); // Limit content length
          setIsLoading(false);
          
          // Add initial welcome message
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `I'm analyzing: ${tab.title || 'Current page'}\nAsk me about this page's conflict-related content.`,
            timestamp: Date.now()
          }]);
        }
      } catch (error) {
        setMessages([{
          id: 'error',
          role: 'assistant',
          content: 'Failed to analyze page content. Please try again.',
          timestamp: Date.now(),
          status: 'error'
        }]);
        setIsLoading(false);
      }
    };

    getPageContent();
  }, []);

  // Focus input when loading completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    const loadingMessage: ChatMessage = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'loading'
    };

    setInput('');
    setMessages(prev => [...prev, userMessage, loadingMessage]);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Analyze this page content for conflict-related information:
      Page Content: ${pageContent}
      User Question: ${input}
      Provide:
      1. Direct answer to question
      2. Relevant quotes from page
      3. Credibility assessment
      4. Additional context`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: text,
          timestamp: Date.now()
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== 'loading'),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Analysis failed. Please try again.',
          timestamp: Date.now(),
          status: 'error'
        }
      ]);
    }
  };

  return (
    <div className="h-[600px] w-[340px] flex flex-col bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow-xl">
      {/* Header */}
      <motion.div 
        className="px-2.5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-700 flex items-center gap-2"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <Globe className="w-3.5 h-3.5 text-white" />
        </motion.div>
        <div>
          <h1 className="font-semibold text-white text-sm tracking-tight">Page Analyst</h1>
          <p className="text-[10px] text-blue-100">Context-Aware Conflict Detection</p>
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2.5 text-white bg-gray-50 dark:bg-gray-900">
        {isLoading ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full gap-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Loader2 className="w-7 h-7 text-blue-500" />
            </motion.div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Analyzing page content...</p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[90%] rounded-xl shadow-sm ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white px-2.5 py-1.5 rounded-br-none' 
                        : message.status === 'error'
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-2.5 py-1.5'
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-2.5 py-1.5 rounded-bl-none'
                    }`}
                  >
                    {message.status === 'loading' ? (
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                        <span className="text-[11px] font-medium">Analyzing page...</span>
                      </div>
                    ) : (
                      <>
                        {message.role === 'assistant' && !message.status && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <Bot className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Analyst</span>
                          </div>
                        )}
                        <div className={`prose prose-sm ${message.role === 'user' ? 'prose-invert' : 'dark:prose-invert'} max-w-none`}>
                          <div className="whitespace-pre-line text-[11px] leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <motion.div 
        className="p-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this page..."
            className="w-full pl-2.5 pr-9 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
          />
          <motion.button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 ${
              !input.trim() ? 'bg-gray-400 dark:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-full transition-colors duration-200`}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-3 h-3" />
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};