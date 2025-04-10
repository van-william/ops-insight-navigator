import OpenAI from 'openai';
import { supabase } from '@/integrations/supabase/client';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy through your backend
});

// Cost per 1K tokens (as of March 2024)
const GPT4_INPUT_COST = 0.01;   // $0.01 per 1K tokens
const GPT4_OUTPUT_COST = 0.03;  // $0.03 per 1K tokens

// Convert dollars to credits (1 credit = $0.01)
const DOLLARS_TO_CREDITS = 100;

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function checkCredits(userId: string): Promise<number> {
  const { data: credits } = await supabase
    .from('user_credits')
    .select('credits_remaining')
    .eq('user_id', userId)
    .single();
  
  return credits?.credits_remaining || 0;
}

export async function trackUsage(
  userId: string,
  conversationId: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const inputCost = Math.ceil((inputTokens / 1000) * GPT4_INPUT_COST * DOLLARS_TO_CREDITS);
  const outputCost = Math.ceil((outputTokens / 1000) * GPT4_OUTPUT_COST * DOLLARS_TO_CREDITS);
  const totalCredits = inputCost + outputCost;

  // Update credits and track usage in a transaction
  const { error } = await supabase.rpc('use_ai_credits', {
    p_user_id: userId,
    p_conversation_id: conversationId,
    p_tokens_used: inputTokens + outputTokens,
    p_credits_used: totalCredits
  });

  if (error) throw error;
}

export async function checkDailyLimit(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('check_daily_usage', { p_user_id: userId });
  
  if (error) throw error;
  return data || false;
}

export async function generateAIResponse(
  userId: string,
  messages: ChatMessage[]
): Promise<string> {
  // Check daily limit first
  const canAsk = await checkDailyLimit(userId);
  if (!canAsk) {
    throw new Error('Daily question limit reached. Please try again tomorrow.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from AI');

    return response;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
} 