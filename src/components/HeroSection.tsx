import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Target, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="glow-orb glow-orb-primary w-[600px] h-[600px] -top-40 -left-40 animate-float" />
        <div className="glow-orb glow-orb-secondary w-[500px] h-[500px] top-1/2 -right-40 animate-float delay-200" style={{ animationDelay: '2s' }} />
        <div className="glow-orb glow-orb-accent w-[400px] h-[400px] bottom-20 left-1/4 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-8 animate-slide-up">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Career Guidance for Developers</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up opacity-0" style={{ animationDelay: '0.1s' }}>
            Your AI Career{" "}
            <span className="gradient-text">Mentor</span>
            <br />
            <span className="text-muted-foreground">for Tech Success</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up opacity-0" style={{ animationDelay: '0.2s' }}>
            Confused about your tech career path? Let AI analyze your interests, generate personalized roadmaps, suggest real-world projects, and find you the best opportunities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up opacity-0" style={{ animationDelay: '0.3s' }}>
            <Link to={user ? "/career" : "/signup"}>
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                <Brain className="w-5 h-5" />
                {user ? "Go to Dashboard" : "Start Career Analysis"}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="glass" size="xl" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up opacity-0" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Brain, label: "AI Analyses", value: "10K+" },
              { icon: Target, label: "Career Paths", value: "50+" },
              { icon: Rocket, label: "Projects Built", value: "5K+" },
              { icon: Sparkles, label: "Success Rate", value: "94%" },
            ].map((stat, index) => (
              <div key={index} className="stat-card">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
