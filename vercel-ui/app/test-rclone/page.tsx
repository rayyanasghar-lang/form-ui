"use client"

import { useState } from "react"
import { uploadWithRcloneAction } from "@/app/actions/upload-rclone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestRclonePage() {
  const [file, setFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState("Test Project")
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("projectName", projectName)

    try {
      const res = await uploadWithRcloneAction(formData)
      setResult(res)
    } catch (error) {
      setResult({ error: "Unexpected error occurred" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Test Rclone Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project">Project Name (Folder)</Label>
            <Input 
              id="project" 
              value={projectName} 
              onChange={(e) => setProjectName(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input 
              id="file" 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading} 
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload with Rclone"}
          </Button>

          {result && (
            <div className={`p-4 rounded-md text-sm ${result.error ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-800"}`}>
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(result, null, 2)}
              </pre>
              {result.webViewLink && (
                <div className="mt-2">
                    <a href={result.webViewLink} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                        View File
                    </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
