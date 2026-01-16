import { Helmet } from 'react-helmet-async';
import { APP_NAME, APP_DESCRIPTION } from '@/constants';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description = APP_DESCRIPTION,
  keywords = 'vedic astrology, kundali, birth chart, astrology, horoscope, planetary positions, dasha',
  ogImage = '/astrova_logo.png',
  canonicalUrl,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
  const url = canonicalUrl || window.location.href;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={APP_NAME} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* No index for development */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Additional meta tags */}
      <meta name="author" content={APP_NAME} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta charSet="utf-8" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: APP_NAME,
          description: description,
          url: url,
          applicationCategory: 'LifestyleApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        })}
      </script>
    </Helmet>
  );
}
