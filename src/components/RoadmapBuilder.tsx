import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Map, Sparkles, Download, Loader2, CheckCircle, Circle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoadmapNode {
  id: string;
  label: string;
  level: number;
  x: number;
  y: number;
  description?: string;
  resources?: { title: string; url: string }[];
  duration?: string;
}

interface RoadmapEdge {
  from: string;
  to: string;
}

const RoadmapBuilder = () => {
  const [subject, setSubject] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<{ nodes: RoadmapNode[]; edges: RoadmapEdge[] } | null>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);

  const generateRoadmap = async () => {
    if (!subject.trim()) return;
    
    setIsGenerating(true);
    setCompletedNodes(new Set());
    
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

  const toggleNodeComplete = (nodeId: string) => {
    setCompletedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "hsl(187, 94%, 50%)",  // cyan
      "hsl(168, 75%, 45%)",  // teal
      "hsl(142, 70%, 45%)",  // emerald
      "hsl(84, 70%, 45%)",   // lime
      "hsl(45, 90%, 50%)",   // amber
      "hsl(25, 90%, 55%)",   // orange
    ];
    return colors[Math.min(level, colors.length - 1)];
  };

  const getProgress = () => {
    if (!roadmap) return 0;
    return Math.round((completedNodes.size / roadmap.nodes.length) * 100);
  };

  const handleExport = () => {
    if (!roadmap) return;
    
    const dataStr = JSON.stringify(roadmap, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const downloadLink = document.createElement("a");
    downloadLink.href = dataUri;
    downloadLink.download = `roadmap-${subject.replace(/\s+/g, '-')}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("Roadmap exported!");
  };

  return (
    <section id="roadmap" className="py-24 relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Map className="w-4 h-4" />
            <span>AI Roadmap Builder</span>
          </div>
          <h2 className="section-title">Generate Your Learning Roadmap</h2>
          <p className="section-subtitle">
            Enter any tech topic and our AI will create a visual, node-based learning path with resources.
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
            {/* Header with Progress */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Learning Roadmap: <span className="gradient-text">{subject}</span>
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Progress: <span className="text-primary font-semibold">{getProgress()}%</span>
                  </div>
                  <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                </div>
              </div>
              <Button variant="glass" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            {/* SVG Visualization */}
            <div className="overflow-x-auto mb-6">
              <svg width="900" height="650" className="mx-auto">
                {/* Draw edges */}
                {roadmap.edges.map((edge, i) => {
                  const fromNode = roadmap.nodes.find(n => n.id === edge.from);
                  const toNode = roadmap.nodes.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;
                  
                  const isCompleted = completedNodes.has(fromNode.id) && completedNodes.has(toNode.id);
                  
                  return (
                    <line
                      key={i}
                      x1={fromNode.x}
                      y1={fromNode.y + 25}
                      x2={toNode.x}
                      y2={toNode.y - 25}
                      stroke={isCompleted ? "hsl(142 70% 45%)" : "hsl(var(--primary) / 0.3)"}
                      strokeWidth="2"
                      strokeDasharray={isCompleted ? "0" : "6 4"}
                      className="transition-all duration-300"
                    />
                  );
                })}
                
                {/* Draw nodes */}
                {roadmap.nodes.map((node) => {
                  const isCompleted = completedNodes.has(node.id);
                  const isSelected = selectedNode?.id === node.id;
                  
                  return (
                    <g 
                      key={node.id} 
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    >
                      {/* Glow effect for selected */}
                      {isSelected && (
                        <rect
                          x={node.x - 78}
                          y={node.y - 28}
                          width="156"
                          height="56"
                          rx="12"
                          fill="none"
                          stroke={getLevelColor(node.level)}
                          strokeWidth="2"
                          opacity="0.5"
                          className="animate-pulse"
                        />
                      )}
                      
                      {/* Node background */}
                      <rect
                        x={node.x - 72}
                        y={node.y - 22}
                        width="144"
                        height="44"
                        rx="10"
                        fill={isCompleted ? "hsl(142 70% 20%)" : "hsl(var(--card))"}
                        stroke={isCompleted ? "hsl(142 70% 45%)" : getLevelColor(node.level)}
                        strokeWidth="2"
                        className="transition-all duration-300"
                      />
                      
                      {/* Completion indicator */}
                      <g 
                        onClick={(e) => { e.stopPropagation(); toggleNodeComplete(node.id); }}
                        className="cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckCircle
                            x={node.x - 62}
                            y={node.y - 8}
                            width={16}
                            height={16}
                            className="text-green-400 fill-current"
                          />
                        ) : (
                          <Circle
                            x={node.x - 62}
                            y={node.y - 8}
                            width={16}
                            height={16}
                            className="text-muted-foreground"
                          />
                        )}
                      </g>
                      
                      {/* Node label */}
                      <text
                        x={node.x + 5}
                        y={node.y + 5}
                        textAnchor="middle"
                        fill={isCompleted ? "hsl(142 70% 70%)" : "hsl(var(--foreground))"}
                        fontSize="11"
                        fontWeight="500"
                      >
                        {node.label.length > 18 ? node.label.substring(0, 18) + "..." : node.label}
                      </text>
                      
                      {/* Duration badge */}
                      {node.duration && (
                        <text
                          x={node.x + 5}
                          y={node.y + 18}
                          textAnchor="middle"
                          fill="hsl(var(--muted-foreground))"
                          fontSize="8"
                        >
                          {node.duration}
                        </text>
                      )}
                      
                      {/* Level indicator */}
                      <circle
                        cx={node.x + 58}
                        cy={node.y}
                        r="6"
                        fill={getLevelColor(node.level)}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="glass-card p-6 mt-4 animate-fade-in">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      {selectedNode.label}
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getLevelColor(selectedNode.level) }}
                      />
                    </h4>
                    {selectedNode.duration && (
                      <p className="text-sm text-muted-foreground">Duration: {selectedNode.duration}</p>
                    )}
                  </div>
                  <Button
                    variant={completedNodes.has(selectedNode.id) ? "glass" : "hero"}
                    size="sm"
                    onClick={() => toggleNodeComplete(selectedNode.id)}
                  >
                    {completedNodes.has(selectedNode.id) ? "Mark Incomplete" : "Mark Complete"}
                  </Button>
                </div>
                
                {selectedNode.description && (
                  <p className="text-sm text-muted-foreground mb-4">{selectedNode.description}</p>
                )}
                
                {selectedNode.resources && selectedNode.resources.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold mb-2">Learning Resources</h5>
                    <div className="space-y-2">
                      {selectedNode.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {resource.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLevelColor(0) }} />
                <span>Beginner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLevelColor(2) }} />
                <span>Intermediate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getLevelColor(4) }} />
                <span>Advanced</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Completed</span>
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
