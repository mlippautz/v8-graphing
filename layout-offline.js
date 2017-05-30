const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const fromdot = require('ngraph.fromdot');
const saveBinaryGraph = require('ngraph.tobinary');
const createLayout = require('ngraph.offline.layout');

function printHelp() {
  console.log('usage: node layout-offline.js <graph>.dot');
}

function setupOutDir(forFilename) {
  const fullBase = path.basename(forFilename);
  const outDir = './data/' + path.basename(fullBase, path.extname(fullBase));
  if (!fs.existsSync(outDir)) {
    mkdirp(outDir);
  }
  return outDir;
}

function processDotFile(contents, outDir) {
  const graph = fromdot(contents);
  const filesPresent =
    ['labels.json', 'links.bin', 'meta.json']
      .map((filename) => fs.existsSync(path.join(outDir, filename)))
      .reduce(function(acc, val) {
        return acc && val;
      }, true);
  if (!filesPresent) {
    saveBinaryGraph(graph, {
      outDir: outDir,
    });
  }
  const layout = createLayout(graph, {
    iterations: 100,
    saveEach: 5,
    outDir: outDir,
  });
  layout.run();
}

if (process.argv.length != 3) {
  printHelp();
  process.exit(1);
}
const graphFile = process.argv[2];
const outDir = setupOutDir(graphFile);
const contents = fs.readFileSync(graphFile, 'utf8');
processDotFile(contents, outDir);
