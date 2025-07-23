import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ProjectCard } from "@/components/project-card";
import { FreelancerCard } from "@/components/freelancer-card";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch featured projects
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch top freelancers
  const { data: freelancers = [] } = useQuery({
    queryKey: ["/api/freelancers"],
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/projects?search=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation("/projects");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const popularSearches = [
    "Web Development", "Logo Design", "Content Writing", "Digital Marketing", "Mobile App"
  ];

  const stats = [
    { value: "2.5M+", label: "Projects Completed" },
    { value: "800K+", label: "Active Freelancers" },
    { value: "400K+", label: "Happy Clients" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const howItWorksSteps = [
    {
      step: 1,
      title: "Post Your Project",
      description: "Describe your project requirements, set your budget, and publish it to our marketplace of talented freelancers.",
      color: "bg-primary"
    },
    {
      step: 2,
      title: "Choose a Freelancer",
      description: "Review proposals from qualified freelancers, check their portfolios, and select the best fit for your project.",
      color: "bg-purple-600"
    },
    {
      step: 3,
      title: "Get Work Done",
      description: "Collaborate securely through our platform, track progress, and pay safely when you're satisfied with the results.",
      color: "bg-green-600"
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the perfect <span className="text-yellow-300">freelance</span> services for your business
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with skilled professionals from around the world and get your projects done efficiently
            </p>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        type="text"
                        placeholder="Search for any service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-12 py-4 text-lg border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleSearch}
                    size="lg"
                    className="py-4 px-8 text-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Search
                  </Button>
                </div>
                
                <div className="mt-6">
                  <p className="text-gray-600 text-sm mb-3">Popular searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <Badge
                        key={search}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200"
                        onClick={() => {
                          setSearchQuery(search);
                          setLocation(`/projects?search=${encodeURIComponent(search)}`);
                        }}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover exciting opportunities from our top clients</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.slice(0, 6).map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/projects">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                View All Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Freelancers */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Top Freelancers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Work with the best talent from around the world</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {freelancers.slice(0, 4).map((freelancer: any) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/freelancers">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                Browse All Freelancers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get your project done in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className={`${step.color} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6`}>
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">SB Works</h3>
              <p className="text-gray-400 mb-4">Connect with talented freelancers and get your projects done efficiently with our trusted platform.</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">How to Hire</Link></li>
                <li><Link href="#" className="hover:text-white">Talent Marketplace</Link></li>
                <li><Link href="#" className="hover:text-white">Project Catalog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">For Freelancers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">How to Find Work</Link></li>
                <li><Link href="#" className="hover:text-white">Direct Contracts</Link></li>
                <li><Link href="#" className="hover:text-white">Find Freelance Jobs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Help & Support</Link></li>
                <li><Link href="#" className="hover:text-white">Trust & Safety</Link></li>
                <li><Link href="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 SB Works. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
