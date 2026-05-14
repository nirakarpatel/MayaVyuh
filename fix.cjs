const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(/font-size:\s*(\d+)px/g, (match, p1) => {
  let size = parseInt(p1);
  return size < 20 ? `font-size: ${size + 3}px` : match;
});
code = code.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
  let size = parseInt(p1);
  return size < 20 ? `fontSize: ${size + 3}` : match;
});
fs.writeFileSync('src/App.jsx', code);
