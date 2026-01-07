import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import CareerAnalyzer from "@/components/CareerAnalyzer";
import RoadmapBuilder from "@/components/RoadmapBuilder";
import MindMapBuilder from "@/components/MindMapBuilder";
import ProjectIdeas from "@/components/ProjectIdeas";
import JobsFinder from "@/components/JobsFinder";
import ResumeEnhancer from "@/components/ResumeEnhancer";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CareerAnalyzer />
      <RoadmapBuilder />
      <MindMapBuilder />
      <ProjectIdeas />
      <JobsFinder />
      <ResumeEnhancer />
      <PricingSection />
      <Footer />
    </div>
  );
};

export default Index;
