import React, { Component } from 'react'
import * as d3 from 'd3'
class Graph extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    this.drawHistogramChart()
  }

  componentDidUpdate() {
    d3.select("#canvas").selectAll("*").remove()
    if(this.props.type == 'histogram'){
      this.drawHistogramChart()
    } else {
      this.drawBarPLot()
    }
  }

  drawBarPLot(){
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 20, left: 50},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#canvas")
      .append("svg")
        .attr('viewBox','0 0 '+ 800 +' '+ 500)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
      
      var data = this.props.data

      // List of subgroups = header of the csv files = soil condition here
      var subgroups =  this.props.subgroups

      // List of groups = species here = value of the first column called group -> I show them on the X axis
      var groups = d3.map(data, function(d){return(d.group)}).keys()
      // Add X axis
      var x = d3.scaleBand()
          .domain(groups)
          .range([0, width])
          .padding([0.2])
  
      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, data.length > 20 ? 800/(data.length) : (data.length > 10 ?  400/(data.length) : 200/(data.length) ) ])
        .range([ height, 0 ]);
      svg.append("g")
        .call(d3.axisLeft(y));

      // Another scale for subgroup position?
      var xSubgroup = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding([0.05])

      // color palette = one color per subgroup
      var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#69b3a2','#404080'])

      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -40)
        .attr("dy", ".75em")
        .attr("x", -150)
        .attr("dx", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Frecuencia");

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)).attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-size", "1.25em")
        .attr("transform", "rotate(-45)");

      // Show the bars
      svg.append("g")
        .selectAll("g")
        // Enter in data = loop group per group
        .data(data)
        .enter()
        .append("g")
          .attr("transform", function(d) { return "translate(" + x(d.group) + ",0)"; })
        .selectAll("rect")
        .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
        .enter().append("rect")
          .attr("x", function(d) { return xSubgroup(d.key); })
          .attr("y", function(d) { return y(d.value); })
          .attr("width", xSubgroup.bandwidth())
          .attr("height", function(d) { return height - y(d.value); })
          .attr("fill", function(d) { return color(d.key); });
        svg.append("circle").attr("cx",580).attr("cy",30).attr("r", 6).style("fill", "#69b3a2")
        svg.append("circle").attr("cx",580).attr("cy",60).attr("r", 6).style("fill", "#404080")
        svg.append("text").attr("x", 600).attr("y", 30).text("Ingresa").style("font-size", "18px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 600).attr("y", 60).text("No ingresa").style("font-size", "18px").attr("alignment-baseline","middle")
  }
  
  drawHistogramChart() {
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#canvas")
      .append("svg")
        .attr('viewBox','0 0 '+ 800 +' '+ 500)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    var data = this.props.data

    // X axis: scale and draw:
    var x = d3.scaleLinear()
        .domain([d3.min(data, function(d) { return +d.value })*0.85,d3.max(data, function(d) { return +d.value })*1.15])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)).attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-size", "1.25em")
        .attr("transform", "rotate(-45)");
  
    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return +d.value; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(20)); // then the numbers of bins
  
    // And apply twice this function to data to get the bins.
    var bins1 = histogram(data.filter( function(d){return d.type === 1} ));
    var bins2 = histogram(data.filter( function(d){return d.type === 0} ));
  
    // Y axis: scale and draw:
    var y = d3.scaleLinear()
        .range([height, 0]);
        y.domain([0, d3.max(bins1, function(d) { return d.length + 20; })]);   // d3.hist has to be called before the Y axis obviously
    svg.append("g")
        .call(d3.axisLeft(y));
  
    // append the bars for series 1
    svg.selectAll("rect")
        .data(bins1)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#69b3a2")
          .style("opacity", 0.6)
  
    // append the bars for series 2
    svg.selectAll("rect2")
        .data(bins2)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "#404080")
          .style("opacity", 0.6)
  
    svg.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", -40)
      .attr("dy", ".75em")
      .attr("x", -150)
      .attr("dx", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Frecuencia");
    // Handmade legend
    svg.append("circle").attr("cx",580).attr("cy",30).attr("r", 6).style("fill", "#69b3a2")
    svg.append("circle").attr("cx",580).attr("cy",60).attr("r", 6).style("fill", "#404080")
    svg.append("text").attr("x", 600).attr("y", 30).text("Ingresa").style("font-size", "18px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 600).attr("y", 60).text("No ingresa").style("font-size", "18px").attr("alignment-baseline","middle")
  }
  render() { return <div id="canvas" ref="canvas"></div> }
}
export default Graph