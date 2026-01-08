import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <PricingSection />
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
