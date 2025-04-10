import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { 
  Download, 
  Save, 
  RefreshCw, 
  UserIcon,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

interface Response {
  questionId: string;
  score: number;
  notes: string;
}

interface Question {
  id: string;
  category: string;
  question: string;
  description: string | null;
  weight: number;
}

interface CategoryData {
  category: string;
  title: string;
  score: number;
  totalQuestions: number;
  questions: {
    question: string;
    score: number;
    notes: string;
  }[];
}

interface AssessmentSummaryProps {
  responses: Response[];
  questions: Question[];
  categoryDescriptions: Record<string, { title: string; description: string }>;
  onSaveComplete: () => void;
  onBack: () => void;
}

export const AssessmentSummary = ({
  responses,
  questions,
  categoryDescriptions,
  onSaveComplete,
  onBack
}: AssessmentSummaryProps) => {
  const { user, isAnonymous, signIn } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Process data by category for visualization
  const processData = (): CategoryData[] => {
    const categories = Object.keys(categoryDescriptions);
    
    return categories.map(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryResponses = responses.filter(r => 
        categoryQuestions.some(q => q.id === r.questionId)
      );
      
      const totalScore = categoryResponses.reduce((sum, r) => sum + r.score, 0);
      const averageScore = categoryResponses.length > 0 
        ? totalScore / categoryResponses.length 
        : 0;
      
      return {
        category,
        title: categoryDescriptions[category].title,
        score: parseFloat(averageScore.toFixed(1)),
        totalQuestions: categoryQuestions.length,
        questions: categoryResponses.map(r => {
          const q = categoryQuestions.find(q => q.id === r.questionId);
          return {
            question: q?.question || "Unknown question",
            score: r.score,
            notes: r.notes
          };
        })
      };
    });
  };

  const chartData = processData();
  
  // For radar chart
  const radarData = chartData.map(c => ({
    subject: c.title,
    score: c.score,
    fullMark: 5
  }));

  // Save assessment to database
  const handleSave = async () => {
    if (!user || isAnonymous) {
      toast.error("Please log in to save your assessment");
      return;
    }

    setIsSaving(true);
    
    try {
      // 1. Create a session
      const { data: session, error: sessionError } = await supabase
        .from("assessment_sessions")
        .insert({
          user_id: user.id,
          name: `Assessment ${new Date().toLocaleDateString()}`,
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Session creation error:", sessionError);
        throw new Error("Failed to create assessment session");
      }

      if (!session) {
        throw new Error("Session created but no data returned");
      }

      // 2. Save all responses
      const responseErrors = [];
      
      for (const response of responses) {
        // Use upsert with an on conflict strategy
        const { error: responseError } = await supabase
          .from("assessment_responses")
          .upsert(
            {
              user_id: user.id,
              question_id: response.questionId,
              score: response.score,
              notes: response.notes
            },
            {
              onConflict: 'user_id,question_id',
              ignoreDuplicates: false
            }
          );

        if (responseError) {
          console.error("Response save error:", responseError);
          responseErrors.push(responseError);
        }
      }

      if (responseErrors.length > 0) {
        toast.warning(`Assessment saved with ${responseErrors.length} errors. Some responses may not be saved.`);
      } else {
        toast.success("Assessment saved successfully!");
      }
      
      onSaveComplete();
    } catch (error: any) {
      console.error("Error saving assessment:", error);
      toast.error(`Failed to save assessment: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Export assessment as CSV
  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Create CSV content
      const categoryData = processData();
      let csvContent = "Category,Question,Score,Notes\n";
      
      categoryData.forEach(category => {
        category.questions.forEach(q => {
          // Handle undefined, null or empty notes properly
          const safeNotes = q.notes ? q.notes.replace(/"/g, '""') : "";
          csvContent += `"${category.title}","${q.question.replace(/"/g, '""')}",${q.score},"${safeNotes}"\n`;
        });
      });
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `assessment-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up the URL object
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("Assessment exported to CSV successfully!");
    } catch (error) {
      console.error("Error exporting assessment:", error);
      toast.error("Failed to export CSV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export assessment as PDF
  const handleExportPDF = async () => {
    if (!summaryRef.current) {
      toast.error("Could not generate PDF");
      return;
    }

    setIsExportingPDF(true);

    try {
      // Create PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Add title
      pdf.setFontSize(20);
      pdf.text("Operations Maturity Assessment", 105, 15, { align: "center" });
      pdf.setFontSize(12);
      pdf.text(new Date().toLocaleDateString(), 105, 22, { align: "center" });
      
      // Add radar chart
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { scale: 2 });
        const chartImgData = canvas.toDataURL('image/png');
        pdf.addImage(chartImgData, 'PNG', 55, 30, 100, 80);
      }
      
      // Add category scores table
      const categoryData = processData();
      pdf.setFontSize(14);
      pdf.text("Category Scores", 14, 120);
      
      autoTable(pdf, {
        startY: 125,
        head: [['Category', 'Description', 'Score']],
        body: categoryData.map(c => [
          c.title, 
          categoryDescriptions[c.category].description.substring(0, 80) + "...",
          c.score.toString() + " / 5"
        ]),
        theme: 'grid',
        styles: { overflow: 'linebreak', cellWidth: 'wrap' },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 100 },
          2: { cellWidth: 20 }
        },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 }
      });
      
      // Add detailed responses
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Detailed Responses", 14, 15);
      
      // Group responses by category for better organization
      let currentY = 25;
      
      categoryData.forEach((category, index) => {
        if (index > 0 && currentY > 240) {
          pdf.addPage();
          currentY = 15;
        }
        
        pdf.setFontSize(14);
        pdf.setTextColor(37, 99, 235);
        pdf.text(category.title, 14, currentY);
        pdf.setTextColor(0, 0, 0);
        currentY += 8;
        
        pdf.setFontSize(10);
        pdf.text(categoryDescriptions[category.category].description, 14, currentY, {
          maxWidth: 180
        });
        currentY += 12;
        
        const tableRows: string[][] = [];
        category.questions.forEach(q => {
          tableRows.push([
            q.question,
            q.score.toString(),
            q.notes || "-"
          ]);
        });
        
        autoTable(pdf, {
          startY: currentY,
          head: [['Question', 'Score', 'Notes']],
          body: tableRows,
          theme: 'striped',
          styles: { overflow: 'linebreak', cellWidth: 'wrap' },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 15 },
            2: { cellWidth: 80 }
          },
          headStyles: { fillColor: [100, 100, 100] }
        });
        
        // Update current Y position for next category
        const finalY = (pdf as any).lastAutoTable.finalY;
        currentY = finalY + 15;
      });
      
      // Save the PDF
      pdf.save(`assessment-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Assessment exported to PDF successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-8" ref={summaryRef}>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Assessment Summary</h1>
        <p className="text-muted-foreground mt-2">
          Your maturity assessment across all operational dimensions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maturity Radar</CardTitle>
          <CardDescription>
            Your scores across all assessment categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full" ref={chartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="80%">
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Scores</CardTitle>
          <CardDescription>
            Breakdown of your assessment by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {processData().map((category) => (
              <div key={category.category} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">{category.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xl font-bold mr-2">{category.score}</span>
                    <span className="text-sm text-muted-foreground">/ 5</span>
                  </div>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${(category.score / 5) * 100}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 max-w-60"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Back to Assessment
        </Button>
        
        <Button
          onClick={handleExport}
          variant="outline"
          disabled={isExporting}
          className="flex-1 max-w-60"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export as CSV"}
        </Button>
        
        <Button 
          onClick={handleExportPDF}
          variant="outline"
          disabled={isExportingPDF}
          className="flex-1 max-w-60"
        >
          <FileText className="mr-2 h-4 w-4" />
          {isExportingPDF ? "Exporting..." : "Export as PDF"}
        </Button>

        {(!user || isAnonymous) ? (
          <Button 
            onClick={() => signIn("google")}
            className="flex-1 max-w-60 bg-green-600 hover:bg-green-700"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Login to Save
          </Button>
        ) : (
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 max-w-60 bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Assessment"}
          </Button>
        )}
      </div>

      {(!user || isAnonymous) && (
        <div className="text-center p-4 bg-yellow-50 rounded-md text-yellow-700 text-sm">
          You are not logged in. Your assessment results will be lost when you leave this page.
          <br />
          Log in to save your results and view them later.
        </div>
      )}
    </div>
  );
}; 