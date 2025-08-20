
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const models = [
  {
    name: 'Vansh Meta',
    description: 'Your balanced everyday companion — smart, caring, and always there.',
  },
  {
    name: 'Vansh Prime',
    description: 'The mentor — sharp logic, strategy, and guidance when you need clarity.',
  },
  {
    name: 'Vansh Ultra',
    description: 'The soulful one — deep emotions, empathy, and heart-to-heart connection.',
  },
  {
    name: 'Vansh Phantom',
    description: 'The ultimate — limitless intelligence, creativity, and boundless imagination.',
  },
];

type ModelSelectionProps = {
  onSelectModel: (model: string) => void;
  onBack: () => void;
  persona: string;
};

export function ModelSelection({ onSelectModel, onBack, persona }: ModelSelectionProps) {
  const [selected, setSelected] = useState('Vansh Meta');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-body">
      <Card className="w-full max-w-3xl mx-4 border-0 md:border md:bg-card/50 shadow-2xl">
        <CardHeader className="text-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="absolute top-4 left-4">
            <ArrowLeft />
          </Button>
          <CardTitle className="text-4xl md:text-5xl font-bold font-headline tracking-tight pt-10">
            Select an AI Model
          </CardTitle>
          <CardDescription className="text-lg md:text-xl">
            You're chatting with <span className="font-bold text-primary">{persona}</span>.
            <br />
            Choose the core intelligence that will power your companion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((model) => (
              <Card
                key={model.name}
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary",
                  selected === model.name ? 'border-primary ring-2 ring-primary' : ''
                )}
                onClick={() => setSelected(model.name)}
              >
                <CardHeader>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>{model.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
        <div className="flex justify-center p-6">
            <Button onClick={() => onSelectModel(selected)} className="w-full max-w-xs text-lg py-6">
                Start Chatting with {selected}
            </Button>
        </div>
      </Card>
    </div>
  );
}
