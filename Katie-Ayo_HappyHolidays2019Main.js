// Katie-Ayo_HappyHolidays2019Main.js - Happy Holidays 2019 demo entry point
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -WebGlUtility.js
//  -InternalConstants.js
//  -StaticTextLineCanvasBuffer.js
//  -SceneExecution.js

/**
 * Initializes any required DOM resources
 *  (creates objects, etc.)
 * @param completionFunction {function} Function to be invoked after the
 *                                      DOM resource initialization has
 *                                      been completed.
 */
function initDomResources(completionFunction) {
	// Remove any previous elements from the DOM.
	document.body = document.createElement("body");	
	
	// Create the main canvas on which output
	// will be displayed..
	mainDiv = document.createElement("div");
	
	// Center the div within the window (the height centering will
	// not be retained if the window size has been altered).
	mainDiv.setAttribute("style", "text-align:center; margin-top: " +
		Math.round((window.innerHeight - Constants.defaultCanvasHeight) / 2.0) + "px");
		
	// Add the DIV to the DOM.
	document.body.appendChild(mainDiv);		
	var mainCanvas = document.createElement("canvas");
	var gaugeOverlayCanvas = document.createElement("canvas");
	var scoreOverlayCanvas = document.createElement("canvas");
	var fullScreenOverlayCanvas = document.createElement("canvas");
	
    if (validateVar(mainCanvas) && validateVar(gaugeOverlayCanvas) &&
		validateVar(scoreOverlayCanvas) && validateVar(fullScreenOverlayCanvas) &&
		(typeof mainCanvas.getContext === 'function')) {
			
		mainCanvas.width = Constants.defaultCanvasWidth;
		mainCanvas.height = Constants.defaultCanvasHeight;
		
		gaugeOverlayCanvas.width = Constants.overlayTextureWidth;
		gaugeOverlayCanvas.height = Constants.overlayTextureHeight;
		
		scoreOverlayCanvas.width = Constants.overlayTextureWidth;
		scoreOverlayCanvas.height = Constants.overlayTextureHeight;
		
		fullScreenOverlayCanvas.width = Constants.fullScreenOverlayTextureWidth;
		fullScreenOverlayCanvas.height = Constants.fullScreenOverlayTextureHeight;
	
        // Store the WeblGL context that will be used
        // to write data to the canvas.
        var mainCanvasContext = getWebGlContextFromCanvas(mainCanvas);
		var gaugeOverlayCanvasContext = gaugeOverlayCanvas.getContext("2d");
		var scoreOverlayCanvasContext = scoreOverlayCanvas.getContext("2d");
		var fullScreenOverlayCanvasContext = fullScreenOverlayCanvas.getContext("2d");
    
		if (validateVar(mainCanvasContext) && validateVar(gaugeOverlayCanvasContext) &&
			validateVar(scoreOverlayCanvasContext)) {
			// Prepare the WebGL context for use.
			initializeWebGl(mainCanvasContext);

			// Add the canvas object DOM (within the DIV).
			mainDiv.appendChild(mainCanvas);
			
			// Create overlay textures - these texture will be used primarily
			// to display text over presented content.
			var gaugeOverlayTexture = createTextureFromCanvas(mainCanvasContext, gaugeOverlayCanvas, false);		
			var scoreOverlayTexture = createTextureFromCanvas(mainCanvasContext, scoreOverlayCanvas, false);
			var fullScreenOverlayTexture = createTextureFromCanvas(mainCanvasContext, fullScreenOverlayCanvas, false);
			if (validateVar(gaugeOverlayTexture) && validateVar(scoreOverlayTexture)) {
				globalResources.setGaugeOverlayTexture(gaugeOverlayTexture);
				globalResources.setScoreOverlayTexture(scoreOverlayTexture);	
				globalResources.setFullScreenOverlayTexture(fullScreenOverlayTexture);
			}
			
			globalResources.setMainCanvasContext(mainCanvasContext);
			globalResources.setGaugeOverlayCanvasContext(gaugeOverlayCanvasContext);
			globalResources.setScoreOverlayCanvasContext(scoreOverlayCanvasContext);
			globalResources.setFullScreenOverlayCanvasContext(fullScreenOverlayCanvasContext);
		}
	}
	
	//loadIntroImage(buildIntroScreen);
	
	// Hide the main canvas in order to permit the introductory screen to be displayed.
	mainCanvas.hidden = true;
	
	var introSectionDiv = document.createElement("div")
	var progressSectionDiv = document.createElement("div")
	mainDiv.appendChild(introSectionDiv);
	
	mainDiv.appendChild(progressSectionDiv);
	buildIntroductoryScreen(introSectionDiv);
	
	var progressElementWidth = 500;
	var progressController = new progressElementController();
	progressController.createProgressElement(progressSectionDiv, progressElementWidth);
	progressController.updateProgressElement(0.0);
	
	var loadProgressFunction = function(progressFraction) {
		progressController.updateProgressElement(progressFraction);
	}
	
	globalResources.setLoadProgressFunction(loadProgressFunction);
	
	
	function loadCompletionFunction() {		
		progressSectionDiv.remove();
		
		var clickToContinueButton = createClickToContinueButton();
		mainDiv.appendChild(clickToContinueButton);
		
		
		function permissionsRequestCompletionHandler() {
			introSectionDiv.remove();
			clickToContinueButton.remove();
		
			completionFunction();
			mainCanvas.hidden = false;			
		}
		
		function buttonClickHandler() {
			conditionallyRequestInitialPermissions(permissionsRequestCompletionHandler);
		}
		
		clickToContinueButton.onclick = buttonClickHandler;
	}
	
	globalResources.initialize(loadCompletionFunction);	
}



buildIntroductoryScreen = function(parentDiv) {
	
	if (validateVar(parentDiv)) {
		
		var imageBorderX = 75;
		var imageBorderY = 75;
		var canvasBackgroundColor = new RgbColor(0.0, 0.0, 0.0, 1.0);
		
		var introductoryScreenCanvas = document.createElement("canvas");
		introductoryScreenCanvas.width = Constants.defaultCanvasWidth;
		introductoryScreenCanvas.height = Constants.defaultCanvasHeight;
		introductoryScreenCanvasContext = introductoryScreenCanvas.getContext("2d");
		
		introductoryScreenCanvasContext.fillStyle = canvasBackgroundColor.getRgbaIntValueAsStandardString();
		introductoryScreenCanvasContext.fillRect(0, 0, introductoryScreenCanvas.width,
			introductoryScreenCanvas.height);
		
		parentDiv.appendChild(introductoryScreenCanvas);
		
		//introductoryScreenCanvas.setAttribute("style", "text-align:center; margin-top: " +
			//Math.round((window.innerHeight - Constants.defaultCanvasHeight) / 2.0) + "px");

		var introductoryScreenImage = new Image();		

		function onIntroductoryImageLoad() {
			introductoryScreenCanvasContext.drawImage(introductoryScreenImage,
				imageBorderX, imageBorderY,
				introductoryScreenCanvas.width - (2.0 * imageBorderX),
				introductoryScreenCanvas.height - (2.0 * imageBorderY));
			renderTextIntoIntroductoryScreenCanvas(introductoryScreenCanvasContext);
		}
		
		introductoryScreenImage.onload = onIntroductoryImageLoad;
		introductoryScreenImage.src = globalResources.getIntroImageUri();		
	}
	
}

createClickToContinueButton = function(parentDiv) {
	
	var buttonBackgroundColor = new RgbColor(0.1, 0.7, 0.1, 0.9);
	var buttonForegroundColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	var borderRadius = 10;
	
	var clickToContinueButton = document.createElement("button");
	clickToContinueButton.innerHTML = Constants.stringIntroClickToContinue;
	clickToContinueButton.type = "button";
	clickToContinueButton.style.border = "none";
	clickToContinueButton.style.fontSize = Constants.prominentButtonFontSize + "px";
	clickToContinueButton.style.backgroundColor = buttonBackgroundColor.getRgbaIntValueAsStandardString();
	clickToContinueButton.style.color = buttonForegroundColor.getRgbaIntValueAsStandardString();
	clickToContinueButton.style.borderRadius = 10 + "px";

	return clickToContinueButton;
}

renderTextIntoIntroductoryScreenCanvas = function(targetContext) {
	
		var titleTextCoordX = 350;
		var titleTextCoordY = 60;
		
		var movementInstructionTextCoordX = 220;
		var movementInstructionTextCoordY = 180;
		
		var packageFiringInstructionTextCoordX = 20;
		var packageFiringInstructionTextCoordY = 400;
		
		var holidaySpiritDescTextCoordX = 50;
		var holidaySpiritDescTextCoordY = 540;
	
		var titleTextBuffer = new StaticTextLineCanvasBuffer(Constants.smallLabelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		var movementInstructionBuffer = new StaticTextLineCanvasBuffer(Constants.smallLabelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		var packageFiringInstructionBuffer = new StaticTextLineCanvasBuffer(Constants.smallLabelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		var holidaySpiritDescBuffer = new StaticTextLineCanvasBuffer(Constants.smallLabelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
			
		titleTextBuffer.updateStaticTextString(Constants.stringIntroGeneral);
		movementInstructionBuffer.updateStaticTextString(Constants.stringIntroMoveInstruction);
		packageFiringInstructionBuffer.updateStaticTextString(Constants.stringIntroFireInstruction);
		holidaySpiritDescBuffer.updateStaticTextString(Constants.stringIntroHolidaySpiritDesc);
		
		titleTextBuffer.renderText(introductoryScreenCanvasContext, titleTextCoordX, titleTextCoordY);
		movementInstructionBuffer.renderText(introductoryScreenCanvasContext, movementInstructionTextCoordX, movementInstructionTextCoordY);
		packageFiringInstructionBuffer.renderText(introductoryScreenCanvasContext, packageFiringInstructionTextCoordX, packageFiringInstructionTextCoordY);
		holidaySpiritDescBuffer.renderText(introductoryScreenCanvasContext, holidaySpiritDescTextCoordX, holidaySpiritDescTextCoordY);	
}

conditionallyRequestInitialPermissions = function(completionFunction) {
	function accelerometerRequestCompletionFunction() {
		globalResources.conditionallyRequestGyroscopePermission(completionFunction)
	}
	
	globalResources.conditionallyRequestAccelerometerPermission(accelerometerRequestCompletionFunction);
}

/**
 * Completion function to be used with globalResources.initialize() -
 *  performs any final activities related to loading, and executes
 *  the main scene immediately after all image data has been loaded
 * @see globalResources.initialize
 */
finalizeLoading = function() {
	//globalResources.playBackgroundAudio();
	executeMainScene();
}

/**
 * Performs execution of the main demo scene
 */
executeMainScene = function() {	
	// Initiate background audio playback.
	globalResources.playBackgroundAudio();
	
	// Create the main image transformation scene, and ultimately
	// invoke the start of the demo.
	var packageDropperGamePlayScene = new MainPackageDropperGameplayScene();
	sceneExecution(packageDropperGamePlayScene);
}


commenceLoading = function() {
	// Initialize the DOM resources, immediately
	// executing the demo after completion of
	// initialization.
	initDomResources(finalizeLoading);	
}

/**
 * Main routine - function that is
 *  executed when page loading has
 *  completed
 */
onLoadHandler = function() {
	commenceLoading();
}