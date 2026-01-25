import Header from '@/components/layout/Header';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';

export default function Home() {
  return (
    <div data-theme="dark" className="min-h-screen">
      <Header hidePricing />
      <main>
        <Features />
        <HowItWorks />
      </main>
    </div>
  );
}
