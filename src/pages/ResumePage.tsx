import Navbar from "@/components/Navbar";
import ResumeEnhancer from "@/components/ResumeEnhancer";
import Footer from "@/components/Footer";

const ResumePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <ResumeEnhancer />
      </div>
      <Footer />
    </div>
  );
};

export default ResumePage;
