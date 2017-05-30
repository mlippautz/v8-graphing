const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const fromdot = require('ngraph.fromdot');
const saveBinaryGraph = require('ngraph.tobinary');
const createLayout = require('ngraph.offline.layout');

const utils = require('./utils.js');

function printHelp() {
  console.log('usage: node prepare-dot.js <graph>.log');
}

class Node {
  constructor(json) {
    this.address = json.address;
    this.instance_type = json.instance_type;
    this.size = json.size;
  }
}

class Line {
  constructor(raw) {
    var r = /\s*([\S]+)\s*\-\>\s*([\S]+)\s*\;/g;
    var match = r.exec(raw);
    this.a = match[1];
    this.b = match[2];
  }

  // get a() { return this.a; }
  // get b() { return this.b; }
}

function processJson(raw, filter) {
  const result = JSON.parse(raw);
  if (!result.hasOwnProperty('type')) return;
  if (result.type === 'node_descriptor') {
    var n = new Node(result);
    if (filter(n)) return n;
  }
}

if (process.argv.length != 3) {
  printHelp();
  process.exit(1);
}
const graphFile = process.argv[2];
const outDir = utils.setupOutDir(graphFile);

let toFilter = {};

const outStream = fs.createWriteStream(outDir + '/' + graphFile + '.dot');
outStream.once('open', function(fd) {
  outStream.write('digraph g {\n');

  const lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(graphFile)
  });
  lineReader.on('line', function (line) {
    if (line.startsWith('#JSON#')) {
      const oddball = 
          processJson(line.substring('#JSON#'.length), node => node.instance_type == 'ODDBALL_TYPE');
      if (oddball !== undefined) {
        toFilter['N_' + oddball.address] = oddball;
      }
    }

    if (!line.startsWith('#DOT#')) return;

    line = line.substring('#DOT# '.length);
    var l = new Line(line);
    if (toFilter.hasOwnProperty(l.a) || toFilter.hasOwnProperty(l.b)) return;

    // Writing out an edge.
    outStream.write('  ' + line + '\n');
  });

  lineReader.on('close', function(fd) {
    outStream.write("}\n");
    outStream.end();
  });
});
