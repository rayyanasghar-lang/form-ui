"use server"

import { google } from "googleapis"
import { Readable } from "stream"

export async function uploadToDriveAction(formData: FormData) {
    try {
        const file = formData.get("file") as File
        const projectName = formData.get("projectName") as string

        if (!file || !projectName) {
            console.error("Upload validation failed: Missing file or project name")
            return { error: "Missing file or project name" }
        }

        // Validate environment variables
        if (!process.env.GOOGLE_CLIENT_EMAIL) {
            console.error("Google Drive upload failed: GOOGLE_CLIENT_EMAIL environment variable is not set")
            return { error: "Google Drive credentials not configured: Missing GOOGLE_CLIENT_EMAIL" }
        }

        if (!process.env.GOOGLE_PRIVATE_KEY) {
            console.error("Google Drive upload failed: GOOGLE_PRIVATE_KEY environment variable is not set")
            return { error: "Google Drive credentials not configured: Missing GOOGLE_PRIVATE_KEY" }
        }

        console.log(`Starting upload for file: ${file.name} (${file.size} bytes) to project: ${projectName}`)

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/drive.file"],
        })

        const drive = google.drive({ version: "v3", auth })
        console.log("Google Drive client initialized successfully")

        // 1. Check if folder exists
        let folderId = ""
        const folderQuery = `mimeType='application/vnd.google-apps.folder' and name='${projectName}' and trashed=false`
        console.log(`Searching for existing folder: ${projectName}`)

        const folderRes = await drive.files.list({
            q: folderQuery,
            fields: "files(id, name)",
        })

        if (folderRes.data.files && folderRes.data.files.length > 0) {
            folderId = folderRes.data.files[0].id!
            console.log(`Found existing folder with ID: ${folderId}`)
        } else {
            // Create folder
            console.log(`Creating new folder: ${projectName}`)
            const fileMetadata = {
                name: projectName,
                mimeType: "application/vnd.google-apps.folder",
                parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
            }

            if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
                console.log(`Parent folder ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`)
            } else {
                console.log("No parent folder specified, creating in root")
            }

            const folder = await drive.files.create({
                requestBody: fileMetadata,
                fields: "id",
            })
            folderId = folder.data.id!
            console.log(`Created new folder with ID: ${folderId}`)
        }

        // 2. Upload file
        console.log(`Uploading file to folder ID: ${folderId}`)
        const buffer = Buffer.from(await file.arrayBuffer())
        const stream = Readable.from(buffer)

        const fileMetadata = {
            name: file.name,
            parents: [folderId],
        }
        const media = {
            mimeType: file.type,
            body: stream,
        }

        const fileRes = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id, webViewLink, webContentLink, name, mimeType, parents",
        })

        console.log(`✓ File uploaded successfully!`)
        console.log(`  - File ID: ${fileRes.data.id}`)
        console.log(`  - File Name: ${fileRes.data.name}`)
        console.log(`  - MIME Type: ${fileRes.data.mimeType}`)
        console.log(`  - Parent Folder: ${fileRes.data.parents?.[0]}`)
        console.log(`  - Web View Link: ${fileRes.data.webViewLink}`)
        console.log(`  - Web Content Link: ${fileRes.data.webContentLink}`)

        // Verify the file exists by listing it
        try {
            const verifyRes = await drive.files.get({
                fileId: fileRes.data.id!,
                fields: "id, name, size, createdTime",
            })
            console.log(`✓ File verified in Drive:`)
            console.log(`  - Size: ${verifyRes.data.size} bytes`)
            console.log(`  - Created: ${verifyRes.data.createdTime}`)
        } catch (verifyError) {
            console.warn(`⚠️ Could not verify file (but upload may have succeeded):`, verifyError)
        }

        // List files in the folder to confirm it's there
        try {
            const listRes = await drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: "files(id, name, size)",
                pageSize: 10,
            })
            console.log(`📁 Files in folder (showing up to 10):`)
            listRes.data.files?.forEach((f) => {
                console.log(`  - ${f.name} (${f.size} bytes, ID: ${f.id})`)
            })
        } catch (listError) {
            console.warn(`⚠️ Could not list folder contents:`, listError)
        }

        return {
            fileId: fileRes.data.id,
            webViewLink: fileRes.data.webViewLink,
            webContentLink: fileRes.data.webContentLink,
            fileName: fileRes.data.name,
        }
    } catch (error: any) {
        console.error("❌ Google Drive upload error:", error)

        // Provide more specific error messages
        if (error.code === 401 || error.code === 403) {
            console.error("Authentication/Permission error - Check service account credentials and permissions")
            return {
                error: "Google Drive authentication failed. Please check service account credentials and permissions.",
                details: error.message
            }
        }

        if (error.code === 404) {
            console.error("Parent folder not found - Check GOOGLE_DRIVE_FOLDER_ID")
            return {
                error: "Google Drive parent folder not found. Please check GOOGLE_DRIVE_FOLDER_ID.",
                details: error.message
            }
        }

        return {
            error: error.message || "Failed to upload file to Google Drive",
            details: error.toString()
        }
    }
}
