
'use client';

import { useState, useEffect } from 'react';
import { ChatPanel } from '@/components/chat-panel';
import { getLumiResponse, getExpressiveSuggestions } from './actions';
import { useToast } from "@/hooks/use-toast";
import { PersonaSelection } from '@/components/persona-selection';

export type Message = {
  role: 'user' | 'LUMI';
  content: string;
};

export default function Home() {
  const { toast } = useToast();
  const [persona, setPersona] = useState('');
  const [customPersona, setCustomPersona] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emojiSuggestions, setEmojiSuggestions] = useState<string[]>([]);
  const [personaSelected, setPersonaSelected] = useState(false);

  useEffect(() => {
    const storedMessages = localStorage.getItem(`lumiMessages_${persona}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
        setMessages([{ role: 'LUMI', content: "Hey... I'm Lumi. How are you feeling right now?" }]);
    }
  }, [persona]);

  useEffect(() => {
    if (messages.length > 0 && persona) {
      localStorage.setItem(`lumiMessages_${persona}`, JSON.stringify(messages));
    }
  }, [messages, persona]);

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

      // Don't call for emoji suggestions if the response is the default error message
      if (lumiResult.response !== "Oh, my heart... I'm feeling a little overwhelmed right now. Can we talk about something else?") {
        const suggestionsResult = await getExpressiveSuggestions(lumiResult.response);
        if (suggestionsResult.emojiSuggestions) {
            setEmojiSuggestions(suggestionsResult.emojiSuggestions);
        }
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

  const handlePersonaSelection = (selectedPersona: string) => {
    setPersona(selectedPersona);
    setPersonaSelected(true);
  };

  if (!personaSelected) {
    return (
      <PersonaSelection 
        onSelectPersona={handlePersonaSelection} 
        customPersona={customPersona}
        setCustomPersona={setCustomPersona}
      />
    );
  }

  return (
    <div className="flex h-screen max-h-screen bg-background text-foreground font-body overflow-hidden">
      <main className="flex-1 flex flex-col h-full">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          emojiSuggestions={emojiSuggestions}
          sendMessage={handleSendMessage}
          persona={persona}
          onBack={() => {
            setPersonaSelected(false);
            setMessages([{ role: 'LUMI', content: "Hey... I'm Lumi. How are you feeling right now?" }]);
          }}
        />
      </main>
    </div>
  );
}
