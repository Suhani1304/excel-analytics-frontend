"use client"

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data for different chart types
const salesData = [
  { month: "Jan", sales: 45000, profit: 12000, expenses: 33000 },
  { month: "Feb", sales: 52000, profit: 15000, expenses: 37000 },
  { month: "Mar", sales: 48000, profit: 13500, expenses: 34500 },
  { month: "Apr", sales: 61000, profit: 18000, expenses: 43000 },
  { month: "May", sales: 55000, profit: 16500, expenses: 38500 },
  { month: "Jun", sales: 67000, profit: 20000, expenses: 47000 },
]

const regionData = [
  { region: "North", value: 35, color: "#0088FE" },
  { region: "South", value: 28, color: "#00C49F" },
  { region: "East", value: 22, color: "#FFBB28" },
  { region: "West", value: 15, color: "#FF8042" },
]

const scatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
]

const radarData = [
  { subject: "Sales", A: 120, B: 110, fullMark: 150 },
  { subject: "Marketing", A: 98, B: 130, fullMark: 150 },
  { subject: "Development", A: 86, B: 130, fullMark: 150 },
  { subject: "Customer Service", A: 99, B: 100, fullMark: 150 },
  { subject: "Information Technology", A: 85, B: 90, fullMark: 150 },
  { subject: "Administration", A: 65, B: 85, fullMark: 150 },
]

const treemapData = [
  { name: "Laptops", size: 89000, fill: "#8884d8" },
  { name: "Phones", size: 76000, fill: "#82ca9d" },
  { name: "Tablets", size: 45000, fill: "#ffc658" },
  { name: "Accessories", size: 32000, fill: "#ff7300" },
  { name: "Software", size: 28000, fill: "#00ff00" },
]

const funnelData = [
  { name: "Leads", value: 1000, fill: "#8884d8" },
  { name: "Prospects", value: 800, fill: "#83a6ed" },
  { name: "Qualified", value: 600, fill: "#8dd1e1" },
  { name: "Proposals", value: 400, fill: "#82ca9d" },
  { name: "Customers", value: 200, fill: "#a4de6c" },
]

const heatmapData = [
  { day: "Mon", hour: "9AM", value: 45 },
  { day: "Mon", hour: "10AM", value: 67 },
  { day: "Mon", hour: "11AM", value: 89 },
  { day: "Tue", hour: "9AM", value: 34 },
  { day: "Tue", hour: "10AM", value: 78 },
  { day: "Tue", hour: "11AM", value: 92 },
]

interface AdvancedChartsProps {
  fileName: string
}

export function AdvancedCharts({ fileName }: AdvancedChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Bar Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>Monthly sales, profit, and expenses comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Sales", color: "hsl(var(--chart-1))" },
              profit: { label: "Profit", color: "hsl(var(--chart-2))" },
              expenses: { label: "Expenses", color: "hsl(var(--chart-3))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" />
                <Bar dataKey="profit" fill="var(--color-profit)" />
                <Bar dataKey="expenses" fill="var(--color-expenses)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 2. Line Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
          <CardDescription>Sales and profit trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Sales", color: "hsl(var(--chart-1))" },
              profit: { label: "Profit", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 3. Pie Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Regional Distribution</CardTitle>
          <CardDescription>Sales distribution across regions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Percentage", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ region, value }) => `${region}: ${value}%`}
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 4. Area Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Revenue Flow</CardTitle>
          <CardDescription>Cumulative revenue and profit visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Sales", color: "hsl(var(--chart-1))" },
              profit: { label: "Profit", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="var(--color-sales)"
                  fill="var(--color-sales)"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="1"
                  stroke="var(--color-profit)"
                  fill="var(--color-profit)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 5. Scatter Plot */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Performance Correlation</CardTitle>
          <CardDescription>Relationship between different metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              z: { label: "Performance", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Metric A" />
                <YAxis dataKey="y" name="Metric B" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Scatter dataKey="z" fill="var(--color-z)" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 6. Radar Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Multi-dimensional performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              A: { label: "Current Year", color: "hsl(var(--chart-1))" },
              B: { label: "Previous Year", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 150]} />
                <Radar
                  name="Current Year"
                  dataKey="A"
                  stroke="var(--color-A)"
                  fill="var(--color-A)"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Previous Year"
                  dataKey="B"
                  stroke="var(--color-B)"
                  fill="var(--color-B)"
                  fillOpacity={0.3}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 7. Treemap */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product Categories</CardTitle>
          <CardDescription>Hierarchical view of product performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              size: { label: "Revenue", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <Treemap data={treemapData} dataKey="size" aspectRatio={4 / 3} stroke="#fff" strokeWidth={2} />
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 8. Funnel Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sales Funnel</CardTitle>
          <CardDescription>Customer conversion pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: { label: "Count", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="center" fill="#fff" stroke="none" />
                </Funnel>
                <ChartTooltip content={<ChartTooltipContent />} />
              </FunnelChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 9. Stacked Bar Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Quarterly Breakdown</CardTitle>
          <CardDescription>Detailed quarterly performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              q1: { label: "Q1", color: "hsl(var(--chart-1))" },
              q2: { label: "Q2", color: "hsl(var(--chart-2))" },
              q3: { label: "Q3", color: "hsl(var(--chart-3))" },
              q4: { label: "Q4", color: "hsl(var(--chart-4))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { category: "Sales", q1: 145000, q2: 168000, q3: 172000, q4: 195000 },
                  { category: "Marketing", q1: 45000, q2: 52000, q3: 48000, q4: 61000 },
                  { category: "Operations", q1: 85000, q2: 92000, q3: 88000, q4: 105000 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="q1" stackId="a" fill="var(--color-q1)" />
                <Bar dataKey="q2" stackId="a" fill="var(--color-q2)" />
                <Bar dataKey="q3" stackId="a" fill="var(--color-q3)" />
                <Bar dataKey="q4" stackId="a" fill="var(--color-q4)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 10. Multi-Line Chart */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Multi-Metric Trends</CardTitle>
          <CardDescription>Comprehensive performance tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sales: { label: "Sales", color: "hsl(var(--chart-1))" },
              profit: { label: "Profit", color: "hsl(var(--chart-2))" },
              expenses: { label: "Expenses", color: "hsl(var(--chart-3))" },
              growth: { label: "Growth Rate", color: "hsl(var(--chart-4))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData.map((item, index) => ({
                  ...item,
                  growth: 5 + index * 2 + Math.random() * 3,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="var(--color-profit)" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="var(--color-growth)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
