
import { useEffect } from "react";
import { MainSidebar } from "@/components/MainSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "./ui/skeleton";

type MainLayoutProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
};

export default function MainLayout({ children, requireAuth = true }: MainLayoutProps) {
  const { user, loading, isAnonymous } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (requireAuth && !loading && !user && !isAnonymous) {
      navigate('/auth');
    }
  }, [user, loading, navigate, requireAuth, isAnonymous]);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-background">
        <MainSidebar />
        
        <main className="flex-1 pl-64">
          <div className="container mx-auto p-6">
            <div className="space-y-6">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <MainSidebar />
      
      <main className="flex-1 pl-64">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
