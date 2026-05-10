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
  content = content.replace(/#6c5ce7/g, '#152ad1');
  content = content.replace(/#a855f7/g, '#4455da');
  content = content.replace(/#00e0ff/g, '#737fe3');
  content = content.replace(/108,92,231/g, '21,42,209');
  content = content.replace(/108, 92, 231/g, '21, 42, 209');
  content = content.replace(/0,224,255/g, '115,127,227');
  content = content.replace(/0, 224, 255/g, '115, 127, 227');
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
});
