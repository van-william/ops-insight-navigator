import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart2, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const { user, signIn, loading, isAnonymous, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if ((user && !loading) || isAnonymous) {
      navigate('/');
    }
  }, [user, loading, navigate, isAnonymous]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-foreground">
              <BarChart2 className="h-8 w-8" />
              <span className="text-2xl font-semibold">OpsAssess</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to OpsAssess</CardTitle>
          <CardDescription>
            Sign in to save and access your operational assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 justify-center py-6"
              onClick={() => signIn()}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              className="flex items-center gap-2 justify-center py-6"
              onClick={continueAsGuest}
            >
              <User className="h-4 w-4" />
              Continue as Guest
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <p className="text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy.<br />
            <span className="text-xs mt-1 block opacity-80">Guest mode allows you to explore without saving data.</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
