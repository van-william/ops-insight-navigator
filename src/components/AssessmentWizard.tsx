import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AssessmentSummary } from "@/components/AssessmentSummary";
import { Skeleton } from "@/components/ui/skeleton";

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

const CATEGORIES = [
  "plant_layout",
  "lean_manufacturing",
  "planning_scheduling",
  "production_efficiency",
  "changeovers",
  "maintenance",
  "quality",
  "warehouse_logistics",
  "automation",
  "plant_management"
] as const;

const CATEGORY_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  plant_layout: {
    title: "Plant Layout and Process Flow",
    description: "Evaluate the efficiency of your facility layout, material flow, and work cell organization for high-mix production."
  },
  lean_manufacturing: {
    title: "Lean Manufacturing",
    description: "Assess the implementation of lean principles, including 5S, visual management, and waste reduction strategies."
  },
  planning_scheduling: {
    title: "Planning & Scheduling",
    description: "Review your production planning processes, schedule adherence, and capacity management capabilities."
  },
  production_efficiency: {
    title: "Production Efficiency",
    description: "Measure overall equipment effectiveness (OEE), cycle time optimization, and resource utilization."
  },
  changeovers: {
    title: "Changeovers",
    description: "Evaluate setup time reduction, SMED implementation, and changeover standardization practices."
  },
  maintenance: {
    title: "Maintenance Effectiveness",
    description: "Assess preventive maintenance programs, equipment reliability, and maintenance planning systems."
  },
  quality: {
    title: "Quality Control",
    description: "Review quality management systems, inspection processes, and defect prevention strategies."
  },
  warehouse_logistics: {
    title: "Warehouse & Logistics",
    description: "Evaluate inventory management, material handling systems, and storage optimization."
  },
  automation: {
    title: "Automation & Digital Ops",
    description: "Assess the level of automation, digital integration, and Industry 4.0 implementation."
  },
  plant_management: {
    title: "Plant Management",
    description: "Review management systems, performance tracking, and continuous improvement culture."
  }
};

export const AssessmentWizard = ({ onComplete }: AssessmentWizardProps) => {
  const { user, isAnonymous } = useAuth();
  const [currentCategory, setCurrentCategory] = useState<typeof CATEGORIES[number]>(CATEGORIES[0]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const queryClient = useQueryClient();

  // Create or fetch assessment session (only when logged in)
  const { data: session } = useQuery({
    queryKey: ["assessmentSession"],
    queryFn: async () => {
      if (sessionId) {
        const { data } = await supabase
          .from("assessment_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();
        return data;
      }

      const { data, error } = await supabase
        .from("assessment_sessions")
        .insert({
          user_id: user?.id,
          name: `Assessment ${new Date().toLocaleDateString()}`,
          status: "in_progress"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !isAnonymous && !sessionId
  });

  // Set session ID when created
  useEffect(() => {
    if (session?.id) {
      setSessionId(session.id);
    }
  }, [session]);

  // Fetch questions for current category
  const { data: questions, isLoading: loadingQuestions, error: questionsError } = useQuery({
    queryKey: ["assessmentQuestions", currentCategory],
    queryFn: async () => {
      console.log('Fetching questions for category:', currentCategory);
      
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("category", currentCategory)
        .order("weight", { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }
      
      console.log('Questions fetched:', data);
      return data as Question[];
    },
  });

  // Log state changes
  useEffect(() => {
    console.log('Current category:', currentCategory);
    console.log('Questions:', questions);
    console.log('Loading:', loadingQuestions);
    console.log('Error:', questionsError);
  }, [currentCategory, questions, loadingQuestions, questionsError]);

  // Save response mutation (only when logged in)
  const saveResponse = useMutation({
    mutationFn: async (response: Response) => {
      // Don't attempt to save if user is not logged in
      if (!user || isAnonymous) {
        console.log('Not saving response because user is not logged in');
        return;
      }

      const { error } = await supabase.from("assessment_responses").upsert({
        user_id: user?.id,
        session_id: sessionId,
        question_id: response.questionId,
        score: response.score,
        notes: response.notes,
      });

      if (error) {
        toast.error("Failed to save response");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessmentResponses"] });
    },
  });

  // Handle response submission - store locally regardless of login state
  const handleResponse = async (questionId: string, score: number, notes: string) => {
    const response = { questionId, score, notes };
    
    // Always update local state
    setResponses((prev) => [...prev.filter((r) => r.questionId !== questionId), response]);
    
    // Only try to save to database if logged in
    if (user && !isAnonymous) {
      try {
        await saveResponse.mutateAsync(response);
      } catch (error) {
        console.error("Failed to save response:", error);
      }
    }
  };

  // Submit all responses at once
  const handleSubmitAllResponses = async () => {
    if (!user || isAnonymous) {
      // If not logged in, prompt to login first
      toast.error("Please login to save your assessment");
      // You could trigger a login modal here
      return;
    }

    // Create a session if doesn't exist
    let newSessionId = sessionId;
    if (!sessionId) {
      const { data, error } = await supabase
        .from("assessment_sessions")
        .insert({
          user_id: user.id,
          name: `Assessment ${new Date().toLocaleDateString()}`,
          status: "in_progress"
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create assessment session");
        return;
      }
      
      newSessionId = data.id;
      setSessionId(data.id);
    }

    // Save all responses
    let hasError = false;
    for (const response of responses) {
      try {
        await supabase.from("assessment_responses").upsert({
          user_id: user.id,
          session_id: newSessionId,
          question_id: response.questionId,
          score: response.score,
          notes: response.notes,
        });
      } catch (error) {
        console.error("Failed to save response:", error);
        hasError = true;
      }
    }

    if (hasError) {
      toast.error("Some responses could not be saved");
    } else {
      toast.success("Assessment saved successfully");
      onComplete(responses);
    }
  };

  // Navigate between categories
  const handleCategoryChange = (direction: "next" | "prev") => {
    const currentIndex = CATEGORIES.indexOf(currentCategory as typeof CATEGORIES[number]);
    if (direction === "next" && currentIndex < CATEGORIES.length - 1) {
      setCurrentCategory(CATEGORIES[currentIndex + 1]);
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentCategory(CATEGORIES[currentIndex - 1]);
    }
  };

  // Calculate if all questions are answered
  const isAllComplete = useQuery({
    queryKey: ["allQuestions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("id");

      if (error) throw error;
      return data.length === responses.length;
    },
    enabled: !!user,
  });

  // Calculate progress for current category
  const categoryProgress = questions ? 
    (responses.filter(r => questions.some(q => q.id === r.questionId)).length / questions.length) * 100 : 0;

  // Calculate overall progress
  const { data: totalQuestions } = useQuery({
    queryKey: ["totalQuestions"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("assessment_questions")
        .select("*", { count: 'exact' });

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  const overallProgress = totalQuestions ? (responses.length / totalQuestions) * 100 : 0;

  // Fetch all questions for summary page
  useEffect(() => {
    const fetchAllQuestions = async () => {
      const { data, error } = await supabase
        .from("assessment_questions")
        .select("*");

      if (error) {
        console.error('Error fetching all questions:', error);
        return;
      }
      
      setAllQuestions(data as Question[]);
    };

    fetchAllQuestions();
  }, []);

  // Handle showing the summary page
  const handleShowSummary = () => {
    setShowSummary(true);
  };

  // Handle returning from summary to assessment
  const handleReturnToAssessment = () => {
    setShowSummary(false);
  };

  // Handle completion from summary page
  const handleSummaryComplete = () => {
    onComplete(responses);
  };

  if (showSummary) {
    return (
      <AssessmentSummary
        responses={responses}
        questions={allQuestions}
        categoryDescriptions={CATEGORY_DESCRIPTIONS}
        onSaveComplete={handleSummaryComplete}
        onBack={handleReturnToAssessment}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {CATEGORY_DESCRIPTIONS[currentCategory].title}
          </h1>
          <p className="text-muted-foreground">
            {CATEGORY_DESCRIPTIONS[currentCategory].description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleCategoryChange("prev")}
            disabled={currentCategory === CATEGORIES[0]}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => handleCategoryChange("next")}
            disabled={currentCategory === CATEGORIES[CATEGORIES.length - 1]}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {loadingQuestions ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : questionsError ? (
          <div className="text-center py-8">
            <p className="text-destructive">Failed to load questions. Please try again.</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Reload Page
            </Button>
          </div>
        ) : (
          questions?.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle>{question.question}</CardTitle>
                {question.description && (
                  <CardDescription>{question.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <RadioGroup
                    value={responses.find((r) => r.questionId === question.id)?.score.toString()}
                    onValueChange={(value) =>
                      handleResponse(question.id, parseInt(value), responses.find((r) => r.questionId === question.id)?.notes || "")
                    }
                    className="grid grid-cols-5 gap-4"
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <div key={score} className="flex items-center space-x-2">
                        <RadioGroupItem value={score.toString()} id={`${question.id}-${score}`} />
                        <Label htmlFor={`${question.id}-${score}`}>{score}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <Textarea
                    placeholder="Add notes (optional)"
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
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-between">
        <Progress
          value={(CATEGORIES.indexOf(currentCategory) + 1) * 10}
          className="w-full"
        />
        <Button
          onClick={handleShowSummary}
          disabled={!responses.length}
          className="ml-4"
        >
          Show Summary
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}; 