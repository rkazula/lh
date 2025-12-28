import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/lib/constants';

interface SEOProps {
  title: string;
  description?: string;
}

export function SEO({ title, description }: SEOProps) {
  const baseDescription = "Minimalist streetwear for the introverted soul.";
  const fullTitle = `${title} | ${APP_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || baseDescription} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || baseDescription} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}