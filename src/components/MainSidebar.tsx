
import { Link, useNavigate } from "react-router-dom";
import { BarChart2, ClipboardCheck, FileText, Home, LogOut, MessageSquare, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "./ui/skeleton";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "P&L Analysis",
    href: "/pl-analysis",
    icon: FileText,
  },
  {
    title: "Maturity Assessment",
    href: "/maturity-assessment",
    icon: ClipboardCheck,
  },
  {
    title: "Guided Discovery",
    href: "/guided-discovery",
    icon: MessageSquare,
  },
];

export function MainSidebar() {
  const pathname = window.location.pathname;
  const { user, signOut, loading, isAnonymous } = useAuth();
  const navigate = useNavigate();

  const handleSignInOut = () => {
    if (user) {
      signOut();
    } else if (isAnonymous) {
      signOut(); // Sign out of anonymous mode
    } else {
      navigate('/auth');
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (isAnonymous) return "GU";
    if (!user) return "GU";
    
    const name = user.user_metadata?.full_name || user.email || "";
    if (!name) return "U";
    
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="bg-sidebar text-sidebar-foreground h-screen flex flex-col w-64 fixed top-0 left-0 overflow-y-auto border-r border-sidebar-border">
      <div className="p-6">
        <div className="flex items-center gap-2 text-sidebar-foreground">
          <BarChart2 className="h-6 w-6" />
          <span className="text-lg font-semibold">OpsAssess</span>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {loading ? (
              <Skeleton className="w-8 h-8 rounded-full" />
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            )}
            <div className="text-sm">
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                isAnonymous ? 'Guest User' :
                user ? user.user_metadata?.full_name || user.email?.split('@')[0] : 'Guest User'
              )}
              {isAnonymous && (
                <span className="block text-xs text-muted-foreground">Anonymous mode</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignInOut}
              title={user || isAnonymous ? "Sign out" : "Sign in"}
            >
              {user || isAnonymous ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
