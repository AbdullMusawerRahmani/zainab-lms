"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useMemo } from "react";
// import { ThemeProvider } from "../components/theme/theme-provider";
import { SessionProvider } from "next-auth/react";
// import { ClientProfileProvider } from "./ClientProfileProvider";
// import { MessengerProvider } from "./MessengerProvider";
// import EnhancedFloatingChatWidget from "../components/messenger/EnhancedFloatingChatWidget";

export default function Providers({ children }: { children: ReactNode }) {
  // ✅ Fix: Create QueryClient only once using useState
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        // refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5,
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
}
