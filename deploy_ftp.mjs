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
        
        // Find the current built JS and CSS files
        const assets = fs.readdirSync(path.join(localDir, 'assets'));
        const newJs = assets.find(f => f.startsWith('index-') && f.endsWith('.js'));
        const newCss = assets.find(f => f.startsWith('index-') && f.endsWith('.css'));
        const vendor = 'vendor-Bo6y-UI4.js';
        const ui = 'ui-CNy-RC-j.js';
        
        const filesToUpload = [
            { local: newJs, remote: 'index-xGyXcovk.js' },
            { local: newCss, remote: 'index-DCC9MjC7.css' },
            { local: vendor, remote: vendor },
            { local: ui, remote: ui }
        ];

        const pathsToPopulate = [
            'public_html/assets',
            'public_html/admin/assets',
            'public_html/admin/courses/assets',
            'public_html/admin/products/assets'
        ];

        for (const remotePath of pathsToPopulate) {
            console.log("Populating " + remotePath);
            await client.ensureDir(remotePath);
            for (const file of filesToUpload) {
                if (!file.local) continue;
                console.log(`Uploading ${file.local} as ${file.remote} to ${remotePath}`);
                try { await client.remove(file.remote); } catch(e) {}
                try { await client.remove('.in.' + file.remote + '.'); } catch(e) {}
                await client.uploadFrom(path.join(localDir, 'assets', file.local), file.remote);
            }
            await client.cd('/');
        }
        
        console.log("Upload complete!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

deploy();
