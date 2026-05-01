import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Ticker from "@/components/home/Ticker";
import StatsRow from "@/components/home/StatsRow";
import ProcessSteps from "@/components/home/ProcessSteps";
import ProofSection from "@/components/home/ProofSection";
import ProofFeed from "@/components/home/ProofFeed";
import PricingSection from "@/components/home/PricingSection";
import LeadMagnet from "@/components/home/LeadMagnet";
import FaqSection from "@/components/home/FaqSection";
import ApplyForm from "@/components/home/ApplyForm";
import PublicMarketTicker from "@/components/layout/PublicMarketTicker";
import SchemaOrg from "@/components/SchemaOrg";

export default function HomePage() {
  return (
    <>
      <SchemaOrg />
      <Nav />
      <PublicMarketTicker />
      {/* spacer clears the fixed 46px market ticker bar */}
      <div style={{ height: 46 }} />
      <Hero />
      <Ticker />
      <StatsRow />
      <ProcessSteps />
      <ProofSection />
      <ProofFeed />
      <PricingSection />
      <LeadMagnet />
      <FaqSection />
      <ApplyForm />
      <Footer />
    </>
  );
}
