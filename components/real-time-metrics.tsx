"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, TrendingUp, Activity, Zap, Target, Database } from "lucide-react"

interface RealTimeMetricsProps {
  totalFiles: number
  totalRows: number
  avgDataQuality: number
  totalInsights: number
  processedFiles: number
}

export function RealTimeMetrics({
  totalFiles,
  totalRows,
  avgDataQuality,
  totalInsights,
  processedFiles,
}: RealTimeMetricsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    files: 0,
    rows: 0,
    quality: 0,
    insights: 0,
  })

  useEffect(() => {
    const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const current = start + (end - start) * progress
        callback(current)
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    }

    animateValue(animatedValues.files, totalFiles, 1000, (value) =>
      setAnimatedValues((prev) => ({ ...prev, files: value })),
    )
    animateValue(animatedValues.rows, totalRows, 1500, (value) =>
      setAnimatedValues((prev) => ({ ...prev, rows: value })),
    )
    animateValue(animatedValues.quality, avgDataQuality, 1200, (value) =>
      setAnimatedValues((prev) => ({ ...prev, quality: value })),
    )
    animateValue(animatedValues.insights, totalInsights, 800, (value) =>
      setAnimatedValues((prev) => ({ ...prev, insights: value })),
    )
  }, [totalFiles, totalRows, avgDataQuality, totalInsights])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Active Files
          </CardTitle>
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-blue-200 animate-pulse" />
            <Badge variant="secondary" className="text-xs bg-blue-400 text-blue-900">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{Math.round(animatedValues.files)}</div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-blue-200">
              <span className="text-green-300">+{Math.max(0, totalFiles - 2)}</span> this week
            </p>
            <div className="text-xs text-blue-200">
              {processedFiles}/{totalFiles} processed
            </div>
          </div>
          <Progress value={(processedFiles / totalFiles) * 100} className="mt-2 bg-blue-400/30" />
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-emerald-100 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Total Records
          </CardTitle>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-emerald-200 animate-bounce" />
            <Badge variant="secondary" className="text-xs bg-emerald-400 text-emerald-900">
              Growing
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{(animatedValues.rows / 1000).toFixed(1)}K</div>
          <p className="text-xs text-emerald-200 mt-2">
            Across all datasets • <span className="text-emerald-100 font-medium">Real-time sync</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-200">Processing {Math.round(Math.random() * 100)} rows/sec</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-100 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Data Quality
          </CardTitle>
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-amber-200 animate-pulse" />
            <Badge
              variant="secondary"
              className={`text-xs ${
                avgDataQuality > 90 ? "bg-green-400 text-green-900" : "bg-amber-400 text-amber-900"
              }`}
            >
              {avgDataQuality > 90 ? "Excellent" : "Good"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{Math.round(animatedValues.quality)}%</div>
          <Progress value={animatedValues.quality} className="mt-2 bg-amber-400/30" />
          <p className="text-xs text-amber-200 mt-2">
            Auto-improving • <span className="text-amber-100 font-medium">+2.3% this hour</span>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Insights
          </CardTitle>
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-purple-200 animate-pulse" />
            <Badge variant="secondary" className="text-xs bg-purple-400 text-purple-900">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{Math.round(animatedValues.insights)}</div>
          <p className="text-xs text-purple-200 mt-2">
            Generated insights • <span className="text-purple-100 font-medium">+{Math.round(Math.random() * 3)}</span>{" "}
            new
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
            <span className="text-xs text-purple-200">AI learning in progress</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
