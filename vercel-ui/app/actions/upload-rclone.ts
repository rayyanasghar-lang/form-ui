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
    return { error: "No file provided" }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  // Use process.cwd() instead of tmpdir() to match reproduction script
  const tempFileName = `upload-${Date.now()}-${file.name}`
  const tempFilePath = join(process.cwd(), tempFileName)

  try {
    // 0. Debug Environment
    console.log("--- DEBUG START ---")
    try {
        const { stdout: versionOut } = await execAsync("rclone --version")
        console.log("Rclone Version:", versionOut.trim())
        
        const { stdout: remotesOut } = await execAsync("rclone listremotes")
        console.log("Rclone Remotes:", remotesOut.trim())
    } catch (e: any) {
        console.error("Rclone Environment Check Failed:", e.message)
        return { error: "Rclone not found or not working in server environment" }
    }

    // 1. Save file temporarily
    await writeFile(tempFilePath, buffer)
    console.log(`Saved temp file to: ${tempFilePath}`)

    // 2. Construct rclone command
    // Remote: odoo-test
    // Target: odoo-test:ProjectName/FileName
    // We use "copy" to copy the file to the remote
    const remoteName = "odoo-test"
    const targetPath = `${remoteName}:${projectName}`
    
    // Escape paths for Windows/Shell safety is tricky, but basic quoting helps
    const command = `rclone copy "${tempFilePath}" "${targetPath}"`
    
    console.log(`Executing: ${command}`)

    // 3. Execute rclone
    const { stdout, stderr } = await execAsync(command)
    
    if (stderr) {
      console.warn("Rclone stderr:", stderr)
    }
    console.log("Rclone stdout:", stdout)

    // 4. Verify upload and get file ID using lsjson
    // This is more reliable than 'rclone link' which requires public sharing permissions
    
    // Wait 2 seconds to ensure Drive consistency
    await new Promise(resolve => setTimeout(resolve, 2000))

    let webViewLink = ""
    try {
        // List the FOLDER contents, not the file directly
        const lsCommand = `rclone lsjson "${targetPath}"`
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
