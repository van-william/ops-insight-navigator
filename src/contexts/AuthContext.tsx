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

    // Check for an active session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setIsAnonymous(false);
          localStorage.removeItem("anonymousMode");
          toast.success("Successfully signed in");
        } else if (event === 'SIGNED_OUT') {
          setIsAnonymous(false);
          localStorage.removeItem("anonymousMode");
          navigate('/auth');
        }
        
        setLoading(false);
      }
    );

    // Initialize session
    getInitialSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log('Signing in with redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) throw error;
      
      if (!data?.url) {
        toast.error('Failed to get authentication URL');
        return;
      }
      
      // Redirect to the authentication URL
      window.location.href = data.url;
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setIsAnonymous(false);
      localStorage.removeItem("anonymousMode");
      toast.success('Signed out successfully');
      
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
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
