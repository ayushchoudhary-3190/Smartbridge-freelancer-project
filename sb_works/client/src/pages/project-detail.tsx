import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Clock, 
  DollarSign, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Send,
  Heart,
  Share2
} from "lucide-react";
import { getCurrentUser, getAuthToken } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApplicationSchema, InsertApplication } from "@shared/schema";

export default function ProjectDetail() {
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();
  const { toast } = useToast();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Fetch project details
  const { data: project, isLoading } = useQuery({
    queryKey: ['/api/projects', id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
  });

  // Fetch applications (only if user is the client)
  const { data: applications = [] } = useQuery({
    queryKey: ['/api/projects', id, 'applications'],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}/applications`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    },
    enabled: !!currentUser && !!project && project.clientId === currentUser.id,
  });

  const applicationForm = useForm<InsertApplication>({
    resolver: zodResolver(insertApplicationSchema.omit({ projectId: true, freelancerId: true })),
    defaultValues: {
      coverLetter: "",
      proposedRate: "",
      estimatedDuration: "",
      portfolio: [],
    },
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (applicationData: Omit<InsertApplication, 'projectId' | 'freelancerId'>) => {
      return apiRequest('POST', `/api/projects/${id}/applications`, applicationData);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your proposal has been sent to the client.",
      });
      setShowApplicationForm(false);
      applicationForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'applications'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to submit application",
        description: error.message,
      });
    },
  });

  // Accept/reject application mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: number; status: string }) => {
      return apiRequest('PUT', `/api/applications/${applicationId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Application updated",
        description: "The application status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id, 'applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update application",
        description: error.message,
      });
    },
  });

  const onSubmitApplication = (data: Omit<InsertApplication, 'projectId' | 'freelancerId'>) => {
    submitApplicationMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isClientView = currentUser && project.clientId === currentUser.id;
  const canApply = currentUser && currentUser.userType === 'freelancer' && project.status === 'open';
  const hasApplied = applications.some((app: any) => app.freelancerId === currentUser?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600">Posted by {project.client?.fullName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="space-y-6">
              <TabsList>
                <TabsTrigger value="details">Project Details</TabsTrigger>
                {isClientView && <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>}
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {project.description}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.skillsRequired.map((skill: string) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Budget</p>
                          <p className="font-semibold">{project.budget}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold">{project.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Proposals</p>
                          <p className="font-semibold">{applications.length}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Posted on {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant={
                        project.status === 'open' ? 'default' :
                        project.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {project.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {isClientView && (
                <TabsContent value="applications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {applications.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No applications yet</p>
                      ) : (
                        <div className="space-y-6">
                          {applications.map((application: any) => (
                            <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar>
                                    <AvatarImage src={application.freelancer?.avatar} />
                                    <AvatarFallback>
                                      {application.freelancer?.fullName.split(' ').map((n: string) => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-semibold text-lg">{application.freelancer?.fullName}</h4>
                                    <p className="text-gray-600">{application.profile?.title}</p>
                                    <div className="flex items-center mt-1">
                                      <div className="flex text-yellow-400 text-sm mr-2">
                                        {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`h-4 w-4 ${i < (application.profile?.rating || 0) / 20 ? 'fill-current' : ''}`} 
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-600">
                                        ({application.profile?.reviewCount || 0} reviews)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant={
                                  application.status === 'accepted' ? 'default' :
                                  application.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }>
                                  {application.status}
                                </Badge>
                              </div>

                              <div className="mb-4">
                                <h5 className="font-medium mb-2">Cover Letter</h5>
                                <p className="text-gray-700 text-sm">{application.coverLetter}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600">Proposed Rate</p>
                                  <p className="font-semibold">{application.proposedRate}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Estimated Duration</p>
                                  <p className="font-semibold">{application.estimatedDuration}</p>
                                </div>
                              </div>

                              {application.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => updateApplicationMutation.mutate({
                                      applicationId: application.id,
                                      status: 'accepted'
                                    })}
                                    disabled={updateApplicationMutation.isPending}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => updateApplicationMutation.mutate({
                                      applicationId: application.id,
                                      status: 'rejected'
                                    })}
                                    disabled={updateApplicationMutation.isPending}
                                  >
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={project.client?.avatar} />
                    <AvatarFallback>
                      {project.client?.fullName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{project.client?.fullName}</p>
                    <p className="text-sm text-gray-600">Member since {new Date(project.client?.createdAt).getFullYear()}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projects Posted</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hire Rate</span>
                    <span className="font-medium">80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply Section */}
            {canApply && !hasApplied && !showApplicationForm && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setShowApplicationForm(true)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Proposal
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasApplied && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-green-600 mb-2">
                    <Users className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-gray-600">Your proposal is under review</p>
                </CardContent>
              </Card>
            )}

            {/* Application Form */}
            {showApplicationForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...applicationForm}>
                    <form onSubmit={applicationForm.handleSubmit(onSubmitApplication)} className="space-y-4">
                      <FormField
                        control={applicationForm.control}
                        name="coverLetter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Letter</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your approach to this project..."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={applicationForm.control}
                        name="proposedRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proposed Rate</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. $50/hour or $1000 fixed"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={applicationForm.control}
                        name="estimatedDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estimated Duration</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 2-3 weeks"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-2">
                        <Button 
                          type="submit" 
                          className="flex-1"
                          disabled={submitApplicationMutation.isPending}
                        >
                          {submitApplicationMutation.isPending ? 'Submitting...' : 'Submit Proposal'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowApplicationForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {!currentUser && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600 mb-4">Please log in to apply for this project</p>
                  <Button className="w-full">Log In</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
