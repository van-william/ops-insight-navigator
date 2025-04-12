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
        setLoading(true);
        try {
          // Log auth state changes
          await fetch('/.netlify/functions/auth-logger', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              type: 'auth',
              message: `Auth state changed: ${event}`,
              details: {
                event,
                hasSession: !!session,
                userId: session?.user?.id,
                userEmail: session?.user?.email,
                authProvider: session?.user?.app_metadata?.provider,
                timestamp: new Date().toISOString(),
                anonymousMode: localStorage.getItem("anonymousMode") === "true"
              },
              level: 'info'
            })
          });

          if (event === 'SIGNED_IN' && session) {
            setSession(session);
            setUser(session.user);
            setIsAnonymous(false);
            localStorage.removeItem("anonymousMode");
            // Store session in localStorage for persistence
            localStorage.setItem("supabase.auth.token", JSON.stringify(session));
            toast.success("Successfully signed in");
            navigate('/'); // Redirect to home after successful sign in
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
            // Clear persisted session
            localStorage.removeItem("supabase.auth.token");
            toast.info("Signed out successfully");
            navigate('/auth');
          } else if (event === 'TOKEN_REFRESHED' && session) {
            setSession(session);
            setUser(session.user);
            // Update persisted session
            localStorage.setItem("supabase.auth.token", JSON.stringify(session));
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          toast.error('Error updating authentication state');
        } finally {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        // Check for persisted session first
        const persistedSession = localStorage.getItem("supabase.auth.token");
        if (persistedSession) {
          const { session } = JSON.parse(persistedSession);
          setSession(session);
          setUser(session?.user ?? null);
        }

        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast.error('Error initializing authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async () => {
    try {
      // Log the start of authentication with extended details
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'auth',
          message: 'Starting authentication process',
          details: {
            provider: 'google',
            origin: window.location.origin,
            currentUrl: window.location.href,
            timestamp: new Date().toISOString(),
            deployUrl: import.meta.env.VITE_NETLIFY_DEPLOY_URL || 'unknown',
            userAgent: navigator.userAgent
          },
          level: 'info'
        })
      });

      // Add loading state
      setLoading(true);

      // Ensure we're using the correct redirect URL
      const redirectUrl = new URL('/auth/callback', window.location.origin).href;
      
      console.log('Attempting sign in with redirect URL:', redirectUrl);
      console.log('Current origin:', window.location.origin);
      console.log('Current URL:', window.location.href);
      console.log('Deploy URL:', import.meta.env.VITE_NETLIFY_DEPLOY_URL || 'unknown');

      // Log the exact redirect URL that will be used
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'auth',
          message: 'Using redirect URL for OAuth',
          details: {
            redirectUrl,
            origin: window.location.origin,
            currentUrl: window.location.href
          },
          level: 'info'
        })
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
        }
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(`Authentication failed: ${error.message}`);
        throw error;
      }

      if (!data?.url) {
        console.error('No redirect URL received from Supabase');
        toast.error('Authentication failed: No redirect URL received');
        throw new Error('No redirect URL received');
      }

      console.log('Redirecting to:', data.url);
      
      // Log the redirect URL from Supabase
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'auth',
          message: 'Supabase provided redirect URL',
          details: {
            supabaseUrl: data.url,
            redirectUrl,
            origin: window.location.origin,
          },
          level: 'info'
        })
      });
      
      // Use window.location.assign for more reliable navigation
      window.location.assign(data.url);
    } catch (error) {
      console.error('Error during sign in:', error);
      setLoading(false);
      toast.error('Failed to initiate sign in. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      // Log sign out attempt
      await fetch('/.netlify/functions/auth-logger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
        headers: {
          'Content-Type': 'application/json'
        },
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
