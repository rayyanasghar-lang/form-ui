"use server"

import { writeFile, unlink } from "fs/promises"
import { join, basename } from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { tmpdir } from "os"

const execAsync = promisify(exec)

export async function uploadWithRcloneAction(formData: FormData) {
  const file = formData.get("file") as File
  const projectName = (formData.get("projectName") as string || "Uploads").trim()

  if (!file) {
    console.error("No file object found in FormData")
    return { error: "No file provided" }
  }

  console.log(`Processing upload: ${file.name} (${file.size} bytes, type: ${file.type})`)
  
  let buffer: Buffer
  try {
    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
    console.log(`Buffer created, length: ${buffer.length}`)
  } catch (err: any) {
    console.error("Failed to create buffer from file:", err)
    return { error: `Failed to process file: ${err.message}` }
  }

  // Use tmpdir() for better compatibility
  const tempFileName = `upload-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const tempFilePath = join(tmpdir(), tempFileName)

  try {
    // 1. Save file temporarily
    await writeFile(tempFilePath, buffer)
    console.log(`Successfully wrote temp file to: ${tempFilePath}`)

    // 2. Construct rclone command
    const remoteName = "odoo-test"
    // Encode projectName to avoid path issues but keep it readable
    const safeProjectName = projectName.replace(/[/\\?%*:|"<>]/g, '_')
    const targetPath = `${remoteName}:${safeProjectName}/${tempFileName}`
    
    // Use copyto to be 100% sure about the destination filename
    const command = `rclone copyto "${tempFilePath}" "${targetPath}"`
    console.log(`Executing rclone: ${command}`)

    // 3. Execute rclone
    const { stdout, stderr } = await execAsync(command)
    
    if (stderr) console.warn("Rclone stderr:", stderr)
    console.log("Rclone copyto completed")

    // 4. Verify upload and get file ID using lsjson
    let webViewLink = ""
    try {
        // List the FOLDER contents to find our file ID
        const folderPath = `${remoteName}:${safeProjectName}`
        const lsCommand = `rclone lsjson "${folderPath}"`
        console.log(`Executing lsjson on folder: ${lsCommand}`)
        
        const { stdout: lsStdout, stderr: lsStderr } = await execAsync(lsCommand)
        console.log("lsjson raw stdout:", lsStdout)
        if (lsStderr) console.warn("lsjson stderr:", lsStderr)

        const files = JSON.parse(lsStdout)
        console.log("Parsed files:", JSON.stringify(files, null, 2))
        
        // Find the specific file we just uploaded by its temp file name
        console.log(`Looking for file: ${tempFileName}`)
        const uploadedFile = files.find((f: any) => f.Name === tempFileName)
        
        if (uploadedFile && uploadedFile.ID) {
            const fileId = uploadedFile.ID
            // Construct a standard Google Drive view link
            webViewLink = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`
            console.log(`Generated link from ID: ${webViewLink}`)
        } else {
            console.warn("File uploaded but not found in folder listing. Files in folder:", files.map((f: any) => f.Name))
        }
    } catch (e) {
        console.warn("Failed to verify file with lsjson:", e)
    }

    return { 
        success: true, 
        fileName: file.name,
        webViewLink 
    }

  } catch (error: any) {
    console.error("Rclone upload error:", error)
    return { 
        error: error.message || "Failed to upload with rclone",
        details: error.toString()
    }
  } finally {
    // 5. Cleanup temp file
    try {
      await unlink(tempFilePath)
      console.log("Cleaned up temp file")
    } catch (e) {
      console.error("Failed to cleanup temp file:", e)
    }
  }
}
