import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Let Supabase handle everything automatically
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          toast.error('Authentication failed');
          navigate('/auth');
          return;
        }
        
        if (data?.session) {
          console.log('Authentication successful');
          toast.success('Signed in successfully');
          navigate('/');
        } else {
          console.error('No session found');
          toast.error('No session found. Please try signing in again.');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication error occurred');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing sign in...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Please wait while we verify your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 