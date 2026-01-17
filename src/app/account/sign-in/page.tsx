"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const authSchema = z.object({
  name: z.string().min(2).optional(), // Only for register
  email: z.string().email(),
  password: z.string().min(8),
});

export default function AuthPage() {
  const { login, register } = useAuth();
  
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof authSchema>, type: 'login' | 'register') => {
    if (type === 'login') {
      login.mutate({ email: values.email, password: values.password });
    } else {
      register.mutate(values);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => onSubmit(v, 'login'))} className="space-y-4">
              {/* Email/Password Fields (Omitted for brevity) */}
              <Button className="w-full" disabled={login.isPending}>
                {login.isPending && <Loader2 className="mr-2 animate-spin" />} Sign In
              </Button>
            </form>
          </Form>
        </TabsContent>
        
        {/* Register Content follows same pattern using register.mutate */}
      </Tabs>
    </div>
  );
}