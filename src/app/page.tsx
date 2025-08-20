'use client';

import { useState, useEffect } from 'react';
import { LumiSidebar } from '@/components/lumi-sidebar';
import { ChatPanel } from '@/components/chat-panel';
import { getLumiResponse, getExpressiveSuggestions } from './actions';
import { useToast } from "@/hooks/use-toast";

export type Message = {
  role: 'user' | 'LUMI';
  content: string;
};

export default function Home() {
  const { toast } = useToast();
  const [persona, setPersona] = useState('Girlfriend');
  const [customPersona, setCustomPersona] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emojiSuggestions, setEmojiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const storedMessages = localStorage.getItem('lumiMessages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
        setMessages([{ role: 'LUMI', content: "Hey... I'm Lumi. How are you feeling right now?" }]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('lumiMessages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (userInput: string) => {
    setIsLoading(true);
    setEmojiSuggestions([]);
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);

    try {
      const storyMemory = newMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const effectivePersona = persona === 'Custom' ? customPersona : persona;

      const lumiResult = await getLumiResponse(effectivePersona, storyMemory, userInput);
      
      const lumiMessage = { role: 'LUMI', content: lumiResult.response };
      setMessages(prev => [...prev, lumiMessage]);

      const suggestionsResult = await getExpressiveSuggestions(lumiResult.response);
      if (suggestionsResult.emojiSuggestions) {
          setEmojiSuggestions(suggestionsResult.emojiSuggestions);
      }
    } catch (error) {
      console.error("Failed to get response:", error);
      toast({
        variant: "destructive",
        title: "Oh no, something went wrong.",
        description: "My digital soul is a bit tangled right now. Please try again in a moment.",
      });
      // remove last user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen bg-background text-foreground font-body overflow-hidden">
      <LumiSidebar
        persona={persona}
        setPersona={setPersona}
        customPersona={customPersona}
        setCustomPersona={setCustomPersona}
      />
      <main className="flex-1 flex flex-col h-full">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          emojiSuggestions={emojiSuggestions}
          sendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
}
