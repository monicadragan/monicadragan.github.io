
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Read sample_map
function loadSampleMap(filename){
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

////////////////////////
//// UTILS METADATA ////
////////////////////////

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function get_metadata_color_map(sample_metadata_map) {
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

function display_metadata(document, metadata_samples) {
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
      table.style.tableLayout="fixed"
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

function display_color_codes(document, map) {
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

/////////////////
// DGIDB UTILS //
/////////////////

// Returns a map with gene key and drug info value.
function parseGeneDrugInteractions(gene_drug_interaction){
  gene_to_drug_map = {}

  for(i=0; i<gene_drug_interaction["matchedTerms"].length; i++) {
    item = gene_drug_interaction["matchedTerms"][i]
    gene = item["searchTerm"] 
    gene_to_drug_map[gene] = []
     
    for(j=0; j<item["interactions"].length; j++)  {
      drug = item["interactions"][j]
      drug_info = {}
      drug_info["drug_name"] = drug.drugName
      drug_info["interaction_types"] = drug.interactionTypes
      drug_info["drug_sources"] = drug.sources
      drug_info["drug_score"] = drug.score
      gene_to_drug_map[gene].push(drug_info)  
    }
  }

  return gene_to_drug_map
}

function getDrugToGeneMap(gene_list, gene_to_drug_map) {
  var drug_gene_map = {}
  for (var gene of gene_list){
    if(gene in gene_to_drug_map) {
      for (var drug of gene_to_drug_map[gene]){
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
