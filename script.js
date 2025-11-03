window.onload = function () {

    const canvas = document.getElementById('sortCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    var cnv = canvas;
    let arrayToSort = [];
    let isSorting = false;

    const PlanetColors = {
        COMPARE: { r: 255, g: 255, b: 0 },
        SWAP: { r: 0, g: 255, b: 120 }
    };

    // Data Planet (Nama, Ukuran, Warna)
    const PLANET_DATA = [
        { name: "Merkurius", value: 24, color: { r: 150, g: 150, b: 150 } }, // Abu-abu
        { name: "Venus", value: 60, color: { r: 230, g: 200, b: 100 } }, // Kuning-coklat
        { name: "Bumi", value: 64, color: { r: 0, g: 180, b: 255 } }, // Biru
        { name: "Mars", value: 34, color: { r: 220, g: 100, b: 50 } }, // Merah
        { name: "Jupiter", value: 700, color: { r: 210, g: 170, b: 130 } }, // Oranye-tan
        { name: "Saturnus", value: 580, color: { r: 230, g: 210, b: 150 } }, // Emas pucat
        { name: "Uranus", value: 250, color: { r: 170, g: 230, b: 240 } }, // Biru-cyan
        { name: "Neptunus", value: 240, color: { r: 60, g: 100, b: 200 } }  // Biru gelap
    ];

    const OUTLINE_COLOR = { r: 200, g: 200, b: 200 };
    const ORBIT_COLOR = { r: 40, g: 40, b: 80 };
    const BACKGROUND_COLOR = { r: 0, g: 0, b: 0 };

    document.getElementById('btnSort').onclick = startSort;


    function gambar_titik(imageData, x, y, r, g, b) {
        x = Math.floor(x);
        y = Math.floor(y);

        if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
            return;
        }

        var index = 4 * (x + (y * cnv.width));
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 255;
    }


    function dda_line(imageData, x1, y1, x2, y2, r, g, b) {
        var dx = x2 - x1;
        var dy = y2 - y1;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (x2 > x1) {
                var y = y1;
                for (var x = x1; x < x2; x++) {
                    y = y + (dy / Math.abs(dx));
                    gambar_titik(imageData, x, y, r, g, b);
                }
            } else {
                var y = y1;
                for (var x = x1; x > x2; x--) {
                    y = y + (dy / Math.abs(dx));
                    gambar_titik(imageData, x, y, r, g, b);
                }
            }
        } else {
            if (y2 > y1) {
                var x = x1;
                for (var y = y1; y < y2; y++) {
                    x = x + (dx / Math.abs(dy));
                    gambar_titik(imageData, x, y, r, g, b);
                }
            } else {
                var x = x1;
                for (var y = y1; y > y2; y--) {
                    x = x + (dx / Math.abs(dy));
                    gambar_titik(imageData, x, y, r, g, b);
                }
            }
        }
    }


    function lingkaranPolar(imageData, xc, yc, radius, r, g, b) {
        const step = 0.5 / radius;
        for (var theta = 0; theta < Math.PI * 2; theta += step) {
            var x = xc + (radius * Math.cos(theta));
            var y = yc + (radius * Math.sin(theta));
            gambar_titik(imageData, x, y, r, g, b);
        }
    }


    function floodFillStack(imageData, cnv, x, y, toFlood, color) {
        var tumpukan = [];
        tumpukan.push({ x: x, y: y });

        while (tumpukan.length > 0) {
            var titikS = tumpukan.pop();

            if (titikS.x < 0 || titikS.x >= cnv.width || titikS.y < 0 || titikS.y >= cnv.height) {
                continue;
            }

            var indexS = 4 * (titikS.x + (titikS.y * cnv.width))
            var r1 = imageData.data[indexS];
            var g1 = imageData.data[indexS + 1];
            var b1 = imageData.data[indexS + 2];

            if ((toFlood.r == r1) && (toFlood.g == g1) && (toFlood.b == b1)) {
                imageData.data[indexS] = color.r;
                imageData.data[indexS + 1] = color.g;
                imageData.data[indexS + 2] = color.b;
                imageData.data[indexS + 3] = 255;

                tumpukan.push({ x: titikS.x + 1, y: titikS.y })
                tumpukan.push({ x: titikS.x, y: titikS.y + 1 })
                tumpukan.push({ x: titikS.x - 1, y: titikS.y })
                tumpukan.push({ x: titikS.x, y: titikS.y - 1 })
            }
        }
    }


    function drawPlanet(imageData, xc, yc, radius, outlineColor, fillColor) {
        lingkaranPolar(imageData, xc, yc, radius, outlineColor.r, outlineColor.g, outlineColor.b);

        floodFillStack(imageData, cnv, xc + 1, yc, BACKGROUND_COLOR, fillColor);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createPlanets() {
        if (isSorting) return;
        arrayToSort = PLANET_DATA.map(p => ({ ...p }));
        shuffleArray(arrayToSort);
        drawArray(arrayToSort);
    }

    function createLegend() {
        const legendContainer = document.getElementById('legendContainer');
        legendContainer.innerHTML = ''; 

        const sortedData = PLANET_DATA.map(p => ({ ...p }));

        sortedData.forEach(planet => {
            const item = document.createElement('div');
            item.className = 'legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = `rgb(${planet.color.r}, ${planet.color.g}, ${planet.color.b})`;

            const text = document.createElement('span');
            text.textContent = planet.name;

            item.appendChild(colorBox);
            item.appendChild(text);
            legendContainer.appendChild(item);
        });
    }

    function drawArray(arr, highlightIndices = {}) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const n = arr.length;
        const y_center = canvas.height / 2;
        const maxVal = Math.max(200, ...arr.map(p => p.value)); 
        const availableWidth = canvas.width - 100;
        const spacing = availableWidth / n;
        const maxRadius = (spacing / 2) * 0.8; 

        for (let i = 0; i < n; i++) {
            const planetRadius = (arr[i].value / maxVal) * maxRadius + 5; 
            const x_center = 50 + (i * spacing) + (spacing / 2);
            
            const color = arr[i].color;

            drawPlanet(imageData, Math.floor(x_center), y_center, planetRadius, OUTLINE_COLOR, color);
        }
        
        dda_line(imageData, 0, y_center, canvas.width, y_center, ORBIT_COLOR.r, ORBIT_COLOR.g, ORBIT_COLOR.b);

        ctx.putImageData(imageData, 0, 0);
    }
    
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}