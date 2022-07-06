/* 
Alexandra Plage, 2022
*/

// Plots in D3.js
function project(){

    // data management
    let filePath="data.csv";
    let rowConverter = function(d){
        return {
            Country: d.Country,
            Region: d.Region,
            Code: d.Code,
            Year: parseInt(d.Year),
            HDI_Rank: parseInt(d.HDI_Rank),
            HDI_Score: parseFloat(parseFloat(d.HDI_Score).toFixed(3)),
            Happiness_Rank: parseInt(d.Happiness_Rank),
            Happiness_Score: parseFloat(parseFloat(d.Happiness_Score).toFixed(3)),
            Family: parseFloat(parseFloat(d.Family).toFixed(3)),
            Economy: parseFloat(parseFloat(d.Economy).toFixed(3)),
            Freedom: parseFloat(parseFloat(d.Freedom).toFixed(3)),
            Health: parseFloat(parseFloat(d.Health).toFixed(3)),
            Trust: parseFloat(parseFloat(d.Trust).toFixed(3)),
            Generosity: parseFloat(parseFloat(d.Generosity).toFixed(3)),
        }         
    }

    // world regions and associated colors
    arrayRegion = ["Western Europe","Central and Eastern Europe",
        "Middle East and Northern Africa","Sub-Saharan Africa",
        "Central and Southern Asia","Eastern Asia",
        "Latin America and Caribbean","North America","Oceania"];
    arrayColor = ["#53D5D7","#3D388F","orange","sienna","darkgreen",
        ,"#C4F2CE","salmon","purple","firebrick","black"]

    function colorRegion(region){
        for (let i=0; i<arrayRegion.length; i++){
            if (region == arrayRegion[i]){
                return arrayColor[i];
            }
        }
        return arrayColor[9];
    }
    
    // display text
    document.getElementById("divPlots").style.display = 'block';
    document.getElementById("clickButton").style.display = 'none';
    // plots
    plot_choropleth(filePath,rowConverter);
    plot_bins(filePath,rowConverter);
    plot_barplot(filePath,rowConverter,colorRegion);
    plot_stackedbars(filePath,rowConverter);
    plot_scatterplot(filePath,rowConverter,colorRegion);
    
}

/* 
Choropleth
*/
let plot_choropleth=function(filePath,rowConverter){
    
    // creating svg
    let margin = {top: 30, right: 30, bottom: 50, left: 20},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    let svg = d3.select("#q1_plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform","translate("+margin.left+","+margin.top+")");

    // reading data
    d3.csv(filePath,rowConverter).then(data=>{
        document.getElementById("instructions").innerHTML = 
        "&#128161 Click on a dot to zoom in into a specific world region!";

        // color scale
        filter2019 = d3.filter(data, d => d.Year == 2019);
        let colors = d3.scaleSequential().range(['orange', "blue"])
                    .domain([d3.min(filter2019,function(d)
                        {return d.HDI_Score}),
                    d3.max(filter2019,function(d){return d.HDI_Score})]);
        let colorLegend = [0.9,0.8,0.7,0.6,0.5,0.4,0.3];
        let textLegend = ['> 0.9','0.8 - 0.9','0.7 - 0.8','0.6 - 0.7',
                         '0.5 - 0.6','0.4 - 0.5','< 0.4','no data available'];
        
        // returns hdi score of a country given its name
        function hdiGivenCountry(name,text = 0){
            for (let i=0; i<filter2019.length;i++){
                if (name == filter2019[i].Country){
                    return filter2019[i].HDI_Score;
                }
                // handling name issues
                else if (name == "The Bahamas"){
                    return d3.filter(filter2019,
                        d => d.Country == "Bahamas")[0].HDI_Score;}
                else if (name == "Republic of the Congo"){
                    return d3.filter(filter2019, 
                        d => d.Country == "Democratic Republic of the Congo")[0].HDI_Score;}
                else if (name == "Czech Republic"){
                    return d3.filter(filter2019, 
                        d => d.Country == "Czechia")[0].HDI_Score;}
                else if (name == "England"){
                    return d3.filter(filter2019, 
                        d => d.Country == "United Kingdom")[0].HDI_Score;}
                else if (name == "Guinea Bissau"){
                    return d3.filter(filter2019, 
                        d => d.Country == "Guinea-Bissau")[0].HDI_Score;}
                else if (name == "Republic of Serbia"){
                    return d3.filter(filter2019, 
                        d => d.Country == "Serbia")[0].HDI_Score;}
                else if (name == "Swaziland"){
                    return d3.filter(filter2019, 
                        d => d.Country == "Eswatini")[0].HDI_Score;}
                else if (name == "East Timor"){
                    return d3.filter(filter2019, 
                        d => d.Country == "Timor-Leste")[0].HDI_Score;}
                else if (name == "United Republic of Tanzania"){
                    return d3.filter(filter2019, 
                        d => d.Country == "Tanzania")[0].HDI_Score;}
                else if (name == "USA"){
                    return d3.filter(filter2019, 
                        d => d.Country == "United States")[0].HDI_Score;}
            }
            // if text is wanted
            if (text == 1){
                return "no data available";
            }
            // if number is wanted
            else return 0;
        }

        // creating geomap    
        let projection = d3.geoNaturalEarth1().scale(160)
                            .translate([width/2-80,height/2]);
        let pathgeo = d3.geoPath().projection(projection);
        let worldmap = d3.json("world.json");

        // creating tooltip
        let tooltip = d3.select("body").append("div").attr("class","tooltip")
                        .style("opacity", 0)
                        .style("background", "black")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("padding", "5px");

        // map management
        worldmap.then(function(map) {

            // adding colors to the map
            let land = svg.selectAll("path").data(map.features).enter()
                            .append("path").attr("d", pathgeo)
                            .attr("fill",function(d){
                                if (hdiGivenCountry(d.properties.name) == 0){
                                    return "lightgrey";}
                                else {
                                    return colors(hdiGivenCountry(d.properties.name))}})
                            .style("stroke","black").style("stroke-width","0.8")
                            .attr("fill-opacity", 1)
            
            // how to display map when zoomed in
            function zoomIn(region) {
                d3.transition().duration(800)
                dots.attr("fill-opacity", 0);
                if (region == 'EU') 
                    {projection.scale(500).translate([width/2.5, height/0.8]);}
                else if (region == 'NA') 
                    {projection.scale(400).translate([width, height]);}
                else if (region == 'SA') 
                    {projection.scale(400).translate([width/1.2, height/6]);}
                else if (region == 'AF')   
                    {projection.scale(400).translate([width/2.8, height/2]);}
                else if (region == 'AS') 
                    {projection.scale(400).translate([width/50, height]);}
                else if (region == 'OC') 
                    {projection.scale(400).translate([-150, height/5]);};
    
                pathgeo = d3.geoPath().projection(projection);
                land.attr("d", pathgeo);
            }

            // creating the legend
            let labelLegend = ['HDI Index'];
            // white background rectangle
            svg.selectAll("rectLegendBackground").data(labelLegend).enter()
                .append("rect")
                .attr("x", width -4*margin.right)
                .attr("y", 12)
                .attr("width", 130)
                .attr("height", 190)
                .style("fill", "aliceblue")
                .style("stroke", "black");
            // colored rectangles for legend
            svg.selectAll("rectLegend").data(colorLegend).enter()
                .append("rect")
                .attr("x", width -4*margin.right+10)
                .attr("y", function(d,i){ return 50+i*17})
                .attr("width", 12)
                .attr("height", 17)
                .style("fill", function(d,i){return colors(colorLegend[i])});
            // grey colored rectangle for legend
            svg.selectAll("rectLegendGrey").data(labelLegend).enter()
                .append("rect")
                .attr("x", width -4*margin.right+10)
                .attr("y",173)
                .attr("width", 12).attr("height", 17)
                .style("fill", "lightgrey");
            // text indicating score related to colors
            svg.selectAll("textLegend").data(textLegend).enter()
                .append("text")
                .attr("x", width -4*margin.right+30)
                .attr("y", function(d,i){ return 58 + i*17.7})
                .text(function(d){return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("font-size","12px");
            // title for legend
            svg.selectAll("textLegendLabel").data(labelLegend).enter()
                .append("text")
                .attr("x", width -4*margin.right+10)
                .attr("y",30)
                .text(function(d){return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("font-size","15px");

            // creating dots to click
            let regions = [
                {region:'NA', x: 170, y:170},
                {region:'SA', x: 250, y:300},
                {region:'EU', x: 430, y:120},
                {region:'AF', x: 440, y:250},
                {region:'AS', x: 600, y:170},
                {region:'OC', x: 720, y:300}]
            let dots = svg.selectAll("regionCircles").data(regions)
                            .enter().append("circle")
                            .attr("cx", function(d){ return d.x})
                            .attr("cy", function(d){ return d.y})
                            .attr("r", 10).style("fill", "aliceblue");
            // animation when specific dot is clicked
            dots.on("click", function(e,d) {
                zoomIn(d.region);
                document.getElementById("instructions").innerHTML = 
                "&#128161 In order to go back to the world map, simply double click on the map!";
                dotIsClicked = this;
            }) 

            // when double click, zoom out again
            land.on("dblclick",function(d){
                document.getElementById("instructions").innerHTML = 
                "&#128161 Click on a dot to zoom in into a specific world region!";
                projection = d3.geoNaturalEarth1().scale(160)
                                .translate([width/2-80,height/2]);
                pathgeo = d3.geoPath().projection(projection);
                land.attr("d", pathgeo); 
                svg.selectAll("path").attr("fill-opacity", 1);
                tooltip.style("opacity", 0);
                dots.attr("fill-opacity", 1);
             });
            
            // animation when hoovering over specific country
            land.on("mouseover", function(e,d) {		
                svg.selectAll("path").attr("fill-opacity", 0.7);
                d3.select(this).attr("fill-opacity", 1);
                tooltip.html(d.properties.name + ": " +
                         hdiGivenCountry(d.properties.name,1))
                        .style("opacity", .9).style("color","white")	
                        .style("left", (e.pageX) + "px")
                        .style("top", (e.pageY - 28) + "px");})					
                .on("mouseout", function(e,d) {	
                    svg.selectAll("path").attr("fill-opacity", 1);
                    tooltip.style("opacity", 0);});             
            });
    })
}

/*
Bin plot
*/
let plot_bins=function(filePath,rowConverter){

    // creating svg
    let margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    let svg = d3.select("#q2_plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    // reading data
    d3.csv(filePath, rowConverter).then(data=>{

        // filtering years
        filterAllYears = d3.filter(data, 
            d => d.Year == 1990 | 1995 | 2000 | 2005 | 2010 | 2015 | 2019);
        const arrayYears = ["1990","1995","2000","2005","2010","2015","2019"]

        // computing quartiles, median, inter quantile range min and max 
        // these info are then used to draw the box
        let sumstat = [];
        for (let i = 0; i< arrayYears.length;i++){
            filterYear = d3.filter(data, d => d.Year == parseInt(arrayYears[i]));
            q1 = d3.quantile(filterYear.map(
                function(g) {return g.HDI_Score;})
                .sort(d3.ascending),0.25);
            median = d3.quantile(filterYear.map(
                function(g) {return g.HDI_Score;})
                .sort(d3.ascending),0.5);
            q3 = d3.quantile(filterYear.map(
                function(g) {return g.HDI_Score;})
                .sort(d3.ascending),.75);
            interQuantileRange = q3-q1;
            min = d3.min(filterYear,function(d){return d.HDI_Score;});
            max = d3.max(filterYear,function(d){return d.HDI_Score;});
            value = {        
                q1: q1,
                median: median,
                q3: q3,
                interQuantileRange: interQuantileRange,
                min: min,
                max: max
            }
            sumstat[i] = {
                key: arrayYears[i],
                value: value
            }
        }

        // scales
        const x = d3.scaleBand().range([0, width]).domain(arrayYears)
                    .paddingInner(1).paddingOuter(.5);
        const y = d3.scaleLinear().domain([0,1]).range([height, 0]);

        // axis
        svg.append("g").attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x));
        svg.append("g").call(d3.axisLeft(y));
        // axis title
        svg.append("text").attr("text-anchor", "end").attr("x", width)
            .attr("y", height+margin.bottom).text("Year");
        svg.append("text").attr("text-anchor", "end")
            .attr("transform", "rotate(-90)").attr("y", -margin.left+15)
            .attr("x", 0).text("HDI Index")

        // adding vertical lines (from min to max)
        svg.selectAll(".VertLines").data(sumstat).enter().append("line")
            .attr("class", "VertLines")
            .attr("x1", function(d){return(x(d.key))})
            .attr("x2", function(d){return(x(d.key))})
            .attr("y1", function(d){return(y(d.value.min))})
            .attr("y2", function(d){return(y(d.value.max))})
            .attr("stroke", "black")
            .style("width", 40);

        // create bins
        const colors = ["#3D388F","#2D58BD","#00A5E1","#53D5D7","#7BEDD3",
                         "#C4F2CE","lightblue"];
        const boxWidth = 80
        svg.selectAll("boxes").data(sumstat).enter().append("rect")
            .attr("x", function(d){return(x(d.key)-boxWidth/2)})
            .attr("y", function(d){return(y(d.value.q3))})
            .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
            .attr("width", boxWidth )
            .attr("stroke", "black")
            .style("fill", function(d,i){return colors[i]});
        
        // create line for medians
        svg.selectAll("medianLines").data(sumstat).enter().append("line")
            .attr("x1", function(d){return(x(d.key)-boxWidth/2)})
            .attr("x2", function(d){return(x(d.key)+boxWidth/2)})
            .attr("y1", function(d){return(y(d.value.median))})
            .attr("y2", function(d){return(y(d.value.median))})
            .attr("stroke", "black")
            .style("width", 80);
        
        // creating text that appears with checkbox
        svg.selectAll("textLegend").data(sumstat).enter().append("text")
            .attr("class", "median")
            .attr("x", function(d){return(x(d.key)+2)})
            .attr("y", function(d){return(y(d.value.median))-3})
            .text(function(d){return (d.value.median).toFixed(3)})
            .style("font-size","15px").style("opacity", 0);
        svg.selectAll("textLegend").data(sumstat).enter().append("text")
            .attr("class", "q1")
            .attr("x", function(d){return(x(d.key)+2)})
            .attr("y", function(d){return(y(d.value.q1))-3})
            .text(function(d){return (d.value.q1).toFixed(3)})
            .style("font-size","15px").style("opacity", 0);
        svg.selectAll("textLegend").data(sumstat).enter().append("text")
            .attr("class", "q3")
            .attr("x", function(d){return(x(d.key)+2)})
            .attr("y", function(d){return(y(d.value.q3))-3})
            .text(function(d){return (d.value.q3).toFixed(3)})
            .style("font-size","15px").style("opacity", 0);
        svg.selectAll("textLegend").data(sumstat).enter().append("text")
            .attr("class", "min")
            .attr("x", function(d){return(x(d.key))+2})
            .attr("y", function(d){return(y(d.value.min))})
            .text(function(d){return (d.value.min).toFixed(3)})
            .style("font-size","15px").style("opacity", 0);
        svg.selectAll("textLegend").data(sumstat).enter().append("text")
            .attr("class", "max")
            .attr("x", function(d){return(x(d.key))+2})
            .attr("y", function(d){return(y(d.value.max)+12)})
            .text(function(d){return (d.value.max).toFixed(3)})
            .style("font-size","15px")
            .style("opacity", 0);

        // updating displayed text when button are checked
        function update() {
            d3.selectAll(".checkbox").each(function(d){
                cb = d3.select(this);
                grp = cb.property("value");
        
                // If the box is check, I show the group
                if(cb.property("checked")){
                    svg.selectAll("."+grp).transition().duration(800)
                        .style("opacity", 1)}
                // Otherwise I hide it
                else { 
                    svg.selectAll("."+grp).transition().duration(800)
                        .style("opacity", 0)}})
        }

        // when the status of a button changes, I run the update function
        d3.selectAll(".checkbox").on("change",update);
    }) 
}

/*
Bar plot
*/
let plot_barplot=function(filePath,rowConverter,colorRegion){

    // creating svg
    let margin = {top: 30, right: 30, bottom: 50, left: 90},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    let svg = d3.select("#q3_plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    // reading data
    d3.csv(filePath,rowConverter).then(function(data){

        // data for 2015
        let filter2015 = d3.filter(data, d => d.Year == 2015);
        let HappinessNotNaN2015 = d3.filter(filter2015, 
            d => !isNaN(d.Happiness_Score));
        let sum2015 = d3.rollups(HappinessNotNaN2015, 
            v => d3.sum(v, d => d.Happiness_Score), d => d.Region); 
        let count2015 = d3.rollups(HappinessNotNaN2015, 
            v => v.length, d => d.Region);
        let data2015 = [];
        for (let i=0;i<count2015.length;i++){
            data2015[i] = {
                Region: sum2015[i][0],
                Average: parseFloat((sum2015[i][1]/count2015[i][1]).toFixed(2))
            }
        }

        // data for 2016
        let filter2016 = d3.filter(data, d => d.Year == 2016);
        let HappinessNotNaN2016 = d3.filter(filter2016, 
            d => !isNaN(d.Happiness_Score));
        let sum2016 = d3.rollups(HappinessNotNaN2016, 
            v => d3.sum(v, d => d.Happiness_Score), d => d.Region); 
        let count2016 = d3.rollups(HappinessNotNaN2016, 
            v => v.length, d => d.Region);
        let data2016 = [];
        for (let i=0;i<count2016.length;i++){
            data2016[i] = {
                Region: sum2016[i][0],
                Average: parseFloat((sum2016[i][1]/count2016[i][1]).toFixed(2))
            }
        }

        // data for 2017
        let filter2017 = d3.filter(data, d => d.Year == 2017);
        let HappinessNotNaN2017 = d3.filter(filter2017, 
            d => !isNaN(d.Happiness_Score));
        let sum2017 = d3.rollups(HappinessNotNaN2017, 
            v => d3.sum(v, d => d.Happiness_Score), d => d.Region); 
        let count2017 = d3.rollups(HappinessNotNaN2017, 
            v => v.length, d => d.Region);
        let data2017 = [];
        for (let i=0;i<count2017.length;i++){
            data2017[i] = {
                Region: sum2017[i][0],
                Average: parseFloat((sum2017[i][1]/count2017[i][1]).toFixed(2))
            }
        }

        // data for 2018
        let filter2018 = d3.filter(data, d => d.Year == 2018);
        let HappinessNotNaN2018 = d3.filter(filter2018, 
            d => !isNaN(d.Happiness_Score));
        let sum2018 = d3.rollups(HappinessNotNaN2018, 
            v => d3.sum(v, d => d.Happiness_Score), d => d.Region); 
        let count2018 = d3.rollups(HappinessNotNaN2018, 
            v => v.length, d => d.Region);
        let data2018 = [];
        for (let i=0;i<count2018.length;i++){
            data2018[i] = {
                Region: sum2018[i][0],
                Average: parseFloat((sum2018[i][1]/count2018[i][1]).toFixed(2))
            }
        }

        // data for 2019
        let filter2019 = d3.filter(data, d => d.Year == 2019);
        let HappinessNotNaN2019 = d3.filter(filter2019, 
            d => !isNaN(d.Happiness_Score));
        let sum2019 = d3.rollups(HappinessNotNaN2019, 
            v => d3.sum(v, d => d.Happiness_Score), d => d.Region); 
        let count2019 = d3.rollups(HappinessNotNaN2019, 
            v => v.length, d => d.Region);
        let data2019 = [];
        for (let i=0;i<count2019.length;i++){
            data2019[i] = {
                Region: sum2019[i][0],
                Average: parseFloat((sum2019[i][1]/count2019[i][1]).toFixed(2))
            }
        }
        
        // regions
        let arrayRegion = [];
        for (let i=0;i<sum2015.length;i++){
            arrayRegion[i] = sum2015[i][0];
        }
 
        // when loading the page
        newUpdate(data2015);

        // radio buttons
        let radio = d3.select("#radio_q3").attr("name","year")
            .on("change",function(d) {
                current_year = d.target.value;
                let new_data = data2015;
                if (current_year == "2016"){new_data = data2016;}
                else if (current_year == "2017"){new_data = data2017;}
                else if (current_year == "2018"){new_data = data2018;}
                else if (current_year == "2019"){new_data = data2019;}
                newUpdate(new_data);
            })
        
        // when status of radion buttons changes
        function newUpdate(data){

            // clear the svg
            svg.selectAll('*').remove();

            // scale
            let xScale = d3.scaleLinear().domain([0,8]).range([0, width-60]);
            let yScale = d3.scaleBand().domain(arrayRegion).range([height, 0])
                            .paddingInner(0.1);
            
            // axis
            const yAxis = d3.axisLeft().scale(yScale)
                            .tickFormat(function(d, i){return arrayRegion[i]});
            svg.append("g").call(yAxis).attr("class", "yAxis")
                .attr("transform","translate(60,0)");
            svg.append("g").attr("transform", "translate(60," + height + ")")
                .call(d3.axisBottom(xScale));
            svg.append("text").attr("text-anchor", "end").attr("x", width)
                .attr("y", height+margin.bottom-10).text("Happiness Score");

            // bars
            let bars = svg.selectAll(".bar").data(data).enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function(d){return 60;})
                .attr("y", function(d){return yScale(d.Region);})
                .attr("width", function(d){return xScale(d.Average);})
                .attr("height", function(d){return yScale.bandwidth();})
                .attr("fill",function(d) {return colorRegion(d.Region);})
                .style("opacity", .5)
           
            let text = svg.append("g").attr("class", "labels")
                .selectAll("text")
                .data(data).enter().append("text")
                .attr("dx", function(d){return xScale(d.Average) +20;})
                .attr("dy", function(d){
                    return yScale(d.Region) + yScale.bandwidth()* (0.6);})
                .text(function(d){return d.Average})
                .attr("font-family" , "sans-serif")
                .attr("font-size" , "14px")
                .attr("fill" , "black")
                .attr("text-anchor", "middle");
        }
    });
}

/*
Stacked bar chart
*/
let plot_stackedbars=function(filePath,rowConverter){

    // creating svg
    let margin = {top: 30, right: 10, bottom: 70, left: 10},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    let svg = d3.select("#q4_plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    // reading data
    d3.csv(filePath,rowConverter).then(function(data){

        // creating data to stack
        let dataToStack = [];
        let dataBarBehind = [];
        let countryNames = [];
        for (let i=0;i<16;i++){
            filter = d3.filter(data, d => d.Happiness_Rank == i*10+1);
            countryNames[i] = filter[0].Country;
            dataBarBehind[i] = {
                Country: filter[0].Country,
                HScore: filter[0].Happiness_Score
            }
            dataToStack[i] = 
            { 
                Country: filter[0].Country, 
                Economy: filter[0].Economy, 
                Family: filter[0].Family,
                Health: filter[0].Health,
                Freedom: filter[0].Freedom,
                Generosity: filter[0].Generosity,
                Trust: filter[0].Trust,
            };
        }

        // for keys
        const SubCatNames = ['Economy', 'Family', 'Health', 'Freedom',
            'Generosity','Trust'];
        const colors = ["#3D388F","#2D58BD","#00A5E1","#53D5D7",
            "#7BEDD3","#C4F2CE"];

        // for legend
        const SubCatNamesLegend = ['Economy', 'Family', 'Health', 'Freedom',
            'Generosity','Trust','Happiness Score'];
        const colorsLegend = ["#3D388F","#2D58BD","#00A5E1","#53D5D7","#7BEDD3",
            "#C4F2CE","lightgrey"];

        // creating the stack
        let stackgenerator = d3.stack().keys(SubCatNames);
        let stacked = stackgenerator(dataToStack);

        // creating scales
        const xScale = d3.scaleBand().domain(d3.range(dataToStack.length))
            .range([0, width-100]).paddingInner(0.2);
        const yScale = d3.scaleLinear().range([height,0])
        .domain([0,d3.max(dataBarBehind, function(d){return d.HScore})]);

        // rectangles behind
        let rectsbehind =  svg.selectAll(".barbehind").data(dataBarBehind)
            .enter().append("rect").attr("class", "barbehind")
            .attr("x", function(d,i){return xScale(i)+65;})
            .attr("y", function (d) {return yScale(d.HScore);})
            .attr("width", function(d) {return xScale.bandwidth();})
            .attr("height", function(d) {return height-yScale(d.HScore)})
            .attr("fill","lightgrey").style("opacity", 0.9);

        // creating the groups
        let groups = svg.selectAll(".gbars").data(stacked).enter().append("g")
            .attr("class", "gbars").attr("fill", function(d) {
                if (d.key == "Economy") {return colors[0];} 
                else if (d.key == "Family") {return colors[1];}
                else if (d.key == "Health") {return colors[2];}
                else if (d.key == "Freedom") {return colors[3];}
                else if (d.key == "Generosity") {return colors[4];}
                else if (d.key == "Trust") {return colors[5];}})
            .style("opacity", 0.8);
        
        // creating all rectangles
        let rects = groups.selectAll("rect").data(function(d){return d;})
            .enter().append("rect")
            .attr("x", function(d,i){return xScale(i)+60;})
            .attr("y", function (d) {return yScale(d[1]);})
            .attr("width", function(d) {return xScale.bandwidth();})
            .attr("height", function(d) {return yScale(d[0]) - yScale(d[1])});
        
        // axis
        const xAxis = d3.axisBottom().scale(xScale)
            .tickFormat(function(d, i){return countryNames[i]});
        const yAxis = d3.axisLeft().scale(yScale);
        svg.append("g").call(xAxis)
            .attr("class", "xAxis")
            .attr("transform", "translate(60," + height + ")")
            .selectAll("text")	
            .style("text-anchor", "end")
            .style("font-size","9px")
            .attr("transform", "rotate(-45)");
        svg.append("g").call(yAxis)
            .attr("class", "yAxis")
            .attr("transform","translate(55,0)");
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", 30)
            .attr("x", 0)
            .text("Value");

        // creating the legend
        let padding_x = 70;
        let padding_y = 0;
        let rectslegend = svg.selectAll("rectLegend")
            .data(SubCatNamesLegend).enter().append("rect")
            .attr("x", width -2*padding_x-10)
            .attr("y", function(d,i){ return padding_y + i*20-6})
            .attr("width", 10).attr("height", 10)
            .style("fill", function(d,i){ return colorsLegend[i]});

        svg.selectAll("textLegend").data(SubCatNamesLegend).enter()
            .append("text")
            .attr("x", width -2*padding_x + 5)
            .attr("y", function(d,i){ return padding_y + i*20})
            .text(function(d){return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size","15px");

        // button
        const buttonValues = ['Select Component','Economy', 'Family',
            'Health', 'Freedom','Generosity','Trust'];
        d3.select("#selectButton").selectAll('myOptions')
            .data(buttonValues).enter()
            .append('option')
            .text(function(d){return d;})
            .attr("value",function(d){return d;});
        
        // when category is selected
        function updateChart(SubCatName) {
            groups.transition().duration(1000)
              .attr("fill", function(d){
                if (d.key == SubCatName){return 'orange';}
                else if (d.key == "Economy") {return colors[0];} 
                else if (d.key == "Family") {return colors[1];}
                else if (d.key == "Health") {return colors[2];}
                else if (d.key == "Freedom") {return colors[3];}
                else if (d.key == "Generosity") {return colors[4];}
                else if (d.key == "Trust") {return colors[5];}});

            rectslegend.transition().duration(1000)
                .style("fill", function(d,i){
                if (d == SubCatName){return 'orange';}
                else if (d == "Economy") {return colors[0];} 
                else if (d == "Family") {return colors[1];}
                else if (d == "Health") {return colors[2];}
                else if (d == "Freedom") {return colors[3];}
                else if (d == "Generosity") {return colors[4];}
                else if (d == "Trust") {return colors[5];}
                else if (d == "Happiness Score") {return 'lightgrey';}});
        }

        // adding interactivity
        d3.select("#selectButton").on("change", function(d) {
            let selectedOption = d3.select(this).property("value");
            updateChart(selectedOption);
        })
    });
}

/*
Scatterplot
*/
let plot_scatterplot=function(filePath,rowConverter,colorRegion){

    // creating svg
    let margin = {top: 30, right: 30, bottom: 30, left: 45},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    let svg = d3.select("#q5_plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height+ margin.top + margin.bottom)
                .append("g")
                .attr("transform","translate("+margin.left+","+margin.top+")");
    
    // reading the data
    d3.csv(filePath, rowConverter).then(data=>{

        // filter year 2019 and not NaN values
        let filter2019 = d3.filter(data, d => d.Year == 2019);
        let HappinessNotNaN = d3.filter(filter2019, 
            d => !isNaN(d.Happiness_Score));
        let HDINotNaN = d3.filter(HappinessNotNaN, d => !isNaN(d.HDI_Score));

        // scales
        const xscale = d3.scaleLinear().range([0,width])
        .domain([0.35,Math.round(d3.max(HDINotNaN,function(d)
            {return d.HDI_Score;}))]);
        const yscale = d3.scaleLinear().range([height,0])
        .domain([2.5,Math.round(d3.max(HDINotNaN,function(d)
            {return d.Happiness_Score;}))]);


        // div for Tooltip
        let tooltip = d3.select("body").append("div").attr("class","tooltip")
        .style("opacity", 0).style("background", "lightgrey");

        // scatterplot
        // creating all the dots
        svg.selectAll(".Circles").data(HDINotNaN).enter().append("circle")
            .attr("class", "Circles")
            .attr("r", 5)
            .attr("cx", function(d) {return xscale(d.HDI_Score)})
            .attr("cy", function(d) {return yscale(d.Happiness_Score);})
            .attr("fill", function(d) {return colorRegion(d.Region);})
            .attr("stroke","black")
        // adding interactivity
            .on("mouseover", function(e,d) {
                // making the div visible		
                tooltip.transition().duration(200)
                    .style("opacity", 0.9);	
                // adding text to div and placing it
                tooltip.html(d.Country)	
                    .style("left", (e.pageX) + "px")		
                    .style("top", (e.pageY - 28) + "px");
                // changing radius of selected dot
                d3.select(this)
                    .transition().duration(200)
                    .attr("r", 10);
                })				
            .on("mouseout", function(e,d) {	
                // making div invisible	
                tooltip.transition().duration(1000)		
                    .style("opacity", 0);
                // puting the standard radius again
                d3.select(this)
                    .transition().duration(1000)
                    .attr("r", 5);
            });

        // axis
        const xAxis = d3.axisBottom().scale(xscale);
        const yAxis = d3.axisLeft().scale(yscale);
        svg.append("g").call(xAxis).attr("class", "xAxis")
            .attr("transform","translate(0,540)");
        svg.append("g").call(yAxis).attr("class", "yAxis");

        // axis title
        svg.append("text").attr("text-anchor", "end")
            .attr("x", width).attr("y", height+margin.bottom)
            .text("HDI Score");
        svg.append("text").attr("text-anchor", "end")
            .attr("transform", "rotate(-90)").attr("y", -margin.left+15)
            .attr("x", 0).text("Happiness Score");

        // legend
        // legend circles
        svg.selectAll("circlesLegend").data(arrayRegion).enter()
            .append("circle")
            .attr("cx", width -4*margin.right+10)
            .attr("cy", function(d,i){ return 400+i*15})
            .attr("r", 4)
            .style("fill", function(d,i){ return arrayColor[i]});
        
        // legend text
        svg.selectAll("textLegend").data(arrayRegion).enter().append("text")
            .attr("x", width -4*margin.right+18)
            .attr("y", function(d,i){ return 400+i*15})
            .text(function(d){return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("font-size","10px");     
    })
}