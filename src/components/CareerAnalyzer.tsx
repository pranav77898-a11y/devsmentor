import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, AlertTriangle, DollarSign, Target, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";

const careerPaths = [
  { id: "aiml", name: "AI/ML Engineering", icon: "🤖" },
  { id: "webdev", name: "Full Stack Development", icon: "🌐" },
  { id: "mobile", name: "Mobile Development", icon: "📱" },
  { id: "devops", name: "DevOps/Cloud", icon: "☁️" },
  { id: "cybersec", name: "Cybersecurity", icon: "🔐" },
  { id: "data", name: "Data Science", icon: "📊" },
  { id: "blockchain", name: "Blockchain/Web3", icon: "⛓️" },
  { id: "game", name: "Game Development", icon: "🎮" },
];

// Static career data
const careerData: Record<string, any> = {
  aiml: {
    career: "AI/ML Engineering",
    summary: "AI/ML Engineering is one of the fastest-growing fields in tech. Engineers build intelligent systems using machine learning, deep learning, and data science techniques.",
    confidenceScore: 92,
    salaryRange: { entry: "₹8-15 LPA", mid: "₹20-35 LPA", senior: "₹45-80 LPA" },
    risk: "Low",
    alternatives: ["Data Science", "Software Engineering", "Research Scientist"],
    requiredSkills: ["Python", "TensorFlow", "PyTorch", "Mathematics", "Statistics", "Deep Learning"],
    demandTrend: "Increasing",
  },
  webdev: {
    career: "Full Stack Development",
    summary: "Full Stack developers build complete web applications, handling both frontend and backend. High demand across startups and enterprises.",
    confidenceScore: 88,
    salaryRange: { entry: "₹5-10 LPA", mid: "₹15-25 LPA", senior: "₹30-50 LPA" },
    risk: "Low",
    alternatives: ["Frontend Developer", "Backend Developer", "Mobile Developer"],
    requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs"],
    demandTrend: "Increasing",
  },
  mobile: {
    career: "Mobile Development",
    summary: "Mobile developers create applications for iOS and Android platforms. Growing demand with the mobile-first approach in most companies.",
    confidenceScore: 85,
    salaryRange: { entry: "₹6-12 LPA", mid: "₹18-30 LPA", senior: "₹35-55 LPA" },
    risk: "Low",
    alternatives: ["Full Stack Developer", "React Native Developer", "Flutter Developer"],
    requiredSkills: ["Swift/Kotlin", "React Native", "Flutter", "REST APIs", "UI/UX"],
    demandTrend: "Increasing",
  },
  devops: {
    career: "DevOps/Cloud Engineering",
    summary: "DevOps engineers bridge development and operations, focusing on automation, CI/CD, and cloud infrastructure management.",
    confidenceScore: 90,
    salaryRange: { entry: "₹7-14 LPA", mid: "₹20-35 LPA", senior: "₹40-70 LPA" },
    risk: "Low",
    alternatives: ["Site Reliability Engineer", "Cloud Architect", "Platform Engineer"],
    requiredSkills: ["AWS/Azure/GCP", "Docker", "Kubernetes", "Linux", "Terraform", "CI/CD"],
    demandTrend: "Increasing",
  },
  cybersec: {
    career: "Cybersecurity",
    summary: "Cybersecurity professionals protect systems and data from threats. Critical role with increasing importance due to rising cyber attacks.",
    confidenceScore: 87,
    salaryRange: { entry: "₹6-12 LPA", mid: "₹18-30 LPA", senior: "₹35-60 LPA" },
    risk: "Low",
    alternatives: ["Security Analyst", "Penetration Tester", "Security Architect"],
    requiredSkills: ["Network Security", "Ethical Hacking", "SIEM", "Cryptography", "Linux"],
    demandTrend: "Increasing",
  },
  data: {
    career: "Data Science",
    summary: "Data Scientists analyze complex data to derive insights and build predictive models. High demand in analytics-driven organizations.",
    confidenceScore: 86,
    salaryRange: { entry: "₹7-14 LPA", mid: "₹20-35 LPA", senior: "₹40-70 LPA" },
    risk: "Low",
    alternatives: ["ML Engineer", "Data Analyst", "Business Intelligence Analyst"],
    requiredSkills: ["Python", "R", "SQL", "Machine Learning", "Statistics", "Data Visualization"],
    demandTrend: "Increasing",
  },
  blockchain: {
    career: "Blockchain/Web3 Development",
    summary: "Blockchain developers build decentralized applications and smart contracts. Emerging field with growing opportunities in DeFi and NFTs.",
    confidenceScore: 75,
    salaryRange: { entry: "₹8-15 LPA", mid: "₹25-45 LPA", senior: "₹50-90 LPA" },
    risk: "Medium",
    alternatives: ["Smart Contract Developer", "Full Stack Developer", "Crypto Researcher"],
    requiredSkills: ["Solidity", "Ethereum", "Smart Contracts", "Web3.js", "DeFi Protocols"],
    demandTrend: "Increasing",
  },
  game: {
    career: "Game Development",
    summary: "Game developers create interactive games for various platforms. Creative field combining programming with art and design.",
    confidenceScore: 78,
    salaryRange: { entry: "₹4-10 LPA", mid: "₹15-28 LPA", senior: "₹30-50 LPA" },
    risk: "Medium",
    alternatives: ["Unity Developer", "Unreal Developer", "Graphics Programmer"],
    requiredSkills: ["Unity/Unreal", "C++/C#", "3D Graphics", "Game Design", "Physics Engines"],
    demandTrend: "Stable",
  },
};

const CareerAnalyzer = () => {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();
  const { isPro } = useSubscription();

  const handleAnalyze = async () => {
    if (!selectedCareer) return;
    
    setIsAnalyzing(true);
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const data = careerData[selectedCareer];
    setResult(data);
    toast.success("Career analysis complete!");
    
    setIsAnalyzing(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "High": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <section id="career" className="py-24 relative">
      {showUpgrade && (
        <UpgradePrompt 
          feature="Career Analysis" 
          message="Upgrade to Pro for detailed career insights and personalized recommendations!"
          onClose={() => setShowUpgrade(false)}
        />
      )}
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Brain className="w-4 h-4" />
            <span>Career Analyzer</span>
          </div>
          <h2 className="section-title">Find Your Perfect Tech Career</h2>
          <p className="section-subtitle">
            Select a career path to explore market trends, salary ranges, and get personalized recommendations.
          </p>
          
          {isPro && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
                <Crown className="w-3 h-3" />
                <span>Unlimited Analyses</span>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Career Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {careerPaths.map((career) => (
              <button
                key={career.id}
                onClick={() => {
                  setSelectedCareer(career.id);
                  setResult(null);
                }}
                className={`career-card text-left transition-all duration-300 ${
                  selectedCareer === career.id ? "selected" : ""
                }`}
              >
                <div className="text-3xl mb-3">{career.icon}</div>
                <div className="font-medium text-sm">{career.name}</div>
              </button>
            ))}
          </div>

          {/* Analyze Button */}
          <div className="text-center mb-8">
            <Button
              variant="hero"
              size="lg"
              onClick={handleAnalyze}
              disabled={!selectedCareer || isAnalyzing}
              className="min-w-[200px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Career
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="glass-card p-8 animate-slide-up">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold">{result.career}</h3>
                    {result.demandTrend === "Increasing" && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground max-w-2xl">{result.summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold gradient-text">{result.confidenceScore}%</div>
                  <div className="text-sm text-muted-foreground">Confidence Score</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Salary Range</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="text-muted-foreground">Entry:</span> <span className="text-primary font-medium">{result.salaryRange?.entry}</span></div>
                    <div><span className="text-muted-foreground">Mid:</span> <span className="text-primary font-medium">{result.salaryRange?.mid}</span></div>
                    <div><span className="text-muted-foreground">Senior:</span> <span className="text-primary font-medium">{result.salaryRange?.senior}</span></div>
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Risk Level</span>
                  </div>
                  <div className={`text-xl font-semibold ${getRiskColor(result.risk)}`}>
                    {result.risk}
                  </div>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Alternatives</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.alternatives?.slice(0, 2).map((alt: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {result.requiredSkills && result.requiredSkills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.requiredSkills.map((skill: string, i: number) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button variant="hero" className="flex-1" onClick={() => navigate('/roadmap')}>
                  Generate Learning Roadmap
                </Button>
                <Button variant="glass" className="flex-1" onClick={() => navigate('/projects')}>
                  View Related Projects
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CareerAnalyzer;
