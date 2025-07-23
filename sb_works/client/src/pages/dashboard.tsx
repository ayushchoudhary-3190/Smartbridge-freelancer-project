import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Settings, 
  BarChart3, 
  CheckCircle, 
  DollarSign,
  Clock,
  Users,
  MessageSquare
} from "lucide-react";
import { getCurrentUser, getAuthToken } from "@/lib/auth";
import { Link } from "wouter";

export default function Dashboard() {
  const currentUser = getCurrentUser();
  const authToken = getAuthToken();
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-lg">Please log in to access your dashboard.</p>
            <Link href="/">
              <Button className="mt-4">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch user's projects (for clients) or applications (for freelancers)
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/users', currentUser.id, 'projects'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${currentUser.id}/projects`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
    enabled: currentUser.userType === 'client',
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['/api/users', currentUser.id, 'applications'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${currentUser.id}/applications`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch applications');
      return response.json();
    },
    enabled: currentUser.userType === 'freelancer',
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/users', currentUser.id, 'conversations'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${currentUser.id}/conversations`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
  });

  const stats = currentUser.userType === 'client' 
    ? {
        active: projects.filter((p: any) => p.status === 'in_progress').length,
        completed: projects.filter((p: any) => p.status === 'completed').length,
        total: projects.reduce((sum: number, p: any) => sum + (parseFloat(p.budget.replace(/[^0-9.-]+/g, "")) || 0), 0),
        label: 'Total Spent'
      }
    : {
        active: applications.filter((a: any) => a.status === 'pending').length,
        completed: applications.filter((a: any) => a.status === 'accepted').length,
        total: applications.filter((a: any) => a.status === 'accepted').reduce((sum: number, a: any) => sum + (parseFloat(a.proposedRate.replace(/[^0-9.-]+/g, "")) || 0), 0),
        label: 'Total Earned'
      };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser.fullName}</p>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            {currentUser.userType === 'client' ? (
              <Link href="/post-project">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Post New Project
                </Button>
              </Link>
            ) : (
              <Link href="/create-profile">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
              </Link>
            )}
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-lg mr-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active {currentUser.userType === 'client' ? 'Projects' : 'Applications'}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stats.label}</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.total.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value={currentUser.userType === 'client' ? 'projects' : 'applications'}>
                  {currentUser.userType === 'client' ? 'My Projects' : 'Applications'}
                </TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentUser.userType === 'client' ? (
                        projects.slice(0, 5).map((project: any) => (
                          <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="bg-primary bg-opacity-10 p-2 rounded-lg">
                                <BarChart3 className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{project.title}</h4>
                                <p className="text-sm text-gray-600">{project.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{project.budget}</p>
                              <Badge variant={
                                project.status === 'completed' ? 'default' : 
                                project.status === 'in_progress' ? 'secondary' : 'outline'
                              }>
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        applications.slice(0, 5).map((application: any) => (
                          <div key={application.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="bg-purple-100 p-2 rounded-lg">
                                <BarChart3 className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{application.project?.title}</h4>
                                <p className="text-sm text-gray-600">{application.client?.fullName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">{application.proposedRate}</p>
                              <Badge variant={
                                application.status === 'accepted' ? 'default' : 
                                application.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {application.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value={currentUser.userType === 'client' ? 'projects' : 'applications'}>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {currentUser.userType === 'client' ? 'My Projects' : 'My Applications'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentUser.userType === 'client' ? (
                        projects.map((project: any) => (
                          <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <Badge variant={
                                project.status === 'completed' ? 'default' : 
                                project.status === 'in_progress' ? 'secondary' : 'outline'
                              }>
                                {project.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{project.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">{project.budget}</span>
                              <Link href={`/projects/${project.id}`}>
                                <Button variant="outline" size="sm">View Details</Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        applications.map((application: any) => (
                          <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{application.project?.title}</h3>
                              <Badge variant={
                                application.status === 'accepted' ? 'default' : 
                                application.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {application.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">Client: {application.client?.fullName}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Rate: {application.proposedRate}</span>
                              <Link href={`/projects/${application.project?.id}`}>
                                <Button variant="outline" size="sm">View Project</Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {conversations.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No messages yet</p>
                    ) : (
                      <div className="space-y-4">
                        {conversations.slice(0, 5).map((conversation: any) => (
                          <div key={conversation.projectId} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                            <Avatar>
                              <AvatarFallback>
                                {conversation.project.title.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{conversation.project.title}</h4>
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400">
                                {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-medium">98%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">On-time Delivery</span>
                  <span className="font-medium">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Client Rating</span>
                  <span className="font-medium">4.9/5</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {conversations.slice(0, 3).map((conversation: any) => (
                  <div key={conversation.projectId} className="flex items-start space-x-3 mb-3 last:mb-0">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {conversation.project.title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.project.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/messages">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
