// hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const API_URL = "https://your-api.com/auth";

export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    },
    onSuccess: (data) => {
      setAuth(data.user); // Save to Zustand
      router.push("/dashboard");
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error("Registration failed");
      return res.json();
    },
    onSuccess: (data) => {
      setAuth(data.user);
      router.push("/dashboard");
    },
  });

  return { 
    login: loginMutation, 
    register: registerMutation 
  };
}