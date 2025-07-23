import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { FreelancerCard } from "@/components/freelancer-card";

export default function Freelancers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  const { data: freelancers = [], isLoading } = useQuery({
    queryKey: ['/api/freelancers'],
  });

  const skills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'PHP', 'Java',
    'UI/UX', 'Figma', 'Adobe XD', 'Photoshop', 'Sketch',
    'Content Writing', 'Copywriting', 'SEO', 'Social Media',
    'Machine Learning', 'Data Analysis', 'SQL', 'MongoDB'
  ];

  const filteredFreelancers = freelancers.filter((freelancer: any) => {
    const matchesSearch = !searchQuery || 
      freelancer.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => freelancer.skills.includes(skill));
    
    const matchesRate = (!minRate || freelancer.hourlyRate >= parseInt(minRate)) &&
      (!maxRate || freelancer.hourlyRate <= parseInt(maxRate));
    
    return matchesSearch && matchesSkills && matchesRate;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Freelancers</h1>
          <p className="text-gray-600">Discover talented professionals for your projects</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter Freelancers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search freelancers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                type="number"
                placeholder="Min rate ($/hr)"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
              />
              
              <Input
                type="number"
                placeholder="Max rate ($/hr)"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
              />

              <Button onClick={() => {
                setSearchQuery('');
                setSelectedSkills([]);
                setMinRate('');
                setMaxRate('');
              }} variant="outline">
                Clear Filters
              </Button>
            </div>

            {/* Skills Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Button
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedSkills.includes(skill)) {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      } else {
                        setSelectedSkills([...selectedSkills, skill]);
                      }
                    }}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {isLoading ? 'Loading...' : `${filteredFreelancers.length} freelancers found`}
          </p>
        </div>

        {/* Freelancers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFreelancers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">No freelancers found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFreelancers.map((freelancer: any) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
