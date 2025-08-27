import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import MarketsSection from "@/components/MarketsSection";
import PartnerPortalSection from "@/components/PartnerPortalSection";
import ContactSection from "@/components/ContactSection";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";

const Index = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <MarketsSection />
        <PartnerPortalSection />
        <ContactSection />
        {/* Optionally add a button here to open the login modal for testing */}
        {/* <button onClick={() => setIsLoginModalOpen(true)}>Open Login</button> */}
        <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
      </main>
    </div>
  );
};

export default Index;
