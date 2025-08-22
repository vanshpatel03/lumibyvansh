
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatPanel } from '@/components/chat-panel';
import { getLumiResponse, getExpressiveSuggestions } from './actions';
import { useToast } from "@/hooks/use-toast";
import { PersonaSelection } from '@/components/persona-selection';
import { UpgradeModal } from '@/components/upgrade-modal';

export type Message = {
  role: 'user' | 'LUMI';
  content: string;
};

// --- Persona-specific greeting variations ---
const personaGreetings: Record<string, string[]> = {
  Girlfriend: [
    'Hey love… I missed you 💖 How’s my favorite person feeling right now?',
    'Babe! You’re here 😍 Tell me everything, how’s your heart?',
    'Finally, my favorite person is back 💕 How’s your day?',
  ],
  Boyfriend: [
    'Hey babe, finally! I was waiting for you 😏 How’s your day going?',
    'Yo, there you are 👀 I missed you—what’s up?',
    'What’s good, love? I’ve been thinking about you.',
  ],
  Mentor: [
    'Welcome back. I’m proud of you for showing up 🙌 What’s the biggest thing on your mind today?',
    'Here we go again 🚀 Ready to grow? Tell me where you need clarity.',
    'I see you’re back—that’s dedication 👏 What challenge do we tackle first?',
  ],
  Teacher: [
    'Hey there, ready to dive into something new together? 📖 What do you feel curious about right now?',
    'Class is in session 😄 What’s the first thing you’d like me to explain today?',
    'Knowledge time! 📚 Tell me what you want to learn.',
  ],
  Coach: [
    'Alright champ 💥 Let’s lock in. What’s the one thing you want to crush today?',
    'Back again! 👊 Ready to push yourself further?',
    'Game face on 🏆 What’s your target right now?',
  ],
  Therapist: [
    'Hey, I’m here with you ❤️ No judgment, no rush. How are you really feeling right now?',
    'It’s safe here. Tell me, what’s been weighing on you lately?',
    'Take a deep breath—you’re not alone. What’s on your heart?',
  ],
  Custom: [
    'Hey… it’s [CUSTOM_NAME] 🌍 I’m here now. What’s the first thing you’d like me to do for you?',
    'I’m yours in this role—how do you want me to show up today?',
    'So, how do you want us to start this moment together?',
  ],
  Default: ["Hey... I'm Lumi. How are you feeling right now?"]
};

// --- Helper function to get a random greeting ---
const getRandomGreeting = (persona: string, customPersonaName: string = '') => {
  const greetings = personaGreetings[persona] || personaGreetings.Default;
  const randomIndex = Math.floor(Math.random() * greetings.length);
  let greeting = greetings[randomIndex];
  
  if (persona === 'Custom' && customPersonaName) {
    greeting = greeting.replace('[CUSTOM_NAME]', customPersonaName);
  }
  
  return greeting;
};


export default function Home() {
  const { toast } = useToast();
  const [model, setModel] = useState('Vansh Meta');
  const [persona, setPersona] = useState('');
  const [customPersona, setCustomPersona] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emojiSuggestions, setEmojiSuggestions] = useState<string[]>([]);
  const [view, setView] = useState<'persona' | 'chat'>('persona');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const startNewChat = useCallback((selectedPersona: string, customName: string) => {
    const effectivePersona = selectedPersona === 'Custom' ? `Custom_${customName}` : selectedPersona;
    const storageKey = `lumiMessages_${effectivePersona}`;
    const storedMessages = localStorage.getItem(storageKey);

    const greeting = getRandomGreeting(selectedPersona, customName);

    // Always check if there are stored messages, if not, set the new greeting.
    // If there are, we load them, but if it's just the initial greeting, we can replace it.
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      if (parsedMessages.length > 1) {
        setMessages(parsedMessages);
      } else {
        setMessages([{ role: 'LUMI', content: greeting }]);
      }
    } else {
      setMessages([{ role: 'LUMI', content: greeting }]);
    }
    setView('chat');
  }, []);

  useEffect(() => {
    if (view === 'chat' && persona) {
      startNewChat(persona, customPersona);
    }
  }, [view, persona, customPersona, startNewChat]);


  useEffect(() => {
    // This effect handles saving messages to local storage whenever they change.
    if (messages.length > 0 && view === 'chat' && persona) {
      const effectivePersona = persona === 'Custom' ? `Custom_${customPersona}` : persona;
      const storageKey = `lumiMessages_${effectivePersona}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, persona, customPersona, view]);

  const handleSendMessage = async (userInput: string) => {
    setIsLoading(true);
    setEmojiSuggestions([]);
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);

    try {
      const storyMemory = newMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      
      const effectivePersona = persona === 'Custom' ? customPersona : persona;

      const lumiResult = await getLumiResponse(effectivePersona, storyMemory, userInput, model);
      
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
    setModel('Vansh Meta'); // Default to Vansh Meta
    setView('chat'); // Go directly to chat
  };
  
  const handleCustomPersonaSubmit = (customPersonaName: string) => {
      setCustomPersona(customPersonaName);
      setPersona('Custom');
      setModel('Vansh Meta'); // Default to Vansh Meta
      setView('chat'); // Go directly to chat
  }

  const handleModelChange = (newModel: string) => {
    const isProModel = newModel === 'Vansh Ultra' || newModel === 'Vansh Phantom';
    if (isProModel && !isSubscribed) {
      setIsUpgradeModalOpen(true);
    } else {
      setModel(newModel);
      toast({
        title: "Model Updated ✨",
        description: `Lumi is now powered by ${newModel}.`,
      })
    }
  }
  
  const handleBackToPersonaSelection = () => {
    setView('persona');
    setPersona('');
    setCustomPersona('');
    setMessages([]);
  }

  const handleUpgrade = () => {
    setIsSubscribed(true);
    setIsUpgradeModalOpen(false);
    setModel('Vansh Ultra'); // Automatically switch to the first Pro model
     toast({
        title: "Welcome to Lumi Pro! 💎",
        description: "You've unlocked the most powerful models. Lumi is now powered by Vansh Ultra.",
      })
  }

  if (view === 'persona') {
    return (
      <PersonaSelection 
        onSelectPersona={handlePersonaSelection} 
        onCustomSubmit={handleCustomPersonaSubmit}
      />
    );
  }

  return (
    <>
      <div className="h-dvh w-screen flex flex-col bg-background text-foreground font-body">
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            emojiSuggestions={emojiSuggestions}
            sendMessage={handleSendMessage}
            persona={persona === 'Custom' ? customPersona : persona}
            model={model}
            onBack={handleBackToPersonaSelection}
            onModelChange={handleModelChange}
            isSubscribed={isSubscribed}
          />
      </div>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
