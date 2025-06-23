"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, AlertTriangle, CheckCircle, Target, Zap, Brain, Activity } from "lucide-react"

interface FileAnalytics {
  id: number
  name: string
  uploadDate: string
  rows: number
  columns: number
  size: string
  dataQuality: number
  insights: number
  anomalies: number
}

interface DataInsightsProps {
  fileData: FileAnalytics
}

export function DataInsights({ fileData }: DataInsightsProps) {
  const insights = [
    {
      id: 1,
      type: "trend",
      title: "Strong Q4 Performance",
      description:
        "Sales data shows a 23% increase in Q4 compared to Q3, with Technology sector leading growth at 34%.",
      impact: "high",
      confidence: 95,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: 2,
      type: "anomaly",
      title: "Regional Performance Variance",
      description: "North region shows 45% higher performance than average, while West region underperforms by 18%.",
      impact: "medium",
      confidence: 87,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: 3,
      type: "opportunity",
      title: "Customer Segmentation Potential",
      description: "Data reveals 3 distinct customer segments with different purchasing patterns and lifetime values.",
      impact: "high",
      confidence: 92,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: 4,
      type: "quality",
      title: "Data Quality Assessment",
      description:
        "Excellent data quality with 96% completeness. Minor issues in 'Region' column affecting 4% of records.",
      impact: "low",
      confidence: 99,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      id: 5,
      type: "prediction",
      title: "Revenue Forecast",
      description: "Based on current trends, Q1 2024 revenue is projected to increase by 15-20% compared to Q1 2023.",
      impact: "high",
      confidence: 78,
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      id: 6,
      type: "correlation",
      title: "Marketing ROI Correlation",
      description: "Strong correlation (0.84) between marketing spend and sales performance across all regions.",
      impact: "medium",
      confidence: 91,
      icon: Activity,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
  ]

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Summary */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            AI-Powered Insights Summary
          </CardTitle>
          <CardDescription>Advanced analytics and machine learning insights for {fileData.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{fileData.insights}</p>
              <p className="text-sm text-gray-600">AI Insights Generated</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{fileData.anomalies}</p>
              <p className="text-sm text-gray-600">Anomalies Detected</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{fileData.dataQuality}%</p>
              <p className="text-sm text-gray-600">Data Quality Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight) => {
          const IconComponent = insight.icon
          return (
            <Card key={insight.id} className={`shadow-lg border ${insight.borderColor} ${insight.bgColor}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white">
                      <IconComponent className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getImpactColor(insight.impact)} variant="secondary">
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{insight.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Confidence Level</span>
                    <span className="font-bold">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />
                </div>

                {insight.type === "trend" && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Recommendation:</strong> Capitalize on this positive trend by increasing marketing efforts
                      in high-performing segments.
                    </AlertDescription>
                  </Alert>
                )}

                {insight.type === "anomaly" && (
                  <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Action Required:</strong> Investigate the root cause of performance variance and implement
                      corrective measures.
                    </AlertDescription>
                  </Alert>
                )}

                {insight.type === "opportunity" && (
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <Target className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Opportunity:</strong> Develop targeted strategies for each customer segment to maximize
                      revenue potential.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Key Metrics and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>Critical metrics derived from your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Revenue Growth Rate</span>
                <span className="text-lg font-bold text-blue-600">+23.4%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Customer Retention</span>
                <span className="text-lg font-bold text-green-600">87.2%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Average Order Value</span>
                <span className="text-lg font-bold text-purple-600">$342</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">Market Share</span>
                <span className="text-lg font-bold text-orange-600">15.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Strategic Recommendations</CardTitle>
            <CardDescription>AI-generated action items based on your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                <h4 className="font-semibold text-blue-900">Expand High-Performing Regions</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Focus resources on North and East regions showing 35%+ growth
                </p>
              </div>
              <div className="p-4 border-l-4 border-green-500 bg-green-50">
                <h4 className="font-semibold text-green-900">Optimize Product Mix</h4>
                <p className="text-sm text-green-800 mt-1">
                  Increase inventory for top 20% products driving 80% of revenue
                </p>
              </div>
              <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
                <h4 className="font-semibold text-purple-900">Customer Segmentation</h4>
                <p className="text-sm text-purple-800 mt-1">
                  Implement targeted campaigns for 3 identified customer segments
                </p>
              </div>
              <div className="p-4 border-l-4 border-orange-500 bg-orange-50">
                <h4 className="font-semibold text-orange-900">Seasonal Planning</h4>
                <p className="text-sm text-orange-800 mt-1">Prepare for Q1 surge with 20% inventory increase</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
