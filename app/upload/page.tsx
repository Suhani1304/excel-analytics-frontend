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
import * as XLSX from "xlsx"

interface UploadedFile {
  id: string
  name: string
  size: string
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
  data?: any[][]
  headers?: string[]
  preview?: {
    rows: number
    columns: number
    dataTypes: Record<string, string>
    sampleData: any[]
    summary: {
      totalCells: number
      filledCells: number
      emptyPercentage: number
      numericColumns: number
      textColumns: number
      dateColumns: number
    }
  }
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")

    if (!token || role !== "user") {
      router.push("/auth/login")
      return
    }

    setIsAuthenticated(true)
    setUserName(name || "User")
  }, [router])

  const validateFile = (file: File): string | null => {
    const validTypes = [".xlsx", ".xls", ".csv"]
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))

    if (!validTypes.includes(fileExtension)) {
      return `Invalid file type. Please upload Excel (.xlsx, .xls) or CSV files only.`
    }

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return `File too large. Maximum size is 50MB.`
    }

    return null
  }

  const detectDataType = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "empty"
    }

    const strValue = String(value).trim()

    // Check if it's a number
    if (!isNaN(Number(strValue)) && strValue !== "" && !isNaN(Number.parseFloat(strValue))) {
      return "number"
    }

    // Check if it's a date
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{2}-\d{2}-\d{4}$/,
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    ]

    if (datePatterns.some((pattern) => pattern.test(strValue)) || !isNaN(Date.parse(strValue))) {
      return "date"
    }

    // Check if it's a boolean
    if (strValue.toLowerCase() === "true" || strValue.toLowerCase() === "false") {
      return "boolean"
    }

    // Otherwise it's text
    return "text"
  }

  const analyzeDataTypes = (data: any[][], headers: string[]) => {
    const dataTypes: Record<string, string> = {}
    const columnStats: Record<string, { number: number; text: number; date: number; empty: number; boolean: number }> =
      {}

    // Initialize stats for each column
    headers.forEach((header) => {
      columnStats[header] = { number: 0, text: 0, date: 0, empty: 0, boolean: 0 }
    })

    // Analyze each row (skip header row)
    data.slice(1).forEach((row) => {
      headers.forEach((header, colIndex) => {
        const value = row[colIndex]
        const type = detectDataType(value)
        columnStats[header][type]++
      })
    })

    // Determine dominant type for each column
    headers.forEach((header) => {
      const stats = columnStats[header]
      const total = Object.values(stats).reduce((sum, count) => sum + count, 0)

      if (total === 0) {
        dataTypes[header] = "empty"
        return
      }

      // Find the most common type (excluding empty)
      const nonEmptyStats = { ...stats }
      delete nonEmptyStats.empty

      const dominantType = Object.entries(nonEmptyStats).reduce((a, b) =>
        nonEmptyStats[a[0]] > nonEmptyStats[b[0]] ? a : b,
      )[0]

      dataTypes[header] = dominantType
    })

    return dataTypes
  }

  const generateSummary = (data: any[][], headers: string[], dataTypes: Record<string, string>) => {
    const totalCells = (data.length - 1) * headers.length // Exclude header row
    let filledCells = 0

    // Count filled cells
    data.slice(1).forEach((row) => {
      headers.forEach((_, colIndex) => {
        const value = row[colIndex]
        if (value !== null && value !== undefined && value !== "") {
          filledCells++
        }
      })
    })

    const emptyPercentage = Math.round(((totalCells - filledCells) / totalCells) * 100)

    const numericColumns = Object.values(dataTypes).filter((type) => type === "number").length
    const textColumns = Object.values(dataTypes).filter((type) => type === "text").length
    const dateColumns = Object.values(dataTypes).filter((type) => type === "date").length

    return {
      totalCells,
      filledCells,
      emptyPercentage,
      numericColumns,
      textColumns,
      dateColumns,
    }
  }

  const processExcelFile = async (file: File): Promise<{ data: any[][]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const workbookData = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(workbookData, { type: "array" })

          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" })

          if (jsonData.length === 0) {
            reject(new Error("File appears to be empty"))
            return
          }

          const headers = jsonData[0] as string[]
          const extractedData = jsonData as any[][]

          resolve({ data: extractedData, headers })
        } catch (error) {
          reject(new Error("Failed to parse Excel file. Please ensure it's a valid Excel file."))
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsArrayBuffer(file)
    })
  }

  const processCSVFile = async (file: File): Promise<{ data: any[][]; headers: string[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const lines = text.split("\n").filter((line) => line.trim())

          if (lines.length === 0) {
            reject(new Error("CSV file appears to be empty"))
            return
          }

          const data = lines.map((line) => {
            // Simple CSV parsing (handles basic cases)
            const values = []
            let current = ""
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
              const char = line[i]
              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === "," && !inQuotes) {
                values.push(current.trim())
                current = ""
              } else {
                current += char
              }
            }
            values.push(current.trim())
            return values
          })

          const headers = data[0] as string[]
          resolve({ data, headers })
        } catch (error) {
          reject(new Error("Failed to parse CSV file. Please ensure it's properly formatted."))
        }
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }

  const saveFileToHistory = (fileData: UploadedFile) => {
    const uploadHistory = JSON.parse(localStorage.getItem("uploadHistory") || "[]")
    const historyEntry = {
      id: fileData.id,
      fileName: fileData.name,
      fileSize: fileData.size,
      uploadDate: new Date().toISOString(),
      userName: userName,
      userEmail: localStorage.getItem("userEmail") || "user@example.com",
      rows: fileData.preview?.rows || 0,
      columns: fileData.preview?.columns || 0,
      status: fileData.status,
      dataTypes: fileData.preview?.dataTypes || {},
      summary: fileData.preview?.summary || {},
    }

    uploadHistory.push(historyEntry)
    localStorage.setItem("uploadHistory", JSON.stringify(uploadHistory))

    // Save the actual file data for analytics
    localStorage.setItem(
      `fileData_${fileData.id}`,
      JSON.stringify({
        data: fileData.data,
        headers: fileData.headers,
        preview: fileData.preview,
      }),
    )
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
        await new Promise((resolve) => setTimeout(resolve, 200))
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
      }

      // Switch to processing
      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processing", progress: 0 } : f)))

      // Process the actual file
      let fileData: { data: any[][]; headers: string[] }

      if (file.name.toLowerCase().endsWith(".csv")) {
        fileData = await processCSVFile(file)
      } else {
        fileData = await processExcelFile(file)
      }

      // Analyze the data with progress updates
      for (let i = 0; i <= 100; i += 25) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, progress: i } : f)))
      }

      // Perform detailed analysis
      const dataTypes = analyzeDataTypes(fileData.data, fileData.headers)
      const sampleData = fileData.data.slice(1, 6) // First 5 rows of data (excluding header)
      const summary = generateSummary(fileData.data, fileData.headers, dataTypes)

      const preview = {
        rows: fileData.data.length - 1, // Exclude header row
        columns: fileData.headers.length,
        dataTypes,
        sampleData,
        summary,
      }

      const completedFile: UploadedFile = {
        ...newFile,
        status: "completed",
        progress: 100,
        data: fileData.data,
        headers: fileData.headers,
        preview,
      }

      setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? completedFile : f)))

      // Save to history and local storage
      saveFileToHistory(completedFile)
    } catch (error) {
      console.error("File processing error:", error)
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Processing failed. Please try again.",
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
        return "Uploading file..."
      case "processing":
        return "Analyzing Excel data..."
      case "completed":
        return "Analysis complete - Ready for insights"
      case "error":
        return "Analysis failed"
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
                <h1 className="text-xl font-bold text-gray-900">Excel File Analysis</h1>
                <p className="text-sm text-gray-600">Upload and analyze your Excel files with real-time insights</p>
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
                Upload Excel (.xlsx, .xls) or CSV files for comprehensive data analysis and insights generation.
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
                      {dragActive ? "Drop your files here" : "Smart Excel Analysis"}
                    </h3>
                    <p className="text-gray-600 mb-4">Upload files for intelligent data processing and insights</p>

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
                    <p>✨ Real-time data type detection</p>
                    <p>📊 Automatic data quality analysis</p>
                    <p>🔍 Smart column categorization</p>
                    <p>📈 Instant preview generation</p>
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
                  File Analysis Results ({uploadedFiles.length})
                </CardTitle>
                <CardDescription>Real-time analysis of your uploaded Excel files</CardDescription>
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
                          <div className="mt-3 space-y-3">
                            {/* Basic Stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="font-medium">{file.preview.rows.toLocaleString()} rows</span>
                              <span className="font-medium">{file.preview.columns} columns</span>
                              <span>{file.size}</span>
                              <span className="text-green-600 font-medium">
                                {100 - file.preview.summary.emptyPercentage}% data quality
                              </span>
                            </div>

                            {/* Data Types */}
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(file.preview.dataTypes)
                                .slice(0, 6)
                                .map(([column, type]) => (
                                  <div key={column} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    <span className="font-medium">{column}:</span>
                                    <span
                                      className={`ml-1 ${
                                        type === "number"
                                          ? "text-blue-600"
                                          : type === "date"
                                            ? "text-green-600"
                                            : type === "boolean"
                                              ? "text-purple-600"
                                              : "text-gray-600"
                                      }`}
                                    >
                                      {type}
                                    </span>
                                  </div>
                                ))}
                              {Object.keys(file.preview.dataTypes).length > 6 && (
                                <div className="text-xs text-gray-500 px-2 py-1">
                                  +{Object.keys(file.preview.dataTypes).length - 6} more columns
                                </div>
                              )}
                            </div>

                            {/* Analysis Summary */}
                            <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Numeric Columns</p>
                                <p className="font-bold text-blue-600">{file.preview.summary.numericColumns}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Text Columns</p>
                                <p className="font-bold text-gray-600">{file.preview.summary.textColumns}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Date Columns</p>
                                <p className="font-bold text-green-600">{file.preview.summary.dateColumns}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {file.status === "completed" && (
                          <div className="mt-3 flex items-center gap-2">
                            <Alert className="flex-1">
                              <CheckCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Analysis Complete!</strong> {file.preview?.rows.toLocaleString()} rows analyzed
                                with {file.preview?.summary.numericColumns} numeric columns detected.
                              </AlertDescription>
                            </Alert>
                            <Link href={`/analytics/${file.id}`}>
                              <Button size="sm" className="flex-shrink-0">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Analytics
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
                        View All Files in Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
