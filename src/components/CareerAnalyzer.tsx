import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, AlertTriangle, DollarSign, Target, Loader2 } from "lucide-react";

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

interface AnalysisResult {
  career: string;
  summary: string;
  confidence_score: number;
  salary_range: string;
  risk: string;
  alternatives: string[];
  trending: boolean;
}

const CareerAnalyzer = () => {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!selectedCareer) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis (will be replaced with actual API call)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults: Record<string, AnalysisResult> = {
      aiml: {
        career: "AI/ML Engineering",
        summary: "Excellent career choice with massive growth potential. AI/ML engineers are in extremely high demand across industries. Focus on Python, TensorFlow/PyTorch, and strong mathematical foundations.",
        confidence_score: 92,
        salary_range: "₹8-35 LPA",
        risk: "Low",
        alternatives: ["Data Science", "MLOps Engineering", "AI Research"],
        trending: true,
      },
      webdev: {
        career: "Full Stack Development",
        summary: "Versatile and stable career path. Full stack developers are needed everywhere from startups to enterprises. Master React/Next.js, Node.js, and cloud technologies for best opportunities.",
        confidence_score: 88,
        salary_range: "₹6-30 LPA",
        risk: "Low",
        alternatives: ["Frontend Specialist", "Backend Engineer", "Technical Architect"],
        trending: true,
      },
      cybersec: {
        career: "Cybersecurity",
        summary: "Critical and growing field with talent shortage. Organizations are investing heavily in security. Focus on ethical hacking, network security, and compliance frameworks.",
        confidence_score: 90,
        salary_range: "₹7-40 LPA",
        risk: "Low",
        alternatives: ["Security Analyst", "Penetration Tester", "Security Architect"],
        trending: true,
      },
      data: {
        career: "Data Science",
        summary: "High-impact role driving business decisions. Data scientists extract insights from complex datasets. Strong foundation in statistics, Python, and visualization tools is essential.",
        confidence_score: 85,
        salary_range: "₹7-32 LPA",
        risk: "Medium",
        alternatives: ["Data Engineer", "Business Analyst", "ML Engineer"],
        trending: true,
      },
      mobile: {
        career: "Mobile Development",
        summary: "Strong market for skilled mobile developers. Cross-platform frameworks like React Native and Flutter are in high demand. Native iOS/Android still commands premium salaries.",
        confidence_score: 82,
        salary_range: "₹6-28 LPA",
        risk: "Medium",
        alternatives: ["iOS Developer", "Android Developer", "Flutter Developer"],
        trending: false,
      },
      devops: {
        career: "DevOps/Cloud Engineering",
        summary: "Essential role in modern tech companies. DevOps engineers bridge development and operations. Master AWS/Azure/GCP, Kubernetes, and CI/CD pipelines.",
        confidence_score: 91,
        salary_range: "₹8-35 LPA",
        risk: "Low",
        alternatives: ["Cloud Architect", "SRE", "Platform Engineer"],
        trending: true,
      },
      blockchain: {
        career: "Blockchain/Web3 Development",
        summary: "Emerging field with high volatility but great potential. Smart contract development and DeFi are key areas. Solidity, Rust, and understanding of cryptography are valuable.",
        confidence_score: 70,
        salary_range: "₹10-50 LPA",
        risk: "High",
        alternatives: ["Smart Contract Developer", "DeFi Engineer", "Crypto Analyst"],
        trending: false,
      },
      game: {
        career: "Game Development",
        summary: "Creative and rewarding career with growing Indian market. Unity and Unreal Engine are essential. Combine programming with artistic skills for best outcomes.",
        confidence_score: 75,
        salary_range: "₹4-25 LPA",
        risk: "Medium",
        alternatives: ["Unity Developer", "Graphics Programmer", "Game Designer"],
        trending: false,
      },
    };
    
    setResult(mockResults[selectedCareer] || mockResults.webdev);
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
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Brain className="w-4 h-4" />
            <span>AI Career Analyzer</span>
          </div>
          <h2 className="section-title">Find Your Perfect Tech Career</h2>
          <p className="section-subtitle">
            Select a career path and let AI analyze market trends, salary ranges, and give you personalized recommendations.
          </p>
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
                    {result.trending && (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground max-w-2xl">{result.summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold gradient-text">{result.confidence_score}%</div>
                  <div className="text-sm text-muted-foreground">Confidence Score</div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Salary Range</span>
                  </div>
                  <div className="text-xl font-semibold text-primary">{result.salary_range}</div>
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
                    {result.alternatives.slice(0, 2).map((alt, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="hero" className="flex-1">
                  Generate Learning Roadmap
                </Button>
                <Button variant="glass" className="flex-1">
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
