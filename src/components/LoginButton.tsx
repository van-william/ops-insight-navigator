import { useAuth } from './AuthProvider';
import { supabase } from '../integrations/supabase/client';

export const LoginButton = () => {
  const { user, loading } = useAuth();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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