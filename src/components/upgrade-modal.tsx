
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap } from 'lucide-react';

type UpgradeModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpgrade: () => void;
};

export function UpgradeModal({ isOpen, onOpenChange, onUpgrade }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center items-center">
            <div className="p-3 bg-primary/20 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
          <DialogTitle className="text-2xl font-bold font-headline">Unlock Lumi Pro</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Upgrade your companion to access the most powerful models and features.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-4">
            <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <div>
                    <h4 className="font-semibold">Access Vansh Ultra & Phantom</h4>
                    <p className="text-sm text-muted-foreground">Experience the pinnacle of conversational AI with our most advanced models.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <div>
                    <h4 className="font-semibold">Priority Responses</h4>
                    <p className="text-sm text-muted-foreground">Get faster, more detailed answers from Lumi, even during peak times.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <div>
                    <h4 className="font-semibold">Support the Vision</h4>
                    <p className="text-sm text-muted-foreground">Your subscription helps power the future development of Lumi.</p>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={onUpgrade} className="w-full text-lg h-12">
            Go Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
