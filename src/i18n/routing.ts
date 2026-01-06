import { defineRouting } from 'next-intl/routing';
import { locales } from "@/i18n/config";

export const routing = defineRouting({
    locales: locales,
    defaultLocale: 'en',
    localePrefix: 'always'
});