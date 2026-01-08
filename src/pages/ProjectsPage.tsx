import Navbar from "@/components/Navbar";
import ProjectIdeas from "@/components/ProjectIdeas";
import Footer from "@/components/Footer";

const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <ProjectIdeas />
      </div>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
