// @TODO: YOUR CODE HERE!


let svgWidth = 960;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group

let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

let chosenXaxis = "poverty"

function Xscale(data, chosenXaxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXaxis]) * 0.8,
        d3.max(data, d => d[chosenXaxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}


function renderAxes(newXscale, xAxis) {
    let bottomAxis = d3.axisBottom(newXscale)

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXaxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXaxis, circlesGroup) {

    let label;

    if (chosenXaxis === "poverty") {
        label = "Poverty:";
    }
    else {
        label = "Age(Median):";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([30, -40])
        .html(function (d) {
            return (`${label}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}



d3.csv("data.csv").then(function (censusData, err) {
    if (err) throw err;

    // parse data
    censusData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.healthcare = +data.healthcare;

    });

    // xLinearScale function above csv import
    let xLinearScale = Xscale(censusData, chosenXaxis);

    // Create y scale function
    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d.healthcare)])
        .range([height, 0]);

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);


    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 10)
        .attr("fill", "blue")
        .attr("opacity", ".5");

    // Create group for two x-axis labels
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty(%)");

    let ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age(Median)");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        //.classed("axis-text", true)
        .text("Lacks Healthcare(%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXaxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            let value = d3.select(this).attr("value");
            if (value !== chosenXaxis) {

                // replaces chosenXAxis with value
                chosenXaxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = Xscale(censusData, chosenXaxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXaxis, circlesGroup);


                // changes classes to change bold text
                if (chosenXaxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});


