// --- 1. GLOBAL ORDER FORM LOGIC ---
let totalJarsOrdered = 0;

function updateTotal() {
    var qtyElement = document.getElementById("fqty");
    var totalElement = document.getElementById("order-total");
    if (qtyElement && totalElement) {
        var qty = parseInt(qtyElement.value, 10);
        if(isNaN(qty) || qty < 1) qty = 1; 
        totalElement.textContent = "₹" + (qty * 35);
    }
}

function submitOrder() {
    var nameInput = document.getElementById("fname");
    var addressInput = document.getElementById("faddress");
    var qtyInput = document.getElementById("fqty");
    var errName = document.getElementById("err-name");
    var errAddress = document.getElementById("err-address");
    
    var valid = true;
    errName.textContent = "";
    errAddress.textContent = "";
    nameInput.classList.remove("input-error");
    addressInput.classList.remove("input-error");
    
    if (!nameInput.value || nameInput.value.trim() === "") { 
        errName.textContent = "Please enter your full name."; 
        nameInput.classList.add("input-error"); 
        valid = false; 
    }
    if (!addressInput.value || addressInput.value.trim() === "") { 
        errAddress.textContent = "Please enter your delivery address."; 
        addressInput.classList.add("input-error"); 
        valid = false; 
    }
    
    if (valid) {
        var name = nameInput.value.trim();
        var qty = parseInt(qtyInput.value, 10);
        if(isNaN(qty) || qty < 1) qty = 1;

        totalJarsOrdered += qty;
        let trackerDisplay = document.getElementById("global-order-count");
        if(trackerDisplay) { trackerDisplay.innerText = totalJarsOrdered; }

        document.getElementById("order-form").style.display = "none";
        document.getElementById("order-success").style.display = "block";
        document.getElementById("success-msg-text").innerHTML = 
            "Order successfully placed for " + qty + " jar(s).<br><br>" +
            "Thank you for ordering Figo, <strong>" + name + "</strong>!<br>" +
            "Enjoy the Figo!";
    }
}

function resetOrder() {
    document.getElementById("fname").value = "";
    document.getElementById("faddress").value = "";
    document.getElementById("fqty").value = "1";
    document.getElementById("fname").classList.remove("input-error");
    document.getElementById("faddress").classList.remove("input-error");
    updateTotal();
    document.getElementById("order-success").style.display = "none";
    document.getElementById("order-form").style.display = "block";
}


// --- 2. D3 DASHBOARD LOGIC ---
document.addEventListener('DOMContentLoaded', function() {

    var tooltip = d3.select("#d3-tooltip");

    function showTip(html, event) {
        if (!tooltip.empty()) {
            tooltip.html(html).style("opacity", 1)
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        }
    }
    function hideTip() { if (!tooltip.empty()) tooltip.style("opacity", 0); }
    function moveTip(event) {
        if (!tooltip.empty()) {
            tooltip.style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        }
    }

    var onDashboard = !!document.getElementById("bar-chart");

    if (onDashboard) {
        try { drawBarChart(); } catch(e) { console.error(e); }
        try { drawPieChart(); } catch(e) { console.error(e); }
        try { drawScatterPlot(); } catch(e) { console.error(e); }
        try { drawHistogram(); } catch(e) { console.error(e); }
        try { drawForceSimulation(); } catch(e) { console.error(e); }
        try { drawSpikeChart(); } catch(e) { console.error(e); } 
        
        var indiaData = [
            {name:"Andhra Pradesh", val:78}, {name:"Gujarat", val:72},
            {name:"Karnataka", val:85}, {name:"Kerala", val:80},
            {name:"Maharashtra", val:88}, {name:"Tamil Nadu", val:92},
            {name:"Delhi", val:90}, {name:"West Bengal", val:70}
        ];
        var ausData = [
            {name:"New South Wales", val:90}, {name:"Victoria", val:85},
            {name:"Queensland", val:75}, {name:"Western Australia", val:70}
        ];

        try { drawGeoMap("india-map", "https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States", "whitesmoke", "lavender", "rebeccapurple", "India", indiaData); } catch(e) { console.error(e); }
        try { drawGeoMap("aus-map", "https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson", "whitesmoke", "honeydew", "mediumseagreen", "Australia", ausData); } catch(e) { console.error(e); }
    }

    function cw(id) {
        var el = document.getElementById(id);
        return el ? Math.max(el.offsetWidth, 280) : 400;
    }

    function drawBarChart() {
        var data = [
            {brand:"Amul", sugar:12, figo:false}, {brand:"Epigamia", sugar:14, figo:false},
            {brand:"M.Dairy", sugar:13, figo:false}, {brand:"Nestle", sugar:13.5, figo:false},
            {brand:"Danone", sugar:15, figo:false}, {brand:"Yakult", sugar:11, figo:false},
            {brand:"Figo", sugar:5, figo:true}
        ];
        var m = {top:25, right:20, bottom:52, left:44};
        var W = cw("bar-chart") - m.left - m.right, H = 260 - m.top - m.bottom;
        
        var svg = d3.select("#bar-chart").append("svg").attr("width", "100%").attr("height", "300px")
            .attr("viewBox", "0 0 " + (W + m.left + m.right) + " " + (H + m.top + m.bottom))
            .append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");
            
        var x = d3.scaleBand().domain(data.map(function(d){ return d.brand; })).range([0,W]).padding(0.28);
        var y = d3.scaleLinear().domain([0,18]).range([H,0]);
        
        svg.append("g").attr("class","grid").call(d3.axisLeft(y).tickSize(-W).tickFormat(""));
        
        svg.selectAll("rect").data(data).join("rect")
            .attr("x", function(d){ return x(d.brand); }).attr("width", x.bandwidth())
            .attr("y", H).attr("height", 0).attr("rx", 4)
            .attr("fill", function(d){ return d.figo ? "mediumseagreen" : "mediumpurple"; })
            .on("mouseover", function(e,d){ showTip("<strong>" + d.brand + "</strong><br/>Sugar: " + d.sugar + "g", e); })
            .on("mousemove", moveTip).on("mouseout", hideTip)
            .transition().duration(800)
            .attr("y", function(d){ return y(d.sugar); }).attr("height", function(d){ return H - y(d.sugar); });
            
        svg.selectAll(".bar-label").data(data).enter().append("text")
            .attr("x", function(d){ return x(d.brand) + (x.bandwidth() / 2); }).attr("y", function(d){ return y(d.sugar) - 5; })
            .attr("text-anchor", "middle").style("font-size", "11px").style("font-weight", "bold")
            .style("fill", function(d){ return d.figo ? "mediumseagreen" : "dimgray"; })
            .text(function(d){ return d.sugar + "g"; });

        svg.append("g").attr("transform", "translate(0," + H + ")").call(d3.axisBottom(x)).selectAll("text")
            .attr("transform","rotate(-18)").style("text-anchor","end").style("font-size","11px");
        svg.append("g").call(d3.axisLeft(y).ticks(6));
    }

    // --- BULLETPROOF 5-Year Pie Chart ---
    function drawPieChart() {
        var allData = {
            "2025": [ {label:"Amul", val:38}, {label:"M. Dairy", val:22}, {label:"Nestle", val:16}, {label:"Milkymist", val:10}, {label:"Danone", val:8}, {label:"Others", val:6} ],
            "2024": [ {label:"Amul", val:45}, {label:"M. Dairy", val:25}, {label:"Nestle", val:12}, {label:"Milkymist", val:8}, {label:"Danone", val:5}, {label:"Others", val:5} ],
            "2023": [ {label:"Amul", val:50}, {label:"M. Dairy", val:26}, {label:"Nestle", val:10}, {label:"Milkymist", val:5}, {label:"Danone", val:4}, {label:"Others", val:5} ],
            "2022": [ {label:"Amul", val:55}, {label:"M. Dairy", val:28}, {label:"Nestle", val:8}, {label:"Milkymist", val:3}, {label:"Danone", val:3}, {label:"Others", val:3} ],
            "2021": [ {label:"Amul", val:60}, {label:"M. Dairy", val:25}, {label:"Nestle", val:7}, {label:"Milkymist", val:2}, {label:"Danone", val:2}, {label:"Others", val:4} ],
            "2020": [ {label:"Amul", val:65}, {label:"M. Dairy", val:20}, {label:"Nestle", val:5}, {label:"Milkymist", val:2}, {label:"Danone", val:2}, {label:"Others", val:6} ]
        };
        
        var cols = ["mediumpurple", "steelblue", "tomato", "goldenrod", "mediumseagreen", "darkgray"];
        var W = cw("pie-chart"), H = 300, R = Math.min(W * 0.35, 100);
        
        var svg = d3.select("#pie-chart").append("svg").attr("width", "100%").attr("height", "300px")
            .attr("viewBox", "0 0 " + W + " " + H).append("g").attr("transform", "translate(" + (W/2 - 70) + "," + (H/2) + ")");
            
        var pie = d3.pie().value(d => d.val).sort(null);
        var arc = d3.arc().innerRadius(R * 0.42).outerRadius(R);

        function updatePie(year) {
            var data = allData[year];
            var paths = svg.selectAll("path").data(pie(data));

            paths.enter()
                .append("path")
                .attr("fill", (d,i) => cols[i])
                .attr("stroke", "white").attr("stroke-width", 2)
                .style("cursor", "pointer")
                .each(function(d) { this._current = d; }) 
                .merge(paths) 
                .on("mouseover", function(e,d){ showTip("<strong>" + d.data.label + "</strong><br/>" + d.data.val + "%", e); })
                .on("mousemove", moveTip).on("mouseout", hideTip)
                .transition().duration(750)
                .attrTween("d", function(d) {
                    var i = d3.interpolate(this._current, d);
                    this._current = i(0);
                    return function(t) { return arc(i(t)); };
                });
        }

        updatePie("2025");
            
        var yearSelect = document.getElementById("year-select");
        if (yearSelect) {
            yearSelect.addEventListener("change", function(e) {
                updatePie(e.target.value);
            });
        }

        var legend = svg.append("g").attr("transform", "translate(" + (R + 20) + "," + (-R + 10) + ")");
        for (var j = 0; j < allData["2025"].length; j++) {
            var row = legend.append("g").attr("transform", "translate(0, " + (j * 20) + ")");
            row.append("rect").attr("width", 12).attr("height", 12).attr("fill", cols[j]);
            row.append("text").attr("x", 20).attr("y", 10).style("font-size", "12px").style("fill", "dimgray").text(allData["2025"][j].label);
        }
    }

    function drawScatterPlot() {
        var data = [
            {brand:"Amul", sugar:12, prob:4, share:38, figo:false}, {brand:"Epigamia", sugar:14, prob:6, share:10, figo:false},
            {brand:"M.Dairy", sugar:13, prob:4, share:22, figo:false}, {brand:"Nestle", sugar:13.5, prob:5, share:16, figo:false},
            {brand:"Danone", sugar:15, prob:6, share:8, figo:false}, {brand:"Yakult", sugar:11, prob:7.5, share:4, figo:false},
            {brand:"Figo", sugar:5, prob:9, share:3, figo:true }
        ];
        var m = {top:20, right:30, bottom:52, left:52};
        var W = cw("scatter-chart") - m.left - m.right, H = 300 - m.top - m.bottom;
        
        var svg = d3.select("#scatter-chart").append("svg").attr("width", "100%").attr("height", "300px")
            .attr("viewBox", "0 0 " + (W + m.left + m.right) + " " + (H + m.top + m.bottom)).append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");
            
        var x = d3.scaleLinear().domain([2,18]).range([0, W]);
        var y = d3.scaleLinear().domain([2,11]).range([H, 0]);
        var r = d3.scaleSqrt().domain([2,38]).range([6,20]);
        
        svg.append("g").attr("class","grid").call(d3.axisLeft(y).tickSize(-W).tickFormat(""));
        svg.append("rect").attr("x", x(2)).attr("y", y(11)).attr("width", x(8)-x(2)).attr("height", y(6)-y(11))
            .attr("fill", "honeydew").attr("stroke", "mediumseagreen").attr("stroke-dasharray", "4,3").attr("rx", 4).attr("opacity", 0.65);
        svg.append("text").attr("x", x(5)).attr("y", y(10.5)).attr("text-anchor", "middle").style("font-size", "10px").style("fill", "mediumseagreen").text("Ideal Zone");
        
        svg.selectAll("circle").data(data).join("circle").attr("cx", function(d){ return x(d.sugar); }).attr("cy", function(d){ return y(d.prob); }).attr("r", 0)
            .attr("fill", function(d){ return d.figo ? "mediumseagreen" : "mediumpurple"; }).attr("stroke", "white").attr("stroke-width", 2).attr("opacity", 0.85)
            .style("cursor", "pointer")
            .on("mouseover", function(e,d){ showTip("<strong>" + d.brand + "</strong><br/>Sugar: " + d.sugar + "g<br/>Prob: " + d.prob + "/10", e); })
            .on("mousemove", moveTip).on("mouseout", hideTip).transition().duration(800).attr("r", function(d){ return r(d.share); });
            
        svg.append("g").attr("transform", "translate(0," + H + ")").call(d3.axisBottom(x).ticks(7));
        svg.append("g").call(d3.axisLeft(y).ticks(5));
    }

    function drawHistogram() {
        var rawData = [];
        var dist = [{c:2,n:16},{c:5,n:68},{c:8,n:56},{c:11,n:36},{c:14,n:14},{c:17,n:6},{c:20,n:4}];
        for (var j = 0; j < dist.length; j++) { for(var i = 0; i < dist[j].n; i++) rawData.push(dist[j].c + (Math.random() - 0.5) * 2.5); }
        var m = {top:20, right:20, bottom:50, left:44};
        var W = cw("hist-chart") - m.left - m.right, H = 260 - m.top - m.bottom;
        
        var svg = d3.select("#hist-chart").append("svg").attr("width", "100%").attr("height", "300px")
            .attr("viewBox", "0 0 " + (W + m.left + m.right) + " " + (H + m.top + m.bottom)).append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");
            
        var x = d3.scaleLinear().domain([0,22]).range([0, W]);
        var bins = d3.bin().domain(x.domain()).thresholds(x.ticks(10))(rawData);
        var y = d3.scaleLinear().domain([0, d3.max(bins, function(d){ return d.length; })]).range([H, 0]);
        
        svg.append("g").attr("class","grid").call(d3.axisLeft(y).tickSize(-W).tickFormat(""));
        svg.selectAll("rect").data(bins).join("rect").attr("class","bar-rect")
            .attr("x", function(d){ return x(d.x0) + 1; }).attr("width", function(d){ return Math.max(0, x(d.x1) - x(d.x0) - 2); })
            .attr("y", H).attr("height", 0).attr("rx", 3).attr("fill", function(d){ return d.x1 <= 8 ? "mediumseagreen" : "mediumpurple"; })
            .on("mouseover", function(e,d){ showTip(d.x0.toFixed(0) + "–" + d.x1.toFixed(0) + "g<br/>" + d.length + " people", e); })
            .on("mousemove", moveTip).on("mouseout", hideTip).transition().duration(800).attr("y", function(d){ return y(d.length); }).attr("height", function(d){ return H - y(d.length); });
            
        svg.append("line").attr("x1", x(5)).attr("x2", x(5)).attr("y1", 0).attr("y2", H).attr("stroke", "goldenrod").attr("stroke-width", 2).attr("stroke-dasharray", "5,3");
        svg.append("text").attr("x", x(5) + 4).attr("y", 12).style("font-size", "10px").style("fill", "goldenrod").text("← Figo (5g)");
        svg.append("g").attr("transform", "translate(0," + H + ")").call(d3.axisBottom(x).ticks(8));
        svg.append("g").call(d3.axisLeft(y).ticks(5));
    }

    function drawForceSimulation() {
        var nodes = [
            {id:"Figo", type:"brand", r:18, col:"mediumseagreen"}, {id:"Amul", type:"brand", r:26, col:"mediumpurple"},
            {id:"Epigamia", type:"brand", r:16, col:"steelblue"}, {id:"Nestle", type:"brand", r:20, col:"tomato"},
            {id:"Cow Milk", type:"ingredient", r:12, col:"lightsteelblue"}, {id:"Coconut Milk", type:"ingredient", r:12, col:"lightseagreen"},
            {id:"Sugar", type:"ingredient", r:14, col:"lightsalmon"}, {id:"Fig Extract", type:"ingredient", r:11, col:"plum"}
        ];
        var links = [
            {source:"Figo", target:"Coconut Milk"}, {source:"Figo", target:"Fig Extract"},
            {source:"Amul", target:"Cow Milk"}, {source:"Amul", target:"Sugar"},
            {source:"Epigamia", target:"Cow Milk"}, {source:"Epigamia", target:"Sugar"},
            {source:"Nestle", target:"Cow Milk"}, {source:"Nestle", target:"Sugar"}
        ];
        var W = cw("force-chart"), H = 300;
        var svg = d3.select("#force-chart").append("svg").attr("width", "100%").attr("height", "300px").attr("viewBox", "0 0 " + W + " " + H);
            
        var sim = d3.forceSimulation(nodes).force("link", d3.forceLink(links).id(function(d){ return d.id; }).distance(80)).force("charge", d3.forceManyBody().strength(-150)).force("center", d3.forceCenter(W/2, H/2)).force("collide", d3.forceCollide().radius(function(d){ return d.r + 8; }));
        var link = svg.append("g").selectAll("line").data(links).join("line").attr("stroke", "lightgray").attr("stroke-width", 2);
        var node = svg.append("g").selectAll("circle").data(nodes).join("circle").attr("r", function(d){ return d.r; }).attr("fill", function(d){ return d.col; }).attr("stroke", "white").attr("stroke-width", 2).style("cursor", "grab")
            .call(d3.drag().on("start", function(e,d){ if(!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }).on("drag", function(e,d){ d.fx = e.x; d.fy = e.y; }).on("end", function(e,d){ if(!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));
        var label = svg.append("g").selectAll("text").data(nodes).join("text").text(function(d){ return d.id; }).attr("text-anchor", "middle").style("font-size", "10px").style("fill", "dimgray");
        sim.on("tick", function(){
            link.attr("x1", function(d){ return d.source.x; }).attr("y1", function(d){ return d.source.y; }).attr("x2", function(d){ return d.target.x; }).attr("y2", function(d){ return d.target.y; });
            node.attr("cx", function(d){ return Math.max(d.r, Math.min(W - d.r, d.x)); }).attr("cy", function(d){ return Math.max(d.r, Math.min(H - d.r, d.y)); });
            label.attr("x", function(d){ return Math.max(d.r, Math.min(W - d.r, d.x)); }).attr("y", function(d){ return Math.max(d.r, Math.min(H - d.r, d.y)) - d.r - 2; });
        });
    }

    function drawGeoMap(containerId, geoUrl, defaultColor, minColor, maxColor, titlePrefix, dataArray) {
        var W = cw(containerId), H = 350;
        
        var infoBox = d3.select("#" + containerId).append("div").attr("class", "map-info-box");
        var svg = d3.select("#" + containerId).append("svg")
            .attr("width", "100%").attr("height", "350px")
            .attr("viewBox", "0 0 " + W + " " + H)
            .on("click", resetMap); 

        var g = svg.append("g"); 
        var proj, path;
        var active = d3.select(null); 

        d3.json(geoUrl).then(function(data) {
            try {
                var features = data.features || data;
                function getName(d) {
                    if (!d || !d.properties) return "";
                    return d.properties.name || d.properties.NAME_1 || d.properties.NAME || d.properties.STATE_NAME || "";
                }

                features = features.filter(function(d) { return !(!d.geometry || d.geometry.type === "Point"); });

                proj = d3.geoMercator().fitSize([W, H], {type: "FeatureCollection", features: features});
                path = d3.geoPath().projection(proj);
                var colorScale = d3.scaleSequential().domain([0, 100]).interpolator(d3.interpolateRgb(minColor, maxColor));

                g.selectAll("path").data(features).enter().append("path")
                    .attr("d", path).attr("stroke", "darkgray").attr("stroke-width", 0.5)
                    .attr("fill", function(d) {
                        var name = getName(d);
                        var stateData = name ? dataArray.find(s => name.toLowerCase().includes(s.name.toLowerCase())) : null;
                        return stateData ? colorScale(stateData.val) : defaultColor;
                    })
                    .style("cursor", "pointer")
                    .on("mouseover", function(e, d){
                        var name = getName(d) || "Region";
                        var stateData = name !== "Region" ? dataArray.find(s => name.toLowerCase().includes(s.name.toLowerCase())) : null;
                        showTip("<strong>" + name + " (" + titlePrefix + ")</strong><br/>Demand Index: " + (stateData ? stateData.val : "No Data"), e);
                        
                        if (active.node() !== this) {
                            var transformStr = g.attr("transform");
                            var currentScale = transformStr && transformStr.includes("scale(") ? parseFloat(transformStr.split("scale(")[1]) : 1;
                            
                            d3.select(this).attr("stroke", "black").attr("stroke-width", 1.5 / currentScale);
                            d3.select(this).raise(); 
                            if(active.node()) active.raise(); 
                        }
                    })
                    .on("mousemove", moveTip)
                    .on("mouseout", function(){
                        hideTip();
                        if (active.node() !== this) {
                            var transformStr = g.attr("transform");
                            var currentScale = transformStr && transformStr.includes("scale(") ? parseFloat(transformStr.split("scale(")[1]) : 1;
                            d3.select(this).attr("stroke", "darkgray").attr("stroke-width", 0.5 / currentScale);
                        }
                    })
                    .on("click", function(e, d) {
                        e.stopPropagation(); 
                        
                        if (active.node() === this) return resetMap(); 
                        
                        active = d3.select(this);

                        var name = getName(d) || "Unknown Region";
                        var stateData = name !== "Unknown Region" ? dataArray.find(s => name.toLowerCase().includes(s.name.toLowerCase())) : null;
                        var demand = stateData ? stateData.val : "N/A";
                        var ordersPlaced = stateData ? Math.floor(stateData.val * 34.5) : 0; 
                        
                        infoBox.html(`
                            <h4 style="margin:0; color:rebeccapurple;">${name}</h4>
                            <p style="margin:5px 0 0; font-size:12px;">Demand Index: <strong>${demand}</strong></p>
                            <p style="margin:0; font-size:12px;">Simulated Orders: <strong>${ordersPlaced}</strong></p>
                            <p style="margin:5px 0 0; font-size:10px; color:gray;">(Click again or background to zoom out)</p>
                        `).style("opacity", 1);

                        var bounds = path.bounds(d);
                        var dx = bounds[1][0] - bounds[0][0];
                        var dy = bounds[1][1] - bounds[0][1];
                        var x = (bounds[0][0] + bounds[1][0]) / 2;
                        var y = (bounds[0][1] + bounds[1][1]) / 2;
                        var scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / W, dy / H)));
                        var translate = [W / 2 - scale * x, H / 2 - scale * y];

                        g.transition().duration(750).attr("transform", "translate(" + translate + ")scale(" + scale + ")");
                        
                        g.selectAll("path").transition().duration(750)
                            .attr("stroke", function() { return this === active.node() ? "rebeccapurple" : "darkgray"; })
                            .attr("stroke-width", function() { return (this === active.node() ? 3.0 : 0.5) / scale; });
                            
                        active.raise(); 
                    });
            } catch(innerErr) { console.error("Map Error:", innerErr); }
                
        }).catch(function(err){
            svg.append("text").attr("x", 20).attr("y", 150).style("fill", "crimson")
               .text("Map blocked. Try using a Live Server to view GeoJSON files locally.");
        });

        function resetMap() {
            infoBox.style("opacity", 0);
            active = d3.select(null);
            g.transition().duration(750).attr("transform", "");
            g.selectAll("path").transition().duration(750)
                .attr("stroke", "darkgray")
                .attr("stroke-width", 0.5);
        }
    }

    function drawSpikeChart() {
        var m = {top: 20, right: 30, bottom: 40, left: 50};
        var W = cw("spike-chart") - m.left - m.right, H = 300 - m.top - m.bottom;
        
        var svg = d3.select("#spike-chart").append("svg")
            .attr("width", "100%").attr("height", "300px")
            .attr("viewBox", "0 0 " + (W + m.left + m.right) + " " + (H + m.top + m.bottom))
            .append("g").attr("transform", "translate(" + m.left + "," + m.top + ")");

        var data = d3.range(0, 41).map(function(sugar) {
            return { sugar: sugar, spike: sugar <= 25 ? 80 : 80 + Math.pow((sugar - 25), 1.8) };
        });

        var x = d3.scaleLinear().domain([0, 40]).range([0, W]);
        var y = d3.scaleLinear().domain([0, 250]).range([H, 0]);

        svg.append("rect").attr("x", 0).attr("y", 0).attr("width", x(25)).attr("height", H).attr("fill", "honeydew").attr("opacity", 0.5);
        svg.append("rect").attr("x", x(25)).attr("y", 0).attr("width", W - x(25)).attr("height", H).attr("fill", "#fff0f0").attr("opacity", 0.5);
        
        svg.append("line").attr("x1", x(25)).attr("y1", 0).attr("x2", x(25)).attr("y2", H)
           .attr("stroke", "crimson").attr("stroke-width", 2).attr("stroke-dasharray", "4,4");
        svg.append("text").attr("x", x(25) - 5).attr("y", 15).attr("text-anchor", "end")
           .style("font-size", "10px").style("fill", "crimson").style("font-weight", "bold").text("25g Limit");

        var line = d3.line().x(d => x(d.sugar)).y(d => y(d.spike)).curve(d3.curveMonotoneX);
        svg.append("path").datum(data).attr("fill", "none").attr("stroke", "rebeccapurple").attr("stroke-width", 3).attr("d", line);

        svg.append("g").attr("transform", "translate(0," + H + ")").call(d3.axisBottom(x).tickFormat(d => d + "g"));
        svg.append("g").call(d3.axisLeft(y).tickFormat(d => d + " mg/dL"));

        var userMarker = svg.append("g").attr("class", "user-marker");
        userMarker.append("line").attr("y1", 0).attr("y2", H).attr("stroke", "goldenrod").attr("stroke-width", 2).attr("stroke-dasharray", "5,5");
        userMarker.append("circle").attr("r", 8).attr("fill", "goldenrod").attr("stroke", "white").attr("stroke-width", 2);
        
        var userText = userMarker.append("text").attr("x", 12).attr("dy", "-0.5em").style("font-size", "12px").style("font-weight", "bold").style("fill", "darkslategray");

        function updateMarker() {
            var inputVal = parseFloat(document.getElementById("sugar-tester").value);
            if(isNaN(inputVal) || inputVal < 0) inputVal = 0;
            if(inputVal > 40) inputVal = 40; 

            var calculatedSpike = inputVal <= 25 ? 80 : 80 + Math.pow((inputVal - 25), 1.8);

            userMarker.transition().duration(400).attr("transform", "translate(" + x(inputVal) + ",0)");
            userMarker.select("circle").transition().duration(400).attr("cy", y(calculatedSpike));
            
            if (inputVal > 30) {
                userText.attr("x", -12).style("text-anchor", "end");
            } else {
                userText.attr("x", 12).style("text-anchor", "start");
            }
            
            userText.transition().duration(400).attr("y", Math.max(20, y(calculatedSpike)))
                    .text("Spike: " + Math.round(calculatedSpike));
        }

        var testerInput = document.getElementById("sugar-tester");
        if (testerInput) {
            testerInput.addEventListener("input", updateMarker);
            updateMarker();
        }
    }
});