"use server"

import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { tmpdir } from "os"

const execAsync = promisify(exec)

export async function uploadWithRcloneAction(formData: FormData) {
  const file = formData.get("file") as File
  const projectName = formData.get("projectName") as string || "Uploads"

  if (!file) {
    return { error: "No file provided" }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  // Use process.cwd() instead of tmpdir() to match reproduction script
  const tempFilePath = join(process.cwd(), `upload-${Date.now()}-${file.name}`)

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
        const lsCommand = `rclone lsjson "${targetPath}/${file.name}"`
        console.log(`Executing lsjson: ${lsCommand}`)
        
        const { stdout: lsStdout, stderr: lsStderr } = await execAsync(lsCommand)
        console.log("lsjson stdout:", lsStdout)
        if (lsStderr) console.warn("lsjson stderr:", lsStderr)

        const files = JSON.parse(lsStdout)
        
        if (files && files.length > 0 && files[0].ID) {
            const fileId = files[0].ID
            // Construct a standard Google Drive view link
            webViewLink = `https://drive.google.com/file/d/${fileId}/view?usp=drivesdk`
            console.log(`Generated link from ID: ${webViewLink}`)
        } else {
            console.warn("File uploaded but ID not found in lsjson output")
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
