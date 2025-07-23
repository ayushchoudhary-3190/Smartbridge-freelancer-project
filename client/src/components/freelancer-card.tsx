import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { FreelancerProfile, User } from "@shared/schema";
import { Link } from "wouter";

interface FreelancerCardProps {
  freelancer: FreelancerProfile & { user: User };
}

export function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const rating = freelancer.rating ? freelancer.rating / 20 : 0; // Convert 0-100 to 0-5
  
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <Avatar className="w-16 h-16 mx-auto mb-4">
          <AvatarImage src={freelancer.user.avatar || undefined} />
          <AvatarFallback>
            {freelancer.user.fullName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {freelancer.user.fullName}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {freelancer.title}
        </p>
        
        <div className="flex justify-center items-center mb-3">
          <div className="flex text-yellow-400 text-sm mr-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < rating ? 'fill-current' : ''}`} 
              />
            ))}
          </div>
          <span className="text-gray-600 text-sm">
            {rating.toFixed(1)} ({freelancer.reviewCount} reviews)
          </span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {freelancer.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {freelancer.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{freelancer.skills.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="text-gray-900 font-semibold mb-4">
          ${freelancer.hourlyRate}/hr
        </div>
      </CardContent>
      
      <CardFooter>
        <Link href={`/freelancers/${freelancer.userId}`}>
          <Button className="w-full">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
