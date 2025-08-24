
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Message } from '@/app/page';

export function useChatHistory(
  effectivePersona: string,
  view: 'persona' | 'chat',
  getGreeting: () => string
) {
  const [messages, setMessages] = useState<Message[]>([]);

  const startNewChat = useCallback(() => {
    if (!effectivePersona) return;
    const storageKey = `lumiMessages_${effectivePersona}`;
    try {
      const storedMessages = localStorage.getItem(storageKey);
      if (storedMessages) {
        const parsedMessages: Message[] = JSON.parse(storedMessages);
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages);
          return;
        }
      }
    } catch (error) {
        console.error("Could not parse messages from local storage", error);
        // If parsing fails, start fresh
    }

    // Start with a greeting if no history or parsing failed
    const greeting = getGreeting();
    setMessages([{ role: 'LUMI', content: greeting }]);
  }, [effectivePersona, getGreeting]);

  // Load messages when persona is selected
  useEffect(() => {
    if (view === 'chat' && effectivePersona) {
      startNewChat();
    }
  }, [view, effectivePersona, startNewChat]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0 && view === 'chat' && effectivePersona) {
      const storageKey = `lumiMessages_${effectivePersona}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, effectivePersona, view]);

  const userMessageCount = useMemo(() => {
    return messages.filter((m) => m.role === 'user').length;
  }, [messages]);

  return { messages, setMessages, userMessageCount };
}
