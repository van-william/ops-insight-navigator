import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Save } from "lucide-react";

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIDiscoverySessionProps {
  pathId: string;
  onComplete?: () => void;
}

const INITIAL_PROMPT = `I am an expert manufacturing operations consultant. I'll help you identify root causes and solutions for your operational challenges. Let's start with understanding your situation:

1. What specific business impact are you trying to achieve? (e.g., cost reduction, quality improvement, etc.)
2. Do you have any quantitative metrics about the current situation?
3. What's the scope of the issue? (specific area, line, or plant-wide)

Please share as much context as you can.`;

export const AIDiscoverySession = ({ pathId, onComplete }: AIDiscoverySessionProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are an expert manufacturing operations consultant helping to diagnose and solve operational challenges.' },
    { role: 'assistant', content: INITIAL_PROMPT }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const queryClient = useQueryClient();

  // Fetch or create conversation
  const { data: conversation } = useQuery({
    queryKey: ['discoveryConversation', pathId],
    queryFn: async () => {
      // Try to find existing conversation
      const { data: existingConversation } = await supabase
        .from('discovery_conversations')
        .select('*')
        .eq('session_id', pathId)
        .single();

      if (existingConversation) {
        setMessages(existingConversation.messages as Message[]);
        return existingConversation;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('discovery_conversations')
        .insert({
          session_id: pathId,
          messages: messages,
          tokens_used: 0
        })
        .select()
        .single();

      if (error) throw error;
      return newConversation;
    },
    enabled: !!user && !!pathId
  });

  // Update conversation mutation
  const updateConversation = useMutation({
    mutationFn: async (newMessages: Message[]) => {
      if (!conversation?.id) return;

      const { data, error } = await supabase
        .from('discovery_conversations')
        .update({
          messages: newMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversation.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveryConversation', pathId] });
    }
  });

  // Function to generate AI response
  const generateResponse = async (userMessage: string) => {
    setIsThinking(true);
    try {
      // Here you would integrate with your chosen AI provider (Anthropic, OpenAI, etc.)
      // For now, we'll simulate a response
      const simulatedResponse = await new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve("This is a simulated AI response. In production, this would be replaced with actual AI responses based on the context and user input.");
        }, 1000);
      });

      const updatedMessages = [
        ...messages,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: simulatedResponse }
      ];

      setMessages(updatedMessages);
      await updateConversation.mutateAsync(updatedMessages);
      setCurrentMessage("");
    } catch (error) {
      toast.error("Failed to generate response");
      console.error("Error generating response:", error);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle message submission
  const handleSubmit = async () => {
    if (!currentMessage.trim() || isThinking) return;
    await generateResponse(currentMessage);
  };

  // Handle completion
  const handleComplete = async () => {
    // Here you would implement logic to:
    // 1. Analyze the conversation
    // 2. Extract key insights
    // 3. Generate recommendations
    // 4. Save to the discovery_sessions table
    onComplete?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Guided Discovery Session</CardTitle>
        <CardDescription>
          Have a conversation with our AI consultant to explore your operational challenges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-[400px] overflow-y-auto space-y-4 border rounded-lg p-4">
            {messages.slice(1).map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!currentMessage.trim() || isThinking}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleComplete}
                disabled={isThinking}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 