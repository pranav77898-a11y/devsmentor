import Navbar from "@/components/Navbar";
import AISearchEngine from "@/components/AISearchEngine";
import Footer from "@/components/Footer";

const AISearchPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <AISearchEngine />
      </div>
      <Footer />
    </div>
  );
};

export default AISearchPage;
