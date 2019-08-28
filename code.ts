const key = "SETTINGS";

// Show UI window
figma.showUI(__html__, { width: 220, height: 240 });

// Load previous options and send to UI
figma.clientStorage.getAsync(key).then(options => {
  figma.ui.postMessage({ data: options, type: "SETTINGS" });
});

// Get current selection
let selections = figma.currentPage.selection;

// Show warning if first launch with no selection
if (selections.length === 0) {
  figma.notify("⚠️ Please select at least 1 shape or frame");
}

// Poll for selections
getSelections();
setInterval(() => {
  getSelections();
}, 500);

function getSelections() {
  selections = figma.currentPage.selection;
  figma.ui.postMessage({
    data: { withSelection: selections.length > 0 ? true : false },
    type: "SELECTION"
  });
}

// When user click on Split button
figma.ui.onmessage = msg => {
  if (msg.type === "split") {
    // Get the params from UI window
    let column = msg.column;
    let row = msg.row;
    let gutter = msg.gutter;
    let margin = msg.margin;

    for (const node of selections) {
      // Get the original properties of the node
      let width = node.width;
      let height = node.height;
      let originx = node.x + margin;
      let originy = node.y;
      let parent = node.parent;

      // Calculate new size based on params
      let newWidth = (width - margin * 2 - gutter * (column - 1)) / column;
      let newHeight = row > 1 ? (height - gutter * (row - 1)) / row : height;

      // Generate new nodes and position them accordingly
      for (let i = 0; i < column; i++) {
        for (let j = 0; j < row; j++) {
          let rect = node.clone();
          rect.resize(newWidth, newHeight);
          rect.x = i * (newWidth + gutter) + originx;
          rect.y = j * (newHeight + gutter) + originy;
          parent.appendChild(rect);
        }
      }

      // Remove the original node
      node.remove();
    }

    // Store option in client storage
    let options = { column, row, gutter, margin };
    figma.clientStorage.setAsync(key, options).then(() => {});

    // Close the UI window
    figma.closePlugin();
  }
};
