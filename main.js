const url = require('url');
const createGraph = require('ngraph.graph');
const pixel = require('ngraph.pixel');
const ajax = require('./ajax.js');

const graphName = 'trace-small';
const outDir = 'data';
const graphDir = outDir + '/' + graphName;

function toInt32Array(oReq) {
  return new Int32Array(oReq.response);
}

function toJson(oReq) {
  return JSON.parse(oReq.responseText);
}

Promise.all([
  ajax(graphDir + '/positions.bin', { responseType: 'arraybuffer' }).then(toInt32Array),
  ajax(graphDir + '/links.bin', { responseType: 'arraybuffer' }).then(toInt32Array),
  ajax(graphDir + '/labels.json').then(toJson)
]).then(render);

function render(data) {
  const positions = data[0];
  const links = data[1];
  const labels = data[2];

  console.log(positions);
  console.log(links);
  console.log(labels);

  var graph = initGraphFromLinksAndLabels(links, labels);
  var renderer = pixel(graph, {
    node() {
      // use smaller node size
      return { size: 5, color: 0xFF0894 };
    },

    // We need to use "dumb" links, otherwise it will be slow
    // Dumb links cannot be updated directly via properties. Have
    // to use renderer.edgeView().setFromColor(), renderer.edgeView().setToColor(), etc.
    activeLink: false
  });

  var layout = renderer.layout();
  // no need to do any layout here
  renderer.stable(true);

  // Set node positions.
  labels.forEach(function (label, index) {
    var nodeCount = index * 3;
    var x = positions[nodeCount + 0];
    var y = positions[nodeCount + 1];
    var z = positions[nodeCount + 2];

    layout.setNodePosition(label, x, y, z);
  });

  renderer.redraw();
}

function initGraphFromLinksAndLabels(links, labels) {
  var srcIndex;

  var graph =  createGraph({ uniqueLinkId: false });
  // labels.forEach(label => graph.addNode(label));
  links.forEach(processLink);

  return graph;

  function processLink(link) {
    if (link < 0) {
      srcIndex = -link - 1;
    } else {
      var toNode = link - 1;
      var fromId = labels[srcIndex];
      var toId = labels[toNode];
      graph.addLink(fromId, toId);
    }
  }
}


// const m = new url(window.location.href);

// console.log(m);



// var positions;

// function readSingleFile(e) {
//   var file = e.target.files[0];
//   if (!file) {
//     return;
//   }
//   console.log(file);
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     var contents = e.target.result;
//     // console.log(contents);
//     // displayContents(contents);
//     renderit(contents);
//     console.log(positions);
//   };
//   reader.readAsText(file);
// }

// function readPositions(e) {
//   var file = e.target.files[0];
//   if (!file) {
//     return;
//   }
//   console.log(file);
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     var data = reader.result;
//     positions = new Int32Array(data);
//     // console.log(positions);
//     for (var i = 0; i < 15; i+=3) {
//     	var x = positions[i+0];
//     	var y = positions[i+1];
//     	var z = positions[i+2];
//     	console.log(":: " + x + " " + y + " " + z);
//     }

//   };
//   reader.readAsArrayBuffer(file);
// }


// // function displayContents(contents) {
// //   var element = document.getElementById('file-content');
// //   element.innerHTML = contents;
// // }

// document.getElementById('file-input')
//   .addEventListener('change', readSingleFile, false);

//   document.getElementById('file-input2')
//   .addEventListener('change', readPositions, false);


// function renderit(dotcontents) {

// var createGraph = require('ngraph.graph');
// var dot = require('ngraph.fromdot');


// var g = dot(dotcontents);

// // var g = createGraph();

// // g.addNode('hello');
// // g.addNode('world');



// var renderGraph = require('ngraph.pixel');
// var renderer = renderGraph(g);


// console.log(g);

// console.log(renderer);

// var layout = renderer.layout();

// // var nodecnt = 0;
// // g.forEachNode(function (nodeModel) {
// // 	// console.log(nodeModel);
// // 	var x = positions[nodecnt+0];
// // 	var y =  positions[nodecnt+1];
// // 	var z = positions[nodecnt+2];
// //   layout.setNodePosition(nodeModel.id, x, y, z);
// //   // if (nodecnt == 0) {
// //   	console.log(nodeModel.id + ": " + x + " " + y + " " + z)
// //   // }
// //   nodecnt+=3;
// //   // var ui = renderer.getLink(nodeModel.id);

// //   // but be careful! If your link UI creation function decided to skip this
// //   // node, you will get `ui === undefined` here.
// // });

// // renderer.stable(true);





// renderer.on('nodeclick', function(node) {
//   console.log('Clicked on ' + JSON.stringify(node));
// });

// renderer.on('nodedblclick', function(node) {
//   console.log('Double clicked on ' + JSON.stringify(node));
// });

// renderer.on('nodehover', function(node) {
//   console.log('Hover node ' + JSON.stringify(node));
// });

// // If you want to unsubscribe from event, just use `off()` method:
// renderer.on('nodehover', handler);
// renderer.off('nodehover', handler);

// }

