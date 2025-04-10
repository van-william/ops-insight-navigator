import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ClipboardCheck, ListChecks, Plus } from "lucide-react";
import { AssessmentWizard } from "@/components/AssessmentWizard";

const MaturityAssessment = () => {
  const [isAssessing, setIsAssessing] = useState(false);

  const handleStartAssessment = () => {
    setIsAssessing(true);
  };

  const handleCompleteAssessment = (responses) => {
    console.log("Assessment completed:", responses);
    setIsAssessing(false);
    // TODO: Navigate to results page
  };

  if (isAssessing) {
    return (
      <MainLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Operations Maturity Assessment</h1>
            <p className="text-muted-foreground">
              Rate each aspect on a scale of 1-5 and provide any relevant notes.
            </p>
          </div>
        </div>
        <AssessmentWizard onComplete={handleCompleteAssessment} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maturity Assessment</h1>
          <p className="text-muted-foreground">
            Evaluate your operational maturity across key dimensions.
          </p>
        </div>
        <Button onClick={handleStartAssessment}>
          <Plus className="mr-2 h-4 w-4" /> New Assessment
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 p-2 bg-primary/10 rounded-md">
                  <ClipboardCheck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle>Operations Maturity Assessment</CardTitle>
                  <CardDescription>
                    Evaluate your operational maturity across 10 key dimensions
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleStartAssessment}>Start Assessment</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Assessment Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Plant Layout and Process Flow</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Lean Manufacturing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Planning & Scheduling</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Production Efficiency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Changeovers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Maintenance Effectiveness</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Quality Control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Warehouse & Logistics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Automation & Digital Ops</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ListChecks className="h-5 w-5 text-muted-foreground" />
                    <span>Plant Management</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Each category contains 5-7 questions rated on a scale of 1-5. The assessment takes approximately 30-45 minutes to complete.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>What to Expect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-secondary rounded-md">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Comprehensive Evaluation</h4>
                <p className="text-sm text-muted-foreground">
                  The assessment covers all critical aspects of manufacturing operations, giving you a complete view of your operational maturity.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-secondary rounded-md">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Benchmark Comparison</h4>
                <p className="text-sm text-muted-foreground">
                  Your results will be compared against industry benchmarks to identify areas where you lead or lag.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-secondary rounded-md">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Visual Results</h4>
                <p className="text-sm text-muted-foreground">
                  Spider/radar charts will visually display your strengths and weaknesses across all dimensions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MaturityAssessment;
