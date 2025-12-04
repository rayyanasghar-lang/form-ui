

import { google } from "googleapis"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

async function testDriveConnection() {
    console.log("🔍 Testing Google Drive Connection...\n")

    // Step 1: Check environment variables
    console.log("Step 1: Checking environment variables...")
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

    if (!clientEmail) {
        console.error("❌ GOOGLE_CLIENT_EMAIL is not set")
        return
    }
    console.log(`✓ GOOGLE_CLIENT_EMAIL: ${clientEmail}`)

    if (!privateKey) {
        console.error("❌ GOOGLE_PRIVATE_KEY is not set")
        return
    }
    console.log(`✓ GOOGLE_PRIVATE_KEY: ${privateKey.substring(0, 50)}... (truncated)`)

    if (folderId) {
        console.log(`✓ GOOGLE_DRIVE_FOLDER_ID: ${folderId}`)
    } else {
        console.log("⚠️  GOOGLE_DRIVE_FOLDER_ID not set (will use root)")
    }

    try {
        // Step 2: Authenticate
        console.log("\nStep 2: Authenticating with Google Drive...")
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/drive"],
        })

        const drive = google.drive({ version: "v3", auth })
        console.log("✓ Authentication successful")

        // Step 3: Test basic access
        console.log("\nStep 3: Testing Drive access...")
        const aboutRes = await drive.about.get({
            fields: "user, storageQuota",
        })
        console.log(`✓ Connected as: ${aboutRes.data.user?.emailAddress}`)
        console.log(`✓ Drive Type: ${aboutRes.data.user?.displayName || "Service Account"}`)

        // Step 4: Check parent folder (if specified)
        if (folderId) {
            console.log("\nStep 4: Verifying parent folder access...")
            try {
                const folderRes = await drive.files.get({
                    fileId: folderId,
                    fields: "id, name, mimeType, capabilities",
                })
                console.log(`✓ Parent folder found: "${folderRes.data.name}"`)
                console.log(`✓ Can create files: ${folderRes.data.capabilities?.canAddChildren}`)
                console.log(`✓ Can list files: ${folderRes.data.capabilities?.canListChildren}`)
            } catch (error: any) {
                console.error(`❌ Cannot access parent folder: ${error.message}`)
                console.error("  Make sure the folder is shared with:", clientEmail)
                return
            }
        }

        // Step 5: List files in folder or root
        console.log("\nStep 5: Listing files...")
        const query = folderId
            ? `'${folderId}' in parents and trashed=false`
            : "trashed=false"

        const listRes = await drive.files.list({
            q: query,
            fields: "files(id, name, mimeType, createdTime, size)",
            pageSize: 10,
            orderBy: "createdTime desc",
        })

        if (listRes.data.files && listRes.data.files.length > 0) {
            console.log(`✓ Found ${listRes.data.files.length} file(s):`)
            listRes.data.files.forEach((file, index) => {
                console.log(`  ${index + 1}. ${file.name}`)
                console.log(`     ID: ${file.id}`)
                console.log(`     Size: ${file.size || 'N/A'} bytes`)
                console.log(`     Created: ${file.createdTime}`)
            })
        } else {
            console.log("⚠️  No files found in the target location")
            console.log("   This could mean:")
            console.log("   - Files are being uploaded but to a different location")
            console.log("   - Files are in the service account's Drive, not shared")
        }

        // Step 6: Test file creation
        console.log("\nStep 6: Testing file creation (creating test file)...")
        const testFileMetadata = {
            name: `test-${Date.now()}.txt`,
            mimeType: "text/plain",
            parents: folderId ? [folderId] : [],
        }

        const testMedia = {
            mimeType: "text/plain",
            body: "This is a test file created by the Google Drive connection test.",
        }

        const createRes = await drive.files.create({
            requestBody: testFileMetadata,
            media: testMedia,
            fields: "id, name, webViewLink, webContentLink",
        })

        console.log(`✓ Test file created successfully!`)
        console.log(`  - File ID: ${createRes.data.id}`)
        console.log(`  - File Name: ${createRes.data.name}`)
        console.log(`  - View Link: ${createRes.data.webViewLink}`)
        console.log(`  - Download Link: ${createRes.data.webContentLink}`)

        console.log("\n⚠️  IMPORTANT:")
        console.log("   The test file was created in the SERVICE ACCOUNT's Drive")
        console.log("   To see it in YOUR Drive, the folder must be SHARED with you")
        console.log(`   Share the folder with your personal Google account`)

        // Step 7: Clean up test file
        console.log("\nStep 7: Cleaning up test file...")
        await drive.files.delete({
            fileId: createRes.data.id!,
        })
        console.log("✓ Test file deleted")

        console.log("\n✅ All tests passed! Google Drive is configured correctly.")
        console.log("\nIf you still can't see uploaded files:")
        console.log("1. Make sure the target folder is SHARED with your Google account")
        console.log(`2. Share folder ${folderId || 'root'} with: ${clientEmail}`)
        console.log("3. Check the webViewLink in console logs after upload")
        console.log("4. Files may be in the service account's Drive, not yours")

    } catch (error: any) {
        console.error("\n❌ Test failed:", error.message)
        
        if (error.code === 401 || error.code === 403) {
            console.error("\n🔐 Authentication/Permission Error:")
            console.error("   - Verify GOOGLE_CLIENT_EMAIL is correct")
            console.error("   - Verify GOOGLE_PRIVATE_KEY is properly formatted")
            console.error("   - Enable Google Drive API in Google Cloud Console")
            console.error("   - Share the target folder with the service account email")
        }
        
        console.error("\nFull error:", error)
    }
}

// Run the test
testDriveConnection()
