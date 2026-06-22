import * as ftp from 'basic-ftp';
import path from 'path';

async function deploy() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log("Connecting to FTP...");
        await client.access({
            host: "82.197.80.239",
            user: "u873532103.alanissalon.com",
            password: "@Alanis2026",
            secure: false
        });

        // 1. Delete the physical public_html/admin directory recursively to restore SPA routing
        console.log("Cleaning up physical public_html/admin directory...");
        try {
            await client.removeDir("public_html/admin");
            console.log("Physical public_html/admin directory deleted successfully.");
        } catch(e) {
            console.log("public_html/admin directory did not exist or could not be deleted:", e.message);
        }

        // 2. Upload the dist folder contents to public_html
        console.log("Uploading built files from dist/ to public_html...");
        await client.ensureDir("public_html");
        await client.uploadFromDir("dist");
        console.log("Upload complete!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

deploy();
