import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../integrations/supabase/client';

describe('Supabase Authentication', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should have valid Supabase configuration', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(supabase).toBeDefined();
  });

  it('should have correct auth configuration', () => {
    const authConfig = supabase.auth;
    expect(authConfig).toBeDefined();
  });

  it('should handle session storage correctly', () => {
    const testKey = 'test-key';
    const testValue = 'test-value';

    // Test setItem
    localStorage.setItem(testKey, testValue);
    expect(localStorage.getItem(testKey)).toBe(testValue);

    // Test getItem
    const retrievedValue = localStorage.getItem(testKey);
    expect(retrievedValue).toBe(testValue);

    // Test removeItem
    localStorage.removeItem(testKey);
    expect(localStorage.getItem(testKey)).toBeNull();
  });
}); 