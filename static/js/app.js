function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
    
    /* data route */
    // @app.route("/metadata/<sample>")
    var url = "/metadata/" + sample;

  // Use `d3.json` to fetch the metadata for a sample
    d3.json(url).then(function(response) {
        console.log(response);
    
    // Use d3 to select the panel with id of `#sample-metadata`
    // <div id="sample-metadata" class="panel-body">
        var meta_panel = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
        meta_panel.html("");

    // Use `Object.entries` to add each key and value pair to the panel
        var meta = Object.entries(response);
    // Hint: Inside the loop, you will need to use d3 to append new
        console.log(meta);
    // tags for each key-value in the metadata.
        meta.forEach(function(row) {
            meta_panel.append("p").text(`${row[0]}:${row[1]}`);
        });
    

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    // <div id="gauge">
    });
}

function buildCharts(sample) {

    /* data route */
    // @app.route("/metadata/<sample>")
    var url = "/samples/" + sample;
    
  // @TODO: Use `d3.json` to fetch the sample data for the plots
    d3.json(url).then(function(response) {
        console.log(response);

    // @TODO: Build a Bubble Chart using the sample data
    // <div id="bubble">
        //Use otu_ids for the x values
        var otu_ids = response.otu_ids;
        //Use sample_values for the y values
        var sample_values = response.sample_values;
        //Use sample_values for the marker size
        //Use otu_ids for the marker colors
        //Use otu_labels for the text values
        var otu_labels = response.otu_labels;
        var trace1 = {
            x: otu_ids,
            y: sample_values,
            text: otu_labels,
            mode: 'markers',
            marker: {
                size: response.sample_values,
                color: response.otu_ids,
                colorscale: 'Viridis'
            }
            };

        var data1 = [trace1];

        var layout1 = {
            title: `Sample ${sample}: bacteria abundance vs bacteria id`,
            showlegend: false,
            xaxis: {title: 'sample id'},
            yaxis: {title: 'abundance'}
        };

        Plotly.newPlot('bubble', data1, layout1, {responsive: true});
        

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    // <div id="pie">
        var sort_response = [];
        sample_values.forEach(function(value,index) {
            sort_response[index] = {otu_id: otu_ids[index], 
                                   sample_value: value,
                                  otu_label: otu_labels[index]
                                  };
        });
              // for the color scheme find the max id
        var max_otu_id = d3.max(sort_response, function(d) { return d.otu_id; })
        sort_response.sort(function(a, b){
            return b.sample_value - a.sample_value});
        console.log(sort_response);
        var top_response = sort_response.slice(0,10);
        // make the color scheme for the top 10 match the colorscheme of the scatter plot
        var color = []
        top_response.forEach(function(data,index) {
            var otu_id = data.otu_id;
            color[index] = d3.interpolateViridis(otu_id/max_otu_id);
        });
        
        var data2 = [{
            values: top_response.map(data => data.sample_value),
            labels: top_response.map(data => data.otu_id),
            hovertext: top_response.map(data => data.otu_label),
            type: 'pie',
            marker: {
                colors: color
            }
        }];

        var layout2 = {
            title: `Sample ${sample}: Top 10 most abundant bacteria`,
        };

        Plotly.newPlot('pie', data2, layout2, {responsive: true});
        
        
    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
