// GlobalResources.js - Contains resources that are accessible
//                      from all areas of the demo
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -ResourceLoader.js
//  -WebGlUtility.js

function globalResources() {


}

globalResources.modelPrimarySleigh = "modelPrimarySleigh";
globalResources.modelProjectileGiftBoxKey = "modelProjectileGiftBox";
globalResources.modelSceneryHouse1Key = "modelSceneryHouse1";
globalResources.modelSceneryHouse2Key = "modelSceneryHouse2";
globalResources.modelSceneryHouse3Key = "modelSceneryHouse3";
globalResources.modelSceneryHouse4Key = "modelSceneryHouse4";
globalResources.modelEnemyGrinchKey = "modelEnemyGrinch";
globalResources.fragmentShaderGouraudKey = "fragmentShaderGouraud";
globalResources.fragmentShaderStandardTextureKey = "fragmentShaderStandardTexture";
globalResources.vertexShaderStandardPositionKey = "vertexShaderStandardPosition";
globalResources.audioBackgroundMusicKey = "audioBackgroundMusic";

globalResources.textureSkyBackdropUri = "textures/BackdropSky.jpg";
globalResources.introImageUri = "images/HappyHolidays2019Intro.jpg";
globalResources.skyBackdropImage = null;
globalResources.skyBackdropTexture = null;

globalResources.loadedResourceKeyValueStore = null;

globalResources.audioContext = null;

/**
 * Initiates the resource loading process
 *
 * @param completionFunction A function that will be invoked
 *                           after all resource load attempts have
 *                           been completed (regardless of success
 *                           or failure)
 */
globalResources.loadResources = function(completionFunction) {
	var resourceLoader = new ResourceLoader();
	
	// The progress function will be invoked after each resource has been
	// loaded (function will receive a fractional progress indicator).
	if (validateVar(this.progressFunction)) {
		resourceLoader.setProgressFunction(this.progressFunction);
	}
	
	for (var currentResourceKey in this.resourceSourceKeyValueStore) {
		
		var resourceIsBinaryData = (validateVar(globalResources.resourceBinaryStateKeyValueStore[currentResourceKey]) && 
			(globalResources.resourceBinaryStateKeyValueStore[currentResourceKey] === true));
		
		resourceLoader.addResourceSourceUri(currentResourceKey, this.resourceSourceKeyValueStore[currentResourceKey],
			resourceIsBinaryData);
	}
	
	var resourceLoadCompletionFunction = completionFunction;
	var resourceLoadCompletionHandler = function (loadedResourceKeyValueStore) {
		globalResources.onResourceLoadCompletion(loadedResourceKeyValueStore);
		
		// Load / decode the sky backdrop image after all other images
		// have been loaded (loading / decoding of image files can
		// be performed by the framework natively).
		globalResources.skyBackdropImage = new Image();

		function backDropLoadCompletionFunction() {
			
			globalResources.skyBackdropTexture = createTextureFromImage(globalResources.getMainCanvasContext(), globalResources.skyBackdropImage);
			
			// Decode any audio data as required (e.g. background music).
			resourceLoadCompletionFunction();
		}
		
		globalResources.skyBackdropImage.onload = backDropLoadCompletionFunction;
		globalResources.skyBackdropImage.src = globalResources.textureSkyBackdropUri;
	}
	
	resourceLoader.initiateResourceLoading(resourceLoadCompletionHandler);
}

/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing data to the
 *			browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window (gauge)
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getGaugeOverlayCanvasContext = function() {
	return typeof this.gaugeOverlayCanvasContext !== "undefined" ?
		this.gaugeOverlayCanvasContext : null;
}

/*
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window (score)
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getScoreOverlayCanvasContext = function() {
	return typeof this.scoreOverlayCanvasContext !== "undefined" ?
		this.scoreOverlayCanvasContext : null;
}

/*
 * Retrieves the overlay canvas context used for drawing data
 *  to the browser window (full screen data)
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing to be
 *			superimposed on the main canvas
 */
globalResources.getFullScreenOverlayCanvasContext = function() {
	return typeof this.fullScreenOverlayCanvasContext !== "undefined" ?
		this.fullScreenOverlayCanvasContext : null;
}

/**
 * Sets the "main" canvas context used for drawing data to the
 *  browser window
 * @param mainCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						    The canvas context the
 *                          will be retrieved for drawing data to the browser
 *                          window
 */
globalResources.setMainCanvasContext = function(mainCanvasContext) {
	this.mainCanvasContext = mainCanvasContext;
}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas (gauge)
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setGaugeOverlayCanvasContext = function(overlayCanvasContext) {
	this.gaugeOverlayCanvasContext = overlayCanvasContext;
}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas (score)
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setScoreOverlayCanvasContext = function(overlayCanvasContext) {
	this.scoreOverlayCanvasContext = overlayCanvasContext;
}

/**
 * Sets the overlay canvas context used for drawing data that is
 *  to be superimposed on the main canvas (full screen data)
 * @param overlayCanvasContext {CanvasRenderingContext2D / WebGLRenderingContext}
 *						       The canvas context that will be retrieved for
 *                             drawing data over the main canvas
 */
globalResources.setFullScreenOverlayCanvasContext = function(overlayCanvasContext) {
	this.fullScreenOverlayCanvasContext = overlayCanvasContext;
}

/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene (score)
 *  
 *  @return {WebGLTexture} The texture that is to be used
 *                         as the overlay texture
 */
globalResources.getScoreOverlayTexture = function() {
	return this.scoreOverlayTexture;
}

/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene (gauge)
 *  
 *  @return {WebGLTexture} The texture that is to be used
 *                         as the overlay texture
 */
globalResources.getGaugeOverlayTexture = function() {
	return this.gaugeOverlayTexture;
}

/**
 *  Retrieves the overlay texture used for superimposing data
 *   that is to be drawn over the main scene (full screen data)
 */
globalResources.getFullScreenOverlayTexture = function() {
	return this.fullScreenOverlayTexture;
}

/**
 *  Retrieves the texture used for the backdrop (sky)
 */
globalResources.getSkyBackdropTexture = function() {
	return this.skyBackdropTexture;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main scene (score)
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setScoreOverlayTexture = function(overlayTexture) {
	this.scoreOverlayTexture = overlayTexture;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main scene (gauge)
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setGaugeOverlayTexture = function(overlayTexture) {
	this.gaugeOverlayTexture = overlayTexture;
}

/**
 * Sets the overlay texture used for drawing data that is
 *  to be superimposed on the main scene (full screen data)
 * @param overlayTexture {WebGLTexture} The texture that is to be used
 *                                      as an overlay texture
 */
globalResources.setFullScreenOverlayTexture = function(overlayTexture) {
	this.fullScreenOverlayTexture = overlayTexture;
}

/**
 * Retrieves the image used as the backdrop (sky)
 * @return {Image} An image object upon success
 */
globalResources.getSkyBackdropImage = function () {
	return globalResources.skyBackdropImage;
}

/**
 * Retrieves the URI of the intro image
 * @return {String} The URI of the intro image
 */
globalResources.getIntroImageUri = function () {
	return globalResources.introImageUri;
}

/**
 * Sets the function that will be receive progress
 *  events
 *
 * @param {function} A function that will receive a single,
 *                   number parameter between 0.0 - 1.0, inclusive,
 *                   representing the load progress.
 *
 */
globalResources.setLoadProgressFunction = function (progressFunction) {
	if (validateVar(progressFunction)) {		
		this.progressFunction = progressFunction;
	}
}

/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D / WebGLRenderingContext}
 *			The canvas context used for drawing data to the
 *			browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Retrieves loaded resource data using a key in order
 *  to reference data within the internal key/value store
 * @param loadedResourceDataKey {String} Key into the key-value
 *                                       store containing loaded
 *                                       data
 *
 * @return {LoadedResourceData} Data associated with a loaded resource
 */
globalResources.getLoadedResourceDataByKey = function(loadedResourceDataKey) {
	return this.loadedResourceKeyValueStore[loadedResourceDataKey];
}

/**
 * Handler invoked after loading has been attempted/completed for
 *  all resources
 * 
 * @param loadedResourceKeyValueStore {Object} A key/value store containing all
 *                                             loaded resources
 */
globalResources.onResourceLoadCompletion = function (loadedResourceKeyValueStore) {
	this.loadedResourceKeyValueStore = loadedResourceKeyValueStore;
}

/**
 * Decodes all loaded audio data
 *
 * @param completionFunction {Function} Completion function invoked after all
 *                                      audio data has been decoded
 */
globalResources.decodeAllAudioData = function(completionFunction) {

	for (var currentAudioDataKeyIndex = 0; currentAudioDataKeyIndex < this.audioDataSourceKeys.length; currentAudioDataKeyIndex++) {
		
		var decodeTargetAudioDataKeyIndex = currentAudioDataKeyIndex;
		function decodeSuccessCallback(audioBuffer) {
			// Audio has been decoded successfully - store the buffer, and
			// invoke the provided completion function if decoding attempts
			// have been performed on all audio buffers.
			globalResources.decodedAudioDataKeyValueStore[globalResources.audioDataSourceKeys[decodeTargetAudioDataKeyIndex]] = audioBuffer;
			
			globalResources.processedAudioDataSourceCount++
			
			if ((globalResources.processedAudioDataSourceCount == globalResources.audioDataSourceKeys.length) &&
				validateVar(completionFunction)) {
					
				completionFunction();
			}
		}
		
		function decodeErrorCallBack(audioBuffer) {
			this.processedAudioDataSourceCount++			
		}
		
		// Decode the audio data...
		audioContext = globalResources.createAudioContext();
		if (validateVar(audioContext)) {
			var encodedAudioData = this.loadedResourceKeyValueStore[this.audioDataSourceKeys[currentAudioDataKeyIndex]].resourceDataStore;
			audioContext.decodeAudioData(encodedAudioData, decodeSuccessCallback, decodeErrorCallBack);
		}
	}
}

/**
 *  Creates an AudioContext object that will be required
 *   to play the background audio
 *  
 *  @return {AudioContext} AudioContext object required to play
 *                         the background audio
 */
globalResources.createAudioContext = function() {
	var audioContext = null;
	if (typeof(window.AudioContext) !== "undefined") {
		audioContext = new window.AudioContext();
	}
	else {
		// Used by Safari (validated against version 12.x)
		audioContext = new window.webkitAudioContext();
	}
	
	return audioContext;
}

/**
 *  Initiates playback of the background audio - this method must
 *   be invoked from within a click event handler in order for
 *   the audio to be played on all supported browsers (it should not
 *   be invoked an any other handler, even if the request being
 *   handled was invoked from within the click handler)
 */
globalResources.playBackgroundAudio = function() {
	globalResources.audioContext = globalResources.createAudioContext();
	globalResources.audioContext.resume();
	if (globalResources.audioContext !== null) {	
		function initiateBackgroundAudioPlayback() {
			if (validateVar(globalResources.decodedAudioDataKeyValueStore[globalResources.audioBackgroundMusicKey])) {
				var audioSource = globalResources.audioContext.createBufferSource();
				audioSource.buffer = globalResources.decodedAudioDataKeyValueStore[globalResources.audioBackgroundMusicKey];
				audioSource.connect(globalResources.audioContext.destination);
				audioSource.loop = true;
				audioSource.start(0);
			}
		}
			
		globalResources.decodeAllAudioData(initiateBackgroundAudioPlayback);
	}
}

globalResources.conditionallyRequestAccelerometerPermission = function(completionFunction) {

	if ((typeof(DeviceOrientationEvent) !== "undefined") && typeof(DeviceOrientationEvent.requestPermission) === "function") {
		// Standard method for requesting accelerometer permission under
		// Safari.
		DeviceOrientationEvent.requestPermission().then(response => {
			completionFunction();
		});
	}
	/*else if (typeof(navigator.permissions.query) === "function") {
		navigator.permissions.query({name: "accelerometer"}).then		
	}*/
	else if (validateVar(completionFunction)) {
		completionFunction()
	}
}

globalResources.conditionallyRequestGyroscopePermission = function(completionFunction) {
	if ((typeof(DeviceMotionEvent) !== "undefined") && typeof(DeviceMotionEvent.requestPermission) === "function") {
		// Standard method for requesting gyroscope permission under
		// Safari.
		DeviceMotionEvent.requestPermission().then(response => {
			completionFunction();
		});
	}
	/*else if (typeof(navigator.permissions.query) === "function") {
		navigator.permissions.query({name: "gyroscope"}).then
		
	}*/
	else if (validateVar(completionFunction)) {
		completionFunction()
	}	
}

/**
 * Initializes the global resources, loading
 *  any resources that require pre-loading
 * @param completionFuction {function} Completion function executed
 *                                     upon completion of all global
 *                                     resource loading
 */
globalResources.initialize = function(completionFunction) {

	// Create a key / value store of resources that will be 
	// used by the demo - these resources will be explicitly loaded
	// and processed directly (images can be loaded / processed by
	// the framework, and therefore should not be referenced in
	// this section).
	this.resourceSourceKeyValueStore = {};
	
	this.resourceSourceKeyValueStore[globalResources.modelPrimarySleigh] = "models/Sleigh.obj"
	this.resourceSourceKeyValueStore[globalResources.modelProjectileGiftBoxKey] = "models/GiftBox.obj";
	this.resourceSourceKeyValueStore[globalResources.modelSceneryHouse1Key] = "models/SnowCoveredCottage.obj";
	this.resourceSourceKeyValueStore[globalResources.modelSceneryHouse2Key] = "models/CyprysHouse.obj";
	this.resourceSourceKeyValueStore[globalResources.modelSceneryHouse3Key] = "models/SimpsonsHouse.obj";
	this.resourceSourceKeyValueStore[globalResources.modelSceneryHouse4Key] = "models/CatanHouse.obj";
	this.resourceSourceKeyValueStore[globalResources.modelEnemyGrinchKey] = "models/Grinch.obj";
	this.resourceSourceKeyValueStore[globalResources.fragmentShaderGouraudKey] = "shaders/FragmentShaderGouraud.shader";
	this.resourceSourceKeyValueStore[globalResources.fragmentShaderStandardTextureKey] = "shaders/FragmentShaderStandardTexture.shader";
	this.resourceSourceKeyValueStore[globalResources.vertexShaderStandardPositionKey] = "shaders/VertexShaderStandardPosition.shader";
	this.resourceSourceKeyValueStore[globalResources.audioBackgroundMusicKey] = "audio/Southern-Style Sleigh Ride.mp3";
	
	this.resourceBinaryStateKeyValueStore = {};
	
	this.resourceBinaryStateKeyValueStore[globalResources.audioBackgroundMusicKey] = true;
	
	this.audioDataSourceKeys = [globalResources.audioBackgroundMusicKey];

	
	this.decodedAudioDataKeyValueStore = {};
	this.processedAudioDataSourceCount = 0;
	
	this.loadResources(completionFunction);
}