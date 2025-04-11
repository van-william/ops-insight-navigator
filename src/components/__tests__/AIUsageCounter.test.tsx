import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIUsageCounter } from '../AIUsageCounter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { questions_asked: 5 },
      error: null,
    }),
  },
}));

describe('AIUsageCounter', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('renders with the correct usage count', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AIUsageCounter />
      </QueryClientProvider>
    );

    // Wait for the query to resolve
    await screen.findByText('5/10 questions today');
    expect(screen.getByText('5/10 questions today')).toBeInTheDocument();
  });

  it('displays the message circle icon', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AIUsageCounter />
      </QueryClientProvider>
    );
    const icon = screen.getByTestId('message-circle-icon');
    expect(icon).toBeInTheDocument();
  });

  it('applies the correct styling', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AIUsageCounter />
      </QueryClientProvider>
    );
    const container = screen.getByText('5/10 questions today').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'gap-2', 'text-sm', 'text-muted-foreground');
  });
}); 