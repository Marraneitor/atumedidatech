import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/citas`, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
