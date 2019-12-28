// InternalConstants.js - Contains common constants used within various classes/routines
// Author: Ayodeji Oshinnaiye

var Constants = {
	/**
	 * Width of front buffer canvas (and associated
	 *  backbuffer canvases)
	 */
	defaultCanvasWidth : 960,
	
	/**
	 * Height of front buffer canvas (and associated
	 *  backbuffer canvases)
	 *
	 */
	defaultCanvasHeight : 720,
	
	/**
	 * Width of the internally-stored image bitmap
	 *  representation of each source image
	 */
	internalBitmapWidth : 1024,
	
	/**
	 * Height of the internally-stored image bitmap
	 *  representation of each source image
	 */
	internalBitmapHeight: 1024,
			
	/**
	 * Width of the texture that will be used as
	 *  an overlay with respect to the primary
	 *  image textures
	 */
	overlayTextureWidth: 960,
	
	/**
	 * Height of the texture that will be used as
	 *  an overlay with respect to the primary
	 *  image textures
	 */
	overlayTextureHeight: 48,
	
	/**
	 * Width of the texture that will be used as
	 *  a full-screen overlay with respect to the
	 *  primary image textures
	 */
	fullScreenOverlayTextureWidth: 960,

	/**
	 * Height of the texture that will be used as
	 *  a full-screen overlay with respect to the
	 *  primary image textures
	 */	
	fullScreenOverlayTextureHeight: 720,
	
	/**
	 * Width of the initially-displayed progress
	 *  bar/element
	 */
	progressElementWidth: 800,
	
	/**
	 * Number of milliseconds contained in one second
	 */
	millisecondsPerSecond : 1000,
	
	/**
	 * Maximum angular measurement, in degrees
	 */
	maxAngleDegrees : 360,
	
	/**
	 * Maximum value of a scalar input event
	 */
	maxScalarInputEventMagnitude : 1.0,
	
	/**
	 * Scalar input class of input events
	 */
	eventTypeScalarInput : "_InputTypeScalarInputEvent",
	
	/**
	 * Height of the "small" label font, in pixels
	 */
	smallLabelFontSizePx: 20,
	
	/**
	 * Height of the label font, in pixels
	 */
	labelFontSizePx: 30,
	
	/**
	 * Height of the "Game Over" text, in pixels
	 */
	gameOverFontSizePx: 120,
	
	/**
	 * Size of the font for a button that is intended to be
	 *  a prominent UI element
	 */
	prominentButtonFontSize: 50,
	
	/**
	 * Font name of the label font
	 */
	labelFont: "Arial",
	
	/**
	 * Style applied to the label font
	 */
	labelFontStyle: "Italic",
	
	/**
	 * Alpha (transparency) value for the background of text regions
	 */
	defaultTextBackgroundUnitAlpha: 0.2,
	
	/**
	 * Intensity of the background for text regions
	 */
	defaultTextBackgroundUnitIntensity: 0.0,
	
	/**
	 * Intro screen title
	 */ 
	stringIntroGeneral: "Help save the holidays!",

	/**
	 * Sleigh movement directions
	 */
	stringIntroMoveInstruction: "Use the arrow keys / tilt the device to move the sleigh",
	
	/**
	 * Package firing instructions
	 */
	stringIntroFireInstruction: "Press space / tap the device screen to fire packages into chimneys",
	
	/**
	 * Holiday Spirit description
	 */
	stringIntroHolidaySpiritDesc: "When The Holiday Spirit has been depleted, the game ends!",
	
	/**
	 * Demo initiation button text
	 */
	stringIntroClickToContinue: "Click / Tap to Begin!",
	
	/**
	 * Label for the game score
	 */
	stringScoreLabel: "Score: ",
	
	/**
	 * Label for the holiday spirit gauge
	 */
	stringHolidaySpiritLabel: "Holiday Spirit: ",
	
	/**
	 * Text displayed after the game has concluded
	 */
	stringGameOver: "Game Over",
	
	/**
	 * Holiday message text
	 */
	messageText: "Happy Holidays from Katie and Ayo!"
}