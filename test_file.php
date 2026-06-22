<?php
header('Content-Type: text/plain');
$file = 'assets/index-DTJ4snGG.js';
echo "File: $file\n";
echo "Exists: " . (file_exists($file) ? 'YES' : 'NO') . "\n";
echo "Is Readable: " . (is_readable($file) ? 'YES' : 'NO') . "\n";
echo "File Size: " . (file_exists($file) ? filesize($file) : 0) . " bytes\n";
echo "\nAll files in assets:\n";
foreach (glob('assets/*') as $f) {
    echo " - " . basename($f) . " (" . filesize($f) . " bytes)\n";
}
?>
