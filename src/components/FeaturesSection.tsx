import { Brain, Map, GitBranch, Rocket, Briefcase, FileText, TrendingUp, Sparkles, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Brain,
    title: "AI Career Analyzer",
    description: "Get personalized career recommendations based on market trends, salary data, and your interests.",
    gradient: "from-cyan-500 to-cyan-600",
    href: "/career",
  },
  {
    icon: Map,
    title: "Roadmap Builder",
    description: "Generate visual, node-based learning roadmaps customized to your chosen career path.",
    gradient: "from-teal-500 to-teal-600",
    href: "/roadmap",
  },
  {
    icon: GitBranch,
    title: "Mind Map Generator",
    description: "Create interactive mind maps to visualize and organize complex technical concepts.",
    gradient: "from-emerald-500 to-emerald-600",
    href: "/mindmap",
  },
  {
    icon: Rocket,
    title: "100+ Project Ideas",
    description: "Access resume-ready project suggestions with difficulty levels and required skills.",
    gradient: "from-green-500 to-green-600",
    href: "/projects",
  },
  {
    icon: Briefcase,
    title: "Jobs & Internships",
    description: "AI scans the web to find latest opportunities matching your skills and interests.",
    gradient: "from-blue-500 to-blue-600",
    href: "/jobs",
  },
  {
    icon: FileText,
    title: "Resume Enhancer",
    description: "Improve your resume with AI-powered analysis, ATS optimization, and suggestions.",
    gradient: "from-indigo-500 to-indigo-600",
    href: "/resume",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "Stay ahead with insights on trending technologies and in-demand skills in India.",
    gradient: "from-purple-500 to-purple-600",
    href: "/career",
  },
  {
    icon: Sparkles,
    title: "Learning Resources",
    description: "Get curated learning resources, tutorials, and documentation links for any topic.",
    gradient: "from-pink-500 to-pink-600",
    href: "/roadmap",
  },
];

const FeaturesSection = () => {
  const { user } = useAuth();

  return (
    <section className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI</span>
          </div>
          <h2 className="section-title">Everything You Need to Succeed</h2>
          <p className="section-subtitle">
            Comprehensive tools designed to guide your tech career from confusion to confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={user ? feature.href : "/login"}
              className="block group"
            >
              <div
                className="glass-card-hover p-6 animate-fade-in h-full relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {!user && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {!user && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Sign up to unlock all features</p>
            <Link to="/signup">
              <button className="btn-primary-glow">Get Started Free</button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturesSection;
