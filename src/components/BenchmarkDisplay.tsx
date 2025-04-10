import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartBar, Target, TrendingUp, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

interface MetricRangeValue {
  min: number;
  max: number;
}

interface MetricValue {
  best_in_class?: number;
  world_class?: number;
  industry_average?: MetricRangeValue;
  competitive?: MetricRangeValue;
  typical_components?: string[];
  reduction_strategies?: string[];
  range?: MetricRangeValue;
  unit?: string;
  value?: number;
  [key: string]: number | string | string[] | MetricRangeValue | undefined;
}

interface Benchmark {
  id: string;
  category_id: string;
  metric_name: string;
  metric_value: MetricValue;
  context: string;
  source: string;
}

interface BenchmarkCategory {
  id: string;
  name: string;
  description: string;
}

interface ComparisonValue {
  metricId: string;
  value: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
  isComparison: boolean;
}

export const BenchmarkDisplay = () => {
  const [comparisons, setComparisons] = useState<ComparisonValue[]>([]);

  // Fetch benchmark categories
  const { data: categories } = useQuery<BenchmarkCategory[]>({
    queryKey: ['benchmarkCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benchmark_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch benchmarks
  const { data: benchmarks } = useQuery<Benchmark[]>({
    queryKey: ['benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .order('metric_name');
      
      if (error) throw error;
      return data;
    }
  });

  const getBenchmarksByCategory = (categoryId: string) => {
    return benchmarks?.filter(b => b.category_id === categoryId) || [];
  };

  const handleComparisonChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setComparisons(prev => {
      const existing = prev.find(c => c.metricId === metricId);
      if (existing) {
        return prev.map(c => c.metricId === metricId ? { ...c, value: numValue } : c);
      }
      return [...prev, { metricId, value: numValue }];
    });
  };

  const getComparisonStatus = (benchmark: Benchmark, value: number): 'success' | 'warning' | 'error' | null => {
    const metricValue = benchmark.metric_value;
    
    if (typeof metricValue !== 'object') return null;

    if ('best_in_class' in metricValue) {
      if (value >= metricValue.best_in_class) return 'success';
      if (value >= metricValue.industry_average?.min) return 'warning';
      return 'error';
    }

    if ('world_class' in metricValue) {
      if (value >= metricValue.world_class) return 'success';
      if (value >= metricValue.competitive?.min) return 'warning';
      return 'error';
    }

    return null;
  };

  const getValueFromMetric = (val: MetricValue[keyof MetricValue]): number | undefined => {
    if (typeof val === 'number') return val;
    if (Array.isArray(val)) return undefined;
    if (typeof val === 'string') return undefined;
    if (val && 'min' in val) return val.min;
    if (val && 'value' in val && typeof val.value === 'number') return val.value;
    return undefined;
  };

  const renderMetricValue = (benchmark: Benchmark) => {
    const value = benchmark.metric_value;
    const comparison = comparisons.find(c => c.metricId === benchmark.id);

    if (typeof value === 'object') {
      // Prepare data for visualization
      const chartData: ChartDataPoint[] = Object.entries(value)
        .filter(([key]) => !Array.isArray(value[key])) // Skip array values
        .map(([key, val]) => {
          const numericValue = getValueFromMetric(val);
          if (numericValue === undefined) return null;
          return {
            name: key.replace(/_/g, ' '),
            value: numericValue,
            isComparison: false
          };
        })
        .filter((point): point is ChartDataPoint => point !== null);

      if (comparison) {
        chartData.push({
          name: 'Your Value',
          value: comparison.value,
          isComparison: true
        });
      }

      return (
        <div className="space-y-4">
          {/* Visualization */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.isComparison ? '#2563eb' : '#64748b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Raw Values */}
          <div className="space-y-2">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="font-medium">
                  {Array.isArray(val) 
                    ? val.join(', ')
                    : (typeof val === 'object' 
                      ? JSON.stringify(val) 
                      : val)}
                </span>
              </div>
            ))}
          </div>

          {/* Comparison Input */}
          <div className="flex items-end gap-4 pt-2">
            <div className="flex-1">
              <Label htmlFor={`compare-${benchmark.id}`}>Compare Your Value</Label>
              <Input
                id={`compare-${benchmark.id}`}
                type="number"
                value={comparison?.value || ''}
                onChange={(e) => handleComparisonChange(benchmark.id, e.target.value)}
                placeholder="Enter your value"
              />
            </div>
            {comparison && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`p-2 rounded-full bg-${getComparisonStatus(benchmark, comparison.value)}-100`}>
                      <Info className={`h-4 w-4 text-${getComparisonStatus(benchmark, comparison.value)}-500`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {getComparisonStatus(benchmark, comparison.value) === 'success' && 'World class performance!'}
                    {getComparisonStatus(benchmark, comparison.value) === 'warning' && 'Competitive, but room for improvement'}
                    {getComparisonStatus(benchmark, comparison.value) === 'error' && 'Below industry average'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      );
    }

    return <span className="font-medium">{value}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Rest of the component code */}
    </div>
  );
};