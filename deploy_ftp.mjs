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
        
        console.log("Connected! Uploading root files...");
        const localDir = path.resolve('./dist');
        await client.cd('public_html');
        
        try { await client.remove('index.html'); } catch(e) {}
        try { await client.remove('.in.index.html.'); } catch(e) {}
        
        await client.uploadFrom(path.join(localDir, 'index.html'), 'index.html');
        console.log("Upload complete!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

deploy();
