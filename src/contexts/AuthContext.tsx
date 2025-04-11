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
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `http://localhost:8080/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(`Error signing in: ${err.message}`);
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
