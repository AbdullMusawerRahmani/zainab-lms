"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { ReactNode, useMemo } from "react";
// import { ConvexQueryCacheProvider } from "convex-helpers/react/cache"
// import { env } from "../env";
// const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // For now, just return children without Convex integration
  // TODO: Properly integrate Convex when backend is ready
  return <>{children}</>;
}

function useAuth() {
  const { data: session, update } = useSession();
  const convexToken = convexTokenFromSession(session);
  return useMemo(
    () => ({
      isLoading: false,
      isAuthenticated: session !== null,
      fetchAccessToken: async ({
        forceRefreshToken,
      }: {
        forceRefreshToken: boolean;
      }) => {
        if (forceRefreshToken) {
          const session = await update();

          return convexTokenFromSession(session);
        }
        return convexToken;
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(session?.user)]
  );
}

function convexTokenFromSession(session: Session | null): string | null {
  return session?.convexToken ?? null;
}
