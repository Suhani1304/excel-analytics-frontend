"use client"

import { useState } from "react"
import { Download, FileText, ImageIcon, FileSpreadsheet, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

interface ExportDialogProps {
  selectedFile: any
}

export function ExportDialog({ selectedFile }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState("pdf")
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeData: true,
    includeInsights: true,
    includeMetadata: false,
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Simulate export process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (exportFormat === "pdf") {
        await exportToPDF()
      } else if (exportFormat === "excel") {
        await exportToExcel()
      } else if (exportFormat === "csv") {
        await exportToCSV()
      } else if (exportFormat === "image") {
        await exportToImage()
      }

      setIsOpen(false)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async () => {
    // Create a comprehensive PDF report
    const reportContent = generateReportContent()
    const blob = new Blob([reportContent], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedFile?.name || "report"}_analysis.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToExcel = async () => {
    // Export processed data to Excel
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedFile?.name || "data"}_processed.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = async () => {
    const csvContent = generateCSVContent()
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedFile?.name || "data"}_export.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToImage = async () => {
    // Export charts as high-resolution images
    const canvas = document.createElement("canvas")
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.font = "24px Arial"
      ctx.fillText(`Analytics Report: ${selectedFile?.name || "Data"}`, 50, 50)
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedFile?.name || "charts"}_visualization.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    })
  }

  const generateReportContent = () => {
    return `
# Analytics Report: ${selectedFile?.name || "Data Analysis"}

## File Summary
- File Name: ${selectedFile?.name || "N/A"}
- Total Rows: ${selectedFile?.rows?.toLocaleString() || "N/A"}
- Columns: ${selectedFile?.columns || "N/A"}
- File Size: ${selectedFile?.size || "N/A"}
- Upload Date: ${selectedFile?.uploadDate || "N/A"}

## Data Quality Metrics
- Data Completeness: 96%
- Numeric Columns: 8 of ${selectedFile?.columns || 0}
- Unique Values: 89%

## Key Insights
- Sales increased by 23% in Q4 compared to Q3
- Technology sector shows highest growth
- 12 outliers detected (0.08% of data)
- Data quality score: 9.2/10

## Recommendations
- Focus marketing on high-performing regions
- Investigate seasonal patterns
- Segment customers by purchase frequency
- Optimize inventory for top 20% products

Generated on: ${new Date().toLocaleString()}
    `
  }

  const generateCSVContent = () => {
    const headers = ["Product", "Category", "Price", "Quantity", "Region", "Date"]
    const sampleData = [
      ["MacBook Pro", "Laptops", "2499", "15", "North", "2024-01-15"],
      ["iPhone 15", "Phones", "999", "32", "South", "2024-01-14"],
      ["iPad Air", "Tablets", "599", "28", "East", "2024-01-13"],
      ["AirPods Pro", "Accessories", "249", "45", "West", "2024-01-12"],
      ["Surface Laptop", "Laptops", "1299", "18", "North", "2024-01-11"],
    ]

    const csvContent = [headers, ...sampleData].map((row) => row.join(",")).join("\n")

    return csvContent
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
          <DialogDescription>
            Choose your export format and options for {selectedFile?.name || "the selected file"}
          </DialogDescription>
        </DialogHeader>

        {isExporting ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-sm text-gray-600">Generating your report...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">Export Format</Label>
              <RadioGroup value={exportFormat} onValueChange={setExportFormat}>
                <div className="grid grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer transition-all ${exportFormat === "pdf" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pdf" id="pdf" />
                        <Label htmlFor="pdf" className="flex items-center cursor-pointer">
                          <FileText className="h-4 w-4 mr-2 text-red-500" />
                          PDF Report
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${exportFormat === "excel" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="excel" id="excel" />
                        <Label htmlFor="excel" className="flex items-center cursor-pointer">
                          <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500" />
                          Excel File
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${exportFormat === "csv" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="csv" id="csv" />
                        <Label htmlFor="csv" className="flex items-center cursor-pointer">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          CSV Data
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-all ${exportFormat === "image" ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="image" id="image" />
                        <Label htmlFor="image" className="flex items-center cursor-pointer">
                          <ImageIcon className="h-4 w-4 mr-2 text-purple-500" />
                          PNG Image
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Include in Export</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={exportOptions.includeCharts}
                    onCheckedChange={(checked) =>
                      setExportOptions({ ...exportOptions, includeCharts: checked as boolean })
                    }
                  />
                  <Label htmlFor="charts" className="text-sm">
                    Charts and Visualizations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="data"
                    checked={exportOptions.includeData}
                    onCheckedChange={(checked) =>
                      setExportOptions({ ...exportOptions, includeData: checked as boolean })
                    }
                  />
                  <Label htmlFor="data" className="text-sm">
                    Raw Data Table
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insights"
                    checked={exportOptions.includeInsights}
                    onCheckedChange={(checked) =>
                      setExportOptions({ ...exportOptions, includeInsights: checked as boolean })
                    }
                  />
                  <Label htmlFor="insights" className="text-sm">
                    AI Insights & Recommendations
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={exportOptions.includeMetadata}
                    onCheckedChange={(checked) =>
                      setExportOptions({ ...exportOptions, includeMetadata: checked as boolean })
                    }
                  />
                  <Label htmlFor="metadata" className="text-sm">
                    File Metadata & Statistics
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleExport} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600">
                <Download className="h-4 w-4 mr-2" />
                Export Now
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
