import Navbar from "@/components/Navbar";
import JobsFinder from "@/components/JobsFinder";
import Footer from "@/components/Footer";

const JobsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <JobsFinder />
      </div>
      <Footer />
    </div>
  );
};

export default JobsPage;
