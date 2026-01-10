import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GitBranch, Sparkles, Download, Loader2, ZoomIn, ZoomOut, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSubscription } from "@/hooks/useSubscription";
import UpgradePrompt from "@/components/UpgradePrompt";

interface MindMapNode {
  id: string;
  label: string;
  category: string;
  color: string;
  x: number;
  y: number;
  connections: string[];
}

interface MindMapData {
  centralTopic: string;
  nodes: MindMapNode[];
}

const MindMapBuilder = () => {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindMap, setMindMap] = useState<MindMapData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const { isPro } = useSubscription();

  const generateMindMap = async () => {
    if (!topic.trim()) return;
    
    // Check if user is Pro for full interactive mind maps
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-mindmap', {
        body: { topic }
      });

      if (error) throw error;
      
      setMindMap(data);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      toast.success("Mind map generated successfully!");
    } catch (error) {
      console.error("Mind map generation error:", error);
      toast.error("Failed to generate mind map. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;
      ctx?.fillRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(img, 0, 0);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `mindmap-${topic.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    toast.success("Mind map exported!");
  };

  return (
    <section id="mindmap" className="py-24 relative bg-muted/20">
      {showUpgrade && (
        <UpgradePrompt 
          feature="Interactive Mind Maps" 
          message="Upgrade to Pro to generate and export interactive node-based mind maps!"
          onClose={() => setShowUpgrade(false)}
        />
      )}
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <GitBranch className="w-4 h-4" />
            <span>AI Mind Map Generator</span>
          </div>
          <h2 className="section-title">Visualize Your Learning</h2>
          <p className="section-subtitle">
            Generate interactive node-based mind maps to understand and organize complex topics visually.
          </p>
          
          {/* Pro/Free indicator */}
          <div className="mt-4 flex justify-center">
            {isPro ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
                <Crown className="w-3 h-3" />
                <span>Full Interactive Mind Maps</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 border border-border text-muted-foreground">
                <Lock className="w-3 h-3" />
                <span>Pro Feature • Upgrade to Access</span>
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g., React.js, Python, System Design..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="input-dark flex-1"
              onKeyDown={(e) => e.key === 'Enter' && generateMindMap()}
            />
            <Button
              variant={isPro ? "hero" : "pro"}
              onClick={generateMindMap}
              disabled={!topic.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : isPro ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pro Feature
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Mind Map Visualization */}
        {mindMap && (
          <div className="max-w-6xl mx-auto animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Mind Map: <span className="gradient-text">{mindMap.centralTopic}</span>
              </h3>
              <div className="flex gap-2">
                <Button variant="glass" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="glass" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="glass" size="sm" className="gap-2" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                  Export PNG
                </Button>
              </div>
            </div>

            {/* SVG Mind Map */}
            <div className="glass-card p-4 overflow-hidden" style={{ height: '600px' }}>
              <svg 
                ref={svgRef}
                width="100%" 
                height="100%" 
                viewBox="0 0 1200 600"
                style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
                className="transition-transform duration-200"
              >
                {/* Background */}
                <rect width="1200" height="600" fill="hsl(240 10% 5%)" />
                
                {/* Connection lines */}
                {mindMap.nodes.map((node) => (
                  node.connections.map((targetId, i) => {
                    const targetNode = mindMap.nodes.find(n => n.id === targetId);
                    if (!targetNode) return null;
                    
                    const cx = 600;
                    const cy = 300;
                    const midX = (cx + node.x) / 2;
                    const midY = (cy + node.y) / 2 + (Math.random() * 20 - 10);
                    
                    return (
                      <path
                        key={`${node.id}-${targetId}-${i}`}
                        d={`M ${cx} ${cy} Q ${midX} ${midY} ${node.x} ${node.y}`}
                        stroke={node.color}
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                        className="transition-all duration-300 hover:opacity-100 hover:stroke-[3]"
                      />
                    );
                  })
                ))}

                {/* Draw lines from center to each node */}
                {mindMap.nodes.map((node) => {
                  const cx = 600;
                  const cy = 300;
                  const midX = (cx + node.x) / 2;
                  const midY = (cy + node.y) / 2;
                  
                  return (
                    <path
                      key={`line-${node.id}`}
                      d={`M ${cx} ${cy} Q ${midX + (node.x > cx ? 30 : -30)} ${midY} ${node.x} ${node.y}`}
                      stroke={node.color}
                      strokeWidth="2"
                      fill="none"
                      opacity="0.5"
                      strokeDasharray="5,5"
                    />
                  );
                })}

                {/* Central Node */}
                <g className="cursor-pointer">
                  <circle
                    cx="600"
                    cy="300"
                    r="60"
                    fill="url(#centerGradient)"
                    stroke="hsl(187 94% 50%)"
                    strokeWidth="3"
                    className="drop-shadow-[0_0_20px_hsl(187_94%_50%/0.5)]"
                  />
                  <text
                    x="600"
                    y="305"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {mindMap.centralTopic.length > 15 
                      ? mindMap.centralTopic.substring(0, 15) + "..." 
                      : mindMap.centralTopic}
                  </text>
                </g>

                {/* Category Nodes */}
                {mindMap.nodes.map((node) => (
                  <g key={node.id} className="cursor-pointer group">
                    <rect
                      x={node.x - 70}
                      y={node.y - 25}
                      width="140"
                      height="50"
                      rx="10"
                      fill="hsl(240 10% 8%)"
                      stroke={node.color}
                      strokeWidth="2"
                      className="transition-all duration-300 group-hover:stroke-[3] group-hover:fill-[hsl(240_10%_12%)]"
                      style={{
                        filter: `drop-shadow(0 0 10px ${node.color}40)`
                      }}
                    />
                    
                    <text
                      x={node.x}
                      y={node.y - 5}
                      textAnchor="middle"
                      fill={node.color}
                      fontSize="10"
                      fontWeight="600"
                    >
                      {node.category}
                    </text>
                    
                    <text
                      x={node.x}
                      y={node.y + 12}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="500"
                    >
                      {node.label.length > 18 ? node.label.substring(0, 18) + "..." : node.label}
                    </text>
                  </g>
                ))}

                {/* Gradient definition */}
                <defs>
                  <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(187 94% 50%)" />
                    <stop offset="100%" stopColor="hsl(168 75% 40%)" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              {Array.from(new Set(mindMap.nodes.map(n => n.category))).slice(0, 6).map((category, i) => {
                const node = mindMap.nodes.find(n => n.category === category);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: node?.color || '#22d3ee' }}
                    />
                    <span>{category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!mindMap && !isGenerating && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">
              {isPro ? "No Mind Map Generated" : "Pro Feature"}
            </h3>
            <p className="text-muted-foreground">
              {isPro 
                ? "Enter a topic above to generate an interactive node-based mind map."
                : "Upgrade to Pro to generate interactive mind maps with export functionality."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MindMapBuilder;
