"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, Share, Settings, Zap, Target, Activity } from "lucide-react"
import Link from "next/link"
import { AdvancedCharts } from "@/components/advanced-charts"
import { DataInsights } from "@/components/data-insights"
import { ExportDialog } from "@/components/export-dialog"

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

export default function AnalyticsPage() {
  const [fileData, setFileData] = useState<FileAnalytics | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")

    if (!token || role !== "user") {
      router.push("/auth/login")
      return
    }

    setIsAuthenticated(true)

    // Mock file data based on ID
    const mockFileData: FileAnalytics = {
      id: Number.parseInt(params.id as string),
      name: "Sales_Report_Q4.xlsx",
      uploadDate: "2024-01-15T10:30:00Z",
      rows: 15420,
      columns: 12,
      size: "2.4 MB",
      dataQuality: 96,
      insights: 8,
      anomalies: 3,
    }

    setFileData(mockFileData)
  }, [router, params.id])

  if (!isAuthenticated || !fileData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-600">{fileData.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <ExportDialog selectedFile={fileData} />
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* File Summary */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  File Analysis Summary
                </CardTitle>
                <CardDescription>Comprehensive analytics for {fileData.name}</CardDescription>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Analysis Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-blue-600">{fileData.rows.toLocaleString()}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Columns</p>
                <p className="text-2xl font-bold text-green-600">{fileData.columns}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Data Quality</p>
                <p className="text-2xl font-bold text-purple-600">{fileData.dataQuality}%</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">AI Insights</p>
                <p className="text-2xl font-bold text-orange-600">{fileData.insights}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
            <TabsList className="bg-gray-100">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Advanced Charts
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Data Quality Metrics</CardTitle>
                  <CardDescription>Comprehensive data quality assessment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Quality Score</span>
                    <span className="text-sm font-bold text-green-600">{fileData.dataQuality}%</span>
                  </div>
                  <Progress value={fileData.dataQuality} className="h-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Completeness</span>
                    <span className="text-sm font-bold text-blue-600">98%</span>
                  </div>
                  <Progress value={98} className="h-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Consistency</span>
                    <span className="text-sm font-bold text-purple-600">94%</span>
                  </div>
                  <Progress value={94} className="h-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Accuracy</span>
                    <span className="text-sm font-bold text-orange-600">92%</span>
                  </div>
                  <Progress value={92} className="h-3" />
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Column Analysis</CardTitle>
                  <CardDescription>Data types and quality by column</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Product Name", type: "Text", quality: 100 },
                      { name: "Sales Amount", type: "Number", quality: 98 },
                      { name: "Date", type: "Date", quality: 95 },
                      { name: "Region", type: "Text", quality: 92 },
                      { name: "Customer ID", type: "Text", quality: 100 },
                      { name: "Quantity", type: "Number", quality: 97 },
                    ].map((column, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{column.name}</p>
                          <p className="text-xs text-gray-600">{column.type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={column.quality} className="w-16 h-2" />
                          <Badge variant="secondary" className="text-xs">
                            {column.quality}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="charts">
            <AdvancedCharts fileName={fileData.name} />
          </TabsContent>

          <TabsContent value="insights">
            <DataInsights fileData={fileData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
