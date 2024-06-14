////////// Help functions ///////////

function circle_ray(percentage) {
  return Math.min(20, Math.max(5, percentage * 50))
} 

function get_cn_event_for_gene(node, target_gene) {
  if (target_gene in node.data.gene_events) {
    if ("CNV" in node.data.gene_events[target_gene]) {
      return node.data.gene_events[target_gene]["CNV"]
    }
  }
  return 0;
}

function get_color_for_cn_event(cn_event) {
  if (cn_event > 0) {
    return "tomato";
  } else if (cn_event < 0) {
    return "lightsteelblue";
  }
  return "";
}

function get_node_color(node, target_gene) {
  if (target_gene in node.data.gene_events) {
    if ("CNV" in node.data.gene_events[target_gene]) {
      gene_state = node.data.gene_events[target_gene]["CNV"]
      if (gene_state > 0) {
        return "tomato";
      } else if (gene_state < 0) {
        return "lightsteelblue";
      }
    }
    else {
      return "tomato";
    }
  }
  return "";
}

function removeElement(id){
  d3.selectAll(id).remove();
}

function getSvgId(div_id) {
  return div_id + "_svg"
}

////////// Display tree ///////////
function display_cn_tree(div_id, treeData, target_gene, target_drug) {

  var elem = document.getElementById(getSvgId(div_id));
  if(elem) {
    elem.parentNode.removeChild(elem);
  }

  // set the dimensions and margins of the diagram
  var margin = { top: 30, right: 30, bottom: 30, left: 30 };
  var width = screen.width / 6 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;

  // declares a tree layout and assigns the size
  var treemap = d3.tree().size([width, height - 200]);
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
    .attr('id', getSvgId(div_id))
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("display", "block")
    .style("margin", "auto")

  var g = svg.append("g")
          .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // adds the links between the nodes
  var link = g
    .selectAll(".link")
    .data(nodes.descendants().slice(1))
    .enter()
    .append("g")
    .attr("class", "link");

  link
    .append("path")
    .attr("d", function(d) {
      return (
        "M" + d.x + "," + d.y + "C" + d.x + "," + (d.y + d.parent.y) / 2 +
        " " + d.parent.x + "," + (d.y + d.parent.y) / 2 + " " + d.parent.x +
	"," + d.parent.y);
    })
    .attr("orient", "auto")
    .style("stroke-width", function(d) {
      if (d.data.node_id != 0 && d.data.gene_events) {
        if (get_cn_event_for_gene(d, target_gene)) {
          return 3;
        }
      }
    })
    .style("stroke", function(d) {
      if (d.data.node_id != 0 && d.data.gene_events) {
        cn_event = get_cn_event_for_gene(d, target_gene);
        return get_color_for_cn_event(cn_event);
      }
    });

  // add text to the edges
  link
    .append("text")
    //.attr("x", -45)
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("transform", function(d) {
      var x_coord = (d.x + d.parent.x) / 2
      // Add an offset on the x coordinate according to wheter the child node is on the right or left side.
      if(d.x < d.parent.x) {
        x_coord -= 15
      } 
      else {
        x_coord += 15
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
      if (d.data.node_id != 0 && d.data.gene_events) {
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
    .on('mouseover', function(d) {
      d3.select('#tooltip').transition().duration(200).style('opacity', 1).text(d)
    })
    .on('mouseout', function() {
      d3.select('#tooltip').style('opacity', 0)
    })
    .on('mousemove', function(d) {

      if (d.data.node_id == 0 || !d.data.gene_events) {
        html_info = "root"
      }
      else {
        html_info = "Node id: " + d.data.node_id + "<br/>"
        if (d.data.matching_label) {
          html_info += "Matching label: " + d.data.matching_label + "<br/>"
        }
        html_info += "Subclone size: " + Math.round(d.data.size_percent * 100) + "%<br/>"
        if (typeof d.data.is_neutral !== 'undefined') {
          html_info += "Is neutral: " + d.data.is_neutral + "<br/>"
        }

        gene_events = {}
        gene_map = objectToMap(d.data.gene_events)
        gene_map.forEach((events, gene) => {
          events = objectToMap(events)
          events.forEach((value, event) => {
            if (event == "CNV") {
              label = value
              if (value > 0) {
                label = "+" + value
              }
              if (!(label in gene_events)) {
                gene_events[label] = []
              }
              else {
                gene_events[label].push(gene)
              }
            }
            else {
              gene_events[event] = gene 
              if (value) {
                gene_events[event] = gene_events[event] + "_" + value
              }
            }
          })
        })

        if (gene_events) {
          keys = Object.keys(gene_events).sort().reverse()
          for (var i=0; i<keys.length; i++) {
            event = keys[i]
            html_info += event + ": " + gene_events[event] + "<br/>"
          } 
        }
      }

      d3.select('#tooltip')
      .style('width', 20+'%')
      .style('right', 0 + 'px') //(d3.event.pageX+10) + 'px')
      .style('top', (d3.event.pageY+10) + 'px')
      .html(html_info)
    })

  // adds circle of certain size to the node
  node
    .append("circle")
    .attr("r", function(d) {
      if (d.data.node_id != 0) {
        return circle_ray(d.data.size_percent);
      }
      return 3;
    })
    .style("fill", function(d) {
      if (d.data.is_neutral) {
        return "lightyellow"
      }

      if (d.data.node_id != 0 && d.data.gene_events) {
        return get_node_color(d, target_gene);
      }
    });


  /*node
    .append("rect")
    .attr("x", -5)
    .attr("y", -5)
    .attr('width', 10)
    .attr('height', 10)
    .style("fill", function(d) {
      if (d.data.node_id != 0) {
        if(target_drug in drug_gene_map) {
          gene_list = drug_gene_map[target_drug]
          for (var gene of gene_list){ 
            if (gene in d.data.gene_state) {
              return "green"
            }
          }
        }
        var color = get_color_for_gene_state(d, target_gene)
        if(!color) { 
          color = "white"
        } 
        return color
      }
    });*/
    

  /*node
    .append("text")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    //.style("font-weight", "bold")
    .text(function(d) {
      if (d.data.node_id != 0) {
        return "#";
      }
    });*/

}

