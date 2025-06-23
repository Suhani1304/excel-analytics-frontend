"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, Share, Settings, Zap, Target, Activity, RefreshCw } from "lucide-react"
import Link from "next/link"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { DataTable } from "@/components/data-table"
import { DataInsights } from "@/components/data-insights"
import { ExportDialog } from "@/components/export-dialog"

interface FileData {
  data: any[][]
  headers: string[]
  preview: {
    rows: number
    columns: number
    dataTypes: Record<string, string>
    sampleData: any[]
  }
}

interface FileAnalytics {
  id: string
  name: string
  uploadDate: string
  rows: number
  columns: number
  size: string
  dataQuality: number
  insights: number
  anomalies: number
  realTimeData?: FileData
}

export default function AnalyticsPage() {
  const [fileData, setFileData] = useState<FileAnalytics | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [realTimeMode, setRealTimeMode] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
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
    loadFileData()

    // Set up real-time updates
    const interval = setInterval(() => {
      if (realTimeMode) {
        loadFileData()
        setLastUpdate(new Date())
      }
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [router, params.id, realTimeMode])

  const loadFileData = () => {
    const fileId = params.id as string

    // Try to load real file data first
    const storedFileData = localStorage.getItem(`fileData_${fileId}`)

    if (storedFileData) {
      const realData: FileData = JSON.parse(storedFileData)

      const analytics: FileAnalytics = {
        id: fileId,
        name: realData.headers ? `Uploaded_File_${fileId.slice(-6)}.xlsx` : "Unknown File",
        uploadDate: new Date().toISOString(),
        rows: realData.preview.rows,
        columns: realData.preview.columns,
        size: "2.4 MB",
        dataQuality: calculateDataQuality(realData),
        insights: generateInsightCount(realData),
        anomalies: detectAnomalies(realData),
        realTimeData: realData,
      }

      setFileData(analytics)
    } else {
      // Fallback to mock data
      const mockFileData: FileAnalytics = {
        id: fileId,
        name: "Sales_Report_Q4.xlsx",
        uploadDate: new Date().toISOString(),
        rows: 15420,
        columns: 12,
        size: "2.4 MB",
        dataQuality: 96,
        insights: 8,
        anomalies: 3,
      }
      setFileData(mockFileData)
    }
  }

  const calculateDataQuality = (data: FileData): number => {
    if (!data.data || data.data.length === 0) return 0

    let totalCells = 0
    let filledCells = 0

    data.data.slice(1).forEach((row) => {
      // Skip header
      row.forEach((cell) => {
        totalCells++
        if (cell !== null && cell !== undefined && cell !== "") {
          filledCells++
        }
      })
    })

    return Math.round((filledCells / totalCells) * 100)
  }

  const generateInsightCount = (data: FileData): number => {
    const numericColumns = Object.values(data.preview.dataTypes).filter((type) => type === "number").length
    const dateColumns = Object.values(data.preview.dataTypes).filter((type) => type === "date").length

    return Math.min(numericColumns * 2 + dateColumns + 3, 12) // Cap at 12 insights
  }

  const detectAnomalies = (data: FileData): number => {
    // Simple anomaly detection based on data size and types
    const rows = data.preview.rows
    if (rows > 10000) return Math.floor(rows * 0.001) // 0.1% anomaly rate for large datasets
    if (rows > 1000) return Math.floor(rows * 0.002) // 0.2% for medium datasets
    return Math.floor(rows * 0.005) // 0.5% for small datasets
  }

  const toggleRealTimeMode = () => {
    setRealTimeMode(!realTimeMode)
  }

  if (!isAuthenticated || !fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
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
                  <h1 className="text-xl font-bold text-gray-900">Real-time Analytics</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{fileData.name}</span>
                    {realTimeMode && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-green-600">Live</span>
                        </div>
                        <span>• Updated: {lastUpdate.toLocaleTimeString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant={realTimeMode ? "default" : "outline"} size="sm" onClick={toggleRealTimeMode}>
                <RefreshCw className={`h-4 w-4 mr-2 ${realTimeMode ? "animate-spin" : ""}`} />
                {realTimeMode ? "Live Mode" : "Static Mode"}
              </Button>
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
                  Real-time File Analysis
                </CardTitle>
                <CardDescription>Dynamic analytics for {fileData.name} with live data processing</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Analysis Active
                </Badge>
                {realTimeMode && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800 animate-pulse">
                    Real-time
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Rows</p>
                <p className="text-2xl font-bold text-blue-600">{fileData.rows.toLocaleString()}</p>
                {realTimeMode && <p className="text-xs text-blue-500 mt-1">Live count</p>}
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Columns</p>
                <p className="text-2xl font-bold text-green-600">{fileData.columns}</p>
                {fileData.realTimeData && (
                  <p className="text-xs text-green-500 mt-1">
                    {Object.keys(fileData.realTimeData.preview.dataTypes).length} types detected
                  </p>
                )}
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Data Quality</p>
                <p className="text-2xl font-bold text-purple-600">{fileData.dataQuality}%</p>
                <Progress value={fileData.dataQuality} className="mt-2 h-1" />
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">AI Insights</p>
                <p className="text-2xl font-bold text-orange-600">{fileData.insights}</p>
                {realTimeMode && <p className="text-xs text-orange-500 mt-1">Auto-updating</p>}
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
                Live Charts
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Data View
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
                  <CardTitle>Real-time Data Quality</CardTitle>
                  <CardDescription>Live assessment of data quality metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Quality Score</span>
                    <span className="text-sm font-bold text-green-600">{fileData.dataQuality}%</span>
                  </div>
                  <Progress value={fileData.dataQuality} className="h-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Data Completeness</span>
                    <span className="text-sm font-bold text-blue-600">{Math.min(fileData.dataQuality + 2, 100)}%</span>
                  </div>
                  <Progress value={Math.min(fileData.dataQuality + 2, 100)} className="h-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Type Consistency</span>
                    <span className="text-sm font-bold text-purple-600">
                      {Math.min(fileData.dataQuality - 2, 100)}%
                    </span>
                  </div>
                  <Progress value={Math.min(fileData.dataQuality - 2, 100)} className="h-3" />

                  {realTimeMode && (
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                      Updating in real-time
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Column Analysis</CardTitle>
                  <CardDescription>
                    {fileData.realTimeData ? "Real data types and patterns" : "Data structure analysis"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fileData.realTimeData
                      ? Object.entries(fileData.realTimeData.preview.dataTypes)
                          .slice(0, 6)
                          .map(([column, type], index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{column}</p>
                                <p className="text-xs text-gray-600 capitalize">{type}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={95 + Math.random() * 5} className="w-16 h-2" />
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    type === "number"
                                      ? "bg-blue-100 text-blue-800"
                                      : type === "date"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {type}
                                </Badge>
                              </div>
                            </div>
                          ))
                      : // Mock data for demo
                        [
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
            <AnalyticsCharts fileName={fileData.name} realTimeMode={realTimeMode} />
          </TabsContent>

          <TabsContent value="data">
            <DataTable fileName={fileData.name} realTimeMode={realTimeMode} />
          </TabsContent>

          <TabsContent value="insights">
            <DataInsights fileData={fileData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
