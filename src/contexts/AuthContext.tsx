import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: () => void;
  signOut: () => Promise<void>;
  loading: boolean;
  isAnonymous: boolean;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if anonymous mode is set in localStorage
    const anonymousMode = localStorage.getItem("anonymousMode") === "true";
    setIsAnonymous(anonymousMode);

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAnonymous(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast.error('Error initializing authentication');
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        try {
          switch (event) {
            case 'SIGNED_IN':
              if (newSession) {
                setSession(newSession);
                setUser(newSession.user);
                setIsAnonymous(false);
                localStorage.removeItem("anonymousMode");
                toast.success("Successfully signed in");
                navigate('/');
              }
              break;
              
            case 'SIGNED_OUT':
              setSession(null);
              setUser(null);
              setIsAnonymous(false);
              localStorage.removeItem("anonymousMode");
              toast.info("Signed out successfully");
              navigate('/auth');
              break;
              
            case 'TOKEN_REFRESHED':
              if (newSession) {
                setSession(newSession);
                setUser(newSession.user);
              }
              break;
              
            case 'USER_UPDATED':
              if (newSession) {
                setSession(newSession);
                setUser(newSession.user);
              }
              break;
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          toast.error('Error updating authentication state');
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async () => {
    try {
      setLoading(true);
      
      // Get the current URL for the callback
      const redirectUrl = new URL('/auth/callback', window.location.origin).href;
      
      console.log('Starting sign in with redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      
      if (!data?.url) {
        throw new Error('No redirect URL received');
      }

      // Redirect to the OAuth provider
      window.location.href = data.url;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setIsAnonymous(false);
      localStorage.removeItem("anonymousMode");
      
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    setIsAnonymous(true);
    localStorage.setItem("anonymousMode", "true");
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signIn,
        signOut,
        loading,
        isAnonymous,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
