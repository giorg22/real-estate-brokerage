import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';
 
export const routing = defineRouting({
  locales: ['ka', 'en'],
  defaultLocale: 'ka'
});
 
// Export specialized navigation hooks
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);