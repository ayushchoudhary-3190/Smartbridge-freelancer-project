import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Heart } from "lucide-react";
import { Project } from "@shared/schema";
import { Link } from "wouter";

interface ProjectCardProps {
  project: Project & { 
    client?: { fullName: string };
    applicationCount?: number;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3">
              {project.description}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.skillsRequired.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {project.skillsRequired.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{project.skillsRequired.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {project.duration}
          </span>
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {project.applicationCount || 0} proposals
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="text-xl font-bold text-gray-900">
          {project.budget}
        </div>
        <Link href={`/projects/${project.id}`}>
          <Button className="hover:bg-blue-700 transition-colors">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
