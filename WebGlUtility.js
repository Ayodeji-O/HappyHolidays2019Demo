// WebGlUtility.js - General utility routines that facilitate the
//                   use of WebGL.
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  Utility.js
//  RgbColor.js
//  Primitives.js
//  MathExtMatrix.js

/**
 *  Class that serves as a container for data that is to be
 *   directly converted into buffers purposed for WebGL
 *   rendering
 */
function AggregateWebGlVertexData() {
	this.vertices = new Float32Array();
	this.vertexColors = new Float32Array();
	this.vertexTextureCoords = new Float32Array();
	this.vertexNormals = new Float32Array();
}

/**
 *  Class that is used to encapsulate data to be rendered using
 *   WebGL
 *  
 *  @param shaderProgram {WebGLProgram} Shader program to be used during rendering
 *  @param vertexBuffer {WebGLBuffer} Vertex buffer that describes the object geometry
 *  @param colorBuffer {WebGLBuffer} Color buffer which indicates the color of each vertex
 *  @param texCoordBuffer {WebGLBuffer} Buffer which indicates the texture coordinates for
 *                                      each vertex
 *  @param normalBuffer {WebGLBuffer} Buffer that contains the normals for each vertex
 *  @param vertexCount {Number} Number of vertices to be rendered
 */
function ObjectRenderWebGlData(shaderProgram, vertexBuffer, colorBuffer, texCoordBuffer, normalBuffer, vertexCount) {
	this.webGlShaderProgram = shaderProgram
	this.webGlVertexBuffer = vertexBuffer;
	this.webGlVertexColorBuffer = colorBuffer;
	this.webGlTexCoordBuffer = texCoordBuffer,
	this.webGlVertexNormalBuffer = normalBuffer;
	this.vertexCount = vertexCount;
}

/**
 * Retrieves a WebGL context from a canvas object, if
 *  a context has not already been associated with
 *  the canvas
 * @param sourceCanvas {HTMLCanvasElement} The canvas element for which a
 *                                         WebGL context should be retrieved
 * @return {WebGLRenderingContext2D} A WebGL context upon success, null otherwise
 */
function getWebGlContextFromCanvas(sourceCanvas) {
	
	var webGlContext = null;
	if (validateVar(sourceCanvas) && (sourceCanvas instanceof HTMLCanvasElement)) {
		
		// WebGL rendering contexts are identified using various identifiers,
		// depending upon the specific host browser type/version.
		var constWebGlContextIdentifiers = ["webgl", "experimental-webgl"];
		
		var currentWebGlIdIndex = 0;
		while ((webGlContext == null) && (currentWebGlIdIndex < constWebGlContextIdentifiers.length)) {
			webGlContext = sourceCanvas.getContext(constWebGlContextIdentifiers[currentWebGlIdIndex]);
			currentWebGlIdIndex++;
		}
	}
	
	return webGlContext;
}

/**
 * Prepares a WebGL context for initial use
 * @param webGlCanvasContext {WebGLRenderingContext2D} The WebGL context object that
 *                                                     is to be prepared
 */
function initializeWebGl(webGlCanvasContext) {
	if (validateVar(webGlCanvasContext)) {

		webGlCanvasContext.viewport(0, 0, webGlCanvasContext.canvas.width, webGlCanvasContext.canvas.height)
		
		webGlCanvasContext.clearColor(0.0, 0.0, 0.0, 1.0);
		webGlCanvasContext.enable(webGlCanvasContext.DEPTH_TEST);
		webGlCanvasContext.depthFunc(webGlCanvasContext.LEQUAL);
		webGlCanvasContext.clear(webGlCanvasContext.COLOR_BUFFER_BIT | webGlCanvasContext.DEPTH_BUFFER_BIT);
	}
}

/**
 * Creates a WebGL shader program, using a vertex shader
 *  and a fragment shader source program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *													   that will be used to facilitate
 *                           						   shader program compilation
 * @param vertexShaderSource {DOMString} Source code employed to implement the vertex
 *                                       shader
 * @param fragmentShaderSource {DOMString} Source code employed to implement the fragment
 *                                         shader
 * @return {WebGLProgram} A WebGL shader program upon success, null otherwise (diagnostic
 *                        data from compilation will be logged to the console upon failure)
 */
function createShaderProgram(webGlCanvasContext, vertexShaderSource, fragmentShaderSource) {
	var shaderProgram = null;
	
	if (validateVar(webGlCanvasContext) && (webGlCanvasContext instanceof WebGLRenderingContext) &&
		validateVar(vertexShaderSource) && validateVar(fragmentShaderSource)) {
		
		// Compile the vertex shader and fragment shader. Then, create a shader program
		// using the compiled vertex shader and fragment shader.
		shaderProgram = webGlCanvasContext.createProgram();
		webGlCanvasContext.attachShader(shaderProgram, compileVertexShaderFromSource(webGlCanvasContext, vertexShaderSource));
		webGlCanvasContext.attachShader(shaderProgram, compileFragmentShaderFromSource(webGlCanvasContext, fragmentShaderSource));
		webGlCanvasContext.linkProgram(shaderProgram);
		if (!webGlCanvasContext.getProgramParameter(shaderProgram, webGlCanvasContext.LINK_STATUS)) {
			// Program creation failed - log a detailed error message.
			console.log(webGlCanvasContext.getProgramInfoLog(shaderProgram));
			webGlCanvasContext.deleteProgram(shaderProgram);
			shaderProgram = null;
		}
	}
	
	return shaderProgram;
}

/**
 * Compiles a vertex shader, using a vertex shader source
 *  program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader program compilation
 * @param vertexShaderSource {DOMString} Source code employed to implement the vertex
 *                                       shader
 * @return {WebGLShader} A WebGL shader object representing the vertex shader upon
 *                       success, null otherwise
 */
function compileVertexShaderFromSource(webGlCanvasContext, vertexShaderSource) {
	var vertexShader = null;
	
	if (validateVar(webGlCanvasContext) && validateVar(vertexShaderSource)) {
		vertexShader = compileShaderFromSource(webGlCanvasContext, vertexShaderSource,
			webGlCanvasContext.VERTEX_SHADER);
	}
	
	return vertexShader;
}

/**
 * Compiles a fragment shader, using a fragment shader source
 *  program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader program compilation
 * @param fragmentShaderSource {DOMString} Source code employed to implement the fragment
 *                                         shader
 * @return {WebGLShader} A WebGL shader object representing the fragment shader upon
 *                       success, null otherwise
 */
function compileFragmentShaderFromSource(webGlCanvasContext, fragmentShaderSource) {
	var fragmentShader = null;
	
	if (validateVar(webGlCanvasContext) && validateVar(fragmentShaderSource)) {
		fragmentShader = compileShaderFromSource(webGlCanvasContext, fragmentShaderSource,
			webGlCanvasContext.FRAGMENT_SHADER);
	}
	
	return fragmentShader;
}

/**
 * Compiles a vertex or fragment shader, using a shader source
 *  program
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader source compilation
 * @param fragmentShaderSource {DOMString} Source code employed to implement the
 *                                         shader
 * @param shaderType {number} Indicates the type of shader to be compiled - 
 *                            can be either WebGLRenderingContext2D.VERTEX_SHADER or
 *							  WebGLRenderingContext2D.FRAGMENT_SHADER
 * @return {WebGLShader} A WebGL shader object representing the compiled shader upon
 *                       success, null otherwise
 */
function compileShaderFromSource(webGlCanvasContext, shaderSource, shaderType) {
	var webGlShader = null;
	
	if (validateVar(webGlCanvasContext) && validateVar(shaderSource) &&
		validateVar(shaderType)) {
			
		webGlShader = webGlCanvasContext.createShader(shaderType);
		webGlCanvasContext.shaderSource(webGlShader, shaderSource);
		if (!compileShaderObject(webGlCanvasContext, webGlShader)) {
			webGlCanvasContext.deleteShader(webGlShader);
			webGlShader = null;
		}
	}
	
	return webGlShader;	
}

/**
 * Compiles a WebGL shader object that is associated with a single
 *  vertex or fragment shader
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context
 *   												   that will be used to facilitate
 *                           						   shader object compilation
 * @param WebGlShader {WebGLShader} A WebGL shader object associated with vertex or
 *                                  fragment shader source code
 * @return {boolean} True upon successful compilation of the shader (diagnostic
 *                   data from compilation will be logged to the console upon failure)
 */
function compileShaderObject(webGlCanvasContext, webGlShader) {
	var compiledSuccessfully = false;
	
	if (validateVar(webGlCanvasContext) && validateVar(webGlShader)) {
		// Attempt to compile the shader...
		webGlCanvasContext.compileShader(webGlShader);
		
		if (webGlCanvasContext.getShaderParameter(webGlShader, webGlCanvasContext.COMPILE_STATUS)) {
			compiledSuccessfully = true;
		}
		else {
			// Shader creation failed - log a detailed error message.
			console.log(webGlCanvasContext.getShaderInfoLog(webGlShader));
		}
			
	}
	
	return compiledSuccessfully;
}

/**
 * Creates a WebGL texture from raw image data
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that
 *                                                     will facilitate the
 *                                                     creation of the texture
 * @param imageData {ImageData} An object containing bitmap image data that
 *                              will be used to generate a texture
 * @return {WebGLTexture} A WebGL texture object upon success, null otherwise
 */
function createTextureFromImageData(webGlCanvasContext, imageData) {
	var webGlTexture = null;
	
	if (validateVar(webGlCanvasContext) && validateVar(imageData)) {
		// Create the texture, and define the texture format (since ImageData
		// objects are RGBA formatted, the texture must be an RGBA texture).
		webGlTexture = webGlCanvasContext.createTexture();
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, imageData);
			
		// The texture will be magnified using bilinear filtering...
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, null);
	}
	
	return webGlTexture;
}

/**
 * Creates a WebGL texture from an image object
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that
 *                                                     will facilitate the
 *                                                     creation of the texture
 * @param image {Image} An image object
 * @return {WebGLTexture} A WebGL texture object upon success, null otherwise
 */
function createTextureFromImage(webGlCanvasContext, image) {
	var webGlTexture = null;
	
	if (validateVar(webGlCanvasContext) && validateVar(image)) {
		// Create the texture, and define the texture format (since image
		// objects are RGBA formatted, the texture must be an RGBA texture).
		webGlTexture = webGlCanvasContext.createTexture();
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, image);
			
		// The texture will be magnified using bilinear filtering...
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.LINEAR);
			
		// The texture will not wrap.
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_S,
			webGlCanvasContext.CLAMP_TO_EDGE);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_T,
			webGlCanvasContext.CLAMP_TO_EDGE);		
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, null);
	}
	
	return webGlTexture;
}


/**
 * Creates a WebGL texture from a canvas object
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that will facilitate the
 *                                                     creation of the texture
 * @param sourceCanvas {HTMLCanvasElement} A canvas object containing
 *                                        bitmap image data that  will be
 *                                        used to generate a texture
 * @param wrapTexture {Boolean} If set to true, texture coordinates will repeat
 *                              (both the width and the height of the source
 *                              canvas must be powers of two)
 * @return {WebGLTexture} A WebGL texture object upon success, null otherwise
 */
function createTextureFromCanvas(webGlCanvasContext, sourceCanvas, wrapTexture) {
	var webGlTexture = null;
	
	if (validateVar(webGlCanvasContext) && validateVar(sourceCanvas)) {
		// Create the texture, and define the texture format.
		webGlTexture = webGlCanvasContext.createTexture();
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, sourceCanvas);
						
		var textureWrapMode = wrapTexture ? webGlCanvasContext.REPEAT :
			webGlCanvasContext.CLAMP_TO_EDGE;
			
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_S, textureWrapMode);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_WRAP_T, textureWrapMode);	

						
		// The texture will be magnified using bilinear filtering...
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MAG_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.texParameteri(webGlCanvasContext.TEXTURE_2D,
			webGlCanvasContext.TEXTURE_MIN_FILTER, webGlCanvasContext.LINEAR);
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, null);
	}	
	
	return webGlTexture;
}

/**
 * Updates the contents of a texture associated with a canvas,
 *  using the immediate contents of the canvas.
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL context that will facilitate the
 *                                                     creation of the texture
 * @param webGlTexture {WebGLTexture} The WebGL texture object that is to be updated
 * @param sourceCanvas {HTMLCanvasElement} An associated canvas object containing
 *                                         bitmap image data that  will be
 *                                         used to update the texture
 */
function updateDynamicTextureWithCanvas(webGlCanvasContext, webGlTexture, sourceCanvas) {
	if (validateVar(webGlCanvasContext) && validateVar(sourceCanvas) &&
		validateVar(sourceCanvas)) {
			
		webGlCanvasContext.bindTexture(webGlCanvasContext.TEXTURE_2D, webGlTexture);
		webGlCanvasContext.texImage2D(webGlCanvasContext.TEXTURE_2D, 0,
			webGlCanvasContext.RGBA, webGlCanvasContext.RGBA,
			webGlCanvasContext.UNSIGNED_BYTE, sourceCanvas);		
	}		
}

/**
 *  Generates vertex data that can be used to construct geometry
 *   suitable for the application of texturing and lighting operations
 *   from a provided triangle objects
 *  
 *  @param triangleArray {Array} Array of Triangle objects
 *  @return {AggregateWebGlVertexData} Object which contains a collection
 *          of vertex data that can be directly buffered by WebGl
 */
function generateAggregateVertexDataFromTriangleList(triangleArray) {
	var webGlVertexData = new AggregateWebGlVertexData();

	if (validateVarAgainstType(triangleArray, Array)) {

		var vertexCoordArray = new Array();
		var vertexColorsArray = new Array();
		var vertexTextureCoordsArray = new Array();
		var vertexNormalsArray = new Array();
		
		// Build individual, parallel arrays of vertex attributes, as required
		// by WebGL (Float32 value type)
		for (var currentIndex = 0; currentIndex < triangleArray.length; currentIndex++) {
			if (validateVarAgainstType(triangleArray[currentIndex], Triangle)) {
				vertexCoordArray.push.apply(vertexCoordArray,
					extractVertexCoordsFromTriangle(triangleArray[currentIndex]));
				vertexColorsArray.push.apply(vertexColorsArray,
					extractVertexColorsFromTriangle(triangleArray[currentIndex]));
				vertexTextureCoordsArray.push.apply(vertexTextureCoordsArray,
					extractVertexTextureCoordsFromTriangle(triangleArray[currentIndex]));
				vertexNormalsArray.push.apply(vertexNormalsArray,
					extractVertexNormalsFromTriangle(triangleArray[currentIndex]));
			}
		}
		
		webGlVertexData.vertices = new Float32Array(vertexCoordArray);
		webGlVertexData.vertexColors = new Float32Array(vertexColorsArray);
		webGlVertexData.vertexTextureCoords = new Float32Array(vertexTextureCoordsArray);
		webGlVertexData.vertexNormals = new Float32Array(vertexNormalsArray);
	}
	
	return webGlVertexData;
}

/**
 *  Extracts an array of vertex coordinates from a triangle
 *   object
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             vertex coordinates are to be extracted
 *  @return {Array} An array of coordinates, ordered by vertex (X, Y
 *          and Z coordinates are listed for each vertex)
 */
function extractVertexCoordsFromTriangle(triangle) {
	var vertexCoordArray = new Array();
	
	if (validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];
		
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			vertexCoordArray.push(triangleVertices[vertexIndex].getX());
			vertexCoordArray.push(triangleVertices[vertexIndex].getY());
			vertexCoordArray.push(triangleVertices[vertexIndex].getZ());	
		}
	}
	
	return vertexCoordArray;
}

/**
 *  Extracts color values from each triangle vertex
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             color data is to be extracted
 *  @return {Array} An array of color data, ordered by vertex (red,
 *  		green, blue and alpha component values are listed for
 *          each vertex)
 */
function extractVertexColorsFromTriangle(triangle) {
	var vertexColorsArray = new Array();

	if (validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];		
		
		// Each vertex is associated with an RGBA color.
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			var vertexColor = triangleVertices[vertexIndex].getColor()
			
			vertexColorsArray.push(vertexColor.getRedValue(), vertexColor.getGreenValue(), vertexColor.getBlueValue(),
				vertexColor.getAlphaValue());
		}		
	}
	
	return vertexColorsArray;
}

/**
 *  Extracts texture coordinate values from each triangle vertex
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             texture coordinate data is to be
 *                             extracted
 *  @return {Array} An array of texture coordinates, ordered by
 *          vertex (U and V coordinate values are listed for each
 *          vertex)
 */
function extractVertexTextureCoordsFromTriangle(triangle) {
	var vertexTextureCoordsArray = new Array();
	
	if (validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];
		
		// Each vertex is associated with a pair of texture coordinates.
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			var surfaceMappingCoords = triangleVertices[vertexIndex].getSurfaceMappingCoords()
			
			vertexTextureCoordsArray.push(surfaceMappingCoords.getXComponent(), surfaceMappingCoords.getYComponent());
		}
	}
	
	return vertexTextureCoordsArray;
}

/**
 *  Extracts vertex normal data from each triangle vertex
 *  
 *  @param triangle {Triangle} Triangle object from which the
 *                             vertex normal data is to be extracted
 *  @return {Array} An array of vertex normal components, ordered by
 *          vertex (x, y and z components are listed for each vertex)
 */
function extractVertexNormalsFromTriangle(triangle) {
	var vertexNormalsArray = new Array();
	
	if (validateVarAgainstType(triangle, Triangle)) {
		var triangleVertices = [triangle.getFirstVertex(), triangle.getSecondVertex(), triangle.getThirdVertex()];
		
		// Each vertex is associated with a single, three-component normal
		// vector - extract the normal vector components.
		for (var vertexIndex = 0; vertexIndex < triangleVertices.length; vertexIndex++) {
			var normalVector = triangleVertices[vertexIndex].getNormalVector();
			
			if (validateVarAgainstType(normalVector, Vector3d)) {
				vertexNormalsArray.push(normalVector.getXComponent());
				vertexNormalsArray.push(normalVector.getYComponent());
				vertexNormalsArray.push(normalVector.getZComponent());
			}
		}
	}
	
	return vertexNormalsArray;
}

/**
 *  Converts a matrix object into a linear array suitable for use
 *   within a WebGL buffer
 *  
 *  @param matrix {MathExt.Matrix} Matrix representation object
 *  @return {Array} A single linear array object containing all
 *          data from all rows within the matrix representation
 */
function convertMatrixToMatrixLinearArrayRep(matrix) {
	var matrixArray = new Float32Array();
	
	if (validateVarAgainstType(matrix, MathExt.Matrix)) {
		var matrixRepAsArrays = matrix.getArrayRepresentation();
		if (validateVarAgainstType(matrixRepAsArrays, Array)) {
			var intermediateMatrixArray = new Array();
			for (var currentIndex = 0; currentIndex < matrixRepAsArrays.length; currentIndex++) {
				intermediateMatrixArray.push.apply(intermediateMatrixArray, matrixRepAsArrays[currentIndex]);
			}
			
			matrixArray = new Float32Array(intermediateMatrixArray);
		}
	}
	
	return matrixArray;
}

