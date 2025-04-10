
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/MainLayout";
import { ArrowRight, BarChart2, ClipboardCheck, FileText, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: FileText,
    title: "P&L Analysis",
    description: "Analyze your financial data to identify cost-saving opportunities and operational improvements.",
    href: "/pl-analysis",
  },
  {
    icon: ClipboardCheck,
    title: "Maturity Assessment",
    description: "Evaluate your operational maturity across 10 key dimensions to benchmark against industry standards.",
    href: "/maturity-assessment",
  },
  {
    icon: MessageSquare,
    title: "Guided Discovery",
    description: "Use structured questioning to identify root causes and develop targeted improvement plans.",
    href: "/guided-discovery",
  },
];

const Index = () => {
  return (
    <MainLayout>
      <section className="py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <BarChart2 className="h-6 w-6 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Operations Assessment Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Transform Your Manufacturing Operations
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Analyze your operational performance, identify improvement opportunities, and
            develop targeted action plans to increase efficiency and reduce costs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link to="/pl-analysis">Start P&L Analysis <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/maturity-assessment">Take Maturity Assessment</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Three powerful tools to optimize your operations
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border border-border">
                <CardHeader>
                  <div className="p-2 w-fit rounded-md bg-primary/10 mb-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={feature.href}>
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/50 rounded-lg">
        <div className="max-w-4xl mx-auto text-center p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to optimize your operations?</h2>
          <p className="text-muted-foreground mb-8">
            Start with our P&L Analysis to identify cost-saving opportunities and develop
            targeted improvement plans.
          </p>
          <Button asChild size="lg">
            <Link to="/pl-analysis">Start P&L Analysis</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
