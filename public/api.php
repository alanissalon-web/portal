<?php
header('Content-Type: text/plain');
echo "Hello from api.php!\n";
echo "Current Time: " . date('Y-m-d H:i:s') . "\n";
echo "Files in assets:\n";
foreach (glob('assets/*') as $f) {
    echo " - " . basename($f) . "\n";
}
?>
