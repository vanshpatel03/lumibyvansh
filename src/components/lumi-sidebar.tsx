import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import type { Dispatch, SetStateAction } from 'react';

const personas = [
  'Girlfriend',
  'Boyfriend',
  'Mentor',
  'Teacher',
  'Coach',
  'Therapist',
  'Custom',
];

type LumiSidebarProps = {
  persona: string;
  setPersona: Dispatch<SetStateAction<string>>;
  customPersona: string;
  setCustomPersona: Dispatch<SetStateAction<string>>;
};

export function LumiSidebar({
  persona,
  setPersona,
  customPersona,
  setCustomPersona,
}: LumiSidebarProps) {
  return (
    <aside className="w-full md:w-80 lg:w-96 p-4">
      <Card className="h-full border-0 md:border md:bg-card/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline tracking-tight">LUMI</CardTitle>
          <CardDescription>by vansh</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-lg font-medium font-headline">Persona</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose how you want me to be.
            </p>
            <RadioGroup
              value={persona}
              onValueChange={setPersona}
              className="gap-2"
            >
              {personas.map((p) => (
                <div key={p} className="flex items-center space-x-2">
                  <RadioGroupItem value={p} id={p} />
                  <Label htmlFor={p} className="text-base font-normal">
                    {p}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Accordion type="single" collapsible disabled={persona !== 'Custom'}>
            <AccordionItem value="custom-persona">
              <AccordionTrigger className="text-lg font-medium font-headline">
                Custom Persona
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label htmlFor="custom-persona-input">Define your custom persona</Label>
                  <Textarea
                    id="custom-persona-input"
                    placeholder="e.g., A witty space pirate with a heart of gold..."
                    value={customPersona}
                    onChange={(e) => setCustomPersona(e.target.value)}
                    rows={5}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is only active when 'Custom' persona is selected.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </aside>
  );
}
