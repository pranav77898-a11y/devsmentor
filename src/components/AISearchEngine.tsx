import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ExternalLink, Loader2, BookOpen, Video, FileText, Code } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  title: string;
  description: string;
  url: string;
  type: "documentation" | "tutorial" | "video" | "article" | "code";
  source: string;
}

const AISearchEngine = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchWithAI = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query }
      });

      if (error) throw error;
      
      setResults(data.results || []);
      toast.success(`Found ${data.results?.length || 0} results!`);
    } catch (error) {
      console.error("AI search error:", error);
      toast.error("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "documentation": return <BookOpen className="w-4 h-4" />;
      case "video": return <Video className="w-4 h-4" />;
      case "tutorial": return <FileText className="w-4 h-4" />;
      case "code": return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "documentation": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "video": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "tutorial": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "code": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section id="ai-search" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI Search Engine</span>
          </div>
          <h2 className="section-title">Search Tech Resources with AI</h2>
          <p className="section-subtitle">
            Find documentation, tutorials, videos, and code examples using AI-powered search.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="e.g., How to use React hooks, Python async tutorial..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-dark pl-12 w-full"
                  onKeyDown={(e) => e.key === 'Enter' && searchWithAI()}
                />
              </div>
              <Button
                variant="hero"
                onClick={searchWithAI}
                disabled={!query.trim() || isSearching}
                className="md:w-auto w-full"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Search with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">AI is searching...</h3>
            <p className="text-muted-foreground">
              Finding the best resources for "{query}"
            </p>
          </div>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="glass-card-hover p-6 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{result.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getTypeColor(result.type)}`}>
                        {getTypeIcon(result.type)}
                        {result.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{result.description}</p>
                    <span className="text-xs text-muted-foreground">{result.source}</span>
                  </div>
                  <Button 
                    variant="hero" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}
                  >
                    Visit
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && results.length === 0 && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Search for Resources</h3>
            <p className="text-muted-foreground">
              Enter a topic to find documentation, tutorials, and learning resources.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AISearchEngine;
