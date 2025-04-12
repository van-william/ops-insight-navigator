import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log that we've entered the callback handler
        console.log('Auth callback handler started');
        console.log('URL:', window.location.href);
        console.log('Hash:', window.location.hash);
        
        // Get the hash parameters from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('Hash params found:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });
        
        if (accessToken && refreshToken) {
          console.log('Tokens found in URL, setting session');
          // Set the session using the tokens
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
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
        } else {
          console.log('No tokens in URL, checking for session');
          // Try to get the session normally
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
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error('Failed to complete authentication. Please try again.');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 