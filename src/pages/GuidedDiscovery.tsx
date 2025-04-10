
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Lightbulb, MessageSquare, Plus } from "lucide-react";

const GuidedDiscovery = () => {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guided Discovery</h1>
          <p className="text-muted-foreground">
            Use structured questioning to identify root causes and develop solutions.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Session
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center mb-2">
              <div className="mr-4 p-2 bg-primary/10 rounded-md">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle>AI-Powered Discovery Process</CardTitle>
                <CardDescription>
                  Use our conversational interface to investigate operational challenges
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-8 rounded-lg flex flex-col items-center justify-center text-center">
              <BrainCircuit className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a Guided Discovery Session</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Our AI-powered discovery process will help you identify root causes and develop targeted solutions using the "5 Whys" methodology.
              </p>
              <Button size="lg">
                Begin New Session
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Common Discovery Paths</CardTitle>
            <CardDescription>
              Pre-defined question paths for frequent operational challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="flex items-start text-left">
                  <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">High Scrap Rates</div>
                    <div className="text-sm text-muted-foreground">
                      Investigate causes of excessive material waste and quality issues
                    </div>
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="flex items-start text-left">
                  <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Long Changeover Times</div>
                    <div className="text-sm text-muted-foreground">
                      Analyze setup procedures to identify inefficiencies and improvement opportunities
                    </div>
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="flex items-start text-left">
                  <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Equipment Downtime</div>
                    <div className="text-sm text-muted-foreground">
                      Explore the root causes of machine reliability issues and maintenance effectiveness
                    </div>
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="flex items-start text-left">
                  <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <div className="font-medium">Inventory Management</div>
                    <div className="text-sm text-muted-foreground">
                      Address excessive inventory levels, stockouts, and poor inventory accuracy
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GuidedDiscovery;
