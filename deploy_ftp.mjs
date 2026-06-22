import fs from 'fs';
import path from 'path';
import * as ftp from 'basic-ftp';

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
        
        const localDir = path.resolve('./dist');

        const pathsToPopulate = [
            'public_html/admin',
            'public_html/admin/courses',
            'public_html/admin/products'
        ];

        for (const remotePath of pathsToPopulate) {
            console.log("Copying index.html to " + remotePath);
            await client.cd('/');
            await client.cd(remotePath);
            try { await client.remove('index.html'); } catch(e) {}
            try { await client.remove('.in.index.html.'); } catch(e) {}
            await client.uploadFrom(path.join(localDir, 'index.html'), 'index.html');
        }
        
        console.log("Upload complete!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

deploy();
