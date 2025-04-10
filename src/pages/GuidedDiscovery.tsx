import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Lightbulb, MessageSquare, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiscoverySession } from "@/components/DiscoverySession";
import { AIDiscoverySession } from "@/components/AIDiscoverySession";

interface DiscoveryPath {
  id: string;
  name: string;
  description: string;
  category: string;
  use_ai: boolean;
  approach_type: string;
}

const GuidedDiscovery = () => {
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  // Fetch discovery paths
  const { data: paths } = useQuery<DiscoveryPath[]>({
    queryKey: ['discoveryPaths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_paths')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Find the selected path
  const selectedPath = paths?.find(path => path.id === selectedPathId);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guided Discovery</h1>
          <p className="text-muted-foreground">
            Use structured questioning to identify root causes and develop solutions.
          </p>
        </div>
        <Dialog open={!!selectedPathId} onOpenChange={() => setSelectedPathId(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Discovery Session</DialogTitle>
              <DialogDescription>
                {selectedPath?.use_ai 
                  ? "Have a conversation with our AI consultant to explore challenges" 
                  : "Answer the questions to help identify improvement opportunities"}
              </DialogDescription>
            </DialogHeader>
            {selectedPathId && selectedPath?.use_ai && (
              <AIDiscoverySession
                pathId={selectedPathId}
                onComplete={() => setSelectedPathId(null)}
              />
            )}
            {selectedPathId && !selectedPath?.use_ai && (
              <DiscoverySession
                pathId={selectedPathId}
                onComplete={() => setSelectedPathId(null)}
              />
            )}
          </DialogContent>
        </Dialog>
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
                Our AI-powered discovery process will help you identify root causes and develop targeted solutions using structured methodologies.
              </p>
              <Button size="lg" onClick={() => setSelectedPathId(paths?.[0]?.id)}>
                Begin New Session
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Discovery Paths</CardTitle>
            <CardDescription>
              Choose a specific area to investigate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {paths?.map((path) => (
                <Button
                  key={path.id}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => setSelectedPathId(path.id)}
                >
                  <div className="flex items-start text-left">
                    <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <div className="font-medium">{path.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {path.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GuidedDiscovery;
