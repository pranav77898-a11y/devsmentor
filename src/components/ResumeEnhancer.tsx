import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Sparkles, Download, CheckCircle2, AlertCircle, Loader2, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";
import { useNavigate } from "react-router-dom";

interface ResumeAnalysis {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  atsScore: number;
  keywords_missing?: string[];
  format_issues?: string[];
}

const ResumeEnhancer = () => {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPro } = useSubscription();
  const navigate = useNavigate();

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeText }
      });

      if (error) throw error;
      
      setAnalysis(data);
      toast.success("Resume analysis complete!");
    } catch (error) {
      console.error("Resume analysis error:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreRing = (score: number) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 100) * circumference;
    return { circumference, offset };
  };

  const handleEnhanceResume = () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    // Pro feature: Download enhanced resume
    toast.success("Enhanced resume downloading... (Pro feature)");
  };

  return (
    <section className="py-24 relative">
      {showUpgrade && (
        <UpgradePrompt 
          feature="AI Resume Enhancement" 
          message="Upgrade to Pro to download AI-enhanced resumes with optimized formatting and keywords!"
          onClose={() => setShowUpgrade(false)}
        />
      )}
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <FileText className="w-4 h-4" />
            <span>AI Resume Enhancer</span>
          </div>
          <h2 className="section-title">Make Your Resume Stand Out</h2>
          <p className="section-subtitle">
            AI-powered analysis to improve your resume, boost ATS scores, and get more interviews.
          </p>
          
          {/* Pro/Free indicator */}
          <div className="mt-4 flex justify-center">
            {isPro ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
                <Crown className="w-3 h-3" />
                <span>Full AI Enhancement Access</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 border border-border text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Basic Analysis • Upgrade for Full Enhancement</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Paste Your Resume
              </h3>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here...

Example:
John Doe
Software Engineer | john@email.com | +91 9876543210

Summary:
Experienced software engineer with 3+ years in full-stack development...

Experience:
Software Engineer at XYZ Corp (2021-Present)
- Developed and maintained web applications using React and Node.js
- Improved application performance by 40%..."
                className="input-dark min-h-[300px] resize-none font-mono text-sm"
              />
              
              <Button
                variant="hero"
                onClick={analyzeResume}
                disabled={!resumeText.trim() || isAnalyzing}
                className="w-full mt-4"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {analysis ? (
                <>
                  {/* Score Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-6 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-3">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className={getScoreColor(analysis.score)}
                            strokeDasharray={getScoreRing(analysis.score).circumference}
                            strokeDashoffset={getScoreRing(analysis.score).offset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                            {analysis.score}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                    
                    <div className="glass-card p-6 text-center">
                      <div className="relative w-24 h-24 mx-auto mb-3">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className={getScoreColor(analysis.atsScore)}
                            strokeDasharray={getScoreRing(analysis.atsScore).circumference}
                            strokeDashoffset={getScoreRing(analysis.atsScore).offset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                            {analysis.atsScore}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">ATS Score</div>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="glass-card p-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="glass-card p-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-400">
                      <AlertCircle className="w-5 h-5" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {analysis.improvements.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Keywords */}
                  {analysis.keywords_missing && analysis.keywords_missing.length > 0 && (
                    <div className="glass-card p-6">
                      <h4 className="font-semibold mb-3 text-primary">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords_missing.map((keyword, i) => (
                          <span key={i} className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Download - Pro Feature */}
                  <Button 
                    variant="pro" 
                    className="w-full gap-2"
                    onClick={handleEnhanceResume}
                  >
                    {isPro ? (
                      <>
                        <Download className="w-5 h-5" />
                        Download Enhanced Resume
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Download Enhanced Resume (Pro)
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="glass-card p-16 text-center h-full flex flex-col items-center justify-center">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Analysis Yet</h3>
                  <p className="text-muted-foreground">
                    Paste your resume text and click Analyze to get AI-powered suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeEnhancer;
