import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['sk', 'en'],

  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE as 'sk' | 'en' || 'en',

  localePrefix: 'never',

  pathnames: {
    '/': '/',
    '/dashboard': '/dashboard',
    '/login': '/login',
    '/dashboard/[slug]': '/dashboard/[slug]',
  },
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
