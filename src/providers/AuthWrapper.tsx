'use client'

import { Authenticated } from "convex/react";
export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Authenticated>{children}</Authenticated>;
}
