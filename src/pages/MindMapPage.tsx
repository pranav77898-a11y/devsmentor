import Navbar from "@/components/Navbar";
import MindMapBuilder from "@/components/MindMapBuilder";
import Footer from "@/components/Footer";

const MindMapPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <MindMapBuilder />
      </div>
      <Footer />
    </div>
  );
};

export default MindMapPage;
