import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Apex Intel — Investment Intelligence Platform',
    short_name: 'Apex Intel',
    description: 'AI-powered investment intelligence and due diligence reports for venture capital and private equity professionals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#3B82F6',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
