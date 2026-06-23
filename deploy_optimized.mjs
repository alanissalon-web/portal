import * as ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs';

const localDistDir = path.resolve('./dist');

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

        // 1. Clean up the accidental /public_html/public_html directory
        console.log("Cleaning up accidental /public_html/public_html directory...");
        try {
            await client.cd("/");
            await client.removeDir("public_html/public_html");
            console.log("Deleted accidental nested public_html directory.");
        } catch(e) {
            console.log("Accidental nested public_html directory did not exist or could not be deleted:", e.message);
        }

        // 2. Clean up physical public_html/admin directory
        console.log("Cleaning up physical public_html/admin directory...");
        try {
            await client.cd("/");
            await client.removeDir("public_html/admin");
            console.log("Deleted physical public_html/admin directory.");
        } catch(e) {
            console.log("public_html/admin directory did not exist or could not be deleted:", e.message);
        }

        // 3. Perform optimized upload of dist files (skipping large images to prevent timeout/reset)
        console.log("Starting optimized upload of build files...");
        await client.cd("/");
        await client.ensureDir("public_html");
        await client.cd("/public_html");

        // Helper to recursively upload directory files
        async function uploadDirRecursive(localPath, remoteRelativeDir) {
            const items = fs.readdirSync(localPath);
            for (const item of items) {
                const fullLocalPath = path.join(localPath, item);
                const stat = fs.statSync(fullLocalPath);

                if (stat.isDirectory()) {
                    // Create remote directory and recurse
                    const newRemoteRelativeDir = remoteRelativeDir ? `${remoteRelativeDir}/${item}` : item;
                    await client.cd("/public_html");
                    await client.ensureDir(newRemoteRelativeDir);
                    await uploadDirRecursive(fullLocalPath, newRemoteRelativeDir);
                } else {
                    // Skip large images to prevent ECONNRESET/timeouts in sandbox environment
                    const ext = path.extname(item).toLowerCase();
                    if (['.jpg', '.jpeg', '.png', '.svg', '.gif', '.ico'].includes(ext)) {
                        console.log(`Skipping static asset image: ${item}`);
                        continue;
                    }

                    const remoteFilePath = remoteRelativeDir ? `${remoteRelativeDir}/${item}` : item;
                    console.log(`Uploading file: ${remoteFilePath}`);
                    
                    // Always make sure we are at public_html root or remote directory path
                    await client.cd("/public_html");
                    if (remoteRelativeDir) {
                        await client.cd(remoteRelativeDir);
                    }
                    
                    // Remove existing file first to avoid file lock issues on Hostinger
                    try {
                        await client.remove(item);
                    } catch(e) {}
                    try {
                        await client.remove(`.in.${item}.`);
                    } catch(e) {}

                    if (item === 'index.html') {
                        console.log("Applying cache-busting parameters to index.html asset paths...");
                        let html = fs.readFileSync(fullLocalPath, 'utf8');
                        const cacheBuster = Date.now();
                        html = html.replace(/src="(\/assets\/[a-zA-Z0-9_-]+\.js)"/g, `src="$1?v=${cacheBuster}"`);
                        html = html.replace(/href="(\/assets\/[a-zA-Z0-9_-]+\.(js|css))"/g, `href="$1?v=${cacheBuster}"`);
                        
                        const tempHtmlPath = path.join(localDistDir, 'index_deploy.html');
                        fs.writeFileSync(tempHtmlPath, html, 'utf8');
                        
                        let retries = 3;
                        while (retries > 0) {
                            try {
                                await client.uploadFrom(tempHtmlPath, item);
                                break;
                            } catch (err) {
                                console.log(`Upload failed for ${item}, retrying... (${retries} left)`);
                                retries--;
                                if (retries === 0) throw err;
                                await new Promise(r => setTimeout(r, 2000));
                            }
                        }
                        fs.unlinkSync(tempHtmlPath);
                    } else {
                        let retries = 3;
                        while (retries > 0) {
                            try {
                                await client.uploadFrom(fullLocalPath, item);
                                break;
                            } catch (err) {
                                console.log(`Upload failed for ${item}, retrying... (${retries} left)`);
                                retries--;
                                if (retries === 0) throw err;
                                await new Promise(r => setTimeout(r, 2000));
                            }
                        }
                    }
                }
            }
        }

        await uploadDirRecursive(localDistDir, "");
        console.log("Optimized upload complete!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

deploy();
