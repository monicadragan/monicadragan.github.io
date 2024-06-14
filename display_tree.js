////////// Display tree ///////////

function circle_ray(percentage) {
  return Math.min(20, Math.max(5, percentage * 50))
}

function display_tree(div_id, tree_label, json_tree, matching_nodes_color_map) {

  // Set the dimensions and margins of the diagram.
  var margin = { top: 30, right: 10, bottom: 30, left: 10 };
  var width = 200 //screen.width / 6 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  // Declares a tree layout and assigns the size.
  var treemap = d3.tree().size([width, height]);
  //  assigns the data to a hierarchy using parent-child relationships
  var nodes = d3.hierarchy(json_tree);
  // maps the node data to the tree layout
  nodes = treemap(nodes);

  // Append the svg object to the body of the page.
  // Appends a 'group' element to 'svg'.
  // Moves the 'group' element to the top left margin.
  var svg = d3.select("body")
    .select("div#" + div_id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
 
  var g = svg.append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Add sample name. 
  g.append("text")
    .attr("id", "rectangleText")
    .attr("class", "visible")
    .attr("x", 0)
    .attr("y", -13)
    .attr("width",10)
    .style("font-size", "13px")
    .text(tree_label);

  // Adds the links between the nodes.
  var link = g.selectAll(".link")
    .data( nodes.descendants().slice(1))
    .enter().append("path")
    .attr("class", "link")
    .attr("d", function(d) {
       return "M" + d.x + "," + d.y
         + "C" + d.x + "," + (d.y + d.parent.y) / 2
         + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
         + " " + d.parent.x + "," + d.parent.y;
       })
    .style("stroke", function(d){ 
        if(d.data.node_id == 0) {return 'white'} else {return 'lightgray'} 
    }) 

  // Adds each node as a group.
  var node = g.selectAll(".node")
    .data(nodes.descendants())
    .enter().append("g")
    .attr("class", function(d) { 
      return "node" + 
        (d.children ? " node--internal" : " node--leaf"); })
    .attr("transform", function(d) { 
      return "translate(" + d.x + "," + d.y + ")"; })
    /*.on("mouseover", function(d) {
      d3.select(this)
        .append("text")
        .classed("info", true)
        .attr("x", -10)
        .attr("y", 5)    
        .text(function(d) {
          return d.data.node_id
          if (d.data.node_id != 0) {    
            if (d.data.size_percent) {
              cell_fraction = Math.round(d.data.size_percent * 100)
            } 
            else {
              cell_fraction = Math.round(0.2 * 100)
            }
            return cell_fraction + "%";
          }
        })
    })*/
    .on("mouseout", function() {      
      // Remove the info text on mouse out.
      d3.select(this)
        .select("text.info")
        .remove();
    })

  // Adds the circle to the node.
  node.append("circle")
    .attr("r", function(d) {
      if (d.data.node_id == 0)
        return 3
      return circle_ray(d.data.size_percent) //Math.min(20, Math.max(5, d.data.size_percent * 50))
     
    })
    .style("fill", function(d){ 
      if (d.data.is_neutral) {
        return "lightyellow"
      }
      return matching_nodes_color_map[d.data.matching_label]       
      //if (d.data.node_color) {     
      //  return d.data.node_color
      //}
    })

  node.append("text")
    .attr("x", function(d) {
      if (d.data.hasOwnProperty('label')) {
        if (d.data.node_id != 0) {
          return -6 * d.data.label[0].length/2
        }
      }
      return 0
    })
    .attr("y", function(d) {
      if (d.data.node_id != 0) {
        return -circle_ray(d.data.size_percent) - 5
      }
    })
    //.attr("dx", 12)
    //.attr("dy", ".35em")
    //.attr("x", 15)
    //.attr("y", -10) 
    //.attr("transform", "rotate(-90)")
    .style("font-size", "10px")
    .text(function(d) {
      if (d.data.hasOwnProperty('label')) {
        if (d.data.node_id != 0) {
          if (d.data.label.length > 1) {
            return d.data.label + "..."
          }
          return d.data.label 
        }
      }
    })
}


