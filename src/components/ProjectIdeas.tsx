import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, ExternalLink, Lock, ChevronDown, ChevronUp } from "lucide-react";

interface Project {
  name: string;
  difficulty: "Beginner" | "Medium" | "Advanced";
  skills: string[];
  description: string;
  category: string;
}

const allProjects: Project[] = [
  // Web Development
  { name: "Personal Portfolio Website", difficulty: "Beginner", skills: ["HTML", "CSS", "JavaScript"], description: "Build a stunning portfolio to showcase your work and skills.", category: "Web Development" },
  { name: "Todo App with Local Storage", difficulty: "Beginner", skills: ["React", "LocalStorage", "CSS"], description: "Classic project to master CRUD operations and state management.", category: "Web Development" },
  { name: "Weather Dashboard", difficulty: "Beginner", skills: ["API Integration", "React", "CSS"], description: "Fetch weather data and display with beautiful visualizations.", category: "Web Development" },
  { name: "Blog Platform with CMS", difficulty: "Medium", skills: ["Next.js", "MDX", "Tailwind"], description: "Create a markdown-powered blog with admin dashboard.", category: "Web Development" },
  { name: "E-commerce Store", difficulty: "Medium", skills: ["React", "Stripe", "Node.js"], description: "Full shopping experience with cart, checkout, and payments.", category: "Web Development" },
  { name: "Real-time Chat Application", difficulty: "Medium", skills: ["Socket.io", "Node.js", "React"], description: "Build WhatsApp-like chat with real-time messaging.", category: "Web Development" },
  { name: "Social Media Dashboard", difficulty: "Advanced", skills: ["React", "GraphQL", "PostgreSQL"], description: "Analytics dashboard aggregating social media metrics.", category: "Web Development" },
  { name: "Video Streaming Platform", difficulty: "Advanced", skills: ["Next.js", "HLS", "AWS S3"], description: "YouTube-like platform with video upload and streaming.", category: "Web Development" },
  
  // AI/ML
  { name: "Sentiment Analysis Tool", difficulty: "Beginner", skills: ["Python", "NLTK", "Flask"], description: "Analyze text sentiment using NLP techniques.", category: "AI/ML" },
  { name: "Image Classification App", difficulty: "Medium", skills: ["TensorFlow", "CNN", "React"], description: "Classify images using pre-trained models.", category: "AI/ML" },
  { name: "Chatbot with LLM", difficulty: "Medium", skills: ["OpenAI API", "LangChain", "Python"], description: "Build an intelligent chatbot using LLMs.", category: "AI/ML" },
  { name: "Recommendation System", difficulty: "Advanced", skills: ["Python", "Collaborative Filtering", "ML"], description: "Netflix-style recommendation engine.", category: "AI/ML" },
  
  // Mobile
  { name: "Expense Tracker", difficulty: "Beginner", skills: ["React Native", "AsyncStorage"], description: "Track daily expenses with charts.", category: "Mobile" },
  { name: "Fitness Tracker", difficulty: "Medium", skills: ["Flutter", "Firebase", "Charts"], description: "Track workouts and visualize progress.", category: "Mobile" },
  { name: "Food Delivery App", difficulty: "Advanced", skills: ["React Native", "Node.js", "Maps"], description: "Complete food delivery with real-time tracking.", category: "Mobile" },
  
  // DevOps
  { name: "CI/CD Pipeline Setup", difficulty: "Beginner", skills: ["GitHub Actions", "Docker"], description: "Automate testing and deployment.", category: "DevOps" },
  { name: "Kubernetes Cluster", difficulty: "Medium", skills: ["K8s", "Helm", "Terraform"], description: "Deploy applications on Kubernetes.", category: "DevOps" },
  { name: "Infrastructure as Code", difficulty: "Advanced", skills: ["Terraform", "AWS", "Ansible"], description: "Provision cloud infrastructure programmatically.", category: "DevOps" },
  
  // Cybersecurity
  { name: "Password Manager", difficulty: "Medium", skills: ["Python", "Encryption", "SQLite"], description: "Secure password storage with encryption.", category: "Cybersecurity" },
  { name: "Network Scanner", difficulty: "Medium", skills: ["Python", "Nmap", "Sockets"], description: "Scan networks for open ports and vulnerabilities.", category: "Cybersecurity" },
  
  // Data Science
  { name: "COVID-19 Dashboard", difficulty: "Beginner", skills: ["Python", "Pandas", "Plotly"], description: "Visualize pandemic data interactively.", category: "Data Science" },
  { name: "Stock Price Predictor", difficulty: "Medium", skills: ["Python", "LSTM", "yfinance"], description: "Predict stock prices using ML.", category: "Data Science" },
  { name: "Customer Churn Analysis", difficulty: "Advanced", skills: ["Python", "XGBoost", "Feature Engineering"], description: "Predict customer churn for businesses.", category: "Data Science" },
];

const categories = ["All", "Web Development", "AI/ML", "Mobile", "DevOps", "Cybersecurity", "Data Science"];

const ProjectIdeas = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const filteredProjects = selectedCategory === "All" 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedCategory);

  const displayedProjects = showAll ? filteredProjects : filteredProjects.slice(0, 6);

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "difficulty-beginner";
      case "Medium": return "difficulty-medium";
      case "Advanced": return "difficulty-advanced";
      default: return "";
    }
  };

  return (
    <section id="projects" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Rocket className="w-4 h-4" />
            <span>100+ Project Ideas</span>
          </div>
          <h2 className="section-title">Build Real-World Projects</h2>
          <p className="section-subtitle">
            Resume-ready project ideas with difficulty levels and required skills. Perfect for learning and impressing recruiters.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setShowAll(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedProjects.map((project, index) => (
            <div 
              key={index} 
              className="project-card animate-fade-in"
              style={{ animationDelay: `${(index % 6) * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`difficulty-badge ${getDifficultyClass(project.difficulty)}`}>
                  {project.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">{project.category}</span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.skills.map((skill, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                    {skill}
                  </span>
                ))}
              </div>
              
              <Button variant="ghost" size="sm" className="w-full gap-2">
                View Details
                <Lock className="w-3 h-3 text-yellow-500" />
              </Button>
            </div>
          ))}
        </div>

        {/* Show More/Less */}
        {filteredProjects.length > 6 && (
          <div className="text-center">
            <Button
              variant="glass"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show All {filteredProjects.length} Projects <ChevronDown className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Pro Feature Banner */}
        <div className="mt-12 glass-card p-8 text-center border-primary/30">
          <h3 className="text-xl font-semibold mb-2">Want Detailed Project Guides?</h3>
          <p className="text-muted-foreground mb-4">
            Get step-by-step tutorials, code snippets, and GitHub templates for every project.
          </p>
          <Button variant="pro">
            Unlock Pro Access – ₹99
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectIdeas;
