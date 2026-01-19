import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const API_BASE = "https://localhost:7075"; // Your custom backend URL

export function useAuthActions() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials: any) => {
      console.log("Logging in with credentials:", credentials);
      const res = await fetch(`${API_BASE}/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
    onSuccess: (data) => {
      const user = {
        ...data.me,
        token: data.token
      };
      setAuth(user);
      router.push("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Registration failed");
      return res.json();
    },
    onSuccess: (data) => {
      setAuth(data.user);
      router.push("/dashboard");
    },
  });

  return { loginMutation, registerMutation };
}