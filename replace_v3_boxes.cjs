const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src', 'v3'), function(filePath) {
  if (!filePath.endsWith('.jsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace dark grey boxes with San Marino Blue tinted glass
  content = content.replace(/bg-\[\#0d1225\]\/[0-9]+/g, 'bg-[#152ad1]/20');
  content = content.replace(/bg-\[\#0d1225\]/g, 'bg-[#152ad1]/15');
  
  content = content.replace(/bg-\[\#080c1a\]\/[0-9]+/g, 'bg-[#152ad1]/15');
  content = content.replace(/bg-\[\#080c1a\]/g, 'bg-[#152ad1]/10');
  
  content = content.replace(/border-\[\#1a2240\]/g, 'border-[#4455da]/30');
  
  // Text colors
  content = content.replace(/text-\[\#3d4d6e\]/g, 'text-[#a1aaed]/70');
  content = content.replace(/text-\[\#6b7da0\]/g, 'text-[#a1aaed]');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated UI boxes in', filePath);
  }
});
