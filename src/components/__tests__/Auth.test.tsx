import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthProvider';
import { LoginButton } from '../LoginButton';
import { supabase } from '../../integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Mock environment variables
vi.mock('../../integrations/supabase/client', () => {
  // Log the actual environment variables for debugging
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);

  return {
    supabase: {
      auth: {
        signInWithOAuth: vi.fn().mockImplementation((options) => {
          console.log('signInWithOAuth called with:', options);
          return Promise.resolve({ data: null, error: null });
        }),
        signOut: vi.fn().mockImplementation(() => {
          console.log('signOut called');
          return Promise.resolve({ error: null });
        }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({
          data: {
            subscription: {
              id: 'test-sub',
              callback: vi.fn(),
              unsubscribe: vi.fn(),
            },
          },
        }),
      },
    },
  };
});

describe('Auth Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should have valid Supabase configuration', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_URL).toContain('supabase.co');
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toContain('eyJ');
  });

  it('should render login button with correct initial state', () => {
    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should call signInWithOAuth when login button is clicked', async () => {
    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Sign In');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.any(String),
        },
      });
    });
  });

  it('should call signOut when logout button is clicked', async () => {
    // Mock user being logged in
    const mockUser: User = {
      id: '123',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const mockSession: Session = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Sign Out');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should handle auth state changes correctly', async () => {
    const mockUser: User = {
      id: '123',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    const mockSession: Session = {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    // Mock auth state change
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      callback('SIGNED_IN', mockSession);
      return {
        data: {
          subscription: {
            id: 'test-sub',
            callback: vi.fn(),
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    render(
      <AuthProvider>
        <LoginButton />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });
}); 