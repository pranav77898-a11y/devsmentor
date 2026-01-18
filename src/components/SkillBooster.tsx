import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, BookOpen, ExternalLink, Loader2, Sparkles, Target, DollarSign, Crown, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";

interface Certification {
  name: string;
  provider: string;
  level: string;
  duration: string;
  cost: string;
  url: string;
  value: string;
}

interface LearningStep {
  step: number;
  title: string;
  duration: string;
  description: string;
}

interface Resource {
  name: string;
  type: string;
  url: string;
}

interface SkillData {
  skill: string;
  currentDemand: string;
  futureOutlook: string;
  certifications: Certification[];
  learningPath: LearningStep[];
  practiceProjects: string[];
  topResources: Resource[];
  salaryImpact: string;
  complementarySkills: string[];
}

const popularSkills = [
  { name: "React.js", icon: "⚛️" },
  { name: "Python", icon: "🐍" },
  { name: "AWS", icon: "☁️" },
  { name: "Machine Learning", icon: "🤖" },
  { name: "Docker", icon: "🐳" },
  { name: "TypeScript", icon: "📘" },
  { name: "Kubernetes", icon: "⎈" },
  { name: "Data Science", icon: "📊" },
];

const careers = [
  "Software Development",
  "Data Science",
  "DevOps Engineering",
  "AI/ML Engineering",
  "Full Stack Development",
  "Cloud Architecture",
  "Cybersecurity",
];

const SkillBooster = () => {
  const [skill, setSkill] = useState("");
  const [career, setCareer] = useState("Software Development");
  const [isLoading, setIsLoading] = useState(false);
  const [skillData, setSkillData] = useState<SkillData | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPro } = useSubscription();

  const getSkillRecommendations = async () => {
    if (!skill.trim()) {
      toast.error("Please enter a skill to boost");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-skills', {
        body: { skill, career }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setSkillData(data);
      toast.success("Skill boost plan generated!");
    } catch (error) {
      console.error("Error getting skill recommendations:", error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand?.toLowerCase()) {
      case "high": return "text-green-400 bg-green-500/20 border-green-500/30";
      case "medium": return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low": return "text-red-400 bg-red-500/20 border-red-500/30";
      default: return "text-primary bg-primary/20 border-primary/30";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner": return "bg-green-500/20 text-green-400";
      case "intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section id="skill-boost" className="py-24 relative">
      {showUpgrade && (
        <UpgradePrompt 
          feature="Skill Booster" 
          message="Upgrade to Pro for unlimited skill recommendations and certification tracking!"
          onClose={() => setShowUpgrade(false)}
        />
      )}

      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Skill Booster</span>
          </div>
          <h2 className="section-title">Boost Your Skills & Get Certified</h2>
          <p className="section-subtitle">
            Get personalized certification recommendations and learning paths to advance your career.
          </p>

          {isPro && (
            <div className="mt-4 flex justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
                <Crown className="w-3 h-3" />
                <span>Unlimited Skill Recommendations</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Enter a skill to boost (e.g., React, AWS, Python)..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="input-dark flex-1"
                onKeyDown={(e) => e.key === 'Enter' && getSkillRecommendations()}
              />
              <select
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                className="input-dark md:w-64"
              >
                {careers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Button
                variant="hero"
                onClick={getSkillRecommendations}
                disabled={!skill.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Boost Skill
                  </>
                )}
              </Button>
            </div>

            {/* Popular Skills */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {popularSkills.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSkill(s.name)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    skill === s.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Generating Skill Plan...</h3>
            <p className="text-muted-foreground">
              Finding the best certifications and resources for "{skill}"
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && skillData && (
          <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
            {/* Overview Card */}
            <div className="glass-card p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    <span className="gradient-text">{skillData.skill}</span> Skill Plan
                  </h3>
                  <p className="text-muted-foreground">{skillData.futureOutlook}</p>
                </div>
                <div className="flex gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getDemandColor(skillData.currentDemand)}`}>
                    {skillData.currentDemand} Demand
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Salary Impact</span>
                  </div>
                  <p className="text-primary font-semibold">{skillData.salaryImpact}</p>
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Complementary Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skillData.complementarySkills?.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Recommended Certifications
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillData.certifications?.map((cert, i) => (
                  <div key={i} className="glass-card-hover p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${getLevelColor(cert.level)}`}>
                        {cert.level}
                      </span>
                      <span className="text-xs text-muted-foreground">{cert.duration}</span>
                    </div>
                    <h5 className="font-semibold mb-1">{cert.name}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{cert.provider}</p>
                    <p className="text-xs text-muted-foreground mb-3">{cert.value}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary font-medium">{cert.cost}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => window.open(cert.url, '_blank', 'noopener,noreferrer')}
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path */}
            <div className="glass-card p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Learning Path
              </h4>
              <div className="space-y-4">
                {skillData.learningPath?.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      {i < skillData.learningPath.length - 1 && (
                        <div className="w-0.5 h-full bg-primary/20 my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold">{step.title}</h5>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Projects & Resources */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold mb-4">Practice Projects</h4>
                <ul className="space-y-2">
                  {skillData.practiceProjects?.map((project, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {project}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-lg font-semibold mb-4">Top Resources</h4>
                <ul className="space-y-3">
                  {skillData.topResources?.map((resource, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{resource.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({resource.type})</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !skillData && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Boost Your Skills</h3>
            <p className="text-muted-foreground">
              Enter a skill above to get personalized certification recommendations and learning paths.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SkillBooster;
