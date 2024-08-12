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
import { evac_area_3_3 } from './data/evac_area_3_3.js';
import { evac_area_4 } from './data/evac_area_4.js';
import { evac_area_5 } from './data/evac_area_5.js';

const elements = document.querySelectorAll("body *");
const sections = document.querySelectorAll('.content-container');
const totalSections = sections.length;


// Get the button
let scrollToTopBtn = document.getElementById("scrollToTopBtn");

// When the user clicks on the button, scroll to the top of the document
scrollToTopBtn.addEventListener("click", function() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
});


const lenis = new Lenis({
    wheelMultiplier: 1.5
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
let lastLoadedIndex = -1;

// function detectBrowser() {
//     const userAgent = navigator.userAgent;
//     const isFirefox = userAgent.includes('Firefox');

//     if (isFirefox) {
//         displayWarning();
//     }
// }

// function displayWarning() {
//     const warningMessage = `
//         <div class="warning-firefox">
//             لقد اكتشفنا أنك تستخدم متصفح فايرفوكس. للحصول على تجربة أفضل، نوصي باستخدام 
//             <strong>كروم</strong>، <strong>أوبرا</strong> أو المتصفحات الحديثة الأخرى.
//             <br>
//             <button class="dismiss-warning" id="dissmis" onclick="dismissWarning()">موافق</button>
//         </div>
//     `;

//     const warningContainer = document.getElementById('unique-warning-container');
//     warningContainer.innerHTML = warningMessage;
// }

// window.dismissWarning = function() {
//     const warningContainer = document.getElementById('unique-warning-container');
//     warningContainer.innerHTML = '';
// };


// let lastScrollTop = 0;
// let lastScrollTime = Date.now();

// function measureScrollSpeed() {
//   const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
//   const currentTime = Date.now();
  
//   const scrollDistance = Math.abs(currentScrollTop - lastScrollTop);
//   const timeElapsed = currentTime - lastScrollTime;
  
//   if (timeElapsed > 0) {
//     const scrollSpeed = scrollDistance / timeElapsed * 1000; // pixels per second
//     console.log(`Scroll speed: ${scrollSpeed.toFixed(2)} pixels/second`);
//   }
  
//   lastScrollTop = currentScrollTop;
//   lastScrollTime = currentTime;
// }

// // Attach the function to the scroll event
// window.addEventListener('scroll', measureScrollSpeed);

// Scroll to a specific section
const scrollToSection = (index) => {
    if (index >= 0 && index < totalSections) {
        const targetSection = sections[index];
        window.scrollTo({
            top: targetSection.offsetTop,
            behavior: 'smooth'
        });
        return index;
    }
};

/**
 * Lock the user random scroll and make it snap (section by section)
 */
function snapScroll(cs = 0, to = null){
    let isScrolling = false;
    let currentSection = cs;

    if(cs === 1){
        return scrollToSection(1);
    }
    
    // Handle scroll event
    const handleScroll = (event) => {
        if (isScrolling) return;
        isScrolling = true;

        if (event.deltaY > 0) {
            // Scrolling down
            if (currentSection < totalSections - 1) {
                currentSection = scrollToSection(currentSection + 1);
            }
        } else {
            // Scrolling up
            if (currentSection > 0) {
                currentSection = scrollToSection(currentSection - 1);
            }
        }

        setTimeout(() => {
            isScrolling = false;
        }, 500); // Adjust the timeout duration based on your animation speed
    };

    // Attach the wheel event listener
    document.addEventListener('wheel', (event) => {
        event.preventDefault();
        handleScroll(event);
    }, { passive: false });

    currentSection = scrollToSection(0);
}
function cleanDetachedElements(elements) {
    elements.forEach(element => {
        if (!document.body.contains(element)) {
            element = null;  // Dereference the element
        }
    });
}
function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}
function findDetachedElements() {
    const detachedElements = [];

    function traverse(node) {
        if (!document.body.contains(node) && node.nodeType === Node.ELEMENT_NODE) {
            detachedElements.push(node);
        }
        for (let child = node.firstChild; child; child = child.nextSibling) {
            traverse(child);
        }
    }

    traverse(document);
    return detachedElements;
}

function lockScroll(){
    document.body.style.overflowY = 'hidden';
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
}

function unlockScroll() {
    document.body.style.overflowY = '';
    document.removeEventListener('wheel', preventScroll);
    document.removeEventListener('touchmove', preventScroll);
}

function showLoading(){
    lockScroll();
    let showContent = false;

    // Function to update content visibility
    function updateContentVisibility() {
        if (showContent) {
            elements.forEach(element => {
                if(element.id !== "loading-screen" && !element.classList.contains("spinner") && !element.classList.contains("spinner-text")){
                    element.classList.remove('hidden-content');
                }
            })
        } else {
            elements.forEach(element => {
                if(element.id !== "loading-screen" && !element.classList.contains("spinner") && !element.classList.contains("spinner-text")){
                    element.classList.add('hidden-content');
                }
            })
        }
    }


    // Custom event name
    const SVG_LOADED_EVENT = 'svgLoaded';

    // Event listener for the custom event
    document.addEventListener(SVG_LOADED_EVENT, () => {
        showContent = true;
        updateContentVisibility();
    });


    // Function to watch areAllSVGsLoaded and dispatch event when true
    function watchSVGLoading() {
        if (areHalfOneLoaded() && ready) {
            const event = new CustomEvent(SVG_LOADED_EVENT);
            document.dispatchEvent(event);
            hideLoadingScreen();
            // Disable Scroll until ok is clicked
            // Unlock page (remove warning) on button click
            document.getElementById('unlockScrollButton').addEventListener('click', function() {
                unlockScroll()
                document.removeEventListener('wheel', preventScroll);
                document.removeEventListener('touchmove', preventScroll);
                document.querySelector(".warning").style.opacity = 0;
                document.querySelector(".warning").style.display = "none";
                document.getElementById("scrollDown").addEventListener("click", () => {
                    scrollToSection(1);
                })
                this.disabled = true;
            });
        } else {
            requestAnimationFrame(watchSVGLoading);
        }
    }

    // Hide content on document load
    updateContentVisibility();

    // Show Loading Screen Until Assets are Loaded

    // Show content on assets load
    watchSVGLoading();
}

// Hide the loading screen
function hideLoadingScreen() {
    document.getElementById('loading-screen').style.opacity = 0;
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = "none";
    }, 1000)
}

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
    video.volume = 0.05;
    video.play();
}  

const pauseVideo = (container) => {
    const video = document.querySelector(`${container} video`);
    video.pause();
}
function addNewStyle(newStyle) {
    let styleElement = document.getElementById('styles_js');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.id = 'styles_js';
        document.getElementsByTagName('head')[0].appendChild(styleElement);
    }
    styleElement.appendChild(document.createTextNode(newStyle));
}
function removeStyle(styleToRemove) {
    let styleElement = document.getElementById('styles_js');
    if (styleElement) {
        let styleText = styleElement.innerHTML;
        let newStyleText = styleText.replace(styleToRemove, '');
        styleElement.innerHTML = newStyleText;
    }
}
let loadedImages = {};
function changeImage(image, newImage, size, cs) {
    const prevImage = image.getAttribute("src");
    return gsap.to(image, {
        onComplete: () => {
            image.setAttribute("src", newImage);
            if(cs === "twentytwo"){
                addNewStyle("#twentytwo img {width: " + size + "}");
            }
            gsap.fromTo(image, // Use fromTo for combined animation
                { opacity: 0 },
                { opacity: 1, duration: 0.5 }
            );
        },
        onReverseComplete: () => {
            image.setAttribute("src", prevImage);
            gsap.fromTo(image, { opacity: 0 }, { opacity: 1, duration: 0.5 });
            if(cs === "twentytwo"){
                removeStyle("#twentytwo img {width: " + size + "}");
            }
        },
    });
}

// async function loadLocalSVGImage(name, path, coordinates) {
//     // Fetch the SVG image as a text string
//     let response = await fetch(path);
//     let svgText = await response.text();

//     // Parse the SVG to get its dimensions
//     let parser = new DOMParser();
//     let svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
//     let svgElement = svgDoc.documentElement;

//     // Ensure SVG has explicit width and height
//     if (!svgElement.hasAttribute('width')) svgElement.setAttribute('width', '100%');
//     if (!svgElement.hasAttribute('height')) svgElement.setAttribute('height', '100%');

//     let viewBox = svgElement.getAttribute('viewBox');
//     let [, , width, height] = viewBox ? viewBox.split(' ').map(Number) : [null, null, 24, 24];

//     // Create an ultra high-resolution canvas
//     let scale = 16; // Increased for maximum quality
//     let canvas = document.createElement('canvas');
//     canvas.width = width * scale;
//     canvas.height = height * scale;
//     let ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

//     // Enable crisp edges rendering
//     ctx.imageSmoothingEnabled = false;

//     // Modify SVG for better rendering
//     svgElement.setAttribute('width', canvas.width);
//     svgElement.setAttribute('height', canvas.height);

//     // Convert SVG to data URL
//     let svgBlob = new Blob([svgElement.outerHTML], { type: 'image/svg+xml' });
//     let url = URL.createObjectURL(svgBlob);

//     // Load the SVG onto the canvas
//     return new Promise((resolve, reject) => {
//         let img = new Image();
//         img.onload = () => {
//             // Use a technique to render sharp edges
//             ctx.drawImage(img, 0, 0);
//             let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//             ctx.putImageData(imageData, 0, 0);

//             URL.revokeObjectURL(url);

//             // Add the maximum quality image to the map
//             if (!map.hasImage(name)) {
//                 map.addImage(name, ctx.getImageData(0, 0, canvas.width, canvas.height), { 
//                     pixelRatio: scale,
//                     sdf: false
//                 });
//                 if(!map.getSource(name)){
//                     map.addSource(name, {
//                         'type': 'geojson',
//                         'data': {
//                             'type': 'FeatureCollection',
//                             'features': [{
//                                 'type': 'Feature',
//                                 'geometry': {
//                                     'type': 'Point',
//                                     'coordinates': coordinates
//                                 }
//                             }]
//                         }
//                     });
//                 }
//             }
//             resolve();
//         };
//         img.onerror = reject;
//         img.src = url;
//     });
// }

// async function preloadSVGImages() {
//   try {
//     const loadPromises = svgImages.map(async (img) => {
//       try {
//         await loadLocalSVGImage(img.id, img.path, img.coordinates);
//         loadedImages[img.id] = true;
//       } catch (error) {
//         console.error(`Failed to load ${img.id}:`, error);
//         loadedImages[img.id] = false;
//       }
//     });

//     await Promise.all(loadPromises);
//   } catch (error) {
//     console.error('Error in preloading SVGs:', error);
//   }
// }


async function preloadMainImages() {
    try {
      const loadPromises = svgImages.map(async (img) => {
        try {
          await loadLocalImage(img.id, img.path, img.coordinates);
          loadedImages[img.id] = true;
        } catch (error) {
          console.error(`Failed to load ${img.id}:`, error);
          loadedImages[img.id] = false;
        }
      });
  
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Error in preloading SVGs:', error);
    }
}

function areAllMainImagesLoaded(){
    return svgImages.every(img => loadedImages[img.id] === true);
}

function areHalfOneLoaded(){
    let sImages = [];
    for(let i = 0; i < 8; i++){
        sImages.push(svgImages[i]);
    }
    return sImages.every(img => loadedImages[img.id] === true);
}

// function areAllSVGsLoaded() {
//     return svgImages.every(img => loadedImages[img.id] === true);
// }

async function loadLocalImage(name, path, coordinates){
    let image = await map.loadImage(path);
    if(!map.hasImage(name)){
        map.addImage(name, image.data);
        if(!map.getSource(name)){
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
}

function unloadLocalImage(name){
    if(map.hasImage(name)){
        map.removeImage(name);
        if(map.getSource(name)){
            map.removeSource(name);
        }
    }
}


function addImageLayer(name, size, rotation=0, duration=0.1, before=false){
    // if(!loadedImages[name]){
    //     for(const image of svgImages){
    //         if(image.id === name){
    //             await loadLocalImage(name, image.path, image.coordinates)
    //         }
    //     }
    // }

    if(!map.getLayer(name) && map.getSource(name)){
        if(before){
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
                    'icon-allow-overlap': true,
                    'icon-anchor': 'center',
                    'icon-rotate': rotation,
                },
                'paint': {
                    'icon-opacity': 0
                }
            }, before);
        }else{
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
                    'icon-allow-overlap': true,
                    'icon-anchor': 'center',
                    'icon-rotate': rotation,
                },
                'paint': {
                    'icon-opacity': 0
                }
            });
        }
    }
    if(map.getLayer(name)){
        let miniTimeline = gsap.timeline();
        return miniTimeline.to({ opacity: 0 }, {
            opacity: 1,
            duration: duration,
            ease: "power2.out",
            onUpdate: function () {
                map.setPaintProperty(name, 'icon-opacity', this.targets()[0].opacity);
            }
        });
    }
}

// function addSVGImageLayer(name, size, rotation=0, duration=0.1, before=false){
//     if(!map.getLayer(name) && map.getSource(name)){
//         if(before){
//             map.addLayer({
//                 'id': name,
//                 'type': 'symbol',
//                 'source': name,
//                 'layout': {
//                     'icon-image': name,
//                     'icon-size': ['interpolate', ['linear'], ['zoom'],
//                         9, size / 1.5,
//                         13, size * 1.5,
//                         14, size * 4,
//                         15, size * 8,
//                     ],
//                     'icon-allow-overlap': true,
//                     'icon-anchor': 'center',
//                 }
//             }, before);
//         }else{
//             map.addLayer({
//                 'id': name,
//                 'type': 'symbol',
//                 'source': name,
//                 'layout': {
//                     'icon-image': name,
//                     'icon-size': ['interpolate', ['linear'], ['zoom'],
//                         9, size / 1.5,
//                         13, size * 1.5,
//                         14, size * 4,
//                         15, size * 8,
//                     ],
//                     'icon-allow-overlap': true,
//                     'icon-rotate': rotation
//                 }
//             });
//         }
//     }
//     if(map.getLayer(name)){
//         return gsap.to({ opacity: 0 }, {
//             opacity: 1,
//             duration: duration,
//             onUpdate: function () {
//               map.setPaintProperty(name, 'icon-opacity', this.targets()[0].opacity);
//             },
//         });
//     }
// }

function getCoordinates(id){
    if(isMobileScreen()){
        switch(id){
            case 'south-one':
                return [34.271243, 31.230319]
            case 'south-three':
                return [34.269890, 31.229988]
            case 'mawasi-eight':
                return [34.245353, 31.331912]
        }
    }else{
        switch(id){
            case 'south-one':
                return [34.27204, 31.23714]
            case 'south-three':
                return [34.270901, 31.235705]
            case 'mawasi-eight':
                return [34.241040, 31.331591];
        }
    }
}

const svgImages = [
    {id: 'arrow', path: 'assets/map_arrow_one.png', coordinates: [34.40864, 31.45657]},
    {id: 'arrow-2', path: 'assets/map_arrow_two.png', coordinates: [34.41148, 31.45489]},
    {id: 'arrow-2-2', path: 'assets/map_arrow_two_two.png', coordinates: [34.30872, 31.32629]},
    {id: 'arrow-3', path: 'assets/map_arrow_three.png', coordinates: [34.26836, 31.28998]},
    { id: 'rafah', path: 'assets/imagery/rafah.png', coordinates: [34.242789, 31.308767]},
    { id: 'rafah-two', path: 'assets/imagery/rafah_2.png', coordinates: [34.242789, 31.308767]},
    { id: 'rafah-three',path:  'assets/imagery/rafah_3.png', coordinates: [34.242789  + 0.003, 31.308767]},
    { id: 'rafah-four',path:  'assets/imagery/rafah_4.png', coordinates: [34.242789  + 0.003, 31.308767]},
    { id: 'south-one', path: 'assets/imagery/south_1.png', coordinates: getCoordinates('south-one')},
    { id: 'south-two', path: 'assets/imagery/south_2.png', coordinates: getCoordinates('south-one')},
    { id: 'south-three', path: 'assets/imagery/south_3.png', coordinates: getCoordinates("south-three")},
    { id: 'mawasi', path: 'assets/imagery/mawasi.png', coordinates: [34.265655, 31.349355]},
    { id: 'mawasi-two', path: 'assets/imagery/mawasi_2.png', coordinates: [34.300712, 31.377954]},
    { id: 'mawasi-two-two', path: 'assets/imagery/mawasi_2_2.png', coordinates: [34.300712, 31.377954]},
    { id: 'mawasi-four', path: 'assets/imagery/mawasi_4.png', coordinates: [34.296442, 31.375787]},
    { id: 'mawasi-five', path: 'assets/imagery/mawasi_5.png', coordinates: [34.296442, 31.375787]},
    { id: 'mawasi-six', path: 'assets/imagery/mawasi_6.png', coordinates: [34.238994, 31.332507]},
    { id: 'mawasi-seven', path: 'assets/imagery/mawasi_7.png', coordinates: [34.230671, 31.330667]},
    { id: 'mawasi-eight', path: 'assets/imagery/mawasi_8.png', coordinates: [34.238994, 31.332507]},
];

const gazaCoordinates = [34.46991,31.39533];

function isMobileScreen() {
    return window.innerWidth <= 768; // Adjust this breakpoint as needed
}

function isMobileScreenX() {
    return window.innerWidth <= 578; // Adjust this breakpoint as needed
}

// Function to get appropriate bounds based on screen size
function getGazaBounds() {
    if (isMobileScreen()) {
        // Tighter bounds for mobile screens
        return [
            [34.075, 31.25],  // Southwest coordinates (moved down a little)
            [34.625, 31.55]   // Northeast coordinates (moved down a little)
        ];
    } else {
        // Wider bounds for larger screens
        return [
            [34.225, 31.225], // Southwest coordinates
            [34.775, 31.725]  // Northeast coordinates
        ];
    }
}

function getIconSize(size, accurate = false){
    if(accurate){
        return isMobileScreen() ? size - 0.1 : size;
    }
    if(isXl()){
        return size + 0.1;
    }
    return isMobileScreen() ? size  - 0.10 : size;
}
function isXl(){
    return window.innerWidth >= 1800;
}
// Add Support for RTL Languages 
maplibregl.setRTLTextPlugin(
    'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
    true // Lazy load the plugin
);

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/basic/style.json?key=KhB7EN0Px2jwIG045quV',
    center: gazaCoordinates,
    zoom: 9.999, // Set initial zoom to desired level
    interactive: false
});


async function loadHalfOne(){
    for(let i = 0; i < 8; i++){
        await loadLocalImage(svgImages[i].id, svgImages[i].path, svgImages[i].coordinates);
        loadedImages[svgImages[i].id] = true;
    }
    return true;
}


function removeHalfTwo(){
    for(let i = 8; i > 14; i++){
        removePreviousLayer(svgImages[i].id, 'icon-opacity', true);
    }
}

async function loadHalfTwo(){
    for(let i = 7; i < 14; i++){
        await loadLocalImage(svgImages[i].id, svgImages[i].path, svgImages[i].coordinates);
        loadedImages[svgImages[i].id] = true;
    }
    return true;
}
async function loadHalfTwoPartTwo(){
    for(let i = 14; i < 20; i++){
        await loadLocalImage(svgImages[i].id, svgImages[i].path, svgImages[i].coordinates);
        loadedImages[svgImages[i].id] = true;
    }
    return true;
}

function removeHalfTwoPartTwo(){
    for(let i = 14; i > 20; i++){
        removePreviousLayer(svgImages[i].id, 'icon-opacity', true);
    }
}

function removeAll(){
    for(let i = 0; i < svgImages.length; i++){
        removePreviousLayer(svgImages[i].id, 'icon-opacity', true);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    scrollToSection(0);
    // detectBrowser();
    document.querySelectorAll("video").forEach(video => {
        video.addEventListener('error', (e) => {
            console.log("Error loading video:" + e);
        });
        video.load();
        video.addEventListener('canplay', () => {
            video.previousElementSibling.style.display = 'none';
        });
    });
    loadHalfOne();
    showLoading();
    const isFirefox = typeof InstallTrigger !== 'undefined';
    if (isFirefox && isMobileScreen()) {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.removeAttribute('controls');
        });
    }
});

async function animate(container, tl){
    tl = gsap.timeline({
        defaults: {ease: "power2.in"},
        scrollTrigger: {
            trigger: container,
            start: "top 50%",
            end: "bottom bottom",
            toggleActions: "play none none reverse",
            preventOverlaps: true,
            fastScrollEnd: true
        }
    })
    tl.to(container, {opacity: 1, duration: 0.5})
    const currentId = container.id;
    switch (currentId) {
        case "one":
            // Remove labels
            tl.add(switchLabelsVisibility("none", ['label_country', 'label_place_city', 'label_place_other', 'label_road']));

            // Remove layers
            tl.add(removePreviousLayer('main-streets', 'line-opacity'));

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
            break;
        case "two-two":
            // Show the North
            tl.add(addNewLayer('gaza-north', gaza_north, 'fill', {
                'fill-color': '#f07f79',
                'fill-opacity': 1,
            }, false))
            // Show the Arrow
            tl.add(addImageLayer("arrow", getIconSize(0.9, true)))
            // Show Evacuation Area 1
            
            break;
        case "two-three":
            // Show Evacuation Area 2
            
            // // Remove Arrow 1
            
            // // Add Arrows for Area 2
            
            break;
        case "two-four":
            tl.add(removePreviousLayer("gaza-north", 'fill-opacity'));
            tl.add(removePreviousLayer("arrow", "icon-opacity"))
            tl.add(addNewLayer('evac-area-one', evac_area_1, 'fill', {
                'fill-color': '#FFDAD7e0',
            }, 'gaza-block', {animationOpacity: 1}))
            tl.add(addNewLayer('evac-area-two', evac_area_2, 'fill', {
                'fill-color': '#FFDAD7e0',
                'fill-opacity': 1,
            }, 'gaza-block'))
            tl.add(addNewLayer('evac-area-three-one', evac_area_3_1, 'fill', {
                'fill-color': '#006579e0',
                'fill-opacity': 1,
            }, 'gaza-block'))
            
            tl.add(addNewLayer('evac-area-three-two', evac_area_3_2, 'fill', {
                'fill-color': '#006579e0',
                'fill-opacity': 1,
            }, 'gaza-block'))
            // Show Evacuation Area 4
            tl.add(addNewLayer('evac-area-four', evac_area_4, 'fill', {
                'fill-color': '#FFDAD7e0',
                'fill-opacity': 1,
            }, 'gaza-block'))
            tl.add(addImageLayer("arrow-2", getIconSize(0.5, true)))
            tl.add(addImageLayer("arrow-2-2", getIconSize(0.8, true)))
            break;
        case "two-five":
            tl.add(removePreviousLayer("evac-area-one", 'fill-opacity'));
            tl.add(removePreviousLayer("evac-area-two", 'fill-opacity'));
            tl.add(removePreviousLayer("evac-area-three-one", 'fill-opacity'));
            tl.add(removePreviousLayer("evac-area-three-two", 'fill-opacity'));
            tl.add(removePreviousLayer("arrow-2", 'icon-opacity'));
            tl.add(removePreviousLayer("arrow-2-2", 'icon-opacity'));
            tl.add(addNewLayer('evac-area-three-three', evac_area_3_3, 'fill', {
                'fill-color': '#FFDAD7e0',
                'fill-opacity': 1,
            }, 'gaza-block'))
            // Show Evacuation Area 5
            tl.add(addNewLayer('evac-area-five', evac_area_5, 'fill', {
                'fill-color': '#006579e0',
                'fill-opacity': 1,
            }, false))
            // Show arrows 3
            tl.add(addImageLayer("arrow-3", getIconSize(0.9, true)))
            break;
        case "three-two":
            tl.add(removePreviousLayer("evac-area-three-three", "fill-opacity"))
            tl.add(removePreviousLayer("evac-area-four", "fill-opacity"))
            tl.add(removePreviousLayer("evac-area-five", "fill-opacity"))
            tl.add(removePreviousLayer("arrow-3", 'icon-opacity'));

            // const textSource = {
            //     type: 'geojson',
            //     data: {
            //         type: 'FeatureCollection',
            //         features: [
            //             {
            //                 type: 'Feature',
            //                 geometry: {
            //                     type: 'Point',
            //                     coordinates: [34.242789, 31.308767], // Example coordinates [longitude, latitude]
            //                 },
            //                 properties: {
            //                     title: 'Your Text Here'
            //                 }
            //             }
            //         ]
            //     }
            // };

            // map.addSource('textSource', textSource);
            // map.addLayer({
            //     id: 'textLayer',
            //     type: 'symbol',
            //     source: 'textSource',
            //     layout: {
            //         'text-field': ['get', 'title'],
            //         'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            //         'text-size': 20,
            //         'text-offset': [0, 0.6],
            //         'text-anchor': 'top'
            //     },
            //     paint: {
            //         'text-color': '#000000'
            //     }
            // });

            // add the image
            tl.add(addImageLayer("rafah", getIconSize(0.3)))

            map.flyTo({
                center: [34.242789, 31.308767],
                essential: true,
                zoom: 14
            });
            break;
        case "three-three":
            loadHalfTwo();
            // Remove Second Image
            tl.add(removePreviousLayer('rafah', 'icon-opacity'));
            
            tl.add(addImageLayer("rafah-two", getIconSize(0.28)))
            // add the third image
            
            break;
        case "three-four":
            // Remove second image
            tl.add(removePreviousLayer("rafah-two", 'icon-opacity'))
            // add the third image
            tl.add(addImageLayer("rafah-three", getIconSize(0.23)))
            break;
        case "three-five":
            tl.add(removePreviousLayer("rafah-three", 'icon-opacity'))
            tl.add(addImageLayer("rafah-four", getIconSize(0.23)))
            break;
        case "four":
            // Hide The Map
            tl.add(removePreviousLayer("rafah-four", 'icon-opacity'))
            tl.add(hideMap());
            break;
        case "five-two":
            tl.add(showMap());
            tl.to("#five-two .content-child", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from("#five-two .content-child", {y: 100, duration: 0.1})
            // Show The Map
            map.flyTo({
                center: [34.27204, 31.23714],
                essential: true,
                zoom: 13.5
            })
            tl.add(addImageLayer("south-two", getIconSize(0.3)))
            break;
        case "five-three":
            tl.add(addImageLayer("south-three", getIconSize(0.3)))
            break;
        case "six":
            tl.to("#five-two .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#five-two .content-child", {position: 'unset !important', duration: 0.1})
            // Hide The Map
            tl.add(hideMap());
            tl.add(removePreviousLayer("south-two", "icon-opacity"))
            tl.add(removePreviousLayer("south-three", "icon-opacity"))
            break;
        case "seven":
            tl.to("#seven .content-child", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from("#seven .content-child", {y: 100, duration: 0.1})
            // Show The Map
            tl.add(showMap());

            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            
            tl.add(removePreviousLayer("gaza-block", "line-opacity"));
            tl.add(removePreviousLayer("gaza-block-lines", "line-opacity"))
            tl.add(removePreviousLayer("gaza", "fill-opacity"))
            
            map.setPaintProperty("road_path", "line-color", "black")
            map.setPaintProperty("road_major", "line-color", "black")
            map.setPaintProperty("road_minor", "line-color", "black")
            // tl.add(addNewLayer("gaza-streets", mainStreets, "line", {
            //     'line-color': 'black'
            // }))
            if(isMobileScreen()){
                map.flyTo({
                    zoom: 11,
                    center: [34.267808, 31.350360]
                })
                tl.add(addImageLayer("mawasi", 0.37))
            }else{
                map.flyTo({
                    zoom: 12,
                    center: [34.267808, 31.350360]
                })
                tl.add(addImageLayer("mawasi", 0.62))
            }
            // tl.add(switchLabelsVisibility("visible", ['label_country', 'label_place_city', 'label_place_other', 'label_road']));
            break;
        case "eight":
            tl.to("#seven .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#seven .content-child", {position: 'unset !important', duration: 0.1})
            tl.add(removePreviousLayer("mawasi", "icon-opacity"))
            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            break;
        case "nine":
            tl.add(hideMap());
            break;
        case "ten": // Refugee Graphics
            // Hide The Map
            const images = document.querySelectorAll(".animated-image");
            images.forEach(image => {
                tl.to(image, {visibility: 'visible', opacity: 1, duration: 0.1})
                tl.from(image, {y: 100, duration: 0.1, clearProps: "transform"})
            })
            break;
        case "ten-two":
            tl.to("#ten-two .content-child .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from("#ten-two .content-child .text-graphics", {y: 100, duration: 0.1, clearProps: "transform"})
            break;
        case "ten-three":
            tl.to("#ten-three .content-child .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from("#ten-three .content-child .text-graphics", {y: 100, duration: 0.1, clearProps: "transform"})
            break;
        case "ten-four":
            tl.to("#ten-four .content-child .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from("#ten-four .content-child .text-graphics", {y: 100, duration: 0.1, clearProps: "transform"})
            break;
        case "eleven":
            const imagess = document.querySelectorAll(".animated-image");
            imagess.forEach(image => {
                tl.set(image, {visibility: 'hidden', opacity: 1, y: 0, duration: 0.1})
                tl.to(image, {position: 'unset !important', duration: 0.1})
            })
            tl.set("#ten-two .content-child .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.set("#ten-three .content-child .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.set("#ten-four .content-child .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#ten-two .content-child .text-graphics", {position: 'unset !important', duration: 0.1})
            tl.to("#ten-three .content-child .text-graphics", {position: 'unset !important', duration: 0.1})
            tl.to("#ten-four .content-child .text-graphics", {position: 'unset !important', duration: 0.1})
            tl.progress(1);
            // Show The Map
            tl.add(showMap());
            map.flyTo({
                zoom: 13,
                essential: true,
                center: [34.300712, 31.377954]
            })
            tl.add(addImageLayer("mawasi-two", getIconSize(0.5)))
            tl.to("body", {
                backgroundColor: "#3e3e3e",
            })
            loadHalfTwoPartTwo();
            break;
        case "eleven-two":
            tl.add(removePreviousLayer("mawasi-two", "icon-opacity"))
            tl.add(addImageLayer("mawasi-two-two", getIconSize(0.5)))
            break;
        case "twelve":
            // Hide The Map
            tl.add(hideMap());

            tl.add(removePreviousLayer("mawasi-two-two", "icon-opacity"))
            break;
        case "thirteen":
            tl.to(".animated-video", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from(".animated-video", {y: 100, duration: 0.1, clearProps: "transform"})
            playVideo("#thirteen")
            break;
        case "fourteen":
            tl.to("#fourteen .text-graphics", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from("#fourteen .text-graphics", {y: 100, duration: 0.1})
            break;
        case "seventeen":
            tl.to("body", {
                backgroundColor: "#373737",
            })
            tl.to(".animated-video", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to(".animated-video", {position: 'unset !important', duration: 0.1})

            tl.to("#fourteen .fixed img", {visibility: "hidden", opacity: 0, y: 0, duration: 0.1})

            tl.to("#fourteen .fixed", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#fourteen .fixed", {position: 'unset !important', duration: 0.1})

            tl.to("#thirteen .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#thirteen .text-graphics", {position: 'unset !important', duration: 0.1})

            tl.to("#seventeen .content-child", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from("#seventeen .content-child", {y: 100, duration: 0.1})

            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            tl.add(showMap());
            tl.add(addImageLayer("mawasi-four", getIconSize(0.4))) 
            map.flyTo({
                zoom: 13.2,
                essential: true,
                center: [34.296442, 31.375787]
            })
            break;
        case "eighteen":
            tl.add(removePreviousLayer("mawasi-four", "icon-opacity"));
            tl.add(addImageLayer("mawasi-five", getIconSize(0.4))) 
            break;
        case "eighteen-two":
            tl.to("#seventeen .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#seventeen .content-child", {position: 'unset !important', duration: 0.1})
            tl.add(hideMap());
            break;
        case "sixteen":
            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            break;
        case "nineteen":
            playVideo("#nineteen");
            tl.to("#seventeen .content-child", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#seventeen .content-child", {position: 'unset !important', duration: 0.1})

            tl.to("#map", {
                opacity: 0,
                visibility: 'none',
                duration: 1
            });
            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            tl.add(removePreviousLayer("mawasi-five", "icon-opacity"))

            tl.to(".animated-image-three", {visibility: "visible", opacity: 1, duration: 0.1})
            tl.from(".animated-image-three", {y: 100, duration: 0.1})
            break;
        case "twentyone":
            pauseVideo("#nineteen")
            playVideo("#twentyone")
            tl.to(".animated-image-three", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to(".animated-image-three", {position: 'unset !important', duration: 0.1})
            tl.to("#twentytwo img", {position: 'fixed', opacity: 0, duration: 0.1})
            tl.to("#twentytwo .text-graphics", {position: 'fixed', opacity: 0, duration: 0.1})
            break;
        case "twentytwo":
            tl.to("#twentytwo img", {opacity: 1, duration: 0.1})
            tl.to("#twentytwo .text-graphics", {opacity: 1, duration: 0.1})
            pauseVideo("#twentyone")
            break;
        case "twentythree":
            const animatedImages = document.querySelector("#twentytwo img");
            if(isMobileScreenX()){
                tl.add(changeImage(animatedImages, "./assets/GBU-39.png", "80% !important", "twentytwo"));
            }else{
                tl.add(changeImage(animatedImages, "./assets/GBU-39.png", "20% !important", "twentytwo"));
            }
            break;
        case "twentyfour":
            const animatedImagess = document.querySelector("#twentytwo img");
            if(isMobileScreenX()){
                tl.add(changeImage(animatedImagess, "./assets/GBU-39_destroyed.png", "80% !important", "twentyfour"));
            }else{
                tl.add(changeImage(animatedImagess, "./assets/GBU-39_destroyed.png", "20% !important", "twentyfour"));
            }
            break;
        case "twentyfive":
            tl.to("#twentytwo img", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#twentytwo img", {position: 'unset !important', duration: 0.1})

            tl.to("#twentytwo .text-graphics", {visibility: "hidden", opacity: 1, y: 0, duration: 0.1})
            tl.to("#twentytwo .text-graphics", {position: 'unset !important', duration: 0.1})
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
            tl.add(showMap());

            // ,
            if(isMobileScreen()){
                tl.add(addImageLayer("mawasi-six", getIconSize(0.59))) 
                map.flyTo({
                    zoom: 13,
                    essential: true,
                    center: [34.244100, 31.334291]
                })
            }else{
                tl.add(addImageLayer("mawasi-six", getIconSize(0.28))) 
                map.flyTo({
                    zoom: 14,
                    essential: true,
                    center: [34.244100, 31.334291]
                })
            }

            break;
        case "twentynine":
            tl.add(removePreviousLayer("mawasi-six", 'icon-opacity'))
            if(isMobileScreen()){
                tl.add(addImageLayer("mawasi-seven", getIconSize(0.59))) 
            }else{
                tl.add(addImageLayer("mawasi-seven", getIconSize(0.28)))  
            }
            
            break;
        case "thirty":
            tl.add(removePreviousLayer("mawasi-seven", 'icon-opacity'))
            if(isMobileScreen()){
                tl.add(addImageLayer("mawasi-eight", getIconSize(0.59))) 
                map.flyTo({
                    zoom: 13,
                    essential: true,
                    center: [34.238093, 31.333118]
                })
            }else{
                tl.add(addImageLayer("mawasi-eight", getIconSize(0.28)))  
                map.flyTo({
                    zoom: 15,
                    essential: true,
                    center: [34.238093, 31.333118]
                })
            }
            tl.add(addImageLayer("mawasi-eight", getIconSize(0.28))) 
            
            break;
        case "thirtyone":
            // Hide The Map
            tl.add(hideMap());
            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            tl.add(removePreviousLayer("mawasi-eight", 'icon-opacity'))
            const detachedElements = findDetachedElements();
            cleanDetachedElements(detachedElements);
            break;
        case "thirtythree":
            scrollToTopBtn.style.display = "block";
            break;
    }
    return tl;
}

async function animateBack(container, tl){
    if(tl){
        tl.reverse();
        tl.progress(0);
    }
    const currentId = container.id;
    switch (currentId) {
        case "thirty":
            if(isMobileScreen()){
                map.flyTo({
                    zoom: 13,
                    essential: true,
                    center: [34.244100, 31.334291]
                })
            }else{
                map.flyTo({
                    zoom: 14,
                    essential: true,
                    center: [34.244100, 31.334291]
                })
            }
            break;
        case "twentyseven":
            playVideo("#twentysix");
            break;
        case "twentyeight":
            playVideo("#twentyseven");
            break;
        case "twentyseven":
            pauseVideo("#twentysix");
            break;
        case "twentysix":
            pauseVideo("#twentysix");
            break;
        case "twentytwo":
            playVideo("#twentyone");
            break;
        case "twentyone":
            playVideo("#nineteen");
            pauseVideo("#twentyone");
            break;
        case "nineteen":
            pauseVideo("#nineteen");
            break;
        case "fifteen" || "fourteen":
            playVideo("#thirteen")
            break;
        case "twelve":
            map.flyTo({
                zoom: 13,
                essential: true,
                bearing: 0,
                center: [34.300712, 31.377954]
            })
            break;
        case "thirtyone":
            if(isMobileScreen()){
                map.flyTo({
                    zoom: 13,
                    essential: true,
                    center: [34.238093, 31.333118]
                })
            }else{
                map.flyTo({
                    zoom: 15,
                    essential: true,
                    center: [34.238093, 31.333118]
                })
            }
            break;
        case "nineteen":
            map.flyTo({
                zoom: 15,
                essential: true,
                center: [34.296442, 31.375787]
            })
            break;
        case "eighteen":
            
            break;
            case "eighteen-two":
            if(isMobileScreen()){
                map.flyTo({
                    zoom: 13.2,
                    bearing: 42,
                    essential: true,
                    center: [34.296442, 31.375787]
                })
            }else{
                map.flyTo({
                    zoom: 13.2,
                    essential: true,
                    center: [34.296442, 31.375787]
                })
            }
            
            break;
        case "seventeen":
            map.flyTo({
                zoom: 13,
                essential: true,
                center: [34.285983, 31.375169]
            })
            break;
        case "sixteen":
            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            break;
        case "eight":
            if(isMobileScreen()){
                map.flyTo({
                    zoom: 11,
                    center: [34.267808, 31.350360]
                })
            }else{
                map.flyTo({
                    zoom: 12,
                    center: [34.267808, 31.350360]
                })
            }

            break;
        case "seven-two":
            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            break;
        case "six":
            removeHalfTwo();
            removeHalfTwoPartTwo();
            map.flyTo({
                center: [34.27204, 31.23714],
                essential: true,
                zoom: 13.5
            })
            break;
        case "four":
            map.flyTo({
                center: [34.242789, 31.308767],
                essential: true,
                zoom: 14
            });
            break;
        case "three-two":
            map.fitBounds(getGazaBounds(), {
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                maxZoom: 15, 
                duration: 1000
            });
            break;
        case "one":
            scrollToTopBtn.style.display = "none";
            break;
    }
}
let ready = false;
map.on('idle', (e) => {
    ready = true;
});

map.on('load', async () => {
    map.fitBounds(getGazaBounds(), {
        padding: { top: 20, bottom: 20, left: 20, right: 20 },
        maxZoom: 15, 
        duration: 1000
    });

    const layers = map.getStyle().layers;
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
    // preloadSVGImages();
    const containers = gsap.utils.toArray(".content-container");

    gsap.registerPlugin(ScrollTrigger);
    containers.forEach(container => {
        let tl = gsap.timeline({
            defaults: {ease: "power2.in"},
            scrollTrigger: {
                trigger: container,
                start: "top 50%",
                end: "bottom bottom",
                preventOverlaps: true,
                fastScrollEnd: true,
                onEnter: () => animate(container, tl),
                onLeaveBack: () => animateBack(container, tl),
            }
        });
    });

    init();
})

/*** Handle Scrolls ***/




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
                ease: "power2.out",
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
        if(!map.getSource(id)){
            map.addSource(id, {
                type: "geojson",
                data: _data
            });
        }
        if(!map.getLayer(id)){
            if(before && map.getLayer(before)){
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
        }
    }catch(error){
        console.log(error);
    }
    let miniTimeline = gsap.timeline();
    if(map.getLayer(id)){
        return miniTimeline.to({ opacity: 0 }, {
            opacity: animationOpacity,
            duration: duration,
            ease: "power2.out",
            onUpdate: function () {
                map.setPaintProperty(id, opacityProperty, this.targets()[0].opacity);
            }
        });
    }

}

const removePreviousLayer = (layerId, property, remove = false, duration = 0.2) => {
    let miniTimeline = gsap.timeline();
    if(map.getLayer(layerId)){
        return miniTimeline.to({ opacity: 1 }, {
            opacity: 0,
            duration: duration,
            ease: "power2.out",
            onUpdate: function () {
                    if(remove){
                        map.removeLayer(layerId);
                        unloadLocalImage(layerId);
                    }else{
                        map.setPaintProperty(layerId, property, this.targets()[0].opacity);
                        map.setLayoutProperty(layerId, "visibility", this.targets()[0].opacity >= 1 ? 'visible' : 'none')
                    }
            },
        });
    }
};

// Function to show the map
function showMap() {
    return gsap.to("#map", {
        opacity: 1,
        duration: 0.1,
    });
}

// Function to hide the map
function hideMap() {
    return gsap.to("#map", {
        opacity: 0,
        duration: 0.1,
    });
}

const switchLabelsVisibility = (visibility, labels, duration = 0.5) => {
    labels.forEach(label => {
        gsap.from({}, {
            duration: duration,
            ease: "power2.out",
            onUpdate: function () {
                map.setLayoutProperty(label, 'visibility', visibility);
            }
        });
    })
}