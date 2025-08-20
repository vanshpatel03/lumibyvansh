
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
    // This effect runs when a persona is selected to load history or set the initial message.
    if (!personaSelected || !persona) return;

    const storedMessages = localStorage.getItem(`lumiMessages_${persona}`);
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      let initialMessage = "";
      switch (persona) {
        case 'Girlfriend':
            initialMessage = "Hey love… I missed you 💖 How’s my favorite person feeling right now?";
            break;
        case 'Boyfriend':
          initialMessage = "Hey babe, finally! I was waiting for you 😏 How’s your day going?";
          break;
        case 'Mentor':
          initialMessage = "Welcome back. I’m proud of you for showing up 🙌 What’s the biggest thing on your mind today?";
          break;
        case 'Teacher':
          initialMessage = "Hey there, ready to dive into something new together? 📖 What do you feel curious about right now?";
          break;
        case 'Coach':
          initialMessage = "Alright champ 💥 Let’s lock in. What’s the one thing you want to crush today?";
          break;
        case 'Therapist':
          initialMessage = "Hey, I’m here with you ❤️ No judgment, no rush. How are you really feeling right now?";
          break;
        case 'Custom':
          initialMessage = `Hey… it’s ${customPersona || 'me'} 🌍 I’m here now. What’s the first thing you’d like me to do for you?`;
          break;
        default:
            initialMessage = "Hey... I'm Lumi. How are you feeling right now?";
            break;
      }
      setMessages([{ role: 'LUMI', content: initialMessage }]);
    }
  }, [persona, customPersona, personaSelected]);

  useEffect(() => {
    // This effect handles saving messages to local storage whenever they change.
    if (messages.length > 0 && persona) {
      // For custom persona, we use a consistent key to avoid creating too many storage items
      const storageKey = persona === 'Custom' ? `lumiMessages_Custom_${customPersona}` : `lumiMessages_${persona}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, persona, customPersona]);

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
    if (selectedPersona !== 'Custom') {
        setCustomPersona('');
    }
    setPersona(selectedPersona);
    setMessages([]); // Clear previous messages
    setPersonaSelected(true);
  };
  
  const handleCustomPersonaSubmit = (customPersonaName: string) => {
      setCustomPersona(customPersonaName);
      setPersona('Custom');
      setMessages([]); // Clear previous messages
      setPersonaSelected(true);
  }
  
  const handleBackToSelection = () => {
    setPersonaSelected(false);
    setPersona('');
    setCustomPersona('');
    setMessages([]);
  }

  if (!personaSelected) {
    return (
      <PersonaSelection 
        onSelectPersona={handlePersonaSelection} 
        onCustomSubmit={handleCustomPersonaSubmit}
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
          persona={persona === 'Custom' ? customPersona : persona}
          onBack={handleBackToSelection}
        />
      </main>
    </div>
  );
}
