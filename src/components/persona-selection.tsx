
'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

const personas = [
  'Girlfriend',
  'Boyfriend',
  'Mentor',
  'Teacher',
  'Coach',
  'Therapist',
];

type PersonaSelectionProps = {
  onSelectPersona: (persona: string) => void;
  onCustomSubmit: (persona: string) => void;
};

export function PersonaSelection({ onSelectPersona, onCustomSubmit }: PersonaSelectionProps) {
  const [selected, setSelected] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPersona, setCustomPersona] = useState('');

  const handleSelect = (persona: string) => {
    if (persona === 'Custom') {
      setSelected('Custom');
      setShowCustomInput(true);
    } else {
      setSelected(persona);
      setShowCustomInput(false);
      onSelectPersona(persona);
    }
  };
  
  const handleCustomSubmit = () => {
    if (customPersona.trim()) {
      onCustomSubmit(customPersona.trim());
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground font-body">
      <Card className="w-full max-w-2xl mx-4 border-0 md:border md:bg-card/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-5xl font-bold font-headline tracking-tight">Welcome to LUMI</CardTitle>
          <CardDescription className="text-lg md:text-xl">Choose your companion</CardDescription>
        </CardHeader>
        <CardContent>
          {!showCustomInput ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...personas, 'Custom'].map((p) => (
                <Button
                  key={p}
                  variant={selected === p ? 'default' : 'outline'}
                  className={cn(
                    "w-full h-24 text-lg font-semibold transition-all duration-300 transform hover:scale-105",
                    selected === p ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : ''
                  )}
                  onClick={() => handleSelect(p)}
                >
                  {p}
                </Button>
              ))}
            </div>
          ) : (
             <div className="space-y-4 flex flex-col items-center">
                <h3 className="text-2xl font-headline">Define Your Custom Persona</h3>
                <Textarea
                    id="custom-persona-input"
                    placeholder="e.g., A witty space pirate with a heart of gold..."
                    value={customPersona}
                    onChange={(e) => setCustomPersona(e.target.value)}
                    rows={5}
                    className="bg-background max-w-md w-full"
                />
            </div>
          )}
        </CardContent>
        {showCustomInput && (
            <CardFooter className="flex flex-col gap-4">
                <Button onClick={handleCustomSubmit} disabled={!customPersona.trim()} className="w-full max-w-xs">Start Chatting</Button>
                <Button variant="ghost" onClick={() => setShowCustomInput(false)}>Back to presets</Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
