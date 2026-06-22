import * as ftp from 'basic-ftp';

async function list() {
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
        
        console.log("Listing public_html/admin...");
        const list = await client.list("public_html/admin");
        for (const item of list) {
            console.log(`${item.type === 2 ? 'DIR' : 'FILE'}: ${item.name} (${item.size} bytes)`);
        }
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

list();
