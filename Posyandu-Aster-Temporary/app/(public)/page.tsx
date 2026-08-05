import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Services from "@/components/landing/Services";
import Schedule from "@/components/landing/Schedule";
import News from "@/components/landing/News";
import Products from "@/components/landing/Products";
import Gallery from "@/components/landing/Gallery";
import Statistics from "@/components/landing/Statistics";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Schedule />
        <News />
        <Products />
        <Gallery />
        <Statistics />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
