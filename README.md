# Ultimate 3D Artist Toolbox

## Project Description

The Ultimate 3D Artist Toolbox is a comprehensive web-based application designed to streamline various tasks in 2D and 3D art workflows. Built with modern web technologies, it offers a suite of tools for generating PBR textures, extracting color palettes, pixelating images, converting 2D images into 3D meshes, and a conceptual framework for combining 3D animations.

This tool aims to be an all-in-one companion for artists, game developers, and designers looking for quick and interactive ways to process and preview their assets directly in the browser.

## Features

### PBR Texture Weaver
*   **Image Upload**: Easily upload your base color (Albedo) image via drag-and-drop or file selection.
*   **Automatic Map Generation**: Generates essential PBR maps:
    *   **Normal Map**: Simulates surface detail and bumps.
    *   **Roughness Map**: Controls how rough or smooth a surface is.
    *   **Ambient Occlusion (AO) Map**: Adds depth by simulating contact shadows.
    *   **Metallic Map**: Defines metallic properties of the surface.
    *   **Displacement Map**: Creates real height and depth by displacing geometry.
*   **Seamless Texture Generation**:
    *   **Mirror (9-Slice)**: A robust method for creating tileable textures.
    *   **Blend (Scattered Edges)**: Smoothly blends edges to remove seams with adjustable radius and intensity.
*   **Interactive 3D Preview**: Visualize your PBR material on a 3D cube and ground plane in real-time using Three.js.
*   **Material Adjustments**: Fine-tune generated maps with sliders for:
    *   Normal Strength
    *   Roughness Intensity
    *   AO Contrast & Intensity
    *   Metallic Sharpness
    *   Displacement Detail, Scale, and Bias
*   **Lighting Controls**: Adjust sun azimuth, elevation, and intensity for dynamic lighting previews.
*   **Map Isolation**: Click on any 2D map preview to isolate it on the 3D model for detailed inspection.
*   **Export Options**: Export selected PBR maps as individual PNGs or a single ZIP archive at various resolutions.

### Extract Theme (Color Palette Extractor)
*   Upload an image or use the main PBR image.
*   Extracts dominant colors from the image.
*   Adjust the number of colors to extract.
*   Click on extracted color swatches to copy their HEX code to the clipboard.

### Pixelate
*   Upload an image or use the main PBR image.
*   Transform your image into pixel art with adjustable pixel size.

### Image to 3D Mesh Converter
*   Upload a 2D image (e.g., a heightmap or a regular image).
*   Converts image brightness values into 3D height data, generating a mesh.
*   Adjust mesh detail (subdivisions) and height scale.
*   Apply Taubin smoothing to reduce noise and create a cleaner mesh.
*   Automatically generates a PBR Normal Map from the displaced geometry for accurate lighting.
*   Interactive 3D preview of the textured mesh.
*   Left preview panel to visualize Depth Map, Normal Map, or Wireframe of the generated mesh.
*   Export the 3D mesh as a GLB file.

### Animate (Animation Combiner - Conceptual)
*   A conceptual feature designed to allow uploading character FBX models and combining multiple FBX animations.
*   Includes controls for animation selection, speed, and root motion.

## Technologies Used

*   **HTML5**: Structure of the web application.
*   **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
*   **JavaScript (ES Modules)**: Core logic and interactivity.
*   **Three.js**: Powerful 3D library for rendering interactive 3D graphics.
    *   `OrbitControls`: For camera manipulation in 3D scenes.
    *   `RGBELoader`: For loading HDR environment maps.
    *   `GLTFExporter`: For exporting 3D models to GLB format.
    *   `FBXLoader`: For loading FBX 3D models and animations.
*   **JSZip**: For creating and downloading ZIP archives of exported maps.
*   **FFlate**: (Included via CDN) A fast, modern zlib/gzip/deflate encoder/decoder, likely used internally by other libraries or for future compression needs.

## How to Use

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/GeovaneJefferson/artisttoolbox.git
    cd artisttoolbox
    ```
2.  **Open in Browser**: Simply open the `main.html` file in your preferred web browser.
    ```bash
    # On Linux/macOS
    open main.html
    # On Windows
    start main.html
    ```
3.  **Explore the Tabs**: Navigate through the different tabs (PBR, Extract Theme, Pixelate, Image to Mesh, Animate) to access various tools.
4.  **Upload Images**: Use the provided upload buttons or drag-and-drop functionality to load your images.
5.  **Adjust Controls**: Experiment with the sliders and checkboxes to see real-time changes in the 2D previews and 3D models.
6.  **Export**: Use the export buttons to save your generated maps or 3D models.

## Future Enhancements

*   Full implementation and expansion of the "Animate" tab for advanced animation blending and character rigging.
*   More advanced image processing algorithms for map generation (e.g., AI-powered normal map generation).
*   Support for additional 3D model formats for import/export.
*   Integration with cloud services for asset management.
*   User interface themes and customization options.

## License

This project is open-source and available under the MIT License.

---

**Note**: This project is under active development. Features marked as "conceptual" are planned for future releases.

Feel free to contribute, report issues, or suggest new features!

```