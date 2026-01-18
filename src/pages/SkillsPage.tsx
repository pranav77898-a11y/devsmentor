import Navbar from "@/components/Navbar";
import SkillBooster from "@/components/SkillBooster";
import Footer from "@/components/Footer";

const SkillsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <SkillBooster />
      </div>
      <Footer />
    </div>
  );
};

export default SkillsPage;
