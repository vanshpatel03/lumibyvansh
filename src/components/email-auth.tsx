
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' }),
});

export type AuthFormValues = z.infer<typeof authSchema>;

type EmailAuthProps = {
  onAuthSuccess: () => void;
};

export function EmailAuth({ onAuthSuccess }: EmailAuthProps) {
  const [activeTab, setActiveTab] = React.useState('signin');
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    try {
      if (activeTab === 'signin') {
        await signInWithEmail(values);
      } else {
        await signUpWithEmail(values);
      }
      onAuthSuccess();
    } catch (error) {
      // Error is handled by the toast in useAuth hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <AuthForm form={form} onSubmit={onSubmit} isLoading={isLoading} buttonText="Sign In" />
      </TabsContent>
      <TabsContent value="signup">
        <AuthForm form={form} onSubmit={onSubmit} isLoading={isLoading} buttonText="Create Account" />
      </TabsContent>
    </Tabs>
  );
}

type AuthFormProps = {
    form: ReturnType<typeof useForm<AuthFormValues>>;
    onSubmit: (values: AuthFormValues) => void;
    isLoading: boolean;
    buttonText: string;
}

function AuthForm({ form, onSubmit, isLoading, buttonText }: AuthFormProps) {
    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </form>
        </Form>
    )
}
