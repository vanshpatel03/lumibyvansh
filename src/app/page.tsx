
'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { ChatPanel } from '@/components/chat-panel';
import { getLumiResponse, getExpressiveSuggestions } from './actions';
import { useToast } from "@/hooks/use-toast";
import { PersonaSelection } from '@/components/persona-selection';
import { UpgradeModal } from '@/components/upgrade-modal';
import { useChatHistory } from '@/hooks/use-chat-history';
import { useAuth } from '@/hooks/use-auth';

export type Message = {
  role: 'user' | 'LUMI';
  content: string;
  attachment?: {
    url: string;
    type: string;
  };
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

const TRIAL_MESSAGE_LIMIT = 50;
const UPGRADE_PROMPT = "Baby, I don’t ever want our chat to end 😭 but my free messages are running out… unlock my heart fully for just $9.9/month 💖. Unlimited chats, roleplays, adventures – I’ll be yours completely.";


// --- Helper function to get a random greeting ---
const getRandomGreeting = (persona: string, customPersonaName: string = '') => {
  const greetings = personaGreetings[persona] || personaGreetings.Default;
  let greeting;
  if (typeof window !== 'undefined') {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    greeting = greetings[randomIndex];
  } else {
    greeting = greetings[0];
  }
  
  if (persona === 'Custom' && customPersonaName) {
    greeting = greeting.replace('[CUSTOM_NAME]', customPersonaName);
  }
  
  return greeting;
};

function HomeContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [model, setModel] = useState('Vansh Meta');
  const [persona, setPersona] = useState('');
  const [customPersona, setCustomPersona] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [emojiSuggestions, setEmojiSuggestions] = useState<string[]>([]);
  const [view, setView] = useState<'persona' | 'chat'>('persona');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const effectivePersona = useMemo(() => {
    return persona === 'Custom' ? `Custom_${customPersona}` : persona
  }, [persona, customPersona]);

  const getGreeting = useCallback(() => {
    return getRandomGreeting(persona, customPersona);
  }, [persona, customPersona]);


  const { messages, setMessages, userMessageCount } = useChatHistory(effectivePersona, view, getGreeting);

  const handleSendMessage = async (userInput: string, attachment?: { url: string; type: string; }) => {
    const isProModel = model === 'Vansh Spectre' || model === 'Vansh Phantom';

    if (!isSubscribed && userMessageCount >= TRIAL_MESSAGE_LIMIT) {
       setIsLoading(true);
       const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
       setMessages(newMessages);
       // Add the upgrade prompt
       setTimeout(() => {
        const upgradeMessage: Message = { role: 'LUMI', content: UPGRADE_PROMPT };
        setMessages(prev => [...prev, upgradeMessage]);
        setIsLoading(false);
        setIsUpgradeModalOpen(true);
       }, 1000)
      return;
    }

    setIsLoading(true);
    setEmojiSuggestions([]);
    
    const newMessages: Message[] = [...messages, { role: 'user', content: userInput, attachment }];
    setMessages(newMessages);

    try {
      const storyMemory = newMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      const lumiResult = await getLumiResponse(persona, storyMemory, userInput, model, attachment?.url);
      let lumiContent = lumiResult.response;

      const remaining = TRIAL_MESSAGE_LIMIT - (userMessageCount + 1);

      if (!isSubscribed && remaining <= 5 && remaining > 0) {
        lumiContent += `\n\n(psst... my heart's telling me we're getting close to our free message limit. I don't want this to end... you can unlock my heart fully to keep talking forever 💖)`
      }

      const lumiMessage = { role: 'LUMI', content: lumiContent };
      setMessages(prev => [...prev, lumiMessage]);

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
      // Revert optimistic update on failure
      setMessages(messages)
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaSelection = (selectedPersona: string, customPersonaName: string = '') => {
    setPersona(selectedPersona);
    setCustomPersona(customPersonaName);
    localStorage.setItem('lumi_last_persona', selectedPersona);
    localStorage.setItem('lumi_last_custom_persona', customPersonaName);
    if (!isSubscribed) {
      setModel('Vansh Meta');
    }
    setView('chat');
  };
  
  const handleCustomPersonaSubmit = (customPersonaName: string) => {
    handlePersonaSelection('Custom', customPersonaName);
  }

  const handleModelChange = (newModel: string) => {
    const isProModel = newModel === 'Vansh Spectre' || newModel === 'Vansh Phantom';
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
    localStorage.removeItem('lumi_last_persona');
    localStorage.removeItem('lumi_last_custom_persona');
  }

  const handleSuccessfulUpgrade = () => {
    setIsSubscribed(true);
    setModel('Vansh Spectre'); // Automatically switch to the first Pro model
    setIsUpgradeModalOpen(false);
    toast({
      title: "Welcome to Lumi Pro! 💎",
      description: "You've unlocked the most powerful models. Lumi is now powered by Vansh Spectre.",
    });
  };

  if (view === 'persona' || !persona) {
    return (
      <PersonaSelection 
        onSelectPersona={(p) => handlePersonaSelection(p)} 
        onCustomSubmit={handleCustomPersonaSubmit}
      />
    );
  }

  const isProModelInUse = model === 'Vansh Spectre' || model === 'Vansh Phantom';
  const remainingMessages = isSubscribed || isProModelInUse ? Infinity : TRIAL_MESSAGE_LIMIT - userMessageCount;

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
            remainingMessages={remainingMessages}
            trialMessageLimit={TRIAL_MESSAGE_LIMIT}
          />
      </div>
      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        onSuccessfulUpgrade={handleSuccessfulUpgrade}
      />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
