import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Map, Sparkles, Download, Edit3, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoadmapNode {
  id: string;
  label: string;
  level: number;
  x: number;
  y: number;
}

interface RoadmapEdge {
  from: string;
  to: string;
}

const RoadmapBuilder = () => {
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<{ nodes: RoadmapNode[]; edges: RoadmapEdge[] } | null>(null);

  const generateRoadmap = async () => {
    if (!subject.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { subject }
      });

      if (error) throw error;
      
      setRoadmap(data);
      toast.success("Roadmap generated successfully!");
    } catch (error) {
      console.error("Roadmap generation error:", error);
      toast.error("Failed to generate roadmap. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "from-cyan-500 to-cyan-600",
      "from-teal-500 to-teal-600",
      "from-emerald-500 to-emerald-600",
      "from-green-500 to-green-600",
      "from-lime-500 to-lime-600",
      "from-yellow-500 to-yellow-600",
    ];
    return colors[level % colors.length];
  };

  return (
    <section id="roadmap" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Map className="w-4 h-4" />
            <span>AI Roadmap Builder</span>
          </div>
          <h2 className="section-title">Generate Your Learning Roadmap</h2>
          <p className="section-subtitle">
            Enter any tech topic and our AI will create a visual, node-based learning path customized for you.
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g., Full Stack Development, Machine Learning, React..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-dark flex-1"
              onKeyDown={(e) => e.key === 'Enter' && generateRoadmap()}
            />
            <Button
              variant="hero"
              onClick={generateRoadmap}
              disabled={!subject.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Roadmap Visualization */}
        {roadmap && (
          <div className="glass-card p-6 animate-slide-up">
            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                Learning Roadmap: <span className="gradient-text">{subject}</span>
              </h3>
              <div className="flex gap-2">
                <Button variant="glass" size="sm" className="gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit
                  <Lock className="w-3 h-3 text-yellow-500" />
                </Button>
                <Button variant="glass" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                  <Lock className="w-3 h-3 text-yellow-500" />
                </Button>
              </div>
            </div>

            {/* SVG Visualization */}
            <div className="overflow-x-auto">
              <svg width="800" height="560" className="mx-auto">
                {/* Draw edges */}
                {roadmap.edges.map((edge, i) => {
                  const fromNode = roadmap.nodes.find(n => n.id === edge.from);
                  const toNode = roadmap.nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  return (
                    <line
                      key={i}
                      x1={fromNode.x}
                      y1={fromNode.y + 20}
                      x2={toNode.x}
                      y2={toNode.y - 20}
                      className="node-connector"
                      strokeDasharray="4 4"
                    />
                  );
                })}
                
                {/* Draw nodes */}
                {roadmap.nodes.map((node) => (
                  <g key={node.id} className="cursor-pointer">
                    <rect
                      x={node.x - 65}
                      y={node.y - 20}
                      width="130"
                      height="40"
                      rx="8"
                      className="fill-card stroke-primary/50"
                      strokeWidth="1.5"
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      className="fill-foreground text-xs font-medium"
                    >
                      {node.label}
                    </text>
                    <circle
                      cx={node.x - 50}
                      cy={node.y}
                      r="4"
                      className={`fill-current`}
                      style={{ color: `hsl(${187 - node.level * 15} 80% 50%)` }}
                    />
                  </g>
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span>Beginner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500" />
                <span>Intermediate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Advanced</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!roadmap && !isGenerating && (
          <div className="glass-card p-16 text-center">
            <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Roadmap Generated</h3>
            <p className="text-muted-foreground">
              Enter a topic above and click Generate to create your personalized learning roadmap.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RoadmapBuilder;
