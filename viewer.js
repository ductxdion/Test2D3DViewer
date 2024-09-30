document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const dropdown = document.getElementById('sectionDropdown');
            data.polygonsBySection.forEach(section => {
                const option = document.createElement('option');
                option.value = section.sectionId;
                option.textContent = section.sectionName;
                dropdown.appendChild(option);
            });

            dropdown.addEventListener('change', function() {
                const selectedSection = data.polygonsBySection.find(section => section.sectionId === this.value);
                drawPolygons(selectedSection.polygons);
            });
			
			const selectedSection = data.polygonsBySection.find(section => section.sectionId === dropdown.value);
			if (selectedSection) {					
				drawPolygons(selectedSection.polygons);
			}

            window.addEventListener('resize', () => {
                const selectedSection = data.polygonsBySection.find(section => section.sectionId === dropdown.value);
                if (selectedSection) {
                    drawPolygons(selectedSection.polygons);
                }
            });
        });
});

function drawPolygons(polygons) {
    d3.select('#viewer').selectAll('*').remove(); // Clear previous drawings

    const width = document.getElementById('viewer').clientWidth;
    const height = document.getElementById('viewer').clientHeight;

    // Calculate maximum values from the polygon coordinates
    let maxX = width;
    let maxY = height;
    polygons.forEach(polygon => {
        polygon.points2D.forEach(point => {
            if (point.vertex[0] > maxX) maxX = point.vertex[0];
            if (point.vertex[1] > maxY) maxY = point.vertex[1];
        });
    });

    // Update scales based on maximum values
    const xScale = d3.scaleLinear().domain([0, maxX]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, maxY]).range([height, 0]); // Reversed range

    const svg = d3.select('#viewer').append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom()
            .on('zoom', function(event) {
                svg.attr('transform', event.transform);
                updateAxes(event.transform);
                updatePolygons(event.transform);
            }))
        .append('g');

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g').attr('class', 'x axis').attr('transform', `translate(0,${height})`).call(xAxis);
    svg.append('g').attr('class', 'y axis').call(yAxis);

    const polygonGroup = svg.append('g').attr('class', 'polygons');

    polygons.forEach(polygon => {
        polygonGroup.append('polygon')
            .attr('points', polygon.points2D.map(p => [xScale(p.vertex[0]), yScale(p.vertex[1])].join(',')).join(' '))
            .attr('fill', `#${polygon.color}`)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .on('click', function() {
                d3.select(this).attr('stroke', 'red');
            });
    });

    function updateAxes(transform) {
        svg.select('.x.axis').call(xAxis.scale(transform.rescaleX(xScale)));
        svg.select('.y.axis').call(yAxis.scale(transform.rescaleY(yScale)));
    }

    function updatePolygons(transform) {
        polygonGroup.selectAll('polygon')
            .attr('points', function(d, i) {
                const polygon = polygons[i];
                return polygon.points2D.map(p => {
                    const x = transform.rescaleX(xScale)(p.vertex[0]);
                    const y = transform.rescaleY(yScale)(p.vertex[1]);
                    return [x, y].join(',');
                }).join(' ');
            });
    }
}
