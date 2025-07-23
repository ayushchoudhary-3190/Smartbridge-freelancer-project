import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Award, 
  ExternalLink,
  MessageCircle,
  Heart,
  Share2
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export default function FreelancerProfile() {
  const { userId } = useParams();
  const currentUser = getCurrentUser();

  // Fetch freelancer profile
  const { data: freelancer, isLoading } = useQuery({
    queryKey: ['/api/freelancers', userId],
    queryFn: async () => {
      const response = await fetch(`/api/freelancers/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch freelancer profile');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg">Freelancer profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rating = freelancer.rating ? freelancer.rating / 20 : 0; // Convert 0-100 to 0-5

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <Avatar className="w-32 h-32">
                <AvatarImage src={freelancer.user.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {freelancer.user.fullName.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {freelancer.user.fullName}
                </h1>
                <p className="text-xl text-gray-600 mb-3">{freelancer.title}</p>
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < rating ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {rating.toFixed(1)} ({freelancer.reviewCount} reviews)
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Member since {new Date(freelancer.user.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-3">
              <div className="text-3xl font-bold text-primary">
                ${freelancer.hourlyRate}/hr
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {currentUser && currentUser.userType === 'client' && (
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  {/* Bio */}
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {freelancer.bio || "No bio provided yet."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {freelancer.skills.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Experience */}
                  {freelancer.experience && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Experience</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {freelancer.experience}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="portfolio">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {freelancer.portfolio.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No portfolio items yet</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {freelancer.portfolio.map((item: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            {item.image && (
                              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                                <img 
                                  src={item.image} 
                                  alt={item.title}
                                  className="max-w-full max-h-full object-cover rounded-lg"
                                />
                              </div>
                            )}
                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                            {item.url && (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary hover:text-blue-700 text-sm"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View Project
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <p>No reviews yet</p>
                      <p className="text-sm">Reviews will appear here after completed projects</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <span className="text-gray-600">Projects Completed</span>
                  </div>
                  <span className="font-semibold">{freelancer.completedProjects}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-600">Average Rating</span>
                  </div>
                  <span className="font-semibold">{rating.toFixed(1)}/5</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-gray-600">Hourly Rate</span>
                  </div>
                  <span className="font-semibold">${freelancer.hourlyRate}/hr</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">On-time Delivery</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Repeat Hire Rate</span>
                    <span className="font-medium">80%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            {currentUser && currentUser.userType === 'client' && (
              <Card>
                <CardHeader>
                  <CardTitle>Hire {freelancer.user.fullName.split(' ')[0]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">
                      ${freelancer.hourlyRate}/hr
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Starting rate for this freelancer
                    </p>
                  </div>
                  
                  <Button className="w-full" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Now
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Invite to Project
                  </Button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Response usually within a few hours
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Verification */}
            <Card>
              <CardHeader>
                <CardTitle>Verifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm">Email verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-sm">Profile complete</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xs">-</span>
                  </div>
                  <span className="text-sm text-gray-500">Identity not verified</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
