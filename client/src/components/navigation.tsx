import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, MessageSquare, Menu, X } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import { AuthModal } from "./auth-modal";

export function Navigation() {
  const [location] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();

  const handleShowLogin = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleShowSignup = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const navLinks = [
    { href: "/projects", label: "Find Work", active: location.startsWith("/projects") },
    { href: "/freelancers", label: "Find Talent", active: location.startsWith("/freelancers") },
    { href: "/how-it-works", label: "How it Works", active: location === "/how-it-works" },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/">
                  <h1 className="text-2xl font-bold text-primary cursor-pointer">SB Works</h1>
                </Link>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-8">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span className={`px-3 py-2 text-sm font-medium cursor-pointer ${
                        link.active 
                          ? "text-primary border-b-2 border-primary" 
                          : "text-gray-500 hover:text-primary"
                      }`}>
                        {link.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                {currentUser ? (
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Bell className="h-5 w-5" />
                    </Button>
                    <Link href="/messages">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar || undefined} />
                            <AvatarFallback>
                              {currentUser.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{currentUser.fullName}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" onClick={handleShowLogin}>
                      Log In
                    </Button>
                    <Button onClick={handleShowSignup}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className={`block px-3 py-2 text-base font-medium cursor-pointer ${
                    link.active 
                      ? "text-primary bg-blue-50" 
                      : "text-gray-500 hover:text-primary hover:bg-gray-50"
                  }`}>
                    {link.label}
                  </span>
                </Link>
              ))}
              {!currentUser && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={handleShowLogin}>
                    Log In
                  </Button>
                  <Button className="w-full" onClick={handleShowSignup}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === "login" ? "signup" : "login")}
      />
    </>
  );
}
