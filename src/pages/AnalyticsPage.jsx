"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from "chart.js"
import { Bar, Line, Pie } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement)

export default function AnalyticsPage() {
  const { fileId } = useParams()
  const navigate = useNavigate()
  const [fileData, setFileData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [selectedChart, setSelectedChart] = useState("overview")
  const [selectedColumns, setSelectedColumns] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFileData()
  }, [fileId])

  const loadFileData = () => {
    try {
      const storedData = localStorage.getItem(`fileData_${fileId}`)
      if (!storedData) {
        navigate("/dashboard")
        return
      }

      const data = JSON.parse(storedData)
      setFileData(data)
      generateAnalytics(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading file data:", error)
      navigate("/dashboard")
    }
  }

  const generateAnalytics = (data) => {
    const { data: rawData, headers } = data
    const dataRows = rawData.slice(1) // Remove header row

    // Generate comprehensive analytics
    const analytics = {
      summary: generateSummaryStats(dataRows, headers),
      columnAnalysis: generateColumnAnalysis(dataRows, headers),
      correlations: generateCorrelations(dataRows, headers),
      trends: generateTrends(dataRows, headers),
      distributions: generateDistributions(dataRows, headers),
      outliers: detectOutliers(dataRows, headers),
    }

    setAnalytics(analytics)
    setSelectedColumns(headers.slice(0, 2)) // Default to first two columns
  }

  const generateSummaryStats = (dataRows, headers) => {
    const stats = {}

    headers.forEach((header, colIndex) => {
      const columnData = dataRows.map((row) => row[colIndex]).filter((val) => val !== undefined && val !== "")
      const numericData = columnData.filter((val) => !isNaN(Number(val))).map((val) => Number(val))

      if (numericData.length > 0) {
        const sorted = numericData.sort((a, b) => a - b)
        stats[header] = {
          count: numericData.length,
          sum: numericData.reduce((a, b) => a + b, 0),
          mean: numericData.reduce((a, b) => a + b, 0) / numericData.length,
          median: sorted[Math.floor(sorted.length / 2)],
          min: Math.min(...numericData),
          max: Math.max(...numericData),
          std: calculateStandardDeviation(numericData),
          type: "numeric",
        }
      } else {
        const uniqueValues = [...new Set(columnData)]
        stats[header] = {
          count: columnData.length,
          unique: uniqueValues.length,
          mostCommon: getMostCommon(columnData),
          type: "categorical",
        }
      }
    })

    return stats
  }

  const generateColumnAnalysis = (dataRows, headers) => {
    const analysis = {}

    headers.forEach((header, colIndex) => {
      const columnData = dataRows.map((row) => row[colIndex]).filter((val) => val !== undefined && val !== "")
      const numericData = columnData.filter((val) => !isNaN(Number(val))).map((val) => Number(val))

      if (numericData.length > 0) {
        // Create histogram data
        const bins = createHistogramBins(numericData, 10)
        analysis[header] = {
          type: "numeric",
          histogram: bins,
          boxplot: calculateBoxPlotData(numericData),
        }
      } else {
        // Create frequency distribution
        const frequency = {}
        columnData.forEach((val) => {
          frequency[val] = (frequency[val] || 0) + 1
        })

        analysis[header] = {
          type: "categorical",
          frequency: frequency,
        }
      }
    })

    return analysis
  }

  const generateCorrelations = (dataRows, headers) => {
    const numericColumns = []
    const numericData = {}

    headers.forEach((header, colIndex) => {
      const columnData = dataRows
        .map((row) => row[colIndex])
        .filter((val) => val !== undefined && val !== "" && !isNaN(Number(val)))
        .map((val) => Number(val))
      if (columnData.length > dataRows.length * 0.5) {
        // At least 50% numeric
        numericColumns.push(header)
        numericData[header] = columnData
      }
    })

    const correlationMatrix = {}
    numericColumns.forEach((col1) => {
      correlationMatrix[col1] = {}
      numericColumns.forEach((col2) => {
        correlationMatrix[col1][col2] = calculateCorrelation(numericData[col1], numericData[col2])
      })
    })

    return { matrix: correlationMatrix, columns: numericColumns }
  }

  const generateTrends = (dataRows, headers) => {
    const trends = {}

    headers.forEach((header, colIndex) => {
      const columnData = dataRows
        .map((row, index) => ({
          index,
          value: row[colIndex],
        }))
        .filter((item) => item.value !== undefined && item.value !== "" && !isNaN(Number(item.value)))

      if (columnData.length > 5) {
        const values = columnData.map((item) => Number(item.value))
        const trend = calculateTrend(values)
        trends[header] = {
          data: columnData.map((item) => ({ x: item.index, y: Number(item.value) })),
          trend: trend,
          direction: trend > 0 ? "increasing" : trend < 0 ? "decreasing" : "stable",
        }
      }
    })

    return trends
  }

  const generateDistributions = (dataRows, headers) => {
    const distributions = {}

    headers.forEach((header, colIndex) => {
      const columnData = dataRows.map((row) => row[colIndex]).filter((val) => val !== undefined && val !== "")
      const numericData = columnData.filter((val) => !isNaN(Number(val))).map((val) => Number(val))

      if (numericData.length > 0) {
        distributions[header] = {
          type: "numeric",
          mean: numericData.reduce((a, b) => a + b, 0) / numericData.length,
          std: calculateStandardDeviation(numericData),
          skewness: calculateSkewness(numericData),
          kurtosis: calculateKurtosis(numericData),
        }
      }
    })

    return distributions
  }

  const detectOutliers = (dataRows, headers) => {
    const outliers = {}

    headers.forEach((header, colIndex) => {
      const columnData = dataRows
        .map((row) => row[colIndex])
        .filter((val) => val !== undefined && val !== "" && !isNaN(Number(val)))
        .map((val) => Number(val))

      if (columnData.length > 4) {
        const q1 = calculatePercentile(columnData, 25)
        const q3 = calculatePercentile(columnData, 75)
        const iqr = q3 - q1
        const lowerBound = q1 - 1.5 * iqr
        const upperBound = q3 + 1.5 * iqr

        const outlierValues = columnData.filter((val) => val < lowerBound || val > upperBound)
        outliers[header] = {
          count: outlierValues.length,
          values: outlierValues,
          percentage: (outlierValues.length / columnData.length) * 100,
        }
      }
    })

    return outliers
  }

  // Helper functions
  const calculateStandardDeviation = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length)
  }

  const calculateCorrelation = (x, y) => {
    const n = Math.min(x.length, y.length)
    if (n < 2) return 0

    const xSlice = x.slice(0, n)
    const ySlice = y.slice(0, n)

    const meanX = xSlice.reduce((a, b) => a + b, 0) / n
    const meanY = ySlice.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let sumXSquared = 0
    let sumYSquared = 0

    for (let i = 0; i < n; i++) {
      const xDiff = xSlice[i] - meanX
      const yDiff = ySlice[i] - meanY
      numerator += xDiff * yDiff
      sumXSquared += xDiff * xDiff
      sumYSquared += yDiff * yDiff
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared)
    return denominator === 0 ? 0 : numerator / denominator
  }

  const calculateTrend = (values) => {
    const n = values.length
    const x = Array.from({ length: n }, (_, i) => i)
    const meanX = x.reduce((a, b) => a + b, 0) / n
    const meanY = values.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (values[i] - meanY)
      denominator += (x[i] - meanX) ** 2
    }

    return denominator === 0 ? 0 : numerator / denominator
  }

  const calculatePercentile = (values, percentile) => {
    const sorted = [...values].sort((a, b) => a - b)
    const index = (percentile / 100) * (sorted.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    const weight = index % 1

    return sorted[lower] * (1 - weight) + sorted[upper] * weight
  }

  const calculateSkewness = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = calculateStandardDeviation(values)
    const n = values.length

    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n
    return skewness
  }

  const calculateKurtosis = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const std = calculateStandardDeviation(values)
    const n = values.length

    const kurtosis = values.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n - 3
    return kurtosis
  }

  const createHistogramBins = (data, binCount) => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const binWidth = (max - min) / binCount
    const bins = Array(binCount).fill(0)
    const labels = []

    for (let i = 0; i < binCount; i++) {
      labels.push(`${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`)
    }

    data.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1)
      bins[binIndex]++
    })

    return { bins, labels }
  }

  const calculateBoxPlotData = (data) => {
    const sorted = [...data].sort((a, b) => a - b)
    return {
      min: sorted[0],
      q1: calculatePercentile(data, 25),
      median: calculatePercentile(data, 50),
      q3: calculatePercentile(data, 75),
      max: sorted[sorted.length - 1],
    }
  }

  const getMostCommon = (data) => {
    const frequency = {}
    data.forEach((val) => {
      frequency[val] = (frequency[val] || 0) + 1
    })

    return Object.entries(frequency).reduce((a, b) => (frequency[a[0]] > frequency[b[0]] ? a : b))[0]
  }

  const generateChartData = (chartType) => {
    if (!analytics || !fileData) return null

    switch (chartType) {
      case "overview":
        return generateOverviewChart()
      case "correlation":
        return generateCorrelationChart()
      case "distribution":
        return generateDistributionChart()
      case "trends":
        return generateTrendsChart()
      case "comparison":
        return generateComparisonChart()
      default:
        return null
    }
  }

  const generateOverviewChart = () => {
    const numericColumns = Object.entries(analytics.summary)
      .filter(([_, stats]) => stats.type === "numeric")
      .slice(0, 6)

    return {
      labels: numericColumns.map(([col, _]) => col),
      datasets: [
        {
          label: "Mean Values",
          data: numericColumns.map(([_, stats]) => stats.mean.toFixed(2)),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
        {
          label: "Standard Deviation",
          data: numericColumns.map(([_, stats]) => stats.std.toFixed(2)),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  const generateCorrelationChart = () => {
    if (!analytics.correlations.columns.length) return null

    const strongCorrelations = []
    const labels = []
    const data = []

    analytics.correlations.columns.forEach((col1, i) => {
      analytics.correlations.columns.forEach((col2, j) => {
        if (i < j) {
          const correlation = analytics.correlations.matrix[col1][col2]
          if (Math.abs(correlation) > 0.3) {
            strongCorrelations.push({ col1, col2, correlation })
            labels.push(`${col1} vs ${col2}`)
            data.push(correlation)
          }
        }
      })
    })

    return {
      labels,
      datasets: [
        {
          label: "Correlation Coefficient",
          data,
          backgroundColor: data.map((val) => (val > 0 ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)")),
          borderColor: data.map((val) => (val > 0 ? "rgba(75, 192, 192, 1)" : "rgba(255, 99, 132, 1)")),
          borderWidth: 1,
        },
      ],
    }
  }

  const generateDistributionChart = () => {
    if (selectedColumns.length === 0) return null

    const column = selectedColumns[0]
    const columnAnalysis = analytics.columnAnalysis[column]

    if (!columnAnalysis) return null

    if (columnAnalysis.type === "numeric") {
      return {
        labels: columnAnalysis.histogram.labels,
        datasets: [
          {
            label: `Distribution of ${column}`,
            data: columnAnalysis.histogram.bins,
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      }
    } else {
      const entries = Object.entries(columnAnalysis.frequency).slice(0, 10)
      return {
        labels: entries.map(([key, _]) => key),
        datasets: [
          {
            label: `Frequency of ${column}`,
            data: entries.map(([_, count]) => count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 205, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
              "rgba(199, 199, 199, 0.6)",
              "rgba(83, 102, 255, 0.6)",
              "rgba(255, 99, 255, 0.6)",
              "rgba(99, 255, 132, 0.6)",
            ],
          },
        ],
      }
    }
  }

  const generateTrendsChart = () => {
    if (selectedColumns.length === 0) return null

    const datasets = selectedColumns
      .slice(0, 3)
      .map((column, index) => {
        const trend = analytics.trends[column]
        if (!trend) return null

        const colors = ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 205, 86, 1)"]

        return {
          label: column,
          data: trend.data,
          borderColor: colors[index],
          backgroundColor: colors[index].replace("1)", "0.1)"),
          fill: false,
          tension: 0.1,
        }
      })
      .filter(Boolean)

    return { datasets }
  }

  const generateComparisonChart = () => {
    if (selectedColumns.length < 2) return null

    const col1 = selectedColumns[0]
    const col2 = selectedColumns[1]

    const stats1 = analytics.summary[col1]
    const stats2 = analytics.summary[col2]

    if (!stats1 || !stats2 || stats1.type !== "numeric" || stats2.type !== "numeric") return null

    return {
      labels: ["Mean", "Median", "Min", "Max", "Std Dev"],
      datasets: [
        {
          label: col1,
          data: [stats1.mean, stats1.median, stats1.min, stats1.max, stats1.std],
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: col2,
          data: [stats2.mean, stats2.median, stats2.min, stats2.max, stats2.std],
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!fileData || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">File not found</h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const chartData = generateChartData(selectedChart)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-Time Excel Analytics</h1>
              <p className="text-gray-600 mt-1">Interactive analysis of {fileData.preview?.fileName || "your file"}</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{(fileData.data.length - 1).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Columns</p>
                <p className="text-2xl font-bold text-gray-900">{fileData.headers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Numeric Columns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(analytics.summary).filter((stat) => stat.type === "numeric").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Outliers Detected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(analytics.outliers).reduce((sum, outlier) => sum + outlier.count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <select
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="overview">Overview</option>
                <option value="correlation">Correlations</option>
                <option value="distribution">Distribution</option>
                <option value="trends">Trends</option>
                <option value="comparison">Comparison</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Columns</label>
              <select
                multiple
                value={selectedColumns}
                onChange={(e) => setSelectedColumns(Array.from(e.target.selectedOptions, (option) => option.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white min-w-48"
                size="3"
              >
                {fileData.headers.map((header, index) => (
                  <option key={index} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize">{selectedChart} Analysis</h2>
          <div className="h-96">
            {chartData && (
              <>
                {selectedChart === "distribution" &&
                analytics.columnAnalysis[selectedColumns[0]]?.type === "categorical" ? (
                  <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                ) : selectedChart === "trends" ? (
                  <Line
                    data={chartData}
                    options={{ responsive: true, maintainAspectRatio: false, scales: { x: { type: "linear" } } }}
                  />
                ) : (
                  <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Column Statistics</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(analytics.summary).map(([column, stats]) => (
                <div key={column} className="border-b pb-3">
                  <h4 className="font-medium text-gray-900">{column}</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    {stats.type === "numeric" ? (
                      <>
                        <div>
                          Count: <span className="font-medium">{stats.count}</span>
                        </div>
                        <div>
                          Mean: <span className="font-medium">{stats.mean.toFixed(2)}</span>
                        </div>
                        <div>
                          Median: <span className="font-medium">{stats.median.toFixed(2)}</span>
                        </div>
                        <div>
                          Std Dev: <span className="font-medium">{stats.std.toFixed(2)}</span>
                        </div>
                        <div>
                          Min: <span className="font-medium">{stats.min}</span>
                        </div>
                        <div>
                          Max: <span className="font-medium">{stats.max}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          Count: <span className="font-medium">{stats.count}</span>
                        </div>
                        <div>
                          Unique: <span className="font-medium">{stats.unique}</span>
                        </div>
                        <div className="col-span-2">
                          Most Common: <span className="font-medium">{stats.mostCommon}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correlation Matrix */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Correlation Matrix</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2"></th>
                    {analytics.correlations.columns.slice(0, 5).map((col) => (
                      <th key={col} className="text-left p-2 font-medium">
                        {col.substring(0, 8)}...
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.correlations.columns.slice(0, 5).map((row) => (
                    <tr key={row}>
                      <td className="p-2 font-medium">{row.substring(0, 8)}...</td>
                      {analytics.correlations.columns.slice(0, 5).map((col) => {
                        const correlation = analytics.correlations.matrix[row][col]
                        return (
                          <td key={col} className="p-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                Math.abs(correlation) > 0.7
                                  ? "bg-red-100 text-red-800"
                                  : Math.abs(correlation) > 0.3
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {correlation.toFixed(2)}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Outliers and Insights */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Data Quality Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.outliers).map(([column, outlierData]) => (
              <div key={column} className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{column}</h4>
                <div className="text-sm text-gray-600">
                  <p>
                    Outliers: <span className="font-medium text-red-600">{outlierData.count}</span>
                  </p>
                  <p>
                    Percentage: <span className="font-medium">{outlierData.percentage.toFixed(1)}%</span>
                  </p>
                  {outlierData.values.length > 0 && (
                    <p className="mt-1">
                      Sample: <span className="font-medium">{outlierData.values.slice(0, 3).join(", ")}</span>
                      {outlierData.values.length > 3 && "..."}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
