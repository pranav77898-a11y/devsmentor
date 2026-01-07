import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GitBranch, Sparkles, Download, Loader2 } from "lucide-react";

interface MindMapGroup {
  category: string;
  color: string;
  nodes: string[];
}

const MindMapBuilder = () => {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindMap, setMindMap] = useState<MindMapGroup[] | null>(null);

  const generateMindMap = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Sample mind map
    const sampleMindMap: MindMapGroup[] = [
      {
        category: "Core Concepts",
        color: "from-cyan-500 to-cyan-600",
        nodes: ["Components", "JSX", "Virtual DOM", "Props", "State", "Hooks"],
      },
      {
        category: "State Management",
        color: "from-teal-500 to-teal-600",
        nodes: ["useState", "useReducer", "Context API", "Redux", "Zustand", "Jotai"],
      },
      {
        category: "Routing",
        color: "from-emerald-500 to-emerald-600",
        nodes: ["React Router", "Dynamic Routes", "Nested Routes", "Protected Routes"],
      },
      {
        category: "Data Fetching",
        color: "from-green-500 to-green-600",
        nodes: ["useEffect", "React Query", "SWR", "Axios", "Fetch API"],
      },
      {
        category: "Styling",
        color: "from-lime-500 to-lime-600",
        nodes: ["CSS Modules", "Tailwind", "Styled Components", "Emotion", "Sass"],
      },
      {
        category: "Testing",
        color: "from-yellow-500 to-yellow-600",
        nodes: ["Jest", "React Testing Library", "Cypress", "Playwright", "Vitest"],
      },
    ];
    
    setMindMap(sampleMindMap);
    setIsGenerating(false);
  };

  return (
    <section id="mindmap" className="py-24 relative bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <GitBranch className="w-4 h-4" />
            <span>AI Mind Map Generator</span>
          </div>
          <h2 className="section-title">Visualize Your Learning</h2>
          <p className="section-subtitle">
            Generate interactive mind maps to understand and organize complex topics visually.
          </p>
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
            />
            <Button
              variant="hero"
              onClick={generateMindMap}
              disabled={!topic.trim() || isGenerating}
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

        {/* Mind Map Visualization */}
        {mindMap && (
          <div className="max-w-6xl mx-auto animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold">
                Mind Map: <span className="gradient-text">{topic}</span>
              </h3>
              <Button variant="glass" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export PNG
              </Button>
            </div>

            {/* Central Node */}
            <div className="relative">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 z-10">
                <div className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-lg shadow-[0_0_40px_hsl(187_94%_50%/0.4)]">
                  {topic}
                </div>
              </div>

              {/* Branch Groups */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-20">
                {mindMap.map((group, index) => (
                  <div key={index} className="mindmap-group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`text-sm font-semibold mb-3 bg-gradient-to-r ${group.color} bg-clip-text text-transparent`}>
                      {group.category}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.nodes.map((node, nodeIndex) => (
                        <span key={nodeIndex} className="mindmap-node">
                          {node}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!mindMap && !isGenerating && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <GitBranch className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">No Mind Map Generated</h3>
            <p className="text-muted-foreground">
              Enter a topic above to generate an interactive mind map.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MindMapBuilder;
