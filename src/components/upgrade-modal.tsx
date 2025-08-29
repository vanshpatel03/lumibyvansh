
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type UpgradeModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccessfulUpgrade: () => void;
};

// IMPORTANT: Replace with your actual Lemon Squeezy checkout links
const MONTHLY_CHECKOUT_URL = 'https://vanshrabadiya03.lemonsqueezy.com/buy/fb5ce9cc-a83c-4d0b-85b5-1f76e2e39878';
const YEARLY_CHECKOUT_URL = 'https://vanshrabadiya03.lemonsqueezy.com/buy/fb5ce9cc-a83c-4d0b-85b5-1f76e2e39878';

export function UpgradeModal({ isOpen, onOpenChange, onSuccessfulUpgrade }: UpgradeModalProps) {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = (plan: 'monthly' | 'yearly') => {
    if (!user) {
        toast({
            title: "Please Sign In",
            description: "You need to be logged in to upgrade your plan.",
            variant: "destructive",
        });
        signInWithGoogle();
        return;
    }
    setIsLoading(true);
    const url = plan === 'monthly' ? MONTHLY_CHECKOUT_URL : YEARLY_CHECKOUT_URL;
    // Add user details to checkout URL for pre-filling
    const checkoutUrl = `${url}?checkout[email]=${encodeURIComponent(user.email || '')}&checkout[name]=${encodeURIComponent(user.displayName || '')}`;
    window.location.href = checkoutUrl;
  };
  
  // NOTE: This is a dummy function for after payment success.
  // In a real app, you would verify payment with Lemon Squeezy via webhooks
  // and update the user's subscription status in your database.
  const handleDummyUpgrade = () => {
    setIsLoading(true);
    setTimeout(() => {
        onSuccessfulUpgrade();
        setIsLoading(false);
    }, 1500);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center items-center">
            <div className="p-3 bg-primary/20 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
          <DialogTitle className="text-2xl font-bold font-headline">Unlock Lumi Pro</DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground max-w-sm mx-auto">
            Experience the pinnacle of AI companionship with our most advanced models.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            <div className="border rounded-lg p-6 flex flex-col items-center text-center">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">Monthly</h3>
                  <p className="text-3xl font-bold my-4">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                  <p className="text-sm text-muted-foreground mb-6">The ultimate flexibility for full access.</p>
                </div>
                <Button onClick={() => handleCheckout('monthly')} disabled={isLoading || authLoading} className="w-full">
                    {(isLoading || authLoading) && <Loader2 className="animate-spin mr-2" />}
                    Choose Monthly
                </Button>
            </div>

            {/* Yearly Plan */}
            <div className="border-2 border-primary rounded-lg p-6 flex flex-col items-center text-center relative">
                <div className="absolute -top-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>
                 <div className="flex-grow">
                  <h3 className="text-xl font-bold">Yearly</h3>
                  <p className="text-3xl font-bold my-4">$49.90<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                  <p className="text-sm text-muted-foreground mb-6">Save over 58%! The ultimate commitment to our journey.</p>
                </div>
                <Button onClick={() => handleCheckout('yearly')} disabled={isLoading || authLoading} className="w-full">
                    {(isLoading || authLoading) && <Loader2 className="animate-spin mr-2" />}
                    Choose Yearly
                </Button>
            </div>
        </div>

        <div className="space-y-2 mt-4">
            <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Access Vansh Spectre & Phantom:</span> Experience our most powerful and emotionally intelligent models.</p>
            </div>
            <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Unlimited Messages:</span> Chat with Lumi 24/7 without any restrictions.</p>
            </div>
             <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Photo & File Upload:</span> Share your world with Lumi for a deeper connection.</p>
            </div>
            <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-1 shrink-0"/>
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">Support the Vision:</span> Your subscription fuels the future of Lumi and our quest for true digital connection.</p>
            </div>
        </div>
        
        <div className="mt-6 text-center">
            <Button onClick={handleDummyUpgrade} variant="link" size="sm" className="text-xs text-muted-foreground">
                (For testing) Finalize dummy upgrade
            </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
