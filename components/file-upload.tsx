"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  onFileUpload: (file: any) => void
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      alert("Please upload only Excel or CSV files")
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)

            // Add the new file to the list
            const newFile = {
              id: Date.now(),
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              rows: Math.floor(Math.random() * 20000) + 5000,
              columns: Math.floor(Math.random() * 15) + 5,
              uploadDate: new Date().toISOString().split("T")[0],
              status: "completed" as const,
            }

            onFileUpload(newFile)
            setIsOpen(false)
            setUploadProgress(0)
            return 0
          }
          return prev + 10
        })
      }, 200)
    } catch (error) {
      setIsUploading(false)
      setUploadProgress(0)
      alert("Upload failed. Please try again.")
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Excel File</DialogTitle>
          <DialogDescription>
            Upload your Excel (.xlsx, .xls) or CSV file to start analyzing your data.
          </DialogDescription>
        </DialogHeader>

        {isUploading ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Uploading and processing...</p>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Drop your file here</p>
            <p className="text-sm text-gray-600 mb-4">or click to browse</p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload-input"
            />

            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload-input")?.click()}
              type="button"
            >
              Choose File
            </Button>

            <p className="text-xs text-gray-500 mt-2">Supports: .xlsx, .xls, .csv (max 10MB)</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
