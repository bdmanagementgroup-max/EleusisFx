import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Ticker from "@/components/home/Ticker";
import StatsRow from "@/components/home/StatsRow";
import ProcessSteps from "@/components/home/ProcessSteps";
import ProofSection from "@/components/home/ProofSection";
import PricingSection from "@/components/home/PricingSection";
import LeadMagnet from "@/components/home/LeadMagnet";
import FaqSection from "@/components/home/FaqSection";
import ApplyForm from "@/components/home/ApplyForm";

export default function HomePage() {
  return (
    <>
      <Nav />
      <Hero />
      <Ticker />
      <StatsRow />
      <ProcessSteps />
      <ProofSection />
      <PricingSection />
      <LeadMagnet />
      <FaqSection />
      <ApplyForm />
      <Footer />
    </>
  );
}
