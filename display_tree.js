////////// Help functions ///////////

function get_cn_event_for_gene(node, target_gene) {
  if (target_gene in node.data.gene_events) {
    if ("CNV" in node.data.gene_events[target_gene]) {
      return node.data.gene_events[target_gene]["CNV"]
    }
  }
  return 0;
}

function get_color_for_cn_event(cn_event) {
  if (cn_event > 0 || cn_event == "+") {
    return "tomato";
  } else if (cn_event < 0 || cn_event == "-" || cn_event == "loh") {
    return "lightsteelblue";
  }
  return "";
}

var violet_color = "#D291BC" // "#804674"
function get_node_color(node, target_gene) {
  if (target_gene in node.data.gene_events) {
    if ("CNV" in node.data.gene_events[target_gene]) {
      gene_state = node.data.gene_events[target_gene]["CNV"]
      return get_color_for_cn_event(gene_state)
    }
    else {
      return violet_color
    }
  }
  return "";
}

function removeElement(id){
  d3.selectAll(id).remove();
}

////////// Display tree ///////////
function display_tree(div_id, tree_label, treeData, target_gene, target_drug, drug_gene_map, show_details=true, display_text_label=false) {

  if(show_details) { 
    tree_id = "d3_js_tree"
    var elem = document.getElementById(tree_id);
    if(elem) {
      elem.parentNode.removeChild(elem);
    }
  }

  // node info box
  var tooltip = d3.select("div#" + div_id)
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 1)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("visibility", "hidden")
    .style("display", "none")

  // set the dimensions and margins of the diagram
  var margin = { top: 30, right: 20, bottom: 35, left: 20 };
  div_width = document.getElementById(div_id).offsetWidth
  if(show_details) {
    var width = 200//Math.min(200, div_width - margin.left - margin.right)
    var height = Math.min(400, 2*screen.height/3) - margin.top - margin.bottom;
  }
  else {
    var width = 200 //screen.width / 6 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
  }

  // declares a tree layout and assigns the size
  var treemap = d3.tree().size([width, height]);
  //  assigns the data to a hierarchy using parent-child relationships
  var nodes = d3.hierarchy(treeData);
  // maps the node data to the tree layout
  nodes = treemap(nodes);

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin

  var svg = d3
    .select("div#" + div_id)
    .append("svg")

  if(show_details) {
    svg.attr("id", tree_id)
  }
  
  svg.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "auto")

  var g = svg.append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Add sample name.
  g.append("text")
    .attr("id", "rectangleText")
    .attr("class", "visible")
    .attr("x", -10)
    .attr("y", -10)
    .attr("width",10)
    .style("font-size", "13px")
    .text(tree_label);

  // adds the links between the nodes
  var link = g
    .selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter()
    .append("g")
    .attr("class", "link");
 
  // change link color
  link
    .append("path")
    .attr("d", function(d) {
      return (
        "M" + d.x + "," + d.y + "C" + d.x + "," + (d.y + d.parent.y) / 2 +
        " " + d.parent.x + "," + (d.y + d.parent.y) / 2 + " " + d.parent.x +
	"," + d.parent.y);
    })
    .attr("orient", "auto")
    .style("stroke", function(d) {
      if(d.parent != null && d.data.branch_end) {
        return "darkgreen"
      }
      
      if (d.parent != null && d.data.gene_events) {
        cn_event = get_cn_event_for_gene(d, target_gene);
        return get_color_for_cn_event(cn_event);
      }
    });

  // add text to the edges
  link
    .append("text")
    //.attr("x", -45)
    .attr("text-anchor", "middle")
    .attr("stroke-width", "1px")
    .attr("stroke", "gray")
    .attr("fill", "gray")
    .attr("font-size", "20px")
    .attr("transform", function(d) {
      var x_coord = (d.x + d.parent.x) / 2
      // Add an offset on the x coordinate according to wheter the child node is on the right or left side.
      if(d.x < d.parent.x) {
        x_coord -= 20
      } 
      else {
        x_coord += 20
      }
      var y_coord = 10 + (d.y + d.parent.y) / 2
      return (
        "translate(" +
        x_coord +
        "," +
        y_coord +
        ")"
      );
    })
    .text(function(d) {
      if (d.parent != null && d.data.gene_events) {
        cn_event = get_cn_event_for_gene(d, target_gene);
        if (cn_event) {
          string = "";
          if (cn_event > 0) {
            string = "+";
          }
          string += cn_event;
          return string;
        }
      }
    });

  // adds each node as a group
  var node = g
    .selectAll(".node")
    .data(nodes.descendants())
    .enter()
    .append("g")
    .attr("class", function(d) {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })

  if (show_details) {
    node.on('mousemove', function(d) {
      // Compute html info.
      if (d.data.node_id == 0 || !d.data.gene_events) {
        html_info = "root"
      }
      else {
        html_info = ""
        if (d.data.matching_label) {
          html_info += "<b>Matching label:</b> " + d.data.matching_label + "<br/>"
        }
        html_info += "<b>Node id:</b> " + d.data.node_id + "<br/>"
        html_info += "<b>Subclone size:</b> " + Math.round(d.data.size_percent * 100) + "%<br/>"
        if (typeof d.data.is_neutral !== 'undefined') {
          html_info += "<b>Is neutral:</b> " + d.data.is_neutral + "<br/>"
        }

        var gene_events = getGeneCategoriesInNode(d)
        if (gene_events) {
          html_info += "<p style='margin:6px;'></p><b>Genetic events:</b><br/>"
          keys = Object.keys(gene_events).sort().reverse()
          for (event of keys) {
            gene_list = Array.from(gene_events[event]).sort()
            html_info += capitalizeFirstLetter(event) + ": " + gene_list.join(', ') + "<br/>"
          } 
        }
      }
      // Populate tooltip.
      tooltip 
        .html(html_info)
        .style('width', 100+'%')
        .style("left", (d3.mouse(this)[0]) + "px")
        .style("top", (d3.mouse(this)[1] + 50) + "px")
        .style("visibility", "visible")
        .style("display", "block")
        .style("position", "absolute")
        .style("z-index" ,10)
    })
    .on('mouseover', function(d) {
      tooltip.style("opacity", 1)
    })
    .on('mouseleave', function() {
      tooltip.style("opacity", 0)
        .style("visibility", "hidden")
        .style("display", "none")
    })
    .style("cursor", "pointer")
  }

  // adds circle of certain size to the node
  node
    .append("circle")
    .attr("r", function(d) {
      if (d.parent == null) {
        return 3
      }
      return circle_ray(d.data.size_percent);
    })
    .style("fill", function(d) {
      if (d.data.is_neutral) {
        return "lightyellow"
      }

      if(show_details) {
        if (d.parent != null && d.data.gene_events) {
          return get_node_color(d, target_gene);
        }
      }
      else {
        if(d.data.color) {
          return d.data.color
        }
      }
    })

  node.append("text")
    .attr("x", function(d) {
      if (d.parent != null) {
        return circle_ray(d.data.size_percent) - 10
      }
    })
    .attr("y", function(d) {
      if (d.parent != null) {
        return circle_ray(d.data.size_percent) - 6 
      }
    })
    .style("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("fill", "gray")
    .text(function(d) {
      if (display_text_label) {
        if (d.parent != null) {
          return d.data.matching_label
        }
      }
      return ""
    })

  // Drug interaction rectangle. 
  if (show_details) {
    node.append("rect")
    .attr("x", function(d) {
      if (d.parent != null) {
        ray = circle_ray(d.data.size_percent)
        rect_size = ray 
        return -ray/2 - (rect_size - ray) / 2
      }
    })
    .attr("y", function(d) {
      if (d.parent != null) {
        ray = circle_ray(d.data.size_percent)
        rect_size = ray 
        return -ray/2 - (rect_size - ray) / 2
      }
    })
    .attr('width', function(d) {
      if (d.parent != null) {
        ray = circle_ray(d.data.size_percent)
        return ray
      }
    })
    .attr('height', function(d) {
      if (d.parent != null) {
        ray = circle_ray(d.data.size_percent)
        return ray //Math.max(10, ray)
      }
    })
    .style("fill", function(d) {
      if (d.parent != null) {
        if(!d.data.gene_events) {
          return "white"
        }
        if(target_drug in drug_gene_map) {
          gene_list = drug_gene_map[target_drug]
          for (var gene_1 of gene_list){
            for (gene_2 in d.data.gene_events) { 
              if (gene_2.includes(gene_1)) {
                return "green"
              }
            }
          }
        }
        var color = get_node_color(d, target_gene)
        if(!color) { 
          color = "white"
        } 
        return color
      }
    });
  }    
}

