"use client"; // السطر ده هو السحر اللي هيخفي التحذير

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      {children}
    </NextThemesProvider>
  );
}