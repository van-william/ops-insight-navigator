import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signIn: (provider: "google") => void;
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
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setSession(session);
          setUser(session.user);
          setIsAnonymous(false);
          localStorage.removeItem("anonymousMode");
          toast.success("Successfully signed in");
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          // Don't reset anonymous state here as sign out could happen from anonymous mode too
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

  const signIn = async (provider: "google") => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Log detailed auth attempt info
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'auth',
          message: 'Auth attempt started',
          level: 'info',
          details: {
            provider,
            redirectUrl,
            urlDetails: {
              raw: redirectUrl,
              encoded: encodeURIComponent(redirectUrl),
              length: redirectUrl.length,
              charCodes: Array.from(redirectUrl).map(c => c.charCodeAt(0)),
              components: {
                origin: window.location.origin,
                pathname: '/auth/callback',
                full: `${window.location.origin}/auth/callback`
              }
            },
            configuredUrl: {
              raw: 'https://ops-insights.netlify.app/auth/callback',
              encoded: encodeURIComponent('https://ops-insights.netlify.app/auth/callback'),
              length: 'https://ops-insights.netlify.app/auth/callback'.length,
              charCodes: Array.from('https://ops-insights.netlify.app/auth/callback').map(c => c.charCodeAt(0))
            },
            exactMatch: redirectUrl === 'https://ops-insights.netlify.app/auth/callback',
            origin: window.location.origin,
            currentUrl: window.location.href,
            headers: {
              host: window.location.host,
              protocol: window.location.protocol,
              referrer: document.referrer
            }
          }
        })
      });
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        // Log detailed error info
        await fetch('/.netlify/functions/auth-logger', {
          method: 'POST',
          body: JSON.stringify({
            type: 'error',
            message: 'Auth error occurred',
            level: 'error',
            details: {
              error: error.message,
              provider,
              redirectUrl,
              errorCode: error.status,
              errorName: error.name,
              stack: error.stack,
              supabaseError: error
            }
          })
        });
        throw error;
      }

      // Log success
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'auth',
          message: 'Auth initiated successfully',
          level: 'info',
          details: {
            provider,
            redirectUrl,
            data
          }
        })
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Sign in error:', err);
      toast.error(`Error signing in: ${err.message}`);
      
      // Log unexpected errors
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        body: JSON.stringify({
          type: 'error',
          message: 'Unexpected auth error',
          level: 'error',
          details: {
            error: err.message,
            stack: err.stack,
            provider,
            type: err.name
          }
        })
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAnonymous(false);
      localStorage.removeItem("anonymousMode");
      navigate('/auth');
    } catch (error: unknown) {
      const err = error as Error;
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
