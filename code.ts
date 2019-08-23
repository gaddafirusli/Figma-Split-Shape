let selections = figma.currentPage.selection;

// Check if there's at least 1 selection
if (selections.length > 0) {
  figma.showUI(__html__);
  figma.ui.resize(250, 240);
} else {
  figma.notify("⚠️ Please select at least 1 shape or frame");
  figma.closePlugin();
}

// When user click on Split button
figma.ui.onmessage = msg => {
  if (msg.type === "split") {
    for (const node of selections) {
      // Get the params from UI window
      let column = msg.column;
      let row = msg.row;
      let gutter = msg.gutter;
      let margin = msg.margin;

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
  }
  figma.closePlugin();
};
