import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Trophy, CheckCircle, Clock } from "lucide-react";
import { AssessmentWizard } from "@/components/AssessmentWizard";
import { AssessmentSummary } from "@/components/AssessmentSummary";

interface Response {
  questionId: string;
  score: number;
  notes: string;
}

export default function MaturityAssessment() {
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const handleStartAssessment = () => {
    setAssessmentStarted(true);
  };

  const handleCompleteAssessment = (completedResponses: Response[]) => {
    setResponses(completedResponses);
    setAssessmentCompleted(true);
  };
  
  const handleBackToStart = () => {
    setAssessmentStarted(false);
    setAssessmentCompleted(false);
    setResponses([]);
  };

  // Render assessment wizard if assessment is started but not completed
  if (assessmentStarted && !assessmentCompleted) {
    return <AssessmentWizard onComplete={handleCompleteAssessment} />;
  }

  // Render assessment summary if assessment is completed
  if (assessmentCompleted) {
    return (
      <AssessmentSummary 
        responses={responses}
        questions={questions}
        categoryDescriptions={{
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
        }}
        onSaveComplete={handleBackToStart}
        onBack={handleBackToStart}
      />
    );
  }

  // Render assessment start page
  return (
    <div className="flex flex-col space-y-8 pt-6">
      <div className="container">
        <Heading as="h1" className="text-3xl font-bold text-center">
          Operational Maturity Assessment
        </Heading>
        <Text className="text-lg text-muted-foreground text-center mt-4 max-w-2xl mx-auto">
          Evaluate your manufacturing operation's maturity across ten critical dimensions to identify strengths, weaknesses, and improvement opportunities.
        </Text>

        <div className="flex justify-center my-8">
          <Button size="lg" onClick={handleStartAssessment}>
            Start Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Comprehensive</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Covers 10 key operational dimensions with 50+ detailed
                questions to provide a thorough evaluation of your manufacturing
                capabilities.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Actionable</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Receive detailed scores and insights for each area
                with specific recommendations to improve your operational
                maturity.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Quick</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Complete the assessment in under 30 minutes. You can save
                your progress and return later to finish if needed.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
