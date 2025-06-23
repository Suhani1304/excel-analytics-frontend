"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import * as XLSX from "xlsx"

export default function UploadPage() {
  const [file, setFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    const userRole = localStorage.getItem("userRole")

    if (!currentUser || userRole !== "user") {
      navigate("/")
    }
  }, [navigate])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
      setAnalysisResult(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError("")
      setAnalysisResult(null)
    }
  }

  const analyzeFile = async () => {
    if (!file) return

    setIsProcessing(true)
    setError("")

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          if (jsonData.length === 0) {
            setError("The file appears to be empty.")
            setIsProcessing(false)
            return
          }

          const headers = jsonData[0]
          const dataRows = jsonData.slice(1)

          // Enhanced data analysis
          const dataTypes = {}
          const columnStats = {}
          const sampleData = dataRows.slice(0, 10) // Show more sample data

          headers.forEach((header, index) => {
            const columnData = dataRows.map((row) => row[index]).filter((val) => val !== undefined && val !== "")

            let numberCount = 0
            let textCount = 0
            let dateCount = 0
            const emptyCount = dataRows.length - columnData.length

            const numericValues = []

            columnData.forEach((value) => {
              if (!isNaN(Number(value)) && value !== "") {
                numberCount++
                numericValues.push(Number(value))
              } else if (!isNaN(Date.parse(value)) && value.toString().match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/)) {
                dateCount++
              } else {
                textCount++
              }
            })

            // Determine dominant type
            if (numberCount > textCount && numberCount > dateCount) {
              dataTypes[header] = "number"
            } else if (dateCount > textCount && dateCount > numberCount) {
              dataTypes[header] = "date"
            } else {
              dataTypes[header] = "text"
            }

            // Calculate statistics for numeric columns
            if (numericValues.length > 0) {
              const sorted = [...numericValues].sort((a, b) => a - b)
              const sum = numericValues.reduce((a, b) => a + b, 0)
              const mean = sum / numericValues.length

              columnStats[header] = {
                type: "numeric",
                count: numericValues.length,
                sum: sum,
                mean: mean,
                median: sorted[Math.floor(sorted.length / 2)],
                min: Math.min(...numericValues),
                max: Math.max(...numericValues),
                range: Math.max(...numericValues) - Math.min(...numericValues),
                emptyCount: emptyCount,
                fillRate: ((columnData.length / dataRows.length) * 100).toFixed(1),
              }
            } else {
              const uniqueValues = [...new Set(columnData)]
              columnStats[header] = {
                type: "categorical",
                count: columnData.length,
                unique: uniqueValues.length,
                emptyCount: emptyCount,
                fillRate: ((columnData.length / dataRows.length) * 100).toFixed(1),
                topValues: getTopValues(columnData, 5),
              }
            }
          })

          const result = {
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            totalRows: dataRows.length,
            totalColumns: headers.length,
            headers,
            dataTypes,
            columnStats,
            sampleData,
            uploadDate: new Date().toISOString(),
            numericColumns: Object.values(dataTypes).filter((type) => type === "number").length,
            textColumns: Object.values(dataTypes).filter((type) => type === "text").length,
            dateColumns: Object.values(dataTypes).filter((type) => type === "date").length,
            dataQuality: calculateDataQuality(columnStats),
            rawData: jsonData, // Store raw data for analytics
          }

          setAnalysisResult(result)

          // Save to localStorage for dashboard and analytics
          const uploadHistory = JSON.parse(localStorage.getItem("uploadHistory") || "[]")
          const historyEntry = {
            id: result.id,
            fileName: file.name,
            fileSize: result.fileSize,
            uploadDate: result.uploadDate,
            userName: localStorage.getItem("currentUser"),
            rows: result.totalRows,
            columns: result.totalColumns,
            status: "completed",
            dataTypes: result.dataTypes,
            dataQuality: result.dataQuality,
          }

          uploadHistory.push(historyEntry)
          localStorage.setItem("uploadHistory", JSON.stringify(uploadHistory))

          // Save detailed file data for analytics
          localStorage.setItem(
            `fileData_${result.id}`,
            JSON.stringify({
              data: jsonData,
              headers: headers,
              preview: result,
              columnStats: columnStats,
              uploadDate: result.uploadDate,
            }),
          )
        } catch (parseError) {
          setError("Failed to parse the Excel file. Please ensure it's a valid Excel file.")
        } finally {
          setIsProcessing(false)
        }
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      setError("An error occurred while processing the file.")
      setIsProcessing(false)
    }
  }

  const getTopValues = (data, limit) => {
    const frequency = {}
    data.forEach((val) => {
      frequency[val] = (frequency[val] || 0) + 1
    })

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([value, count]) => ({ value, count }))
  }

  const calculateDataQuality = (columnStats) => {
    const totalColumns = Object.keys(columnStats).length
    let qualityScore = 0

    Object.values(columnStats).forEach((stats) => {
      const fillRate = Number.parseFloat(stats.fillRate)
      qualityScore += fillRate
    })

    return Math.round(qualityScore / totalColumns)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Excel Analytics</h1>
          <p className="text-gray-600 mt-2">Upload your Excel files for comprehensive real-time analysis</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="mb-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {dragActive ? "Drop your file here" : "Click to upload or drag and drop"}
                </span>
                <span className="mt-1 block text-sm text-gray-500">Excel files (.xlsx, .xls) up to 50MB</span>
              </label>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>✨ Real-time statistical analysis</p>
              <p>📊 Interactive data visualization</p>
              <p>🔍 Automatic outlier detection</p>
              <p>📈 Correlation analysis</p>
            </div>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
                <button
                  onClick={analyzeFile}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    "Analyze File"
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {analysisResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Real-Time Analysis Results</h2>
              <Link
                to={`/analytics/${analysisResult.id}`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
              >
                View Interactive Analytics
              </Link>
            </div>

            {/* Enhanced Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{analysisResult.totalRows.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Rows</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analysisResult.totalColumns}</p>
                <p className="text-sm text-gray-600">Columns</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{analysisResult.numericColumns}</p>
                <p className="text-sm text-gray-600">Numeric</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{analysisResult.dataQuality}%</p>
                <p className="text-sm text-gray-600">Data Quality</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{analysisResult.fileSize}</p>
                <p className="text-sm text-gray-600">File Size</p>
              </div>
            </div>

            {/* Enhanced Column Analysis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Advanced Column Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                {Object.entries(analysisResult.columnStats).map(([column, stats]) => (
                  <div key={column} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{column}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          analysisResult.dataTypes[column] === "number"
                            ? "bg-blue-100 text-blue-800"
                            : analysisResult.dataTypes[column] === "date"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {analysisResult.dataTypes[column]}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Fill Rate:</span>
                        <span className="font-medium">{stats.fillRate}%</span>
                      </div>
                      {stats.type === "numeric" ? (
                        <>
                          <div className="flex justify-between">
                            <span>Mean:</span>
                            <span className="font-medium">{stats.mean.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Range:</span>
                            <span className="font-medium">
                              {stats.min} - {stats.max}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Unique Values:</span>
                            <span className="font-medium">{stats.unique}</span>
                          </div>
                          {stats.topValues && stats.topValues.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Top Value:</span>
                              <span className="ml-1 font-medium">{stats.topValues[0].value}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Sample Data */}
            {analysisResult.sampleData.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Sample Data Preview (First 10 Rows)</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        {analysisResult.headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-l"
                          >
                            <div className="flex items-center space-x-1">
                              <span className="truncate">{header}</span>
                              <span
                                className={`px-1 py-0.5 rounded text-xs ${
                                  analysisResult.dataTypes[header] === "number"
                                    ? "bg-blue-100 text-blue-600"
                                    : analysisResult.dataTypes[header] === "date"
                                      ? "bg-green-100 text-green-600"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {analysisResult.dataTypes[header].charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResult.sampleData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-500 font-medium">{rowIndex + 1}</td>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-l">
                              {cell !== undefined && cell !== "" ? (
                                String(cell)
                              ) : (
                                <span className="text-gray-400 italic">empty</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Analysis completed at {new Date(analysisResult.uploadDate).toLocaleString()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  View in Dashboard
                </button>
                <Link
                  to={`/analytics/${analysisResult.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Advanced Analytics
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
