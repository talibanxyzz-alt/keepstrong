import { Metadata } from 'next';
import LandingPage from './LandingPage';

export const metadata: Metadata = {
  title: 'KeepStrong - Muscle Preservation for GLP-1 Users | Ozempic, Wegovy, Mounjaro',
  description: 'Science-backed program to preserve muscle while losing weight on Ozempic, Wegovy, Mounjaro. Track protein, train smart, see results.',
  keywords: ['GLP-1', 'Ozempic', 'Wegovy', 'Mounjaro', 'Zepbound', 'muscle preservation', 'protein tracking', 'weight loss', 'fitness'],
  openGraph: {
    title: 'KeepStrong - Don\'t Lose Muscle on Ozempic',
    description: 'Science-backed program to stay strong while you lose weight on GLP-1 medications',
    type: 'website',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KeepStrong - Muscle Preservation for GLP-1 Users',
    description: 'Preserve muscle while losing weight on Ozempic, Wegovy, Mounjaro',
  },
};

export default function Home() {
  return <LandingPage />;
}
