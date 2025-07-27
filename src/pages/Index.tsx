import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import MarketsSection from "@/components/MarketsSection";
import PartnerPortalSection from "@/components/PartnerPortalSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <MarketsSection />
        <PartnerPortalSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default Index;
