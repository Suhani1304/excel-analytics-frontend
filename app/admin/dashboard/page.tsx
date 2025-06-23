"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, FileSpreadsheet, LogOut, Search, Clock, Eye, RefreshCw, History, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RealTimeMetrics } from "@/components/real-time-metrics"
import { DynamicNotifications } from "@/components/dynamic-notifications"

interface UploadHistory {
  id: string
  fileName: string
  fileSize: string
  uploadDate: string
  userName: string
  userEmail: string
  rows: number
  columns: number
  status: string
  dataTypes: Record<string, string>
}

interface Notification {
  id: number
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timestamp: Date
}

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<UploadHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")
    const org = localStorage.getItem("organizationName")

    if (!token || role !== "admin") {
      router.push("/auth/login")
      return
    }

    setAdminName(name || "Admin")
    setOrganizationName(org || "Organization")

    loadUploadHistory()

    // Set up real-time monitoring
    const interval = setInterval(() => {
      loadUploadHistory()
      generateRandomNotification()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [router])

  const loadUploadHistory = () => {
    const history = JSON.parse(localStorage.getItem("uploadHistory") || "[]")
    setUploadHistory(history)
    setFilteredHistory(history)
    setLastRefresh(new Date())
  }

  const generateRandomNotification = () => {
    const randomEvents = [
      { type: "success", title: "File Processed", message: "Sales_Report_Q4.xlsx processed successfully" },
      { type: "info", title: "New Upload", message: "User uploaded Customer_Data.xlsx" },
      { type: "warning", title: "Large File", message: "Processing 45MB file may take longer" },
      { type: "success", title: "Analysis Complete", message: "Generated insights for Marketing_Data.xlsx" },
    ]

    if (Math.random() > 0.7) {
      // 30% chance of new notification
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)]
      const newNotification: Notification = {
        id: Date.now(),
        type: event.type as any,
        title: event.title,
        message: event.message,
        timestamp: new Date(),
      }

      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]) // Keep last 10
    }
  }

  useEffect(() => {
    let filtered = uploadHistory

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    if (dateFilter !== "all") {
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

      if (dateFilter === "today") {
        filtered = filtered.filter((item) => item.uploadDate.startsWith(today))
      } else if (dateFilter === "yesterday") {
        filtered = filtered.filter((item) => item.uploadDate.startsWith(yesterday))
      }
    }

    setFilteredHistory(filtered)
  }, [uploadHistory, searchTerm, statusFilter, dateFilter])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userName")
    localStorage.removeItem("organizationName")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalUsers = new Set(uploadHistory.map((item) => item.userEmail)).size
  const totalUploads = uploadHistory.length
  const completedUploads = uploadHistory.filter((item) => item.status === "completed").length
  const totalDataPoints = uploadHistory.reduce((sum, item) => sum + item.rows, 0)
  const avgDataQuality = 94 // Mock average
  const totalInsights = uploadHistory.length * 3 // Mock insights

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {organizationName} • Real-time monitoring • Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DynamicNotifications notifications={notifications} onClear={setNotifications} />
              <Button variant="ghost" size="sm" onClick={loadUploadHistory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Real-time Metrics */}
        <RealTimeMetrics
          totalFiles={totalUploads}
          totalRows={totalDataPoints}
          avgDataQuality={avgDataQuality}
          totalInsights={totalInsights}
          processedFiles={completedUploads}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live Monitoring
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Upload History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              System Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Real-time Upload Monitoring
                    </CardTitle>
                    <CardDescription>
                      Live monitoring of user file uploads (file contents are private and secure)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Live</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users, files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Upload Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Summary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.slice(0, 10).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.userName}</div>
                              <div className="text-sm text-gray-600">{item.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{item.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.fileSize}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {new Date(item.uploadDate).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              <div>
                                {item.rows.toLocaleString()} rows • {item.columns} cols
                              </div>
                              <div className="text-xs text-gray-500">
                                {Object.keys(item.dataTypes || {}).length} data types detected
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
                  <span>Showing latest {Math.min(filteredHistory.length, 10)} uploads</span>
                  <span>Total: {filteredHistory.length} files monitored</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Complete Upload History
                </CardTitle>
                <CardDescription>
                  Historical record of all file uploads with metadata (no file content access)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Data Types</TableHead>
                        <TableHead>Rows/Columns</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(item.uploadDate).toLocaleDateString()}
                              <div className="text-xs text-gray-500">
                                {new Date(item.uploadDate).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{item.userName}</div>
                              <div className="text-xs text-gray-600">{item.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{item.fileName}</div>
                              <div className="text-xs text-gray-500">{item.fileSize}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(item.dataTypes || {})
                                .slice(0, 3)
                                .map(([col, type]) => (
                                  <Badge key={col} variant="outline" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              {Object.keys(item.dataTypes || {}).length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{Object.keys(item.dataTypes || {}).length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {item.rows.toLocaleString()} × {item.columns}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Real-time system metrics and health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing Queue</span>
                      <Badge className="bg-green-100 text-green-800">Empty</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Processing Time</span>
                      <span className="text-sm text-gray-600">2.3 seconds</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm text-green-600 font-medium">98.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Storage Used</span>
                      <span className="text-sm text-gray-600">{(uploadHistory.length * 2.5).toFixed(1)} MB / 1 GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Platform usage insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Active User</span>
                      <span className="text-sm text-gray-600">
                        {uploadHistory.length > 0 ? uploadHistory[0].userName : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Peak Upload Time</span>
                      <span className="text-sm text-gray-600">2:00 PM - 4:00 PM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Most Common File Type</span>
                      <span className="text-sm text-gray-600">.xlsx (67%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average File Size</span>
                      <span className="text-sm text-gray-600">2.8 MB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
