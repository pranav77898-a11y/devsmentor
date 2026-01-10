import { Crown } from "lucide-react";

interface UsageBadgeProps {
  used: number;
  limit: number;
  feature: string;
}

const UsageBadge = ({ used, limit, feature }: UsageBadgeProps) => {
  const remaining = Math.max(0, limit - used);
  const isLow = remaining <= 1;
  const isExhausted = remaining === 0;

  return (
    <div 
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
        isExhausted 
          ? 'bg-red-500/10 border-red-500/20 text-red-400'
          : isLow 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-muted/50 border-border text-muted-foreground'
      }`}
    >
      <Crown className="w-3 h-3" />
      <span>
        {remaining}/{limit} {feature} remaining today
      </span>
    </div>
  );
};

export default UsageBadge;
