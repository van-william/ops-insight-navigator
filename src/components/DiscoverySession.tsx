import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

interface DiscoveryQuestion {
  id: string;
  question: string;
  sequence: number;
  next_question_logic: {
    type: 'linear' | 'range';
    next?: number;
    ranges?: Array<{
      min: number;
      max: number;
      next: number;
    }>;
  } | null;
}

interface DiscoveryPath {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface DiscoverySession {
  id: string;
  user_id: string;
  path_id: string;
  status: 'in_progress' | 'completed';
  current_question: string | null;
  responses: Record<string, string>;
  recommendations: Array<{
    area: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface DiscoverySessionProps {
  pathId: string;
  onComplete?: () => void;
}

export const DiscoverySession = ({ pathId, onComplete }: DiscoverySessionProps) => {
  const { user } = useAuth();
  const [currentResponse, setCurrentResponse] = useState("");
  const queryClient = useQueryClient();

  // Fetch discovery path details
  const { data: path } = useQuery<DiscoveryPath>({
    queryKey: ['discoveryPath', pathId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_paths')
        .select('*')
        .eq('id', pathId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch questions for this path
  const { data: questions } = useQuery<DiscoveryQuestion[]>({
    queryKey: ['discoveryQuestions', pathId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_questions')
        .select('*')
        .eq('path_id', pathId)
        .order('sequence');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch or create session
  const { data: session } = useQuery<DiscoverySession>({
    queryKey: ['discoverySession', pathId],
    queryFn: async () => {
      // Try to find existing session
      const { data: existingSession } = await supabase
        .from('discovery_sessions')
        .select('*')
        .eq('path_id', pathId)
        .eq('user_id', user?.id)
        .eq('status', 'in_progress')
        .single();

      if (existingSession) return existingSession;

      // Create new session
      const { data: newSession, error } = await supabase
        .from('discovery_sessions')
        .insert({
          path_id: pathId,
          user_id: user?.id,
          status: 'in_progress',
          current_question: questions?.[0]?.id,
          responses: {},
          recommendations: []
        })
        .select()
        .single();

      if (error) throw error;
      return newSession;
    },
    enabled: !!user && !!questions?.length
  });

  // Get current question
  const currentQuestion = questions?.find(q => q.id === session?.current_question);

  // Update session mutation
  const updateSession = useMutation({
    mutationFn: async (updates: Partial<DiscoverySession>) => {
      const { data, error } = await supabase
        .from('discovery_sessions')
        .update(updates)
        .eq('id', session?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoverySession', pathId] });
    }
  });

  // Handle next question
  const handleNext = async () => {
    if (!session || !currentQuestion || !currentResponse) return;

    // Prepare updated responses
    const updatedResponses = {
      ...session.responses,
      [currentQuestion.id]: currentResponse
    };

    // Determine next question
    let nextQuestionId: string | null = null;
    
    if (currentQuestion.next_question_logic) {
      if (currentQuestion.next_question_logic.type === 'linear') {
        const nextQuestion = questions?.find(q => q.sequence === currentQuestion.sequence + 1);
        nextQuestionId = nextQuestion?.id || null;
      } else if (currentQuestion.next_question_logic.type === 'range') {
        const numericResponse = parseFloat(currentResponse);
        const nextSequence = currentQuestion.next_question_logic.ranges?.find(
          range => numericResponse >= range.min && numericResponse < range.max
        )?.next;
        const nextQuestion = questions?.find(q => q.sequence === nextSequence);
        nextQuestionId = nextQuestion?.id || null;
      }
    }

    // If no next question, complete the session
    if (!nextQuestionId) {
      // Generate recommendations based on responses
      const recommendations = await generateRecommendations(updatedResponses);
      
      await updateSession.mutateAsync({
        responses: updatedResponses,
        current_question: null,
        status: 'completed',
        recommendations
      });

      toast.success("Discovery session completed!");
      onComplete?.();
      return;
    }

    // Update session with new response and next question
    await updateSession.mutateAsync({
      responses: updatedResponses,
      current_question: nextQuestionId
    });

    setCurrentResponse("");
  };

  // Handle previous question
  const handlePrevious = async () => {
    if (!session || !currentQuestion) return;

    const prevQuestion = questions?.find(q => q.sequence === currentQuestion.sequence - 1);
    if (!prevQuestion) return;

    await updateSession.mutateAsync({
      current_question: prevQuestion.id
    });

    setCurrentResponse(session.responses[prevQuestion.id] || "");
  };

  // Generate recommendations based on responses
  const generateRecommendations = async (responses: Record<string, string>) => {
    // This is where you would implement your recommendation logic
    // For now, we'll return some sample recommendations
    return [
      {
        area: "Process Standardization",
        recommendation: "Implement standard work instructions for setup procedures",
        priority: "high" as const
      },
      {
        area: "Training",
        recommendation: "Develop structured operator training program for setup procedures",
        priority: "medium" as const
      }
    ];
  };

  if (!path || !questions || !session) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading discovery session...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{path.name}</CardTitle>
        <CardDescription>{path.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {currentQuestion ? (
          <div className="space-y-4">
            <div className="text-lg font-medium">
              {currentQuestion.question}
            </div>
            <Textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              placeholder="Enter your response..."
              className="min-h-[100px]"
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion.sequence === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!currentResponse}
              >
                {currentQuestion.next_question_logic ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Complete
                    <Save className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Session completed. View your recommendations in the analysis tab.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 