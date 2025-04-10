import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/MainLayout";
import { BarChart, DollarSign, Download, ListChecks, Plus, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define the schema for the form with value transformations
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  direct_material: z.string().optional()
    .transform(val => val ? Number(val) : null),
  direct_labor_base: z.string().optional()
    .transform(val => val ? Number(val) : null),
  direct_labor_benefits: z.string().optional()
    .transform(val => val ? Number(val) : null),
  direct_labor_ot: z.string().optional()
    .transform(val => val ? Number(val) : null),
  temp_labor: z.string().optional()
    .transform(val => val ? Number(val) : null),
  indirect_labor_base: z.string().optional()
    .transform(val => val ? Number(val) : null),
  indirect_labor_benefits: z.string().optional()
    .transform(val => val ? Number(val) : null),
  indirect_labor_ot: z.string().optional()
    .transform(val => val ? Number(val) : null),
  salaried_labor_base: z.string().optional()
    .transform(val => val ? Number(val) : null),
  salaried_labor_benefits: z.string().optional()
    .transform(val => val ? Number(val) : null),
  salaried_labor_ot: z.string().optional()
    .transform(val => val ? Number(val) : null),
  copq: z.string().optional()
    .transform(val => val ? Number(val) : null),
  mro: z.string().optional()
    .transform(val => val ? Number(val) : null),
  utilities: z.string().optional()
    .transform(val => val ? Number(val) : null),
  freight_regular: z.string().optional()
    .transform(val => val ? Number(val) : null),
  freight_expedited: z.string().optional()
    .transform(val => val ? Number(val) : null),
  other_variable_overhead: z.string().optional()
    .transform(val => val ? Number(val) : null),
  other_fixed_overhead: z.string().optional()
    .transform(val => val ? Number(val) : null),
  other_sga: z.string().optional()
    .transform(val => val ? Number(val) : null),
});

// Define the type for our data
interface PLAnalysisData extends z.infer<typeof formSchema> {}

// Define the database table type to match Supabase
interface PLAnalysisRecord {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  direct_material: number | null;
  direct_labor_base: number | null;
  direct_labor_benefits: number | null;
  direct_labor_ot: number | null;
  temp_labor: number | null;
  indirect_labor_base: number | null;
  indirect_labor_benefits: number | null;
  indirect_labor_ot: number | null;
  salaried_labor_base: number | null;
  salaried_labor_benefits: number | null;
  salaried_labor_ot: number | null;
  copq: number | null;
  mro: number | null;
  utilities: number | null;
  freight_regular: number | null;
  freight_expedited: number | null;
  other_variable_overhead: number | null;
  other_fixed_overhead: number | null;
  other_sga: number | null;
}

const PLAnalysis = () => {
  const { user, isAnonymous } = useAuth();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Define form with react-hook-form and zod validation
  const form = useForm<PLAnalysisData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "New P&L Analysis",
      direct_material: "",
      direct_labor_base: "",
      direct_labor_benefits: "",
      direct_labor_ot: "",
      temp_labor: "",
      indirect_labor_base: "",
      indirect_labor_benefits: "",
      indirect_labor_ot: "",
      salaried_labor_base: "",
      salaried_labor_benefits: "",
      salaried_labor_ot: "",
      copq: "",
      mro: "",
      utilities: "",
      freight_regular: "",
      freight_expedited: "",
      other_variable_overhead: "",
      other_fixed_overhead: "",
      other_sga: "",
    },
  });

  // Query to fetch saved analyses
  const { data: savedAnalyses, isLoading: loadingAnalyses } = useQuery({
    queryKey: ['planalyses'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pl_analysis')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PLAnalysisRecord[];
    },
    enabled: !!user && !isAnonymous
  });

  // Mutation to save analysis
  const saveMutation = useMutation({
    mutationFn: async (values: PLAnalysisData) => {
      if (!user) throw new Error("User not authenticated");
      
      const formData = Object.entries(values).reduce((acc, [key, value]) => {
        // Convert empty strings to null for numeric fields
        if (key !== 'name' && value === '') {
          acc[key as keyof PLAnalysisData] = null;
        } else {
          // For numeric fields, ensure we're storing numbers not strings
          if (key !== 'name' && value !== null && value !== undefined) {
            acc[key as keyof PLAnalysisData] = Number(value);
          } else {
            acc[key as keyof PLAnalysisData] = value;
          }
        }
        return acc;
      }, {} as Record<string, any>);
      
      // If we have a currentId, update that record, otherwise create a new one
      const { data, error } = currentId 
        ? await supabase
            .from('pl_analysis')
            .update(formData)
            .eq('id', currentId)
            .select()
        : await supabase
            .from('pl_analysis')
            .insert({ ...formData, user_id: user.id, name: values.name })
            .select();
      
      if (error) throw error;
      return data[0] as PLAnalysisRecord;
    },
    onSuccess: (data) => {
      setCurrentId(data.id);
      queryClient.invalidateQueries({ queryKey: ['planalyses'] });
      toast.success("Analysis saved successfully!");
      setSaveDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error saving analysis:", error);
      toast.error("Failed to save analysis");
    }
  });

  // Function to save the current analysis
  const handleSave = (values: PLAnalysisData) => {
    saveMutation.mutate(values);
  };

  // Function to load a saved analysis
  const loadAnalysis = (analysis: PLAnalysisRecord) => {
    setCurrentId(analysis.id);
    
    // Convert null values to empty strings for the form
    const formData = Object.entries(analysis).reduce((acc, [key, value]) => {
      if (key in form.getValues()) {
        // Convert numbers to strings for form input
        if (typeof value === 'number' || value === null) {
          acc[key as keyof PLAnalysisData] = value === null ? "" : String(value);
        } else {
          acc[key as keyof PLAnalysisData] = value as any;
        }
      }
      return acc;
    }, {} as PLAnalysisData);
    
    form.reset(formData);
    toast.info(`Loaded: ${analysis.name}`);
  };

  // Function to start a new analysis
  const startNewAnalysis = () => {
    setCurrentId(null);
    form.reset({
      name: "New P&L Analysis",
      direct_material: "",
      direct_labor_base: "",
      direct_labor_benefits: "",
      direct_labor_ot: "",
      temp_labor: "",
      indirect_labor_base: "",
      indirect_labor_benefits: "",
      indirect_labor_ot: "",
      salaried_labor_base: "",
      salaried_labor_benefits: "",
      salaried_labor_ot: "",
      copq: "",
      mro: "",
      utilities: "",
      freight_regular: "",
      freight_expedited: "",
      other_variable_overhead: "",
      other_fixed_overhead: "",
      other_sga: "",
    });
    toast.info("Started new analysis");
  };

  // Function to export analysis as CSV
  const exportAsCSV = () => {
    const values = form.getValues();
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += Object.keys(values).join(",") + "\n";
    
    // Add values
    csvContent += Object.values(values).map(value => {
      // Handle empty or null values
      if (value === null || value === "") return "";
      // Quote strings with commas
      if (typeof value === "string" && value.includes(",")) return `"${value}"`;
      return value;
    }).join(",");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${values.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV exported successfully");
  };

  // Function to export analysis as JSON
  const exportAsJSON = () => {
    const values = form.getValues();
    const jsonString = JSON.stringify(values, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = href;
    link.download = `${values.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    
    toast.success("JSON exported successfully");
  };

  // Render P&L Analysis page
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">P&L Analysis</h1>
          <p className="text-muted-foreground">
            Analyze your financial data to identify cost-saving opportunities.
            {isAnonymous && (
              <span className="block text-yellow-500 text-sm mt-1">
                You're in guest mode. Your data won't be saved.
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {user && !isAnonymous && (
            <>
              <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Analysis</DialogTitle>
                    <DialogDescription>
                      Give your analysis a name before saving.
                    </DialogDescription>
                  </DialogHeader>
                  <Input 
                    placeholder="Analysis name" 
                    value={form.getValues("name")}
                    onChange={(e) => form.setValue("name", e.target.value)} 
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleSave(form.getValues())} disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Saving..." : "Save Analysis"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Analysis</DialogTitle>
                    <DialogDescription>
                      Choose a format to export your analysis data.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col space-y-3">
                    <Button onClick={exportAsCSV}>Export as CSV</Button>
                    <Button onClick={exportAsJSON}>Export as JSON</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          {isAnonymous && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Analysis</DialogTitle>
                  <DialogDescription>
                    Choose a format to export your analysis data.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-3">
                  <Button onClick={exportAsCSV}>Export as CSV</Button>
                  <Button onClick={exportAsJSON}>Export as JSON</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={startNewAnalysis}>
            <Plus className="mr-2 h-4 w-4" /> New Analysis
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="input" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="input">
            <DollarSign className="mr-2 h-4 w-4" />
            Data Input
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart className="mr-2 h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="actions">
            <ListChecks className="mr-2 h-4 w-4" />
            Action Plan
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="input">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {user && !isAnonymous && savedAnalyses && savedAnalyses.length > 0 && (
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Saved Analyses</CardTitle>
                  <CardDescription>
                    Your previously saved P&L analyses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {loadingAnalyses ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : (
                      savedAnalyses.map((analysis) => (
                        <Button 
                          key={analysis.id} 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => loadAnalysis(analysis)}
                        >
                          {analysis.name}
                        </Button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className={user && !isAnonymous && savedAnalyses && savedAnalyses.length > 0 ? "md:col-span-2" : "md:col-span-3"}>
              <CardHeader>
                <CardTitle>Financial Data Input</CardTitle>
                <CardDescription>
                  Enter your financial data across all categories to begin your analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Labor Costs</h3>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Direct Labor</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <FormField
                              control={form.control}
                              name="direct_labor_base"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Base</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="direct_labor_benefits"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Benefits</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="direct_labor_ot"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Overtime</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="temp_labor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Temporary Labor</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Indirect Labor</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <FormField
                              control={form.control}
                              name="indirect_labor_base"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Base</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="indirect_labor_benefits"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Benefits</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="indirect_labor_ot"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Overtime</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Salaried Labor</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <FormField
                              control={form.control}
                              name="salaried_labor_base"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Base</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="salaried_labor_benefits"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Benefits</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="salaried_labor_ot"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Overtime</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Material & Overhead</h3>
                        
                        <FormField
                          control={form.control}
                          name="direct_material"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Direct Material</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="copq"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cost of Poor Quality (COPQ)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="mro"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MRO (Maintenance, Repair, Operations)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="utilities"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Utilities</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Freight</h4>
                          <div className="grid grid-cols-1 gap-3">
                            <FormField
                              control={form.control}
                              name="freight_regular"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Regular</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="freight_expedited"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expedited</FormLabel>
                                  <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="other_variable_overhead"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Other Variable Overhead</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="other_fixed_overhead"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Other Fixed Overhead</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="other_sga"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Other SG&A (Selling, General & Admin)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis Dashboard</CardTitle>
              <CardDescription>
                Visualize your cost breakdown and identify improvement opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This dashboard will show cost breakdown visualizations, "what-if" sliders for
                sensitivity analysis, and potential savings calculations based on industry benchmarks.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Improvement Action Plan</CardTitle>
              <CardDescription>
                Based on your analysis, here are recommended actions to improve operations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The action plan will provide targeted recommendations for cost reduction and
                operational improvements based on your specific financial data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default PLAnalysis;
