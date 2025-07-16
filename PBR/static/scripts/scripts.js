// VARIABLES
// Recents Logic
const RECENT_TEXTURES_KEY = 'recentTextures';
const MAX_RECENTS = 5;
const recentTexturesDiv = document.getElementById('recentTextures');
const noRecentTextures = document.getElementById('noRecentTextures');

// Pixelate
let isPixelateMode = false;
let pixelatedTextures = {};
const pixelateControls = document.getElementById('pixelateControls');
const pixelateSizeRange = document.getElementById('pixelateSizeRange');
const pixelateSizeValue = document.getElementById('pixelateSizeValue');
const resetPixelateButton = document.getElementById('resetPixelateButton'); // New

// Graphic Novel
let isGraphicNovelMode = false;
let graphicNovelTextures = {};
const graphicNovelControls = document.getElementById('graphicNovelControls');
const graphicNovelButton = document.getElementById('graphicNovelButton');
let outlineStrength = 1.0; // Initialized here
let colorReduction = 32; // Initialized here
const outlineStrengthRange = document.getElementById('outlineStrengthRange');
const outlineStrengthValue = document.getElementById('outlineStrengthValue');
const colorReductionRange = document.getElementById('colorReductionRange');
const colorReductionValue = document.getElementById('colorReductionValue');

// Tools Dropdown
const toolsButton = document.getElementById('toolsButton');
const toolsDropdown = document.getElementById('toolsDropdown');

// Actions Dropdown
const actionsButton = document.getElementById('actionsButton');
const actionsDropdown = document.getElementById('actionsDropdown');
const makeSeamlessOption = document.getElementById('makeSeamlessOption');

// In the global scope (or near the top of your script)
let ground; // Ground plane declared globally
let modalSlidersInitialized = false; // Flag to ensure slider listeners are attached only once
let currentUploadedImage = null; // Store the currently loaded image for re-processing

const MAP_SIZE = 1024; // Use this for all maps

// Basic functionality for image upload (optional, for demonstration)
const imageUpload = document.getElementById('imageUpload');
const uploadArea = document.getElementById('uploadArea');
const uploadInstructions = document.getElementById('uploadInstructions');
const imagePreview = document.getElementById('imagePreview');

// Map settings overlays (now managed by mapSettingsWrapper)
const normalMapOverlay = document.getElementById('normalMapOverlay');
const roughnessMapOverlay = document.getElementById('roughnessMapOverlay');
const aoMapOverlay = document.getElementById('aoMapOverlay');
const metallicMapOverlay = document.getElementById('metallicMapOverlay');
const displacementMapOverlay = document.getElementById('displacementMapOverlay');
const colorMapOverlay = document.getElementById('colorMapOverlay');

// New preview canvases for each map
const normalMapPreviewCanvas = document.getElementById('normalMapPreviewCanvas');
const aoMapPreviewCanvas = document.getElementById('aoMapPreviewCanvas');
const metallicMapPreviewCanvas = document.getElementById('metallicMapPreviewCanvas');
const displacementMapPreviewCanvas = document.getElementById('displacementMapPreviewCanvas');
const colorMapPreviewCanvas = document.getElementById('colorMapPreviewCanvas');

// Mesh Segments for Displacement
let meshSegments = 64; // Default value for plane geometry segments
const meshSegmentsSelect = document.getElementById('meshSegmentsSelect');


////////////////////// RECENT //////////////////////
function addToRecentTextures(dataUrl) {
    let recents = loadRecentTextures();
    // Remove if already exists
    recents = recents.filter(url => url !== dataUrl);
    recents.unshift(dataUrl);
    if (recents.length > MAX_RECENTS) recents = recents.slice(0, MAX_RECENTS);
    saveRecentTextures(recents);
    renderRecentTextures();
}

// Load recents from localStorage
function loadRecentTextures() {
    let recents = [];
    try {
        recents = JSON.parse(localStorage.getItem(RECENT_TEXTURES_KEY)) || [];
    } catch (e) {}
    return recents;
}

// Render recents UI
function renderRecentTextures() {
    const recents = loadRecentTextures();
    recentTexturesDiv.innerHTML = '';
    if (recents.length === 0) {
        noRecentTextures.style.display = '';
        return;
    }
    noRecentTextures.style.display = 'none';
    recents.forEach((dataUrl, idx) => {
        const thumb = document.createElement('img');
        thumb.src = dataUrl;
        thumb.className = 'w-10 h-10 rounded shadow cursor-pointer border border-gray-300 object-cover hover:ring-2 hover:ring-indigo-400';
        thumb.title = 'Click to use this texture';
        thumb.onclick = () => {
            // Load the image again before using it
            const img = new Image();
            img.onload = () => {
                currentUploadedImage = img;
                imagePreview.src = dataUrl;
                imagePreview.classList.remove('hidden');
                uploadInstructions.classList.add('hidden');
                const canvas = createBaseCanvasFromImage(img);
                setAllMapsFromCanvas(canvas);
                extractColorPalette(img);  // Now extract after loading
                // Ensure the correct style mode is active after loading a recent texture
                if (isPixelateMode) {
                    showPixelatePBR();
                } else if (isGraphicNovelMode) {
                    showGraphicNovelEffect();
                }
                else {
                    showOriginalTexture();
                }
                updateMapButtonPreview('pbr', textures.color.image); // Update PBR preview on recent click
                updateGroundMaterial(); // Update ground after loading new texture
                updateModelGeometryForDisplacement(); // <--- Call here for recent textures
            };
            img.src = dataUrl;
        };
        recentTexturesDiv.appendChild(thumb);
    });
}

// Save recents to localStorage
function saveRecentTextures(recents) {
    localStorage.setItem(RECENT_TEXTURES_KEY, JSON.stringify(recents));
}


////////////////////// LIGHT, CAMERA AND ENVIRONMENT //////////////////////


////////////////////// DONATE //////////////////////
function updateDonationGoal(current, goal) {
    document.getElementById('incomeText').textContent = `$${current} / $${goal}`;
    const percent = Math.round((current / goal) * 100);
    document.getElementById('percentageText').textContent = `${percent}%`;
    document.getElementById('incomeProgressBar').style.width = `${percent}%`;
}

////////////////////// PIXEL //////////////////////
// Update showPixelatePBR to use the slider value
function showPixelatePBR() {
    if (model && scene && !scene.children.includes(model)) {
        scene.add(model);
    }
    // Manage 2D preview visibility
    if (currentUploadedImage) {
        imagePreview.classList.remove('hidden');
        uploadInstructions.classList.add('hidden');
    } else {
        imagePreview.classList.add('hidden');
        uploadInstructions.classList.remove('hidden');
    }

    const pixelSize = parseInt(pixelateSizeRange.value, 10);

    function getPixelatedTexture(src, pixelSize, colorSpace) {
        if (!src) return null;
        if (pixelSize === 0) {
            const tex = new THREE.CanvasTexture(src);
            if (colorSpace) tex.colorSpace = colorSpace;
            tex.needsUpdate = true;
            return tex;
        } else {
            const px = pixelateCanvas(src, pixelSize);
            const tex = new THREE.CanvasTexture(px);
            if (colorSpace) tex.colorSpace = colorSpace;
            tex.needsUpdate = true;
            return tex;
        }
    }

    pixelatedTextures.color = getPixelatedTexture(textures.color?.image, pixelSize, THREE.SRGBColorSpace);
    pixelatedTextures.normal = getPixelatedTexture(textures.normal?.image, pixelSize);
    pixelatedTextures.roughness = getPixelatedTexture(textures.roughness?.image, pixelSize);
    pixelatedTextures.ao = getPixelatedTexture(textures.ao?.image, pixelSize);
    pixelatedTextures.metallic = getPixelatedTexture(textures.metallic?.image, pixelSize);
    pixelatedTextures.displacement = getPixelatedTexture(textures.displacement?.image, pixelSize);

    // Apply to material
    material.map = pixelatedTextures.color;
    material.normalMap = pixelatedTextures.normal;
    material.roughnessMap = pixelatedTextures.roughness;
    material.aoMap = pixelatedTextures.ao;
    material.metalnessMap = pixelatedTextures.metallic;
    material.displacementMap = pixelatedTextures.displacement;

    material.needsUpdate = true;
    render();
    updateMapButtonPreview('pbr', material.map.image); // Update PBR preview
    updateGroundMaterial(); // Update ground material after pixelation
}

// Pixelate a canvas
function pixelateCanvas(srcCanvas, pixelSize) {
    const w = srcCanvas.width, h = srcCanvas.height;
    // Step 1: Downscale to pixelSize x pixelSize
    const temp = document.createElement('canvas');
    temp.width = pixelSize;
    temp.height = pixelSize;
    const tctx = temp.getContext('2d');
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(srcCanvas, 0, 0, pixelSize, pixelSize);

    // Step 2: Upscale back to original size, no smoothing
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const octx = out.getContext('2d');
    octx.imageSmoothingEnabled = false;
    octx.drawImage(temp, 0, 0, w, h);
    return out;
}

// Listerners
// Show controls when Pixelate is pressed, hide when Original/Graphic Novel is pressed
document.getElementById('pixelateButton').addEventListener('click', () => {
    isPixelateMode = true;
    isGraphicNovelMode = false;
    pixelateControls.classList.remove('hidden');
    graphicNovelControls.classList.add('hidden');
    showPixelatePBR();
    // Reset environment HDR settings to default when switching modes
    renderer.toneMappingExposure = 0.7;
    scene.environmentIntensity = 1.5;
    render();
});

// Update pixel size label and re-pixelate on slider change
pixelateSizeRange.addEventListener('input', () => {
    pixelateSizeValue.textContent = pixelateSizeRange.value;
    showPixelatePBR();
});

// Reset Pixelate button
resetPixelateButton.addEventListener('click', () => {
    console.log('Reset Pixelate button clicked');
    pixelateSizeRange.value = 112; // Default pixel size
    pixelateSizeValue.textContent = 112;
    updateSliderProgress(pixelateSizeRange);
    showPixelatePBR();
});


////////////////////// GRAPHIC NOVEL //////////////////////
graphicNovelButton.addEventListener('click', () => {
    isGraphicNovelMode = true;
    isPixelateMode = false;
    graphicNovelControls.classList.remove('hidden');
    pixelateControls.classList.add('hidden');
    showGraphicNovelEffect();
    // Reset environment HDR settings to default when switching modes
    renderer.toneMappingExposure = 0.7;
    scene.environmentIntensity = 1.5;
    render();
});

outlineStrengthRange.addEventListener('input', () => {
    outlineStrength = parseFloat(outlineStrengthRange.value);
    outlineStrengthValue.textContent = outlineStrength.toFixed(1);
    updateSliderProgress(outlineStrengthRange);
    showGraphicNovelEffect();
});

colorReductionRange.addEventListener('input', () => {
    colorReduction = parseInt(colorReductionRange.value, 10);
    colorReductionValue.textContent = colorReduction;
    updateSliderProgress(colorReductionRange);
    showGraphicNovelEffect();
});

function showGraphicNovelEffect() {
    // Manage 2D preview visibility
    if (currentUploadedImage) {
        imagePreview.classList.remove('hidden');
        uploadInstructions.classList.add('hidden');
    } else {
        imagePreview.classList.add('hidden');
        uploadInstructions.classList.remove('hidden');
    }

    if (!currentUploadedImage) {
        return;
    }

    const originalCanvas = createBaseCanvasFromImage(currentUploadedImage);
    const graphicNovelResultCanvas = applyGraphicNovelEffect(originalCanvas, outlineStrength, colorReduction);

    if (graphicNovelTextures.color) graphicNovelTextures.color.dispose();
    graphicNovelTextures.color = new THREE.CanvasTexture(graphicNovelResultCanvas);
    graphicNovelTextures.color.colorSpace = THREE.SRGBColorSpace;
    graphicNovelTextures.color.needsUpdate = true;

    material.map = graphicNovelTextures.color;
    // material.normalMap = null; // Graphic novel style usually doesn't use normal maps
    material.normalMap = textures.normal;
    // material.roughnessMap = null;
    material.roughnessMap = textures.roughness;
    // material.aoMap = null;
    material.aoMap = textures.ao;
    // material.metalnessMap = null;
    material.metalnessMap = textures.metalness;
    // material.displacementMap = null;
    material.displacementMap = textures.displacement;

    // material.roughness = 0.5; // Set a default roughness for the graphic novel style
    // material.metalness = 0.5; // Not metallic
    // material.aoMapIntensity = 1.0;
    // material.displacementScale = 0.10;

    material.needsUpdate = true;
    render();
    updateMapButtonPreview('pbr', material.map.image); // Update PBR preview
    updateGroundMaterial(); // Update ground material after graphic novel effect
}

/**
 * Applies a graphic novel effect to an image canvas.
 * This includes edge detection and color quantization.
 * @param {HTMLCanvasElement} imageCanvas The input canvas with the original image.
 * @param {number} outlineStrength Multiplier for outline intensity.
 * @param {number} numColors The number of colors to quantize the image to.
 * @returns {HTMLCanvasElement} A new canvas with the graphic novel effect applied.
 */
function applyGraphicNovelEffect(imageCanvas, outlineStrength = 1.0, numColors = 32) {
    const width = imageCanvas.width;
    const height = imageCanvas.height;

    // 1. Create a canvas for color quantization
    const quantizedCanvas = document.createElement('canvas');
    quantizedCanvas.width = width;
    quantizedCanvas.height = height;
    const quantizedCtx = quantizedCanvas.getContext('2d');
    quantizedCtx.drawImage(imageCanvas, 0, 0);

    // Apply color quantization
    const imageData = quantizedCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Simple color quantization (posterization)
    const factor = 255 / (numColors - 1);
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.round(Math.round(pixels[i] / factor) * factor);
        pixels[i+1] = Math.round(Math.round(pixels[i+1] / factor) * factor);
        pixels[i+2] = Math.round(Math.round(pixels[i+2] / factor) * factor);
    }
    quantizedCtx.putImageData(imageData, 0, 0);


    // 2. Create a canvas for edge detection
    const edgeCanvas = document.createElement('canvas');
    edgeCanvas.width = width;
    edgeCanvas.height = height;
    const edgeCtx = edgeCanvas.getContext('2d');
    edgeCtx.drawImage(imageCanvas, 0, 0); // Draw original for edge detection

    const edgeImageData = edgeCtx.getImageData(0, 0, width, height);
    const edgePixels = edgeImageData.data;
    const grayscalePixels = new Uint8ClampedArray(width * height);

    // Convert to grayscale for edge detection
    for (let i = 0; i < edgePixels.length; i += 4) {
        grayscalePixels[i / 4] = (edgePixels[i] + edgePixels[i+1] + edgePixels[i+2]) / 3;
    }

    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    const edgeOutput = edgeCtx.createImageData(width, height);
    const outputPixels = edgeOutput.data;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const pixelValue = grayscalePixels[(y + ky) * width + (x + kx)];
                    const kernelIndex = (ky + 1) * 3 + (kx + 1);
                    gx += pixelValue * sobelX[kernelIndex];
                    gy += pixelValue * sobelY[kernelIndex];
                }
            }
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            // Invert and scale: higher magnitude (stronger edge) means darker pixel
            const edgeStrength = 255 - Math.min(255, magnitude * outlineStrength);

            const i = (y * width + x) * 4;
            outputPixels[i] = edgeStrength;
            outputPixels[i+1] = edgeStrength;
            outputPixels[i+2] = edgeStrength;
            outputPixels[i+3] = 255; // Alpha
        }
    }
    edgeCtx.putImageData(edgeOutput, 0, 0);

    // 3. Composite: Draw edges over the quantized image
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = height;
    const finalCtx = finalCanvas.getContext('2d');

    finalCtx.drawImage(quantizedCanvas, 0, 0); // Draw quantized image first
    finalCtx.drawImage(edgeCanvas, 0, 0);      // Then draw edges on top

    return finalCanvas;
}

////////////////////// ORIGINAL //////////////////////
function showOriginalTexture() {
    // Ensure 3D model is in the scene
    if (model && scene && !scene.children.includes(model)) {
        scene.add(model);
    }
    // Restore all original textures
    if (textures.color) material.map = textures.color;
    if (textures.normal) material.normalMap = textures.normal;
    if (textures.roughness) material.roughnessMap = textures.roughness;
    if (textures.ao) material.aoMap = textures.ao;
    if (textures.metallic) material.metalnessMap = textures.metallic;
    if (textures.displacement) material.displacementMap = textures.displacement;
    material.needsUpdate = true;

    // Manage 2D preview visibility
    if (currentUploadedImage) {
        imagePreview.classList.remove('hidden');
        uploadInstructions.classList.add('hidden');
    } else {
        imagePreview.classList.add('hidden');
        uploadInstructions.classList.remove('hidden');
    }
    render();
    updateMapButtonPreview('pbr', material.map.image); // Update PBR preview
    updateGroundMaterial(); // Update ground material after reverting to original
}

document.getElementById('originalButton').addEventListener('click', () => {
    isPixelateMode = false;
    isGraphicNovelMode = false;
    pixelateControls.classList.add('hidden');
    graphicNovelControls.classList.add('hidden');
    showOriginalTexture();
    // Reset environment HDR settings to default when switching modes
    renderer.toneMappingExposure = 0.7;
    scene.environmentIntensity = 1.5;
    render();
});


////////////////////// NORMAL //////////////////////
let normalMapStrength = 0.5;
let normalMapInvertY = false;

const closeNormalMapOverlay = document.getElementById('closeNormalMapOverlay');
const normalStrengthSlider = document.getElementById('normalStrengthSlider');
const normalStrengthValue = document.getElementById('normalStrengthValue');
const resetNormalButton = document.getElementById('resetNormalButton');
const invertNormalY = document.getElementById('invertNormalY');

// Listerners
resetNormalButton.addEventListener('click', () => {
    console.log('Reset Normal button clicked');
    normalMapStrength = 0.5;
    normalMapInvertY = false;
    normalStrengthSlider.value = normalMapStrength;
    normalStrengthValue.textContent = normalMapStrength.toFixed(2); // Display with two decimals
    invertNormalY.checked = normalMapInvertY;
    updateSliderProgress(normalStrengthSlider);
    regenerateNormalMap();
});

// Show overlay when normal map button is clicked
document.getElementById('normalMapButton').addEventListener('click', () => {
    console.log('Normal Map button clicked');
    toggleMapOverlay(normalMapOverlay); // Use new toggle function

    normalStrengthSlider.value = normalMapStrength;
    normalStrengthValue.textContent = normalMapStrength.toFixed(2); // Display with two decimals
    invertNormalY.checked = normalMapInvertY;
    updateSliderProgress(normalStrengthSlider); // Ensure progress bar updates
    if (textures.normal && textures.normal.image) {
        drawMapPreview(normalMapPreviewCanvas, textures.normal.image);
    }
});

// Hide overlay
closeNormalMapOverlay.addEventListener('click', () => {
    console.log('Close Normal Map overlay button clicked');
    toggleMapOverlay(normalMapOverlay); // Use new toggle function
});

// Update strength
normalStrengthSlider.addEventListener('input', () => {
    console.log('Normal Strength slider changed to:', normalStrengthSlider.value);
    normalMapStrength = parseFloat(normalStrengthSlider.value);
    normalStrengthValue.textContent = normalMapStrength.toFixed(2); // Display with two decimals
    updateSliderProgress(normalStrengthSlider);
    regenerateNormalMap();
});

// Update invert Y
invertNormalY.addEventListener('change', () => {
    console.log('Invert Normal Y checkbox changed to:', invertNormalY.checked);
    normalMapInvertY = invertNormalY.checked;
    regenerateNormalMap();
});

// Regenerate normal map with current settings
function regenerateNormalMap() {
    if (!currentUploadedImage) return;
    const canvas = createBaseCanvasFromImage(currentUploadedImage);
    if (textures.normal) textures.normal.dispose();
    textures.normal = generateNormalMapFromImage(canvas, normalMapStrength, normalMapInvertY);
    textures.normal.flipY = true;
    material.normalMap = textures.normal;
    material.needsUpdate = true; // Ensure material update
    render();
    updateMapButtonPreview('normal', textures.normal.image); // Update the preview button
    drawMapPreview(normalMapPreviewCanvas, textures.normal.image); // Update the preview canvas
    updateGroundMaterial(); // Update ground material after normal map change
}

// Update generateNormalMapFromImage to support invertY and 0-1 strength
function generateNormalMapFromImage(image, strength = 0.5, invertY = false) {
    const width = image.width;
    const height = image.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    const srcData = ctx.getImageData(0, 0, width, height);
    const dstData = ctx.createImageData(width, height);

    // Convert to grayscale
    const gray = [];
    for (let i = 0; i < srcData.data.length; i += 4) {
        const avg = (srcData.data[i] + srcData.data[i+1] + srcData.data[i+2]) / 3;
        gray.push(avg);
    }

    // Sobel kernels
    const sobelX = [-1,0,1,-2,0,2,-1,0,1];
    const sobelY = [-1,-2,-1,0,0,0,1,2,1];

    for (let y = 1; y < height-1; y++) {
        for (let x = 1; x < width-1; x++) {
            let gx = 0, gy = 0;
            let idx = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const px = x + kx;
                    const py = y + ky;
                    const pixel = gray[py * width + px];
                    gx += pixel * sobelX[idx];
                    gy += pixel * sobelY[idx];
                    idx++;
                }
            }
            // Normal vector calculation using 0-1 strength
            const nx = gx / 255.0 * strength; // Scale gx by strength
            let ny = gy / 255.0 * strength; // Scale gy by strength
            if (invertY) ny = -ny;
            const nz = 1.0; // Z component is always 1 for a flat surface, adjusted for bump

            // Normalize the vector (nx, ny, nz)
            const length = Math.sqrt(nx*nx + ny*ny + nz*nz);
            const r = Math.round(128 + 127 * (nx / length));
            const g = Math.round(128 + 127 * (ny / length));
            const b = Math.round(128 + 127 * (nz / length));
            const i = (y * width + x) * 4;
            dstData.data[i] = r;
            dstData.data[i+1] = g;
            dstData.data[i+2] = b;
            dstData.data[i+3] = 255;
        }
    }
    ctx.putImageData(dstData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}


//////////////////// ROUGHNESS //////////////////////
let roughnessInvert = false;
let roughnessStrength = 0.5;

const closeRoughnessMapOverlay = document.getElementById('closeRoughnessMapOverlay');
const roughnessInvertRange = document.getElementById('roughnessInvertRange');
const roughnessStrengthSlider = document.getElementById('roughnessStrengthSlider');
const roughnessStrengthValue = document.getElementById('roughnessStrengthValue');
const resetRoughnessButton = document.getElementById('resetRoughnessButton');
const roughnessMapPreviewCanvas = document.getElementById('roughnessMapPreviewCanvas'); // Get the new canvas

// Listerners
resetRoughnessButton.addEventListener('click', () => {
    console.log('Reset Roughness button clicked');
    roughnessStrength = 0.5;
    roughnessInvert = false;
    roughnessStrengthSlider.value = roughnessStrength;
    roughnessStrengthValue.textContent = roughnessStrength.toFixed(2);
    roughnessInvertRange.checked = roughnessInvert;
    updateSliderProgress(roughnessStrengthSlider);
    regenerateRoughnessMap();
});

// Show overlay when roughness map button is clicked
document.getElementById('roughnessMapButton').addEventListener('click', () => {
    console.log('Roughness Map button clicked');
    toggleMapOverlay(roughnessMapOverlay);

    roughnessInvertRange.checked = roughnessInvert;
    roughnessStrengthSlider.value = roughnessStrength;
    roughnessStrengthValue.textContent = roughnessStrength.toFixed(2);
    updateSliderProgress(roughnessStrengthSlider);
    // Draw the current roughness map to the preview canvas when opening the overlay
    if (textures.roughness && textures.roughness.image) {
        drawMapPreview(roughnessMapPreviewCanvas, textures.roughness.image);
    }
});

// Hide overlay
closeRoughnessMapOverlay.addEventListener('click', () => {
    console.log('Close Roughness Map overlay button clicked');
    toggleMapOverlay(roughnessMapOverlay);
});

// Update invert
roughnessInvertRange.addEventListener('change', () => {
    console.log('Roughness Invert checkbox changed to:', roughnessInvertRange.checked);
    roughnessInvert = roughnessInvertRange.checked;
    regenerateRoughnessMap();
});

// Update strength
roughnessStrengthSlider.addEventListener('input', () => {
    console.log('Roughness Strength slider changed to:', roughnessStrengthSlider.value);
    roughnessStrength = parseFloat(roughnessStrengthSlider.value);
    roughnessStrengthValue.textContent = roughnessStrength.toFixed(2);
    regenerateRoughnessMap();
    updateSliderProgress(roughnessStrengthSlider);
});

// Regenerate roughness map with current settings
function regenerateRoughnessMap() {
    if (!currentUploadedImage) return;
    const canvas = createBaseCanvasFromImage(currentUploadedImage);
    if (textures.roughness) textures.roughness.dispose();
    textures.roughness = generateRoughnessMapFromImage(canvas, roughnessInvert, roughnessStrength);
    textures.roughness.flipY = true;
    material.roughnessMap = textures.roughness;
    material.needsUpdate = true;
    render();
    updateMapButtonPreview('roughness', textures.roughness.image);
    drawMapPreview(roughnessMapPreviewCanvas, textures.roughness.image); // Update the preview canvas
    updateGroundMaterial(); // Update ground material after roughness map change
}

function generateRoughnessMapFromImage(canvas, invert = false, strength = 1.0) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let imageData;
    try {
        imageData = ctx.getImageData(0, 0, width, height);
    } catch (e) {
        console.error("Could not get image data for roughness map. Ensure image is from the same origin or CORS is handled.", e);
        return null;
    }

    const pixels = imageData.data;
    const roughnessCanvas = document.createElement('canvas');
    roughnessCanvas.width = width;
    roughnessCanvas.height = height;
    const roughnessCtx = roughnessCanvas.getContext('2d');
    if (!roughnessCtx) {
        console.error("Could not get 2D context for the roughness canvas.");
        return null;
    }

    const roughnessImageData = roughnessCtx.createImageData(width, height);
    const roughnessPixels = roughnessImageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        let grayscale = (0.2126 * r + 0.7152 * g + 0.0722 * b); // 0-255

        // Default: brighter areas are rougher. Invert if checkbox is checked.
        if (invert) {
            grayscale = 255 - grayscale;
        }

        // Apply strength: scale the 0-255 value
        let roughnessValue = Math.max(0, Math.min(255, grayscale * strength));
        
        if (strength == 1) {
            roughnessValue = 255; // If strength is 0, set to fully rough
        }

        roughnessPixels[i] = roughnessValue;
        roughnessPixels[i + 1] = roughnessValue;
        roughnessPixels[i + 2] = roughnessValue;
        roughnessPixels[i + 3] = 255; // Alpha
    }

    roughnessCtx.putImageData(roughnessImageData, 0, 0);
    const texture = new THREE.CanvasTexture(roughnessCanvas);
    texture.needsUpdate = true;
    return texture;
}


////////////////////// METALLIC //////////////////////
let metallicStrength = 0.5; // Initialized to 0.5 for 0-1 range
let metallicInvert = false;

const closeMetallicMapOverlay = document.getElementById('closeMetallicMapOverlay');
const metallicInvertRange = document.getElementById('metallicInvertRange');
const metalnessStrengthSlider = document.getElementById('metalnessStrengthSlider');
const metallicStrengthValue = document.getElementById('metallicStrengthValue');
const resetMetallicMapButton = document.getElementById('resetMetallicMap');

// Listerners
// Show overlay when metallic map button is clicked
document.getElementById('metallicMapButton').addEventListener('click', () => {
    console.log('Metallic Map button clicked');
    toggleMapOverlay(metallicMapOverlay);

    metallicInvertRange.checked = metallicInvert;
    metalnessStrengthSlider.value = metallicStrength;
    metallicStrengthValue.textContent = metallicStrength.toFixed(2); // Display as two decimals
    updateSliderProgress(metalnessStrengthSlider);
    if (textures.metallic && textures.metallic.image) {
        drawMapPreview(metallicMapPreviewCanvas, textures.metallic.image);
    }
});

// Hide overlay
closeMetallicMapOverlay.addEventListener('click', () => {
    console.log('Close Metallic Map overlay button clicked');
    toggleMapOverlay(metallicMapOverlay);
});

// Update invert
metallicInvertRange.addEventListener('change', () => {
    console.log('Metallic Invert checkbox changed to:', metallicInvertRange.checked);
    metallicInvert = metallicInvertRange.checked;
    regenerateMetallicMap();
});

// Update strength
metalnessStrengthSlider.addEventListener('input', () => {
    console.log('Metallic Strength slider changed to:', metalnessStrengthSlider.value);
    metallicStrength = parseFloat(metalnessStrengthSlider.value);
    metallicStrengthValue.textContent = metallicStrength.toFixed(2); // Display as two decimals
    regenerateMetallicMap();
    updateSliderProgress(metalnessStrengthSlider);
});

// Reset Metallic Map
resetMetallicMapButton.addEventListener('click', () => {
    console.log('Reset Metallic button clicked');
    metallicStrength = 0.5; // Reset to default slider value (0.5 for 0-1 range)
    metallicInvert = false;
    metalnessStrengthSlider.value = metallicStrength;
    metallicStrengthValue.textContent = metallicStrength.toFixed(2);
    metallicInvertRange.checked = metallicInvert;
    updateSliderProgress(metalnessStrengthSlider);
    regenerateMetallicMap();
});

/**
 * Generates a metalness map from an image drawn on a canvas.
 * The metalness map will be a grayscale image where:
 * - Black (0) represents non-metallic surfaces.
 * - White (255) represents fully metallic surfaces.
 *
 * @param {HTMLCanvasElement} canvas The input canvas containing the source image.
 * @param {boolean} invert If true, inverts the metalness logic: black in source becomes metallic, white becomes non-metallic.
 * @param {number} strength A value from 0.0 to 1.0, controlling the overall intensity/presence of metalness.
 * @returns {HTMLCanvasElement} A new canvas element containing the generated metalness map.
 */
function generateMetalnessMapFromImage(canvas, invert = false, strength = 0.5) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, width, height); // Ensure canvas content is drawn
    const srcData = ctx.getImageData(0, 0, width, height);
    const metalnessCanvas = document.createElement('canvas');
    metalnessCanvas.width = width;
    metalnessCanvas.height = height;
    const metalnessCtx = metalnessCanvas.getContext('2d');
    const metalnessImageData = metalnessCtx.createImageData(width, height);

    for (let i = 0; i < srcData.data.length; i += 4) {
        // Simple average for grayscale (0-1)
        let avg = (srcData.data[i] + srcData.data[i+1] + srcData.data[i+2]) / 3 / 255;

        // Apply strength: scale the grayscale value directly by strength (0-1)
        avg = Math.max(0, Math.min(1, avg * strength));

        // Invert if needed
        if (invert) avg = 1 - avg;

        const val = Math.round(avg * 255);
        metalnessImageData.data[i] = val;
        metalnessImageData.data[i+1] = val;
        metalnessImageData.data[i+2] = val;
        metalnessImageData.data[i+3] = 255;
    }
    metalnessCtx.putImageData(metalnessImageData, 0, 0);
    const texture = new THREE.CanvasTexture(metalnessCanvas);
    texture.needsUpdate = true;
    return texture;
}

// Regenerate metallic map with current settings
function regenerateMetallicMap() {
    if (!currentUploadedImage) return;
    const canvas = createBaseCanvasFromImage(currentUploadedImage);
    if (textures.metallic) textures.metallic.dispose();
    textures.metallic = generateMetalnessMapFromImage(canvas, metallicInvert, metallicStrength);
    textures.metallic.flipY = true;
    material.metalnessMap = textures.metallic;
    material.needsUpdate = true;
    render();
    updateMapButtonPreview('metallic', textures.metallic.image);
    drawMapPreview(metallicMapPreviewCanvas, textures.metallic.image); // Update the preview canvas
    updateGroundMaterial(); // Update ground material after metallic map change
}


////////////////////// AO //////////////////////
let aoStrength = 0.50; // Renamed from aoMapStrength for clarity, now 0-1
let aoInvert = false;

const closeAoMapOverlay = document.getElementById('closeAoMapOverlay');
const aoStrengthSlider = document.getElementById('aoStrengthSlider');
const aoStrengthValue = document.getElementById('aoStrengthValue');
const aoInvertRange = document.getElementById('aoInvertRange');
const resetAOButton = document.getElementById('resetAOButton');

// Listerners
resetAOButton.addEventListener('click', () => {
    console.log('Reset AO button clicked');
    aoStrength = 0.50; // Reset to default (0.50 for 0-1 range)
    aoInvert = false;
    aoStrengthSlider.value = aoStrength;
    aoStrengthValue.textContent = aoStrength.toFixed(2); // Display with two decimals
    aoInvertRange.checked = aoInvert;
    updateSliderProgress(aoStrengthSlider);
    regenerateAOMap();
});

document.getElementById('aoMapButton').addEventListener('click', () => {
    console.log('AO Map button clicked');
    toggleMapOverlay(aoMapOverlay);

    aoStrengthSlider.value = aoStrength;
    aoStrengthValue.textContent = aoStrength.toFixed(2); // Display with two decimals
    aoInvertRange.checked = aoInvert;

    updateSliderProgress(aoStrengthSlider);
    if (textures.ao && textures.ao.image) {
        drawMapPreview(aoMapPreviewCanvas, textures.ao.image);
    }
});

// Update AO strength
aoStrengthSlider.addEventListener('input', () => {
    console.log('AO Strength slider changed to:', aoStrengthSlider.value);
    aoStrength = parseFloat(aoStrengthSlider.value);
    aoStrengthValue.textContent = aoStrength.toFixed(2); // Keep two decimals for display
    regenerateAOMap();
    updateSliderProgress(aoStrengthSlider);
});

// Update AO invert
aoInvertRange.addEventListener('change', () => {
    console.log('AO Invert checkbox changed to:', aoInvertRange.checked);
    aoInvert = aoInvertRange.checked;
    regenerateAOMap();
});

// Hide overlay
closeAoMapOverlay.addEventListener('click', () => {
    console.log('Close AO Map overlay button clicked');
    toggleMapOverlay(aoMapOverlay);
});

/**
 * Generates an Ambient Occlusion (AO) map from an image.
 * This version converts to grayscale and applies a simple blur.
 *
 * @param {HTMLCanvasElement} canvas The input canvas containing the source image.
 * @param {number} strength Multiplier for the AO effect (0.0 to 1.0).
 * @param {boolean} invert If true, inverts the grayscale values.
 * @returns {HTMLCanvasElement} A new canvas element containing the generated AO map.
 */
function generateAOMapFromImage(canvas, strength = 1.0, invert = false) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, width, height); // Ensure canvas content is drawn
    const srcData = ctx.getImageData(0, 0, width, height);
    const aoCanvas = document.createElement('canvas');
    aoCanvas.width = width;
    aoCanvas.height = height;
    const aoCtx = aoCanvas.getContext('2d');
    const aoImageData = aoCtx.createImageData(width, height);
    const aoPixels = aoImageData.data;

    // Convert to grayscale and copy to AO pixels
    for (let i = 0; i < srcData.data.length; i += 4) {
        const r = srcData.data[i];
        const g = srcData.data[i + 1];
        const b = srcData.data[i + 2];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        aoPixels[i] = gray;
        aoPixels[i + 1] = gray;
        aoPixels[i + 2] = gray;
        aoPixels[i + 3] = 255; // Alpha
    }

    // Apply a simple box blur (can be optimized or replaced with Gaussian blur)
    const blurredPixels = new Uint8ClampedArray(aoPixels);
    const radius = 2; // Blur radius
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const idx = (ny * width + nx) * 4;
                        sumR += aoPixels[idx];
                        sumG += aoPixels[idx + 1];
                        sumB += aoPixels[idx + 2];
                        count++;
                    }
                }
            }
            const currentIdx = (y * width + x) * 4;
            blurredPixels[currentIdx] = Math.round(sumR / count);
            blurredPixels[currentIdx + 1] = Math.round(sumG / count);
            blurredPixels[currentIdx + 2] = Math.round(sumB / count);
        }
    }

    // Copy blurred pixels back to aoImageData and apply strength/invert
    for (let i = 0; i < aoImageData.data.length; i += 4) {
        let val = blurredPixels[i]; // Grayscale value (0-255)

        // Apply strength: scale the grayscale value by strength (0-1)
        // If strength is 1.0, value remains unchanged. If 0.0, it becomes black.
        val = Math.max(0, Math.min(255, val * strength));

        // Invert if needed
        if (invert) {
            val = 255 - val;
        }

        aoImageData.data[i] = val;
        aoImageData.data[i + 1] = val;
        aoImageData.data[i + 2] = val;
        aoImageData.data[i + 3] = 255;
    }

    aoCtx.putImageData(aoImageData, 0, 0);
    const texture = new THREE.CanvasTexture(aoCanvas);
    texture.needsUpdate = true;
    return texture;
}

// Regenerate AO map with current settings
function regenerateAOMap() {
    if (!currentUploadedImage) return;
    const canvas = createBaseCanvasFromImage(currentUploadedImage);
    if (textures.ao) textures.ao.dispose();
    textures.ao = generateAOMapFromImage(canvas, aoStrength, aoInvert);
    textures.ao.flipY = true;
    material.aoMap = textures.ao;
    material.aoMapIntensity = 1.0; // Keep this at 1.0, as strength is now baked into the texture
    material.needsUpdate = true;
    render();
    updateMapButtonPreview('ao', textures.ao.image);
    drawMapPreview(aoMapPreviewCanvas, textures.ao.image); // Update the preview canvas
    updateGroundMaterial(); // Update ground material after AO map change
}


////////////////////// DISPLACEMENT //////////////////////
let displacementStrength = 0.10; // Changed default to 0.50 for more noticeable displacement
let displacementInvert = false;
let deformMesh = true; // Default to true for backward compatibility
const deformMeshCheckbox = document.getElementById('deformMeshCheckbox');

const closeDisplacementMapOverlay = document.getElementById('closeDisplacementMapOverlay');
const displacementStrengthRange = document.getElementById('displacementStrengthRange');
const displacementStrengthValue = document.getElementById('displacementStrengthValue');
const resetDisplacementMapButton = document.getElementById('resetDisplacementMap');
const displacementInvertRange = document.getElementById('displacementInvertRange');


// Listerners
resetDisplacementMapButton.addEventListener('click', () => {
    console.log('Reset Displacement button clicked');
    displacementStrength = 0.10;
    displacementInvert = false;
    DeformMesh = true; // Reset to default
    meshSegments = 64;

    displacementStrengthRange.value = displacementStrength;
    displacementStrengthValue.textContent = displacementStrength.toFixed(2);
    displacementInvertRange.checked = displacementInvert;
    DeformMeshCheckbox.checked = DeformMesh; // Reset checkbox
    meshSegmentsSelect.value = meshSegments;

    updateSliderProgress(displacementStrengthRange);
    regenerateDisplacementMap();
});

deformMeshCheckbox.addEventListener('change', () => {
    console.log('Deform Mesh checkbox changed to:', deformMeshCheckbox.checked);
    deformMesh = deformMeshCheckbox.checked;
    updateModelGeometryForDisplacement(); // Update geometry based on new setting
});

// Show overlay when displacement map button is clicked
document.getElementById('displacementMapButton').addEventListener('click', () => {
    console.log('Displacement Map button clicked');
    toggleMapOverlay(displacementMapOverlay);

    displacementStrengthRange.value = displacementStrength;
    displacementStrengthValue.textContent = displacementStrength.toFixed(2); // Display with two decimals
    displacementInvertRange.checked = displacementInvert;
    meshSegmentsSelect.value = meshSegments; // Set select element value

    updateSliderProgress(displacementStrengthRange);

    // --- Wireframe visualization for displacement ---
    if (material) {
        material.wireframe = true;
        material.color.set(0x22c55e);
        material.needsUpdate = true;
        render();
    }
    if (textures.displacement && textures.displacement.image) {
        drawMapPreview(displacementMapPreviewCanvas, textures.displacement.image);
    }
});

// Hide overlay and restore normal look
closeDisplacementMapOverlay.addEventListener('click', () => {
    console.log('Close Displacement Map overlay button clicked');
    toggleMapOverlay(displacementMapOverlay);
    // These are now handled by applyTextureToModel when PBR button is clicked
    // if (material) {
    //     material.wireframe = false;
    //     material.color.set(0xffffff);
    //     material.needsUpdate = true;
    //     render();
    // }
});

// When clicking on any other map button, restore normal look if needed
['normalMapButton', 'roughnessMapButton', 'aoMapButton', 'metallicMapButton', 'colorMapButton', 'pbrMapButton'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener('click', () => {
            console.log(`Map button ${id} clicked, checking for wireframe.`);
            // The reset of material.wireframe and material.color is now handled
            // at the start of applyTextureToModel, which is called by these buttons.
            // So, no explicit reset needed here.
        });
    }
});

// Update strength
displacementStrengthRange.addEventListener('input', () => {
    console.log('Displacement Strength slider changed to:', displacementStrengthRange.value);
    displacementStrength = parseFloat(displacementStrengthRange.value);
    displacementStrengthValue.textContent = displacementStrength.toFixed(2); // Display with two decimals
    regenerateDisplacementMap();
    updateSliderProgress(displacementStrengthRange);
});

// Update invert
displacementInvertRange.addEventListener('change', () => {
    displacementInvert = displacementInvertRange.checked;
    regenerateDisplacementMap();
});

// Update mesh segments
meshSegmentsSelect.addEventListener('change', () => {
    console.log('Mesh Segments changed to:', meshSegmentsSelect.value);
    meshSegments = parseInt(meshSegmentsSelect.value, 10);
    // Recreate the plane geometry with new segments if displacement is active
    if (material.displacementMap) {
        updateModelGeometryForDisplacement();
    }
    render();
});

/**
 * Generates a displacement map from an image.
 *
 * @param {HTMLCanvasElement} canvas The input canvas.
 * @param {number} strength Overall multiplier for displacement (0.0 to 1.0).
 * @param {boolean} invert If true, inverts the grayscale values.
 * @returns {HTMLCanvasElement} A new canvas element containing the generated displacement map.
 */
function generateDisplacementMapFromImage(canvas, strength = 0.5, invert = false) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, width, height); // Ensure canvas content is drawn
    const srcData = ctx.getImageData(0, 0, width, height);
    const dstCanvas = document.createElement('canvas');
    dstCanvas.width = width;
    dstCanvas.height = height;
    const dstCtx = dstCanvas.getContext('2d');
    const dstData = dstCtx.createImageData(width, height);

    for (let i = 0; i < srcData.data.length; i += 4) {
        let avg = (srcData.data[i] + srcData.data[i+1] + srcData.data[i+2]) / 3 / 255;
        if (invert) avg = 1 - avg;
        // Apply strength: scale the grayscale value directly by strength (0-1)
        avg = Math.max(0, Math.min(1, avg * strength));
        const val = Math.round(avg * 255);
        dstData.data[i] = val;
        dstData.data[i+1] = val;
        dstData.data[i+2] = val;
        dstData.data[i+3] = 255;
    }
    dstCtx.putImageData(dstData, 0, 0);
    const texture = new THREE.CanvasTexture(dstCanvas);
    texture.needsUpdate = true;
    return texture;
}

// Regenerate displacement map with current settings
function regenerateDisplacementMap() {
    if (!currentUploadedImage) return;
    const canvas = createBaseCanvasFromImage(currentUploadedImage);
    if (textures.displacement) textures.displacement.dispose();
    textures.displacement = generateDisplacementMapFromImage(canvas, displacementStrength, displacementInvert);
    textures.displacement.flipY = true;
    material.displacementMap = textures.displacement;
    // Only apply displacement if deformMesh is checked
    material.displacementScale = deformMesh ? displacementStrength : 0;
    material.needsUpdate = true;
    render();
    updateMapButtonPreview('displacement', textures.displacement.image);
    drawMapPreview(displacementMapPreviewCanvas, textures.displacement.image);
    
    // Only update geometry if deformMesh is true
    if (deformMesh) {
        updateModelGeometryForDisplacement();
    }
    
    updateGroundMaterial();
}

function updateModelGeometryForDisplacement() {
    console.log('updateModelGeometryForDisplacement called. deformMesh:', deformMesh);
    if (!model || !currentUploadedImage) {
        console.log('Model or currentUploadedImage is null, returning.');
        return;
    }

    // Preserve current position and rotation
    const currentPosition = model.position.clone();
    const currentRotation = model.rotation.clone();

    // Dispose of old geometry if it exists and we're creating a new one
    if (model.geometry && (deformMesh || textures.displacement)) {
        console.log('Disposing old geometry:', model.geometry.type);
        model.geometry.dispose();
    }

    // Calculate dimensions based on the current uploaded image's aspect ratio
    const tempCanvasForAspect = createBaseCanvasFromImage(currentUploadedImage);
    const aspectRatio = tempCanvasForAspect.width / tempCanvasForAspect.height;
    const planeHeight = 1.0;
    const planeWidth = planeHeight * aspectRatio;

    // Create new geometry
    const newGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, meshSegments, meshSegments);
    
    // Only apply displacement if deformMesh is checked AND we have a displacement map
    if (deformMesh && textures.displacement && textures.displacement.image) {
        applyDisplacementToGeometry(newGeometry, textures.displacement, displacementStrength, displacementInvert);
    }
    
    model.geometry = newGeometry;

    // Reset scale, position and rotation
    model.scale.set(1, 1, 1);
    model.position.copy(currentPosition);
    model.rotation.copy(currentRotation);

    material.needsUpdate = true;
    render();
}
        
/**
 * Applies displacement from a texture directly to the vertices of a BufferGeometry.
 * This modifies the geometry in place.
 * @param {THREE.BufferGeometry} geometry The geometry to displace. Must have a 'position' attribute.
 * @param {THREE.Texture} displacementTexture The displacement map texture.
 * @param {number} scale The displacement scale.
 * @param {boolean} invert If true, inverts the displacement values (dark areas go up, light areas go down).
 */
function applyDisplacementToGeometry(geometry, displacementTexture, scale, invert = false) {
    if (!geometry || !displacementTexture || !displacementTexture.image) {
        console.warn("Cannot apply displacement: missing geometry or displacement texture image.");
        return;
    }

    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;
    const displacementCanvas = displacementTexture.image;
    const ctx = displacementCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, displacementCanvas.width, displacementCanvas.height);
    const pixels = imageData.data;

    const width = displacementCanvas.width;
    const height = displacementCanvas.height;

    let firstZ = positions.getZ(0); // For debugging
    let maxDisplacement = 0; // For debugging

    for (let i = 0; i < positions.count; i++) {
        const uvX = uvs.getX(i);
        const uvY = uvs.getY(i);

        // Sample displacement map (assuming grayscale for simplicity)
        // Need to account for flipY if the texture is flipped on load
        const sampleY = displacementTexture.flipY ? 1.0 - uvY : uvY;

        const pixelX = Math.floor(uvX * (width - 1));
        const pixelY = Math.floor(sampleY * (height - 1));
        const pixelIndex = (pixelY * width + pixelX) * 4;

        let displacementValue = pixels[pixelIndex] / 255.0; // Grayscale value 0-1

        if (invert) {
            displacementValue = 1.0 - displacementValue;
        }

        // Displace along the z-axis (normal for a flat plane)
        // The plane is created facing positive Z, so displacement along Z is "up"
        // For a plane rotated -PI/2 around X (lying flat), Z becomes Y.
        // However, the geometry's local Z is still its normal.
        // Let's assume displacement along the local Z-axis of the plane.

        // If geometry has normals, use them. Otherwise, assume a simple plane's normal (0,0,1)
        // For PlaneGeometry, its local Z is its normal.
        // After model.rotateX(-Math.PI * 0.5), the local Z becomes world Y.
        // So, displacing along local Z effectively displaces along world Y (up/down).
        const currentZ = positions.getZ(i);
        const displacedZ = currentZ + (displacementValue * scale);

        positions.setZ(i, displacedZ);

        // Debugging: track max displacement
        maxDisplacement = Math.max(maxDisplacement, Math.abs(displacedZ - currentZ));
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals(); // Recompute normals after displacement

    console.log(`Displacement applied. Initial Z: ${firstZ.toFixed(4)}, Max Z change: ${maxDisplacement.toFixed(4)}`);
}


////////////////////// COLOR MAP SETTINGS //////////////////////
let colorHue = 0;
let colorSaturation = 100;
let colorBrightness = 100;
let colorIntensity = 1.0;
let invertColors = false;

const closeColorMapOverlay = document.getElementById('closeColorMapOverlay');
const hueSlider = document.getElementById('hueSlider');
const hueValue = document.getElementById('hueValue');
const saturationSlider = document.getElementById('saturationSlider');
const saturationValue = document.getElementById('saturationValue');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');
const colorIntensitySlider = document.getElementById('colorIntensitySlider');
const colorIntensityValue = document.getElementById('colorIntensityValue');
const invertColorCheckbox = document.getElementById('invertColorCheckbox');
const resetColorMapButton = document.getElementById('resetColorMap');

// Listerners
resetColorMapButton.addEventListener('click', () => {
    console.log('Reset Color button clicked');
    colorHue = 0;
    colorSaturation = 100;
    colorBrightness = 100;
    colorIntensity = 1.0;
    invertColors = false;

    hueSlider.value = colorHue;
    hueValue.textContent = colorHue;
    saturationSlider.value = colorSaturation;
    saturationValue.textContent = colorSaturation;
    brightnessSlider.value = colorBrightness;
    brightnessValue.textContent = colorBrightness;
    colorIntensitySlider.value = colorIntensity;
    colorIntensityValue.textContent = colorIntensity.toFixed(2);
    invertColorCheckbox.checked = invertColors;

    updateSliderProgress(hueSlider);
    updateSliderProgress(saturationSlider);
    updateSliderProgress(brightnessSlider);
    updateSliderProgress(colorIntensitySlider);

    regenerateColorMap();
});

// Show overlay when color map button is clicked
document.getElementById('colorMapButton').addEventListener('click', () => {
    console.log('Color Map button clicked');
    toggleMapOverlay(colorMapOverlay);

    hueSlider.value = colorHue;
    hueValue.textContent = colorHue;
    saturationSlider.value = colorSaturation;
    saturationValue.textContent = colorSaturation;
    brightnessSlider.value = colorBrightness;
    brightnessValue.textContent = colorBrightness;
    colorIntensitySlider.value = colorIntensity;
    colorIntensityValue.textContent = colorIntensity.toFixed(2);
    invertColorCheckbox.checked = invertColors;

    updateSliderProgress(hueSlider);
    updateSliderProgress(saturationSlider);
    updateSliderProgress(brightnessSlider);
    updateSliderProgress(colorIntensitySlider);
    if (textures.color && textures.color.image) {
        drawMapPreview(colorMapPreviewCanvas, textures.color.image);
    }
});

// Hide overlay
closeColorMapOverlay.addEventListener('click', () => {
    console.log('Close Color Map overlay button clicked');
    toggleMapOverlay(colorMapOverlay);
});

// Update hue
hueSlider.addEventListener('input', () => {
    console.log('Hue slider changed to:', hueSlider.value);
    colorHue = parseFloat(hueSlider.value);
    hueValue.textContent = colorHue;
    regenerateColorMap();
    updateMapButtonPreview('pbr', material.map.image);
    updateSliderProgress(hueSlider);
});

// Update saturation
saturationSlider.addEventListener('input', () => {
    console.log('Saturation slider changed to:', saturationSlider.value);
    colorSaturation = parseFloat(saturationSlider.value);
    saturationValue.textContent = colorSaturation;
    regenerateColorMap();
    updateMapButtonPreview('pbr', material.map.image);
    updateSliderProgress(saturationSlider);
});

// Update brightness
brightnessSlider.addEventListener('input', () => {
    console.log('Brightness slider changed to:', brightnessSlider.value);
    colorBrightness = parseFloat(brightnessSlider.value);
    brightnessValue.textContent = colorBrightness;
    regenerateColorMap();
    updateMapButtonPreview('pbr', material.map.image);
    updateSliderProgress(brightnessSlider);
});

// Update color intensity
colorIntensitySlider.addEventListener('input', () => {
    console.log('Color Intensity slider changed to:', colorIntensitySlider.value);
    colorIntensity = parseFloat(colorIntensitySlider.value);
    colorIntensityValue.textContent = colorIntensity.toFixed(2);
    regenerateColorMap();
    updateMapButtonPreview('pbr', material.map.image);
    updateSliderProgress(colorIntensitySlider);
});

// Update invert colors
invertColorCheckbox.addEventListener('change', () => {
    console.log('Invert Colors checkbox changed to:', invertColorCheckbox.checked);
    invertColors = invertColorCheckbox.checked;
    regenerateColorMap();
    updateMapButtonPreview('pbr', material.map.image);
});

// Regenerate color map with current settings
function regenerateColorMap() {
    if (!currentUploadedImage) return;
    const originalCanvas = createBaseCanvasFromImage(currentUploadedImage);
    if (textures.color) textures.color.dispose();
    textures.color = generateColorMapFromImage(originalCanvas, colorHue, colorSaturation, colorBrightness, colorIntensity, invertColors);
    textures.color.colorSpace = THREE.SRGBColorSpace;
    textures.color.needsUpdate = true;
    material.map = textures.color;
    material.needsUpdate = true;
    render();
    updateMapButtonPreview('color', textures.color.image);
    drawMapPreview(colorMapPreviewCanvas, textures.color.image); // Update the preview canvas
    updateGroundMaterial(); // Update ground material after color map change
}

// HSB adjustment functions
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function generateColorMapFromImage(originalCanvas, hue = 0, saturation = 100, brightness = 100, intensity = 1.0, invert = false) {
    const canvas = document.createElement('canvas');
    canvas.width = originalCanvas.width;
    canvas.height = originalCanvas.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalCanvas, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Apply invert first if requested
        if (invert) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
        }

        // Convert RGB to HSL
        let [h, s, l] = rgbToHsl(r, g, b);

        // Apply HSB adjustments
        h = (h + hue) % 360;
        if (h < 0) h += 360; // Ensure hue stays positive
        s *= (saturation / 100);
        l *= (brightness / 100);

        // Clamp values
        s = Math.max(0, Math.min(100, s));
        l = Math.max(0, Math.min(100, l));

        // Convert back to RGB
        [r, g, b] = hslToRgb(h, s, l);

        // Apply intensity
        r = Math.round(r * intensity);
        g = Math.round(g * intensity);
        b = Math.round(b * intensity);

        // Clamp final RGB values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}


////////////////////// INITIALIZE //////////////////////
// Initialize Three.js when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Update all slider progresses on load
    updateSliderProgress(document.getElementById('roughnessStrengthSlider'));
    updateSliderProgress(document.getElementById('normalStrengthSlider'));
    updateSliderProgress(document.getElementById('aoStrengthSlider'))
    updateSliderProgress(document.getElementById('metalnessStrengthSlider'))
    updateSliderProgress(document.getElementById('displacementStrengthRange')) // Corrected ID
    updateSliderProgress(document.getElementById('hueSlider'));
    updateSliderProgress(document.getElementById('saturationSlider'));
    updateSliderProgress(document.getElementById('brightnessSlider'));
    updateSliderProgress(colorIntensitySlider);
    updateSliderProgress(outlineStrengthRange);
    updateSliderProgress(colorReductionRange);

    // Initialize pixelate slider display
    pixelateSizeValue.textContent = pixelateSizeRange.value;
    updateSliderProgress(pixelateSizeRange);

    const deformMeshCheckbox = document.getElementById('deformMeshCheckbox');
    deformMeshCheckbox.checked = deformMesh;

    // --- Color Palette Slider Logic ---
    const numColorsSlider = document.getElementById('numColorsSlider');
    const numColorsValue = document.getElementById('numColorsValue');

    if (numColorsSlider && numColorsValue) {
        numColorsSlider.addEventListener('input', () => {
            const count = numColorsSlider.value;
            numColorsValue.textContent = `${count} Color${count > 1 ? 's' : ''}`;
            if (currentUploadedImage) {
                extractColorPalette(currentUploadedImage);
            }
        });
    }

// Render recents on startup
renderRecentTextures();
});


////////////////////// Listerners //////////////////////
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;

            // Create an Image object to process for palette and texture
            const img = new Image();
            img.onload = () => {
                currentUploadedImage = img;
                console.log('Image loaded. Original dimensions:', img.width, 'x', img.height); // Debug log
                imagePreview.src = imageUrl;
                imagePreview.classList.remove('hidden');
                uploadInstructions.classList.add('hidden');
                extractColorPalette(img);

                // Use original resolution
                const canvas = createBaseCanvasFromImage(img);
                console.log('Base canvas dimensions for processing:', canvas.width, 'x', canvas.height); // Debug log
                setAllMapsFromCanvas(canvas);
                addToRecentTextures(imageUrl);
                renderRecentTextures();
                // Re-apply the currently active style after new image upload
                if (isPixelateMode) {
                    showPixelatePBR();
                } else if (isGraphicNovelMode) {
                    showGraphicNovelEffect();
                }
                else {
                    applyTextureToModel('pbr'); // Default to PBR if no special style is active
                }
                updateMapButtonPreview('pbr', material.map.image);
                updateGroundMaterial(); // Update ground after new image upload
                console.log('Calling updateModelGeometryForDisplacement after all maps set.'); // Debug log
                updateModelGeometryForDisplacement(); // <--- This is the crucial call added here!
            };
            img.src = imageUrl;
        };
        reader.readAsDataURL(file);
    } else {
        currentUploadedImage = null;
        imagePreview.src = '';
        imagePreview.classList.add('hidden');
        uploadInstructions.classList.remove('hidden');
        uploadInstructions.querySelector('#uploadStatusText').textContent = 'No image selected.';
        extractColorPalette(null);

        if (material) {
            material.map = textures.color;
            material.normalMap = null;
            material.roughnessMap = null;
            material.aoMap = null;
            material.metalnessMap = null;
            material.displacementMap = null;

            material.roughness = 0.5;
            material.metalness = 0.0;
            material.aoMapIntensity = 1.0;
            material.displacementScale = 0.0;
            material.needsUpdate = true;
            if (model) {
                // When no image is selected, reset model scale to 1x1 plane default
                model.scale.set(1, 1, 1);
                // Recreate geometry to default 1x1 plane with current meshSegments
                const defaultGeometry = new THREE.PlaneGeometry(1, 1, meshSegments, meshSegments);
                model.geometry.dispose();
                model.geometry = defaultGeometry;
            }
            render();
            updateMapButtonPreview('pbr', material.map.image);
            updateGroundMaterial(); // Update ground after no image
        }
    }
});

uploadArea.addEventListener('click', () => {
    imageUpload.click();
});
toolsButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toolsDropdown.classList.toggle('hidden');
    actionsDropdown.classList.add('hidden');
});

actionsButton.addEventListener('click', (event) => {
                event.stopPropagation();
    actionsDropdown.classList.toggle('hidden');
    toolsDropdown.classList.add('hidden');
});

// Close dropdowns when clicking outside
document.addEventListener('click', (event) => {
    if (!toolsButton.contains(event.target) && !toolsDropdown.contains(event.target)) {
        toolsDropdown.classList.add('hidden');
    }
    if (!actionsButton.contains(event.target) && !actionsDropdown.contains(event.target)) {
        actionsDropdown.classList.add('hidden');
    }

    const isClickInsideMapButtons = event.target.closest('.texture-button');
    const isClickInsideMapOverlay = event.target.closest('.map-settings-panel');

    if (!isClickInsideMapButtons && !isClickInsideMapOverlay) {
        if (activeOverlayElement) {
            console.log('Click outside map buttons/overlays, closing active overlay:', activeOverlayElement.id);
            toggleMapOverlay(activeOverlayElement);
        }
    }
});

// Texture button
document.querySelectorAll('.texture-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const mapType = btn.dataset.mapType;
        console.log(`Texture button for ${mapType} clicked.`);
        applyTextureToModel(mapType);
    });
});

// 3D Mesh Export Handler
document.getElementById('exportMeshButton').addEventListener('click', function(e) {
    applyTextureToModel('pbr'); //set to pbr before exporting

    e.preventDefault();
    document.getElementById('exportModal').classList.remove('hidden');
});

// Export Textures Handler
document.getElementById('confirmExportModal').addEventListener('click', async function () {
    const form = document.getElementById('exportTexturesForm');
    const options = {
        color: form.color.checked,
        normal: form.normal.checked,
        roughness: form.roughness.checked,
        metallic: form.metallic.checked,
        ao: form.ao.checked,
        displacement: form.displacement.checked,
        includeGlbMesh: document.getElementById('includeGlbMesh').checked // Get state of new checkbox
    };

    const exportTextureSize = document.getElementById('exportTextureSize').value;

    document.getElementById('exportModal').classList.add('hidden');

    let baseName = 'mesh';
    if (imageUpload && imageUpload.files && imageUpload.files[0] && imageUpload.files[0].name) {
        baseName = imageUpload.files[0].name.replace(/\.[^/.]+$/, "");
    }

    let exportMesh;
    if (options.includeGlbMesh && model) {
        // Create a clone of the current model's geometry and material for export
        const tempExportGeometry = model.geometry.clone();
        const tempExportMaterial = model.material.clone();

        // Apply current textures to the cloned material
        const exportSource = isPixelateMode ? pixelatedTextures : (isGraphicNovelMode ? graphicNovelTextures : textures);
        tempExportMaterial.map = exportSource.color || null;
        tempExportMaterial.normalMap = exportSource.normal || null;
        tempExportMaterial.roughnessMap = exportSource.roughness || null;
        tempExportMaterial.metalnessMap = exportSource.metallic || null;
        tempExportMaterial.aoMap = exportSource.ao || null;

        // If displacement map is active, bake it into the geometry
        if (options.displacement && exportSource.displacement && exportSource.displacement.image) {
            tempExportMaterial.displacementMap = exportSource.displacement;
            tempExportMaterial.displacementScale = displacementStrength;
            // Apply displacement directly to the cloned geometry's vertices
            applyDisplacementToGeometry(tempExportGeometry, exportSource.displacement, displacementStrength, displacementInvert);
        } else {
            tempExportMaterial.displacementMap = null;
            tempExportMaterial.displacementScale = 0;
        }

        // Ensure roughness/metalness values are also transferred
        tempExportMaterial.roughness = material.roughness;
        tempExportMaterial.metalness = material.metalness;
        tempExportMaterial.aoMapIntensity = material.aoMapIntensity;
        tempExportMaterial.color.set(material.color.getHex()); // Copy base color too

        tempExportMaterial.needsUpdate = true;
        exportMesh = new THREE.Mesh(tempExportGeometry, tempExportMaterial);
        // Ensure scale is 1,1,1 as the geometry now holds the correct dimensions
        exportMesh.scale.set(1, 1, 1);
        exportMesh.position.copy(model.position);
        exportMesh.rotation.copy(model.rotation);

    } else {
        exportMesh = model; // Export the current model as is (without displacement baked in if not selected)
    }

    const zip = new JSZip();
    const folder = zip.folder(baseName);

    if (options.includeGlbMesh) {
        const glbBuffer = await new Promise(resolve => {
            const exporter = new THREE.GLTFExporter();
            exporter.parse(exportMesh, result => {
                resolve(result);
            }, { binary: true });
        });
        folder.file(baseName + '.glb', glbBuffer);

        // Dispose of temporary geometry and material
        if (exportMesh.geometry && exportMesh.geometry !== model.geometry) {
            exportMesh.geometry.dispose();
        }
        if (exportMesh.material && exportMesh.material !== model.material) {
            exportMesh.material.dispose();
        }
    }


    async function canvasToBlob(canvas) {
        return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    }

    const exportSource = isPixelateMode ? pixelatedTextures : (isGraphicNovelMode ? graphicNovelTextures : textures);

    if (options.color && exportSource.color && exportSource.color.image) {
        folder.file('albedo.png', await canvasToBlob(resizeCanvasToAspect(exportSource.color.image, exportTextureSize)));
    }
    if (options.normal && exportSource.normal && exportSource.normal.image) {
        folder.file('normal.png', await canvasToBlob(resizeCanvasToAspect(exportSource.normal.image, exportTextureSize)));
    }
    if (options.roughness && exportSource.roughness && exportSource.roughness.image) {
        folder.file('roughness.png', await canvasToBlob(resizeCanvasToAspect(exportSource.roughness.image, exportTextureSize)));
    }
    if (options.metallic && exportSource.metallic && exportSource.metallic.image) {
        folder.file('metallic.png', await canvasToBlob(resizeCanvasToAspect(exportSource.metallic.image, exportTextureSize)));
    }
    if (options.ao && exportSource.ao && exportSource.ao.image) {
        folder.file('ao.png', await canvasToBlob(resizeCanvasToAspect(exportSource.ao.image, exportTextureSize)));
    }
    if (options.displacement && exportSource.displacement && exportSource.displacement.image) {
        folder.file('displacement.png', await canvasToBlob(resizeCanvasToAspect(exportSource.displacement.image, exportTextureSize)));
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = baseName + '.zip';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
    }, 100);
});

document.getElementById('cancelExportModal').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('exportModal').classList.add('hidden');
});

document.getElementById('exportModal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.add('hidden');
});


// Drag and drop functionality
uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.classList.add('border-blue-400', 'bg-blue-50');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
});

uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        imageUpload.files = files;
        imageUpload.dispatchEvent(new Event('change', { 'bubbles': true }));
    }
});


////////////////////// LIGHT, CAMERA AND ENVIRONMENT //////////////////////
// Three.js setup
let camera, scene, renderer, dirLight, material, uniforms;
let model;
let controls;

let textures = {};

const threeJsContainer = document.getElementById('threeJsContainer');
const canvas = document.getElementById('threeJsCanvas');

const randomUV = /* glsl */ `
    uniform sampler2D noiseMap;
    uniform float enableRandom;
    uniform float useNoiseMap;
    uniform float debugNoise;
    uniform float useSuslikMethod;

    float customRand(vec2 n) {
        return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    float directNoise(vec2 p){
        vec2 ip = floor(p);
        vec2 u = fract(p);
        u = u*u*(3.0-2.0*u);

        float res = mix(
            mix(customRand(ip),customRand(ip+vec2(1.0,0.0)),u.x),
            mix(customRand(ip+vec2(0.0,1.0)),customRand(ip+vec2(1.0,1.0)),u.x),u.y);
        return res*res;
    }

    float sum( vec4 v ) { return v.x+v.y+v.z; }

    vec4 textureNoTile( sampler2D mapper, in vec2 uv ){

        float k = 0.0;
        if( useNoiseMap == 1.0 ) k = texture2D( noiseMap, 0.005*uv ).x;
        else k = directNoise( uv );

        float index = k*8.0;
        float f = fract( index );
        float ia = 0.0;
        float ib = 0.0;

        if( useSuslikMethod == 1.0 ){
            ia = floor(index+0.5);
            ib = floor(index);
            f = min(f, 1.0-f)*2.0;
        } else {
            ia = floor( index );
            ib = ia + 1.0;
        }

        vec2 offa = sin(vec2(3.0,7.0)*ia);
        vec2 offb = sin(vec2(3.0,7.0)*ib);

        vec2 dx = dFdx(uv);
        vec2 dy = dFdy(uv);

        vec4 cola = textureGrad( mapper, uv + offa, dx, dy );
        vec4 colb = textureGrad( mapper, uv + offb, dx, dy );
        if( debugNoise == 1.0 ){
            cola = vec4( 0.1,0.0,0.0,1.0 );
            colb = vec4( 0.0,0.0,1.0,1.0 );
        }

        return mix( cola, colb, smoothstep(0.2,0.8,f-0.1*sum(cola-colb)) );

    }
`;

const map_fragment = /* glsl */ `
    #ifdef USE_MAP
        if( enableRandom == 1.0 ) diffuseColor *= textureNoTile( map, vUv );
        else diffuseColor *= texture2D( map, vUv );
    #endif
`;

const alphamap_pars_fragment = /* glsl */ `
    #ifdef USE_ALPHAMAP
        uniform sampler2D alphaMap;
        uniform float disolve;
        uniform float threshold;
    #endif
`;

const alphamap_fragment = /* glsl */ `
    #ifdef USE_ALPHAMAP
        float vv = texture2D( alphaMap, vUv ).g;
        float r = disolve * (1.0 + threshold * 2.0) - threshold;
        float mixf = clamp((vv - r)*(1.0/threshold), 0.0, 1.0);
        diffuseColor.a = mixf;
    #endif
`;

// --- Helper functions for Color Palette ---
function isColorLight(r, g, b) {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// --- Color Palette Extraction Logic (adapted from app.js) ---
function extractColorPalette(imageToProcess) {
    const paletteDiv = document.getElementById('extractedColorPalette');
    if (!imageToProcess) {
        paletteDiv.innerHTML = '<p class="text-center w-full text-gray-500 text-sm">Upload an image to see its palette.</p>';
        return;
    }

    const numColorsSlider = document.getElementById('numColorsSlider');
    const numColors = parseInt(numColorsSlider.value, 10);
    paletteDiv.innerHTML = '';

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const sampleSize = 100;
    tempCanvas.width = sampleSize;
    tempCanvas.height = sampleSize;
    tempCtx.drawImage(imageToProcess, 0, 0, sampleSize, sampleSize);

    const imageData = tempCtx.getImageData(0, 0, sampleSize, sampleSize);
    const pixels = imageData.data;
    const colorCounts = {};

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
        const quantizeFactor = 16;
        const qr = Math.floor(r / quantizeFactor) * quantizeFactor;
        const qg = Math.floor(g / quantizeFactor) * quantizeFactor;
        const qb = Math.floor(b / quantizeFactor) * quantizeFactor;
        const colorKey = `${qr},${qg},${qb}`;
        colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }

    const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
    const extractedColors = [];
    for (let i = 0; i < Math.min(numColors, sortedColors.length); i++) {
        const [rgbString] = sortedColors[i];
        const [r, g, b] = rgbString.split(',').map(Number);
        extractedColors.push({ r, g, b });
    }

    if (extractedColors.length === 0) {
        paletteDiv.innerHTML = '<p class="text-center w-full text-gray-500 text-sm">Could not extract colors.</p>';
        return;
    }

    extractedColors.forEach(color => {
        const swatch = document.createElement('div');
        const hex = rgbToHex(color.r, color.g, color.b);
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;
        swatch.title = `Click to copy ${hex}`;
        swatch.onclick = () => {
            document.execCommand('copy');
            const messageBox = document.createElement('div');
            messageBox.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background-color: #333; color: white; padding: 15px 25px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000; font-size: 14px;
            `;
            messageBox.textContent = `Copied ${hex} to clipboard!`;
            document.body.appendChild(messageBox);
            setTimeout(() => {
                document.body.removeChild(messageBox);
            }, 1500);

            swatch.style.transform = 'scale(1.1)';
            setTimeout(() => { swatch.style.transform = 'scale(1)'; }, 200);
        };
        paletteDiv.appendChild(swatch);
    });
}

// --- PBR Texture Generation Functions ---

function generateColorTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const size = 32;

    for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
            context.fillStyle = ((x / size) % 2 === (y / size) % 2) ? '#808080' : '#404040';
            context.fillRect(x, y, size, size);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.flipY = false;
    return texture;
}

function generateGrayscaleTexture(width, height, type = 'horizontal') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, type === 'horizontal' ? width : 0, type === 'vertical' ? height : 0);

    if (type === 'roughness') {
        gradient.addColorStop(0, 'rgb(0,0,0)');
        gradient.addColorStop(1, 'rgb(255,255,255)');
    } else if (type === 'metallic') {
        gradient.addColorStop(0, 'rgb(0,0,0)');
        gradient.addColorStop(1, 'rgb(255,255,255)');
    } else if (type === 'ao') {
        gradient.addColorStop(0, 'rgb(128,128,128)');
        gradient.addColorStop(0.5, 'rgb(0,0,0)');
        gradient.addColorStop(1, 'rgb(128,128,128)');
    } else if (type === 'displacement') {
        gradient.addColorStop(0, 'rgb(0,0,0)');
        gradient.addColorStop(1, 'rgb(255,255,255)');
    } else {
        gradient.addColorStop(0, 'rgb(0,0,0)');
        gradient.addColorStop(1, 'rgb(255,255,255)');
    }

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = true;
    return texture;
}

function generateNormalMapTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgb(128, 128, 255)';
    context.fillRect(0, 0, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = true;
    return texture;
}

function generateNoiseTexture(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const imageData = context.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
    }
    context.putImageData(imageData, 0, 0);
    return new THREE.CanvasTexture(canvas);
}

function generateDissolveMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'white');
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    return new THREE.CanvasTexture(canvas);
}

function updateSliderProgress(slider) {
    if (!slider) return;
    const value = slider.value;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #6366F1 ${percentage}%, #e0e0e0 ${percentage}%)`;
}


function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) {
        controls.update();
    }
    renderer.render(scene, camera);
}

let activeOverlayElement = null;

function toggleMapOverlay(overlayElement) {
    console.log('toggleMapOverlay called for:', overlayElement.id);
    console.log('Initial classList:', overlayElement.classList.value);

    if (activeOverlayElement && activeOverlayElement !== overlayElement) {
        console.log('Closing previously active overlay:', activeOverlayElement.id);
        activeOverlayElement.classList.remove('active');
        activeOverlayElement.style.display = 'none'; // Immediately hide the old one
        console.log('Previous overlay classList after hide:', activeOverlayElement.id, activeOverlayElement.classList.value);
    }

    if (overlayElement.classList.contains('active')) {
        console.log('Deactivating overlay:', overlayElement.id);
        overlayElement.classList.remove('active');
        overlayElement.style.display = 'none'; // Immediately hide
        activeOverlayElement = null;
        console.log('Current overlay classList after deactivate:', overlayElement.id, overlayElement.classList.value);
    } else {
        console.log('Activating overlay:', overlayElement.id);
        overlayElement.style.display = 'block'; // Immediately show
        // Give a tiny delay for display:block to apply before transition starts
        requestAnimationFrame(() => {
            overlayElement.classList.add('active');
            console.log('Current overlay classList after activate (in rAF):', overlayElement.id, overlayElement.classList.value);
        });
        activeOverlayElement = overlayElement;
    }
}


function applyTextureToModel(mapType) {
    const sourceTextures = isPixelateMode ? pixelatedTextures : (isGraphicNovelMode ? graphicNovelTextures : textures);

    // Always reset material color to white and wireframe to false first
    material.color.set(0xffffff);
    material.wireframe = false;

    // Always reset environment settings to default PBR values when applying any texture
    // This ensures consistent lighting regardless of previous mode.
    renderer.toneMappingExposure = 0.7;
    scene.environmentIntensity = 1.5;
    scene.backgroundBlurriness = 0.5;

    material.map = sourceTextures.color || null;
    material.normalMap = null;
    material.roughnessMap = null;
    material.aoMap = null;
    material.metalnessMap = null;
    material.displacementMap = null;

    material.roughness = 0.5;
    material.metalness = 0.0;
    material.aoMapIntensity = 1.0;
    material.displacementScale = 0.1;

    switch (mapType) {
        case 'pbr':
            if (currentUploadedImage) {
                material.normalMap = sourceTextures.normal;
                material.roughnessMap = sourceTextures.roughness;
                material.aoMap = sourceTextures.ao;
                material.metalnessMap = sourceTextures.metallic;
                material.displacementMap = sourceTextures.displacement;

                // Only set roughness/metalness to 1.0 if the map exists, otherwise use default
                material.roughness = sourceTextures.roughness ? 1.0 : 0.5;
                material.metalness = sourceTextures.metallic ? 1.0 : 0.0;
                material.aoMapIntensity = 1.0;
                material.displacementScale = deformMesh ? displacementStrength : 0;
            } else {
                // If no image, ensure defaults
                material.roughness = 0.5;
                material.metalness = 0.0;
                material.aoMapIntensity = 1.0;
                material.displacementScale = 0.0;
            }
            break;
        case 'color':
            // Only map is color, other maps are null as set above
            break;
        case 'roughness':
            material.roughnessMap = sourceTextures.roughness;
            material.roughness = 1.0; // Max roughness to clearly see map
            break;
        case 'normal':
            material.normalMap = sourceTextures.normal;
            break;
        case 'ao':
            material.aoMap = sourceTextures.ao;
            material.aoMapIntensity = 1.0; // Max intensity to clearly see map
            break;
        case 'metallic':
            material.metalnessMap = sourceTextures.metallic;
            material.metalness = 1.0; // Max metalness to clearly see map
            break;
        case 'displacement':
            material.displacementMap = sourceTextures.displacement;
            // Only apply displacement scale if deformMesh is true
            material.displacementScale = deformMesh ? displacementStrength : 0;
            material.wireframe = true;
            material.color.set(0x22c55e); // Set to green for wireframe view
            break;
    }

    setActiveMapButton(mapType);
    material.needsUpdate = true;
    render();
    updateMapButtonPreview('pbr', material.map.image);
    updateGroundMaterial();
}

function onWindowResize() {
    const width = threeJsContainer.clientWidth;
    const height = threeJsContainer.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    render();
}

function init() {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(threeJsContainer.clientWidth, threeJsContainer.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Initialize with current HDR settings
    renderer.toneMappingExposure = 0.7; // Default value
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    scene = new THREE.Scene();

    const plane = new THREE.PlaneGeometry(20, 20);
    plane.rotateX(-Math.PI * 0.5);
    // Initialize groundMaterial with basic properties, will be updated by updateGroundMaterial
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x7a869a, // Default color
        roughness: 0.0,
        metalness: 0.0
    });
    ground = new THREE.Mesh(plane, groundMaterial); // Assign to global ground variable
    ground.receiveShadow = true;
    ground.position.y = -0.5;
    ground.position.x = -0.5;
    scene.add(ground);

    new THREE.RGBELoader()
        .load('https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr', function (texture) {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
            scene.backgroundBlurriness = 0.5;
            // Initialize environment intensity with current HDR contrast setting
            scene.environmentIntensity = 3; // Default value
            render();
        });
    camera = new THREE.PerspectiveCamera(50, threeJsContainer.clientWidth / threeJsContainer.clientHeight, 0.1, 1000);
    camera.position.set(-1, -0.3, 0.6);

    dirLight = new THREE.DirectionalLight(0xFFFFFF, 3);
    dirLight.position.set(2, 1, 0.8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const shadow = dirLight.shadow;
    shadow.mapSize.width = shadow.mapSize.height = 1024;
    shadow.radius = 16;
    shadow.bias = -0.0005;

    const shadowCam = shadow.camera, s = 2;
    shadowCam.near = 0.5;
    shadowCam.far = 5;
    shadowCam.right = shadowCam.top = s;
    shadowCam.left = shadowCam.bottom = -s;

    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);

    textures.color = generateColorTexture(MAP_SIZE, MAP_SIZE);
    textures.roughness = generateGrayscaleTexture(MAP_SIZE, MAP_SIZE, 'roughness');
    textures.normal = generateNormalMapTexture(MAP_SIZE, MAP_SIZE);
    textures.ao = generateGrayscaleTexture(MAP_SIZE, MAP_SIZE, 'ao');
    textures.metallic = generateGrayscaleTexture(MAP_SIZE, MAP_SIZE, 'metallic');
    textures.displacement = generateGrayscaleTexture(MAP_SIZE, MAP_SIZE, 'displacement');
    textures.noise = generateNoiseTexture(MAP_SIZE, MAP_SIZE);
    textures.dissolve = generateDissolveMap(MAP_SIZE, MAP_SIZE);

    material = new THREE.MeshStandardMaterial({
        map: textures.color,
        normalMap: null,
        roughness: 0.0,
        metalness: 0.0,
        displacementScale: 0.0,
        transparent: false,
        side: THREE.DoubleSide
    });

    // Initial plane geometry uses default meshSegments
    const geometry = new THREE.PlaneGeometry(1, 1, meshSegments, meshSegments);
    model = new THREE.Mesh(geometry, material);
    model.castShadow = true;
    scene.add(model);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 0.2;
    controls.maxDistance = 5;
    controls.enableZoom = true;

    window.addEventListener('resize', onWindowResize);

    document.getElementById('resetCameraButton').addEventListener('click', () => {
        controls.reset();
    });

    render();

    animate();

    applyTextureToModel('pbr');
    updateMapButtonPreview('pbr', textures.color.image);
    updateGroundMaterial(); // Initial update for the ground material
}

function updateGroundMaterial() {
    if (!ground || !model || !material) return;

    // Determine the current source of textures (original, pixelated, graphic novel)
    const currentSourceTextures = isPixelateMode ? pixelatedTextures : (isGraphicNovelMode ? graphicNovelTextures : textures);

    // Clone and apply textures to ground material
    // Important: clone textures to avoid modifying the main model's textures
    // and to allow independent repeat settings.
    ground.material.map = currentSourceTextures.color ? currentSourceTextures.color.clone() : null;
    ground.material.normalMap = currentSourceTextures.normal ? currentSourceTextures.normal.clone() : null;
    ground.material.roughnessMap = currentSourceTextures.roughness ? currentSourceTextures.roughness.clone() : null;
    ground.material.aoMap = currentSourceTextures.ao ? currentSourceTextures.ao.clone() : null;
    ground.material.metalnessMap = currentSourceTextures.metallic ? currentSourceTextures.metallic.clone() : null;
    // Displacement map on ground is generally not desired as it would deform the ground plane itself.
    ground.material.displacementMap = null;

    // Set other properties based on the main material
    ground.material.roughness = material.roughness;
    ground.material.metalness = material.metalness;
    ground.material.aoMapIntensity = material.aoMapIntensity;
    ground.material.color.set(0xffffff); // Ensure ground is white to show textures correctly

    // Calculate repeat values for tiling
    // Model's dimensions are based on a plane of height 1.0 and width = 1.0 * aspectRatio
    const modelHeight = 1.0;
    // Use the dimensions from the base canvas, which is scaled to MAP_SIZE
    const tempCanvasForAspect = currentUploadedImage ? createBaseCanvasFromImage(currentUploadedImage) : { width: 1, height: 1 };
    const modelWidth = modelHeight * (tempCanvasForAspect.width / tempCanvasForAspect.height);

    const groundSize = 20; // The ground plane is 20x20

    // How many times should the model's texture repeat on the ground?
    // If modelWidth is 1, and ground is 20, it repeats 20 times.
    // If modelWidth is 2, and ground is 20, it repeats 10 times.
    const repeatX = groundSize / modelWidth;
    const repeatY = groundSize / modelHeight;

    // Apply repeat to all cloned textures
    if (ground.material.map) {
        ground.material.map.wrapS = ground.material.map.wrapT = THREE.RepeatWrapping;
        ground.material.map.repeat.set(repeatX, repeatY);
        ground.material.map.needsUpdate = true;
    }
    if (ground.material.normalMap) {
        ground.material.normalMap.wrapS = ground.material.normalMap.wrapT = THREE.RepeatWrapping;
        ground.material.normalMap.repeat.set(repeatX, repeatY);
        ground.material.normalMap.needsUpdate = true;
    }
    if (ground.material.roughnessMap) {
        ground.material.roughnessMap.wrapS = ground.material.roughnessMap.wrapT = THREE.RepeatWrapping;
        ground.material.roughnessMap.repeat.set(repeatX, repeatY);
        ground.material.roughnessMap.needsUpdate = true;
    }
    if (ground.material.aoMap) {
        ground.material.aoMap.wrapS = ground.material.aoMap.wrapT = THREE.RepeatWrapping;
        ground.material.aoMap.repeat.set(repeatX, repeatY);
        ground.material.aoMap.needsUpdate = true;
    }
    if (ground.material.metalnessMap) {
        ground.material.metalnessMap.wrapS = ground.material.metalnessMap.wrapT = THREE.RepeatWrapping;
        ground.material.metalnessMap.repeat.set(repeatX, repeatY);
        ground.material.metalnessMap.needsUpdate = true;
    }

    ground.material.needsUpdate = true;
    render();
}


// Make Seamless Modal
const seamlessModal = document.getElementById('seamlessModal');
const closeSeamlessModal = document.getElementById('closeSeamlessModal');
const cancelSeamless = document.getElementById('cancelSeamless');
const seamlessPreviewCanvas = document.getElementById('seamlessPreviewCanvas');
const modalMethodSelect = document.getElementById('modalMethodSelect');
const modalRadiusRange = document.getElementById('modalRadiusRange');
const modalIntensityRange = document.getElementById('modalIntensityRange');
const modalRadiusValue = document.getElementById('modalRadiusValue');
const modalIntensityValue = document.getElementById('modalIntensityValue');


makeSeamlessOption.addEventListener('click', (event) => {
    event.preventDefault();
    seamlessModal.classList.remove('hidden');
    actionsDropdown.classList.add('hidden');

    // Set initial slider values and update progress
    modalRadiusRange.value = 5;
    modalRadiusValue.textContent = 5;
    modalIntensityRange.value = 100;
    modalIntensityValue.textContent = 100;

    updateSliderProgress(modalRadiusRange);
    updateSliderProgress(modalIntensityRange);

    // Draw initial preview
    if (currentUploadedImage) {
        drawSeamlessPreview(
            seamlessPreviewCanvas,
            currentUploadedImage,
            modalMethodSelect.value,
            parseFloat(modalRadiusRange.value),
            parseFloat(modalIntensityRange.value)
        );
    } else {
        const ctx = seamlessPreviewCanvas.getContext('2d');
        ctx.clearRect(0, 0, seamlessPreviewCanvas.width, seamlessPreviewCanvas.height);
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
        ctx.font = '12px Inter';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        ctx.fillText('Upload an image to preview seamless effect', previewCanvas.width / 2, previewCanvas.height / 2);
    }

    // Attach listeners only once
    if (!modalSlidersInitialized) {
        modalMethodSelect.addEventListener('change', updateSeamlessPreview);
        modalRadiusRange.addEventListener('input', updateSeamlessPreview);
        modalIntensityRange.addEventListener('input', updateSeamlessPreview);
        modalSlidersInitialized = true;
    }
});

closeSeamlessModal.addEventListener('click', () => {
    seamlessModal.classList.add('hidden');
});

cancelSeamless.addEventListener('click', () => {
    seamlessModal.classList.add('hidden');
});

function updateSeamlessPreview() {
    if (!currentUploadedImage) return;

    modalRadiusValue.textContent = modalRadiusRange.value;
    modalIntensityValue.textContent = modalIntensityRange.value;

    updateSliderProgress(modalRadiusRange);
    updateSliderProgress(modalIntensityRange);

    drawSeamlessPreview(
        seamlessPreviewCanvas,
        currentUploadedImage,
        modalMethodSelect.value,
        parseFloat(modalRadiusRange.value),
        parseFloat(modalIntensityRange.value)
    );
}

/**
 * Draws a tiled preview of the seamless texture effect.
 * @param {HTMLCanvasElement} previewCanvasElement The canvas to draw the preview on.
 * @param {HTMLImageElement} sourceImage The original uploaded image.
 * @param {string} method The seamless method ('blend' or 'mirror').
 * @param {number} radius The radius for blending (for 'blend' method).
 * @param {number} intensity The intensity for the effect.
 */
function drawSeamlessPreview(previewCanvasElement, sourceImage, method, radius, intensity) {
    const ctx = previewCanvasElement.getContext('2d');
    const previewWidth = previewCanvasElement.width;
    const previewHeight = previewCanvasElement.height;
    ctx.clearRect(0, 0, previewWidth, previewHeight);

    if (!sourceImage) {
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(0, 0, previewWidth, previewHeight);
        ctx.font = '12px Inter';
        ctx.fillStyle = '#6b7280';
        ctx.textAlign = 'center';
        ctx.fillText('Upload an image to preview seamless effect', previewWidth / 2, previewHeight / 2);
        return;
    }

    // Create a temporary canvas for the seamless effect
    const tempSeamlessCanvas = document.createElement('canvas');
    tempSeamlessCanvas.width = sourceImage.width;
    tempSeamlessCanvas.height = sourceImage.height;
    const tempCtx = tempSeamlessCanvas.getContext('2d');

    // Draw the original image onto the temporary canvas
    tempCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);

    // Apply seamless effect for preview (simplified for visualization)
    if (method === 'mirror') {
        // Simple mirror effect for preview
        const w = sourceImage.width;
        const h = sourceImage.height;

        // Draw original
        tempCtx.drawImage(sourceImage, 0, 0, w, h);

        // Mirror right
        tempCtx.save();
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(sourceImage, -w, 0, w, h);
        tempCtx.restore();

        // Mirror bottom
        tempCtx.save();
        tempCtx.scale(1, -1);
        tempCtx.drawImage(sourceImage, 0, -h, w, h);
        tempCtx.restore();

        // Mirror bottom-right (diagonal)
        tempCtx.save();
        tempCtx.scale(-1, -1);
        tempCtx.drawImage(sourceImage, -w, -h, w, h);
        tempCtx.restore();

    } else if (method === 'blend') {
        // For 'blend', a true seamless effect is complex.
        // For preview, we can simulate a blend by just tiling the original,
        // or if a proper blend function exists, use it here.
        // Since the actual 'make seamless' button is not yet implemented,
        // we'll just tile the original for 'blend' preview for now.
        // A more advanced implementation would apply a blending algorithm here.
        tempCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height);
    }


    // Now tile the seamless-effected image onto the preview canvas (4x4 grid)
    const tileWidth = previewWidth / 2;
    const tileHeight = previewHeight / 2;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            ctx.drawImage(tempSeamlessCanvas,
                            0, 0, tempSeamlessCanvas.width, tempSeamlessCanvas.height,
                            col * tileWidth, row * tileHeight, tileWidth, tileHeight);
        }
    }
}


////////////////////// OTHERS //////////////////////
function createBaseCanvasFromImage(img) {
    // Use the global MAP_SIZE for consistent scaling
    let width = img.width;
    let height = img.height;
    if (width > MAP_SIZE || height > MAP_SIZE) {
        if (width > height) {
            height = Math.round(height * (MAP_SIZE / width));
            width = MAP_SIZE;
        } else {
            width = Math.round(width * (MAP_SIZE / height));
            height = MAP_SIZE;
        }
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
}

function flipY(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const flippedData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
        const sourceY = height - 1 - y;
        for (let x = 0; x < width; x++) {
            const sourceOffset = (sourceY * width + x) * 4;
            const destOffset = (y * width + x) * 4;
            for (let i = 0; i < 4; i++) {
                flippedData.data[destOffset + i] = imageData.data[sourceOffset + i];
            }
        }
    }
    ctx.putImageData(flippedData, 0, 0);
    return canvas;
}

function setAllMapsFromCanvas(canvas) {
    if (textures.color) textures.color.dispose();
    textures.color = generateColorMapFromImage(canvas, colorHue, colorSaturation, colorBrightness, colorIntensity, invertColors);
    textures.color.colorSpace = THREE.SRGBColorSpace;
    textures.color.needsUpdate = true;
    updateMapButtonPreview('color', textures.color.image);
    drawMapPreview(colorMapPreviewCanvas, textures.color.image); // Update the preview canvas

    if (textures.normal) textures.normal.dispose();
    textures.normal = generateNormalMapFromImage(canvas, normalMapStrength, normalMapInvertY ?? false);
    textures.normal.flipY = true;
    textures.normal.needsUpdate = true;
    updateMapButtonPreview('normal', textures.normal.image);
    drawMapPreview(normalMapPreviewCanvas, textures.normal.image); // Update the preview canvas

    if (textures.roughness) textures.roughness.dispose();
    textures.roughness = generateRoughnessMapFromImage(canvas, roughnessInvert ?? false, roughnessStrength);
    textures.roughness.flipY = true;
    textures.roughness.needsUpdate = true;
    updateMapButtonPreview('roughness', textures.roughness.image);
    drawMapPreview(roughnessMapPreviewCanvas, textures.roughness.image); // Update the preview canvas

    if (textures.ao) textures.ao.dispose();
    textures.ao = generateAOMapFromImage(canvas, aoStrength, aoInvert);
    textures.ao.flipY = true;
    textures.ao.needsUpdate = true;
    updateMapButtonPreview('ao', textures.ao.image);
    drawMapPreview(aoMapPreviewCanvas, textures.ao.image); // Update the preview canvas

    if (textures.metallic) textures.metallic.dispose();
    textures.metallic = generateMetalnessMapFromImage(canvas, metallicInvert, metallicStrength);
    textures.metallic.flipY = true;
    textures.metallic.needsUpdate = true;
    updateMapButtonPreview('metallic', textures.metallic.image);
    drawMapPreview(metallicMapPreviewCanvas, textures.metallic.image); // Update the preview canvas

    if (textures.displacement) textures.displacement.dispose();
    textures.displacement = generateDisplacementMapFromImage(canvas, displacementStrength, displacementInvert ?? false);
    textures.displacement.flipY = true;
    textures.displacement.needsUpdate = true;
    updateMapButtonPreview('displacement', textures.displacement.image);
    drawMapPreview(displacementMapPreviewCanvas, textures.displacement.image); // Update the preview canvas

    // The model geometry and scale are now handled by updateModelGeometryForDisplacement
    // which is called at the end of regenerateDisplacementMap.
    // No need to set model.scale here.
}

function setActiveMapButton(mapType) {
    document.querySelectorAll('.texture-button').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-600');
        btn.classList.add('bg-gray-700');
    });
    const activeBtn = document.querySelector(`.texture-button[data-map-type="${mapType}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-700');
        activeBtn.classList.add('bg-blue-600', 'ring-2', 'ring-blue-400');
    }
}

function updateSliderProgress(slider) {
    if (!slider) return;
    const value = slider.value;
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #6366F1 ${percentage}%, #e0e0e0 ${percentage}%)`;
}

function saveArrayBuffer(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => {
        URL.revokeObjectURL(link.href);
        document.body.removeChild(link);
    }, 100);
}

function saveString(text, filename) {
    saveArrayBuffer(new TextEncoder().encode(text), filename);
}

function resizeCanvasToAspect(canvas, targetSize) {
    if (!canvas || targetSize === 'original') return canvas;
    const size = parseInt(targetSize, 10);
    if (!size || isNaN(size)) return canvas;
    const aspect = canvas.width / canvas.height;
    let newW, newH;
    if (aspect >= 1) {
        newW = size;
        newH = Math.round(size / aspect);
    } else {
        newH = size;
        newW = Math.round(size * aspect);
    }
    const out = document.createElement('canvas');
    out.width = newW;
    out.height = newH;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, 0, newW, newH);
    return out;
}

function updateMapButtonPreview(mapType, canvas) {
    const button = document.querySelector(`.texture-button[data-map-type="${mapType}"]`);
    if (button) {
        const img = button.querySelector('img');
        if (img) {
            if (mapType === 'pbr') {
                if (textures.color && textures.color.image) {
                    img.src = textures.color.image.toDataURL();
                } else {
                    img.src = "https://placehold.co/48x48/6366F1/FFFFFF?text=PBR";
                }
            } else {
                img.src = canvas.toDataURL();
            }
        }
    }
}

// New helper function to draw on a preview canvas
function drawMapPreview(previewCanvas, sourceCanvas) {
    if (!previewCanvas || !sourceCanvas) return;
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    const sourceAspect = sourceCanvas.width / sourceCanvas.height;
    const previewAspect = previewCanvas.width / previewCanvas.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (sourceAspect > previewAspect) {
        // Source is wider than preview, fit by width
        drawWidth = previewCanvas.width;
        drawHeight = previewCanvas.width / sourceAspect;
        offsetX = 0;
        offsetY = (previewCanvas.height - drawHeight) / 2;
    } else {
        // Source is taller or same aspect as preview, fit by height
        drawHeight = previewCanvas.height;
        drawWidth = previewCanvas.height * sourceAspect;
        offsetX = (previewCanvas.width - drawWidth) / 2;
        offsetY = 0;
    }

    // Draw the source canvas onto the preview canvas, maintaining aspect ratio
    ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height,
                    offsetX, offsetY, drawWidth, drawHeight);
}

updateDonationGoal(0, 100);