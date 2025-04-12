import { useAuth } from './AuthProvider';
import { supabase } from '../integrations/supabase/client';

export const LoginButton = () => {
  const { user, loading } = useAuth();

  const handleLogin = async () => {
    // Use more reliable URL construction
    const redirectUrl = new URL('/auth/callback', window.location.origin).href;
    console.log('Login redirect URL:', redirectUrl);
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <button disabled>Loading...</button>;
  }

  return (
    <button onClick={user ? handleLogout : handleLogin}>
      {user ? 'Sign Out' : 'Sign In'}
    </button>
  );
}; 