import Navbar from "@/components/Navbar";
import RoadmapBuilder from "@/components/RoadmapBuilder";
import Footer from "@/components/Footer";

const RoadmapPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <RoadmapBuilder />
      </div>
      <Footer />
    </div>
  );
};

export default RoadmapPage;
