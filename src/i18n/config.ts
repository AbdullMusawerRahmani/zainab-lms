import { Locale } from 'next-intl';

export const locales = ['en', 'fa'] as const;

export const defaultLocale: Locale = 'en';
export const RTLLocales = ['fa']
export const getDirection = (locale: Locale) => RTLLocales.includes(locale) ? 'rtl' : 'ltr'
// This cookie name is used by `next-intl` on the public pages too. By
// reading/writing to this locale, we can ensure that the user's locale
// is consistent across public and private pages. In case you save the
// locale of registered users in a database, you can of course also use
// that instead when the user is logged in.

export const COOKIE_NAME = 'NEXT_LOCALE';