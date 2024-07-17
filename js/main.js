import {gaza} from './data/gaza.js';
import {egypt} from './data/egypt.js';
import {outers} from './data/outers.js';
import {mainStreets} from './data/mainStreets.js';
import {sea} from './data/sea.js';
import {mainDestruction} from './data/mainDestruction.js';
import {blocks} from './data/blocks.js';
import {blocks_lines} from './data/blocks-lines.js';
import {gaza_north} from './data/gaza_north.js';
import { evac_area_1 } from './data/evac_area_1.js';
import { evac_area_2 } from './data/evac_area_2.js';
import { evac_area_3_1 } from './data/evac_area_3_1.js';
import { evac_area_3_2 } from './data/evac_area_3_2.js';
import { evac_area_4 } from './data/evac_area_4.js';
import { evac_area_5 } from './data/evac_area_5.js';


document.addEventListener('DOMContentLoaded', () => {
    let isScrolling = false;
    let currentSection = 0;

    const sections = document.querySelectorAll('.content-container');
    const totalSections = sections.length;

    // Scroll to a specific section
    const scrollToSection = (index) => {
        if (index >= 0 && index < totalSections) {
            const targetSection = sections[index];
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth'
            });
            currentSection = index;
        }
    };

    // Handle scroll event
    const handleScroll = (event) => {
        if (isScrolling) return;
        isScrolling = true;

        if (event.deltaY > 0) {
            // Scrolling down
            if (currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            }
        } else {
            // Scrolling up
            if (currentSection > 0) {
                scrollToSection(currentSection - 1);
            }
        }

        setTimeout(() => {
            isScrolling = false;
        }, 1000); // Adjust the timeout duration based on your animation speed
    };

    // Attach the wheel event listener
    document.addEventListener('wheel', (event) => {
        event.preventDefault();
        handleScroll(event);
    }, { passive: false });

    // Initialize to scroll to the first section
    scrollToSection(0);
});



// 31.39533,34.46991
const gazaCoordinates = [34.46991,31.39533];
const gazaBounds = [
    [34.225, 31.225], // Southwest coordinates
    [34.775, 31.725]  // Northeast coordinates
];

const map = new maplibregl.Map({
    container: 'map',
    style:
    'https://api.maptiler.com/maps/basic/style.json?key=KhB7EN0Px2jwIG045quV', // stylesheet location
    center: gazaCoordinates,
    zoom: 9.999,
    interactive: false
});

const init = () => {
    if (!map.getSource("main-streets")) {
        map.addSource("main-streets", {
            type: "geojson",
            data: mainStreets
        });
    }

    if (!map.getLayer("main-streets")) {
        map.addLayer({
            'id': 'main-streets',
            'type': 'line',
            'source': 'main-streets',
            'layout': {},
            'paint': {
                'line-color': 'black',
            }
        });
    }

    // Show the labels
    if (map.getLayer('label_place_city')) {
        map.setLayoutProperty('label_place_city', 'visibility', 'visible');
        map.setLayoutProperty('label_place_city', 'text-field', [
            'format',
            ['get', 'name'],
            {
                'font-scale': 0.5,
                'text-font': [
                    'literal',
                    ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']
                ]
            }
        ]);
    }
}

const playVideo = (container) => {
    const video = document.querySelector(`${container} video`);
    video.play();
}  

const pauseVideo = (container) => {
    const video = document.querySelector(`${container} video`);
    video.pause();
}

async function loadLocalSVGImage(name, path, coordinates) {
    // Fetch the SVG image as a text string
    let response = await fetch(path);
    let svgText = await response.text();

    // Parse the SVG to get its dimensions
    let parser = new DOMParser();
    let svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    let svgElement = svgDoc.documentElement;
    
    // Ensure SVG has explicit width and height
    if (!svgElement.hasAttribute('width')) svgElement.setAttribute('width', '100%');
    if (!svgElement.hasAttribute('height')) svgElement.setAttribute('height', '100%');
    
    let viewBox = svgElement.getAttribute('viewBox');
    let [, , width, height] = viewBox ? viewBox.split(' ').map(Number) : [null, null, 24, 24];

    // Create an ultra high-resolution canvas
    let scale = 16; // Increased for maximum quality
    let canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    let ctx = canvas.getContext('2d', { alpha: true });

    // Enable crisp edges rendering
    ctx.imageSmoothingEnabled = false;

    // Modify SVG for better rendering
    svgElement.setAttribute('width', canvas.width);
    svgElement.setAttribute('height', canvas.height);
    
    // Convert SVG to data URL
    let svgBlob = new Blob([svgElement.outerHTML], { type: 'image/svg+xml' });
    let url = URL.createObjectURL(svgBlob);

    // Load the SVG onto the canvas
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            // Use a technique to render sharp edges
            ctx.drawImage(img, 0, 0);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);

            URL.revokeObjectURL(url);

            // Add the maximum quality image to the map
            if (!map.hasImage(name)) {
                map.addImage(name, ctx.getImageData(0, 0, canvas.width, canvas.height), { 
                    pixelRatio: scale,
                    sdf: false
                });
                map.addSource(name, {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [{
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': coordinates
                            }
                        }]
                    }
                });
            }
            resolve();
        };
        img.onerror = reject;
        img.src = url;
    });
}

async function loadLocalImage(name, path, coordinates){
    let image = await map.loadImage(path);
    if(!map.hasImage(name)){
        map.addImage(name, image.data);
        map.addSource(name, {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coordinates
                        }
                    }
                ]
            },
        });
    }
}

function addImageLayer(name, size, duration=0.1){
    if(!map.getLayer(name)){
        map.addLayer({
            'id': name,
            'type': 'symbol',
            'source': name,
            'layout': {
                'icon-image': name,
                'icon-size': ['interpolate', ['linear'], ['zoom'],
                    9, size / 1.5,
                    13, size * 1.5,
                    14, size * 4,
                    15, size * 8,
                ],
                'icon-allow-overlap': true
            }
        });
    }

    return gsap.to({ opacity: 0 }, {
        opacity: 1,
        duration: duration,
        onUpdate: function () {
          map.setPaintProperty(name, 'icon-opacity', this.targets()[0].opacity);
        },
    });
}

map.on('load', async () => {
    map.fitBounds(gazaBounds, {
        padding: { top: 20, bottom: 20, left: 20, right: 20 }, // Optional padding
        maxZoom: 15, // Optional maximum zoom level
        duration: 2000 // Optional animation duration in milliseconds
    });
    // Add Support for RTL Languages 
    maplibregl.setRTLTextPlugin(
        'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
        true // Lazy load the plugin
    );


    const layers = map.getStyle().layers;
    console.log(layers);
    // Remove Labels
    map.setPaintProperty('water', 'fill-color', '#088');
    map.setLayoutProperty('label_country', 'visibility', 'none');
    map.setLayoutProperty('label_place_city', 'visibility', 'none');
    map.setLayoutProperty('label_place_other', 'visibility', 'none');
    map.setLayoutProperty('label_road', 'visibility', 'none');

    let firstSymbolId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    // Start Construct The Map Theme
    // Gaza
    map.addSource('gaza', {
        'type': 'geojson',
        'data': gaza
    });

    map.addLayer({
        'id': 'gaza',
        'type': 'fill',
        'source': 'gaza',
        'layout': {},
        'paint': {
            'fill-color': 'white',
        }
    }, firstSymbolId);

    // Egypt
    map.addSource('egypt', {
        'type': 'geojson',
        'data': egypt
    });

    map.addLayer({
        'id': 'egypt',
        'type': 'fill',
        'source': 'egypt',
        'layout': {},
        'paint': {
            'fill-color': '#373737',
            'fill-opacity': 1
        }
    }, 'gaza');


    // outers
    map.addSource('outers', {
        'type': 'geojson',
        'data': outers
    });

    map.addLayer({
        'id': 'outers',
        'type': 'fill',
        'source': 'outers',
        'layout': {},
        'paint': {
            'fill-color': '#373737',
            'fill-opacity': 1
        }
    });


    map.addSource('sea', {
        'type': 'geojson',
        'data': sea
    });

    map.addLayer({
        'id': 'sea',
        'type': 'fill',
        'source': 'sea',
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-opacity': 1
        }
    }, 'gaza');


    
  
    // End Construct The Map Theme








    /*** Start Scrolls ***/
           
    const containers = document.querySelectorAll(".content-container");

    containers.forEach((container, index) => {
        const childElements = container.querySelectorAll('.content-child');
    
        gsap.set(childElements, {
            opacity: 0,
            y: 200
        });    
        let tl;
    
        ScrollTrigger.create({
            trigger: container,
            start: "top 50%",
            end: "bottom 20%",
            onEnter: async () => {
                if (container.id !== "three" && container.id !== 'five' && container.id !== "nineteen" && container.id !== "fifteen" && container.id !== "twelve" && container.id !== "thirteen" && container.id !== "fourteen" && container.id !== "ten" && container.id !== "ten-two" && container.id !== "ten-three" && container.id !== "ten-four" && container.id !== "seven") {
                    gsap.fromTo(childElements,
                        { opacity: 0, y: 200 },
                        { opacity: 1, y: 0, duration: 2, ease: 'power1.inOut', clearProps: "all" }
                    );
                }

                
                const currentId = container.id;
    
                if (tl) {
                    tl.revert();
                }
    
                tl = gsap.timeline();
                switch (currentId) {
                    case "one":
                        // Remove labels
                        switchLabelsVisibility("none", ['label_country', 'label_place_city', 'label_place_other', 'label_road']);
    
                        // Remove layers
                        tl.add(removePreviousLayer('gaza', 'fill-opacity'));
                        tl.add(removePreviousLayer('main-streets', 'line-opacity'));
    
                        // Add gaza gray
                        tl.add(addNewLayer('gaza-gray', gaza, 'fill', {
                            'fill-color': '#cdcdcd'
                        }, false));
    
                        // Add destruction
                        tl.add(addNewLayer('main-destruction', mainDestruction, 'circle', {
                            'circle-color': 'red',
                            'circle-radius': 0.8
                        }, false));
                        break;
                    case "two":
                        // Hide Destruction
                        tl.add(removePreviousLayer("main-destruction", "circle-opacity"));
                        // Hide Gaza-gray
                        tl.add(removePreviousLayer("gaza-gray", "fill-opacity"));

                        // Show Gaza-White
                        tl.add(addNewLayer('gaza-white', gaza, 'fill', {
                            'fill-color': 'white',
                        }, false, {animationOpacity: 1}))
                        // Show Blocks
                        tl.add(addNewLayer('gaza-block', blocks, 'line', {
                            'line-color': 'black',
                            'line-opacity': 1
                        }, false, {animationOpacity: 1}))
                        // Show Three Lines
                        tl.add(addNewLayer('gaza-block-lines', blocks_lines, 'line', {
                            'line-color': 'black',
                            'line-opacity': 1,
                            'line-width': 2
                        }, false, {animationOpacity: 1}))
                        // Show the North
                        tl.add(addNewLayer('gaza-north', gaza_north, 'fill', {
                            'fill-color': '#f07f79',
                            'fill-opacity': 1,
                        }, false))
                        // Show the Arrow
                        tl.add(await loadLocalImage('arrow', '../assets/map_arrow_one.png', [34.40864, 31.45657]));
                        setTimeout(() => {
                            tl.add(addImageLayer("arrow", 0.9))
                        }, 1000)
                        break;
                    case "two-two":
                        // Show Evacuation Area 1
                        tl.add(addNewLayer('evac-area-one', evac_area_1, 'fill', {
                            'fill-color': '#FFDAD7e0',
                            'fill-opacity': 1,
                        }, 'arrow', {animationOpacity: 1}))
                        break;
                    case "two-three":
                        // Remove Arrow 1
                        tl.add(removePreviousLayer("arrow", "icon-opacity"))
                        // Add Arrows for Area 2
                        tl.add(await loadLocalImage('arrow-2', '../assets/map_arrow_two.png', [34.41148, 31.45489]));
                        setTimeout(() => {
                            tl.add(addImageLayer("arrow-2", 0.5))
                        }, 1000)

                        tl.add(await loadLocalImage('arrow-2-2', '../assets/map_arrow_two_two.png', [34.30872, 31.32629]));
                        setTimeout(() => {
                            tl.add(addImageLayer("arrow-2-2", 0.8))
                        }, 1000)
                        // Show Evacuation Area 2
                        tl.add(addNewLayer('evac-area-two', evac_area_2, 'fill', {
                            'fill-color': '#FFDAD7e0',
                            'fill-opacity': 1,
                        }, false))
                        break;
                    case "two-four":
                        // Show Evacuation Area 3
                        tl.add(addNewLayer('evac-area-three-one', evac_area_3_1, 'fill', {
                            'fill-color': '#006579e0',
                            'fill-opacity': 1,
                        }, false))
                        tl.add(addNewLayer('evac-area-three-two', evac_area_3_2, 'fill', {
                            'fill-color': '#006579e0',
                            'fill-opacity': 1,
                        }, false))
                        // Show Evacuation Area 4
                        tl.add(addNewLayer('evac-area-four', evac_area_4, 'fill', {
                            'fill-color': '#FFDAD7e0',
                            'fill-opacity': 1,
                        }, false))
                        break;
                    case "two-five":
                        tl.add(removePreviousLayer("evac-area-two", 'fill-opacity'));
                        tl.add(removePreviousLayer("gaza-north", 'fill-opacity'));
                        tl.add(removePreviousLayer("evac-area-three-two", 'fill-opacity'));
                        tl.add(removePreviousLayer("arrow-2", 'icon-opacity'));
                        tl.add(removePreviousLayer("arrow-2-2", 'icon-opacity'));
                        // Show Evacuation Area 5
                        tl.add(addNewLayer('evac-area-five', evac_area_5, 'fill', {
                            'fill-color': '#006579e0',
                            'fill-opacity': 1,
                        }, false))
                        // Show arrows 3
                        tl.add(await loadLocalImage('arrow-3', '../assets/map_arrow_three.png', [34.26836, 31.28998]));
                        tl.add(addImageLayer("arrow-3", 0.8))
                        break;
                    case "three":
                        tl.add(removePreviousLayer("evac-area-three-one", "fill-opacity"))
                        tl.add(removePreviousLayer("evac-area-four", "fill-opacity"))
                        tl.add(removePreviousLayer("evac-area-one", "fill-opacity"))
                        tl.add(removePreviousLayer("evac-area-five", "fill-opacity"))
                        tl.add(removePreviousLayer("arrow-3", 'icon-opacity'));
                        tl.add(await loadLocalSVGImage('khan-younis', '../assets/khanyounis_refugee_camps.svg', [34.29204, 31.35317]));
                        tl.add(addImageLayer("khan-younis", 2))
                        tl.to("#three .content-child", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#three .content-child", {y: 100, duration: 0.5})
                        map.flyTo({
                            center: [34.29204, 31.35317],
                            zoom: 13
                        });
                        break;
                    case "three-two":
                        // Remove the previous image
                        tl.add(removePreviousLayer("khan-younis", "icon-opacity"))
                        tl.add(removePreviousLayer("tal-sultan", "icon-opacity"))
                        // add the second image
                        tl.add(await loadLocalSVGImage('rafah', '../assets/rafah.svg', [34.242789, 31.308767]));
                        map.flyTo({
                            center: [34.242789, 31.308767],
                            essential: true,
                            zoom: 14
                        });
                        tl.add(addImageLayer("rafah", 2))
                        break;
                    
                    case "three-three":
                        // Remove Second Image
                        tl.add(removePreviousLayer('rafah', 'icon-opacity'));
                        map.flyTo({
                            center: [34.242789, 31.308767],
                            essential: true,
                            zoom: 14
                        });
                        // add the third image
                        tl.add(await loadLocalSVGImage('rafah-two', '../assets/rafah_2.svg', [34.242789, 31.308767]));
                        setTimeout(() => {
                            tl.add(addImageLayer("rafah-two", 2))
                        }, 1000)
                        map.flyTo({
                            center: [34.242789, 31.308767],
                            essential: true,
                            zoom: 14
                        });
                        break;
                    case "three-four":
                        // Remove second image
                        tl.add(removePreviousLayer("rafah-two", 'icon-opacity'))
                        // add the third image
                        tl.add(await loadLocalSVGImage('rafah-three', '../assets/rafah_3.svg', [34.242789, 31.308767]));
                        tl.add(addImageLayer("rafah-three", 2))
                        break;
                    case "four":
                        tl.to("#three .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#three .content-child", {position: 'unset !important', duration: 0.1})
                        tl.add(removePreviousLayer("rafah-three", 'icon-opacity'))
                        // Hide The Map
                        tl.add(tl.to("#map", {
                            opacity: 0,
                            visibility: 'none',
                            duration: 1
                        }));
                        break;
                    case "five":
                        tl.to("#five .content-child", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#five .content-child", {y: 100, duration: 0.5})
                        // Show The Map
                        tl.add(tl.to("#map", {
                            opacity: 1,
                            visibility: 'visible',
                            duration: 1
                        }));
                        map.flyTo({
                            center: [34.27204, 31.23714],
                            essential: true,
                            zoom: 13
                        })
                        tl.add(await loadLocalSVGImage('south-one', '../assets/south_1.svg', [34.27204, 31.23714]));
                        tl.add(addImageLayer("south-one", 5))
                        break;
                    case "five-two":
                        tl.add(await loadLocalSVGImage('south-two', '../assets/south_2.svg', [34.27204, 31.23714]));
                        tl.add(addImageLayer("south-two", 5))
                        tl.add(removePreviousLayer("south-one", "icon-opacity"));
                        break;
                    case "five-three":
                        tl.add(await loadLocalSVGImage('south-three', '../assets/south_3.svg', [34.270901, 31.235705]));
                        tl.add(addImageLayer("south-three", 5))
                        break;
                    case "six":
                        tl.to("#five .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#five .content-child", {position: 'unset !important', duration: 0.1})
                        // Hide The Map
                        tl.add(tl.to("#map", {
                            opacity: 0,
                            visibility: 'none',
                            duration: 1
                        }));
                        tl.add(removePreviousLayer("south-two", "icon-opacity"))
                        tl.add(removePreviousLayer("south-three", "icon-opacity"))
                        break;
                    case "seven":
                        tl.to("#seven .content-child", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#seven .content-child", {y: 100, duration: 0.5})
                        // Show The Map
                        tl.add(tl.to("#map", {
                            opacity: 1,
                            visibility: 'visible',
                            duration: 1
                        }));
                        map.flyTo({
                            zoom: 9.999,
                            center: gazaCoordinates
                        })
                        tl.add(removePreviousLayer("gaza-block", "line-opacity"));
                        tl.add(removePreviousLayer("gaza-white", "fill-opacity"));
                        map.setPaintProperty("road_path", "line-color", "black")
                        map.setPaintProperty("road_major", "line-color", "black")
                        map.setPaintProperty("road_minor", "line-color", "black")
                        tl.add(addNewLayer("gaza-streets", mainStreets, "line", {
                            'line-color': 'black'
                        }))
                        // tl.add(await loadLocalSVGImage('mawasi', '../assets/south_3.svg', [34.270901, 31.235705]));
                        // tl.add(addImageLayer("mawasi", 5))
                        break;
                    case "seven-two":
                        tl.add(await loadLocalSVGImage('mawasi', '../assets/mawasi.svg', [34.265655, 31.349355]));
                        tl.add(addImageLayer("mawasi", 2.2))
                        map.flyTo({
                            zoom: 12,
                            center: [34.267808, 31.350360]
                        })
                        break;
                    case "eight":
                        tl.to("#seven .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#seven .content-child", {position: 'unset !important', duration: 0.1})
                        tl.add(removePreviousLayer("mawasi", "icon-opacity"))
                        map.flyTo({
                            zoom: 9.999,
                            center: gazaCoordinates
                        })
                        break;
                    case "ten": // Refugee Graphics
                        // Hide The Map
                        tl.add(tl.to("#map", {
                            opacity: 0,
                            visibility: 'none',
                            duration: 1
                        }));
                        const images = document.querySelectorAll(".animated-image");
                        images.forEach(image => {
                            tl.to(image, {visibility: 'visible', opacity: 1, duration: 0.1})
                            tl.from(image, {y: 100, duration: 0.5, clearProps: "transform"})
                        })
                        break;
                    case "ten-two":
                        tl.to("#ten-two .content-child .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#ten-two .content-child .text-graphics", {y: 100, duration: 0.5})
                        break;
                    case "ten-three":
                        tl.to("#ten-three .content-child .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#ten-three .content-child .text-graphics", {y: 100, duration: 0.5})
                        break;
                    case "ten-four":
                        tl.to("#ten-four .content-child .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#ten-four .content-child .text-graphics", {y: 100, duration: 0.5})
                        break;
                    case "eleven":
                        // Show The Map
                        tl.to("#map", {
                            opacity: 1,
                            visibility: 'visible',
                            duration: 1
                        });
                        const imagess = document.querySelectorAll(".animated-image");
                        imagess.forEach(image => {
                            tl.to(image, {visibility: 'hidden', opacity: 1, y: 0, duration: 0.1})
                            tl.to(image, {position: 'unset !important', duration: 0.1})
                        })
                        tl.to("#ten-two .content-child .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#ten-two .content-child .text-graphics", {position: 'unset !important', duration: 0.1})

                        tl.to("#ten-three .content-child .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#ten-three .content-child .text-graphics", {position: 'unset !important', duration: 0.1})

                        tl.to("#ten-four .content-child .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#ten-four .content-child .text-graphics", {position: 'unset !important', duration: 0.1})
                        map.flyTo({
                            zoom: 13,
                            essential: true,
                            center: [34.300712, 31.377954]
                        })
                        tl.add(await loadLocalSVGImage('mawasi-two', '../assets/mawasi_2.svg', [34.300712, 31.377954]));
                        tl.add(addImageLayer("mawasi-two", 2))
                        break;
                    case "twelve":
                        // Hide The Map
                        tl.add(tl.to("#map", {
                            opacity: 0,
                            visibility: 'none',
                            duration: 1
                        }));
                        tl.add(removePreviousLayer("mawasi-two", "icon-opacity"))
                        tl.to(".animated-video", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from(".animated-video", {y: 100, duration: 0.5})
                        playVideo("#twelve")
                        break;
                    case "thirteen":
                        tl.to("#thirteen .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#thirteen .text-graphics", {y: 100, duration: 0.5})
                        break;
                    case "fourteen":
                        pauseVideo("#twelve")
                        tl.to("#fourteen .fixed img", {visibility: "hidden", opacity: 0, y: 0, duration: 0.1})
                        // tl.to("#fourteen .fixed", {position: 'unset !important', duration: 0.1})
                        
                        tl.to("#fourteen .fixed", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#fourteen .fixed", {y: 100, duration: 0.5, clearProps: "transform"})
                        

                        tl.to(".animated-video", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to(".animated-video", {position: 'unset !important', duration: 0.1})



                        tl.to("#fourteen-2 .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#fourteen-2 .text-graphics", {y: 100, duration: 0.5})
                        
                        
                        tl.to(".animated-image-two", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from(".animated-image-two", {y: 100, duration: 0.5})
                        break;
                    case "fourteen-2":
                        tl.to("#fourteen .fixed img", {visibility: "visible", opacity: 1, y: 0, duration: 0.1})
                        break;
                    case "fifteen":
                        tl.to("#fourteen .fixed img", {visibility: "hidden", opacity: 0, y: 0, duration: 0.1})

                        tl.to("#fourteen .fixed", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#fourteen .fixed", {position: 'unset !important', duration: 0.1})

                        tl.to("#thirteen .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#thirteen .text-graphics", {position: 'unset !important', duration: 0.1})


                        
                        tl.to(".animated-image-two", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to(".animated-image-two", {position: 'unset !important', duration: 0.1})

                        tl.to("#fifteen .content-child", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#fifteen .content-child", {y: 100, duration: 0.5})


                        map.flyTo({
                            zoom: 9.999,
                            essential: true,
                            center: gazaCoordinates
                        })
                        
                        
                        // Show The Map
                        tl.add(tl.to("#map", {
                            opacity: 1,
                            visibility: 'visible',
                            duration: 1
                        }));
                        break;
                    case "sixteen":
                        tl.add(await loadLocalSVGImage('mawasi-three', '../assets/mawasi_3.svg', [34.282923, 31.373260]));
                        tl.add(addImageLayer("mawasi-three", 2.5))
                        map.flyTo({
                            zoom: 13,
                            essential: true,
                            center: [34.285983, 31.375169]
                        })
                        break;
                    case "seventeen":
                        tl.add(await loadLocalSVGImage('mawasi-four', '../assets/mawasi_4.svg', [34.296442, 31.375787]));
                        tl.add(addImageLayer("mawasi-four", 2)) 
                        tl.add(removePreviousLayer("mawasi-three", "icon-opacity"))
                        tl.add(await loadLocalSVGImage('mawasi-three', '../assets/mawasi_3.svg', [34.282923, 31.373260]));
                        tl.add(addImageLayer("mawasi-three", 2))
                        map.flyTo({
                            zoom: 14,
                            essential: true,
                            center: [34.296442, 31.375787]
                        })
                        break;
                    case "eighteen":
                        tl.add(removePreviousLayer("mawasi-four", "icon-opacity"));
                        tl.add(await loadLocalSVGImage('mawasi-five', '../assets/mawasi_5.svg', [34.286353, 31.370217]));
                        tl.add(addImageLayer("mawasi-five", 2.5)) 
                        map.flyTo({
                            zoom: 15,
                            essential: true,
                            center: [34.296442, 31.375787]
                        })
                        break;
                    case "sixteen":
                        map.flyTo({
                            zoom: 9.999,
                            essential: true,
                            center: gazaCoordinates
                        })
                        break;
                    case "nineteen":
                        playVideo("#nineteen");
                        tl.to("#fifteen .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#fifteen .content-child", {position: 'unset !important', duration: 0.1})

                        tl.add(tl.to("#map", {
                            opacity: 0,
                            visibility: 'none',
                            duration: 1
                        }));
                        map.flyTo({
                            zoom: 9.999,
                            essential: true,
                            center: gazaCoordinates
                        })
                        tl.add(removePreviousLayer("mawasi-five", "icon-opacity"))
                        tl.add(removePreviousLayer("mawasi-three", "icon-opacity"))

                        tl.to(".animated-image-three", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from(".animated-image-three", {y: 100, duration: 0.5})
                        break;
                    case "twentyone":
                        pauseVideo("#nineteen")
                        playVideo("#twentyone")
                        tl.to(".animated-image-three", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to(".animated-image-three", {position: 'unset !important', duration: 0.1})
                        break;
                    case "twentytwo":
                        pauseVideo("#twentyone")
                        break;
                    case "twentythree":
                        tl.to("#twentythree .fixed", {visibility: "visible", opacity: 1, duration: 0.1})
                        tl.from("#twentythree .fixed", {y: 100, duration: 0.5, clearProps: "transform"})
                        break;
                    case "twentyfive":
                        tl.to("#twentythree .fixed", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
                        tl.to("#twentythree .fixed", {position: 'unset !important', duration: 0.1})
                        break;
                    case "twentysix":
                        playVideo("#twentysix");
                        break;
                    case "twentyseven":
                        playVideo("#twentyseven");
                        pauseVideo("#twentysix");
                        break;
                    case "twentyeight":
                        // Show The Map
                        tl.add(tl.to("#map", {
                            opacity: 1,
                            visibility: 'visible',
                            duration: 1
                        }));
                        // ,
                        tl.add(await loadLocalSVGImage('mawasi-six', '../assets/mawasi_6.svg', [34.244100, 31.334291]));
                        tl.add(addImageLayer("mawasi-six", 3)) 
                        map.flyTo({
                            zoom: 14,
                            essential: true,
                            center: [34.244100, 31.334291]
                        })
                        break;
                    case "twentynine":
                        tl.add(removePreviousLayer("mawasi-six", 'icon-opacity'))
                        tl.add(await loadLocalSVGImage('mawasi-seven', '../assets/mawasi_7.svg', [34.244100, 31.334291]));
                        tl.add(addImageLayer("mawasi-seven", 3)) 
                        break;
                    case "thirty":
                        tl.add(removePreviousLayer("mawasi-seven", 'icon-opacity'))
                        tl.add(await loadLocalSVGImage('mawasi-eight', '../assets/mawasi_8.svg', [34.241040, 31.331591]));
                        tl.add(addImageLayer("mawasi-eight", 3)) 
                        break;
                    case "thirtyone":
                        // Hide The Map
                        tl.add(tl.to("#map", {
                            opacity: 0,
                            visibility: 'none',
                            duration: 1
                        }));
                        map.flyTo({
                            center: gazaCoordinates,
                            zoom: 9.999
                        })
                        tl.add(removePreviousLayer("mawasi-eight", 'icon-opacity'))
                        break;
                }
    
                tl.play();
            },
            onLeaveBack: async () => {
                const currentId = container.id;

                if (tl) {
                    tl.reverse();
                }
    
                switch (currentId) {
                    case "thirtyone":
                        map.flyTo({
                            zoom: 14,
                            essential: true,
                            center: [34.244100, 31.334291]
                        })
                        break;
                    case "nineteen":
                        map.flyTo({
                            zoom: 15,
                            essential: true,
                            center: [34.296442, 31.375787]
                        })
                        break;
                    case "eighteen":
                        map.flyTo({
                            zoom: 14,
                            essential: true,
                            center: [34.296442, 31.375787]
                        })
                     break;
                    case "seventeen":
                        map.flyTo({
                            zoom: 13,
                            essential: true,
                            center: [34.285983, 31.375169]
                        })
                        break;
                    case "sixteen":
                        map.flyTo({
                            zoom: 9.999,
                            essential: true,
                            center: gazaCoordinates
                        })
                        break;
                    case "eight":
                        map.flyTo({
                            zoom: 12,
                            center: [34.267808, 31.350360]
                        })
                        break;
                    case "seven-two":
                        map.flyTo({
                            zoom: 9.999,
                            center: gazaCoordinates
                        })
                        break;
                    case "six":
                        map.flyTo({
                            center: [34.27204, 31.23714],
                            essential: true,
                            zoom: 13
                        })
                        break;
                    case "four":
                        map.flyTo({
                            center: [34.242789, 31.308767],
                            essential: true,
                            zoom: 14
                        });
                        break;
                    case "three":
                        map.flyTo({
                            center: gazaCoordinates,
                            zoom:  9.999
                        })
                        break;
                    case "three-two":
                        map.flyTo({
                            center: [34.29204, 31.35317],
                            zoom: 13
                        });
                        break;
                    // Add other cases as needed
                }
            }
        });
    });
    init();


    




    /**
     * Scroll One
     * 
     * River Line and other lines
     * Show Blocks Division
     * North Gaza Block Migration
     * Show Arrow One
    */



    // const width = 64; // The image will be 64 pixels square
    // const bytesPerPixel = 4; // Each pixel is represented by 4 bytes: red, green, blue, and alpha.
    // const data = new Uint8Array(width * width * bytesPerPixel);

    // for (let x = 0; x < width; x++) {
    //     for (let y = 0; y < width; y++) {
    //         const offset = (y * width + x) * bytesPerPixel;
    //         data[offset + 0] = (y / width) * 255; // red
    //         data[offset + 1] = (x / width) * 255; // green
    //         data[offset + 2] = 128; // blue
    //         data[offset + 3] = 255; // alpha
    //     }
    // }

    // map.addImage('gradient', {width, height: width, data});

    // map.addSource('point', {
    //     'type': 'geojson',
    //     'data': {
    //         'type': 'FeatureCollection',
    //         'features': [
    //             {
    //                 'type': 'Feature',
    //                 'geometry': {
    //                     'type': 'Point',
    //                     'coordinates': [0, 0]
    //                 }
    //             }
    //         ]
    //     }
    // });
    // map.addLayer({
    //     'id': 'points',
    //     'type': 'symbol',
    //     'source': 'point',
    //     'layout': {
    //         'icon-image': 'gradient'
    //     }
    // });
    /*** End Scrolls ***/
})

/*** Handle Scrolls ***/

















const hideMap = () => {

}

const addFeaturesOneByOne = (features, delay, group) => {
    let currentIndex = 0;

    const addFeature = () => {
        if (currentIndex < features.length) {
            const source = map.getSource('main-destruction');
            const currentData = source._data;

            // Add the current group of features to the source data
            for (let i = 0; i < group && currentIndex < features.length; i++, currentIndex++) {
                const currentFeature = features[currentIndex];
                currentData.features.push(currentFeature);
            }

            source.setData(currentData);

            // Animate the appearance of the newly added features
            map.setPaintProperty('main-destruction', 'circle-opacity', 0);
            gsap.to({ opacity: 0 }, {
                opacity: 1,
                duration: 1,
                onUpdate: function () {
                    map.setPaintProperty('main-destruction', 'circle-opacity', this.targets()[0].opacity);
                }
            });

            setTimeout(addFeature, delay);
        }
    };

    addFeature();
};


const addNewLayer = (id, _data, type, paint, before, options = {}) => {
    const { animationOpacity = 1, duration = 0.1 } = options;
    const opacityProperty = `${type}-opacity`;
    paint[opacityProperty] = 0;

    try{
        map.addSource(id, {
            type: "geojson",
            data: _data
        });
    
        if(before){
            map.addLayer({
                'id': id,
                'type': type,
                'source': id,
                'layout': {},
                'paint': paint
            }, before);
        }else{
            map.addLayer({
                'id': id,
                'type': type,
                'source': id,
                'layout': {},
                'paint': paint
            });
        }
    }catch(error){
        console.log(error);
    }

    
    

    return gsap.to({ opacity: 0 }, {
        opacity: animationOpacity,
        duration: duration,
        onUpdate: function () {
            map.setPaintProperty(id, opacityProperty, this.targets()[0].opacity);
        }
    });
}

const removePreviousLayer = (layerId, property, remove = false, duration = 0.5) => {
    return gsap.to({ opacity: 1 }, {
        opacity: 0,
        duration: duration,
        onUpdate: function () {
            if(remove){
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }
                return;
            }
            map.setPaintProperty(layerId, property, this.targets()[0].opacity);
        },
    });
};

const switchLabelsVisibility = (visibility, labels, duration = 0.5) => {
    let tl = gsap.timeline()
    labels.forEach(label => {
        tl.from("*", {
            duration: duration,
            onUpdate: function () {
                map.setLayoutProperty(label, 'visibility', visibility);
            }
        });
    })
}