    // --- Import Three.js Addons from Global Scope ---
    const { FBXLoader } = THREE;
    const { OrbitControls } = THREE;
    /**
        * This script handles all the client-side logic for the 3D Creative Toolbox.
        * It includes tab switching, image processing for map generation, 3D rendering with Three.js,
        * and interactive controls for various artistic effects.
        */
    // --- DOM Element References ---
    const textureInput = document.getElementById('textureInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const makeSeamlessButton = document.getElementById('makeSeamlessButton');
    const textureDropZone = document.getElementById('textureDropZone');
    const stylizeDropZone = document.getElementById('stylizeDropZone');
    const pixelateDropZone = document.getElementById('pixelateDropZone');
    const meshDropZone = document.getElementById('meshDropZone');
    const seamlessMethodSelect = document.getElementById('seamlessMethodSelect');
    const seamlessBlendControls = document.getElementById('seamlessBlendControls');
    const seamlessRadiusSlider = document.getElementById('seamlessRadiusSlider');
    const seamlessRadiusValue = document.getElementById('seamlessRadiusValue');
    const seamlessIntensitySlider = document.getElementById('seamlessIntensitySlider');
    const seamlessIntensityValue = document.getElementById('seamlessIntensityValue');


    const originalTextureCanvas = document.getElementById('originalTextureCanvas');
    const normalMapCanvas = document.getElementById('normalMapCanvas');
    const roughnessMapCanvas = document.getElementById('roughnessMapCanvas');
    const aoMapCanvas = document.getElementById('aoMapCanvas');
    const metallicMapCanvas = document.getElementById('metallicMapCanvas');
    const displacementMapCanvas = document.getElementById('displacementMapCanvas');
    const invertMetallicCheckbox = document.getElementById('invertMetallic');
    const invertNormalYCheckbox = document.getElementById('invertNormalY');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const mapTooltip = document.getElementById('mapTooltip');
    const threeJsCanvas = document.getElementById('threeJsCanvas');
    
    // Removed large preview canvas elements
    // const largePreviewCanvasContainer = document.getElementById('largePreviewCanvasContainer');
    // const largePreviewCanvas = document.getElementById('largePreviewCanvas');
    // const largePreviewTitle = document.getElementById('largePreviewTitle');
    // const largePreviewCtx = largePreviewCanvas.getContext('2d');


    const exportResolutionSelect = document.getElementById('exportResolution');
    const exportButtonDropdown = document.getElementById('exportButtonDropdown'); // Renamed from exportButtonModal

    const normalStrengthSlider = document.getElementById('normalStrengthSlider');
    const normalStrengthValueSpan = document.getElementById('normalStrengthValue');
    const aoIntensitySlider = document.getElementById('aoIntensitySlider');
    const aoIntensityValueSpan = document.getElementById('aoIntensityValue');
    const displacementScaleSlider = document.getElementById('displacementScaleSlider');
    const displacementScaleValueSpan = document.getElementById('displacementScaleValue');
    const displacementBiasSlider = document.getElementById('displacementBiasSlider');
    const displacementBiasValueSpan = document.getElementById('displacementBiasValue');

    // Export Checkboxes (Renamed to denote they are in the dropdown)
    const exportOriginalTextureDropdownCheckbox = document.getElementById('exportOriginalTextureDropdown');
    const exportNormalMapDropdownCheckbox = document.getElementById('exportNormalMapDropdown');
    const exportRoughnessMapDropdownCheckbox = document.getElementById('exportRoughnessMapDropdown');
    const exportAOMapDropdownCheckbox = document.getElementById('exportAOMapDropdown');
    const exportMetallicMapDropdownCheckbox = document.getElementById('exportMetallicMapDropdown');
    const exportDisplacementMapDropdownCheckbox = document.getElementById('exportDisplacementMapDropdown');

    // 2D Map Generation Adjustment Sliders
    const roughnessIntensitySlider = document.getElementById('roughnessIntensitySlider');
    const roughnessIntensityValueSpan = document.getElementById('roughnessIntensityValue');
    const aoContrastSlider = document.getElementById('aoContrastSlider');
    const aoContrastValueSpan = document.getElementById('aoContrastValue');
    const metallicSharpnessSlider = document.getElementById('metallicSharpnessSlider');
    const metallicSharpnessValueSpan = document.getElementById('metallicSharpnessValue');
    const displacementDetailSlider = document.getElementById('displacementDetailSlider');
    const displacementDetailValueSpan = document.getElementById('displacementDetailValue');

    // Lighting Controls
    const sunAzimuthSlider = document.getElementById('sunAzimuthSlider');
    const sunAzimuthValue = document.getElementById('sunAzimuthValue');
    const sunElevationSlider = document.getElementById('sunElevationSlider');
    const sunElevationValue = document.getElementById('sunElevationValue');
    const sunIntensitySlider = document.getElementById('sunIntensitySlider');
    const sunIntensityValue = document.getElementById('sunIntensityValue');


    // Color Extractor related variables
    const colorImageInput = document.getElementById('colorImageInput');
    const colorFileNameDisplay = document.getElementById('colorFileNameDisplay');
    const colorLoadingSpinner = document.getElementById('colorLoadingSpinner');
    const colorExtractorCanvas = document.getElementById('colorExtractorCanvas');
    const numColorsSlider = document.getElementById('numColorsSlider');
    const numColorsValueSpan = document.getElementById('numColorsValue');

    // Pixelate Mode related variables
    const pixelateImageInput = document.getElementById('pixelateImageInput');
    const pixelateFileNameDisplay = document.getElementById('pixelateFileNameDisplay');
    const pixelateLoadingSpinner = document.getElementById('pixelateLoadingSpinner');
    const pixelSizeSlider = document.getElementById('pixelSizeSlider');
    const pixelSizeValueSpan = document.getElementById('pixelSizeValue');
    const pixelateCanvas = document.getElementById('pixelateCanvas');
    const stylePixelateBtn = document.getElementById('stylePixelateBtn');
    const pixelateStyleSettings = document.getElementById('pixelateStyleSettings');
    const stylePixelSizeSlider = document.getElementById('stylePixelSizeSlider');
    const stylePixelSizeValue = document.getElementById('stylePixelSizeValue');
    const styleOriginalBtn = document.getElementById('styleOriginalBtn');

    // Animation Combiner related variables
    const characterFbxInput = document.getElementById('characterFbxInput');
    const characterFileNameDisplay = document.getElementById('characterFileNameDisplay');
    const animationFbxInput = document.getElementById('animationFbxInput');
    const animationFileNameDisplay = document.getElementById('animationFileNameDisplay');
    const animationSelect = document.getElementById('animationSelect');
    const animationSpeedSlider = document.getElementById('animationSpeedSlider');
    const animationSpeedValueSpan = document.getElementById('animationSpeedValue');
    const loadAndPlayAnimationsButton = document.getElementById('loadAndPlayAnimationsButton');
    const animationCombinerThreeJsCanvas = document.getElementById('animationCombinerThreeJsCanvas');
    const animationPlaceholderText = document.getElementById('animationPlaceholderText');
    const enableRootMotionCheckbox = document.getElementById('enableRootMotion');

    // Image to Mesh related variables
    const meshImageInput = document.getElementById('meshImageInput');
    const meshFileNameDisplay = document.getElementById('meshFileNameDisplay');
    const meshLoadingSpinner = document.getElementById('meshLoadingSpinner');
    const meshDetailSlider = document.getElementById('meshDetailSlider');
    const meshDetailValue = document.getElementById('meshDetailValue');
    const meshHeightSlider = document.getElementById('meshHeightSlider');
    const meshHeightValue = document.getElementById('meshHeightValue');
    const exportGlbButton = document.getElementById('exportGlbButton');
    const imageToMeshThreeJsCanvas = document.getElementById('imageToMeshThreeJsCanvas');
    const smoothMeshCheckbox = document.getElementById('smoothMeshCheckbox');
    const meshSmoothingControls = document.getElementById('meshSmoothingControls');
    const meshSmoothingIterationsSlider = document.getElementById('meshSmoothingIterationsSlider');
    const meshSmoothingIterationsValue = document.getElementById('meshSmoothingIterationsValue');
    const meshPreviewModeSelect = document.getElementById('meshPreviewModeSelect');
    const meshPlaceholderText = document.getElementById('meshPlaceholderText');
    const imageToMeshDepthCanvas = document.getElementById('imageToMeshDepthCanvas');
    const meshDepthPlaceholderText = document.getElementById('meshDepthPlaceholderText');

    const resetPbrCameraBtn = document.getElementById('resetPbrCameraBtn');
    const resetMeshCameraBtn = document.getElementById('resetMeshCameraBtn');

    // Add Objects Dropdown elements
    const meshObjectsBtn = document.getElementById('meshObjectsBtn');
    const meshObjectsDropdown = document.getElementById('meshObjectsDropdown');


    // Tab and Control Group elements
    const textureWeaverTab = document.getElementById('texture-pbr-tab');
    const colorExtractorTab = document.getElementById('color-extractor-tab');
    const pixelateTab = document.getElementById('pixelate-tab');
    const animationCombinerTab = document.getElementById('animation-combiner-tab');
    const imageToMeshTab = document.getElementById('image-to-mesh-tab');
    const textureWeaverControls = document.getElementById('texture-pbr-controls');
    const colorExtractorControls = document.getElementById('color-extractor-controls');
    const stylizeControls = document.getElementById('stylize-controls');
    const pixelateControls = document.getElementById('pixelate-controls');
    const animationCombinerControls = document.getElementById('animation-combiner-controls');
    const imageToMeshControls = document.getElementById('image-to-mesh-controls');

    // Header and Dropdown Elements
    const appLauncherBtn = document.getElementById('appLauncherBtn');
    const exportButtonHeader = document.getElementById('exportButtonHeader');
    const tabSelectionDropdown = document.getElementById('tabSelectionDropdown');
    const exportOptionsDropdown = document.getElementById('exportOptionsDropdown');
    // The actual tab buttons are now inside the dropdown
    const tabButtonsInDropdown = tabSelectionDropdown.querySelectorAll('.tab-button');


    // --- 2D Canvas Contexts ---
    const originalCtx = originalTextureCanvas.getContext('2d');
    const normalCtx = normalMapCanvas.getContext('2d');
    const roughnessCtx = roughnessMapCanvas.getContext('2d');
    const aoCtx = aoMapCanvas.getContext('2d');
    const metallicCtx = metallicMapCanvas.getContext('2d');
    const displacementCtx = displacementMapCanvas.getContext('2d');
    const colorExtractorCtx = colorExtractorCanvas.getContext('2d');
    const pixelateCtx = pixelateCanvas.getContext('2d');

    // --- Full-Resolution Offscreen Canvases for 3D Textures ---
    // These are never added to the DOM. They hold the full-res texture data
    // to prevent the 3D preview from using the small 90x90 UI canvases.
    const fullResOriginalCanvas = document.createElement('canvas');
    const fullResNormalCanvas = document.createElement('canvas');
    const fullResRoughnessCanvas = document.createElement('canvas');
    const fullResAoCanvas = document.createElement('canvas');
    const fullResMetallicCanvas = document.createElement('canvas');
    const fullResDisplacementCanvas = document.createElement('canvas');
    const pristineSourceCanvas = document.createElement('canvas'); // NEW: Stores the original, unmodified uploaded image.

    const fullResNormalCtx = fullResNormalCanvas.getContext('2d');
    const fullResRoughnessCtx = fullResRoughnessCanvas.getContext('2d');
    const fullResAoCtx = fullResAoCanvas.getContext('2d');
    const fullResMetallicCtx = fullResMetallicCanvas.getContext('2d');
    const fullResDisplacementCtx = fullResDisplacementCanvas.getContext('2d');

    // --- Global Variables for Unified Image Handling ---
    let sharedImage = null; // Stores the main image uploaded in Texture Weaver
    let sharedFileName = 'No image selected.';

    let colorExtractorLocalImage = null; // Stores image specifically uploaded for Color Extractor tab
    let pixelateLocalImage = null; // Stores image specifically uploaded for Pixelate tab
    let meshLocalImage = null; // Stores image specifically for Image to Mesh tab

    let currentActiveTabId = 'texture-pbr-tab'; // Keep track of the active tab for specific logic

    const MAP_CANVAS_SIZE = 90; // Standard size for generated 2D maps (for display in left panel)

    const TILE_FACTOR = 5; // How many times the texture should repeat on the ground plane's longest dimension.

    // --- Three.js Variables ---
    let scene, camera, renderer, dirLight, textureWeaverMaterial, defaultGroundMaterial, texturedGroundMaterial, sunLight, pbrOrbitControls;
    let mesh, planeMesh, textureGroup; // Declared here to ensure global scope
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    // --- Animation Combiner Three.js Variables ---
    let animScene, animCamera, animRenderer, animControls, animMixer, loadedCharacter, rootBoneHelper;
    // --- Image to Mesh Three.js Variables ---
    let meshScene, meshCamera, meshRenderer, meshControls, generatedMesh, meshDepthScene, meshDepthCamera, meshDepthRenderer, generatedDepthMesh;
    const animClock = new THREE.Clock();
    // Using a map for actions allows easy lookup by animation name
    const animationActions = new Map();
    let activeAction, previousAction; // The currently playing animation action and the previous one for crossfading
    let isAnimSceneInitialized = false;
    // --- Root Motion State ---
    let isRootMotionFirstFrame = true;
    let isMeshSceneInitialized = false;
    const initialRootBonePosition = new THREE.Vector3();
    const initialRootBoneQuaternion = new THREE.Quaternion();

    // --- Monthly Income Progress Bar Variables ---
    let currentMonthlyIncome = 0; // Placeholder: Current income received
    const desiredMonthlyIncome = 100; // Placeholder: Desired monthly income

    // --- DOM Element References for Progress Bar ---
    const incomeText = document.getElementById('incomeText');
    const incomeProgressBar = document.getElementById('incomeProgressBar');
    const percentageText = document.getElementById('percentageText');

    // --- Helper Functions ---

    /**
        * Sets up a drag-and-drop zone for file uploads.
        * @param {HTMLElement} dropZoneElement The element to turn into a drop zone.
        * @param {HTMLInputElement} fileInputElement The associated file input.
        */
    function setupDropZone(dropZoneElement, fileInputElement) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, () => {
                dropZoneElement.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZoneElement.addEventListener(eventName, () => {
                dropZoneElement.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        dropZoneElement.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length > 0) {
                fileInputElement.files = files;
                // Manually trigger the 'change' event on the file input
                // so our existing loadImageAndSetShared function runs.
                const changeEvent = new Event('change', { bubbles: true });
                fileInputElement.dispatchEvent(changeEvent);
            }
        }, false);
    }

    /**
        * Custom message box function to replace alert().
        * Creates a temporary, styled div in the center of the screen.
        * @param {string} message - The message to display.
        * @param {string} type - 'error', 'success', or 'info' for styling.
        */
    function showMessageBox(message, type = 'info') {
        const messageBox = document.createElement('div');
        let bgColor, borderColor, textColor;

        switch (type) {
            case 'error':
                bgColor = '#3b0000';
                borderColor = '#8a0000';
                textColor = '#ff6b6b';
                break;
            case 'success':
                bgColor = '#003b00';
                borderColor = '#008a00';
                textColor = '#6bff6b';
                break;
            case 'info':
            default:
                bgColor = '#002f5e';
                borderColor = '#0062a3';
                textColor = '#87ceeb';
                break;
        }

        messageBox.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: ${bgColor}; border: 1px solid ${borderColor}; padding: 15px 20px;
            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); z-index: 1000;
            font-family: 'Inter', sans-serif; color: ${textColor}; text-align: center;
            max-width: 80%; /* Responsive width */
            box-sizing: border-box;
            font-size: 0.9rem;
        `;
        messageBox.innerHTML = `
            <p>${message}</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 10px; padding: 6px 12px; background-color: ${borderColor}; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 0.8rem;">Close</button>
        `;
        document.body.appendChild(messageBox);
    }

    /**
        * Clears the given canvas context.
        * Also draws fallback text if no image is loaded for that context.
        * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
        */
    function clearCanvas(ctx) {
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            // Draw fallback text if no image is loaded
            let message = '';
            if ((ctx === originalCtx || ctx === normalCtx || ctx === roughnessCtx || ctx === aoCtx || ctx === metallicCtx || ctx === displacementCtx) && !sharedImage) {
                message = 'No Image Loaded';
            }

            if ((ctx === originalCtx || ctx === normalCtx || ctx === roughnessCtx || ctx === aoCtx || ctx === metallicCtx || ctx === displacementCtx) && !sharedImage) {
                ctx.fillStyle = '#6c757d'; // Darker grey text
                ctx.font = '10px Inter, sans-serif'; // Even smaller font for message
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
            } else if (!sharedImage && (ctx === colorExtractorCtx || ctx === pixelateCtx)) {
                ctx.fillStyle = '#6c757d';
                ctx.font = '12px Inter, sans-serif'; // Smaller font for main preview messages
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
            }
        }
    }

    /**
        * Clears all canvases used by the Texture Weaver.
        */
    function clearAllCanvases() {
        clearCanvas(originalCtx);
        clearCanvas(normalCtx);
        clearCanvas(roughnessCtx);
        clearCanvas(aoCtx);
        clearCanvas(metallicCtx);
        clearCanvas(displacementCtx);
        clearCanvas(colorExtractorCtx);
        clearCanvas(pixelateCtx);
        // clearCanvas(largePreviewCtx); // Removed
    }

    /**
        * Converts an RGB color to grayscale luminosity.
        * @param {number} r - Red component (0-255).
        * @param {number} g - Green component (0-255).
        * @param {number} b - Blue component (0-255).
        * @returns {number} - Grayscale value (0-255).
        */
    function toGrayscale(r, g, b) {
        return 0.299 * r + 0.587 * g + 0.114 * b;
    }

    /**
        * Determines if a color is light or dark to set a contrasting text color.
        * @param {number} r Red (0-255)
        * @param {number} g Green (0-255)
        * @param {number} b Blue (0-255)
        * @returns {boolean} True if the color is light, false if dark.
        */
    function isColorLight(r, g, b) {
        // Using the luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5;
    }

    /**
        * Converts RGB to Hex color string.
        * @param {number} r
        * @param {number} g
        * @param {number} b
        * @returns {string} Hex color (e.g., "#RRGGBB")
        */
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    /**
        * Unified function to load an image and set it as the relevant image.
        * This function handles loading for all tabs to keep logic consistent.
        * Updates all file name displays and triggers relevant updates for the current tab.
        * @param {File} file - The image file object.
        * @param {HTMLElement} spinnerElement - The spinner associated with the input.
        * @param {HTMLInputElement} fileInput - The file input element that triggered the change.
        */
    function loadImageAndSetShared(file, spinnerElement, fileInput) {
        if (!file) {
            // If a file input is cleared, handle its specific image and display
            if (fileInput.id === 'textureInput') {
                sharedImage = null;
                sharedFileName = 'No image selected.';
                // Reset the mesh scale and position to default when no image is loaded
                if (mesh) {
                    mesh.scale.set(1, 1, 1);
                    mesh.position.y = 0;
                }
            } else if (fileInput.id === 'colorImageInput') {
                colorExtractorLocalImage = null;
            } else if (fileInput.id === 'pixelateImageInput') {
                pixelateLocalImage = null;
            } else if (fileInput.id === 'meshImageInput') {
                meshLocalImage = null;
            }
            updateAllFileDisplays();
            clearAllCanvases(); // Clear all canvas contents
            if (fileInput.id === 'textureInput') {
                updateThreeJsTextures(); // Clear 3D textures if main image is removed
            }
            spinnerElement.style.display = 'none';
            return;
        }

        // Update file name display specific to the input
        if (fileInput.id === 'textureInput') {
            sharedFileName = file.name;
        } else if (fileInput.id === 'colorImageInput') {
            // Handled by updateAllFileDisplays
        } else if (fileInput.id === 'pixelateImageInput') {
            pixelateFileNameDisplay.textContent = file.name;
        } else if (fileInput.id === 'meshImageInput') {
            meshFileNameDisplay.textContent = file.name;
        }
        
        updateAllFileDisplays(); // Update all relevant filename displays

        spinnerElement.style.display = 'block';

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                spinnerElement.style.display = 'none';

                if (fileInput.id === 'textureInput') {
                    sharedImage = img; // Main image for Texture Weaver and fallback
                } else if (fileInput.id === 'colorImageInput') {
                    colorExtractorLocalImage = img; // Store image specific to Color Extractor tab
                } else if (fileInput.id === 'pixelateImageInput') {
                    pixelateLocalImage = img; // Store image specific to Pixelate tab
                } else if (fileInput.id === 'meshImageInput') {
                    meshLocalImage = img; // Store image specific to Image to Mesh tab
                }
                
                applyEffectToCurrentTab(); // Always apply effect for current tab
            };
            img.onerror = function() {
                spinnerElement.style.display = 'none';
                showMessageBox("Error loading image. Please ensure it's a valid image file and not corrupted.", 'error');
                // Reset specific image if it was the one that failed
                if (fileInput.id === 'textureInput') { sharedImage = null; sharedFileName = "Error loading image."; }
                else if (fileInput.id === 'stylizeImageInput') { stylizeLocalImage = null; stylizeFileNameDisplay.textContent = "Error loading image."; }
                else if (fileInput.id === 'pixelateImageInput') { pixelateLocalImage = null; pixelateFileNameDisplay.textContent = "Error loading image."; }
                else if (fileInput.id === 'meshImageInput') { meshLocalImage = null; meshFileNameDisplay.textContent = "Error loading image."; }
                updateAllFileDisplays();
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            spinnerElement.style.display = 'none';
            showMessageBox("Error reading image file. Please try again.", 'error');
            // Reset specific image if it was the one that failed
            if (fileInput.id === 'textureInput') { sharedImage = null; sharedFileName = "Error reading file."; }
                else if (fileInput.id === 'stylizeImageInput') { stylizeLocalImage = null; stylizeFileNameDisplay.textContent = "Error reading file."; }
            else if (fileInput.id === 'pixelateImageInput') { pixelateLocalImage = null; pixelateFileNameDisplay.textContent = "Error reading file."; }
            else if (fileInput.id === 'pixelateImageInput') { pixelateLocalImage = null; pixelateFileNameDisplay.textContent = "Error reading file."; }
            updateAllFileDisplays();
        };
        reader.readAsDataURL(file);
    }


    /**
        * Updates all file name display spans across different tabs.
        * Ensures that if a shared image is used, its name is reflected in other tabs.
        */
    function updateAllFileDisplays() {
        fileNameDisplay.textContent = sharedFileName;
        // For Color Extractor, check if a file is explicitly chosen, otherwise use shared image filename
        if (colorImageInput.files.length > 0) {
            colorFileNameDisplay.textContent = colorImageInput.files[0].name;
        } else {
            colorFileNameDisplay.textContent = sharedImage ? sharedFileName : 'No image selected.';
        }

        // For Stylize and Pixelate, prioritize their local image, then shared image
        pixelateFileNameDisplay.textContent = pixelateLocalImage ? pixelateLocalImage.name : (sharedImage ? sharedFileName : 'No image selected.');
        meshFileNameDisplay.textContent = meshLocalImage ? meshLocalImage.name : (sharedImage ? sharedFileName : 'No image selected.');
        
        // For Animation Combiner, show the count of multiple files
        if (characterFbxInput.files.length > 0) {
            characterFileNameDisplay.textContent = characterFbxInput.files[0].name;
        } else {
            characterFileNameDisplay.textContent = 'No character file selected.';
        }
        if (animationFbxInput.files.length > 0) {
            animationFileNameDisplay.textContent = `${animationFbxInput.files.length} animation(s) selected.`;
        } else {
            animationFileNameDisplay.textContent = 'No animation files selected.';
        }
    }

    /**
        * Applies the specific effect for the currently active tab.
        * This acts as a central dispatcher, calling the correct function based on `currentActiveTabId`.
        */
    function applyEffectToCurrentTab() {
        let imageToProcess = null;

        switch(currentActiveTabId) {
            case 'texture-pbr-tab':
                imageToProcess = sharedImage;
                if (!imageToProcess) {
                    clearCanvas(originalCtx);
                    clearCanvas(normalCtx);
                    clearCanvas(roughnessCtx);
                    clearCanvas(aoCtx);
                    clearCanvas(metallicCtx);
                    clearCanvas(displacementCtx);
                    extractColorPalette(null); // Clear the palette
                    updateThreeJsTextures();
                    updateStylePreviews(); // Reset style previews
                    return;
                }
                // 1. Draw to the small UI preview canvas
                originalTextureCanvas.width = MAP_CANVAS_SIZE;
                originalTextureCanvas.height = MAP_CANVAS_SIZE;
                originalCtx.drawImage(imageToProcess, 0, 0, MAP_CANVAS_SIZE, MAP_CANVAS_SIZE);

                // 2. Draw to the full-resolution offscreen canvas for the 3D texture
                const fullResOriginalCtx = fullResOriginalCanvas.getContext('2d');
                fullResOriginalCanvas.width = imageToProcess.width;
                fullResOriginalCanvas.height = imageToProcess.height;
                fullResOriginalCtx.drawImage(imageToProcess, 0, 0);

                // Also draw to the pristine canvas to store the original state for non-destructive operations like seamlessing.
                const pristineCtx = pristineSourceCanvas.getContext('2d');
                pristineSourceCanvas.width = imageToProcess.width;
                pristineSourceCanvas.height = imageToProcess.height;
                pristineCtx.drawImage(imageToProcess, 0, 0);

                // Adjust the 3D mesh scale and position to match the texture's aspect ratio
                if (mesh && imageToProcess) {
                    const aspect = imageToProcess.width / imageToProcess.height;
                    const defaultHeight = 1.0; // The height of the plane in 3D units

                    let scaledWidth = defaultHeight * aspect;
                    let scaledHeight = defaultHeight;

                    // Ensure the widest dimension isn't excessively large if image is very wide/tall
                    const maxDisplayDimension = 1.5; // Cap the max visible dimension in 3D scene
                    if (scaledWidth > maxDisplayDimension) {
                        scaledHeight = (maxDisplayDimension / scaledWidth) * scaledHeight;
                        scaledWidth = maxDisplayDimension;
                    }
                    if (scaledHeight > maxDisplayDimension) {
                        scaledWidth = (maxDisplayDimension / scaledHeight) * scaledWidth;
                        scaledHeight = maxDisplayDimension;
                    }

                    mesh.scale.set(scaledWidth, scaledHeight, 1); // Z-scale is 1 for a plane
                    mesh.position.y = 0; // Plane is centered vertically
                }

                // 3. Generate all maps from the full-resolution source.
                // This function will also handle updating the 3D view and UI previews.
                generateMaps();
                extractColorPalette(imageToProcess);
                updateStylePreviews();
                break;
            case 'color-extractor-tab':
                imageToProcess = colorExtractorLocalImage || sharedImage; // Prioritize local, then shared
                if (!imageToProcess) {
                    clearCanvas(colorExtractorCtx);
                    document.getElementById('extractedColorPalette').innerHTML = '<p class="text-center w-full text-gray-500 text-sm"></p>';
                    return;
                }

                // --- New Responsive Drawing Logic ---
                const wrapper = colorExtractorCanvas.parentElement;
                const maxWidth = wrapper.clientWidth;
                const maxHeight = wrapper.clientHeight;

                // Set the canvas drawing buffer size to its actual display size
                colorExtractorCanvas.width = maxWidth;
                colorExtractorCanvas.height = maxHeight;

                const imgAspectRatio = imageToProcess.width / imageToProcess.height;
                const canvasAspectRatio = maxWidth / maxHeight;

                let renderWidth, renderHeight, x, y;

                if (imgAspectRatio > canvasAspectRatio) {
                    // Image is wider than the canvas area
                    renderWidth = maxWidth;
                    renderHeight = maxWidth / imgAspectRatio;
                    x = 0;
                    y = (maxHeight - renderHeight) / 2; // Center vertically
                } else {
                    // Image is taller than or has the same aspect ratio as the canvas area
                    renderHeight = maxHeight;
                    renderWidth = maxHeight * imgAspectRatio;
                    y = 0;
                    x = (maxWidth - renderWidth) / 2; // Center horizontally
                }
                colorExtractorCtx.drawImage(imageToProcess, x, y, renderWidth, renderHeight);
                extractColorPalette(imageToProcess); // Pass the image
                break;
            case 'pixelate-tab':
                imageToProcess = pixelateLocalImage || sharedImage; // Prioritize pixelateLocalImage, then sharedImage
                if (!imageToProcess) { clearCanvas(pixelateCtx); return; }
                // Resize canvas based on client width/height but respect aspect ratio and max size
                const aspectRatioPix = imageToProcess.width / imageToProcess.height;
                let canvasWidthPix = imageToProcess.width;
                let canvasHeightPix = imageToProcess.height;
                if (canvasWidthPix > 600) { canvasWidthPix = 600; canvasHeightPix = 600 / aspectRatioPix; }
                if (canvasHeightPix > 380) { canvasHeightPix = 380; canvasWidthPix = 380 * aspectRatioPix; }
                pixelateCanvas.width = canvasWidthPix;
                pixelateCanvas.height = canvasHeightPix;
                pixelateCtx.drawImage(imageToProcess, 0, 0, canvasWidthPix, canvasHeightPix);
                applyPixelateEffect();
                break;
            case 'animation-combiner-tab':
                // No image processing directly to canvases for this tab
                break;
            case 'image-to-mesh-tab':
                // The image processing happens inside the generate function
                generateMeshFromImage();
                break;
        }
    }

    /**
     * Generates a dynamic grid texture for the ground plane's default state.
     * @returns {THREE.CanvasTexture} A tileable grid texture.
     */
    function generateGridTexture() {
        const size = 256; // Texture resolution
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');

        // Dark bluish-gray background, matching typical 3D software.
        context.fillStyle = '#2d3748';
        context.fillRect(0, 0, size, size);

        // Light blue-gray grid lines for contrast and scale.
        context.strokeStyle = '#4a5568';
        context.lineWidth = 1;

        const divisions = 8; // 8x8 grid within the texture
        const step = size / divisions;

        for (let i = 0; i < size; i += step) {
            context.beginPath(); context.moveTo(0, i + 0.5); context.lineTo(size, i + 0.5); context.stroke(); // Horizontal
            context.beginPath(); context.moveTo(i + 0.5, 0); context.lineTo(i + 0.5, size); context.stroke(); // Vertical
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    /**
     * Resets the PBR camera and object rotation to their default state.
     */
    function resetPbrCamera() {
        if (pbrOrbitControls && mesh && textureGroup) {
            // Reset OrbitControls
            pbrOrbitControls.reset();

            // Reset mesh rotation to default (facing camera, upright)
            mesh.rotation.set(0, 0, 0);
            // Also reset the parent group rotation if it was modified by the mouse.
            textureGroup.rotation.set(0, 0, 0);
            
            // Update controls to reflect reset
            pbrOrbitControls.update();
        }
    }

    /**
     * Resets the Image to Mesh camera to its saved initial state.
     */
    function resetImageToMeshCamera() {
        if (meshControls) meshControls.reset();
    }

    // --- Three.js Specific Functions ---

    /**
     * Initializes the Three.js scene, camera, renderer, and basic objects for Texture Weaver.
     * Also sets up responsive resizing and mouse controls for the 3D mesh.
     * @param {HTMLCanvasElement} canvasElement - The canvas DOM element for Three.js rendering.
     * @param {HTMLDivElement} textureWeaverTabElement - The texture weaver tab element for resize check.
     */
    function initThreeJsTextureWeaver(canvasElement, textureWeaverTabElement) {
        scene = new THREE.Scene(); // No background color, will be set by HDRI
        // Camera Position
        camera = new THREE.PerspectiveCamera(45, canvasElement.clientWidth / canvasElement.clientHeight, 0.1, 1000);
        camera.position.set(0.0, 0.25, 0.65); // Position suitable for viewing a plane
        camera.lookAt(scene.position); // Look at the center (0,0,0)


        try {
            renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });
            renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 0.6; // Lower exposure to balance with the new sun light
            renderer.outputEncoding = THREE.sRGBEncoding; // Ensure correct color output
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        } catch (e) {
            console.error("DEBUG: Three.js Init Error: Failed to create WebGLRenderer for Texture Weaver:", e);
            showMessageBox(`Error initializing 3D preview: Your browser might not support WebGL.`, 'error');
            return;
        }

        // Load the HDRI environment map for realistic lighting and reflections
        new THREE.RGBELoader()
            .setDataType(THREE.UnsignedByteType) // Use UnsignedByteType for .hdr files
            // Use the version from the Three.js examples repo, which has the correct CORS headers.
            // The Polyhaven direct link does not, causing a loading error in the browser.
            .load('https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;

                const pmremGenerator = new THREE.PMREMGenerator(renderer);
                pmremGenerator.compileEquirectangularShader();

                const envMap = pmremGenerator.fromEquirectangular(texture).texture;

                scene.background = envMap;
                scene.environment = envMap;

                texture.dispose();
                pmremGenerator.dispose();

            }, undefined, (err) => {
                console.error('An error occurred loading the HDRI.', err);
                showMessageBox('Failed to load HDRI environment map. Using fallback lighting.', 'error');
                scene.background = new THREE.Color(0x1a1a1a); // Fallback background
            });

        // Add a directional light to act as a controllable sun
        sunLight = new THREE.DirectionalLight(0xffffff, 3.0); // Increased intensity to 3.0
        sunLight.castShadow = true;
        // Configure shadow properties for better quality
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.radius = 16; // Added for softer shadows
        sunLight.shadow.bias = - 0.0005; // Added to prevent shadow acne
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 50;
        sunLight.shadow.camera.left = -10;
        sunLight.shadow.camera.right = 10;
        sunLight.shadow.camera.top = 10;
        sunLight.shadow.camera.bottom = -10;
        scene.add(sunLight);
        scene.add(sunLight.target);

        // Responsive renderer resize listener
        window.addEventListener('resize', () => {
            // Only resize if the texture weaver tab is active
            if (textureWeaverTabElement && textureWeaverTabElement.classList.contains('active')) {
                camera.aspect = canvasElement.clientWidth / canvasElement.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(canvasElement.clientWidth, canvasElement.clientHeight);
            }
        });

        // Change from BoxGeometry to PlaneGeometry for the main object
        const geometry = new THREE.PlaneGeometry(1, 1, 256, 256); // Start with 1x1 plane, high segments for displacement
        geometry.rotateX(Math.PI / 2); // Rotate to be upright (like a wall)

        textureWeaverMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 1.0,
            metalness: 0.0,
            side: THREE.DoubleSide // Important for planes if you might see both sides
        });

        // Create a group to hold the plane and the ground plane, so they rotate together
        textureGroup = new THREE.Group();
        scene.add(textureGroup);

        mesh = new THREE.Mesh(geometry, textureWeaverMaterial);
        mesh.castShadow = true; // The main object should cast shadows
        mesh.visible = false; // Hide the main plane, only show the ground
        textureGroup.add(mesh); // Add the plane to the group

        // Create the ground plane
        const planeSize = 10;
        const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 256, 256); // Add segments for displacement

        // Create the default grid material for the ground when no texture is loaded.
        const gridTexture = generateGridTexture();
        // We now control tiling via the texture's repeat property, not by modifying geometry UVs.
        gridTexture.repeat.set(TILE_FACTOR, TILE_FACTOR);

        defaultGroundMaterial = new THREE.MeshStandardMaterial({
            map: gridTexture,
            roughness: 0.8,
            metalness: 0.1
        });

        // Also create the material for the ground when it's textured.
        texturedGroundMaterial = new THREE.MeshStandardMaterial({ // This will now have displacement
            color: 0xffffff,
            roughness: 0.8,
            metalness: 0.1
        });
        planeMesh = new THREE.Mesh(planeGeometry, defaultGroundMaterial); // Use the grid material by default
        planeMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        planeMesh.position.y = 0; // Position the ground at the origin
        planeMesh.receiveShadow = true; // The ground should receive shadows
        textureGroup.add(planeMesh); // Add ground plane to the group so it also rotates


        // Use OrbitControls instead of manual mouse controls for better interaction
        pbrOrbitControls = new OrbitControls(camera, renderer.domElement);
        pbrOrbitControls.target.set(0, 0, 0); // Point controls at the origin where the plane is
        pbrOrbitControls.enablePan = true; // Enable panning
        pbrOrbitControls.enableDamping = true; // Enable damping (smoothness)
        pbrOrbitControls.dampingFactor = 0.05;
        pbrOrbitControls.update();
        pbrOrbitControls.saveState(); // Save initial state for reset button

        // Add an event listener to call render when controls change
        pbrOrbitControls.addEventListener('change', render);

        // Removed manual mouse controls and wheel events. OrbitControls handles all of this.

        animateThreeJsTextureWeaver();
    }

    /**
    * Updates the sun's position and intensity based on the UI sliders.
    * Uses spherical coordinates for intuitive azimuth/elevation control.
    */
    function updateSunPosition() {
        if (!sunLight) return;

        const azimuth = THREE.MathUtils.degToRad(sunAzimuthSlider.value); // horizontal angle
        const elevation = THREE.MathUtils.degToRad(sunElevationSlider.value); // vertical angle
        const distance = 15; // Arbitrary distance from the origin

        // Calculate position from spherical coordinates
        // Y is up in Three.js
        sunLight.position.x = distance * Math.cos(elevation) * Math.sin(azimuth);
        sunLight.position.y = distance * Math.sin(elevation);
        sunLight.position.z = distance * Math.cos(elevation) * Math.cos(azimuth);

        sunLight.target.position.set(0, 0, 0); // Ensure it always points to the center
        sunLight.target.updateMatrixWorld(); // Update the target's matrix
        
        sunLight.intensity = parseFloat(sunIntensitySlider.value);

        // Update UI values
        sunAzimuthValue.textContent = sunAzimuthSlider.value + '°';
        sunElevationValue.textContent = sunElevationValue.textContent = sunElevationSlider.value + '°';
        sunIntensityValue.textContent = parseFloat(sunIntensitySlider.value).toFixed(2);
    }

    /**
     * Three.js animation loop for Texture Weaver.
     */
    function animateThreeJsTextureWeaver() {
        requestAnimationFrame(animateThreeJsTextureWeaver);
        
        // Auto-rotation removed, OrbitControls handles camera movement

        if (pbrOrbitControls) { // Update controls in the animation loop if damping is enabled
            pbrOrbitControls.update();
        }

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    /**
     * A simple render function for Three.js.
     */
    function render() {
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    /**
     * Updates the textures on the Three.js material for Texture Weaver.
     * Disposes old textures to prevent memory leaks and applies new ones from the 2D canvases.
     */
    function updateThreeJsTextures() {
        if (!textureWeaverMaterial) {
            return;
        }

        // Switch the plane's material based on whether a texture is loaded.
        if (sharedImage) {
            if (planeMesh && planeMesh.material !== texturedGroundMaterial) planeMesh.material = texturedGroundMaterial;
        } else {
            if (planeMesh && planeMesh.material !== defaultGroundMaterial) planeMesh.material = defaultGroundMaterial;
        }

        // Dispose old textures to free up GPU memory
        if (textureWeaverMaterial.map) textureWeaverMaterial.map.dispose();
        if (textureWeaverMaterial.normalMap) textureWeaverMaterial.normalMap.dispose();
        if (textureWeaverMaterial.roughnessMap) textureWeaverMaterial.roughnessMap.dispose();
        if (textureWeaverMaterial.aoMap) textureWeaverMaterial.aoMap.dispose();
        if (textureWeaverMaterial.metalnessMap) textureWeaverMaterial.metalnessMap.dispose();
        if (textureWeaverMaterial.displacementMap) textureWeaverMaterial.displacementMap.dispose();
        // Also dispose old ground textures, as they are separate objects now
        if (texturedGroundMaterial.map) texturedGroundMaterial.map.dispose();
        if (texturedGroundMaterial.normalMap) texturedGroundMaterial.normalMap.dispose();
        if (texturedGroundMaterial.roughnessMap) texturedGroundMaterial.roughnessMap.dispose();
        if (texturedGroundMaterial.aoMap) texturedGroundMaterial.aoMap.dispose();
        if (texturedGroundMaterial.metalnessMap) texturedGroundMaterial.metalnessMap.dispose();

        const aspect = sharedImage ? sharedImage.width / sharedImage.height : 1;

        // Helper to create a base texture with wrapping, but no aspect correction.
        const createBaseTexture = (canvas) => {
            if (!canvas || !sharedImage) return null;
            const texture = new THREE.CanvasTexture(canvas);
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            return texture;
        };

        // Create new CanvasTextures for the main plane material (no UV aspect correction)
        textureWeaverMaterial.map = createBaseTexture(fullResOriginalCanvas);
        textureWeaverMaterial.normalMap = createBaseTexture(fullResNormalCanvas);
        textureWeaverMaterial.roughnessMap = createBaseTexture(fullResRoughnessCanvas);
        textureWeaverMaterial.aoMap = createBaseTexture(fullResAoCanvas);
        textureWeaverMaterial.metalnessMap = createBaseTexture(fullResMetallicCanvas);
        textureWeaverMaterial.displacementMap = createBaseTexture(fullResDisplacementCanvas);

        // Set appropriate sRGBEncoding for color maps (albedo)
        if (textureWeaverMaterial.map) textureWeaverMaterial.map.encoding = THREE.sRGBEncoding;

        // Apply slider values to the material properties (3D Material Properties)
        if (normalStrengthSlider) textureWeaverMaterial.normalScale.set(parseFloat(normalStrengthSlider.value), parseFloat(normalStrengthSlider.value));
        textureWeaverMaterial.roughness = 1.0; // Let the map control roughness entirely
        if (aoIntensitySlider) textureWeaverMaterial.aoMapIntensity = parseFloat(aoIntensitySlider.value);
        textureWeaverMaterial.metalness = 1.0; // Let the map control metalness entirely
        if (displacementScaleSlider) textureWeaverMaterial.displacementScale = parseFloat(displacementScaleSlider.value);
        if (displacementBiasSlider) textureWeaverMaterial.displacementBias = parseFloat(displacementBiasSlider.value);

        // Update the GROUND material with CLONED textures and apply aspect correction
        if (texturedGroundMaterial && sharedImage) {
            // Helper to clone a texture and apply aspect ratio correction for the ground plane.
            const setupGroundTexture = (sourceTexture) => {
                if (!sourceTexture) return null;
                const groundTexture = sourceTexture.clone();
                groundTexture.needsUpdate = true; // Essential after cloning
                
                // New logic: Make the ground tiles have the same aspect ratio as the texture.
                if (aspect >= 1) { // Wider than or equal to tall (square)
                    groundTexture.repeat.set(TILE_FACTOR, TILE_FACTOR * aspect);
                } else { // Taller than wide
                    groundTexture.repeat.set(TILE_FACTOR / aspect, TILE_FACTOR);
                }
                groundTexture.offset.set(0, 0); // Reset offset, no longer needed
                return groundTexture;
            };

            texturedGroundMaterial.map = setupGroundTexture(textureWeaverMaterial.map);
            texturedGroundMaterial.normalMap = setupGroundTexture(textureWeaverMaterial.normalMap);
            texturedGroundMaterial.roughnessMap = setupGroundTexture(textureWeaverMaterial.roughnessMap);
            texturedGroundMaterial.aoMap = setupGroundTexture(textureWeaverMaterial.aoMap);
            texturedGroundMaterial.metalnessMap = setupGroundTexture(textureWeaverMaterial.metalnessMap);
            texturedGroundMaterial.displacementMap = setupGroundTexture(textureWeaverMaterial.displacementMap); // Enable displacement

            texturedGroundMaterial.normalScale.copy(textureWeaverMaterial.normalScale);
            texturedGroundMaterial.aoMapIntensity = textureWeaverMaterial.aoMapIntensity;
            texturedGroundMaterial.displacementScale = textureWeaverMaterial.displacementScale; // Sync displacement scale
            texturedGroundMaterial.displacementBias = textureWeaverMaterial.displacementBias; // Sync displacement bias
            texturedGroundMaterial.needsUpdate = true;
        } else {
            // Clear ground textures if no image
            texturedGroundMaterial.map = null;
            texturedGroundMaterial.normalMap = null;
            texturedGroundMaterial.roughnessMap = null;
            texturedGroundMaterial.aoMap = null;
            texturedGroundMaterial.metalnessMap = null;
            texturedGroundMaterial.displacementMap = null;
        }

        // --- NEW: Sync with Image-to-Mesh Material ---
        // If the generated mesh from the other tab exists, update its material too.
        syncMeshMaterialFromPbr();

        // Ensure material updates
        textureWeaverMaterial.needsUpdate = true;
    }
    
    /**
     * Sets the 3D preview to isolate a single map or restore the full PBR view.
     * @param {string} mapType - The 'data-map-type' of the clicked canvas container.
     */
    function set3DPreviewMode(mapType) {
        if (!textureWeaverMaterial || !sharedImage) return;

        // Remove active state from all 2D map containers first
        document.querySelectorAll('.map-grid .canvas-container').forEach(c => c.classList.remove('isolated-view'));
        // Remove highlight from the material adjustments controls group
        document.getElementById('materialAdjustmentsControlsGroup').classList.remove('highlighted-controls-group');


        // If we want to restore the full PBR view, clicking 'Original' or the currently isolated map does this.
        // Also, if the container for the clicked map is already isolated, clicking it again will restore.
        const container = document.querySelector(`.map-grid .canvas-container[data-map-type="${mapType}"]`);
        if (mapType === 'Original Texture' || (container && container.classList.contains('isolated-view'))) {
            updateThreeJsTextures(); // This function restores the full PBR material for both plane and ground
            if (container) container.classList.remove('isolated-view'); // Ensure highlight is removed if it was there
            return;
        }

        // --- Isolate a specific map ---

        // Add active state to the clicked 2D map container for visual feedback
        if (container) {
            container.classList.add('isolated-view');
        }
        // Add highlight to the material adjustments controls group
        document.getElementById('materialAdjustmentsControlsGroup').classList.add('highlighted-controls-group');


        // Dispose old textures on the main material to free up GPU memory
        if (textureWeaverMaterial.map) textureWeaverMaterial.map.dispose();
        if (textureWeaverMaterial.normalMap) textureWeaverMaterial.normalMap.dispose();
        if (textureWeaverMaterial.roughnessMap) textureWeaverMaterial.roughnessMap.dispose();
        if (textureWeaverMaterial.aoMap) textureWeaverMaterial.aoMap.dispose();
        if (textureWeaverMaterial.metalnessMap) textureWeaverMaterial.metalnessMap.dispose();
        if (textureWeaverMaterial.displacementMap) textureWeaverMaterial.displacementMap.dispose();

        // Reset BOTH materials to a neutral state for viewing a single map
        const neutralProps = {
            map: null, normalMap: null, roughnessMap: null, aoMap: null, metalnessMap: null, displacementMap: null,
            aoMapIntensity: 0.0,
            roughness: 0.5, metalness: 0.0, // Default roughness/metalness if no map
            color: new THREE.Color(0xffffff) // Reset color to white for isolated view
        };
        Object.assign(textureWeaverMaterial, neutralProps);
        textureWeaverMaterial.displacementScale = 0.0;
        textureWeaverMaterial.displacementBias = 0.0;
        textureWeaverMaterial.normalScale.set(0, 0);

        // Also reset the ground material to a neutral state
        if (texturedGroundMaterial) {
            Object.assign(texturedGroundMaterial, neutralProps);
            texturedGroundMaterial.displacementScale = 0.0;
            texturedGroundMaterial.displacementBias = 0.0;
            texturedGroundMaterial.normalScale.set(0, 0);
        }
        // Use the fullResOriginalCanvas for "Original Texture" type and all others from their fullRes counterpart.
        const sourceCanvasMap = {
            'Original Texture': fullResOriginalCanvas, // Added original texture to map for consistent handling
            'Normal Map': fullResNormalCanvas,
            'Roughness Map': fullResRoughnessCanvas,
            'Ambient Occlusion Map': fullResAoCanvas,
            'Metallic Map': fullResMetallicCanvas,
            'Displacement Map': fullResDisplacementCanvas
        };

        const aspect = sharedImage ? sharedImage.width / sharedImage.height : 1;
        const sourceCanvas = sourceCanvasMap[mapType];

        if (sourceCanvas) {
            // Create the base texture for the plane (no UV correction)
            const planePreviewTexture = new THREE.CanvasTexture(sourceCanvas);
            planePreviewTexture.wrapS = THREE.RepeatWrapping;
            planePreviewTexture.wrapT = THREE.RepeatWrapping;
            // Only Albedo (Original Texture) should have sRGB encoding
            planePreviewTexture.encoding = (mapType === 'Original Texture') ? THREE.sRGBEncoding : THREE.LinearEncoding;
            planePreviewTexture.needsUpdate = true;
            
            textureWeaverMaterial.map = planePreviewTexture;
            // For isolated views, ensure the object color is white so the map color is fully visible.
            textureWeaverMaterial.color.setHex(0xffffff);


            // Create a cloned, aspect-corrected texture for the ground
            if (texturedGroundMaterial) {
                const groundPreviewTexture = planePreviewTexture.clone();
                
                // Apply the same aspect-ratio-aware tiling to the isolated preview
                if (aspect >= 1) { // Wider than or equal to tall (square)
                    groundPreviewTexture.repeat.set(TILE_FACTOR, TILE_FACTOR * aspect);
                } else { // Taller than wide
                    groundPreviewTexture.repeat.set(TILE_FACTOR / aspect, TILE_FACTOR);
                }
                groundPreviewTexture.offset.set(0, 0);
                groundPreviewTexture.needsUpdate = true; // Essential after clone and modification
                texturedGroundMaterial.map = groundPreviewTexture;
                texturedGroundMaterial.color.setHex(0xffffff); // Ensure ground is also white
            }
        } else {
            // If mapType is unrecognized or sourceCanvas is null, just show original.
            updateThreeJsTextures();
            showMessageBox("Invalid map type selected for preview.", "error");
        }

        textureWeaverMaterial.needsUpdate = true;
        if (texturedGroundMaterial) texturedGroundMaterial.needsUpdate = true;
    }

    /**
     * Synchronizes the material of the generated mesh in the "Image to Mesh" tab
     * with the current state of the main PBR material.
     */
    function syncMeshMaterialFromPbr() {
        if (!generatedMesh || !generatedMesh.material || !textureWeaverMaterial || !sharedImage) {
            return;
        }

        const meshMaterial = generatedMesh.material;

        // Dispose old textures on the mesh material to prevent memory leaks
        if (meshMaterial.map) meshMaterial.map.dispose();
        if (meshMaterial.normalMap) meshMaterial.normalMap.dispose();
        if (meshMaterial.roughnessMap) meshMaterial.roughnessMap.dispose();
        if (meshMaterial.aoMap) meshMaterial.aoMap.dispose();
        if (meshMaterial.metalnessMap) meshMaterial.metalnessMap.dispose();

        // Helper to clone a texture for the mesh material.
        const cloneForMesh = (sourceTexture) => {
            if (!sourceTexture || !sourceTexture.image) return null;
            const newTexture = sourceTexture.clone();
            newTexture.needsUpdate = true;
            newTexture.wrapS = THREE.ClampToEdgeWrapping;
            newTexture.wrapT = THREE.ClampToEdgeWrapping;
            return newTexture;
        };

        // Clone textures and copy properties from the PBR material
        meshMaterial.map = cloneForMesh(textureWeaverMaterial.map);
        meshMaterial.normalMap = cloneForMesh(textureWeaverMaterial.normalMap);
        meshMaterial.roughnessMap = cloneForMesh(textureWeaverMaterial.roughnessMap);
        meshMaterial.aoMap = cloneForMesh(textureWeaverMaterial.aoMap);
        meshMaterial.metalnessMap = cloneForMesh(textureWeaverMaterial.metalnessMap);
        meshMaterial.normalScale.copy(textureWeaverMaterial.normalScale);
        meshMaterial.aoMapIntensity = textureWeaverMaterial.aoMapIntensity;
        meshMaterial.roughness = textureWeaverMaterial.roughness;
        meshMaterial.metalness = textureWeaverMaterial.metalness;
        meshMaterial.needsUpdate = true;
    }

    // --- Texture Weaver Core Logic Functions ---

    /**
     * Calls all map generation functions for texture weaver.
     * This is the main trigger after an image is loaded or a 2D adjustment slider is moved.
     */
    function generateMaps() {
        if (!sharedImage) {
            clearCanvas(originalCtx);
            clearCanvas(normalCtx);
            clearCanvas(roughnessCtx);
            clearCanvas(aoCtx);
            clearCanvas(metallicCtx);
            clearCanvas(displacementCtx);
            return;
        }
        // Generate all maps using the full-resolution canvases as source and destination
        generateNormalMap(fullResOriginalCanvas, fullResNormalCanvas, invertNormalYCheckbox.checked);
        generateRoughnessMap(fullResOriginalCanvas, fullResRoughnessCanvas, parseFloat(roughnessIntensitySlider.value));
        generateAOMap(fullResOriginalCanvas, fullResAoCanvas, parseFloat(aoContrastSlider.value));
        generateMetallicMap(fullResOriginalCanvas, fullResMetallicCanvas, parseFloat(metallicSharpnessSlider.value), invertMetallicCheckbox.checked);
        generateDisplacementMap(fullResOriginalCanvas, fullResDisplacementCanvas, parseFloat(displacementDetailSlider.value));

        // After generating full-res maps, update the small UI previews and the 3D model
        updatePreviewCanvases();
        updateThreeJsTextures();
    }

    /**
     * Copies the content from the full-resolution offscreen canvases
     * to the small 90x90 preview canvases in the UI.
     */
    function updatePreviewCanvases() {
        // Helper to copy from a full-res canvas to a small preview canvas
        const copyToPreview = (sourceCanvas, destCtx) => {
            if (sharedImage && destCtx) {
                destCtx.clearRect(0, 0, destCtx.canvas.width, destCtx.canvas.height);
                destCtx.drawImage(sourceCanvas, 0, 0, destCtx.canvas.width, destCtx.canvas.height);
            } else if (destCtx) {
                clearCanvas(destCtx);
            }
        };

        copyToPreview(fullResNormalCanvas, normalCtx);
        copyToPreview(fullResRoughnessCanvas, roughnessCtx);
        copyToPreview(fullResAoCanvas, aoCtx);
        copyToPreview(fullResMetallicCanvas, metallicCtx);
        copyToPreview(fullResDisplacementCanvas, displacementCtx);
    }


    // --- Map Generation Functions (Updated with new parameters) ---

    /**
     * Generates a Normal Map from a grayscale version of the source image.
     * Uses a Sobel operator to calculate gradients and encode them as RGB values.
     * @param {HTMLCanvasElement} sourceCanvas The canvas with the original image.
     * @param {HTMLCanvasElement} targetCanvas The canvas to draw the normal map on.
     * @param {boolean} invertY Whether to invert the Y (green) channel.
     */
    function generateNormalMap(sourceCanvas, targetCanvas, invertY) {
        if (!sourceCanvas || !targetCanvas || !targetCanvas.getContext('2d') || !sharedImage) {
            clearCanvas(targetCanvas.getContext('2d'));
            return;
        }
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;

        const sourceCtx = sourceCanvas.getContext('2d');
        const targetCtx = targetCanvas.getContext('2d');

        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const data = imageData.data;
        const newImageData = targetCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
        const newData = newImageData.data;

        const width = sourceCanvas.width;
        const height = sourceCanvas.height;

        const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        function getPixelGrayscale(x, y) {
            if (x < 0 || x >= width || y < 0 || y >= height) {
                x = Math.max(0, Math.min(width - 1, x));
                y = Math.max(0, Math.min(height - 1, y));
            }
            const i = (y * width + x) * 4;
            return toGrayscale(data[i], data[i + 1], data[i + 2]);
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sumX = 0;
                let sumY = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelGray = getPixelGrayscale(x + kx, y + ky);
                        const kernelIndex = (ky + 1) * 3 + (kx + 1);
                        sumX += pixelGray * gx[kernelIndex];
                        sumY += pixelGray * gy[kernelIndex];
                    }
                }

                const maxGradient = 1020;
                let normalX = sumX / maxGradient;
                let normalY = sumY / maxGradient;
                let normalZ = 1.0; 

                const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
                if (length > 0) {
                    normalX /= length;
                    normalY /= length;
                    normalZ /= length;
                }

                const r = Math.floor((normalX * 0.5 + 0.5) * 255);
                let g;
                if (invertY) {
                    g = Math.floor((0.5 - normalY * 0.5) * 255);
                } else {
                    g = Math.floor((normalY * 0.5 + 0.5) * 255);
                }
                const b = Math.floor((normalZ * 0.5 + 0.5) * 255);

                const i = (y * width + x) * 4;
                newData[i] = r;
                newData[i + 1] = g;
                newData[i + 2] = b;
                newData[i + 3] = 255;
            }
        }
        targetCtx.putImageData(newImageData, 0, 0);
    }

    /**
     * Generates a simulated Roughness Map with intensity control.
     * Darker areas of the original image become less rough (smoother), lighter areas become more rough.
     * @param {HTMLCanvasElement} sourceCanvas - The canvas containing the original texture.
     * @param {HTMLCanvasElement} targetCanvas - The canvas to draw the roughness map on.
     * @param {number} intensity - Multiplier for roughness value (0.0 to 2.0).
     */
    function generateRoughnessMap(sourceCanvas, targetCanvas, intensity) {
        if (!sourceCanvas || !targetCanvas || !targetCanvas.getContext('2d') || !sharedImage) {
            clearCanvas(targetCanvas.getContext('2d'));
            return;
        }
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;

        const sourceCtx = sourceCanvas.getContext('2d');
        const targetCtx = targetCanvas.getContext('2d');

        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const data = imageData.data;
        const newImageData = targetCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
        const newData = newImageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let gray = toGrayscale(data[i], data[i + 1], data[i + 2]);
            gray = Math.max(0, Math.min(255, gray * intensity)); // Apply intensity and clamp

            newData[i] = gray;
            newData[i + 1] = gray;
            newData[i + 2] = gray;
            newData[i + 3] = 255;
        }
        targetCtx.putImageData(newImageData, 0, 0);
    }

    /**
     * Generates a simulated Ambient Occlusion (AO) Map with contrast control.
     * Inverts the grayscale values of the original image to simulate shadows in crevices.
     * @param {HTMLCanvasElement} sourceCanvas - The canvas containing the original texture.
     * @param {HTMLCanvasElement} targetCanvas - The canvas to draw the AO map on.
     * @param {number} contrast - Multiplier for AO contrast (0.0 to 2.0).
     */
    function generateAOMap(sourceCanvas, targetCanvas, contrast) {
        if (!sourceCanvas || !targetCanvas || !targetCanvas.getContext('2d') || !sharedImage) {
            clearCanvas(targetCanvas.getContext('2d'));
            return;
        }
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;

        const sourceCtx = sourceCanvas.getContext('2d');
        const targetCtx = targetCanvas.getContext('2d');

        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const data = imageData.data;
        const newImageData = targetCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
        const newData = newImageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let gray = toGrayscale(data[i], data[i + 1], data[i + 2]);
            let aoValue = 255 - gray; // Base AO value (inverted grayscale)
            
            // Apply contrast: (value - 128) * contrast + 128, then clamp
            aoValue = (aoValue - 128) * contrast + 128;
            aoValue = Math.max(0, Math.min(255, aoValue));

            newData[i] = aoValue;
            newData[i + 1] = aoValue;
            newData[i + 2] = aoValue;
            newData[i + 3] = 255;
        }
        targetCtx.putImageData(newImageData, 0, 0);
    }

    /**
     * Generates a simulated Metallic Map with sharpness control.
     * Uses a simple threshold on the grayscale values to create a black and white mask.
     * @param {HTMLCanvasElement} sourceCanvas - The canvas containing the original texture.
     * @param {HTMLCanvasElement} targetCanvas - The canvas to draw the metallic map on.
     * @param {number} sharpness - Controls the threshold/contrast of metallic areas (0.0 to 1.0).
     * @param {boolean} invert - Whether to invert the final black/white map.
     */
    function generateMetallicMap(sourceCanvas, targetCanvas, sharpness, invert) {
        if (!sourceCanvas || !targetCanvas || !targetCanvas.getContext('2d') || !sharedImage) {
            clearCanvas(targetCanvas.getContext('2d'));
            return;
        }
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;

        const sourceCtx = sourceCanvas.getContext('2d');
        const targetCtx = targetCanvas.getContext('2d');

        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const data = imageData.data;
        const newImageData = targetCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
        const newData = newImageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let gray = toGrayscale(data[i], data[i + 1], data[i + 2]);
            
            // Simple thresholding based on sharpness
            // sharpness close to 0.0 makes more black (non-metallic), close to 1.0 makes more white (metallic)
            if (sharpness <= 0.5) { // More towards non-metallic
                gray = (gray > (255 * sharpness * 2)) ? 255 : 0;
            } else { // More towards metallic
                gray = (gray > (255 * sharpness)) ? 255 : 0;
            }
            
            // Invert the value if the checkbox is checked
            if (invert) {
                gray = 255 - gray;
            }

            newData[i] = gray;
            newData[i + 1] = gray;
            newData[i + 2] = gray;
            newData[i + 3] = 255;
        }
        targetCtx.putImageData(newImageData, 0, 0);
    }

    /**
     * Generates a simulated Displacement Map with detail control.
     * Uses the grayscale values of the original image to represent height data.
     * @param {HTMLCanvasElement} sourceCanvas - The canvas containing the original texture.
     * @param {HTMLCanvasElement} targetCanvas - The canvas to draw the displacement map on.
     * @param {number} detail - Multiplier for height variation (0.0 to 2.0).
     */
    function generateDisplacementMap(sourceCanvas, targetCanvas, detail) {
        if (!sourceCanvas || !targetCanvas || !targetCanvas.getContext('2d') || !sharedImage) {
            clearCanvas(targetCanvas.getContext('2d'));
            return;
        }
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;

        const sourceCtx = sourceCanvas.getContext('2d');
        const targetCtx = targetCanvas.getContext('2d');

        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        const data = imageData.data;
        const newImageData = targetCtx.createImageData(sourceCanvas.width, sourceCanvas.height);
        const newData = newImageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let gray = toGrayscale(data[i], data[i + 1], data[i + 2]);
            
            // Apply detail: (value - 128) * detail + 128, then clamp
            // This increases contrast around mid-gray, enhancing perceived detail
            gray = (gray - 128) * detail + 128;
            gray = Math.max(0, Math.min(255, gray));

            newData[i] = gray;
            newData[i + 1] = gray;
            newData[i + 2] = gray;
            newData[i + 3] = 255;
        }
        targetCtx.putImageData(newImageData, 0, 0);
    }

    /**
     * Dispatches to the correct seamless function based on the user's selection.
     */
    function makeSourceTextureSeamless() {
        if (!sharedImage) {
            showMessageBox('Please upload an image first.', 'error');
            return;
        }

        const method = seamlessMethodSelect.value;

        if (method === 'mirror') {
            makeSeamlessMirror();
        } else if (method === 'blend') {
            const radius = parseInt(seamlessRadiusSlider.value);
            const intensity = parseInt(seamlessIntensitySlider.value);
            makeSeamlessBlend(radius, intensity);
        }
    }

    /**
     * Makes the source texture seamless using an edge-blending (cross-fade) technique.
     * @param {number} radius The width of the blend area in pixels.
     * @param {number} intensity The strength of the effect (0-100). 0 is disabled.
     */
    function makeSeamlessBlend(radius, intensity) {
        if (intensity === 0) {
            // Restore the original image if the effect is disabled
            const destCtx = fullResOriginalCanvas.getContext('2d');
            destCtx.drawImage(pristineSourceCanvas, 0, 0);
            generateMaps();
            showMessageBox('Seamless blend disabled. Original texture restored.', 'info');
            return;
        }

        const sourceCanvas = pristineSourceCanvas;
        const destCanvas = fullResOriginalCanvas;
        const destCtx = destCanvas.getContext('2d');
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;

        destCanvas.width = width;
        destCanvas.height = height;
        destCtx.drawImage(sourceCanvas, 0, 0);

        // --- Horizontal Blend ---
        const leftStrip = destCtx.getImageData(0, 0, radius, height);
        const rightStrip = destCtx.getImageData(width - radius, 0, radius, height);
        const leftData = leftStrip.data;
        const rightData = rightStrip.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < radius; x++) {
                const alpha = x / (radius - 1.0);
                const i = (y * radius + x) * 4;
                for (let c = 0; c < 3; c++) { // RGB
                    const l = leftData[i + c];
                    const r = rightData[i + c];
                    leftData[i + c] = l * (1 - alpha) + r * alpha;
                    rightData[i + c] = r * (1 - alpha) + l * alpha;
                }
            }
        }
        destCtx.putImageData(leftStrip, 0, 0);
        destCtx.putImageData(rightStrip, width - radius, 0);

        // --- Vertical Blend ---
        const topStrip = destCtx.getImageData(0, 0, width, radius);
        const bottomStrip = destCtx.getImageData(0, height - radius, width, radius);
        const topData = topStrip.data;
        const bottomData = bottomStrip.data;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < radius; y++) {
                const alpha = y / (radius - 1.0);
                const i = (y * width + x) * 4;
                for (let c = 0; c < 3; c++) { // RGB
                    const t = topData[i + c];
                    const b = bottomData[i + c];
                    topData[i + c] = t * (1 - alpha) + b * alpha;
                    bottomData[i + c] = b * (1 - alpha) + t * alpha;
                }
            }
        }
        destCtx.putImageData(topStrip, 0, 0);
        destCtx.putImageData(bottomStrip, 0, height - radius);

        // --- Final Intensity Blend ---
        const intensityFactor = intensity / 100.0;
        const finalImageData = destCtx.getImageData(0, 0, width, height);
        const finalData = finalImageData.data;
        const pristineData = sourceCanvas.getContext('2d').getImageData(0, 0, width, height).data;
        for (let i = 0; i < finalData.length; i++) {
            finalData[i] = pristineData[i] * (1 - intensityFactor) + finalData[i] * intensityFactor;
        }
        destCtx.putImageData(finalImageData, 0, 0);

        generateMaps();
        showMessageBox('Texture made seamless using Blend method. All maps have been regenerated.', 'success');
    }

    /**
     * Makes the source texture seamless using a 9-slice mirroring technique (the original method).
     * This is a robust method for creating tileable textures by mirroring the
     * original image into a 3x3 grid and then extracting the center tile.
     */
    function makeSeamlessMirror() {
        // The source is the PRISTINE, unmodified canvas
        const sourceCanvas = pristineSourceCanvas;
        // The destination is the WORKING canvas that all other tools use
        const destCanvas = fullResOriginalCanvas;
        const destCtx = destCanvas.getContext('2d');
        const width = sourceCanvas.width;
        const height = sourceCanvas.height;

        // Ensure destination canvas has the same size
        destCanvas.width = width;
        destCanvas.height = height;

        // Create a temporary canvas 3x the size to build the seamless texture
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width * 3;
        tempCanvas.height = height * 3;
        const tempCtx = tempCanvas.getContext('2d');

        // Draw the 9-slice grid of mirrored images from the PRISTINE source
        // Center
        tempCtx.drawImage(sourceCanvas, width, height);
        // Top
        tempCtx.save(); tempCtx.scale(1, -1); tempCtx.drawImage(sourceCanvas, width, -height); tempCtx.restore();
        // Bottom
        tempCtx.save(); tempCtx.scale(1, -1); tempCtx.drawImage(sourceCanvas, width, -(height * 3)); tempCtx.restore();
        // Left
        tempCtx.save(); tempCtx.scale(-1, 1); tempCtx.drawImage(sourceCanvas, -width, height); tempCtx.restore();
        // Right
        tempCtx.save(); tempCtx.scale(-1, 1); tempCtx.drawImage(sourceCanvas, -(width * 3), height); tempCtx.restore();
        // Top-Left
        tempCtx.save(); tempCtx.scale(-1, -1); tempCtx.drawImage(sourceCanvas, -width, -height); tempCtx.restore();
        // Top-Right
        tempCtx.save(); tempCtx.scale(-1, -1); tempCtx.drawImage(sourceCanvas, -(width * 3), -height); tempCtx.restore();
        // Bottom-Left
        tempCtx.save(); tempCtx.scale(-1, -1); tempCtx.drawImage(sourceCanvas, -width, -(height * 3)); tempCtx.restore();
        // Bottom-Right
        tempCtx.save(); tempCtx.scale(-1, -1); tempCtx.drawImage(sourceCanvas, -(width * 3), -(height * 3)); tempCtx.restore();

        // Now, copy the central part of the large canvas back to the WORKING canvas
        destCtx.clearRect(0, 0, width, height);
        destCtx.drawImage(tempCanvas, width, height, width, height, 0, 0, width, height);

        // The source canvas is now seamless. Regenerate everything.
        generateMaps();

        showMessageBox('Texture made seamless using Mirror method. All maps have been regenerated.', 'success');
    }


    /**
     * Exports all selected maps as a single ZIP file at the chosen resolution.
     * Uses the JSZip library to create the archive in the browser.
     */
    async function exportAllMaps() {
        if (!sharedImage) {
            showMessageBox('Please upload an image first to generate maps for export.', 'error');
            return;
        }

        let exportSize;
        const originalWidth = sharedImage.width;
        const originalHeight = sharedImage.height;

        if (exportResolutionSelect.value === 'original') {
            exportSize = originalWidth; // Use original width for non-square exports
        } else {
            exportSize = parseInt(exportResolutionSelect.value);
        }
        
        const baseFileName = sharedFileName.split('.').slice(0, -1).join('.') || 'exported_texture';

        // CRITICAL FIX: Use the full-resolution canvases for export, not the small UI previews.
        const mapsToExport = [];
        // Correctly reference the checkboxes using their 'Dropdown' suffix IDs
        if (exportOriginalTextureDropdownCheckbox.checked) mapsToExport.push({ canvas: fullResOriginalCanvas, name: 'original' });
        if (exportNormalMapDropdownCheckbox.checked) mapsToExport.push({ canvas: fullResNormalCanvas, name: 'normal' });
        if (exportRoughnessMapDropdownCheckbox.checked) mapsToExport.push({ canvas: fullResRoughnessCanvas, name: 'roughness' });
        if (exportAOMapDropdownCheckbox.checked) mapsToExport.push({ canvas: fullResAoCanvas, name: 'ao' });
        if (exportMetallicMapDropdownCheckbox.checked) mapsToExport.push({ canvas: fullResMetallicCanvas, name: 'metallic' });
        if (exportDisplacementMapDropdownCheckbox.checked) mapsToExport.push({ canvas: fullResDisplacementCanvas, name: 'displacement' });

        if (mapsToExport.length === 0) {
            showMessageBox('Please select at least one map to export.', 'info');
            return;
        }

        const zip = new JSZip();

        for (const mapInfo of mapsToExport) {
            const blob = await new Promise(resolve => {
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                // Handle non-square exports correctly when 'original' is selected
                tempCanvas.width = (exportResolutionSelect.value === 'original') ? originalWidth : exportSize;
                tempCanvas.height = (exportResolutionSelect.value === 'original') ? originalHeight : exportSize;
                tempCtx.drawImage(mapInfo.canvas, 0, 0, tempCanvas.width, tempCanvas.height);
                tempCanvas.toBlob(resolve, 'image/png');
            });
            zip.file(`${baseFileName}_${mapInfo.name}.png`, blob);
        }

        zip.generateAsync({ type: "blob" }).then(function(content) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(content);
            a.download = `${baseFileName}_maps.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href); // Clean up the URL object
            showMessageBox(`${mapsToExport.length} map(s) exported as a ZIP file.`, 'success');
            exportOptionsDropdown.classList.add('hidden'); // Close dropdown after successful export
        }).catch(e => {
            console.error("Error generating zip file:", e);
            showMessageBox("Failed to generate ZIP file for export.", 'error');
        });
    }


    // --- Color Palette Extractor Specific Functions ---

    /**
     * Extracts dominant colors from the image on the colorExtractorCanvas.
     * Downsamples the image, quantizes colors to reduce the color space, and counts frequencies.
     * Uses a simple pixel sampling and frequency counting method.
     * @param {HTMLImageElement} imageToProcess - The image to extract colors from.
     */

        /* Extract Theme */
    function extractColorPalette(imageToProcess) {
        const paletteDiv = document.getElementById('extractedColorPalette');
        if (!imageToProcess) {
            // If no image, clear the palette and show a message.
            if (colorExtractorCtx) clearCanvas(colorExtractorCtx);
            if (paletteDiv) paletteDiv.innerHTML = '<p class="text-center w-full text-gray-500 text-sm">Upload an image to see its palette.</p>';
            return;
        }

        const numColors = parseInt(numColorsSlider.value);
        paletteDiv.innerHTML = ''; // Clear previous palette

        // Downsample image for faster processing if it's too large
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const sampleSize = 100; // Sample to 100x100 for color extraction speed
        tempCanvas.width = sampleSize;
        tempCanvas.height = sampleSize;
        tempCtx.drawImage(imageToProcess, 0, 0, sampleSize, sampleSize);

        const imageData = tempCtx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;
        const colorCounts = {};

        // Collect pixel data and count frequencies
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            // Simple quantization to reduce unique colors for counting
            const quantizeFactor = 16; // Adjust for more/less precision
            const qr = Math.floor(r / quantizeFactor) * quantizeFactor;
            const qg = Math.floor(g / quantizeFactor) * quantizeFactor;
            const qb = Math.floor(b / quantizeFactor) * quantizeFactor;
            const colorKey = `${qr},${qg},${qb}`;
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
        }

        // Sort colors by frequency
        const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

        // Take the top N colors
        const extractedColors = [];
        for (let i = 0; i < Math.min(numColors, sortedColors.length); i++) {
            const [rgbString] = sortedColors[i];
            const [r, g, b] = rgbString.split(',').map(Number);
            extractedColors.push({ r, g, b });
        }

        if (extractedColors.length === 0) {
            paletteDiv.innerHTML = '<p class="text-center w-full text-gray-500 text-sm">Could not extract colors. Try a different image.</p>';
            return;
        }

        extractedColors.forEach(color => {
            const swatch = document.createElement('div');
            const hex = rgbToHex(color.r, color.g, color.b);

            // Add flex properties to center content
            swatch.className = 'color-swatch flex items-center justify-center';
            swatch.style.backgroundColor = hex;
            swatch.title = `Click to copy ${hex}`;

            // Create a span for the text inside the swatch
            const hexText = document.createElement('span');
            hexText.textContent = hex;
            // Determine text color based on background brightness
            hexText.style.color = isColorLight(color.r, color.g, color.b) ? '#000000' : '#FFFFFF';
            hexText.style.fontFamily = 'monospace';
            hexText.style.fontSize = '0.75rem';
            hexText.style.pointerEvents = 'none'; // So it doesn't interfere with the click on the swatch

            swatch.appendChild(hexText);

            swatch.onclick = () => {
                navigator.clipboard.writeText(hex).then(() => {
                    // On success, show "Copied!" message
                    const originalText = hexText.textContent;
                    hexText.textContent = 'Copied!';
                    setTimeout(() => {
                        hexText.textContent = originalText;
                    }, 1500); // Revert after 1.5 seconds
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Use the existing message box for errors
                    showMessageBox(`Failed to copy ${hex}. Please copy manually.`, 'error');
                });
            };
            paletteDiv.appendChild(swatch);
        });
    }

    // --- Pixelate Mode Specific Functions ---
    /**
     * Applies a pixelation effect to the image in the Pixelate tab.
     * It achieves this by drawing the image to a very small temporary canvas,
     * and then drawing that small canvas back to the main canvas at a large size, with image smoothing disabled.
     */
    function applyPixelateEffect() {
        const imageToProcess = pixelateLocalImage || sharedImage; // Prioritize local, then shared
        if (!imageToProcess) {
            clearCanvas(pixelateCtx);
            return;
        }

        const pixelSize = parseInt(pixelSizeSlider.value);
        if (pixelSize < 1) { // Ensure pixel size is at least 1
            pixelSizeSlider.value = 1; // Clamp value
            pixelSizeValueSpan.textContent = "1px";
            return;
        }

        // Temporarily resize canvas to original image size for accurate pixelation
        const originalWidth = imageToProcess.width;
        const originalHeight = imageToProcess.height;
        
        pixelateCanvas.width = originalWidth;
        pixelateCanvas.height = originalHeight;
        pixelateCtx.imageSmoothingEnabled = false; // Disable smoothing for crisp pixels

        // Draw image scaled down
        const scaledWidth = originalWidth / pixelSize;
        const scaledHeight = originalHeight / pixelSize;

        // Create a temporary canvas for downscaling
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;

        tempCtx.drawImage(imageToProcess, 0, 0, scaledWidth, scaledHeight);

        // Draw the pixelated (downscaled and then upscaled) image back to the main pixelateCanvas
        pixelateCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, originalWidth, originalHeight);
    }


    /**
     * Applies a pixelation effect to the main PBR texture and regenerates all maps.
     * This is triggered by the "Styles" section in the PBR tab.
     * @param {number} pixelSize - The size of each "pixel" for the effect.
     */
    function applyPixelateStyle(pixelSize = 16) {
        if (!sharedImage || !pristineSourceCanvas.getContext('2d')) {
            showMessageBox('Please upload an image first to apply a style.', 'error');
            return;
        }

        const sourceCanvas = pristineSourceCanvas;
        const destCanvas = fullResOriginalCanvas;
        const destCtx = destCanvas.getContext('2d');

        const originalWidth = sourceCanvas.width;
        const originalHeight = sourceCanvas.height;

        destCanvas.width = originalWidth;
        destCanvas.height = originalHeight;
        destCtx.imageSmoothingEnabled = false; // Crucial for crisp pixels

        const scaledWidth = originalWidth / pixelSize;
        const scaledHeight = originalHeight / pixelSize;

        // Use a temporary canvas for downscaling
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;

        // Draw the pristine source image down to the small temp canvas
        tempCtx.drawImage(sourceCanvas, 0, 0, scaledWidth, scaledHeight);

        // Draw the small temp canvas back up to the full-res working canvas, creating the pixelated effect
        destCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, originalWidth, originalHeight);

        // The fullResOriginalCanvas is now pixelated. Regenerate all other maps from it.
        generateMaps();
    }

    /**
     * Reverts the main PBR texture to its original, pristine state and regenerates all maps.
     */
    function applyOriginalStyle() {
        if (!sharedImage || !pristineSourceCanvas.getContext('2d')) {
            showMessageBox('No original texture to restore.', 'error');
            return;
        }

        const destCtx = fullResOriginalCanvas.getContext('2d');
        destCtx.clearRect(0, 0, fullResOriginalCanvas.width, fullResOriginalCanvas.height);
        destCtx.drawImage(pristineSourceCanvas, 0, 0);

        // The fullResOriginalCanvas is now restored. Regenerate all other maps from it.
        generateMaps();
    }

    /**
     * Generates a pixelated preview of an image as a data URL.
     * It respects the source image's aspect ratio to prevent stretching.
     * @param {HTMLImageElement} sourceImage The image to pixelate.
     * @param {number} maxWidth The maximum width of the output preview.
     * @param {number} maxHeight The maximum height of the output preview.
     * @param {number} pixelSize The size of the virtual pixels.
     * @returns {string|null} A data URL of the pixelated image, or null.
     */
    function generatePixelatedPreview(sourceImage, maxWidth, maxHeight, pixelSize) {
        if (!sourceImage) return null;

        // Calculate dimensions that fit within maxWidth/maxHeight while preserving aspect ratio
        const sourceAspectRatio = sourceImage.width / sourceImage.height;
        let targetWidth = maxWidth;
        let targetHeight = targetWidth / sourceAspectRatio;

        if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            targetWidth = targetHeight * sourceAspectRatio;
        }

        const previewCanvas = document.createElement('canvas');
        const previewCtx = previewCanvas.getContext('2d');
        previewCanvas.width = targetWidth;
        previewCanvas.height = targetHeight;

        // The pixelation effect is achieved by disabling smoothing and drawing down then up
        previewCtx.imageSmoothingEnabled = false;

        const scaledWidth = targetWidth / pixelSize;
        const scaledHeight = targetHeight / pixelSize;

        // Draw the source image down to a tiny size on the preview canvas itself
        // This draw respects the aspect ratio because the canvas itself has the correct ratio.
        previewCtx.drawImage(sourceImage, 0, 0, scaledWidth, scaledHeight);

        // Draw that tiny image back up to the full preview canvas size
        previewCtx.drawImage(previewCanvas, 0, 0, scaledWidth, scaledHeight, 0, 0, targetWidth, targetHeight);

        return previewCanvas.toDataURL();
    }

    /**
     * Updates the preview images for the style buttons based on the current shared image.
     */
    function updateStylePreviews() {
        const pixelatePreviewImg = document.getElementById('stylePixelatePreviewImg');
        const originalPreviewImg = document.getElementById('styleOriginalPreviewImg');
        if (!pixelatePreviewImg || !originalPreviewImg) return;

        if (!sharedImage) {
            // Reset to the default placeholder if no image is loaded
            pixelatePreviewImg.src = 'https://placehold.co/100x60/60A5FA/E0F2FE?text=Pixelate';
            originalPreviewImg.src = 'https://placehold.co/100x60/9CA3AF/D1D5DB?text=Original';
            return;
        }

        // Generate a pixelated preview for the button's image
        // Using a smaller pixel size for the preview so it's recognizable
        const pixelatedDataUrl = generatePixelatedPreview(sharedImage, 100, 60, 8);
        if (pixelatedDataUrl) {
            pixelatePreviewImg.src = pixelatedDataUrl;
        }

        // The original preview is just the source image itself
        originalPreviewImg.src = sharedImage.src;
    }

    // --- Animation Combiner Specific Functions ---

    /**
     * Initializes the Three.js scene for the Animation Combiner tab.
     * This is called only once when the user first tries to load a model.
     */
    function initThreeJsAnimationCombiner() {
        if (isAnimSceneInitialized) return;

        const canvas = animationCombinerThreeJsCanvas;
        const wrapper = canvas.parentElement;

        animScene = new THREE.Scene();
        animScene.background = new THREE.Color(0x2a2a2a);

        animCamera = new THREE.PerspectiveCamera(45, wrapper.clientWidth / wrapper.clientHeight, 0.1, 1000);
        animCamera.position.set(200, 200, 400);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        hemiLight.position.set(0, 200, 0);
        animScene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 5.5);
        dirLight.position.set(0, 200, 100);
        dirLight.castShadow = true;
        animScene.add(dirLight);
        
        // Ground plane
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x555555, depthWrite: false }));
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        animScene.add(ground);

        const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        animScene.add(grid);

        animRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        animRenderer.setPixelRatio(window.devicePixelRatio);
        animRenderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
        animRenderer.shadowMap.enabled = true;

        animControls = new OrbitControls(animCamera, animRenderer.domElement);
        animControls.target.set(0, 100, 0);
        animControls.update();

        // Add a helper to visualize the root bone's position
        const helperGeometry = new THREE.SphereGeometry(5, 8, 8); // 5cm sphere
        const helperMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        rootBoneHelper = new THREE.Mesh(helperGeometry, helperMaterial);
        rootBoneHelper.visible = false; // Initially hidden
        animScene.add(rootBoneHelper);

        window.addEventListener('resize', () => {
            if (currentActiveTabId === 'animation-combiner-tab') {
                animCamera.aspect = wrapper.clientWidth / wrapper.clientHeight;
                animCamera.updateProjectionMatrix();
                animRenderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
            }
        });

        isAnimSceneInitialized = true;
        animateThreeJsAnimationCombiner();
    }

    /**
     * Smoothly transitions from the previous animation action to the new one.
     * @param {string} actionName The name of the animation to fade to.
     * @param {number} duration The duration of the fade in seconds.
     */
    function fadeToAction(actionName, duration) {
        isRootMotionFirstFrame = true; // Reset root motion state on any animation change.
        previousAction = activeAction;
        activeAction = animationActions.get(actionName);

        if (previousAction !== activeAction) {
            previousAction.fadeOut(duration);
        }

        activeAction
            .reset()
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();
    }
    /**
     * The animation loop for the Animation Combiner scene.
     */
    function animateThreeJsAnimationCombiner() {
        requestAnimationFrame(animateThreeJsAnimationCombiner);
        const delta = animClock.getDelta();

        if (animMixer) {
            const enableRootMotion = enableRootMotionCheckbox.checked;
            const rootBone = loadedCharacter ? loadedCharacter.getObjectByName('mixamorig:Hips') : null;

            if (enableRootMotion && rootBone) {
                // First, update the mixer. This applies the animation transform to the bone's local matrix.
                animMixer.update(delta);

                if (isRootMotionFirstFrame) {
                    // On the first frame, capture the bone's initial local transform. This is our "anchor" point.
                    initialRootBonePosition.copy(rootBone.position);
                    initialRootBoneQuaternion.copy(rootBone.quaternion);
                    isRootMotionFirstFrame = false;
                }

                // Get the "true" animated world position for the helper before we modify the bone
                const trueAnimatedWorldPos = new THREE.Vector3();
                rootBone.getWorldPosition(trueAnimatedWorldPos);

                // Calculate the difference between the current animated local transform and our initial anchor transform.
                // This difference is the motion from the animation clip, isolated from the character's world movement.
                const positionDelta = rootBone.position.clone().sub(initialRootBonePosition);
                const quaternionDelta = rootBone.quaternion.clone().multiply(initialRootBoneQuaternion.clone().invert());

                // --- Apply Position Change to the Character ---
                const motionDelta = positionDelta.clone();
                motionDelta.y = 0; // We only want ground-plane motion.
                // The motionDelta is in the character's local space. Rotate it to match the character's world orientation.
                motionDelta.applyQuaternion(loadedCharacter.quaternion);
                loadedCharacter.position.add(motionDelta);

                // --- Apply Rotation Change to the Character ---
                // We only want rotation around the Y (up) axis.
                const y_rotation = new THREE.Euler().setFromQuaternion(quaternionDelta, 'YXZ').y;
                const rotation_quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), y_rotation);
                loadedCharacter.quaternion.multiply(rotation_quat);

                // --- Reset the Bone ---
                // Now, we must counteract the motion by resetting the root bone back to its initial local transform.
                // This "pins" the skeleton back to the character's origin, preventing it from walking away.
                rootBone.position.copy(initialRootBonePosition);
                rootBone.quaternion.copy(initialRootBoneQuaternion);

                // Update the helper to show the "ghost" of where the animation is.
                if (rootBoneHelper) {
                    rootBoneHelper.visible = true;
                    rootBoneHelper.position.copy(trueAnimatedWorldPos);
                }
            } else {
                // If root motion is disabled, reset the state for the next time it's enabled.
                isRootMotionFirstFrame = true;
                if (rootBoneHelper) rootBoneHelper.visible = false;
                animMixer.update(delta);
            }
        }

        if (animRenderer) animRenderer.render(animScene, animCamera);
    }

    /**
     * Loads the character and animation FBX files and starts playback.
     */
    async function loadAndPlayAnimations() {
        if (characterFbxInput.files.length === 0 || animationFbxInput.files.length === 0) {
            showMessageBox('Please upload a character FBX and at least one animation FBX.', 'error');
            return;
        }

        initThreeJsAnimationCombiner(); // Ensure scene is ready
        animationPlaceholderText.textContent = 'Loading...';

        // Clear previous character and animations
        if (loadedCharacter) animScene.remove(loadedCharacter);
        animationActions.clear();
        animMixer = null;
        animationSelect.innerHTML = ''; // Clear the dropdown
        isRootMotionFirstFrame = true; // Reset root motion state

        const loader = new FBXLoader();

        try {
            // Load character
            const characterURL = URL.createObjectURL(characterFbxInput.files[0]);
            loadedCharacter = await loader.loadAsync(characterURL);
            loadedCharacter.traverse(child => { if (child.isMesh) child.castShadow = true; });
            animScene.add(loadedCharacter);

            // Create mixer
            animMixer = new THREE.AnimationMixer(loadedCharacter);

            // Load all animation files concurrently
            const animFiles = Array.from(animationFbxInput.files);
            const animPromises = animFiles.map(file => loader.loadAsync(URL.createObjectURL(file)));
            const loadedAnims = await Promise.all(animPromises);

            // Use the file name to create unique animation names
            loadedAnims.forEach((animFbx, fileIndex) => {
                const file = animFiles[fileIndex];
                const baseName = file.name.split('.').slice(0, -1).join('.') || file.name;

                animFbx.animations.forEach(clip => {
                    // Create a unique name to avoid conflicts if clips in different files have the same name (e.g., "mixamo.com")
                    const uniqueName = `${baseName} | ${clip.name}`;
                    clip.name = uniqueName; // Modify the clip's name directly for consistency

                    const action = animMixer.clipAction(clip);
                    action.setEffectiveTimeScale(parseFloat(animationSpeedSlider.value));
                    animationActions.set(uniqueName, action);
                    // Populate the dropdown
                    const option = document.createElement('option');
                    option.value = uniqueName;
                    option.textContent = uniqueName;
                    animationSelect.appendChild(option);
                });
            });

            if (animationActions.size > 0) {
                // Play the first animation found
                activeAction = animationActions.values().next().value; // Get the first action
                activeAction.play();
                animationPlaceholderText.textContent = `Playing: ${activeAction.getClip().name}`;
            } else {
                animationPlaceholderText.textContent = 'Character loaded, but no animations found in the provided files.';
            }

            // Show the canvas
            animationCombinerThreeJsCanvas.style.display = 'block';
            animationPlaceholderText.style.position = 'absolute';
            animationPlaceholderText.style.bottom = '10px';
            animationPlaceholderText.style.left = '10px';
            animationPlaceholderText.style.backgroundColor = 'rgba(0,0,0,0.5)';
            animationPlaceholderText.style.padding = '2px 5px';
            animationPlaceholderText.style.borderRadius = '3px';

        } catch (error) {
            console.error("Error loading FBX files:", error);
            showMessageBox(`Failed to load FBX files. Check console for details. Error: ${error.message}`, 'error');
            animationPlaceholderText.textContent = 'Error loading files. Please check console.';
        }
    }

    /**
     * Updates the speed of the currently playing animation.
     */
    function updateAnimationSpeed() {
        const speed = parseFloat(animationSpeedSlider.value);
        animationSpeedValueSpan.textContent = speed.toFixed(2);
        if (activeAction) {
            activeAction.setEffectiveTimeScale(speed);
        } else {
            // If no action is active yet, apply to all stored actions
            animationActions.forEach(action => action.setEffectiveTimeScale(speed));
        }
    }

    /**
     * Initializes the Three.js scene for the Image to Mesh tab.
     */
    function initThreeJsImageToMesh() {
        if (isMeshSceneInitialized) return;

        // --- Textured Scene Setup (Right Side) ---
        const texturedCanvas = imageToMeshThreeJsCanvas;
        const texturedWrapper = texturedCanvas.parentElement;
        meshScene = new THREE.Scene();
        meshScene.background = new THREE.Color(0x2a2a2a);
        meshCamera = new THREE.PerspectiveCamera(45, texturedWrapper.clientWidth / texturedWrapper.clientHeight, 0.1, 1000);
        meshCamera.position.set(0, 2, 3); // Adjusted for 2m object: (0, 100/50, 150/50)
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
        hemiLight.position.set(0, 200, 0);
        meshScene.add(hemiLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(50, 50, 50);
        meshScene.add(dirLight);
        meshRenderer = new THREE.WebGLRenderer({ canvas: texturedCanvas, antialias: true });
        meshRenderer.setPixelRatio(window.devicePixelRatio);
        meshRenderer.setSize(texturedWrapper.clientWidth, texturedWrapper.clientHeight);

        // --- Depth Scene Setup (Left Side) ---
        const depthCanvas = imageToMeshDepthCanvas;
        const depthWrapper = depthCanvas.parentElement;
        meshDepthScene = new THREE.Scene();
        meshDepthScene.background = new THREE.Color(0x1a1a1a); // Slightly different background for distinction
        // Use a tighter near/far range for the depth camera to maximize contrast.
        // The main camera needs a large range for zooming, but this one can be constrained to the object's typical distance.
        meshDepthCamera = new THREE.PerspectiveCamera(45, depthWrapper.clientWidth / depthWrapper.clientHeight, 1, 400);
        meshDepthCamera.position.copy(meshCamera.position); // Start at same position
        meshDepthCamera.aspect = depthWrapper.clientWidth / depthWrapper.clientHeight; // Set aspect ratio for depth camera
        meshDepthCamera.updateProjectionMatrix(); // Update projection matrix for depth camera
        meshDepthRenderer = new THREE.WebGLRenderer({ canvas: depthCanvas, antialias: true });
        meshDepthRenderer.setPixelRatio(window.devicePixelRatio);
        meshDepthRenderer.setSize(depthWrapper.clientWidth, depthWrapper.clientHeight);

        // --- Shared Controls ---
        // Controls are attached to the main (textured) renderer's DOM element
        meshControls = new OrbitControls(meshCamera, meshRenderer.domElement);
        meshControls.target.set(0, 0, 0);
        meshControls.update();
        meshControls.saveState(); // Save the initial state for resetting

        window.addEventListener('resize', () => {
            if (currentActiveTabId === 'image-to-mesh-tab') {
                // Resize textured view
                if (texturedWrapper.clientWidth > 0) {
                    meshCamera.aspect = texturedWrapper.clientWidth / texturedWrapper.clientHeight;
                    meshCamera.updateProjectionMatrix();
                    meshRenderer.setSize(texturedWrapper.clientWidth, texturedWrapper.clientHeight);
                }
                // Resize depth view
                if (depthWrapper.clientWidth > 0) {
                    meshDepthCamera.aspect = depthWrapper.clientWidth / depthWrapper.clientHeight;
                    meshDepthCamera.updateProjectionMatrix();
                    meshDepthRenderer.setSize(depthWrapper.clientWidth, depthWrapper.clientHeight);
                }
            }
        });

        isMeshSceneInitialized = true;
        animateThreeJsImageToMesh();
    }
    /**
     * The animation loop for the Image to Mesh scene.
     */
    function animateThreeJsImageToMesh() {
        if (!isMeshSceneInitialized) return;
        requestAnimationFrame(animateThreeJsImageToMesh);
        
        if (meshControls) meshControls.update();

        // Sync the depth camera to the main camera controlled by OrbitControls
        if (meshDepthCamera && meshControls) {
            meshDepthCamera.position.copy(meshCamera.position);
            meshDepthCamera.quaternion.copy(meshCamera.quaternion);
            meshDepthCamera.zoom = meshCamera.zoom;

            // --- DYNAMICALLY ADJUST NEAR/FAR for DEPTH CAMERA --- 
            // This is the key to getting good contrast with MeshDepthMaterial
            // as the user zooms in and out. The depth range is fitted to the object.
            const distance = meshCamera.position.distanceTo(meshControls.target);
            const objectBoundingSphereRadius = 150; // A rough estimate of the object's size/depth

            // Set near and far planes to tightly frame the object based on camera distance
            meshDepthCamera.near = Math.max(0.1, distance - objectBoundingSphereRadius);
            meshDepthCamera.far = distance + objectBoundingSphereRadius;

            meshDepthCamera.updateProjectionMatrix();
        }

        if (meshRenderer) meshRenderer.render(meshScene, meshCamera);
        if (meshDepthRenderer) meshDepthRenderer.render(meshDepthScene, meshDepthCamera);
    }

    /**
     * Generates a Normal Map directly from a displaced geometry's vertex normals.
     * This provides a much more accurate representation of the 3D surface for lighting.
     * @param {THREE.PlaneGeometry} geometry The displaced and smoothed geometry.
     * @param {HTMLCanvasElement} targetCanvas The canvas to draw the new normal map on. Its dimensions will be used for the output.
     * @param {boolean} invertY Whether to invert the Y (green) channel of the normal map.
     */
    function generateNormalMapFromGeometry(geometry, targetCanvas, invertY) {
        if (!geometry || !targetCanvas || !sharedImage) {
            clearCanvas(targetCanvas.getContext('2d'));
            return;
        }

        const geomWidth = geometry.parameters.widthSegments + 1;
        const geomHeight = geometry.parameters.heightSegments + 1;

        // Create a small, temporary canvas matching the geometry's resolution
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = geomWidth;
        tempCanvas.height = geomHeight;
        const tempCtx = tempCanvas.getContext('2d');
        const newImageData = tempCtx.createImageData(geomWidth, geomHeight);
        const newData = newImageData.data;

        const normals = geometry.attributes.normal;
        const normal = new THREE.Vector3();

        for (let j = 0; j < geomHeight; j++) {
            for (let i = 0; i < geomWidth; i++) {
                // We need to read vertices in the order they are stored in the buffer.
                // For a PlaneGeometry, this is row by row.
                const index = j * geomWidth + i;
                normal.fromBufferAttribute(normals, index);

                // Convert normal vector (-1 to 1) to RGB color (0 to 255)
                const r = (normal.x * 0.5 + 0.5) * 255;
                let g = (normal.y * 0.5 + 0.5) * 255;
                const b = (normal.z * 0.5 + 0.5) * 255;

                if (invertY) {
                    g = ((-normal.y * 0.5) + 0.5) * 255;
                }

                const pixelIndex = (j * geomWidth + i) * 4;
                newData[pixelIndex] = r;
                newData[pixelIndex + 1] = g;
                newData[pixelIndex + 2] = b;
                newData[pixelIndex + 3] = 255;
            }
        }
        tempCtx.putImageData(newImageData, 0, 0);

        // Now, draw the low-resolution temp canvas onto the high-resolution target canvas
        // with smoothing enabled to interpolate the normals.
        const targetCtx = targetCanvas.getContext('2d');
        targetCanvas.width = sharedImage.width; // Match original texture size
        targetCanvas.height = sharedImage.height;
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.imageSmoothingQuality = 'high';
        targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        targetCtx.drawImage(tempCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
    }

    /**
     * Applies Taubin smoothing to a plane geometry's vertices to reduce noise while preserving volume.
     * It alternates between a "shrink" step (positive lambda) and a "grow" step (negative mu).
     * @param {THREE.PlaneGeometry} geometry The geometry to smooth.
     * @param {number} iterations The number of smoothing passes.
     * @param {number} lambda The shrinking factor (e.g., 0.5).
     * @param {number} mu The growing factor (e.g., -0.53). A negative value slightly larger in magnitude than lambda.
     */
    function taubinSmoothMesh(geometry, iterations, lambda = 0.5, mu = -0.53) {
        const positions = geometry.attributes.position;
        const vertexCount = positions.count;
        const widthSegments = geometry.parameters.widthSegments;
        const heightSegments = geometry.parameters.heightSegments;
        const gridWidth = widthSegments + 1;

        // A temporary array to read from during each iteration, so we don't modify the array we're reading from.
        let tempZ = new Float32Array(vertexCount);

        for (let iter = 0; iter < iterations; iter++) {
            // --- Shrink Step (lambda) ---
            // Copy current Z positions for reading
            for (let i = 0; i < vertexCount; i++) { tempZ[i] = positions.getZ(i); }

            // Apply shrink to all interior vertices
            for (let j = 1; j < heightSegments; j++) {
                for (let i = 1; i < widthSegments; i++) {
                    const index = j * gridWidth + i;
                    const top = tempZ[index - gridWidth];
                    const bottom = tempZ[index + gridWidth];
                    const left = tempZ[index - 1];
                    const right = tempZ[index + 1];
                    const averageZ = (top + bottom + left + right) / 4.0;
                    const newZ = tempZ[index] + lambda * (averageZ - tempZ[index]);
                    positions.setZ(index, newZ);
                }
            }

            // --- Grow Step (mu) ---
            // Copy shrunk Z positions for reading
            for (let i = 0; i < vertexCount; i++) { tempZ[i] = positions.getZ(i); }

            // Apply grow to all interior vertices
            for (let j = 1; j < heightSegments; j++) {
                for (let i = 1; i < widthSegments; i++) {
                    const index = j * gridWidth + i;
                    const top = tempZ[index - gridWidth];
                    const bottom = tempZ[index + gridWidth];
                    const left = tempZ[index - 1];
                    const right = tempZ[index + 1];
                    const averageZ = (top + bottom + left + right) / 4.0;
                    const newZ = tempZ[index] + mu * (averageZ - tempZ[index]);
                    positions.setZ(index, newZ);
                }
            }
        }
    }

    /**
     * Generates a 3D displaced plane mesh from an image.
     */
    function generateMeshFromImage() {
        const imageToProcess = meshLocalImage || sharedImage;
        if (!imageToProcess) {
            // Hide canvases and show placeholders
            meshPlaceholderText.style.display = 'block';
            meshDepthPlaceholderText.style.display = 'block';
            imageToMeshThreeJsCanvas.style.display = 'none';
            imageToMeshDepthCanvas.style.display = 'none';

            // Clean up textured mesh
            if (generatedMesh) {
                meshScene.remove(generatedMesh);
                generatedMesh.geometry.dispose();
                generatedMesh.material.dispose();
                generatedMesh = null;
            }
            // Clean up depth mesh
            if (generatedDepthMesh) {
                meshDepthScene.remove(generatedDepthMesh);
                // Geometry is shared, so don't dispose it twice
                generatedDepthMesh.material.dispose();
                generatedDepthMesh = null;
            }
            return;
        }

        initThreeJsImageToMesh(); // Ensure scene is ready
        // Show canvases and hide placeholders
        meshPlaceholderText.style.display = 'none';
        meshDepthPlaceholderText.style.display = 'none';
        imageToMeshThreeJsCanvas.style.display = 'block';
        imageToMeshDepthCanvas.style.display = 'block';

        // Get parameters from sliders
        const detail = parseInt(meshDetailSlider.value);
        const heightScale = parseFloat(meshHeightSlider.value); // Value from 0 to 200
        const heightMultiplier = 0.01; // Scale factor to make 2 units = 2cm, 200 units = 2m

        // Create a temporary canvas for heightmap processing
        const heightmapCanvas = document.createElement('canvas');
        const heightmapCtx = heightmapCanvas.getContext('2d');
        heightmapCanvas.width = imageToProcess.width;
        heightmapCanvas.height = imageToProcess.height;

        heightmapCtx.drawImage(imageToProcess, 0, 0);
        const imageData = heightmapCtx.getImageData(0, 0, heightmapCanvas.width, heightmapCanvas.height);
        const heightmapData = imageData.data;

        // Remove old meshes if they exist
        if (generatedMesh) {
            meshScene.remove(generatedMesh);
            generatedMesh.geometry.dispose();
            generatedMesh.material.dispose();
        }
        if (generatedDepthMesh) {
            meshDepthScene.remove(generatedDepthMesh);
            // Geometry is shared, material is unique
            generatedDepthMesh.material.dispose();
        }

        const planeSize = 2; // A fixed size for the mesh in the 3D scene (2 meters)
        
        let planeWidth = planeSize;
        let planeHeight = planeSize;

        const imageAspectRatio = imageToProcess.width / imageToProcess.height;
        if (imageAspectRatio > 1) { // Image is wider than it is tall
            planeHeight = planeSize / imageAspectRatio;
        } else if (imageAspectRatio < 1) { // Image is taller than it is wide
            planeWidth = planeSize * imageAspectRatio;
        }
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, detail, detail);
        // Rotate geometry to be vertical like the main PBR plane
        geometry.rotateX(Math.PI / 2);

        const positions = geometry.attributes.position;

        const imgWidth = imageData.width;
        const imgHeight = imageData.height;

        for (let i = 0; i < positions.count; i++) {
            // Map vertex position (-planeSize/2 to +planeSize/2) to UV coordinates (0 to 1)
            // For a vertical plane, X and Y from geometry are still X and Y in local space.
            // U is based on X, V is based on Y.
            const u = (positions.getX(i) / planeWidth) + 0.5;
            const v = 1.0 - ((positions.getY(i) / planeHeight) + 0.5); // Flip V for image coords

            const tx = Math.floor(u * (imgWidth - 1));
            const ty = Math.floor(v * (imgHeight - 1));
            const pixelIndex = (ty * imgWidth + tx) * 4;

            // Get grayscale value (0-1) from the red channel of the heightmap
            const grayscale = toGrayscale(heightmapData[pixelIndex], heightmapData[pixelIndex + 1], heightmapData[pixelIndex + 2]) / 255.0;

            // Displace the vertex along the Z axis (local Z, which is depth from the viewer for a vertical plane)
            positions.setZ(i, grayscale * heightScale * heightMultiplier); // Apply the new multiplier
        }

        positions.needsUpdate = true;

        // --- NEW: Apply Smoothing ---
        if (smoothMeshCheckbox.checked) {
            const iterations = parseInt(meshSmoothingIterationsSlider.value);
            taubinSmoothMesh(geometry, iterations); // A lambda of 0.5 is a good starting point.
        }
        geometry.computeVertexNormals(); // Crucial for correct lighting after displacement and smoothing

        // --- NEW: Automatically update the PBR Normal Map based on this geometry ---
        if (sharedImage) { // Only if there's a base image to define resolution and be textured
            generateNormalMapFromGeometry(geometry, fullResNormalCanvas, invertNormalYCheckbox.checked);
            updatePreviewCanvases(); // Update the 2D preview in the PBR tab
            updateThreeJsTextures(); // Update the main PBR 3D viewer
        }

        const texturedMaterial = new THREE.MeshStandardMaterial({
            side: THREE.DoubleSide
        });

        generatedMesh = new THREE.Mesh(geometry, texturedMaterial);
        // No rotation needed here, as geometry is already rotated upright
        meshScene.add(generatedMesh);

        // Sync with the PBR material state.
        syncMeshMaterialFromPbr();

        // Fallback: If sync didn't apply a map (e.g., no PBR image loaded), use the base image.
        if (!texturedMaterial.map && imageToProcess) {
            const texture = new THREE.Texture(imageToProcess);
            texture.needsUpdate = true;
            texture.encoding = THREE.sRGBEncoding;
            texturedMaterial.map = texture;
            texturedMaterial.roughness = 0.8;
            texturedMaterial.metalness = 0.2;
        }
        texturedMaterial.needsUpdate = true;

        // --- Create Left Preview Mesh based on selected mode ---
        let leftPreviewMaterial;
        const previewMode = meshPreviewModeSelect.value;

        if (previewMode === 'depth') {
            leftPreviewMaterial = new THREE.MeshDepthMaterial({
                side: THREE.DoubleSide,
                depthPacking: THREE.RGBADepthPacking
            });
        } else if (previewMode === 'normal') {
            leftPreviewMaterial = new THREE.MeshNormalMaterial({
                side: THREE.DoubleSide
            });
        } else if (previewMode === 'wireframe') {
            leftPreviewMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00, // A clear green for wireframe
                wireframe: true,
                side: THREE.DoubleSide
            });
        }
        
        generatedDepthMesh = new THREE.Mesh(geometry, leftPreviewMaterial); // Use the SAME geometry
        // No rotation needed here
        meshDepthScene.add(generatedDepthMesh);
    }
    // --- Tab Switching Logic ---

    /**
     * Shows the selected tab and hides others.
     * Manages the 'active' class on content panes, and also shows/hides
     * the correct control panels in the left-hand sidebar.
     * @param {string} tabId - The ID of the tab content to show.
     */
    function showTab(tabId) {
        currentActiveTabId = tabId; // Update active tab ID

        // Deactivate all tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        // Hide all control groups that are direct children of the left panel
        document.querySelectorAll('.left-panel > .controls-group').forEach(controls => controls.style.display = 'none');
        // Hide the right-side controls container by default unless it's the texture weaver tab
        document.querySelector('.right-side-controls-container').style.display = 'none';

        // --- UI State Management for the selected tab ---
        // Update active state in the dropdown's tab buttons
        tabButtonsInDropdown.forEach(button => {
            if (button.dataset.tabId === tabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Show the corresponding tab content and controls
        document.getElementById(tabId).classList.add('active');
        
        // Manage cursor for threeJsCanvas based on tab. 
        if (tabId === 'texture-pbr-tab') { // PBR Tab
            threeJsCanvas.style.cursor = 'grab';
            document.getElementById('threeJsCanvas').style.display = 'block';
        } else {
            threeJsCanvas.style.cursor = 'default';
            document.getElementById('threeJsCanvas').style.display = 'none'; // Hide main 3D canvas temporarily
        }
        
        // Show specific controls/canvases based on tab.
        if (tabId === 'color-extractor-tab') { // Colors Tab
            colorExtractorControls.style.display = 'flex';
            colorExtractorCanvas.style.display = 'block';
        } else if (tabId === 'pixelate-tab') {
            pixelateControls.style.display = 'flex';
            pixelateCanvas.style.display = 'block';
        } else if (tabId === 'animation-combiner-tab') {
            animationCombinerControls.style.display = 'flex';
            // animationCombinerThreeJsCanvas.style.display = 'block'; // Keep conceptual for now
        } else if (tabId === 'image-to-mesh-tab') {
            imageToMeshControls.style.display = 'flex';
            if (isMeshSceneInitialized) {
                imageToMeshThreeJsCanvas.style.display = 'block';
                imageToMeshDepthCanvas.style.display = 'block';
                // Trigger a resize event to ensure canvases have correct dimensions
                window.dispatchEvent(new Event('resize'));
            }
        } else if (tabId === 'texture-pbr-tab') {
            textureWeaverControls.style.display = 'flex'; // Show left-panel controls
            // When switching back to PBR tab, resize its renderer
            if (renderer) {
                camera.aspect = threeJsCanvas.clientWidth / threeJsCanvas.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(threeJsCanvas.clientWidth, threeJsCanvas.clientHeight);
            }
            // Also show the newly moved controls on the right side
            document.querySelector('.right-side-controls-container').style.display = 'flex';
            // Ensure material adjustments are not highlighted if we just switched to PBR tab
            document.getElementById('materialAdjustmentsControlsGroup').classList.remove('highlighted-controls-group');
        }

        // Ensure descriptive text is visible for current tab
        document.querySelectorAll('.tab-content h1, .tab-content p').forEach(el => {
                if (el) el.style.display = 'block'; // Show all h1 and p in tab-content initially
        });

        applyEffectToCurrentTab(); // Trigger an update for the newly active tab
    }

    // --- Progress Bar Functionality ---
    /**
     * Updates the display of the monthly income progress bar.
     */
    function updateProgressBarDisplay() {
        incomeText.textContent = `$${currentMonthlyIncome} / $${desiredMonthlyIncome}`;
        let percentage = (currentMonthlyIncome / desiredMonthlyIncome) * 100;
        percentage = Math.min(100, Math.max(0, percentage)); // Clamp between 0 and 100
        incomeProgressBar.style.width = `${percentage}%`;
        percentageText.textContent = `${percentage.toFixed(0)}%`;
    }


    // Removed showLargeMapPreview and hideLargeMapPreview functions


    // --- Initial Setup (runs after DOM is parsed, due to type="module" placement) ---
    console.log("Initializing 3D Creative Toolbox...");
    clearAllCanvases(); // Clear 2D canvases initially and draw fallback text

    // Initialize Three.js after DOM elements are available
    initThreeJsTextureWeaver(threeJsCanvas, textureWeaverTab);
    updateThreeJsTextures(); // Initial texture update for weaver (with empty textures)
    updateSunPosition(); // Set initial sun position
    updateProgressBarDisplay(); // Set initial progress bar display
    
    // Attach Event Listeners for NEW Header Buttons to toggle dropdowns
    appLauncherBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing
        tabSelectionDropdown.classList.toggle('hidden');
        exportOptionsDropdown.classList.add('hidden'); // Close other dropdown if open
    });

    exportButtonHeader.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent document click from immediately closing
        exportOptionsDropdown.classList.toggle('hidden');
        tabSelectionDropdown.classList.add('hidden'); // Close other dropdown if open
    });

    // Attach Event Listener for Add Objects Dropdown
    if (meshObjectsBtn && meshObjectsDropdown) {
        meshObjectsBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            meshObjectsDropdown.classList.toggle('hidden');
            // Hide other dropdowns for a clean UI
            tabSelectionDropdown.classList.add('hidden');
            exportOptionsDropdown.classList.add('hidden');
        });
    }

    // Attach Event Listeners for Tab Buttons inside the dropdown
    tabButtonsInDropdown.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab-id');
            if (tabId) {
                showTab(tabId);
                tabSelectionDropdown.classList.add('hidden'); // Close the dropdown after selecting a tab
            }
        });
    });

    // Attach Event Listener for the Export button inside its dropdown
    exportButtonDropdown.addEventListener('click', exportAllMaps); // Now correctly referencing the button in the dropdown


    // Global click listener to close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        // Check if the click was outside the app launcher button and its dropdown
        if (!appLauncherBtn.contains(event.target) && !tabSelectionDropdown.contains(event.target)) {
            tabSelectionDropdown.classList.add('hidden');
        }
        // Check if the click was outside the export button and its dropdown
        if (!exportButtonHeader.contains(event.target) && !exportOptionsDropdown.contains(event.target)) {
            exportOptionsDropdown.classList.add('hidden');
        }
        // Check if the click was outside the add objects button and its dropdown
        if (meshObjectsBtn && meshObjectsDropdown && !meshObjectsBtn.contains(event.target) && !meshObjectsDropdown.contains(event.target)) {
            meshObjectsDropdown.classList.add('hidden');
        }
    });      
        
    // Attach Event Listeners - IMAGE UPLOADS
    textureInput.addEventListener('change', (e) => loadImageAndSetShared(e.target.files[0], loadingSpinner, textureInput));
    colorImageInput.addEventListener('change', (e) => loadImageAndSetShared(e.target.files[0], colorLoadingSpinner, colorImageInput));
    makeSeamlessButton.addEventListener('click', makeSourceTextureSeamless);
    pixelateImageInput.addEventListener('change', (e) => loadImageAndSetShared(e.target.files[0], pixelateLoadingSpinner, pixelateImageInput));
    meshImageInput.addEventListener('change', (e) => loadImageAndSetShared(e.target.files[0], meshLoadingSpinner, meshImageInput));


    // Attach Event Listeners - TEXTURE WEAVER CONTROLS (3D Material Properties)
    invertNormalYCheckbox.addEventListener('change', () => {
        if (sharedImage) {
            generateMaps(); // Regenerate all maps to reflect the change
        }
    });
    invertMetallicCheckbox.addEventListener('change', () => {
        if (sharedImage) {
            generateMaps(); // Regenerate all maps to reflect the change
        }
    });
    normalStrengthSlider.addEventListener('input', () => {
        normalStrengthValueSpan.textContent = parseFloat(normalStrengthSlider.value).toFixed(2);
        updateThreeJsTextures(); // Apply directly to 3D material
    });
    aoIntensitySlider.addEventListener('input', () => {
        aoIntensityValueSpan.textContent = parseFloat(aoIntensitySlider.value).toFixed(2);
        updateThreeJsTextures(); // Apply directly to 3D material
    });
    displacementScaleSlider.addEventListener('input', () => {
        displacementScaleValueSpan.textContent = parseFloat(displacementScaleSlider.value).toFixed(2);
        updateThreeJsTextures();
    });
    displacementBiasSlider.addEventListener('input', () => {
        displacementBiasValueSpan.textContent = parseFloat(displacementBiasSlider.value).toFixed(2);
        updateThreeJsTextures();
    });

    // Attach Event Listeners - 2D Map Generation Adjustments
    roughnessIntensitySlider.addEventListener('input', () => {
        roughnessIntensityValueSpan.textContent = parseFloat(roughnessIntensitySlider.value).toFixed(2);
        if (sharedImage) {
            generateMaps(); // Regenerate all maps to reflect the change
        }
    });
    aoContrastSlider.addEventListener('input', () => {
        aoContrastValueSpan.textContent = parseFloat(aoContrastSlider.value).toFixed(2);
        if (sharedImage) {
            generateMaps(); // Regenerate all maps to reflect the change
        }
    });
    metallicSharpnessSlider.addEventListener('input', () => {
        metallicSharpnessValueSpan.textContent = parseFloat(metallicSharpnessSlider.value).toFixed(2);
        if (sharedImage) {
            generateMaps(); // Regenerate all maps to reflect the change
        }
    });
    displacementDetailSlider.addEventListener('input', () => {
        displacementDetailValueSpan.textContent = parseFloat(displacementDetailSlider.value).toFixed(2);
        if (sharedImage) {
            generateMaps(); // Regenerate all maps to reflect the change
        }
    });

    // Attach Event Listeners - LIGHTING CONTROLS
    sunAzimuthSlider.addEventListener('input', updateSunPosition);
    sunElevationSlider.addEventListener('input', updateSunPosition);
    sunIntensitySlider.addEventListener('input', updateSunPosition);

    // Removed Event Listeners for 2D Map Hover Preview
    // document.querySelectorAll('.map-grid .canvas-container').forEach(container => {
    //     const mapType = container.getAttribute('data-map-type');
    //     const sourceCanvasId = container.getAttribute('data-source-canvas-id');
    //     const sourceCanvas = document.getElementById(sourceCanvasId);

    //     if (sourceCanvas) {
    //         container.addEventListener('mouseover', () => {
    //             if (sharedImage) { // Only show preview if an image is loaded
    //                 showLargeMapPreview(sourceCanvas, mapType);
    //             }
    //         });
    //         container.addEventListener('mouseout', hideLargeMapPreview);
    //     }
    // });

    console.log("Attaching event listeners...");

    // Attach Event Listeners - COLOR EXTRACTOR CONTROLS
    numColorsSlider.addEventListener('input', () => {
        numColorsValueSpan.textContent = numColorsSlider.value;
        // When the slider changes, re-run the palette extraction if an image is available.
        const imageToProcess = colorExtractorLocalImage || sharedImage;
        if (imageToProcess) {
            extractColorPalette(imageToProcess);
        }
    });

    // Attach Event Listeners - PIXELATE MODE CONTROLS
    pixelSizeSlider.addEventListener('input', () => {
        pixelSizeValueSpan.textContent = pixelSizeSlider.value + "px";
        applyPixelateEffect(); // Call effect on slider change
    });

    // --- PBR STYLES Event Listeners ---
    // Toggles the pixelate settings panel
    stylePixelateBtn.addEventListener('click', () => {
        // On first click (when settings are hidden), apply the effect immediately.
        if (pixelateStyleSettings.classList.contains('hidden')) {
            applyPixelateStyle(parseInt(stylePixelSizeSlider.value));
        }

        // Then, toggle the visibility of the settings panel for further adjustments.
        pixelateStyleSettings.classList.toggle('hidden');
        // Add a visual indicator to the button when settings are open
        stylePixelateBtn.classList.toggle('border-blue-500');
        stylePixelateBtn.classList.toggle('border-2');
    });

    // Updates the pixel size value display in the settings panel on input
    stylePixelSizeSlider.addEventListener('input', () => {
        stylePixelSizeValue.textContent = `${stylePixelSizeSlider.value}px`;
    });

    // Applies the pixelate style when the user releases the slider
    stylePixelSizeSlider.addEventListener('change', () => {
        applyPixelateStyle(parseInt(stylePixelSizeSlider.value));
    });

    // Reverts the texture to original
    styleOriginalBtn.addEventListener('click', applyOriginalStyle);


    // Attach Event Listeners - ANIMATION COMBINER CONTROLS
    characterFbxInput.addEventListener('change', updateAllFileDisplays);
    animationFbxInput.addEventListener('change', updateAllFileDisplays);
    animationSelect.addEventListener('change', (e) => {
        if (activeAction && animationActions.has(e.target.value)) {
            fadeToAction(e.target.value, 0.3);
            animationPlaceholderText.textContent = `Playing: ${e.target.value}`;
        }
    });
    animationSpeedSlider.addEventListener('input', updateAnimationSpeed);
    loadAndPlayAnimationsButton.addEventListener('click', loadAndPlayAnimations);

    // Attach Event Listeners - IMAGE TO MESH CONTROLS
    meshDetailSlider.addEventListener('input', () => {
        meshDetailValue.textContent = meshDetailSlider.value;
        generateMeshFromImage();
    });
    meshHeightSlider.addEventListener('input', () => {
        meshHeightValue.textContent = meshHeightSlider.value;
        generateMeshFromImage();
    });
    smoothMeshCheckbox.addEventListener('change', () => {
        meshSmoothingControls.style.display = smoothMeshCheckbox.checked ? 'flex' : 'none';
        generateMeshFromImage();
    });
    meshSmoothingIterationsSlider.addEventListener('input', () => {
        meshSmoothingIterationsValue.textContent = meshSmoothingIterationsSlider.value;
        generateMeshFromImage();
    });
    meshPreviewModeSelect.addEventListener('change', generateMeshFromImage);

    exportGlbButton.addEventListener('click', () => exportMeshAsGlb(generatedMesh));

    // Attach Event Listeners - CAMERA RESET BUTTONS
    resetPbrCameraBtn.addEventListener('click', resetPbrCamera);
    resetMeshCameraBtn.addEventListener('click', resetImageToMeshCamera);

    /**
     * Exports the generated 3D mesh as a GLB file.
     * @param {THREE.Mesh} mesh - The mesh to export.
     */
    async function exportMeshAsGlb(mesh) {
        if (!mesh || !mesh.geometry || !mesh.material) {
            showMessageBox('No mesh has been generated to export.', 'error');
            return;
        }

        // Ensure GLTFExporter is loaded
        if (typeof THREE.GLTFExporter === 'undefined') {
            showMessageBox('GLTFExporter is not loaded. Please check script imports.', 'error');
            return;
        }

        const exporter = new THREE.GLTFExporter();
        const options = {
            binary: true, // Export as GLB
            embedImages: true, // Embed textures directly into the GLB
        };

        const onError = (error) => {
            console.error('An error happened during GLB export:', error);
            showMessageBox('Failed to export GLB file. Check console for details.', 'error');
        };

        const onCompleted = (result) => {
            if (!(result instanceof ArrayBuffer)) {
                onError('Exporter did not return a valid binary ArrayBuffer.');
                return;
            }
            const blob = new Blob([result], { type: 'application/octet-stream' });
            const baseFileName = (sharedFileName.split('.').slice(0, -1).join('.') || 'generated_mesh');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${baseFileName}.glb`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            showMessageBox('Mesh exported as .GLB file.', 'success');
        };

        // For three.js r128, the signature is parse(input, onCompleted, options).
        // The onError callback is part of the options object.
        exporter.parse(mesh, onCompleted, { ...options, onError });
    }

    // Attach Event Listener for all slider reset buttons
    document.querySelectorAll('.reset-slider-button').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent form submission if it's ever in a form
            const sliderId = button.dataset.sliderId;
            const slider = document.getElementById(sliderId);
            if (slider) {
                const defaultValue = slider.getAttribute('value');
                slider.value = defaultValue;
                // Dispatch the input event to trigger all associated updates
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });

    // Setup all drop zones
    console.log("Setting up drop zones...");
    setupDropZone(textureDropZone, textureInput);
    setupDropZone(colorDropZone, colorImageInput);
    setupDropZone(pixelateDropZone, pixelateImageInput);
    setupDropZone(meshDropZone, meshImageInput);
    // Show the default tab on initial load

    // Attach Event Listeners - SEAMLESS CONTROLS
    seamlessMethodSelect.addEventListener('change', () => {
        seamlessBlendControls.style.display = seamlessMethodSelect.value === 'blend' ? 'block' : 'none';
    });
    seamlessRadiusSlider.addEventListener('input', () => {
        seamlessRadiusValue.textContent = seamlessRadiusSlider.value;
    });
    seamlessIntensitySlider.addEventListener('input', () => {
        seamlessIntensityValue.textContent = seamlessIntensitySlider.value;
    });

    // Attach Event Listeners for Map Preview Clicks
    document.querySelectorAll('.map-grid .canvas-container').forEach(container => {
        // Listener for clicking to isolate the map in the 3D view
        container.addEventListener('click', () => {
            const mapType = container.dataset.mapType;
            set3DPreviewMode(mapType);
        });

        // Add hover listeners for explanations
        const explanation = container.dataset.explanation;
        if (explanation) {
            container.addEventListener('mouseover', () => {
                mapTooltip.textContent = explanation;
                mapTooltip.style.display = 'block';
            });
            container.addEventListener('mousemove', (event) => {
                // Position the tooltip near the cursor, with an offset
                // Add logic to prevent it from going off-screen
                const tooltipRect = mapTooltip.getBoundingClientRect();
                let x = event.clientX + 15;
                let y = event.clientY + 15;

                if (x + tooltipRect.width > window.innerWidth) {
                    x = event.clientX - tooltipRect.width - 15;
                }
                if (y + tooltipRect.height > window.innerHeight) {
                    y = event.clientY - tooltipRect.height - 15;
                }

                mapTooltip.style.left = `${x}px`;
                mapTooltip.style.top = `${y}px`;
            });
            container.addEventListener('mouseout', () => {
                mapTooltip.style.display = 'none';
            });
        }
    });


    // Show the default tab on initial load
    showTab('texture-pbr-tab');
    /* showTab('color-extractor-tab'); */
    updateAllFileDisplays(); // Initial update of file name displays
    console.log("Initialization complete.");