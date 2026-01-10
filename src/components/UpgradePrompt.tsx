import { Button } from "@/components/ui/button";
import { Crown, Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  feature: string;
  message?: string;
  onClose?: () => void;
  inline?: boolean;
}

const UpgradePrompt = ({ feature, message, onClose, inline = false }: UpgradePromptProps) => {
  const navigate = useNavigate();

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
        <Crown className="w-4 h-4 flex-shrink-0" />
        <span>{message || `${feature} is a Pro feature`}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-amber-400 hover:text-amber-300 h-auto p-1"
          onClick={() => navigate('/pricing')}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="glass-card p-8 max-w-md w-full mx-4 relative animate-scale-in">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
          <p className="text-muted-foreground mb-6">
            {message || `${feature} is a Pro feature. Upgrade now to unlock unlimited access and advanced tools.`}
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="pro" 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/pricing')}
            >
              <Zap className="w-5 h-5" />
              Upgrade to Pro – ₹99/month
            </Button>
            
            {onClose && (
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={onClose}
              >
                Maybe Later
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
