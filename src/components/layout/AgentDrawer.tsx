'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import sharedData from '@/data/shared.json';
import type { ScreenId } from '@/types';

interface Message {
  role: 'user' | 'agent';
  text: string;
}

const agentQs = sharedData.agentQuestions as Record<string, { question: string; answer: string }[]>;

export function AgentDrawer() {
  const { agentOpen, setAgentOpen, activeScreen } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScreenRef = useRef<ScreenId>(activeScreen);

  // Reset chat when screen changes
  useEffect(() => {
    if (prevScreenRef.current !== activeScreen) {
      setMessages([]);
      prevScreenRef.current = activeScreen;
    }
  }, [activeScreen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const questions = agentQs[activeScreen] ?? [];
  const askedQuestions = messages.filter(m => m.role === 'user').map(m => m.text);
  const availableQuestions = questions.filter(q => !askedQuestions.includes(q.question));

  const handleQuestion = (question: string) => {
    const qa = questions.find(q => q.question === question);
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'agent', text: qa?.answer ?? "Database connection is not available in this environment. Please use the suggested questions below to explore the pre-loaded analysis." },
      ]);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    handleQuestion(text);
  };

  if (!agentOpen) return null;

  return (
    <aside className="w-[400px] fixed right-0 top-0 z-50 shadow-2xl border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Sparkles size={16} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">TRU Agent</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Ask questions about your data</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setAgentOpen(false)} className="h-7 w-7">
          <X size={16} />
        </Button>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {/* Welcome */}
          {messages.length === 0 && (
            <div className="bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
              Hi! I can help you understand the data on this screen. Click a question below or type your own.
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  m.role === 'user'
                    ? 'bg-orange-500 text-white rounded-xl rounded-br-sm px-4 py-2.5 text-sm max-w-[85%]'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl rounded-bl-sm px-4 py-2.5 text-sm max-w-[85%]'
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {!isTyping && availableQuestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {availableQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleQuestion(q.question)}
                  className="text-left text-xs px-3 py-1.5 rounded-full border border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
                >
                  {q.question}
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-slate-700">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your data..."
          className="flex-1 text-sm"
        />
        <Button type="submit" size="icon" className="bg-orange-500 hover:bg-orange-600 text-white h-9 w-9 shrink-0">
          <Send size={16} />
        </Button>
      </form>
    </aside>
  );
}
