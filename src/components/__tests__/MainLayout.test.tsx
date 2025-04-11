import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MainLayout from '../MainLayout';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUser: User = {
  id: 'test-user-id',
  app_metadata: {},
  user_metadata: {},
  aud: '',
  created_at: '',
  email: '',
  role: '',
  updated_at: '',
};

describe('MainLayout', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false,
      isAnonymous: false,
      session: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      continueAsGuest: vi.fn(),
    });
  });

  it('renders the layout with children', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="test-child">Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('contains the main content area', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1', 'pl-64');
  });

  it('shows loading state when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      isAnonymous: false,
      session: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
      continueAsGuest: vi.fn(),
    });

    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );

    expect(screen.getByRole('main')).toHaveClass('flex-1', 'pl-64');
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
}); 