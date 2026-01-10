import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, AlertTriangle, DollarSign, Target, Loader2, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import UsageBadge from "@/components/UsageBadge";

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
  confidenceScore: number;
  salaryRange: {
    entry: string;
    mid: string;
    senior: string;
  };
  risk: string;
  alternatives: string[];
  requiredSkills?: string[];
  growthOutlook?: string;
  topCompanies?: string[];
  demandTrend?: string;
  learningPath?: string;
}

const CareerAnalyzer = () => {
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const navigate = useNavigate();
  const { isPro, limits, recordUsage, fetchUsageCount } = useSubscription();

  useEffect(() => {
    const loadUsage = async () => {
      const count = await fetchUsageCount('career_analysis');
      setDailyUsage(count);
    };
    loadUsage();
  }, [fetchUsageCount]);

  const handleAnalyze = async () => {
    if (!selectedCareer) return;
    
    // Check rate limit for free users
    if (!isPro && dailyUsage >= limits.careerAnalysis) {
      setShowUpgrade(true);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const careerName = careerPaths.find(c => c.id === selectedCareer)?.name || selectedCareer;
      
      const { data, error } = await supabase.functions.invoke('career-analysis', {
        body: { careerPath: careerName }
      });

      if (error) throw error;
      
      // Record usage for free users
      if (!isPro) {
        await recordUsage('career_analysis');
        setDailyUsage(prev => prev + 1);
      }
      
      setResult(data);
      toast.success("Career analysis complete!");
    } catch (error) {
      console.error("Career analysis error:", error);
      toast.error("Failed to analyze career. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
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
          message="You've used all 3 free career analyses today. Upgrade to Pro for unlimited access!"
          onClose={() => setShowUpgrade(false)}
        />
      )}
      
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
          
          {/* Usage Badge for Free Users */}
          {!isPro && (
            <div className="mt-4 flex justify-center">
              <UsageBadge 
                used={dailyUsage} 
                limit={limits.careerAnalysis} 
                feature="analyses" 
              />
            </div>
          )}
          
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
                    {result.alternatives?.slice(0, 2).map((alt, i) => (
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
                    {result.requiredSkills.map((skill, i) => (
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
