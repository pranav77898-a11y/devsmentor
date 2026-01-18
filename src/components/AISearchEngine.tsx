import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ExternalLink, Loader2, BookOpen, Video, FileText, Code } from "lucide-react";
import { toast } from "sonner";

interface SearchResult {
  title: string;
  description: string;
  url: string;
  type: "documentation" | "tutorial" | "video" | "article" | "code";
  source: string;
}

// Static sample search results
const sampleResults: Record<string, SearchResult[]> = {
  react: [
    { title: "React Official Documentation", description: "Learn React from the official docs with step-by-step tutorials.", url: "https://react.dev", type: "documentation", source: "react.dev" },
    { title: "React Hooks Tutorial", description: "Complete guide to React Hooks - useState, useEffect, and more.", url: "https://react.dev/learn", type: "tutorial", source: "react.dev" },
    { title: "React Crash Course 2024", description: "Learn React in 2 hours with this comprehensive crash course.", url: "https://youtube.com", type: "video", source: "YouTube" },
    { title: "Building a React App from Scratch", description: "Step-by-step guide to creating your first React application.", url: "https://freecodecamp.org", type: "article", source: "freeCodeCamp" },
  ],
  python: [
    { title: "Python Official Documentation", description: "The official Python documentation and tutorials.", url: "https://docs.python.org", type: "documentation", source: "python.org" },
    { title: "Python for Beginners", description: "Learn Python programming from scratch with practical examples.", url: "https://python.org/about/gettingstarted", type: "tutorial", source: "Python.org" },
    { title: "Python Full Course", description: "Complete Python tutorial for beginners to advanced.", url: "https://youtube.com", type: "video", source: "YouTube" },
    { title: "100 Days of Python", description: "Master Python with 100 days of coding challenges.", url: "https://udemy.com", type: "tutorial", source: "Udemy" },
  ],
  javascript: [
    { title: "MDN JavaScript Guide", description: "Comprehensive JavaScript documentation and tutorials.", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", type: "documentation", source: "MDN" },
    { title: "JavaScript ES6+ Features", description: "Modern JavaScript features you should know.", url: "https://javascript.info", type: "tutorial", source: "javascript.info" },
    { title: "JavaScript Projects for Beginners", description: "Build 10 projects to learn JavaScript practically.", url: "https://youtube.com", type: "video", source: "YouTube" },
    { title: "Eloquent JavaScript", description: "Free book on modern JavaScript programming.", url: "https://eloquentjavascript.net", type: "article", source: "eloquentjavascript.net" },
  ],
  default: [
    { title: "freeCodeCamp", description: "Learn to code for free with thousands of tutorials and projects.", url: "https://freecodecamp.org", type: "tutorial", source: "freeCodeCamp" },
    { title: "MDN Web Docs", description: "Resources for developers, by developers.", url: "https://developer.mozilla.org", type: "documentation", source: "MDN" },
    { title: "Stack Overflow", description: "Where developers learn, share, and build careers.", url: "https://stackoverflow.com", type: "code", source: "Stack Overflow" },
    { title: "GitHub Learning Lab", description: "Grow your skills with hands-on learning experiences.", url: "https://skills.github.com", type: "tutorial", source: "GitHub" },
  ],
};

const AISearchEngine = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchResources = async () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowerQuery = query.toLowerCase();
    let searchResults: SearchResult[] = [];
    
    if (lowerQuery.includes("react")) {
      searchResults = sampleResults.react;
    } else if (lowerQuery.includes("python")) {
      searchResults = sampleResults.python;
    } else if (lowerQuery.includes("javascript") || lowerQuery.includes("js")) {
      searchResults = sampleResults.javascript;
    } else {
      searchResults = sampleResults.default;
    }
    
    setResults(searchResults);
    toast.success(`Found ${searchResults.length} results!`);
    setIsSearching(false);
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
            <span>Resource Search</span>
          </div>
          <h2 className="section-title">Search Tech Resources</h2>
          <p className="section-subtitle">
            Find documentation, tutorials, videos, and code examples for any technology.
          </p>
        </div>

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
                  onKeyDown={(e) => e.key === 'Enter' && searchResources()}
                />
              </div>
              <Button
                variant="hero"
                onClick={searchResources}
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
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {isSearching && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Searching...</h3>
            <p className="text-muted-foreground">Finding the best resources for "{query}"</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-4">
            {results.map((result, index) => (
              <div key={index} className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
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
                  <Button variant="hero" size="sm" className="gap-2" onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}>
                    Visit
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isSearching && results.length === 0 && (
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground">Search for Resources</h3>
            <p className="text-muted-foreground">Enter a topic to find documentation, tutorials, and learning resources.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AISearchEngine;
