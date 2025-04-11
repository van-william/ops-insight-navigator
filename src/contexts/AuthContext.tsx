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

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Log auth state changes
        await fetch('/.netlify/functions/auth-logger', {
          method: 'POST',
          body: JSON.stringify({
            type: 'auth',
            message: `Auth state changed: ${event}`,
            details: {
              event,
              hasSession: !!session,
              userId: session?.user?.id,
              userEmail: session?.user?.email,
              authProvider: session?.user?.app_metadata?.provider,
              timestamp: new Date().toISOString()
            },
            level: 'info'
          })
        });

        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          setIsAnonymous(false);
          localStorage.removeItem("anonymousMode");
          toast.success("Successfully signed in");
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          toast.info("Signed out successfully");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      // Log the start of authentication
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'auth',
          message: 'Starting authentication process',
          details: {
            provider: 'google',
            origin: window.location.origin,
            currentUrl: window.location.href,
          },
          level: 'info'
        })
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      // Log the response from Supabase
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'auth',
          message: 'Supabase auth response received',
          details: {
            provider: 'google',
            hasError: !!error,
            errorMessage: error?.message,
            hasData: !!data,
            url: data?.url,
            auth_response_type: Object.prototype.toString.call(data)
          },
          level: error ? 'error' : 'info'
        })
      });

      if (error) throw error;

      // Log successful redirect initiation
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'auth',
          message: 'Redirecting to authentication URL',
          details: {
            provider: 'google',
            redirectUrl: data.url,
          },
          level: 'info'
        })
      });

    } catch (error) {
      // Log any errors during the process
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'error',
          message: 'Authentication error occurred',
          details: {
            provider: 'google',
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
          level: 'error'
        })
      });
      console.error('Error:', error);
    }
  };

  const signOut = async () => {
    try {
      // Log sign out attempt
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'auth',
          message: 'User initiated sign out',
          details: {
            userId: user?.id,
            userEmail: user?.email,
            authProvider: user?.app_metadata?.provider,
            isAnonymous
          },
          level: 'info'
        })
      });

      await supabase.auth.signOut();
      setIsAnonymous(false);
      localStorage.removeItem("anonymousMode");
      navigate('/auth');
    } catch (error: unknown) {
      const err = error as Error;
      // Log sign out error
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'error',
          message: 'Error during sign out',
          details: {
            error: err.message,
            stack: err.stack,
            userId: user?.id,
            userEmail: user?.email,
            authProvider: user?.app_metadata?.provider,
            isAnonymous
          },
          level: 'error'
        })
      });
      toast.error(`Error signing out: ${err.message}`);
    }
  };

  const continueAsGuest = () => {
    setIsAnonymous(true);
    localStorage.setItem("anonymousMode", "true");
    navigate('/');
    toast.info("You are browsing as a guest. Your data won't be saved.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signOut, 
      loading, 
      isAnonymous,
      continueAsGuest 
    }}>
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
