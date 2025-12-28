export const APP_NAME = 'Local Haters';
export const API_BASE_URL = import.meta.env.DEV ? '/api' : '/.netlify/functions';

export const NAVIGATION_LINKS = [
  { label: 'Shop', href: '/catalog' },
  { label: 'Collections', href: '/collections' },
  { label: 'About', href: '/about' },
];

export const ANIMATION_VARIANTS = {
  pageInitial: { opacity: 0, y: 10, filter: 'blur(10px)' },
  pageAnimate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  pageExit: { opacity: 0, y: -10, filter: 'blur(10px)' },
};