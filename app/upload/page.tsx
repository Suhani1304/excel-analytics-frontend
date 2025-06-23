"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileSpreadsheet, Upload, X, CheckCircle, AlertCircle, ArrowLeft, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  id: string
  name: string
  size: string
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
  preview?: {
    rows: number
    columns: number
  }
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")

    if (!token || role !== "user") {
      router.push("/auth/login")
      return
    }

    setIsAuthenticated(true)
  }, [router])

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = [".xlsx", ".xls", ".csv"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validTypes.includes(fileExtension)) {
      return `Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.`
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return `File too large. Maximum size is 50MB.`
    }

    return null
  }

  const processFile = async (file: File) => {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      progress: 0,
      status: "uploading",
    }

    setUploadedFiles((prev) => [...prev, newFile])

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
      }

      // Switch to processing
      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 0 } : f)))

      // Simulate processing
      for (let i = 0; i <= 100; i += 25) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
      }

      // Complete processing
      const mockPreview = {
        rows: Math.floor(Math.random() * 15000) + 1000,
        columns: Math.floor(Math.random() * 15) + 5,
      }

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "completed",
                progress: 100,
                preview: mockPreview,
              }
            : f,
        ),
      )
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error: "Processing failed. Please try again.",
              }
            : f,
        ),
      )
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const error = validateFile(file)
      if (error) {
        alert(error)
        return
      }
      processFile(file)
    })

    // Reset input
    event.target.value = ""
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    files.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        alert(error)
        return
      }
      processFile(file)
    })
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileSpreadsheet className="h-5 w-5 text-blue-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Processing..."
      case "completed":
        return "Ready for analysis"
      case "error":
        return "Upload failed"
      default:
        return "Unknown"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Upload Excel Files</h1>
                <p className="text-sm text-gray-600">Upload and process your Excel data</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Upload Area */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Your Excel Files
              </CardTitle>
              <CardDescription>
                Drag and drop your Excel files here, or click to browse. Supports .xlsx, .xls, and .csv files up to
                50MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <FileSpreadsheet className="h-12 w-12 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {dragActive ? "Drop your files here" : "Upload Excel Files"}
                    </h3>
                    <p className="text-gray-600 mb-4">Drag and drop your files here, or click anywhere to browse</p>

                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <Button
                      className="bg-gradient-to-r from-blue-500 to-indigo-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        document.getElementById("file-input")?.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Supported formats: .xlsx, .xls, .csv</p>
                    <p>Maximum file size: 50MB per file</p>
                    <p>You can upload multiple files at once</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Uploaded Files ({uploadedFiles.length})
                </CardTitle>
                <CardDescription>Track the progress of your file uploads and processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
                      <div className="flex-shrink-0">{getStatusIcon(file.status)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{getStatusText(file.status)}</span>
                            <span>{file.progress}%</span>
                          </div>
                          {file.status !== "error" && <Progress value={file.progress} className="h-2" />}
                        </div>

                        {file.preview && (
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                            <span>{file.preview.rows.toLocaleString()} rows</span>
                            <span>{file.preview.columns} columns</span>
                            <span>{file.size}</span>
                          </div>
                        )}

                        {file.status === "completed" && (
                          <div className="mt-3 flex items-center gap-2">
                            <Alert className="flex-1">
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>File processed successfully! Ready for analysis.</AlertDescription>
                            </Alert>
                            <Link href="/analytics/1">
                              <Button size="sm" className="flex-shrink-0">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analyze
                              </Button>
                            </Link>
                          </div>
                        )}

                        {file.error && (
                          <Alert variant="destructive" className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{file.error}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {uploadedFiles.some((file) => file.status === "completed") && (
                  <div className="mt-6 flex items-center justify-center">
                    <Link href="/dashboard">
                      <Button className="bg-gradient-to-r from-green-500 to-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upload Tips */}
          <Card className="shadow-lg mt-8">
            <CardHeader>
              <CardTitle>Upload Tips</CardTitle>
              <CardDescription>Get the best results from your Excel file uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-700">✅ Best Practices</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Use clear column headers in the first row</li>
                    <li>• Ensure data consistency within columns</li>
                    <li>• Remove empty rows and columns</li>
                    <li>• Use standard date formats (YYYY-MM-DD)</li>
                    <li>• Keep file sizes under 50MB for faster processing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-700">❌ Common Issues</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Merged cells can cause processing errors</li>
                    <li>• Mixed data types in the same column</li>
                    <li>• Special characters in column names</li>
                    <li>• Password-protected files</li>
                    <li>• Files with complex formulas or macros</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
