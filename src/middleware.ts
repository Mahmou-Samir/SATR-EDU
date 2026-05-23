import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always' // ده هيخلي دايماً الرابط فيه اللغة
});

export const config = {
  // السطر ده مهم جداً: بيستثني الصور والملفات الثابتة عشان ميعملش Redirect للوجو
  matcher: ['/', '/(ar|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};