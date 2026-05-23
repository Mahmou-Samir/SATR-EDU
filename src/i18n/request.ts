import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'ar'];

export default getRequestConfig(async ({locale}) => {
  if (!locale || !locales.includes(locale)) return notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});