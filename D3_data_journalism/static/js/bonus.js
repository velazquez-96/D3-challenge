// @TODO: YOUR CODE HERE!


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

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.

let svg = d3
    .select("#scatter")
    .attr("class", "chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group

let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

// Initial Params
let chosenXaxis = "poverty"
let chosenYaxis = "healthcare"

// function used for updating x-scale var upon click on axis label
function Xscale(usData, chosenXaxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(usData, d => d[chosenXaxis]) * 0.9,
        d3.max(usData, d => d[chosenXaxis]) * 1.1
        ])
        .range([0, width]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function Yscale(usData, chosenYaxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(usData, d => d[chosenYaxis]) * 0.9,
        d3.max(usData, d => d[chosenYaxis]) * 1.1
        ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating x axis var upon click on axis label
function renderAxes(newXscale, xAxis) {
    let bottomAxis = d3.axisBottom(newXscale)

    xAxis.transition()
        .duration(500)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating y axis var upon click on axis label
function renderYaxes(newYscale, yAxis) {
    let leftAxis = d3.axisLeft(newYscale)

    yAxis.transition()
        .duration(500)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {

    circlesGroup.transition()
        .duration(500)
        .attr("cx", d => newXScale(d[chosenXaxis]))
        .attr("cy", d => newYScale(d[chosenYaxis]));

    return circlesGroup;
}

// function used for updating text inside cirlces with transition 
function renderTtxLabels(textGroup, newXScale, chosenXaxis, newYScale, chosenYaxis) {
    textGroup.transition()
        .duration(500)
        .attr("x", d => newXScale(d[chosenXaxis]))
        .attr("y", d => newYScale(d[chosenYaxis]) + 3);

    return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXaxis, circlesGroup, chosenYaxis) {

    let label;
    let labelY;

    //X labels
    if (chosenXaxis === "poverty") {
        label = "Poverty: ";
    } else if (chosenXaxis === "age") {
        label = "Age(Median): ";
    }
    else {
        label = "Income: ";
    }

    // Y labels
    if (chosenYaxis === "healthcare") {
        labelY = "Lacks Healthcare: "
    } else if (chosenYaxis === "smokes") {
        labelY = "Smokes: "
    } else {
        labelY = "Obesity: "
    }

    // Text inside tooltip depending of y and x labels
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8.5, 0])
        .html(function (d) {
            return (`${d.state}<br>${label} ${d[chosenXaxis]} <br>${labelY} ${d[chosenYaxis]}`);
        });

    circlesGroup.call(toolTip);

    // On mouse events, showing and hiding tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file
d3.csv("data.csv").then(function (usData, err) {
    if (err) throw err;

    // parse data
    usData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.income = +data.income
        data.smokes = +data.smokes
        data.obesity = +data.obesity;

    });

    // xLinearScale function above csv import
    let xLinearScale = Xscale(usData, chosenXaxis);

    // Create y scale function
    let yLinearScale = Yscale(usData, chosenYaxis)

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .call(leftAxis);
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(usData)
        .enter()
        .append("circle")
        .attr("class", "stateCircle")
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r", 12)
        .attr("opacity", "0.6")

    // append initial text inside circles
    var textGroup = chartGroup.append("text")
        .selectAll("tspan")
        .data(usData)
        .enter()
        .append("tspan")
        .attr("class", "stateText")
        .attr("x", d => xLinearScale(d[chosenXaxis]))
        .attr("y", d => yLinearScale(d[chosenYaxis]) + 3)
        .text(d => d.abbr)

    // Create group for x-axis labels
    let labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 30})`);

    let povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .attr("class", "active")
        .text("In Poverty(%)");

    let ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age(Median)");

    let incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income(Median)");

    // Create group for y-axis labels
    let labelsGroupY = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left / 5}, ${height / 2})`);

    let healthcareLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 20)
        .attr("x", 0)
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare(%)");

    let smokeLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 40)
        .attr("x", 0)
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes(%)");

    let obeseLabel = labelsGroupY.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 60)
        .attr("x", 0)
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obesity(%)");

    // updateToolTip function 
    var circlesGroup = updateToolTip(chosenXaxis, circlesGroup, chosenYaxis);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            let value = d3.select(this).attr("value");
            if (value !== chosenXaxis) {

                // replaces chosenXAxis with value
                chosenXaxis = value;

                console.log(chosenXaxis)

                // updates x scale for new data
                xLinearScale = Xscale(usData, chosenXaxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXaxis, circlesGroup, chosenYaxis);

                // Update text circles 
                textGroup = renderTtxLabels(textGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

                // changes classes to change bold text
                if (chosenXaxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXaxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        })

    // y axis labels event listener
    labelsGroupY.selectAll("text")
        .on("click", function () {
            // get value of selection
            let value = d3.select(this).attr("value");
            if (value !== chosenYaxis) {

                // replaces chosenXAxis with value
                chosenYaxis = value;

                console.log(chosenYaxis)

                // updates y scale for new data
                yLinearScale = Yscale(usData, chosenYaxis);

                // updates y axis with transition
                yAxis = renderYaxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXaxis, circlesGroup, chosenYaxis);

                // Update text circles
                textGroup = renderTtxLabels(textGroup, xLinearScale, chosenXaxis, yLinearScale, chosenYaxis);

                // changes classes to change bold text
                if (chosenYaxis === "smokes") {
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYaxis === "obesity") {
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        })
}).catch(function (error) {
    console.log(error);
});

