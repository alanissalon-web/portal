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
        
        console.log("Uploading test_file.php...");
        await client.uploadFrom("test_file.php", "public_html/test_file.php");
        console.log("Uploaded successfully!");
    }
    catch(err) {
        console.error("FTP Error:", err);
    }
    client.close();
}

list();
