"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  label: string
  description?: string
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  acceptedFormats?: string
}

export default function FileUploader({
  label,
  description,
  onFilesSelected,
  maxFiles = 5,
  acceptedFormats = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const updated = [...files, ...newFiles].slice(0, maxFiles)
    setFiles(updated)
    onFilesSelected(updated)
  }

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onFilesSelected(updated)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
        {description && <p className="text-sm text-muted-foreground mb-3">{description}</p>}
      </div>

      {/* Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-border bg-muted/20 hover:bg-muted/40",
        )}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium text-foreground mb-1">Drag and drop your files here</p>
        <p className="text-sm text-muted-foreground mb-4">
          or{" "}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
            className="text-primary hover:underline font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          {acceptedFormats} • Max {maxFiles} files
        </p>
      </div>

      <input ref={inputRef} type="file" multiple onChange={handleChange} className="hidden" accept={acceptedFormats} />

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""} selected
          </p>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border"
              >
                <span className="text-sm text-foreground truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
