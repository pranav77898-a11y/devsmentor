import { Button } from "@/components/ui/button";
import { Check, X, Zap, Crown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PricingSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const freeFeatures = [
    { name: "Career Analysis (3/day)", included: true },
    { name: "Basic Roadmaps", included: true },
    { name: "View Mind Maps", included: true },
    { name: "10 Project Ideas", included: true },
    { name: "Job Search (5/day)", included: true },
    { name: "Resume Analysis", included: true },
    { name: "AI Search (5/day)", included: true },
    { name: "Editable Roadmaps", included: false },
    { name: "Export Roadmaps/Mind Maps", included: false },
    { name: "100+ Detailed Projects", included: false },
    { name: "AI Resume Enhancement", included: false },
    { name: "Priority Support", included: false },
  ];

  const proFeatures = [
    { name: "Unlimited Career Analysis", included: true },
    { name: "AI Roadmap Builder", included: true },
    { name: "Interactive Mind Maps", included: true },
    { name: "100+ Project Ideas", included: true },
    { name: "Advanced Job Finder", included: true },
    { name: "AI Resume Enhancer", included: true },
    { name: "Unlimited AI Search", included: true },
    { name: "Editable Roadmaps", included: true },
    { name: "Export to PNG/PDF", included: true },
    { name: "Step-by-Step Tutorials", included: true },
    { name: "GitHub Templates", included: true },
    { name: "Priority Support", included: true },
  ];

  const handleGetStarted = () => {
    if (user) {
      navigate("/career");
    } else {
      navigate("/signup");
    }
  };

  const handleUpgrade = () => {
    if (!user) {
      toast.info("Please sign up first to upgrade to Pro");
      navigate("/signup");
      return;
    }
    // TODO: Integrate Razorpay payment
    toast.info("Pro upgrade coming soon! We're integrating Razorpay payment.");
  };

  return (
    <section id="pricing" className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Crown className="w-4 h-4" />
            <span>Simple Pricing</span>
          </div>
          <h2 className="section-title">Start Free, Upgrade When Ready</h2>
          <p className="section-subtitle">
            Get started with powerful free features. Upgrade to Pro for unlimited AI access and advanced tools.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="pricing-card-free">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-2">₹0</div>
              <p className="text-muted-foreground text-sm">Forever free</p>
            </div>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
                  )}
                  <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <Button variant="glass" className="w-full" size="lg" onClick={handleGetStarted}>
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card-pro relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 gradient-text">Pro</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold gradient-text">₹99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">Cancel anytime</p>
            </div>

            <ul className="space-y-4 mb-8">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature.name}</span>
                </li>
              ))}
            </ul>

            <Button variant="pro" className="w-full" size="lg" onClick={handleUpgrade}>
              <Zap className="w-5 h-5" />
              Upgrade to Pro – ₹99
            </Button>

            {/* Guarantee */}
            <p className="text-center text-xs text-muted-foreground mt-4">
              7-day money-back guarantee • Secure payment via Razorpay
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-8 mt-16 text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm">Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-sm">Razorpay Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm">7-Day Refund</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
