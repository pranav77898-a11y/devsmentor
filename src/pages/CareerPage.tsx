import Navbar from "@/components/Navbar";
import CareerAnalyzer from "@/components/CareerAnalyzer";
import Footer from "@/components/Footer";

const CareerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <CareerAnalyzer />
      </div>
      <Footer />
    </div>
  );
};

export default CareerPage;
