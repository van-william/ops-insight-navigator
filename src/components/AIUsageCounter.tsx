import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageCircle } from "lucide-react";

export const AIUsageCounter = () => {
  const { user } = useAuth();

  const { data: usage } = useQuery({
    queryKey: ['aiUsage', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_ai_usage')
        .select('questions_asked')
        .eq('user_id', user?.id)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.questions_asked || 0;
    },
    enabled: !!user
  });

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MessageCircle className="h-4 w-4" />
      <span>{usage || 0}/10 questions today</span>
    </div>
  );
}; 