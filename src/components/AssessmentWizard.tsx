import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface Question {
  id: string;
  category: string;
  question: string;
  description: string | null;
  weight: number;
}

interface Response {
  questionId: string;
  score: number;
  notes: string;
}

interface AssessmentWizardProps {
  onComplete: (responses: Response[]) => void;
}

export const AssessmentWizard = ({ onComplete }: AssessmentWizardProps) => {
  const { user } = useAuth();
  const [currentCategory, setCurrentCategory] = useState<string>("plant_layout");
  const [responses, setResponses] = useState<Response[]>([]);
  const queryClient = useQueryClient();

  // Fetch questions for current category
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ["assessmentQuestions", currentCategory],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("category", currentCategory)
        .order("weight", { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
    enabled: !!user,
  });

  // Save response mutation
  const saveResponse = useMutation({
    mutationFn: async (response: Response) => {
      const { error } = await supabase.from("assessment_responses").upsert({
        user_id: user?.id,
        question_id: response.questionId,
        score: response.score,
        notes: response.notes,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessmentResponses"] });
    },
  });

  // Handle response submission
  const handleResponse = async (questionId: string, score: number, notes: string) => {
    const response = { questionId, score, notes };
    setResponses((prev) => [...prev.filter((r) => r.questionId !== questionId), response]);
    await saveResponse.mutateAsync(response);
  };

  // Calculate progress
  const progress = questions ? (responses.length / questions.length) * 100 : 0;

  if (loadingQuestions) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {currentCategory.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </h2>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {responses.length} of {questions?.length} questions answered
        </p>
      </div>

      {questions?.map((question) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">{question.question}</CardTitle>
            {question.description && (
              <CardDescription>{question.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <RadioGroup
                onValueChange={(value) =>
                  handleResponse(
                    question.id,
                    parseInt(value),
                    responses.find((r) => r.questionId === question.id)?.notes || ""
                  )
                }
                defaultValue={responses.find((r) => r.questionId === question.id)?.score.toString()}
              >
                <div className="grid grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <div key={score} className="flex flex-col items-center gap-2">
                      <RadioGroupItem value={score.toString()} id={`${question.id}-${score}`} />
                      <Label htmlFor={`${question.id}-${score}`}>{score}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="space-y-2">
                <Label htmlFor={`notes-${question.id}`}>Notes (Optional)</Label>
                <Textarea
                  id={`notes-${question.id}`}
                  placeholder="Add any relevant notes or context..."
                  value={responses.find((r) => r.questionId === question.id)?.notes || ""}
                  onChange={(e) =>
                    handleResponse(
                      question.id,
                      responses.find((r) => r.questionId === question.id)?.score || 0,
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {progress === 100 && (
        <div className="flex justify-end">
          <Button onClick={() => onComplete(responses)}>
            Complete Assessment
          </Button>
        </div>
      )}
    </div>
  );
}; 