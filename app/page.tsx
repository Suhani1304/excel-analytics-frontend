"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSpreadsheet, BarChart3, Users, Shield, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      setIsAuthenticated(true)
      const userRole = localStorage.getItem("userRole")
      if (userRole === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Excel Analytics Pro
                </h1>
                <p className="text-sm text-gray-600">Advanced Excel Data Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Transform Your Excel Data Into Powerful Insights
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload, analyze, and visualize your Excel files with advanced analytics, real-time processing, and
              AI-powered insights. Get actionable intelligence from your data in minutes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to analyze and visualize your Excel data with professional-grade tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-blue-100 rounded-lg w-fit">
                  <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Smart File Processing</CardTitle>
                <CardDescription>
                  Upload and process Excel files with intelligent data detection and validation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-green-100 rounded-lg w-fit">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>10+ chart types including bar, pie, line, scatter, heatmaps, and more</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-purple-100 rounded-lg w-fit">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>Get intelligent recommendations and anomaly detection powered by AI</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-orange-100 rounded-lg w-fit">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Real-time Processing</CardTitle>
                <CardDescription>Live data processing with real-time updates and progress tracking</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-indigo-100 rounded-lg w-fit">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>Share insights and collaborate with team members on data analysis</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="p-3 bg-red-100 rounded-lg w-fit">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level security with role-based access control and data encryption
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8">
              Join thousands of professionals who trust Excel Analytics Pro for their data analysis needs
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600">
                  Create Account
                </Button>
              </Link>
              <Link href="/auth/admin-register">
                <Button size="lg" variant="outline">
                  Admin Registration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Excel Analytics Pro</h3>
                <p className="text-gray-400 text-sm">© 2024 All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
