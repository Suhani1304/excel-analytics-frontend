"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Shield,
  Users,
  FileSpreadsheet,
  Activity,
  LogOut,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Download,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserUpload {
  id: number
  userName: string
  userEmail: string
  fileName: string
  fileSize: string
  uploadDate: string
  uploadTime: string
  status: "completed" | "processing" | "error"
  rows: number
  columns: number
}

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [uploads, setUploads] = useState<UserUpload[]>([
    {
      id: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      fileName: "Sales_Report_Q4.xlsx",
      fileSize: "2.4 MB",
      uploadDate: "2024-01-15",
      uploadTime: "10:30:45",
      status: "completed",
      rows: 15420,
      columns: 12,
    },
    {
      id: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      fileName: "Customer_Analytics.xlsx",
      fileSize: "1.8 MB",
      uploadDate: "2024-01-15",
      uploadTime: "09:15:22",
      status: "completed",
      rows: 8930,
      columns: 8,
    },
    {
      id: 3,
      userName: "Mike Johnson",
      userEmail: "mike@example.com",
      fileName: "Financial_Data.xlsx",
      fileSize: "3.1 MB",
      uploadDate: "2024-01-14",
      uploadTime: "16:45:10",
      status: "processing",
      rows: 22150,
      columns: 15,
    },
    {
      id: 4,
      userName: "Sarah Wilson",
      userEmail: "sarah@example.com",
      fileName: "Inventory_Report.xlsx",
      fileSize: "1.2 MB",
      uploadDate: "2024-01-14",
      uploadTime: "14:20:33",
      status: "completed",
      rows: 5670,
      columns: 6,
    },
    {
      id: 5,
      userName: "David Brown",
      userEmail: "david@example.com",
      fileName: "Marketing_Data.xlsx",
      fileSize: "4.5 MB",
      uploadDate: "2024-01-13",
      uploadTime: "11:55:18",
      status: "error",
      rows: 0,
      columns: 0,
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
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
  }, [router])

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

  const filteredUploads = uploads.filter((upload) => {
    const matchesSearch =
      upload.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      upload.userEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || upload.status === statusFilter

    const matchesDate = dateFilter === "all" || upload.uploadDate === dateFilter

    return matchesSearch && matchesStatus && matchesDate
  })

  const totalUsers = new Set(uploads.map((upload) => upload.userEmail)).size
  const totalUploads = uploads.length
  const completedUploads = uploads.filter((upload) => upload.status === "completed").length
  const totalDataPoints = uploads.reduce((sum, upload) => sum + upload.rows, 0)

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
                  {organizationName} • Welcome, {adminName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                System Status
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
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-blue-200">Active platform users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Total Uploads</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUploads}</div>
              <p className="text-xs text-green-200">Files uploaded today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Processed</CardTitle>
              <Activity className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedUploads}</div>
              <p className="text-xs text-purple-200">Successfully processed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">Data Points</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalDataPoints / 1000).toFixed(1)}K</div>
              <p className="text-xs text-orange-200">Total rows processed</p>
            </CardContent>
          </Card>
        </div>

        {/* User Upload Monitoring */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  User Upload Monitoring
                </CardTitle>
                <CardDescription>
                  Monitor all user file uploads with timestamps (files are not accessible)
                </CardDescription>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Filters */}
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
                  <SelectItem value="2024-01-15">Today</SelectItem>
                  <SelectItem value="2024-01-14">Yesterday</SelectItem>
                  <SelectItem value="2024-01-13">2 days ago</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
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
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Upload Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{upload.userName}</div>
                          <div className="text-sm text-gray-600">{upload.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{upload.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{upload.fileSize}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {upload.uploadDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {upload.uploadTime}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(upload.status)}>{upload.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {upload.status === "completed" ? (
                          <div className="text-sm text-gray-600">
                            <div>{upload.rows.toLocaleString()} rows</div>
                            <div>{upload.columns} columns</div>
                          </div>
                        ) : upload.status === "processing" ? (
                          <div className="text-sm text-yellow-600">Processing...</div>
                        ) : (
                          <div className="text-sm text-red-600">Failed</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredUploads.length} of {totalUploads} uploads
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">File processed successfully</p>
                    <p className="text-xs text-gray-600">John Doe • Sales_Report_Q4.xlsx • 2 min ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New user registration</p>
                    <p className="text-xs text-gray-600">Jane Smith • jane@example.com • 5 min ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">File processing started</p>
                    <p className="text-xs text-gray-600">Mike Johnson • Financial_Data.xlsx • 8 min ago</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analytics report generated</p>
                    <p className="text-xs text-gray-600">Sarah Wilson • Inventory_Report.xlsx • 12 min ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Platform performance and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Server Status</span>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Connection</span>
                  <Badge className="bg-green-100 text-green-800">Connected</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">File Processing Queue</span>
                  <Badge className="bg-yellow-100 text-yellow-800">2 pending</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-gray-600">45.2 GB / 100 GB</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Users (24h)</span>
                  <span className="text-sm text-gray-600">{totalUsers}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Files Processed Today</span>
                  <span className="text-sm text-gray-600">{completedUploads}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
