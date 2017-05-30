const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');


function request(url, requestOptions) {
  return new Promise((resolve, reject) => {
    const oReq = new XMLHttpRequest();
    Object.assign(oReq, requestOptions);

    oReq.addEventListener('load', resolveBound);
    oReq.addEventListener('error', reject);
    oReq.open('GET', url);
    oReq.send();

    function resolveBound() {
      resolve(this);
    }
  });
}

function setupOutDir(forFilename) {
  const fullBase = path.basename(forFilename);
  const outDir = './data/' + path.basename(fullBase, path.extname(fullBase));
  if (!fs.existsSync(outDir)) {
    mkdirp(outDir);
  }
  return outDir;
}

module.exports = {
  ajax: request,
  setupOutDir: setupOutDir
}