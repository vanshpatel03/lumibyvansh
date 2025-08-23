
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Loader2 } from 'lucide-react';
import { createStripeCheckoutSession } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type UpgradeModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // onUpgrade is no longer needed as we redirect to stripe
};

export function UpgradeModal({ isOpen, onOpenChange }: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { url } = await createStripeCheckoutSession();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Could not get redirect URL');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no, something went wrong.",
        description: "We couldn't connect to our payment provider. Please try again later.",
      });
      setIsLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center items-center">
            <div className="p-3 bg-primary/20 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
          <DialogTitle className="text-2xl font-bold font-headline">Unlock Lumi Pro</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Upgrade to access the most powerful models for just $9.99/month.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-4">
            <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <div>
                    <h4 className="font-semibold">Access Vansh Spectre & Phantom</h4>
                    <p className="text-sm text-muted-foreground">Experience the pinnacle of conversational AI with our most advanced models.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Zap className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <div>
                    <h4 className="font-semibold">Unlimited Messages</h4>
                    <p className="text-sm text-muted-foreground">Chat with Lumi as much as you want without any limits.</p>
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
          <Button onClick={handleUpgrade} disabled={isLoading} className="w-full text-lg h-12">
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Go Pro'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
