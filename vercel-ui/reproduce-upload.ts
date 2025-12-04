import { exec } from "child_process"
import { promisify } from "util"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"

const execAsync = promisify(exec)

async function testUpload() {
    const fileName = "test-file-with-spaces.txt"
    const projectName = "test project"
    const tempFilePath = join(process.cwd(), fileName)
    
    console.log("1. Creating temp file...")
    await writeFile(tempFilePath, "This is a test file content")

    const remoteName = "odoo-test"
    const targetPath = `${remoteName}:${projectName}`
    
    // Exact command logic from server action
    const copyCommand = `rclone copy "${tempFilePath}" "${targetPath}"`
    console.log(`2. Executing copy: ${copyCommand}`)
    
    try {
        const { stdout, stderr } = await execAsync(copyCommand)
        console.log("   Copy stdout:", stdout)
        if (stderr) console.log("   Copy stderr:", stderr)

        const lsCommand = `rclone lsjson "${targetPath}/${fileName}"`
        console.log(`3. Executing lsjson: ${lsCommand}`)
        
        const { stdout: lsStdout, stderr: lsStderr } = await execAsync(lsCommand)
        console.log("   lsjson stdout:", lsStdout)
        
        const files = JSON.parse(lsStdout)
        if (files && files.length > 0 && files[0].ID) {
            console.log(`✅ SUCCESS! File ID found: ${files[0].ID}`)
            console.log(`   Link: https://drive.google.com/file/d/${files[0].ID}/view?usp=drivesdk`)
        } else {
            console.error("❌ FAILED: No ID found in lsjson output")
        }

    } catch (error) {
        console.error("❌ ERROR:", error)
    } finally {
        await unlink(tempFilePath)
        console.log("4. Cleanup done")
    }
}

testUpload()
