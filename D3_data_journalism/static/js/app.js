let svgWidth = 780;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 90,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold chart
let svg = d3
    .select("#scatter")
    .classed('chart', true)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

//Retrieve data from the CSV file
d3.csv("data.csv").then(function (usData) {

    // Parse Data
    usData.forEach(function (data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    // Create scale functions
    let xLinearScale = d3.scaleLinear()
        .domain([8 * 0.9, d3.max(usData, d => d.poverty) * 1.1])
        .range([0, width]);

    let yLinearScale = d3.scaleLinear()
        .domain([3 * 0.9, d3.max(usData, d => d.healthcare) * 1.1])
        .range([height, 0]);

    // Create axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    //Append Axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Create Circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(usData)
        .enter()
        .append("circle")
        .attr("class", "stateCircle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "10")
        .attr("opacity", "0.8")

    // Append text inside circles
    chartGroup.append("text")
        .selectAll("tspan")
        .data(usData)
        .enter()
        .append("tspan")
        .attr("class", "stateText")
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare) + 3)
        .text(d => d.abbr)

    //Initialize tool tip
    let toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([9, -10])
        .html(function (d) {
            return (`${d.state}<br>Poverty: ${d.poverty}%<br>Lacks Healthcare: ${d.healthcare}%`);
        });

    //Create tooltip in the chart

    chartGroup.call(toolTip);

    //Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .text("Lacks Healthcare(%)");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "aText")
        .text("In Poverty(%)");
}).catch(function (error) {
    console.log(error);

})