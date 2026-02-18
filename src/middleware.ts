import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
 
export default createMiddleware(routing);
 
export const config = {
  // Simplify this to just the exclusion pattern. 
  // This covers the root, the locales, and excludes internals.
  matcher: [
    // Match all pathnames except for:
    // - API routes
    // - Next.js internals (_next)
    // - Static files (containing a dot, e.g. favicon.ico)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Always permit the root
    '/'
  ]
};