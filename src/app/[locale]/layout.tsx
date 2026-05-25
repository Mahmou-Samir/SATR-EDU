/* eslint-disable @next/next/no-page-custom-font */
import Navbar from "../../components/Navbar";
import { ThemeProvider } from "../../components/ThemeProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import "../ui-enhancements.css";

export default async function RootLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  // التعديل 1: لازم تكون Promise
  params: Promise<{ locale: string }>; 
}) {
  // التعديل 2: لازم كلمة await
  const { locale } = await params; 
  
  const messages = await getMessages();
  
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
         <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700&family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={locale === "ar" ? "locale-ar" : "locale-en"} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}