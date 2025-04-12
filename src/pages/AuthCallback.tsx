import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Let Supabase handle the session from the URL
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error);
          toast.error('Authentication error. Please try again.');
          navigate('/auth');
          return;
        }
        
        if (session) {
          console.log('Auth successful, redirecting to home');
          navigate('/');
        } else {
          console.error('No session found after callback');
          toast.error('No session found. Please try signing in again.');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error('Failed to complete authentication. Please try again.');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we verify your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 