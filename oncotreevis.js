///////////////////////
//// HTML elements ////
///////////////////////
function addHTMLElements(container_div_id, args) {
  var div_container = document.getElementById(container_div_id)
  div_container.innerHTML = ""

  var outer_div = document.createElement('div') 
  outer_div.innerHTML += '<a class="zoom"><i class="fas fa-search-plus" style="font-size:19px; cursor: pointer;"></i></a>&nbsp;'
  outer_div.innerHTML += '<a class="zoom-out"><i class="fas fa-search-minus" style="font-size:19px; cursor: pointer;"></i></a>&nbsp;'
  outer_div.innerHTML += '<a class="zoom-init"><i class="fas fa-expand-arrows-alt" style="font-size:19px; cursor: pointer;"></i></a>&nbsp;'      
   
  var tree_view_div = document.createElement('span')
  tree_view_div.style.border = "2px solid lightgray"
  tree_view_div.style.borderRadius = "8px"
  tree_view_div.style.padding = "2px"  
  tree_view_div.style.paddingTop = "6px"    
  tree_view_div.style.paddingBottom = "6px"      
  var tree_view_button = document.createElement('button')
  tree_view_button.className = "button-15"
  tree_view_button.addEventListener('click', ()=>{ populateTreeView(args); })
  tree_view_button.innerHTML = '<i class="fa fa-tree" style="font-size:19px"></i>&nbsp;TREE VIEW'
  tree_view_div.appendChild(tree_view_button)  
  
  var div_sort_icon = document.createElement('span')
  div_sort_icon.innerHTML += '&nbsp;<a class="shuffle_trees" id="shuffle_icon"><i class="fas fa-sort-alpha-down" ' +  
      'style="font-size:19px; cursor: pointer;"></i></a>&nbsp;'
  tree_view_div.appendChild(div_sort_icon)    
  outer_div.appendChild(tree_view_div)
    
  var heatmap_view_button = document.createElement('button')
  heatmap_view_button.className = "button-15"
  heatmap_view_button.addEventListener('click', ()=>{ populateHeatmapView(args) })
  heatmap_view_button.innerHTML = '<i style="font-size:19px" class="fa fa-th-large"></i> HEATMAP VIEW'
  appendSpace(outer_div) 
  outer_div.appendChild(heatmap_view_button)    
  div_container.appendChild(outer_div) 

  var umap_view_button = document.createElement('button')
  umap_view_button.className = "button-15"
  umap_view_button.addEventListener('click', ()=>{ populateUMAPView(args); })
  umap_view_button.innerHTML = '<i style="font-size:19px" class="fa fa-dot-circle-o"></i> t-SNE VIEW'
  appendSpace(outer_div)
  outer_div.appendChild(umap_view_button)    
  div_container.appendChild(outer_div)
 
  var outer_div = document.createElement('div')
  // Tree cohort div.
  var tree_cohort_div_id = args.tree_cohort_div_id
  tree_cohort_div = createDivContainer(tree_cohort_div_id)
  tree_cohort_div.style.float = "left"
  tree_cohort_div.style.position = "relative"
  tree_cohort_div.style.width = "73%"
  tree_cohort_div.style.padding = "3px"     
  outer_div.appendChild(tree_cohort_div)
  // Tree info div.
  var tree_info_div_id = args.tree_info_div_id
  tree_info_div = createDivContainer(tree_info_div_id)
  tree_info_div.style.borderRadius = "8px"
  tree_info_div.style.fontSize = "13px"
  tree_info_div.style.position = "fixed"
  tree_info_div.style.width = "24%"
  tree_info_div.style.padding = "7px"
  tree_info_div.style.float = "right"
  tree_info_div.style.left = "calc(73% + 2px)"
  tree_info_div.style.bottom = "3px"
  tree_info_div.style.overflowX = "scroll"
  tree_info_div.style.overflowY = "scroll"
  outer_div.appendChild(tree_info_div)
  div_container.appendChild(outer_div) 
  var div_tree_cohort_top_offset = tree_cohort_div.getBoundingClientRect().top
  tree_info_div.style.top = div_tree_cohort_top_offset + "px"
}

///////////////////
//// Tree view ////
///////////////////
function populateTreeView(args){
  // Arguments:
  // trees: tree information; 
  // clusters: list of lists with sample names which match the tree keys;
  // args: dictionary with values for:
  //   data (with trees, clusters, knn),
  //   tree_cohort_div_id and tree_info_div_id.

  // Data.
  data = args.data
  trees = data["trees"]
  clusters = [Object.keys(trees)]
  if ("clusters" in data && data["clusters"].length != 0) {
    clusters = data["clusters"]
  }
  knn = data["matching_trees"] 
  display_text_label = false
  if ("display_text_label" in data && data["display_text_label"]){
    display_text_label = true
  }

  // Prepare tree cohort container.
  var tree_cohort_div_id = args.tree_cohort_div_id
  div_tree_cohort = document.getElementById(tree_cohort_div_id)
  div_tree_cohort.innerHTML = ""
  var tree_info_div_id = args.tree_info_div_id

  for (const [i, cluster] of clusters.entries()) {
    cluster_color = "#FFFFFF"
    umap_color = "gray"
    if (clusters.length > 1 && cluster.length > 1) {
      // Cluster color.
      cluster_color = background_colors[i % background_colors.length]
      umap_color = cluster_color

      // Assign node colors corresponding to matching_labels.
      label_node_map_0 = getNodeMatchingLabels(trees[cluster[0]]["tree"])
      cluster_matching_labels = new Set(Object.keys(label_node_map_0))
      for (sample_name of cluster) {
        var tree_json = trees[sample_name]["tree"]
        var gene_categories = getGeneCategoriesInTree(tree_json)
        label_node_map = getNodeMatchingLabels(tree_json)
        labels = new Set(Object.keys(label_node_map)) // keys are converted to string
        cluster_matching_labels = cluster_matching_labels.intersection(labels)
      }

      matching_labels_color_map = {}
      shuffleArray(node_colors)
      for (label of cluster_matching_labels) {
        idx = Object.keys(matching_labels_color_map).length
        color = node_colors[idx % node_colors.length]  
        matching_labels_color_map[label] = color
      }

      var matching_subclones_color_map = {}
      for (sample_name of cluster) {
        var tree_json = trees[sample_name]["tree"]
        var node_list = getTreeNodes(tree_json)
        for(node of node_list) {
          matching_label = node.data.matching_label
          if (matching_label in matching_labels_color_map) {
            var color = matching_labels_color_map[node.data.matching_label]
            node.data.color = color
            var gene_events = getGeneCategoriesInNode(node)
            if (!(color in matching_subclones_color_map)) {
              matching_subclones_color_map[color] = {}
            }
            for (event in gene_events) {
              if (event in matching_subclones_color_map[color]) {
                matching_subclones_color_map[color][event] = matching_subclones_color_map[color][event].intersection(gene_events[event])
              } else {
                matching_subclones_color_map[color][event] = gene_events[event]
              }
            }
          }
        }
      }

      // Populate cluster metadata.
      var sample_metadata_map = {}
      for (sample_name of cluster) {
        if ("metadata" in trees[sample_name]) {
          sample_metadata = trees[sample_name]["metadata"]
          sample_metadata_map[sample_name] = sample_metadata
        }
      }
      [sample_metadata_colors, metadata_color_map] = getMetadataColorMap(sample_metadata_map)
      table_color_codes = getColorCodesTable(metadata_color_map)
    }

    for (sample_name of cluster) {
      data["trees"][sample_name]["cluster_color"] = umap_color
    }
 
    for (const [j, sample_name] of cluster.entries()) {
      tree_data = trees[sample_name]
      tree_json = tree_data["tree"]
      tree_metadata = {}
      if ("metadata" in tree_data) {
        tree_metadata = tree_data["metadata"]
      }

      // Create div structure: <div><cohort_div><outer_div><tree_div></div></div></div>
      var outer_div = document.createElement("div")
      outer_div.style.display = "inline-block"
      outer_div.style.backgroundColor = cluster_color
      div_tree_cohort.appendChild(outer_div)

      if (j == 0 && clusters.length > 1 && cluster.length > 1) {
        // Show cluster details button.
        var click_cluster_details_div = document.createElement("div")
        click_cluster_details_div.style.cursor = "pointer"
        var text_color = tinycolor(cluster_color).darken(20).desaturate(40).toHexString()
        click_cluster_details_div.innerHTML = '&nbsp;<i class="fa fa-desktop fa-sm" style="color:' + text_color +
          '"></i> <i><font color="' + text_color  + '"> &thinsp; show cluster details </i>'
        click_cluster_details_div.addEventListener('click', showClusterInfo)
        click_cluster_details_div.samples = clusters[i]
        click_cluster_details_div.matching_nodes_details = matching_subclones_color_map
        click_cluster_details_div.tree_info_div_id = tree_info_div_id
        click_cluster_details_div.cluster_bg_color = cluster_color
        click_cluster_details_div.cluster_metadata = sample_metadata_colors
        click_cluster_details_div.table_color_codes = table_color_codes
        outer_div.appendChild(click_cluster_details_div)
      }  else {
        outer_div.innerHTML = "<br/>"
      } 
      var timestamp = Date.now()
      var tree_div_id = sample_name + "_" + timestamp + "_tree"
      var tree_div = createDivContainer(tree_div_id)
      var border_color = tinycolor(cluster_color).darken(5).desaturate(20).toRgbString()
      tree_div.setAttribute("style", "border: 1px solid " + border_color + 
          ";cursor: pointer; border-radius: 8px; display: inline-block; background-color:" + cluster_color)
      tree_div.addEventListener('click', ()=>{ showTreeInfo(sample_name, args); }) 
      outer_div.appendChild(tree_div)
      display_tree(tree_div_id, sample_name, tree_json, "", "", null, show_details=false, display_text_label=display_text_label)
    }
  }
}

//////////////
//// MISC ////
//////////////
background_colors = ["#F9F6EE", "#F8EAEC", "#EBF5F7", "#FFF8DC",
                     "#E8DFD0", "#F0D7DF", "#C3E2E8", "#FCE9C5", "#F5F2F6", "#E1E3DA",
                     "#FFD3DD", "#E0D9E4", "#DEFDEF", "#D0F6CF", "#F3FEFC", "#FFD7BA"]
node_colors = ["#A87676", "#E493B3", "#B784B7", "#8E7AB5", "#F6995C", "#EEC759", "#E9B384",
               "#88AB8E", "#4f6f52", "#65647C", "#8B7E74", "#FF8Dc7", "#A7D2CB", "#554994"]

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Read sample_map
function loadFileVariable(filename){
  var script = document.createElement("script");
  script.src = filename;
  document.head.appendChild(script);
  sleep(2000).then(() => {})
}

const objectToMap = obj => {
   const keys = Object.keys(obj);
   const map = new Map();
   for(let i = 0; i < keys.length; i++){
      //inserting new key value pair inside map
      map.set(keys[i], obj[keys[i]]);
   };
   return map;
};

function deepCopy(oldValue) {
  var newValue
  strValue = JSON.stringify(oldValue)
  return newValue = JSON.parse(strValue)
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function linspace(startValue, stopValue, cardinality) {
  var arr = [];
  var step = (stopValue - startValue) / (cardinality - 1);
  for (var i = 0; i < cardinality; i++) {
    arr.push(startValue + (step * i));
  }
  return arr;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//////////////////////////
//// UTILS D3.JS TREE ////
//////////////////////////
function circle_ray(percentage) {
  if(percentage == null) {
    return 10
  }
  return Math.max(8, Math.min(30, percentage * 60))
}

function getTreeNodes(tree_json) {
  var node_hierarchy = d3.hierarchy(tree_json)
  var treemap = d3.tree()
  return treemap(node_hierarchy).descendants()
}

function getNodeMatchingLabels(tree_json){
  label_node_map = {}
  node_list = getTreeNodes(tree_json)
  for (node of node_list) {
    if (node.parent != null && node.data.gene_events && !node.data.is_neutral){ // discard root, empty nodes and neutral nodes.
      label = node.data.matching_label
      if(!(label in label_node_map)) {
        label_node_map[label] = [] 
      }
     label_node_map[label].push(node)
    }
  }
  return label_node_map
}

//////////////////////
//// HTML helpers ////
//////////////////////
function appendLineBreak(div) {
  div.appendChild(document.createElement("br"))
}

function appendHalfLineBreak(div) {
  div.innerHTML += "<p style='margin:6px;'></p>"
}

function appendSpace(div) {
  new_div = document.createElement("div")
  new_div.style.display = "inline-block"
  new_div.innerHTML = "&nbsp;"
  div.appendChild(new_div)
} 

function createDivContainer(id) {
  var div_container = document.createElement('div')
  div_container.setAttribute("id", id)
  return div_container
}

function createInfoTooltip(text) {
  var div = document.createElement('div')
  div.classList.add("info-tooltip")
  div.classList.add("left")
  div.innerHTML = "&nbsp;<i class='fa fa-question-circle' style='color:onyx'></i>"

  var span = document.createElement('span')
  span.classList.add("info-tooltiptext")
  span.innerHTML = text
  div.appendChild(span)
  return div
}

////////////////////////////
//// Populate tree info ////
////////////////////////////
function createInfoHeader(html_text){
  var color_motif = "#d2cae6"
  div_container = document.createElement('div')
  div_container.style.backgroundColor = color_motif
  div_container.innerHTML = "&nbsp;" + html_text
  return div_container
}

function createExpandBox(div_id, reverse=false) {
  var button_class = "fa-caret-down"
  var show_div = true
  if(reverse) {
    button_class = "fa-caret-up"
    show_div = false
  }
  var button_expand = document.createElement('span')
  var button_id = "button_" + div_id
  button_expand.setAttribute("id", button_id)
  button_expand.innerHTML += "&nbsp;<a><i class='fa " + button_class + " fa-lg' style='color:onyx; cursor:pointer'></i></a>"
  button_expand.addEventListener('click', (event) => {
    var div = document.getElementById(event.currentTarget.div_id)
    var button = document.getElementById(button_id)
    var show_div = event.currentTarget.show_div
    if (show_div) {
      div.style.display = 'block'
      button.innerHTML = button.innerHTML.replace("down", "up")
    } else {
      div.style.display = 'none'
      button.innerHTML = button.innerHTML.replace("up", "down")
    }
    button.show_div = !show_div
  })
  button_expand.div_id = div_id
  button_expand.button_id = button_id
  button_expand.show_div = show_div

  return button_expand
}

function addActivityItem(){
  console.log("clikc")
}

function showTreeInfo(sample_name, args) {
  // Input: sample_name and a dictionary with the following attached information:
  // sample name, tree hierarchy, tree metadata, matching trees map,
  // div_id (where the tree info is displayed).

  // Tree information
  var tree_object = data["trees"][sample_name]["tree"]
  var metadata = data["trees"][sample_name]["metadata"]
  var knn = data["matching_trees"]

  // Div container.
  var tree_info_div_id = args.tree_info_div_id
  var tree_info_div = document.getElementById(tree_info_div_id)
  tree_info_div.innerHTML = ""
  tree_info_div.style.border = "1px solid lightgray"

  tree_info_div.style.backgroundColor = "white"

  // Compute gene list and variables related to the selected target gene. 
  var gene_categories = getGeneCategoriesInTree(tree_object)
  var gene_list = Array.from(Object.values(gene_categories)[0])
  var drug_gene_map = getDrugToGeneMap(gene_list, gene_drug_map)
  var drug_list = findDrugsAffectingGeneList(gene_list, drug_gene_map, tree_object)

  // Display sample name.
  header_sample_name = createInfoHeader("<strong>Selected sample: <b>" + sample_name + "</b></strong>")
  tree_info_div.appendChild(header_sample_name)
  appendLineBreak(tree_info_div)

  // Gene selection.
  gene_selection_dropdown = document.createElement("select")
  gene_selection_dropdown.setAttribute("id", "gene_selection")
  gene_selection_dropdown.classList.add("gene_selection")
  gene_selection_dropdown.style.width = "200px"
  option = document.createElement('option');
  option.textContent = "-- Select target gene event --"
  gene_selection_dropdown.appendChild(option);
  keys = Object.keys(gene_categories).sort()
  for (var i=0; i<keys.length; i++) {
    event = keys[i]
    array = gene_categories[event]
    sorted_genes = Array.from(array).sort()
    addGeneToGeneList(gene_selection_dropdown, sorted_genes, event)
  }
  div_container = document.createElement('div')
  div_container.style.width = "fit-content"
  div_container.style.margin = "auto"
  div_container.appendChild(gene_selection_dropdown)

  info_text = createInfoTooltip("The subclones affected by the select target gene are indicated by colors " +
    "(violet for mutation, red for copy-number amplification and blue for deletion). The subclones which have affected genes " +
    "interacting with the target drug are indiated with green squares.")
  div_container.appendChild(info_text)

  tree_info_div.appendChild(div_container)
  appendHalfLineBreak(tree_info_div)

  // Drug selection.
  drug_selection_dropdown = document.createElement("select")
  drug_selection_dropdown.setAttribute("id", "drug_selection")
  drug_selection_dropdown.classList.add("drug_selection")
  drug_selection_dropdown.style.width = "200px"
  option = document.createElement('option');
  option.textContent = "-- Select target drug --"
  drug_selection_dropdown.appendChild(option)
  for (idx = 0; idx < drug_list.length; idx++) {
    drug_short_name = drug_list[idx].substring(0,20)
    if (drug_short_name.length < drug_list[idx].length) {
      drug_short_name += "..."
    }
    drug_selection_dropdown.options[drug_selection_dropdown.options.length] = new Option(drug_short_name, idx);
  }
  div_container = document.createElement('div')
  div_container.style.width = "fit-content"
  div_container.style.margin = "auto"
  div_container.appendChild(drug_selection_dropdown)

  info_text = createInfoTooltip("TODO")
  div_container.appendChild(info_text)

  tree_info_div.appendChild(div_container)
  appendLineBreak(tree_info_div)

  // Display tree.
  var header_tree = createInfoHeader("<b>Interactive tree</b>")
  var info_text_box = createInfoTooltip("The subclones affected by the select target gene are indicated by colors " +
    "(violet for mutation, red for copy-number amplification and blue for deletion). The subclones which have affected genes " +
    "interacting with the target drug are indiated with green squares.")
  header_tree.appendChild(info_text_box)
  tree_info_div.appendChild(header_tree)

  var tree_box_id = "tree_box"
  var tree_box_div = createDivContainer(tree_box_id)
  tree_box_div.style.display = 'block'
  tree_info_div.appendChild(tree_box_div)
  header_tree.appendChild(createExpandBox(tree_box_id, reverse=true))
  appendLineBreak(tree_info_div)

  var target_gene = getSeletedItem(gene_selection_dropdown)
  var target_drug = getSeletedItem(drug_selection_dropdown)
  display_tree(tree_box_id, "", tree_object, target_gene, target_drug, drug_gene_map)

  // Displayed metadata.
  var header_metadata = createInfoHeader("<b>Clinical data</b>")
  tree_info_div.appendChild(header_metadata)

  var metadata_box_id = "metadata"
  var metadata_box_div = createDivContainer(metadata_box_id)
  metadata_box_div.style.display = 'none'
  for (const [key, value] of Object.entries(metadata)) {
    metadata_box_div.innerHTML += '<i><b>' + key + '</b>: ' + value + '</i></br>'
  }
  tree_info_div.appendChild(metadata_box_div)
  header_metadata.appendChild(createExpandBox(metadata_box_id))
  appendLineBreak(tree_info_div)

  // Top DGIdb drugs.
  var header_top_drugs = createInfoHeader("<b>Top DGIdb drugs associated with target gene</b>")
  var info_text_box = createInfoTooltip("Top drugs.")
  header_top_drugs.appendChild(info_text_box)
  tree_info_div.appendChild(header_top_drugs)

  var top_drugs_box_id = "top_drugs"
  var top_drugs_box_div = createDivContainer(top_drugs_box_id)
  top_drugs_box_div.style.display = 'none'
  top_drugs_box_div.innerHTML = populateGeneDrugInfoHTML(target_gene, gene_drug_map)
  tree_info_div.appendChild(top_drugs_box_div)
  header_top_drugs.appendChild(createExpandBox(top_drugs_box_id))
  appendLineBreak(tree_info_div)

  // kNN matching trees.
  if (knn) { 
  var header_knn = createInfoHeader("<b>K-nearest tree neighbors</b>")
  var info_text_box = createInfoTooltip("kNN.")
  header_knn.appendChild(info_text_box)
  tree_info_div.appendChild(header_knn)

  var knn_box_id = "knn"
  var knn_box_div = createDivContainer(knn_box_id)
  knn_box_div.style.display = 'none'
  tree_info_div.appendChild(knn_box_div)
  for (const [id, data] of Object.entries(knn)) {
    if (id.startsWith(sample_name)) {
      async_display_tree_matching(knn_box_id, data)
    }
  }
  header_knn.appendChild(createExpandBox(knn_box_id))
  appendLineBreak(tree_info_div)
  }

  // Add event listeners after the DOM is complete. 
  $('.gene_selection, .drug_selection').on('change', 
    {tree_div_id: tree_box_id,
     tree_object: tree_object,
     gene_dropdown_id: 'gene_selection',
     drug_dropdown_id: 'drug_selection',
     dgi_div_id: top_drugs_box_id,
     gene_drug_map: gene_drug_map,
     drug_gene_map: drug_gene_map}, 
    updateTree)

  /*

  // Hidden kNN.
  var hidden_knn_div = document.createElement("div")
  hidden_knn_div.setAttribute("id", "hidden_knn")
  hidden_knn_div.innerHTML += "<br/><strong style='background-color:#e6e2d3; display:block;'>&nbsp;K-nearest tree neighbors &nbsp;" +
      "<div class='info-tooltip'><i class='fa fa-question-circle' style='color:gray'></i>" +
        "<span class='info-tooltiptext'>Tooltip text</span>" +
      "</div>&nbsp;
      "<a class='expand-knn'>" + 
      "<i class='fa fa-caret-down fa-lg' style='color:#8A877E; cursor:pointer;'></i></a></strong>"
  tree_info_div.appendChild(hidden_knn_div)
    
  // Displayed kNN.
  var display_knn_div = document.createElement("div")
  display_knn_div.setAttribute("id", "display_knn")
  display_knn_div.innerHTML += "<br/><strong style='background-color:#e6e2d3; display:block;'>&nbsp;K-nearest tree neighbors " +
      //"<i class='fa fa-question-circle' style='color:gray'></i>&nbsp;&nbsp;" +
      "<a class='hide-knn'>" +
      "<i class='fa fa-caret-up fa-lg' style='color:#8A877E; cursor:pointer;'></i></a></strong>"
  display_knn_div.style.display = 'none'
  var knn_info_div = document.createElement("div")
  knn_info_div.setAttribute("id", "knn_info")
  tree_info_div.appendChild(display_knn_div)
  display_knn_div.appendChild(knn_info_div)

  matching_trees_map.forEach((data, id) => {
      if (id.startsWith(sample_name)) {
        async_display_tree_matching("knn_info", data)
      }
    })
  */
}

function getGeneCategoriesInNode(node) {
  var gene_categories = {}
  if (node.data.gene_events){
    gene_map = objectToMap(node.data.gene_events)
    gene_map.forEach((events, gene) => {
      events = objectToMap(events)
      events.forEach((value, event) => {
        label = event
        if (event == "CNV") {
          if (value > 0 || value == "+") {
            label = "amplified"
          }
          else {
            label = "deleted"
          }
        }
        if (!(label in gene_categories)) {
          gene_categories[label] = new Set()
        }
        gene_categories[label].add(gene)
      })
    })
  }
  return gene_categories
}

function getGeneCategoriesInTree(tree_object) {
  var node_list = getTreeNodes(tree_object)
  gene_categories = {}
  for (node of node_list) {
    node_gene_events = getGeneCategoriesInNode(node)
    for (label in node_gene_events) {
      if (!(label in gene_categories)) {
        gene_categories[label] = node_gene_events[label]
      } else {
        gene_categories[label] = gene_categories[label].union(node_gene_events[label])
      }
    }
  }
  return gene_categories
}

function getSeletedItem(select_element) {
  if(select_element.selectedIndex == 0) {
    return ""
  } else {
    return select_element.options[select_element.selectedIndex].text
  }
}

function addGeneToGeneList(html_element, gene_list, category){
  optgroup = document.createElement('optgroup')
  optgroup.label = category
  for(var gene of gene_list){
    option = document.createElement('option');
    option.textContent = gene;
    optgroup.appendChild(option);
  }
  html_element.appendChild(optgroup);
}

function getCellCountForGene(tree_object, target_gene) {
  var node_list = getTreeNodes(tree_object)
  var cell_percentage = 0
  for (let i=0; i<node_list.length; i++) {
    node = node_list[i]
    if (node.data.gene_events){
      gene_map = objectToMap(node.data.gene_events)
      if(gene_map.has(target_gene)) {
        cell_percentage += node.data.size_percent 
      }
    }
  }
  return cell_percentage
}

function getCellCountForDrugInteraction(tree_object, target_drug, drug_gene_map) {
  if(!(target_drug in drug_gene_map)) {
    return 0
  }
  var node_list = getTreeNodes(tree_object)
  var gene_list = objectToMap(drug_gene_map).get(target_drug)
  var cell_percentage = 0
  for (let i=0; i<node_list.length; i++) {
    node = node_list[i]
    if (node.data.gene_events){
      for (var gene_1 of gene_list){
        for (gene_2 in node.data.gene_events) {
          if (gene_2.includes(gene_1)) {
            cell_percentage += node.data.size_percent
          }
        }
      }
    }
  }
  return cell_percentage
}

function updateTree(event) {
  var tree_div_id = event.data.tree_div_id
  var tree_object = event.data.tree_object
  var gene_dropdown_id = event.data.gene_dropdown_id
  var drug_dropdown_id = event.data.drug_dropdown_id
  var dgi_div_id = event.data.dgi_div_id
  var gene_drug_map = event.data.gene_drug_map
  var drug_gene_map = event.data.drug_gene_map

  var gene_dropdown = document.getElementById(gene_dropdown_id)
  var target_gene = gene_dropdown.options[gene_dropdown.selectedIndex].text
  target_gene_cell_percent = getCellCountForGene(tree_object, target_gene)

  var drug_dropdown = document.getElementById(drug_dropdown_id)
  var target_drug = drug_dropdown.options[drug_dropdown.selectedIndex].text
  target_drug_cell_percent = getCellCountForDrugInteraction(tree_object, target_drug, drug_gene_map) 
  
  var drug_dropdown = document.getElementById(drug_dropdown_id)
  var target_drug = drug_dropdown.options[drug_dropdown.selectedIndex].text

  display_tree(tree_div_id, "", tree_object, target_gene, target_drug, drug_gene_map) 
  
  cell_count_div_id = "cell_count_div"
  remove_element = document.getElementById(cell_count_div_id)
  if (typeof(remove_element) != 'undefined' && remove_element != null) {
    remove_element.remove();
  }
  var cell_count_div = document.createElement("div")
  cell_count_div.setAttribute("id", cell_count_div_id)
  cell_count_div.style.textAlign = "center"
  if (target_gene_cell_percent != 0) {
    cell_count_div.innerHTML += "<br/><i>%cells affected by target gene: " + Math.round(target_gene_cell_percent*100) + "%</i>"
  }
  if (target_drug_cell_percent != 0) {
    cell_count_div.innerHTML += "<br/><i>%cells affected by target drug: " + Math.round(target_drug_cell_percent*100) + "%</i>"
  }
  document.getElementById(tree_div_id).append(cell_count_div)

  html_string = populateGeneDrugInfoHTML(target_gene, gene_drug_map) 
  document.getElementById(dgi_div_id).innerHTML = html_string
} 

function populateGeneDrugInfoHTML(target_gene, gene_drug_map) {
  if (target_gene == "") {
    return "No target gene selected.<br/>"
  }

  var drugs = gene_drug_map[target_gene]
  if (!(target_gene in gene_drug_map)) {
    gene_without_delimiter = target_gene.split(/_|-/)
    if (gene_without_delimiter.length > 1 && gene_without_delimiter[0] in gene_drug_map) {
      drugs = gene_drug_map[gene_without_delimiter[0]]
    }
    else {
      return "No drugs associated with target gene.<br/>"
    }
  }

  drugs.sort(function(a, b){return b["drug_score"] - a["drug_score"]});
  activators = []
  inhibitors = []
  others = []
  for(i=0; i<drugs.length; i++) {
    drug = drugs[i]
    if (drug.drug_score < 3) {
      continue
    }
    if(isInhibitor(drug.interaction_types)) { 
      inhibitors.push(drug)
    }
    else if (isActivator(drug.interaction_types)) {
      activators.push(drug)
    }
    else {
      others.push(drug)
    }
  }

  if (activators.length + inhibitors.length + others.length == 0) {
    return "No drugs associated with target gene in at least 3 citations.<br/>"
  }

  html_string = ""
  if(activators.length) {
    html_string += "<b><u>Activators:</u></b><br/>"
    for(i=0; i<activators.length; i++) {
      drug = activators[i]
      html_string += "<a href='https://www.dgidb.org/results?searchType=drug&searchTerms=" + drug.drug_name + 
        "' target='dgidb'>" + drug.drug_name + "</a> (" + drug.drug_score + " citations)<br/>"
    }
  }

  if(inhibitors.length) {
    html_string += "<b><u>Inhibitors:</u></b><br/>"
    for(i=0; i<inhibitors.length; i++) {
      drug = inhibitors[i]
      html_string += "<a href='https://www.dgidb.org/results?searchType=drug&searchTerms=" + drug.drug_name +
        "' target='dgidb'>" + drug.drug_name + "</a> (" + drug.drug_score + " citations)<br/>"
    }
  }

  if (others.length  && activators.length + inhibitors.length !=0) {
    html_string += "<b><u>Others:</u></b><br/>"
  }
  if(others.length) {
    for(i=0; i<others.length; i++) {
      drug = others[i]
      html_string += "<a href='https://www.dgidb.org/results?searchType=drug&searchTerms=" + drug.drug_name +
        "' target='dgidb'>" + drug.drug_name + "</a> (" + drug.drug_score + " citations)<br/>"
    }
  }
  return html_string
}

/////////////////////
//// DGIdb utils ////
/////////////////////
function parseGeneDrugInteractions(gene_drug_interaction){
  // Returns a map with gene key and drug info value.
  gene_drug_map = {}

  for(i=0; i<gene_drug_interaction["matchedTerms"].length; i++) {
    item = gene_drug_interaction["matchedTerms"][i]
    gene = item["searchTerm"]
    gene_drug_map[gene] = []
    for(j=0; j<item["interactions"].length; j++)  {
      drug = item["interactions"][j]
      drug_info = {}
      drug_info["drug_name"] = drug.drugName
      drug_info["interaction_types"] = drug.interactionTypes
      drug_info["drug_sources"] = drug.sources
      drug_info["drug_score"] = drug.score
      gene_drug_map[gene].push(drug_info)
    }
  }
  return gene_drug_map
}

function getDrugToGeneMap(gene_list, gene_drug_map) {
  var drug_gene_map = {}
  for (var gene of gene_list){
    if(gene in gene_drug_map) {
      for (var drug of gene_drug_map[gene]){
        drug_name = drug.drug_name.substring(0,30)
        if (drug_name in drug_gene_map) {
          drug_gene_map[drug_name].push(gene)
        }
        else {
          drug_gene_map[drug_name] = [gene]
        }
      }
    }
  } 
  return drug_gene_map
}

function custom_compare (drug_1, drug_2) {
  return drug_1.cnt - drug_2.cnt
}

function findDrugsAffectingGeneList(tumor_gene_list, drug_gene_map, tree_object) {
  var drug_cnt_list = []
  for(drug in drug_gene_map) {
    drug_gene_list = drug_gene_map[drug]
    var cells_affecte_by_drug = 0
    for (var tumor_gene of tumor_gene_list) {
      if (drug_gene_list.includes(tumor_gene)) {
        cells_affecte_by_drug += getCellCountForGene(tree_object, tumor_gene)
      }
    }
    if (cells_affecte_by_drug > 0) {
      drug_cnt_list.push({"drug": drug, "cnt": cells_affecte_by_drug})
    }
  }
  drug_cnt_list.sort(custom_compare).reverse()

  drug_list = []
  for(item of drug_cnt_list) {
    drug_list.push(item.drug)
  }

  return drug_list
}

function isInhibitor(interaction_types) {
  for (var interaction of interaction_types){
    string = interaction.toLowerCase()
    if(string.includes("inhibitor") || string.includes("modulator") || string.includes("antagonist")) {
      return true
    }
  }
  return false
}

function isActivator(interaction_types) {
  for (var interaction of interaction_types){
    string = interaction.toLowerCase()
    if(string.includes("activator") || string.includes("inducer") || string.includes("agonist")) {
      return true
    }
  }
  return false
}

function isAntibody(interaction_types) {
  for (var interaction of interaction_types){
    string = interaction.toLowerCase()
    if(string.includes("antibody") || string.includes("binder")) {
      return true
    }
  }
  return false
}

///////////////////////////////
//// Populate cluster info ////
///////////////////////////////
function showClusterInfo(event) {
  var cluster_bg_color = event.currentTarget.cluster_bg_color
  var cluster_metadata = event.currentTarget.cluster_metadata
  var table_color_codes = event.currentTarget.table_color_codes
  var node_intersections = event.currentTarget.node_intersections 
  var matching_nodes_details = event.currentTarget.matching_nodes_details

  var tree_info_div_id = event.currentTarget.tree_info_div_id
  var tree_info_div = document.getElementById(tree_info_div_id)
  tree_info_div.style.backgroundColor = cluster_bg_color

  tree_info_div.innerHTML = "<strong style='background-color:#d2cae6; display:block;'>&nbsp;Genes in matching nodes<br/></strong>"
  appendLineBreak(tree_info_div)
  for (match_color in matching_nodes_details) {
    tree_info_div.innerHTML += '<i class="fa fa-circle" style="font-size:18px;color:' + match_color + '"></i> &nbsp;'
    for (event in matching_nodes_details[match_color]) {
      genes = Array.from(matching_nodes_details[match_color][event]).sort()
      tree_info_div.innerHTML += event + ": " + genes.join(', ') + "; &nbsp;"
    }
    appendLineBreak(tree_info_div)
  }
  appendLineBreak(tree_info_div)
  tree_info_div.innerHTML += "<strong style='background-color:#d2cae6; display:block;'>&nbsp;Cluster metadata<br/></strong>"
  tree_info_div.appendChild(table_color_codes)
  appendLineBreak(tree_info_div)
  var metadata_table = getMetadataTable(cluster_metadata)
  tree_info_div.appendChild(metadata_table)
  appendLineBreak(tree_info_div)

}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getMetadataColorMap(sample_metadata_map) {
  metadata_color_map = {}
  for (const [sample, metadata] of Object.entries(sample_metadata_map)) {
    for (const [key, value] of Object.entries(metadata)) {
      if (!(key in metadata_color_map)) {
        metadata_color_map[key] = {}
      }
      if(!(value in metadata_color_map[key])) {
        metadata_color_map[key][value] = getRandomColor()
      }
    }
  } 
  let sample_metadata_colors = deepCopy(sample_metadata_map)
  for (const [sample, metadata] of Object.entries(sample_metadata_map)) {
    for (const [key, value] of Object.entries(metadata)) {
      sample_metadata_colors[sample][key] = metadata_color_map[key][value]
    }
  }
  return [sample_metadata_colors, metadata_color_map]
}

function getMetadataTable(metadata_samples) {
  var table = document.createElement("table")
  table.style.cssFloat = "left"
  table.style.margin = "20px"
  table.style.marginTop = "5px"

  first_row = true
  for (var row in metadata_samples){
    if(first_row) {
      first_row = false
      var tr = document.createElement('TR');
      table.appendChild(tr);
      //table.style.tableLayout="fixed"
      var td = document.createElement('TD');
      td.style.fontSize = "12px"
      tr.appendChild(td)
      td.appendChild(document.createTextNode(""))
      for (var col in metadata_samples[row]){
        var td = document.createElement('TD');
        td.style.fontSize = "13px"
        td.style.padding = "5px"
        td.style.transform = "rotate(180deg)"
        td.style.writingMode = "vertical-rl"
        td.style.whiteSpace = "nowrap" 
        td.appendChild(document.createTextNode(col));
        tr.appendChild(td)
      }
    }
    var tr = document.createElement('TR');
    table.appendChild(tr);
    var td = document.createElement('TD');
    td.style.fontSize = "13px"
    td.style.paddingRight = "2px"
    td.style.whiteSpace = "nowrap"
    tr.appendChild(td)
    td.appendChild(document.createTextNode(row));
    for (var col in metadata_samples[row]){
      var td = document.createElement('TD');
      td.style.backgroundColor=metadata_samples[row][col]
      td.appendChild(document.createTextNode(""));
      tr.appendChild(td)
    }
  }
  return table
}

function getColorCodesTable(map) {
  var table = document.createElement("table")
  table.style.cssFloat = "left"
  table.style.margin = "20px"
  table.style.marginBottom = "0px"

  max_num_columns = 0
  for (var row in map){
    max_num_columns = Math.max(max_num_columns, (map[row].size))
  }

  for (var row in map){
    var tr = document.createElement('TR');
    table.appendChild(tr);
    var td = document.createElement('TD');
    tr.appendChild(td)
    td.appendChild(document.createTextNode(row));
    td.style.fontSize = "13px"
    td.style.paddingRight = "2px"
    for (var col in map[row]){
      var td = document.createElement('TD');
      td.style.backgroundColor=map[row][col]
      td.style.textAlign="center"
      td.style.fontSize = "12px"
      td.style.paddingRight = "2px"
      td.style.paddingLeft = "2px"

      td.style.color="white"
      td.appendChild(document.createTextNode(col));
      tr.appendChild(td)
    }
  }
  return table
}

//////////////////////
//// Heatmap view ////
//////////////////////
function populateHeatmapView(args) {
  // Canvas.
  var tree_cohort_div_id = args.tree_cohort_div_id
  div_tree_cohort = document.getElementById(tree_cohort_div_id)
  div_tree_cohort.innerHTML = ""
  div_tree_cohort.style.zoom = 1

  var tree_info_div_id = args.tree_info_div_id
  div_tree_info = document.getElementById(tree_info_div_id)
  div_tree_info.style.border = "0px"
  div_tree_info.style.backgroundColor = "transparent"
  div_tree_info.innerHTML = ""


  // Data.
  data = args.data
  distances = data["heatmap_values"]
  sample_list = Object.keys(data["trees"])
  clusters = [sample_list]
  if ("clusters" in data) {
    clusters = args.data["clusters"]
    sample_list = []
    for (cluster of clusters) {
      for (sample_name of cluster) {
        sample_list.push(sample_name)
      }
    }
  }
  
  // Visualization.
  var tooltip = d3.select("div#" + tree_cohort_div_id)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "3px")
    .style("visibility", "hidden")
    .style("display", "none")

  var margin = {top: 30, right: 80, bottom: 80, left: 50},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  var svg = d3.select("#" + tree_cohort_div_id)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Build X scales and axis.
  var x = d3.scaleBand()
    .range([0, width])
    .domain(sample_list)
    .padding(0)
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,10)rotate(-90)")
      .style("text-anchor", "end")
      .style("font-size", 6)

  // Build Y scales and axis/
  var y = d3.scaleBand()
    .range([0, height])
    .domain(sample_list)
    .padding(0);
  svg.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
      .style("font-size", 6)

  vmin = 1
  vmax = 0
  distances.forEach(function(item) {
    if (parseFloat(item.distance) > vmax) {
      vmax = parseFloat(item.distance)
    }
    if (parseFloat(item.distance) < vmin) {
      vmin = parseFloat(item.distance)
    }
  })
   
  // Build color scale
  legend_colors = ['#073B6F', '#0b559f', '#2b7bba', '#539ecd', '#89bedc', '#bad6eb', '#dbe9f6'] // Seaborn Blues
  var myColor = d3.scaleLinear()
    .range(legend_colors)
    .domain(linspace(vmin,vmax, 7))

  svg.selectAll()
    .data(distances) 
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.sample_1) })
      .attr("y", function(d) { return y(d.sample_2) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .style("fill", function(d) { return myColor(d.distance)} )
    .on('mousemove', function(d) {
      tooltip
        .html("&nbsp;Distance b/w " + d.sample_1 + " & " + d.sample_2 + ": " + Math.round(d.distance * 100) / 100 + "&nbsp;") 
        .style("left", (d3.mouse(this)[0]) + "px")
        .style("top", (d3.mouse(this)[1] + 50) + "px")
        .style("visibility", "visible")
        .style("display", "block")
        .style("position", "absolute")
        .style("z-index" ,10)
        .style("font-size", "10px") 
    })
    .on('mouseover', function(d) {
      tooltip.style("opacity", 1)
    })
    .on('mouseleave', function() {
      tooltip.style("opacity", 0)
        .style("visibility", "hidden")
        .style("display", "none") 
    })

  cluster_starts = {}
  for(i=0; i<clusters.length; i++) {
    cluster_starts[clusters[i][0]] = clusters[i].length
  }

  svg.selectAll()
    .data(distances)
    .enter()
    .append("rect")
      .attr("x", function(d) {
        if (d.sample_1 in cluster_starts && d.sample_1 == d.sample_2 && cluster_starts[d.sample_1] > 1) {
          return x(d.sample_1)
        }
      })
      .attr("y", function(d) {
        if (d.sample_1 in cluster_starts && d.sample_1 == d.sample_2 && cluster_starts[d.sample_1] > 1) {
          return y(d.sample_1)
        }
      })
      .attr("width", function(d) {
        if (d.sample_1 in cluster_starts && d.sample_1 == d.sample_2 && cluster_starts[d.sample_1] > 1) {
          return  cluster_starts[d.sample_1] * x.bandwidth()
        }
      })
      .attr("height", function(d) {
        if (d.sample_1 in cluster_starts && d.sample_1 == d.sample_2 && cluster_starts[d.sample_1] > 1) {
          return  cluster_starts[d.sample_1] * x.bandwidth()
        }
      })
      .style("fill", "none")
      .style("stroke", "#0b559f")
      .style("stroke-width", "3")

  // Color legend
  var grad = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'grad')
    .attr('x1', '0%')
    .attr('x2', '0%')
    .attr('y1', '0%')
    .attr('y2', '100%');

  grad.selectAll('stop')
    .data(legend_colors)
    .enter()
    .append('stop')
    .style('stop-color', function(d){ return d; })
    .attr('offset', function(d,i){
      return 100 * (i / (legend_colors.length - 1)) + '%';
    })

  svg.append('rect')
    .attr('x', width + 10)
    .attr('y', 0)
    .attr('width', 25)
    .attr('height', 150)
    .style('fill', 'url(#grad)');
  
  svg.append("text")
    .attr("id", "rectangleText")
    .attr("class", "visible")
    .attr("x", width + 12)
    .attr("y", -5) 
    .attr("width",100)
    .style("font-size", "10px")
    .text("max");

  svg.append("text")
    .attr("id", "rectangleText")
    .attr("class", "visible")
    .attr("x", width + 13)
    .attr("y", 163) 
    .attr("width",100)
    .style("font-size", "10px")
    .text("min");

  svg.append("text")
    .attr("id", "rectangleText")
    .attr("class", "visible")
    .attr("x", -37)
    .attr("y", width + 36)
    .attr("transform", "translate(-10, 10) rotate(-90)")
    .style("text-anchor", "end")
    .attr("width",100)
    .style("font-size", "15px")
    .attr("fill", "white")
    .text("similarity");
}

///////////////////
//// UMAP view ////
///////////////////
function populateUMAPView(args) {
  // Canvas.
  var tree_cohort_div_id = args.tree_cohort_div_id
  div_tree_cohort = document.getElementById(tree_cohort_div_id)
  div_tree_cohort.innerHTML = ""
  div_tree_cohort.style.zoom = 1

  var tree_info_div_id = args.tree_info_div_id
  div_tree_info = document.getElementById(tree_info_div_id)
  div_tree_info.style.border = "0px"
  div_tree_info.style.backgroundColor = "transparent"
  div_tree_info.innerHTML = ""

  // Data.
  distances = args.data["heatmap_values"]
  var opt = {epsilon: 10}; // epsilon is learning rate (10 = default)
  var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
  var sample_id_map = {}
  distances.forEach(function(item) {
    sample = item["sample_1"]
    if (!(sample in sample_id_map)) {
      sample_id_map[sample] = Object.keys(sample_id_map).length
    }
  })

  var samples = Object.keys(sample_id_map)
  var num_samples = samples.length
  var id_sample_map = {}
  for (var sample in sample_id_map) {
    id_sample_map[sample_id_map[sample]] = sample
  }

  matrix=Array(num_samples).fill(Array(num_samples).fill(0))
  distances.forEach(function(item) {
    i = sample_id_map[item["sample_1"]]
    j = sample_id_map[item["sample_2"]]
    matrix[i][j] = parseFloat(item.distance)
  })

  tsne.initDataDist(matrix);
 
  for(var k = 0; k < 500; k++) {
    tsne.step(); // every time you call this, solution gets better
  }
 
  var points = tsne.getSolution()
  var point_map = points.map(function (item, idx) { 
    return { 
      "x": item[0], 
      "y": item[1], 
      "color": data["trees"][samples[idx]]["cluster_color"], 
      "sample_name": samples[idx]
    } 
  });

  // Render the plot.
  var margin = {top: 30, right: 80, bottom: 80, left: 50},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  var svg = d3.select("#" + tree_cohort_div_id)
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  minX = 10000000
  maxX = -10000000
  minY = 10000000
  maxY = -10000000
  point_map.forEach(function(item) {
    if (parseFloat(item.x) > maxX) {
      maxX = parseFloat(item.x)
    }
    if (item.x < minX) {
      minX = parseFloat(item.x)
    }
    if (parseFloat(item.y) > maxY) {
      maxY = parseFloat(item.y)
    }
    if (parseFloat(item.y) < minY) {
      minY = parseFloat(item.y)
    }
  })

  minX = minX - 1
  maxX = maxX + 1
  minY = minY - 1
  maxY = maxY + 1

  // Add X axis
  var x = d3.scaleLinear()
    .domain([minX, maxX])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([minY, maxY])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(point_map)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.x); } )
      .attr("cy", function (d) { return y(d.y); } )
      .attr("r", 4)
      .style("fill", function (d) { return d.color; } )
      .on("click", function(d){
        showTreeInfo(d.sample_name, args)
      })

}

/// NOT USED

function getSampleNames(sample_data) {
  return sample_data.map(s => s.sample_name)
}

function getCancerTypesSet(sample_data) {
  var cancer_types_set = new Set()
  for (key in sample_data) {
    cancer_types_set.add(sample_data[key].cancer_type)
  }
  return cancer_types_set
}

function getSamples(sample_data){
  array = []
  for (key in sample_data) {
    array.push(sample_data[key])
  }
  return array
}

function getSamplesByCancerType(sample_data, cancer_type){
  filtered_output = []
  for (key in sample_data) {
    var sample = sample_data[key]
    if(sample.cancer_type == cancer_type) {
      filtered_output.push(sample)
    }
  }
  return filtered_output
}

function getAllAffectedGenes(all_samples){

  var affected_genes = new Set()
  for (key in all_samples) {
    all_samples[key]["all_affected_genes"].forEach(affected_genes.add, affected_genes)
  }
  return Array.from(affected_genes)
}

function getMapKeys(map){
  list = []
  for (key in map) {
    list.push(key)
  }
  return list
}
