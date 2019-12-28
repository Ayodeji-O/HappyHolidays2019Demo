// MainPackageDropperGameplayScene.js - Renders an interactive scene with a guided sleigh,
//                                      where the objective is to target projectiles 
//                                      (packages) at the top entrance of chimneys affixed
//                                      to houses that constantly scroll by the location of
//                                      the sleigh
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -WebGlUtility.js
//  -RgbColor.js
//  -MathExtMatrix.js
//  -MathUtility.js
//  -WebGlUtility.js
//  -ObjFormatBufferParser.js
//  -ObjFormatPrimitivesAdapter.js
//  -StaticTextLineCanvasBuffer.js
//  -InputEventInterpreter.js
//  -ScalarInputEvent.js
//  -DeviceTouchInputEventReceiver.js


/**
 * Class that serves as a container for the storage
 *  of vertex data that is to be directly converted
 *  to WebGL buffers for rendering.
 *
 * @see MainPackageDropperGameplayScene.createWebGlBufferDataFromModelVertexData 
 */
function ModelVertexDataContainer() {
	this.aggregateVertexData = null;
	this.modelDimensionX = 0.0;
	this.modelDimensionY = 0.0;
	this.modelDimensionZ = 0.0;
}

/**
 * Class that is purposed for aggregating WebGL buffers required to
 *  render a specific object
 *
 * @see MainPackageDropperGameplayScene.renderGeometry
 */
function WebGlBufferData() {
	
	this.objectWebGlVertexBuffer = null;
	this.objectWebGlColorBuffer = null;
	this.objectWebGlTexCoordBuffer = null;
	this.objectWebGlNormalBuffer = null;
	this.vertexCount = 0;
}

/**
 * Class that contains information required to maintain the position
 *  and state of a gift box projectile object instance, in addition
 *  to storing the rendering buffers required for a gift box
 *  instance model
 */
function GiftBoxInstanceData() {
	this.objectWebGlBufferData = new WebGlBufferData();
	
	this.objectWorldSpacePosition = new Point3d(0.0, 0.0, 0.0);
	this.objectVelocity = new Vector3d(0.0, 0.0, 0.0);
	
	this.objectDimensions = new ObjectDimensionData(0.0, 0.0, 0.0);	
	
	this.objectRotationRadX = 0.0;
	this.objectRotationRadY = 0.0;
	this.objectRotationRadZ = 0.0;
}

/**
 *  Class that contains information required to maintain the position
 *    and state of an antagonistic Grinch object instance, in addition
 *    to storing the rendering buffers required for the Grinch
 *    instance model
 */
function EnemyGrinchInstanceData() {
	this.objectWebGlBufferData = new WebGlBufferData();
	
	this.objectWorldSpacePosition = new Point3d(0.0, 0.0, 0.0);
	this.objectVelocity = new Vector3d(0.0, 0.0, 0.0);
	
	this.objectDimensions = new ObjectDimensionData(0.0, 0.0, 0.0);		
	
	this.objectRotationRadX = 0.0;
	this.objectRotationRadY = 0.0;
	this.objectRotationRadZ = 0.0;	
}

/**
 * Object that contains the render-space object dimensions
 */
function ObjectDimensionData(dimensionX, dimensionY, dimensionZ) {
	this.objectDimensionX = returnValidNumOrZero(dimensionX);
	this.objectDimensionY = returnValidNumOrZero(dimensionY);
	this.objectDimensionZ = returnValidNumOrZero(dimensionZ);
}

function HouseReferenceData() {
	this.houseDimensions = new ObjectDimensionData(0.0, 0.0, 0.0);
}

/**
 * Class that contains information required to maintain the position
 *  and state of a house object instance, in addition
 *  to storing the rendering buffers required for a house
 *  instance model
 */
function HouseInstanceData() {
	this.objectWebGlBufferData = new WebGlBufferData();
	
	this.objectWorldSpacePosition = new Point3d(0.0, 0.0, 0.0);
	
	this.objectDimensions = new ObjectDimensionData(0.0, 0.0, 0.0);
	
	this.chimneyLocii = [];
	
	// House instances are not expected to rotate - these
	// values are expected to remain constant (values exist
	// for object processing consistency).
	this.objectRotationRadX = 0.0;
	this.objectRotationRadY = 0.0;
	this.objectRotationRadZ = 0.0;
}

/**
 * Class that contains a collection of houses - these
 *  houses will be rendered within a single row
 */
function HouseRowContainer() {
	this.houseInstanceCollection = [];
	
	this.rowLeftBoundaryCoordX = 0.0;
	this.rowRightStartingCoordX = 0.0;
	this.houseBaseLineCoordY = 0.0;
	this.houseBaseLineCoordZ = 0.0;
}

/**
 * Class that contains information required to maintain the position
 *  and state of the sleigh object instance, in addition
 *  to storing the rendering buffers required for the sleigh
 *  instance model
 */
function SleighInstanceData() {
	this.objectWebGlBufferData = new WebGlBufferData();
	
	this.objectWorldSpacePosition = new Point3d(0.0, 0.0, 0.0);
	this.objectVelocity = new Vector3d(0.0, 0.0, 0.0);
	
	// Thrust factor vector - each component has a unit maximum
	// magnitude.
	this.currentThrustFactorVector = new Vector3d(0.0, 0.0, 0.0);
	
	this.objectDimensions = new ObjectDimensionData(0.0, 0.0, 0.0);
	
	this.objectRotationRadX = 0.0;
	this.objectRotationRadY = 0.0;
	this.objectRotationRadZ = 0.0;	
}

/**
 * Vertex definition processor to be employed
 *  during OBJ file processing. Normalizes the
 *  final coordinates within an OBJ file, such that
 *  the coordinates are contained within a unit
 *  bounding box
 *
 * @see ObjFormatBufferParser
 */
function ObjVertexDefProcessorObjectBoundsNormalizer() {
	this.minValueX = null;
	this.maxValueX = null;
	this.minValueY = null;
	this.maxValueY = null;
	this.minValueZ = null;
	this.maxValueZ = null;
	
	// Scaling factor, based on a set of source coordinates
	// which have maximum extents of 1 model world coordinate
	// system unit.
	this.unitScalingFactor = 1.0;
	
	// Per-axis offsets, applied after final model
	// scaling.
	this.unitOffsetX = 0.0;
	this.unitOffsetY = 0.0;
	this.unitOffsetZ = 0.0;
}

/**
 * "Pre-processes" vertex definition data during parsing of an OBJ-formatted
 *  buffer (aggregates maximum/minimum bounds along all axes).
 *
 * @param {VertexDefinition} vertexDefinition Class instance that contains data which defines a
 *                                            single vertex, derived from parsing of a source
 *                                            OBJ-formatted buffer
 *
 * @return The original vertex definition object
 * @see ObjFormatBufferParser.vertexDefinitionProcessor
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.preProcessVertexDefinition = function(vertexDefinition) {
	// The preprocesor simply determines the boundaries of the object - the source
	// data remains unmodified.
	if (validateVarAgainstType(vertexDefinition, VertexDefinition)) {	
		this.updateMinMaxValuesCoordX(vertexDefinition.coordX);
		this.updateMinMaxValuesCoordY(vertexDefinition.coordY);
		this.updateMinMaxValuesCoordZ(vertexDefinition.coordZ);	
	}
	
	return vertexDefinition;	
}

/**
 * Updates the internally-stored minimum/maximum X coordinate
 *  values to be used during the final normalization
 *  process
 *
 * @param coordX {Number} The coordinate that will be
 *                        compared to the existing minimum/maximum
 *                        coordinate values for the X-axis
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.updateMinMaxValuesCoordX = function(coordX) {	
	if (this.minValueX === null) {
		this.minValueX = coordX;
	}
	else {
		this.minValueX = Math.min(this.minValueX, coordX);
	}	
	
	if (this.maxValueX === null) {
		this.maxValueX = coordX;
	}
	else {
		this.maxValueX = Math.max(this.maxValueX, coordX);
	}
}

/**
 * Updates the internally-stored minimum/maximum Y coordinate
 *  values to be used during the final normalization
 *  process
 *
 * @param coordY {Number} The coordinate that will be
 *                        compared to the existing minimum/maximum
 *                        coordinate values for the Y-axis
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.updateMinMaxValuesCoordY = function(coordY) {
	if (this.minValueY === null) {
		this.minValueY = coordY;
	}
	else {
		this.minValueY = Math.min(this.minValueY, coordY);
	}	
	
	if (this.maxValueY === null) {
		this.maxValueY = coordY;
	}
	else {
		this.maxValueY = Math.max(this.maxValueY, coordY);		
	}
	
}

/**
 * Updates the internally-stored minimum/maximum Z coordinate
 *  values to be used during the final normalization
 *  process
 *
 * @param coordZ {Number} The coordinate that will be
 *                        compared to the existing minimum/maximum
 *                        coordinate values for the Z-axis
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.updateMinMaxValuesCoordZ = function(coordZ) {
	if (this.minValueZ === null) {
		this.minValueZ = coordZ;
	}
	else {
		this.minValueZ = Math.min(this.minValueZ, coordZ);
	}	
	
	if (this.maxValueZ === null) {
		this.maxValueZ = coordZ;
	}
	else {
		this.maxValueZ = Math.max(this.maxValueZ, coordZ);		
	}
}

/**
 * "Post-processes" vertex definition data during parsing of an OBJ-formatted
 *  buffer (normalizes vertex values such that they fit into a unit cube).
 *
 * @param {VertexDefinition} vertexdefintion Class instance that contains data which defines a
 *                                           single vertex, derived from parsing of a source
 *                                           OBJ-formatted buffer
 *
 * @return The original vertex definition object
 * @see ObjFormatBufferParser.vertexDefinitionProcessor
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.postProcessVertexDefinition = function(vertexDefinition) {
	var postProcessedVertexDefinition = vertexDefinition;
	
	if (validateVarAgainstType(vertexDefinition, VertexDefinition)) {
		var objectDimensionX = (this.maxValueX - this.minValueX)
		var objectDimensionY = (this.maxValueY - this.minValueY)
		var objectDimensionZ = (this.maxValueZ - this.minValueZ);
		
		var scalingFactor = this.getCurrentDimAggregateScalingFactor();
			
		postProcessedVertexDefinition.coordX = ((postProcessedVertexDefinition.coordX - this.minValueX -
			(objectDimensionX / 2.0)) * scalingFactor) + this.unitOffsetX;
		postProcessedVertexDefinition.coordY = ((postProcessedVertexDefinition.coordY - this.minValueY -
			(objectDimensionY / 2.0)) * scalingFactor) + this.unitOffsetY;
		postProcessedVertexDefinition.coordZ = ((postProcessedVertexDefinition.coordZ - this.minValueZ -
			(objectDimensionZ / 2.0)) * scalingFactor) + this.unitOffsetZ;
	}
	
	return postProcessedVertexDefinition;
}

/**
 * Applies post-processing computations to a single 3D point
 *
 * @param {Point3d) point3d Three-dimensional for which the post processing
 *                          computation will be applied
 *
 * @return {Point3d} The post-processed 3d point upon success, a point
 *                   containing the coordinates of the source point
 *                   otherwise
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.applyPostProcessingToPoint3d = function(point3d) {
	var postProcessedPoint3d = new Point3d(point3d.xCoord, point3d.yCoord, point3d.zCoord);
	
	if (validateVarAgainstType(point3d, Point3d)) {
		var objectDimensionX = (this.maxValueX - this.minValueX)
		var objectDimensionY = (this.maxValueY - this.minValueY)
		var objectDimensionZ = (this.maxValueZ - this.minValueZ);
		
		var scalingFactor = this.getCurrentDimAggregateScalingFactor();
			
		postProcessedPoint3d.xCoord = ((postProcessedPoint3d.xCoord - this.minValueX -
			(objectDimensionX / 2.0)) * scalingFactor) + this.unitOffsetX;
		postProcessedPoint3d.yCoord = ((postProcessedPoint3d.yCoord - this.minValueY -
			(objectDimensionY / 2.0)) * scalingFactor) + this.unitOffsetY;
		postProcessedPoint3d.zCoord = ((postProcessedPoint3d.zCoord - this.minValueZ -
			(objectDimensionZ / 2.0)) * scalingFactor) + this.unitOffsetZ;
	}
	
	return postProcessedPoint3d;
}

/**
 * Returns the currently-stored maximum object dimension (X, Y, or Z axis)
 *
 * @return {Number} The maximum object dimension
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentMaxDimension = function() {
	var objectDimensionX = (this.maxValueX - this.minValueX);
	var objectDimensionY = (this.maxValueY - this.minValueY);
	var objectDimensionZ = (this.maxValueZ - this.minValueZ);
	var maxDimension = Math.max(objectDimensionX, objectDimensionY, objectDimensionZ);	
		
	return maxDimension;
}

/**
 * Returns the scaling factor used internally during the coordinate normalization
 *  process
 *
 * @return {Number} Scaling factor used internally during the coordinate normalization
 *                  process
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentDimAggregateScalingFactor = function() {
	return this.unitScalingFactor / this.getCurrentMaxDimension();
}

/**
 * Returns the current scaled model dimension along the X axis, based
 *  upon the available data that has been parsed
 *
 * @return The model dimension along the X-axis
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentScaledModelDimensionX = function() {
	var dimensionX = 0.0;
	
	if ((this.minValueX !== null) && (this.maxValueX !== null)) {
		dimensionX = (this.maxValueX - this.minValueX) * this.getCurrentDimAggregateScalingFactor();
	}

	return dimensionX;
}

/**
 * Returns the current scaled model dimension along the Y axis, based
 *  upon the available data that has been parsed
 *
 * @return The model dimension along the Y-axis
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentScaledModelDimensionY = function() {
	var dimensionY = 0.0;

	if ((this.minValueY !== null) && (this.maxValueY !== null)) {
		dimensionY = (this.maxValueY - this.minValueY) * this.getCurrentDimAggregateScalingFactor();
	}
	
	return dimensionY;
}

/**
 * Returns the current scaled model dimension along the Z axis, based
 *  upon the available data that has been parsed
 *
 * @return The model dimension along the Z-axis
 */
ObjVertexDefProcessorObjectBoundsNormalizer.prototype.getCurrentScaledModelDimensionZ = function() {
	var dimensionZ = 0.0;

	if ((this.minValueZ !== null) && (this.maxValueZ !== null)) {
		dimensionZ = (this.maxValueZ - this.minValueZ) * this.getCurrentDimAggregateScalingFactor();
	}
	
	return dimensionZ;
}

/**
 * Gameplay scene object which contains data that is employed
 *  to maintain the game state, in addition to retaining data
 *  that is immediately required for rendering the game
 *  scene
 */
function MainPackageDropperGameplayScene() {
	// 3D-transformation matrix size - 4 x 4
	this.constTransformationMatrixRowCount = 4;
	this.constTransformationMatrixColumnCount = 4;
	
	this.constModelInitializationScaleFactors = {}
	this.constModelInitializationScaleFactors[globalResources.modelPrimarySleigh] = 0.4;
	this.constModelInitializationScaleFactors[globalResources.modelProjectileGiftBoxKey] = 0.12;
	this.constModelInitializationScaleFactors[globalResources.modelSceneryHouse1Key] = 1.75;
	this.constModelInitializationScaleFactors[globalResources.modelSceneryHouse2Key] = 1.45;
	this.constModelInitializationScaleFactors[globalResources.modelSceneryHouse3Key] = 1.45;
	this.constModelInitializationScaleFactors[globalResources.modelSceneryHouse4Key] = 0.75;	
	this.constModelInitializationScaleFactors[globalResources.modelEnemyGrinchKey] = 0.25;
}

/**
 * Initializes the scene - invoked before scene execution
 *  
 * @see sceneExecution()
 */
MainPackageDropperGameplayScene.prototype.initialize = function () {
	this.totalElapsedSceneTimeMs = 0.0;

	// Number of floating point values that comprise a vertex
	this.constVertexSize = 3;
	// Number of floating point values that comprise a vector
	this.constVectorSize = 3;
	// Number of floating point values that comprise a vertex
	// color
	this.constVertexColorSize = 4;
	// Number of floating point values that comprise a texture
	// coordinate
	this.constTextureCoordinateSize = 2;
	
	// Scaling factor used to appropriately adjust the world scale to the
	// WebGL coordinate system. Each unit measurement value is roughly
	// equivalent to 1 meter; the world scale does not change the actual
	// equivalent unit length - it only adjusts the scale used for
	// rendering.
	this.constWorldScale = 0.156;

	// Gravitational acceleration, expressed in meters / millisecond²
	this.constGravitationalAccelerationMetersPerMsSq = 9.8 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond) *
		this.constWorldScale;
		
	// Initial rate of the progression through the game world,
	// expressed in meters / millisecond.
	this.constInitialProgressRateMetersPerMs = (2.0 / Constants.millisecondsPerSecond) *
		this.constWorldScale;
	
	// Rate of progression acceleration through the game world,
	// expressed in meters / millisecond²
	this.constProgressRateAccelerationRateMetersPerMsSq = 0.09 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond) *
		this.constWorldScale;
		
	// Acceleration of the sleigh, expressed in meters / millisecond²
	this.constSleighAccelerationRateMetersPerMsSq = 150.0 /
		(Constants.millisecondsPerSecond * Constants.millisecondsPerSecond) *
		this.constWorldScale;
		
	// Sleigh maximum velocity on a single axis (vector component), expressed in
	// meters / millisecond.
	this.constSleighMaxVelocityComponent = 12 / Constants.millisecondsPerSecond *
		this.constWorldScale;
		
	// Package projectile max rotation rate, expressed in radians / millisecond²
	this.constMaxPackageRotationRateRad = Math.PI * 2.0 / Constants.millisecondsPerSecond;

	// Immediate rate of progression through the game world,
	// expressed in meters / millisecond
	this.currentProgressRateMetersPerMs = this.constInitialProgressRateMetersPerMs;
	
	// Input event receivers - keyboard, device orientation and device touch.
	this.keyboardInputEventReceiver = new KeyboardInputEventReceiver(window);
	this.deviceMotionInputEventReceiver = new DeviceMotionInputEventReceiver(window);
	this.deviceTouchInputEventReceiver = new DeviceTouchInputEventReceiver(window);

	// Abstractly manages input device binding.
	this.inputEventInterpreter = new InputEventInterpreter();

	// Score overlay position
	this.scoreOverlayTopY = 0.95;
	this.scoreOverlayHeight = 0.10;
	
	// Holiday Spirit gauge overlay position
	this.gaugeOverlayTopY = -0.80;
	this.gaugeOverlayHeight = 0.10;
	
	// Backdrop geometry
	this.backdropVertices = new Float32Array([
		// Upper-left (triangle #1)
		-1.0, 	1.0,	1.0,
		// Lower-left (triangle #1)
		-1.0, 	-1.0,	1.0,
		// Lower-right (triangle #1)
		1.0, 	-1.0,	1.0,
		
		// Lower-right (triangle #2)
		1.0, 	-1.0,	1.0,
		// Upper-right (triangle #2)		
		1.0, 	1.0, 	1.0,
		// Upper-left (triangle #2)
		-1.0, 	1.0, 	1.0,
	]);
	
	// Full-screen display overlay geometry
	this.fullScreenOverlayVertices = new Float32Array([
		// Upper-left (triangle #1)
		-1.0, 	1.0,	-1.0,
		// Lower-left (triangle #1)
		-1.0, 	-1.0,	-1.0,
		// Lower-right (triangle #1)
		1.0, 	-1.0,	-1.0,
		
		// Lower-right (triangle #2)
		1.0, 	-1.0,	-1.0,
		// Upper-right (triangle #2)		
		1.0, 	1.0, 	-1.0,
		// Upper-left (triangle #2)
		-1.0, 	1.0, 	-1.0,
	]);
	
	// Overlay geometry (used during WebGL vertex
	// data generation)	
	this.scoreOverlayVertices = new Float32Array([
		// Upper-left (triangle #1)
		-1.0, 	this.scoreOverlayTopY, 								-1.0,
		// Lower-left (triangle #1)
		-1.0, 	this.scoreOverlayTopY - this.scoreOverlayHeight,	-1.0,
		// Lower-right (triangle #1)
		1.0, 	this.scoreOverlayTopY - this.scoreOverlayHeight,	-1.0,
		
		// Lower-right (triangle #2)
		1.0, 	this.scoreOverlayTopY - this.scoreOverlayHeight,	-1.0,
		// Upper-right (triangle #2)		
		1.0, 	this.scoreOverlayTopY, 								-1.0,
		// Upper-left (triangle #2)
		-1.0, 	this.scoreOverlayTopY, 								-1.0,
	]);
	
	// Spirit gauge overlay geometry (used during WebGL vertex
	// data generation)	
	this.gaugeOverlayVertices = new Float32Array([
		// Upper-left (triangle #1)
		-1.0, 	this.gaugeOverlayTopY, 								-1.0,
		// Lower-left (triangle #1)
		-1.0, 	this.gaugeOverlayTopY - this.gaugeOverlayHeight,	-1.0,
		// Lower-right (triangle #1)
		1.0, 	this.gaugeOverlayTopY - this.gaugeOverlayHeight,	-1.0,
		
		// Lower-right (triangle #2)
		1.0, 	this.gaugeOverlayTopY - this.gaugeOverlayHeight,	-1.0,
		// Upper-right (triangle #2)		
		1.0, 	this.gaugeOverlayTopY, 								-1.0,
		// Upper-left (triangle #2)
		-1.0, 	this.gaugeOverlayTopY, 								-1.0,
	]);

	// Overlay texture coordinates (used during WebGL vertex
	// data generation)	
	this.overlayTextureCoords = new Float32Array([
		// Upper-left (triangle #1)
		0.0, 0.0,
		// Lower-left (triangle #1)
		0.0, 1.0,
		// Lower-right (triangle #1)		
		1.0, 1.0,
		
		// Lower-right (triangle #2)	
		1.0, 1.0,
		// Upper-right (triangle #2)
		1.0, 0.0,
		// Upper-left (triangle #2)
		0.0, 0.0
	]);
	
	// Vector indicating the direction of the
	// ambient light source
	this.constAmbientLightVector = new Float32Array([
		-0.4, -0.3, -0.4
	]);
	
	// Holiday Spirit Gauge colors
	this.constSpiritGaugeMaxValueColor = new RgbColor(0.0, 1.0, 0.0, 0.75);
	this.constSpiritGaugeMinValueColor = new RgbColor(1.0, 0.0, 0.0, 0.75);
	this.constSpiritGaugeLeadingEdgeColor = new RgbColor(1.0, 1.0, 1.0, 1.0);
	this.constSpiritGaugeLeadingEdgeFraction = 0.92
	this.constSpiritGaugeOutlineColor = new RgbColor(1.0, 1.0, 1.0, 0.9);
	
	this.constSpiritGaugeWidth = 650;

	// Collection of keys for all OBJ-formatted house model buffers in the
	// resource key-value store.
	this.modelHouseResourceKeyList = [
		globalResources.modelSceneryHouse1Key,
		globalResources.modelSceneryHouse2Key,
		globalResources.modelSceneryHouse3Key,
		globalResources.modelSceneryHouse4Key];
		
	// Collection of chimney centerpoint locii (top of chimney) - these coordinates
	// must be scaled with the same computations applied to the corresponding
	// house models before use within the game scene. These locii are used to
	// determine if a package has successfully entered a chimney.
	this.modelHousePreScaledChimneyTopCenterLocii = {};
	
	this.modelHousePreScaledChimneyTopCenterLocii[globalResources.modelSceneryHouse1Key] =
		[new Point3d((10.6596 + 1.33324) / 2.0, 52.7885, (-29.512 + -20.1856) / 2.0)];
	this.modelHousePreScaledChimneyTopCenterLocii[globalResources.modelSceneryHouse2Key] =
		[new Point3d((9.220391 + 7.568391) / 2.0, 6.482349, (-1.905688 + -2.417518) / 2.0),
		 new Point3d((4.070392 + 2.618392) / 2.0, 8.382350, (-3.435688 + -3.947518) / 2.0)];
	this.modelHousePreScaledChimneyTopCenterLocii[globalResources.modelSceneryHouse3Key] =
		[new Point3d((-7.500005 + -1.499999) / 2.0, 78.500053, (-50.650486 + -38.528778) / 2.0)];
	this.modelHousePreScaledChimneyTopCenterLocii[globalResources.modelSceneryHouse4Key] = 	
		[new Point3d((3.698494 + 2.000001) / 2.0, 14.499999, (10.801508 + 12.500001) / 2.0)];
		
	// Final, scaled chimney locii that ared used to determine if a package has entered
	// a chimney.
	this.modelHouseScaledChimneyLocii = {};
	this.modelHouseScaledChimneyLocii[globalResources.modelSceneryHouse1Key] = [];
	this.modelHouseScaledChimneyLocii[globalResources.modelSceneryHouse2Key] = [];
	this.modelHouseScaledChimneyLocii[globalResources.modelSceneryHouse3Key] = [];
	this.modelHouseScaledChimneyLocii[globalResources.modelSceneryHouse4Key] = [];
		
	// Render information for house models
	this.modelHouseWebGlBufferKeyValueStore = {};
	// Reference information for prepared house models (will be
	// used each time an instance is created - HouseReferenceData
	// type).
	this.modelHouseReferenceDataKeyValueStore = {};

	// WebGL vertex buffer for package / gift box model
	this.modelGiftBoxWebGlBuffer = null;
	
	this.modelGiftBoxReferenceDimensionData = null;

	// Collection of gift box project instances (GiftBoxInstanceData type)
	this.giftBoxInstanceDataCollection = [];
	
	this.modelEnemyGrinchReferenceDimensionData = null;
	
	// Collection of antagonistic Grinch model instances (EnemyGrinchInstanceData type)
	this.enemyGrinchInstanceDataCollection = [];
	
	// Collection of house row instances (HouseRowContainer type)
	this.houseRowContainerCollection = [];
	
	// WebGL vertex buffer for enemy/Grinch model
	this.modelEnemyGrinchWebGlBuffer = null;
	
	this.backdropRenderWebGlData = null;
	
	this.scoreOverlayRenderWebGlData = null; 
	this.gaugeOverlayRenderWebGlData = null;
	
	this.fullScreenOverlayWebGlData = null;
	
	
	// Sleigh instance (only a single instance should exist)
	this.sleighInstance = null;

	// Sleigh positioning boundaries (sleigh position is at the
	// center of the sleigh)
	this.constSleighMinPositionX = -5.1 * this.constWorldScale;
	this.constSleighMaxPositionX = 5.1 * this.constWorldScale;
	this.constSleighMinPositionY = -1.0 * this.constWorldScale;
	this.constSleighMaxPositionY = 5.8 * this.constWorldScale;
	this.constSleighInitialPositionX = -5.0 * this.constWorldScale;
	this.constSleighInitialPositionY = (this.constSleighMinPositionY + this.constSleighMaxPositionY) / 2.0;	

	// House row construction positioning constants
	this.constHouseRowCount = 1;
	this.constModelHouseBaseLine = -7.70 * this.constWorldScale;
	this.constInterHouseSpacing = 0.35 * this.constWorldScale;
	this.constHouseRowOuterExtentCoordX = 13.0 * this.constWorldScale;
	this.constInterHouseRowSpacingZ = 0.96 * this.constWorldScale;
	this.constInterHouseRowSpacingY = 1.3 * this.constWorldScale;
	
	// Minimum / maximum gift box velocities, expressed in
	// meters / millisecond
	this.minGiftBoxInitialVelocityX = 3.0 / Constants.millisecondsPerSecond * this.constWorldScale;
	this.maxGiftBoxInitialVelocityX = 16.0 / Constants.millisecondsPerSecond * this.constWorldScale;
	
	// Gift box origination (e.g. offset from source when fired) and positioning
	// extents
	this.giftBoxOriginationMarginX = 0.7 * this.constWorldScale;
	this.constMaxGiftBoxPositionY = 8.0 * this.constWorldScale;	
	this.constMinGiftBoxPositionY = -8.0 * this.constWorldScale;
	this.constMaxGiftBoxPositionX = 8.0 * this.constWorldScale;
	this.constMinGiftBoxPositionX = -8.0 * this.constWorldScale;
	
	// Enemy grinch positioning extents
	this.constMinEnemyGrinchPositionY = this.constSleighMinPositionY;
	this.constMaxEnemyGrinchPositionY = this.constSleighMaxPositionY;
	this.constModelEnemyGrinchMinPositionX = -8.0 * this.constWorldScale;
	this.constModelEnemyGrinchMaxPositionX = 8.0 * this.constWorldScale;
	
	// Range of time intervals at which antagonistic grinch instances
	// will be generated (randomized)
	this.constMinEnemyGrinchGenerationIntervalMs = 400.0;
	this.constMaxEnemyGrinchGenerationIntervalMs = 1950.0;
	
	// Minimum / maximum antagonistic Grinch object velocities,
	// expressed in meters / millisecond
	this.minEnemyGrinchVelocityX = 3.0 / Constants.millisecondsPerSecond * this.constWorldScale;
	this.maxEnemyGrinchVelocityX = 12.0 / Constants.millisecondsPerSecond * this.constWorldScale;

	// Time of the last antagonistic model generation.
	this.lastEnemyGenerationTimeMs = 0.0;
	// Delay before the first antagonistic model is generated.
	this.initialEnemyGenerationDelayTimeMs = 7000;
	
	this.currentEnemyGrinchGenerationIntervalMs = 0.0;

	// Amount by which the game score increases when an enemy
	// has been destroyed by a package projectile
	this.constGameScoreValueIncreaseOnEnemyDestruction = 50;
	
	// Amount by which the game score increases when a package
	// has been delivered
	this.constGameScoreValueIncreaseOnPackageDelivery = 1000;
	
	// Amount by which the game score increases every second
	// while the holiday spirit gauge has not been depleted
	this.constGameScoreValueIncreaseRatePerSecond = 5;
	
	// Minimum / maximum values of holiday spirit gauge
	this.constMinHolidaySpiritValue = 0;
	this.constMaxHolidaySpiritValue = 1000;
	
	// Rate at which holiday spirit decreases per millisecond
	this.constHolidaySpiritValueDecreaseRatePerMs = 23 / Constants.millisecondsPerSecond;
	
	// Amount that the holiday spirit gauge increases when a gift
	// has been delivered
	this.constHolidaySpiritValueIncreaseOnPackageDelivery = 50;
	
	// Amount that the holiday spirit gauge increases when an
	// enemy has been destroyed
	this.constHolidaySpiritValueIncreaseOnEnemyDestruction = 8;
	
	// Amount that the holiday spirit gauge decreases when the sleigh
	// makes contact with an enemy
	this.constHolidaySpiritValueDecreaseOnEnemyContact = 350;
	
	// Interval, in milliseconds, at which overlay textures will
	// be updated (updates may involve updating textures, which
	// can be a relatively slow process).
	this.constOverlayUpdateIntervalMs = 400;
	
	// Ensure that an initial update is performed.
	this.currentOverlayUpdateElapsedInterval = this.constOverlayUpdateIntervalMs;
	
	// Current game score
	this.gameScore = 0;
	
	// Current value of The Holiday Spirit (game ends when this value reaches zero)
	this.holidaySpiritValue = this.constMaxHolidaySpiritValue;
	
	// Number of times the game score has increased due to
	// continuous play time
	this.timeBasedScoreIncreaseCount = 0;
	
	// Left margin of the score/gauge overlay text
	this.constOverlayTextLeftMargin = 15;
	
	// Will be true when the "Game Over" screen content has
	// been rendered
	this.gameEndOverlayContentHasBeenGenerated = false;
	
	// Last time of a package launch, in absolute game time
	this.lastPackageLaunchTimeMs = 0;
	
	// Maximum number of packages that can be present at once /
	// minimum interval between package launches (controls
	// package density in order to prevent game logic
	// exploitation)
	this.constMaxSimultaneousPackages = 4;
	this.constPackageLaunchIntervalMs = 400;
	
	// Determines if the launch input command (e.g. keypress) has
	// been relaxed/released. This verification prevents continuous
	// input application from continuously generating package
	// launch commands.
	this.launchInputRelaxedSinceInitialLaunch = true;
	
	// Background color for the text section.
	this.defaultTextAreaBackgroundColor =  new RgbColor(
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,
		Constants.defaultTextBackgroundUnitIntensity,		
		Constants.defaultTextBackgroundUnitAlpha);
		
	// Background color for the "game over" overlay
	this.gameEndOverlayBackgroundColor = new RgbColor(0.0, 0.0, 0.0, 0.8);
		
	// Color used to clear the WebGL canvas
	this.constCanvasClearColor = new RgbColor(0.0, 0.0, 0.0, 0.0);
	
	// Canvas used to render the score/score label
	this.scoreTextCanvasBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
		Constants.labelFont, Constants.labelFontStyle);
	
	// Canvas used to render the Holiday Spirit gauge / holiday spirit label
	this.holidaySpiritLabelCanvasBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
		Constants.labelFont, Constants.labelFontStyle);
	this.holidaySpiritLabelCanvasBuffer.updateStaticTextString(Constants.stringHolidaySpiritLabel);
	

	var canvasContext = globalResources.getMainCanvasContext();

	var vertexShaderStandardPositionTransformSource = globalResources.getLoadedResourceDataByKey(globalResources.vertexShaderStandardPositionKey)
	var fragmentShaderGouraud = globalResources.getLoadedResourceDataByKey(globalResources.fragmentShaderGouraudKey);
	var fragmentShaderStandardTexture = globalResources.getLoadedResourceDataByKey(globalResources.fragmentShaderStandardTextureKey);
	this.standardObjectShader = createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderGouraud.resourceDataStore);
	this.standardOverlayTextureRenderShader = createShaderProgram(canvasContext, vertexShaderStandardPositionTransformSource.resourceDataStore, fragmentShaderStandardTexture.resourceDataStore);
			
	var webGlCanvasContext = globalResources.getMainCanvasContext();
	webGlCanvasContext.clearColor(this.constCanvasClearColor.getRedValue(), this.constCanvasClearColor.getGreenValue(),
		this.constCanvasClearColor.getBlueValue(), this.constCanvasClearColor.getAlphaValue())

	// Enable alpha blending.
	webGlCanvasContext.enable(webGlCanvasContext.BLEND);
	webGlCanvasContext.blendFunc(webGlCanvasContext.SRC_ALPHA, webGlCanvasContext.ONE_MINUS_SRC_ALPHA);
	
	// Load all house models.
	this.prepareRenderDataForHouseModels();
	// Load the "gift box" projectile model.
	this.prepareRenderDataForPackageModel();
	// Load the antagonistic Grinch model.
	this.prepareRenderDataForGrinchModel();
	
	// Prepare all overlay/backdrop textures.
	this.prepareRenderDataForBackdrop()
	this.prepareRenderDataForScoreOverlay();
	this.prepareRenderDataForGaugeOverlay();
	this.prepareRenderDataForFullScreenOverlay();

	// Build the initial set of house rows (the house rows will be
	// updated dynamically as houses are removed from the active
	// world view area during scrolling).
	this.buildHouseRows();
	
	this.sleighInstance = this.createSleighInstance();
	
	this.setupInputEventHandler();
	
	this.updateGameScoreText();
}

/**
 * Initializes game input bindings
 */
MainPackageDropperGameplayScene.prototype.setupInputEventHandler = function () {	
	// Bind the keyboard input events...
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowUp,	
		this, this.handleInputForVerticalMovementUp);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowDown,	
		this, this.handleInputForVerticalMovementDown);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowLeft,	
		this, this.handleInputForHorizontalMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierArrowRight,	
		this, this.handleInputForHorizontalMovementRight);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.keyboardInputEventReceiver,
		this.keyboardInputEventReceiver.constKeySpecifierSpace,	
		this, this.handleInputForPackageProjectileLaunch);
		
	// Bind the device orientation input events (mobile devices, etc.)
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceMotionInputEventReceiver,
		this.deviceMotionInputEventReceiver.constRotationInputSpecifierUp,
		this, this.handleInputForVerticalMovementUp);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceMotionInputEventReceiver,
		this.deviceMotionInputEventReceiver.constRotationInputSpecifierDown,
		this, this.handleInputForVerticalMovementDown);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceMotionInputEventReceiver,
		this.deviceMotionInputEventReceiver.constRotationInputSpecifierLeft,
		this, this.handleInputForHorizontalMovementLeft);
		
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceMotionInputEventReceiver,
		this.deviceMotionInputEventReceiver.constRotationInputSpecifierRight,
		this, this.handleInputForHorizontalMovementRight);
		
	// Bind the device touch input event (mobile devices, etc.)
	this.inputEventInterpreter.bindInputEventToFunction(this.deviceTouchInputEventReceiver,
		this.deviceTouchInputEventReceiver.constTouchInputSpecifier,
		this, this.handleInputForPackageProjectileLaunch);
}

/**
 * Generates vertex data to be used as a data source for rendering setup, using a specified
 *  OBJ-formatted buffer
 *
 * @param modelDataKey {String} Key that is employed to reference the raw OBJ-formatted
 *                              buffer within the resource key-value store
 * @param additionaTargetPoints {Array} Optional array of Point3d objects to be processed
 *                                      (scaled/translated/etc., in accordance with other
 *                                      point transformation)
 * @param targetPointsResultStore {Array} Optional array that will receive the processed
 *                                        set of points (additionaTargetPoints must be
 *                                        valid)
 *
 * @return {AggregateWebGlVertexData} Object that contains a collection of vertex data,
 *                                    derived from the OBJ-formatted buffer, that
 *                                    can be directly buffered by WebGL
 */
MainPackageDropperGameplayScene.prototype.generateModelVertexDataFromKeyedObjBuffer = function(modelDataKey, additionalTargetPoints,
																							   targetPointsResultStore) {
	var vertexDataContainer = null;
	
	if (validateVar(modelDataKey)) {
		// Parse the raw OBJ-formatted geometry description buffer...
		var objBufferSource = globalResources.getLoadedResourceDataByKey(modelDataKey);
		var objBufferParser = new ObjFormatBufferParser(objBufferSource.resourceDataStore);
		// Use a vertex processor object in order to scale the parsed object vertices
		// appropriately.
		objBufferParser.vertexDefinitionProcessor = new ObjVertexDefProcessorObjectBoundsNormalizer();
		objBufferParser.vertexDefinitionProcessor.unitScalingFactor = this.constModelInitializationScaleFactors[modelDataKey];
		objBufferParser.initiateParsing();
		
		if (validateVar(additionalTargetPoints) && validateVar(targetPointsResultStore)) {
			// Process any associated points that were not explicitly defined within the OBJ-formatted buffer.
			this.processAdditionalAssociatedModelPoints(objBufferParser.vertexDefinitionProcessor,
				additionalTargetPoints, targetPointsResultStore);
		}
		
		var objParserPrimitivesAdapter = new ObjParserPrimitivesAdapter(objBufferParser)
	
		// Create a collection of triangles from the parsed buffer
		// data...
		if (objParserPrimitivesAdapter.initiateGeometryExtraction()) {
			// Generate vertex data that can be used to create WebGl buffers.
			vertexDataContainer = new ModelVertexDataContainer();
			vertexDataContainer.aggregateVertexData = generateAggregateVertexDataFromTriangleList(objParserPrimitivesAdapter.triangleData);
			vertexDataContainer.modelDimensionX = objBufferParser.vertexDefinitionProcessor.getCurrentScaledModelDimensionX();
			vertexDataContainer.modelDimensionY = objBufferParser.vertexDefinitionProcessor.getCurrentScaledModelDimensionY();
			vertexDataContainer.modelDimensionZ = objBufferParser.vertexDefinitionProcessor.getCurrentScaledModelDimensionZ();
		}
	}
	
	return vertexDataContainer;
}

/**
 * Applies post-processing to points that are associated with model data, but not
 *  explicitly included in the model buffer
 *
 * @param vertexDefinitionProcessor Object that is used to perform post processing on vertices
 *                                  (must implement preProcessVertexDefinition(...) /
 *                                  postProcessVertexDefinition(...)
 * @param additionaModelPoints {Array} Array of Point3d objects on which post processing will be applied
 * @param additionalModelPoints {Array} Array into which the post-processed points will be stored
 *
 */
MainPackageDropperGameplayScene.prototype.processAdditionalAssociatedModelPoints = function(vertexDefinitionProcessor,
																							additionalModelPoints,
																							additionalModelPointsStore) {
																							
	if (validateVarAgainstType(vertexDefinitionProcessor, ObjVertexDefProcessorObjectBoundsNormalizer) &&
		validateVar(additionalModelPoints) && validateVar(additionalModelPointsStore)) {
			
		for (var currentPointIndex = 0; currentPointIndex < additionalModelPoints.length; currentPointIndex++) {
			additionalModelPointsStore.push(vertexDefinitionProcessor.applyPostProcessingToPoint3d(
				additionalModelPoints[currentPointIndex]));
		}
	}
}

/**
 * Creates a collection of buffers allocated and filled by WebGL (vertex buffers,
 *  color buffers, etc.), using parallel collection of scalar values as the data
 *  to fill the buffers
 *
 * @param modelVertexData {ModelVertexDataContainer} Object which contains a collection
 *                                                   of vertex data (and associated data
 *                                                   that is applicable usage context of the
 *                                                   vertex data) that can be directly
 *                                                   buffered by WebGL
 *
 * @return {WebGlBufferData} Object which contains a collection of WebGL buffers
 */
MainPackageDropperGameplayScene.prototype.createWebGlBufferDataFromModelVertexData = function(modelVertexData) {
	
	var webGlBufferData = null;
	
	// Convert the model vertex data into buffers that can be directly used for
	// WebGL rendering.
	if (validateVarAgainstType(modelVertexData, ModelVertexDataContainer)) {
		webGlBufferData = new WebGlBufferData();
		webGlBufferData.objectWebGlVertexBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
			modelVertexData.aggregateVertexData.vertices);
		webGlBufferData.objectWebGlColorBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
			modelVertexData.aggregateVertexData.vertexColors);
		webGlBufferData.objectWebGlTexCoordBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
			modelVertexData.aggregateVertexData.vertexTextureCoords);
		webGlBufferData.objectWebGlNormalBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
			modelVertexData.aggregateVertexData.vertexNormals);
		webGlBufferData.vertexCount = modelVertexData.aggregateVertexData.vertices.length / this.constVertexSize;
	}
	
	return webGlBufferData;
}

/**
 * Allocates a WebGL buffer, and stores the specified coordinate data
 *  within the buffer
 *  
 * @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                   to a WebGL display buffer
 * @param sourceData {Float32Array} Array of coordinate data to be buffered for use by
 *                                  WebGL
 * @return {WebGLBuffer} A WebGL buffer containing the provided data
 */
MainPackageDropperGameplayScene.prototype.createWebGlBufferFromData = function(webGlCanvasContext, sourceData) {
	var targetBuffer = webGlCanvasContext.createBuffer();
	
	webGlCanvasContext.bindBuffer(webGlCanvasContext.ARRAY_BUFFER, targetBuffer);
	webGlCanvasContext.bufferData(webGlCanvasContext.ARRAY_BUFFER, sourceData, webGlCanvasContext.STATIC_DRAW);
	
	return targetBuffer;
}

/**
 * Creates a data container purposed for facilitating rendering
 *
 * @param webGlBufferData {WebGLBufferData} A collection of WebGL-allocated
 *                                          buffers
 * @param webGlShader {WebGLShader} A WebGL shader program
 *
 * @return {ObjectRenderWebGlData} A set of buffers that are allocated by WebGL, to
 *                                be used for rendering
 * @see MainPackageDropperGameplayScene.renderGeometry
 */
MainPackageDropperGameplayScene.prototype.objectRenderWebGlDataFromWebGlBufferData = function(webGlBufferData, webGlShader) {
	var objRenderWeblGlData = null;
	
	if (validateVarAgainstType(webGlBufferData, WebGlBufferData)) {
		objRenderWeblGlData = new ObjectRenderWebGlData(
			webGlShader,
			webGlBufferData.objectWebGlVertexBuffer,
			webGlBufferData.objectWebGlColorBuffer,
			webGlBufferData.objectWebGlTexCoordBuffer,
			webGlBufferData.objectWebGlNormalBuffer,
			webGlBufferData.vertexCount);
	}
			
	return objRenderWeblGlData;
}

/**
 * Creates WebGL buffers for all loaded house models, ensuring that data
 *  can be immediately rendered
 */
MainPackageDropperGameplayScene.prototype.prepareRenderDataForHouseModels = function() {
	
	for (var currentHouseModelKeyIndex = 0; currentHouseModelKeyIndex < this.modelHouseResourceKeyList.length;
		currentHouseModelKeyIndex++) {
			
		var houseResourceKey = this.modelHouseResourceKeyList[currentHouseModelKeyIndex];
		var modelVertexData = this.generateModelVertexDataFromKeyedObjBuffer(houseResourceKey,
			this.modelHousePreScaledChimneyTopCenterLocii[houseResourceKey], this.modelHouseScaledChimneyLocii[houseResourceKey]);
		if (validateVarAgainstType(modelVertexData, ModelVertexDataContainer)) {
			this.modelHouseWebGlBufferKeyValueStore[houseResourceKey] =
				this.createWebGlBufferDataFromModelVertexData(modelVertexData);
			this.modelHouseReferenceDataKeyValueStore[houseResourceKey] = 
				new HouseReferenceData();
			this.modelHouseReferenceDataKeyValueStore[houseResourceKey].houseDimensions =
				new ObjectDimensionData(modelVertexData.modelDimensionX,
				modelVertexData.modelDimensionY, modelVertexData.modelDimensionZ);
		}
	}
}

/**
 * Creates WebGL buffers for the package model, ensuring that data
 *  can be immediately rendered
 */
MainPackageDropperGameplayScene.prototype.prepareRenderDataForPackageModel = function() {
	var modelVertexData = this.generateModelVertexDataFromKeyedObjBuffer(globalResources.modelProjectileGiftBoxKey);
	if (validateVarAgainstType(modelVertexData, ModelVertexDataContainer)) {
		this.modelGiftBoxWebGlBuffer = this.createWebGlBufferDataFromModelVertexData(modelVertexData);
		
		this.modelGiftBoxReferenceDimensionData = new ObjectDimensionData(modelVertexData.modelDimensionX,
			modelVertexData.modelDimensionY, modelVertexData.modelDimensionZ);
	}	
}

/**
 * Creates WebGL buffers for the grinch model, ensuring that data
 *  can be immediately rendered
 */
MainPackageDropperGameplayScene.prototype.prepareRenderDataForGrinchModel = function() {
	var modelVertexData = this.generateModelVertexDataFromKeyedObjBuffer(globalResources.modelEnemyGrinchKey);
	if (validateVarAgainstType(modelVertexData, ModelVertexDataContainer)) {
		this.modelEnemyGrinchWebGlBuffer = this.createWebGlBufferDataFromModelVertexData(modelVertexData);
		
		this.modelEnemyGrinchReferenceDimensionData = new ObjectDimensionData(modelVertexData.modelDimensionX,
			modelVertexData.modelDimensionY, modelVertexData.modelDimensionZ);
	}
}

/**
 * Creates WebGL buffers for the backdrop quad, ensuring that data
 *  can be immediately rendered
 */
MainPackageDropperGameplayScene.prototype.prepareRenderDataForBackdrop = function() {	
	var webGlBufferData = new WebGlBufferData();
	
	webGlBufferData.objectWebGlVertexBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.backdropVertices);
	webGlBufferData.objectWebGlTexCoordBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.overlayTextureCoords);
		
	webGlBufferData.vertexCount = this.backdropVertices.length / this.constVectorSize;
	
	this.backdropRenderWebGlData = webGlBufferData;
}

/**
 * Creates WebGL buffers for the score overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainPackageDropperGameplayScene.prototype.prepareRenderDataForScoreOverlay = function() {
	var webGlBufferData = new WebGlBufferData();
	
	webGlBufferData.objectWebGlVertexBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.scoreOverlayVertices);
	webGlBufferData.objectWebGlTexCoordBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.overlayTextureCoords);

	webGlBufferData.vertexCount = this.scoreOverlayVertices.length / this.constVertexSize;

	this.scoreOverlayRenderWebGlData = webGlBufferData; 
}

/**
 * Creates WebGL buffers for the gauge overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainPackageDropperGameplayScene.prototype.prepareRenderDataForGaugeOverlay = function() {
	var webGlBufferData = new WebGlBufferData();
	
	webGlBufferData.objectWebGlVertexBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.gaugeOverlayVertices);
	webGlBufferData.objectWebGlTexCoordBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.overlayTextureCoords);

	webGlBufferData.vertexCount = this.gaugeOverlayVertices.length / this.constVertexSize;	
	
	this.gaugeOverlayRenderWebGlData = webGlBufferData;
}

/**
 * Creates WebGL buffers for the full-screen overlay quad, ensuring that data
 *  can be immediately rendered
 */
MainPackageDropperGameplayScene.prototype.prepareRenderDataForFullScreenOverlay = function() {
	var webGlBufferData = new WebGlBufferData();	
		
	webGlBufferData.objectWebGlVertexBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.fullScreenOverlayVertices);
	webGlBufferData.objectWebGlTexCoordBuffer = this.createWebGlBufferFromData(globalResources.getMainCanvasContext(),
		this.overlayTextureCoords);
		
	webGlBufferData.vertexCount = this.fullScreenOverlayVertices.length / this.constVertexSize;
	
	this.fullScreenOverlayWebGlData = webGlBufferData;
}

/**
 * Creates/initializes render data for the sleigh instance, in addition to initializing the
 *  data structure(s) required to maintain the sleigh state within the game
 *
 * @return {SleighInstanceData} Data used to render/maintain the state of the
 *                              sleigh instance within the game
 */
MainPackageDropperGameplayScene.prototype.createSleighInstance = function() {
	var sleighInstance = null;
	
	var sleighVertexData = this.generateModelVertexDataFromKeyedObjBuffer(globalResources.modelPrimarySleigh);
	if (validateVarAgainstType(sleighVertexData, ModelVertexDataContainer)) {
		sleighInstance = new SleighInstanceData();
		
		sleighInstance.objectWebGlBufferData = this.createWebGlBufferDataFromModelVertexData(sleighVertexData);
		sleighInstance.objectWorldSpacePosition = new Point3d(this.constSleighInitialPositionX,
			this.constSleighInitialPositionY, 0.0);
		sleighInstance.objectVelocity = new Vector3d(0.0, 0.0, 0.0);
		sleighInstance.objectDimensions = new ObjectDimensionData(sleighVertexData.modelDimensionX,
			sleighVertexData.modelDimensionY, sleighVertexData.modelDimensionZ);
	}
	
	return sleighInstance;
}

/**
 * Creates/initializes data structures required to maintain the state of single giftbox instance
 *
 * @param giftBoxPosition {Point3d} Starting position of the giftbox
 * @param giftBoxVelocityVector {Vector3d} Initial velocity of the giftbox
 *
 * @return {GiftBoxInstanceData} Data used to maintain the state of a giftbox instance
 *                               within the game
 */
MainPackageDropperGameplayScene.prototype.createGiftBoxInstance = function(giftBoxPosition, giftBoxVelocityVector) {
	var giftBoxInstanceData = null;
	
	if (validateVarAgainstType(giftBoxPosition, Point3d) && validateVarAgainstType(giftBoxVelocityVector, Vector3d)) {
		giftBoxInstanceData = new GiftBoxInstanceData();
		giftBoxInstanceData.objectWebGlBufferData = this.modelGiftBoxWebGlBuffer;
		giftBoxInstanceData.objectWorldSpacePosition = giftBoxPosition;
		giftBoxInstanceData.objectVelocity = giftBoxVelocityVector;		
		giftBoxInstanceData.objectDimensions = this.modelGiftBoxReferenceDimensionData;
	}
	
	return giftBoxInstanceData
}

/**
 * Creates/initializes data structures required to maintain the state of a single house instance
 *
 * @param coordX {Number} The X coordinate at which the house instance should be initially situated
 *                        uses the house center point as an offset
 * @param baseLineCoordY {Number} The location of the house baseline along the Y-axis
 * @param baseLineCoordZ {Number} The location of the house baseline along the Z-axis
 *
 * @return {HouseInstanceData} Data used to maintain the state of a single house instance
 */
MainPackageDropperGameplayScene.prototype.createRandomHouseInstance = function(coordX, baseLineCoordY, baseLineCoordZ) {
	var houseInstanceData = null;
	
	if (validateVar(coordX) && validateVar(baseLineCoordY) && validateVar(baseLineCoordZ)) {
		var houseKeyIndex = Math.round(getRangedRandomValue(0, this.modelHouseResourceKeyList.length - 1));
		var houseKey = this.modelHouseResourceKeyList[houseKeyIndex];
		
		houseInstanceData = this.createHouseInstance(coordX, baseLineCoordY, baseLineCoordZ, houseKey);
	}
	
	return houseInstanceData;
}

/**
 * Creates data structures that represent a single house instance
 *
 * @param coordX {Number} The X coordinate at which the house instance should be initially situated
 *                        uses the house center point as an offset

 * @param houseDataKey {String} Key used to reference the source house data in the 
 *
 * @return {HouseInstanceData} Data used to maintain the state of a single house instance
 */
 MainPackageDropperGameplayScene.prototype.createHouseInstance = function(coordX, baseLineCoordY, baseLineCoordZ, houseDataKey) {
	var houseInstanceData = null;

	if (validateVar(coordX) && validateVar(baseLineCoordY) && validateVar(baseLineCoordZ) &&
		validateVar(houseDataKey)) {
	
		houseInstanceData = new HouseInstanceData();
		var houseModelReferenceData = this.modelHouseReferenceDataKeyValueStore[houseDataKey]	
		var coordY = baseLineCoordY + (houseModelReferenceData.houseDimensions.objectDimensionY / 2.0)
		
		houseInstanceData.objectWebGlBufferData = this.modelHouseWebGlBufferKeyValueStore[houseDataKey];
		houseInstanceData.objectWorldSpacePosition = new Point3d(coordX, coordY, baseLineCoordZ);
		
		houseInstanceData.chimneyLocii = this.modelHouseScaledChimneyLocii[houseDataKey];
		
		houseInstanceData.objectDimensions = houseModelReferenceData.houseDimensions;
		
		houseInstanceData.objectRotationRadX = 0.0;
		houseInstanceData.objectRotationRadY = 0.0;
		houseInstanceData.objectRotationRadZ = 0.0;
	}	
	 
	return houseInstanceData;
 }

/**
 * Constructs data structures which represent a single, continuous row of houses
 *
 *
 * @param outerExtentOffsetX {Number} The outer margins, relative to the unit-renderspace
 *                                    boundaries along the X-axis, outside which house model
 *                                    data should not be rendered
 * @param baseLineCoordY {Number} The location of the house baseline along the Y-axis
 * @param baseLineCoordZ {Number} The location of the house baseline along the Z-axis
 *
 * @return {HouseRowContainer} A data structure that represents a single, continuous
 *                             row of houses
 */
MainPackageDropperGameplayScene.prototype.buildHouseRow = function(outerExtentCoordX, baseLineCoordY, baseLineCoordZ) {
	var houseRowContainer = new HouseRowContainer();
	
	houseRowContainer.rowLeftBoundaryCoordX = -outerExtentCoordX;
	houseRowContainer.rowRightStartingCoordX = outerExtentCoordX;
	houseRowContainer.houseBaseLineCoordY = baseLineCoordY;
	houseRowContainer.houseBaseLineCoordZ = baseLineCoordZ;

	var currentHouseCoordX = houseRowContainer.rowRightStartingCoordX;
	while (currentHouseCoordX > houseRowContainer.rowLeftBoundaryCoordX) {
		var houseInstance = this.createRandomHouseInstance(currentHouseCoordX, baseLineCoordY, baseLineCoordZ);
		if (houseRowContainer.houseInstanceCollection.length > 0) {
			houseInstance.objectWorldSpacePosition.xCoord -=
				(houseInstance.objectDimensions.objectDimensionX / 2.0);
			currentHouseCoordX = houseInstance.objectWorldSpacePosition.coordX;
		}
		houseRowContainer.houseInstanceCollection.push(houseInstance);
	
		currentHouseCoordX -= ((houseInstance.objectDimensions.objectDimensionX / 2.0) +
			this.constInterHouseSpacing);
	}

	return houseRowContainer;
}

/**
 * Constructs all collections of house rows (each house instance is
 *  randomly selected from a houses contained within the resource)
 */
MainPackageDropperGameplayScene.prototype.buildHouseRows = function() {
	var baseLineCoordZ = 0.0;
	var baseLineCoordY = this.constModelHouseBaseLine;	
	for (var currentHouseRowIndex = 0; currentHouseRowIndex < this.constHouseRowCount; currentHouseRowIndex++) {
		var currentHouseRow = this.buildHouseRow(this.constHouseRowOuterExtentCoordX, baseLineCoordY, baseLineCoordZ);
		this.houseRowContainerCollection.push(currentHouseRow);
		baseLineCoordY += this.constInterHouseRowSpacingY;
		baseLineCoordZ += this.constInterHouseRowSpacingZ;
	}
}

/**
 * Updates the states (e.g. position, lifepsan management) of all house instances,
 *  within a particular house row, based upon time, immediate position, etc.
 */
MainPackageDropperGameplayScene.prototype.updateStateForIndexedHouseRow = function(rowIndex, timeQuantum) {
	if (validateVar(rowIndex) && validateVar(timeQuantum)) {
		for (currentHouseIndex = (this.houseRowContainerCollection[rowIndex].houseInstanceCollection.length - 1);
			currentHouseIndex >= 0; currentHouseIndex--) {
				
			var newHousePositionX = this.houseRowContainerCollection[rowIndex].houseInstanceCollection[currentHouseIndex].objectWorldSpacePosition.xCoord -		
				this.currentProgressRateMetersPerMs * timeQuantum;
			if (newHousePositionX > -this.constHouseRowOuterExtentCoordX) {
				this.houseRowContainerCollection[rowIndex].houseInstanceCollection[currentHouseIndex].objectWorldSpacePosition.xCoord = newHousePositionX;				
			}
			else {
				this.houseRowContainerCollection[rowIndex].houseInstanceCollection.splice(currentHouseIndex, 1);
			}
		}
		
		var rightMostHouseRightSideCoord = -1.0;		
		do {
			var rightMostHouseInstance = this.getRightMostHouseInstance(rowIndex);
			if (rightMostHouseInstance != null) {
				rightMostHouseRightSideCoord = (rightMostHouseInstance.objectWorldSpacePosition.xCoord +
					rightMostHouseInstance.objectDimensions.objectDimensionX / 2.0);
				if (rightMostHouseRightSideCoord < this.constHouseRowOuterExtentCoordX) {
					var newHouseCoordX = (rightMostHouseRightSideCoord + this.constInterHouseSpacing);
					var newHouseInstance = this.createRandomHouseInstance(newHouseCoordX,
						this.houseRowContainerCollection[rowIndex].houseBaseLineCoordY,
						this.houseRowContainerCollection[rowIndex].houseBaseLineCoordZ);
					newHouseInstance.objectWorldSpacePosition.xCoord += newHouseInstance.objectDimensions.objectDimensionX / 2.0;
					this.houseRowContainerCollection[rowIndex].houseInstanceCollection.push(newHouseInstance);					
				}
			}				
		}
		while (rightMostHouseRightSideCoord < this.constHouseRowOuterExtentCoordX);
	}
}

/**
 * Retrieves the house instance that is considered to be the rightmost
 *  house instance within a row of houses
 *
 * @param rowIndex {Number} The index of the row for which the right most house instance
 *                          should be retrieved
 *
 * @return {HouseInstanceData} The house instance with the boundaries that extend
 *                             the furthest in the positive direction along the X-axis
 *                             upon success, null otherwise
 */
MainPackageDropperGameplayScene.prototype.getRightMostHouseInstance = function(rowIndex) {
	var rightMostInstance = null;
	
	var rightMostBoundaryEdgeValue = -1.0;
	if (validateVar(rowIndex) && (rowIndex < this.houseRowContainerCollection.length)) {
		for (var currentHouseIndex = 0; currentHouseIndex < this.houseRowContainerCollection[rowIndex].houseInstanceCollection.length;
			currentHouseIndex++) {
				
			var currentHouseInstance = this.houseRowContainerCollection[rowIndex].houseInstanceCollection[currentHouseIndex];
			var houseRightMostEdge = (currentHouseInstance.objectWorldSpacePosition.xCoord +
				(currentHouseInstance.objectDimensions.objectDimensionX / 2.0))
			if (houseRightMostEdge > rightMostBoundaryEdgeValue) {
				rightMostInstance = currentHouseInstance;
				rightMostBoundaryEdgeValue = houseRightMostEdge;
			}
		}
	}
	
	return rightMostInstance;
}

/** 
 * Updates the states (e.g. position, lifepsan management) of all house instances,
 *  based upon time, immediate position, etc.
 */
MainPackageDropperGameplayScene.prototype.updateStateInformationForHouseRowCollection = function(timeQuantum) {
	if (validateVar(timeQuantum)) {
		for (var currentHouseRowIndex = 0; currentHouseRowIndex < this.houseRowContainerCollection.length;
			currentHouseRowIndex++) {
				
			this.updateStateForIndexedHouseRow(currentHouseRowIndex, timeQuantum);
		}
	}
}

/**
 * Constrains a value to a particular, positive magnitude
 *
 * @param targetMagnitude {Number} The value to be constrainted
 * @param maxMagnitude {Number} The value used to constrain the target magnitude
 *
 * Return {Number} The constrainted magnitude value
 */
MainPackageDropperGameplayScene.prototype.clampToAbsoluteMagnitude = function(targetMagnitude, maxMagnitude) {
	var clampedValue = targetMagnitude;
	
	if (Math.abs(targetMagnitude) > Math.abs(maxMagnitude)) {
		var multiplier = (targetMagnitude >= 0.0) ? 1.0 : -1.0;		
		targetMagnitude = multiplier * maxMagnitude;		
	}
	
	return targetMagnitude;
}

/**
 * Constrains the immediate sleigh velocity to a pre-determined maximum velocity (per-component),
 *  as necessary
 *
 */
MainPackageDropperGameplayScene.prototype.updateSleighVelocityForSpeedConstraint = function() {
	var sleighVelocityX = this.clampToAbsoluteMagnitude(this.sleighInstance.objectVelocity.getXComponent(),
		this.constSleighMaxVelocityComponent);
	var sleighVelocityY = this.clampToAbsoluteMagnitude(this.sleighInstance.objectVelocity.getYComponent(),
		this.constSleighMaxVelocityComponent);
	var sleighVelocityZ = this.clampToAbsoluteMagnitude(this.sleighInstance.objectVelocity.getZComponent(),
		this.constSleighMaxVelocityComponent);

	this.sleighInstance.objectVelocity = new Vector3d(sleighVelocityX, sleighVelocityY, sleighVelocityZ);
}

/**
 * Applies a deceleration factor to the sleigh velocity
 *
 * @param velocity {Number} Immediate sleigh velocity (meters / millisecond)
 * @param decelerationFactor {Number} Sleigh deceleration magnitude (meters / millisecond²)
 * @param timeQuantum {Number} Elapsed time quantum (milliseconds)
 *
 * @return {Number} Velocity value, dampened with respect to the provided time
 *                  quantum/deceleration factor
 */
MainPackageDropperGameplayScene.prototype.dampenVelocityWithDecelerationFactor = function(
	velocity, decelerationFactor, timeQuantum) {
		
	var adjustedVelocity = 0.0;
		
	var velocityAdjustmentMagnitude = Math.abs(decelerationFactor) * timeQuantum;
	adjustedVelocity = Math.abs(velocity) - velocityAdjustmentMagnitude;
	if (adjustedVelocity < 0.0) {
		adjustedVelocity = 0.0;
	}
	else {
		adjustedVelocity = adjustedVelocity * ((velocity > 0.0) ? 1.0 : -1.0);
	}

	return adjustedVelocity;
}

/**
 * Applies a deceleration factor a three-dimensional vector (per-component)
 *
 * @param velocityVector Vector representing a velocity (meters / millisecond)
 * @param decelerationFactor Deceleration factor (meters / millisecond²)
 * @param referenceThrustVector Reference thrust vector - deceleration will
 *                              not be appplied to a velocity vector component
 *                              thrust is being generated on the corresponding
 *                              thrust vector component
 * @param timeQuantum {Number} Elapsed time quantum (milliseconds)
 *
 * @return {Vector3d} Velocity vector, dampened with respect to the provided time
 *                  quantum/deceleration factor
 */
MainPackageDropperGameplayScene.prototype.dampenVelocityVectorWithPerAxisDecelerationFactor = function(
	velocityVector, decelerationFactor, referenceThrustVector, timeQuantum) {
		
	var newVelocityVector = new Vector3d(0.0, 0.0, 0.0);
		
	if (validateVar(velocityVector) && validateVar(decelerationFactor) &&
		validateVar(referenceThrustVector) && validateVar(timeQuantum)) {
		
		// Dampen the velocity along a particular axis if no thrust is being applied
		// along the axis.
		var velocityComponentX = velocityVector.getXComponent();
		var velocityComponentY = velocityVector.getYComponent();
		var velocityComponentZ = velocityVector.getZComponent();
		
		if (referenceThrustVector.getXComponent() === 0.0) {
			velocityComponentX = this.dampenVelocityWithDecelerationFactor(velocityVector.getXComponent(),
				decelerationFactor, timeQuantum);
		}

		if (referenceThrustVector.getYComponent() === 0.0) {
			velocityComponentY = this.dampenVelocityWithDecelerationFactor(velocityVector.getYComponent(),
				decelerationFactor, timeQuantum);
		}
		
		if (referenceThrustVector.getZComponent() === 0.0) {
			velocityComponentZ = this.dampenVelocityWithDecelerationFactor(velocityVector.getZComponent(),
				decelerationFactor, timeQuantum);
		}
		
		newVelocityVector = new Vector3d(velocityComponentX, velocityComponentY, velocityComponentZ);
	}
	
	return newVelocityVector
}

/**
 * Updates the position/velocity of the sleigh, based on the immediate
 *  velocity/decleration/etc.
 *
 * @param timeQuantum {Number} Elapsed time quantum (milliseconds)
 */
MainPackageDropperGameplayScene.prototype.updateStateInformationForSleigh = function(timeQuantum) {
	
	var sleighPositionX = this.sleighInstance.objectWorldSpacePosition.getX() +
		(this.sleighInstance.objectVelocity.getXComponent() * timeQuantum);
	var sleighPositionY = this.sleighInstance.objectWorldSpacePosition.getY() +
		(this.sleighInstance.objectVelocity.getYComponent() * timeQuantum);
	var sleighPositionZ = this.sleighInstance.objectWorldSpacePosition.getZ()+
		(this.sleighInstance.objectVelocity.getZComponent() * timeQuantum);
	
	sleighPositionX = Math.max(this.constSleighMinPositionX, sleighPositionX);
	sleighPositionX = Math.min(this.constSleighMaxPositionX, sleighPositionX);
	
	sleighPositionY = Math.max(this.constSleighMinPositionY, sleighPositionY);
	sleighPositionY = Math.min(this.constSleighMaxPositionY, sleighPositionY);
	
	this.sleighInstance.objectWorldSpacePosition = new Point3d(sleighPositionX, sleighPositionY, sleighPositionZ);
		
	var velocityChangeVector = this.sleighInstance.currentThrustFactorVector.multiplyByScalar(
		this.constSleighAccelerationRateMetersPerMsSq * timeQuantum);

	// Update the sleigh velocity, based on the current thrust being applied.
	this.sleighInstance.objectVelocity = this.sleighInstance.objectVelocity.addVector(velocityChangeVector);

	// The sleigh should cease acceleration when thrust is not being applied a long
	// a particular axis.
	this.sleighInstance.objectVelocity = this.dampenVelocityVectorWithPerAxisDecelerationFactor(
		this.sleighInstance.objectVelocity, this.constSleighAccelerationRateMetersPerMsSq,
		velocityChangeVector, timeQuantum);
	
	// Ensure that sleigh velocity does not exceed pre-determined, per-component limits...
	this.updateSleighVelocityForSpeedConstraint();
}

/**
 * Updates the game score, based on the total game operating time
 */
MainPackageDropperGameplayScene.prototype.updateInternalGameScoreForElapsedTime = function() {
	if (this.isInActiveGameplayState()) {
		if ((this.totalElapsedSceneTimeMs / Constants.millisecondsPerSecond) > this.timeBasedScoreIncreaseCount) {
			this.timeBasedScoreIncreaseCount++;
			this.gameScore += this.constGameScoreValueIncreaseRatePerSecond;
		}
	}
}

/**
 * Updates the position/velocity of all packages, based on the immediate
 *  velocity/decleration/etc
 *
 * @param timeQuantum {Number} Elapsed time quantum (milliseconds)
 */
MainPackageDropperGameplayScene.prototype.updateStateInformationForPackageCollection = function(timeQuantum) {
	for (var currentGiftBoxIndex = this.giftBoxInstanceDataCollection.length - 1; currentGiftBoxIndex >= 0; currentGiftBoxIndex--) {
		this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectRotationRadX += (this.constMaxPackageRotationRateRad * timeQuantum);
		this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectRotationRadY += (this.constMaxPackageRotationRateRad * timeQuantum);
		this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectRotationRadZ += (this.constMaxPackageRotationRateRad * timeQuantum);

		// Update the gift box position...
		this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectWorldSpacePosition.xCoord +=
			(this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectVelocity.xComponent * timeQuantum);
		this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectWorldSpacePosition.yCoord +=
			(this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectVelocity.yComponent * timeQuantum);
		this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectWorldSpacePosition.zCoord +=
			(this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectVelocity.zComponent * timeQuantum);
			
		// ...Update the gift box velocity.
		this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectVelocity.yComponent -=
			(this.constGravitationalAccelerationMetersPerMsSq * timeQuantum);
			
		if (this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectWorldSpacePosition.yCoord < this.constMinGiftBoxPositionY) {
			this.giftBoxInstanceDataCollection.splice(currentGiftBoxIndex, 1);
		}
	}
}

/**
 * Determines if an enemy grinch object should be created, based on the
 *  immediate game context (last grinch creation time, etc.)
 *
 * @return True if an enemy grinch should be created
 */
MainPackageDropperGameplayScene.prototype.shouldEnemyGrinchInstanceBeCreated = function() {
	var enemyGenerationIntervalHasElapsed = (this.totalElapsedSceneTimeMs - this.lastEnemyGenerationTimeMs) >
		this.currentEnemyGrinchGenerationIntervalMs;
	var initialEnemyGenerationDelayHasElapsed = (this.totalElapsedSceneTimeMs > this.initialEnemyGenerationDelayTimeMs);
	
	return (enemyGenerationIntervalHasElapsed && initialEnemyGenerationDelayHasElapsed);
}

/**
 * Creates a data structure required to maintain the state of a single enemy grinch
 *  instance
 *
 * @return {EnemyGrinchInstanceData} A data structure used to maintain the state of an enemy
 *                                   grinch instance
 */
MainPackageDropperGameplayScene.prototype.generateEnemyGrinchInstance = function() {
	var enemyGrinchInstance = new EnemyGrinchInstanceData();
	
	enemyGrinchInstance.objectWebGlBufferData = this.modelEnemyGrinchWebGlBuffer;
	
	// The enemy objects will be moving from right to left...
	var enemyGrinchVelocityX = -getRangedRandomValue(this.minEnemyGrinchVelocityX,
		this.maxEnemyGrinchVelocityX);
	enemyGrinchInstance.objectVelocity = new Vector3d(enemyGrinchVelocityX, 0.0, 0.0);
	
	var enemyGrinchPositionY = getRangedRandomValue(this.constMinEnemyGrinchPositionY,
		this.constMaxEnemyGrinchPositionY);
	enemyGrinchInstance.objectWorldSpacePosition = new Point3d(this.constModelEnemyGrinchMaxPositionX,
		enemyGrinchPositionY, 0.0);
		
	enemyGrinchInstance.objectDimensions = this.modelEnemyGrinchReferenceDimensionData;

	return enemyGrinchInstance;
}

/**
 * Updates the state (position/existence/etc.) of all antagonistic grinch instances
 *
 * @param timeQuantum {Number} Elapsed time quantum (milliseconds)
 */
MainPackageDropperGameplayScene.prototype.updateStateInformationForEnemyGrinchCollection = function(timeQuantum) {
	for (var currentEnemyIndex = this.enemyGrinchInstanceDataCollection.length - 1; currentEnemyIndex >= 0 ;
		currentEnemyIndex--) {

		this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectWorldSpacePosition.xCoord +=
			(this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectVelocity.xComponent * timeQuantum);
		this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectWorldSpacePosition.yCoord +=
			(this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectVelocity.yComponent * timeQuantum);
		this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectWorldSpacePosition.zCoord +=
			(this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectVelocity.zComponent * timeQuantum);
				
		if (this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectWorldSpacePosition.getX() <
			this.constModelEnemyGrinchMinPositionX) {
				
			this.enemyGrinchInstanceDataCollection.splice(currentEnemyIndex, 1);
		}
	}
	
	if (this.shouldEnemyGrinchInstanceBeCreated()) {
		this.enemyGrinchInstanceDataCollection.push(this.generateEnemyGrinchInstance());
		this.lastEnemyGenerationTimeMs = this.totalElapsedSceneTimeMs;
		this.currentEnemyGrinchGenerationIntervalMs = getRangedRandomValue(
			this.constMinEnemyGrinchGenerationIntervalMs, this.constMaxEnemyGrinchGenerationIntervalMs);
	}
}

/**
 * Updates the state of all objects within the game world
 *
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 */
MainPackageDropperGameplayScene.prototype.updateStateInformationForWorldObjects = function(timeQuantum) {
	this.updateStateInformationForSleigh(timeQuantum);
	this.updateStateInformationForPackageCollection(timeQuantum);
	this.updateStateInformationForEnemyGrinchCollection(timeQuantum);
	this.updateStateInformationForHouseRowCollection(timeQuantum);
}

/**
 * Updates the general state of the game (attributes that are not directly associated with
 *  game objects)
 *
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 */
MainPackageDropperGameplayScene.prototype.updateGeneralGameStateInformation = function(timeQuantum) {
	this.updateInternalGameScoreForElapsedTime();
	
	// Decrease the value of the holiday spirit gauge as time passes...
	this.holidaySpiritValue -= (this.constHolidaySpiritValueDecreaseRatePerMs * timeQuantum);
	
	// Increase the rate of progress through the game world as time passes...
	this.currentProgressRateMetersPerMs += this.constProgressRateAccelerationRateMetersPerMsSq * timeQuantum;
	
}

/**
 * Generates a new giftbox instance at the immediate location of the sleigh
 */
MainPackageDropperGameplayScene.prototype.generateGiftBoxProjectileAtSleighLocation = function() {
	if (validateVar(this.sleighInstance)) {
	
		var sleighInstanceMaxX = this.sleighInstance.objectWorldSpacePosition.xCoord +
			(this.sleighInstance.objectDimensions.objectDimensionX / 2.0);
		
		var objectWorldSpacePosition = new Point3d(sleighInstanceMaxX + this.giftBoxOriginationMarginX,
			this.sleighInstance.objectWorldSpacePosition.yCoord, 0.0);
		var initialGiftBoxVelocityXComponent = getRangedRandomValue(this.minGiftBoxInitialVelocityX,
			this.maxGiftBoxInitialVelocityX);
		var initialGiftBoxVelocity = new Vector3d(initialGiftBoxVelocityXComponent, 0.0, 0.0);
	
		var giftBoxInstance = this.createGiftBoxInstance(objectWorldSpacePosition, initialGiftBoxVelocity);
	
		this.giftBoxInstanceDataCollection.push(giftBoxInstance);
	}
}

/**
 * Updates the internal timer employed to maintain the overlay refresh interval
 *
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 */
MainPackageDropperGameplayScene.prototype.updateOverlayRefreshInterval = function(timeQuantum) {
	if (this.currentOverlayUpdateElapsedInterval < this.constOverlayUpdateIntervalMs) {
		this.currentOverlayUpdateElapsedInterval += timeQuantum;
	}
	else {
		this.currentOverlayUpdateElapsedInterval = 0;
	}
}

/**
 * Determines if overlay data should be updated, based upon internal factors
 *  (e.g. current overlay time counter)
 */
MainPackageDropperGameplayScene.prototype.shouldUpdateOverlay = function() {
	return this.currentOverlayUpdateElapsedInterval >= this.constOverlayUpdateIntervalMs;
}

/**
 * Updates the game score canvas/bitmap
 */
MainPackageDropperGameplayScene.prototype.updateGameScoreText = function() {
	var gameScoreString = Constants.stringScoreLabel + this.gameScore;
	
	this.scoreTextCanvasBuffer.updateStaticTextString(gameScoreString);
}

/**
 * Renders a representation of the immediate holiday spirit gauge level into
 *  the provided canvas context
 *
 * @param targetCanvasContext {CanvasRenderingContext2D}  Canvas into which the spirit gauge will
 *                                                        be rendered
 * @param spiritGaugeWidth {Number} The width of the spirit gauge
 * @param spiritGaugeHeight {Number} The height of the spirit gauge
 * @param spiritGaugeOffsetX {Nubmer} The gauge offset from the left edge of the screen
 */
MainPackageDropperGameplayScene.prototype.updateSpiritGaugeMagnitudeRepresentation = function (targetCanvasContext,
																							  spiritGaugeWidth,
																							  spiritGaugeHeight,
																							  spiritGaugeOffsetX) {

	if (validateVar(targetCanvasContext) && validateVar(spiritGaugeWidth) && validateVar(spiritGaugeHeight) &&
		validateVar(spiritGaugeOffsetX)) {

		var spiritGaugeBorderSizeX = 4;
		var spiritGaugeBorderSizeY = 4;

		// Erase the existing spirit gauge rendering.
		targetCanvasContext.fillStyle = this.constCanvasClearColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(spiritGaugeOffsetX + this.constOverlayTextLeftMargin, 0, spiritGaugeWidth,
			spiritGaugeHeight);
			
		targetCanvasContext.strokeStyle = this.constSpiritGaugeOutlineColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.strokeRect(spiritGaugeOffsetX + this.constOverlayTextLeftMargin, 0, spiritGaugeWidth,
			spiritGaugeHeight);

		holidaySpiritValueForGaugeDisplay = Math.max(Math.min(this.holidaySpiritValue, this.constMaxHolidaySpiritValue),
			this.constMinHolidaySpiritValue);
		var holidaySpiritFraction = (holidaySpiritValueForGaugeDisplay - this.constMinHolidaySpiritValue) /
			(this.constMaxHolidaySpiritValue - this.constMinHolidaySpiritValue);
		
		var gaugeColor = this.constSpiritGaugeMinValueColor.blendWithUnitWeight(this.constSpiritGaugeMaxValueColor,
			holidaySpiritFraction);
			
		var gaugeLeftCoord = spiritGaugeOffsetX + this.constOverlayTextLeftMargin + spiritGaugeBorderSizeX;
		var gaugeWidth = Math.max(0.0, (Math.floor(spiritGaugeWidth * holidaySpiritFraction) - 2 * spiritGaugeBorderSizeX));
						
		var fillStyleGradient = targetCanvasContext.createLinearGradient(gaugeLeftCoord, 0, gaugeLeftCoord + gaugeWidth, 0);
		fillStyleGradient.addColorStop(0.0, gaugeColor.getRgbaIntValueAsStandardString());
		fillStyleGradient.addColorStop(this.constSpiritGaugeLeadingEdgeFraction, gaugeColor.getRgbaIntValueAsStandardString());
		fillStyleGradient.addColorStop(1.0, this.constSpiritGaugeLeadingEdgeColor.getRgbaIntValueAsStandardString());
		
		targetCanvasContext.fillStyle = fillStyleGradient;
		targetCanvasContext.fillRect(gaugeLeftCoord, spiritGaugeBorderSizeY, gaugeWidth,
			spiritGaugeHeight - 2 * spiritGaugeBorderSizeY);
	}
}

/**
 * Generates the content to be rendered within the full-screen overlay at the end of the
 *  game 
 *
 * @param webGlCanvasContext {WebGLRenderingContext} WebGL context used to render geometry
 *                                                   to a WebGL display buffer
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context used to render the full-screen
 *                                                       overlay at the end of the game
 * @param targetTexture {WebGLTexture} Texture into which the data will finally be stored
 */
MainPackageDropperGameplayScene.prototype.generateGameEndOverlayContent = function(webGlCanvasContext,
																				   targetCanvasContext,
																				   targetTexture) {
																						
	if (validateVar(webGlCanvasContext) && validateVar(targetCanvasContext) && validateVar(targetTexture)) {

		targetCanvasContext.clearRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		targetCanvasContext.fillStyle = this.gameEndOverlayBackgroundColor.getRgbaIntValueAsStandardString();
		targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, targetCanvasContext.canvas.height);
		
		var gameOverTextBuffer = new StaticTextLineCanvasBuffer(Constants.gameOverFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		gameOverTextBuffer.updateStaticTextString(Constants.stringGameOver);
		
		var happyHolidaysTextBuffer = new StaticTextLineCanvasBuffer(Constants.labelFontSizePx,
			Constants.labelFont, Constants.labelFontStyle);
		happyHolidaysTextBuffer.updateStaticTextString(Constants.messageText);

		var topCoord = (targetCanvasContext.canvas.height - (gameOverTextBuffer.requiredRenderingCanvasHeight() + 
			happyHolidaysTextBuffer.requiredRenderingCanvasHeight())) / 2.0;
		var gameOverLeftCoord = (targetCanvasContext.canvas.width - gameOverTextBuffer.requiredRenderingCanvasWidth()) / 2.0;
		var happyHolidaysLeftCoord = (targetCanvasContext.canvas.width - happyHolidaysTextBuffer.requiredRenderingCanvasWidth()) / 2.0;

		gameOverTextBuffer.renderText(targetCanvasContext, gameOverLeftCoord, topCoord);
		happyHolidaysTextBuffer.renderText(targetCanvasContext, happyHolidaysLeftCoord,
			topCoord + gameOverTextBuffer.requiredRenderingCanvasHeight());		

		updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Determines if the game is active (i.e. the game over state has not yet
 *  been activated)
 *
 * @return True if the game is currently active
 */
MainPackageDropperGameplayScene.prototype.isInActiveGameplayState = function() {
	return (this.holidaySpiritValue > this.constMinHolidaySpiritValue);
}

/**
 * Produces a translation matrix, using the displacement specified using
 *  the provided vector
 *
 * @param translationVector3d {Vector3d} Three-dimensional vector that specifies
 *                                       an offset
 *
 * @return {MathExt.Matrix} A translation matrix upon success, or an identity
 *                          matrix upon failure
 */
MainPackageDropperGameplayScene.prototype.generateTranslationMatrix = function(translationVector3d) {
	var translationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	translationMatrix.setToIdentity();
	
	if (validateVarAgainstType(translationVector3d, Vector3d)) {
		translationMatrix = MathUtility.generateTranslationMatrix3d(translationVector3d.getXComponent(),
			translationVector3d.getYComponent(), translationVector3d.getZComponent());
	}
	
	return translationMatrix;
}

/**
 * Produces a three-axis rotation matrix, using the specified
 *  rotations on the X, Y, and Z axes (rotations are performed
 *  in the following order: X, Y, Z)
 *
 * @param axisRotationRadX {Number} X-axis rotation, in radians
 * @param axisRotationRadY {Number} Y-axis rotation, in radians
 * @param axisRotationRadZ {Number} Z-axis rotation, in radians
 *
 * @return {MathExt.Matrix} A rotation matrix upon success, or an identity matrix
 *                          upon failure
 */
MainPackageDropperGameplayScene.prototype.generateRotationMatrix = function(axisRotationRadX, axisRotationRadY, axisRotationRadZ) {
	var rotationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	rotationMatrix.setToIdentity();	
	
	if (validateVar(axisRotationRadX) && validateVar(axisRotationRadY) && validateVar(axisRotationRadZ)) {
		var rotationMatrixX = MathUtility.generateRotationMatrix3dAxisX(axisRotationRadX);
		var rotationMatrixY = MathUtility.generateRotationMatrix3dAxisY(axisRotationRadY);
		var rotationMatrixZ = MathUtility.generateRotationMatrix3dAxisZ(axisRotationRadZ);
		
		var rotationMatrixXY = (rotationMatrixX.multiply(rotationMatrixY));
		if (rotationMatrixXY !== null) {
			rotationMatrix = rotationMatrixXY.multiply(rotationMatrixZ);
		}
	}
	
	return rotationMatrix;
}

/**
 * Produces a rotation matrix for the object, using the internally-specified
 *  object rotation parameters
 *
 * @param sourceObject Object for which the rotation matrix is to be generated
 *
 * @return {MathExt.Matrix} A rotation matrix upon success, or an identity matrix
 *                          upon failure
 */
MainPackageDropperGameplayScene.prototype.generateRotationMatrixForObject = function(sourceObject) {
	var rotationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	rotationMatrix.setToIdentity();	
	
	if (validateVar(sourceObject)) {
		rotationMatrix = this.generateRotationMatrix(sourceObject.objectRotationRadX,
			sourceObject.objectRotationRadY, sourceObject.objectRotationRadZ);
	}
	
	return rotationMatrix;
}

/**
 * Produces a translation matrix for the object, using the internally-specified
 *  object position parameters (object is assumed to be positioned at the world
 *  origin prior to translation)
 *
 * @param sourceObject Object for which the translation matrix is to be generated
 *
 * @return {MathExt.Matrix} A translation matrix upon success, or an identity matrix
 *                          upon failure
 */
MainPackageDropperGameplayScene.prototype.generateTranslationMatrixForObject = function(sourceObject) {
	var translationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	translationMatrix.setToIdentity();	
	
	if (validateVar(sourceObject)) {
		var translationVector = PrimitivesUtil.GenerateVector3dFromPoint3d(sourceObject.objectWorldSpacePosition);
		translationMatrix = this.generateTranslationMatrix(translationVector);
	}
	
	return translationMatrix;
}

/**
 * Produces the final world-space transformation matrix for the object, using the
 *  internally-specified object position and rotation parameters (object is assumed
 *  to be positioned at the world origin prior to the transformation )
 *
 * @param sourceObject Object for which the transformation matrix is to be generated
 *
 * @return {MathExt.Matrix} A transformation matrix upon success, or an identity matrix
 *                          upon failure
 */
MainPackageDropperGameplayScene.prototype.generateTransformationMatrixForObject = function(sourceObject) {
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();
	
	var rotationMatrix = this.generateRotationMatrixForObject(sourceObject);
	var translationMatrix = this.generateTranslationMatrixForObject(sourceObject);
	
	if (validateVarAgainstType(rotationMatrix, MathExt.Matrix) &&
		validateVarAgainstType(translationMatrix, MathExt.Matrix))
	{
		transformationMatrix = translationMatrix.multiply(rotationMatrix);
	}
	
	return transformationMatrix;
}

/**
 * Input handler for the input message(s) which represent the
 *  "move up" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainPackageDropperGameplayScene.prototype.handleInputForVerticalMovementUp = function(scalarInputEvent) {
	if (validateVarAgainstType(scalarInputEvent, ScalarInputEvent)) {	
		this.sleighInstance.currentThrustFactorVector = new Vector3d(
			this.sleighInstance.currentThrustFactorVector.getXComponent(),
			scalarInputEvent.inputUnitMagnitude,
			this.sleighInstance.currentThrustFactorVector.getZComponent());
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move down" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainPackageDropperGameplayScene.prototype.handleInputForVerticalMovementDown = function(scalarInputEvent) {
	if (validateVarAgainstType(scalarInputEvent, ScalarInputEvent)) {	
		this.sleighInstance.currentThrustFactorVector = new Vector3d(
			this.sleighInstance.currentThrustFactorVector.getXComponent(),
			-scalarInputEvent.inputUnitMagnitude,
			this.sleighInstance.currentThrustFactorVector.getZComponent());
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move left" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainPackageDropperGameplayScene.prototype.handleInputForHorizontalMovementLeft = function(scalarInputEvent) {
	if (validateVarAgainstType(scalarInputEvent, ScalarInputEvent)) {	
		this.sleighInstance.currentThrustFactorVector = new Vector3d(
			-scalarInputEvent.inputUnitMagnitude,
			this.sleighInstance.currentThrustFactorVector.getYComponent(),
			this.sleighInstance.currentThrustFactorVector.getZComponent());
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "move right" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainPackageDropperGameplayScene.prototype.handleInputForHorizontalMovementRight = function(scalarInputEvent) {
	if (validateVarAgainstType(scalarInputEvent, ScalarInputEvent)) {
		this.sleighInstance.currentThrustFactorVector = new Vector3d(
			scalarInputEvent.inputUnitMagnitude,
			this.sleighInstance.currentThrustFactorVector.getYComponent(),
			this.sleighInstance.currentThrustFactorVector.getZComponent());	
	}
}

/**
 * Input handler for the input message(s) which represent the
 *  "fire package" action
 *
 * @param scalarInputEvent {ScalarInputEvent} Scalar-based input event which represents
 *                                            an input message that can represent varying
 *                                            input magnitudes
 */
MainPackageDropperGameplayScene.prototype.handleInputForPackageProjectileLaunch = function(scalarInputEvent) {
	if (validateVarAgainstType(scalarInputEvent, ScalarInputEvent)) {
		var inputIsLaunchInvocationCommand = (scalarInputEvent.inputUnitMagnitude > 0.0);
		if (inputIsLaunchInvocationCommand && this.shouldLaunchPackageProjectileOnLaunchCommand()) {
			this.lastPackageLaunchTimeMs = this.totalElapsedSceneTimeMs;
			this.launchInputRelaxedSinceInitialLaunch = false;
			this.generateGiftBoxProjectileAtSleighLocation();
		}
		else {
			this.launchInputRelaxedSinceInitialLaunch = !inputIsLaunchInvocationCommand;
		}
	}
}

/**
 * Determines if a package should be launched, based upon internally-maintained factors
 *  (e.g. last package launch time, etc.)
 * 
 * @return {Boolean} True if a package should be launched
 */
MainPackageDropperGameplayScene.prototype.shouldLaunchPackageProjectileOnLaunchCommand = function () {
	return ((this.totalElapsedSceneTimeMs - this.lastPackageLaunchTimeMs) >= this.constPackageLaunchIntervalMs) &&
		this.launchInputRelaxedSinceInitialLaunch && this.isInActiveGameplayState() &&
		(this.constMaxSimultaneousPackages >= this.giftBoxInstanceDataCollection.length);
}

/**
 * Processes all sleigh collisions with grinch instances (removes grinch instances that have
 *  collided with the sleigh)
 *
 */
MainPackageDropperGameplayScene.prototype.processSleighCollisionsWithGrinchInstances = function() {
	for (var enemyIndex = this.enemyGrinchInstanceDataCollection.length - 1; enemyIndex >= 0; enemyIndex--) {
	
		if (this.doApproximate2dBoundingBoxesIntersect(this.sleighInstance,
			this.enemyGrinchInstanceDataCollection[enemyIndex])) {
				
			this.holidaySpiritValue -= this.constHolidaySpiritValueDecreaseOnEnemyContact;
			this.enemyGrinchInstanceDataCollection.splice(enemyIndex, 1);
		}
	}
}

/** 
 * Processes all gift box collisions with chimney entry points (removes giftbox instances
 *  that have collided with chimney entrance points)
 */
MainPackageDropperGameplayScene.prototype.processGiftBoxCollisionsWithChimneyEntryPoints = function() {
	if (this.houseRowContainerCollection.length > 0) {
		for (var giftBoxIndex = this.giftBoxInstanceDataCollection.length - 1; giftBoxIndex >= 0; giftBoxIndex--) {
			var collisionOccurred = false;
			var houseIndex = this.houseRowContainerCollection[0].houseInstanceCollection.length - 1
			
			while ((houseIndex >=0) && !collisionOccurred) {
			
				if (this.isGiftBoxInChimneyCollisionProximityForHouse(this.giftBoxInstanceDataCollection[giftBoxIndex],
					this.houseRowContainerCollection[0].houseInstanceCollection[houseIndex])) {
					
					this.giftBoxInstanceDataCollection.splice(giftBoxIndex, 1);					

					this.gameScore += this.constGameScoreValueIncreaseOnPackageDelivery;
					this.holidaySpiritvalue += this.constHolidaySpiritValueIncreaseOnPackageDelivery;
				}

				houseIndex--;
			}
		}
	}
}

/**
 * Determines if a giftbox instance is in proximity to a collision/scoring
 *  region of a chimney on a particular house instance
 *
 * @param giftBoxInstance {GiftBoxInstanceData} Data that represents a single giftbox instance
 * @param houseInstance {HouseInstanceData} Data that represents a singel house instance
 *
 * @return True if the gift box instance is in proximity to a scoring region
 */
MainPackageDropperGameplayScene.prototype.isGiftBoxInChimneyCollisionProximityForHouse = function(giftBoxInstance, houseInstance) {
	var isInProximity = false;
	
	if (validateVarAgainstType(giftBoxInstance, GiftBoxInstanceData) && validateVarAgainstType(houseInstance, HouseInstanceData)) {
		
		var constDistanceThreshold = 0.1;
		
		var houseTransformationMatrix = this.generateTransformationMatrixForObject(houseInstance);
		var chimneyIndex = 0;
			
		// The proximity will be determined by comparing the center of the gift box with the
		// designated/pre-determined chimney center point.
		while (!isInProximity && (chimneyIndex < houseInstance.chimneyLocii.length)) {
			var transformedChimneyLocii = this.transformPointWithMatrix(houseInstance.chimneyLocii[chimneyIndex],
				this.generateTransformationMatrixForObject(houseInstance));
			
			// The game scene perspective is essentially two-dimensional - do not use the
			// Z-axis during proximity determination.
			var distanceIn2dPlane =
				Math.sqrt(Math.pow((giftBoxInstance.objectWorldSpacePosition.xCoord - transformedChimneyLocii.xCoord), 2.0) +
				Math.pow((giftBoxInstance.objectWorldSpacePosition.yCoord - transformedChimneyLocii.yCoord), 2.0));
			
			isInProximity = distanceIn2dPlane < constDistanceThreshold;
			
			chimneyIndex++;
		}
	}
	
	return isInProximity;
}

/**
 * Transforms a point using a rotation/translation matrix 
 *
 * @param point3d {Point3d} Point to be transformed
 * @param matrix {MathExt.Matrix} Transformation matrix
 *
 * @return A transformed point upon success, the original point otherwise
 */
MainPackageDropperGameplayScene.prototype.transformPointWithMatrix = function(point3d, matrix) {
	var transformedPoint = new Point3d(point3d.xCoord, point3d.yCoord, point3d.zCoord);
	
	if (validateVar(point3d) && validateVar(matrix)) {
		
		var pointAsMatrix = MathUtility.vector3dToColumnMatrix(PrimitivesUtil.GenerateVector3dFromPoint3d(point3d));
		
		var transformedPointAsMatrix = matrix.multiply(pointAsMatrix);
		transformedPoint = PrimitivesUtil.GeneratePoint3dFromVector3d(MathUtility.columnMatrixToVector3d(transformedPointAsMatrix));
	}
	
	return transformedPoint;
}

/**
 * Processes/evaluates all giftbox collisions with grinch instances (giftbox and grinch instances
 *  involved in collisions are removed from their respective stores)
 */
MainPackageDropperGameplayScene.prototype.processGiftBoxCollisionsWithGrinchInstances = function() {
	
	for (var giftBoxIndex = this.giftBoxInstanceDataCollection.length - 1; giftBoxIndex >= 0; giftBoxIndex--) {	
		var collisionOccurred = false;
		var enemyIndex = this.enemyGrinchInstanceDataCollection.length - 1
		
		// Ignore the rotation applied to the gift box instances during gift box transit
		// animation - the gift box is roughly a cube; therefore the boundaries are
		// not appreciably altered during rotation (collision detection is not intended
		// to be highly precise).
		while ((enemyIndex >= 0) && !collisionOccurred) {
		
			if (this.doApproximate2dBoundingBoxesIntersect(this.giftBoxInstanceDataCollection[giftBoxIndex],
				this.enemyGrinchInstanceDataCollection[enemyIndex])) {
					
				this.enemyGrinchInstanceDataCollection.splice(enemyIndex, 1);
				this.giftBoxInstanceDataCollection.splice(giftBoxIndex, 1);

				this.holidaySpiritValue += this.constHolidaySpiritValueIncreaseOnEnemyDestruction;				
				this.gameScore += this.constGameScoreValueIncreaseOnEnemyDestruction;
				
				collisionOccurred = true;
			}
			
			enemyIndex--;
		}
	}
	
}

/**
 * Processes collisions for all gameplay objects that are subject to
 *  collisions
 */
MainPackageDropperGameplayScene.prototype.processAllCollisions = function() {
	// Collisions will not be processed if the game is not active.
	if (this.isInActiveGameplayState()) {
		this.processSleighCollisionsWithGrinchInstances();
		this.processGiftBoxCollisionsWithChimneyEntryPoints();
		this.processGiftBoxCollisionsWithGrinchInstances();
	}
}

/**
 * Determines if the approximate two-dimensional bounding boxes for two objects
 *  intersect
 * 
 * @param firstObject The first object for which the two-dimensional bounding box
 *                    intersection evaluation will be performed (must have an
 *                    objectWorldSpacePosition {Point3d} and an
 *                    objectDimensions {ObjectDimensionData} member)
 * @param secondObject The second object for which the two-dimensional bounding box
 *                     intersection evaluation will be performed (must have an
 *                     objectWorldSpacePosition {Point3d} and an
 *                     objectDimensions {ObjectDimensionData} member)
 *
 * @return True if the bounding boxes intersect
 * @see MainPackageDropperGameplayScene.getApproximateBoundingBox2d(...)
 */
MainPackageDropperGameplayScene.prototype.doApproximate2dBoundingBoxesIntersect = function(firstObject, secondObject) {
	var boundingBoxesIntersect = false;
	
	if (validateVar(firstObject) && validateVar(secondObject)) {
		var firstObjectBoundingBox2d = this.getApproximateBoundingBox2d(firstObject);
		var secondObjectBoundingBox2d = this.getApproximateBoundingBox2d(secondObject);
		
		var firstObjectRight = firstObjectBoundingBox2d.left + firstObjectBoundingBox2d.width;
		var secondObjectRight = secondObjectBoundingBox2d.left + secondObjectBoundingBox2d.width;
		var firstObjectBottom = firstObjectBoundingBox2d.top - firstObjectBoundingBox2d.height;
		var secondObjectBottom = secondObjectBoundingBox2d.top - secondObjectBoundingBox2d.height;
		
		var boxesIntersectAlongAxisX =
			((firstObjectBoundingBox2d.left >= secondObjectBoundingBox2d.left) && (firstObjectBoundingBox2d.left <= secondObjectRight)) ||
			((firstObjectRight >= secondObjectBoundingBox2d.left) && (firstObjectRight <= secondObjectRight)) ||
			((secondObjectBoundingBox2d.left >= firstObjectBoundingBox2d.left) && (secondObjectBoundingBox2d.left <= firstObjectRight));
		var boxesIntersectAlongAxisY =
			((firstObjectBoundingBox2d.top >= secondObjectBottom) && (firstObjectBoundingBox2d.top <= secondObjectBoundingBox2d.top)) ||
			((firstObjectBottom >= secondObjectBottom) && (firstObjectBottom <= secondObjectBoundingBox2d.top)) ||
			((secondObjectBoundingBox2d.top >= firstObjectBottom) && (secondObjectBoundingBox2d.top <= firstObjectBoundingBox2d.top));		
		
		var boundingBoxesIntersect = boxesIntersectAlongAxisX && boxesIntersectAlongAxisY;
	}
	
	return boundingBoxesIntersect;
}

/**
 * Returns the approximate two-dimensional bounding box
 *
 * @param object Object for which the bounding box should be determined (must have an
 *               objectWorldSpacePosition {Point3d} and an
 *               objectDimensions {ObjectDimensionData} member)
 * 
 * @return {Rectangle} The two-dimensional bounding box for the object
 */
MainPackageDropperGameplayScene.prototype.getApproximateBoundingBox2d = function(object) {
	var boundingBox2d = new Rectangle(0, 0, 0, 0);
	
	if (validateVar(object)) {
		boundingBox2d = new Rectangle(
			object.objectWorldSpacePosition.xCoord - (object.objectDimensions.objectDimensionX / 2.0),
			object.objectWorldSpacePosition.yCoord - (object.objectDimensions.objectDimensionY / 2.0),
			object.objectDimensions.objectDimensionX,
			object.objectDimensions.objectDimensionY
		);
	}
	
	return boundingBox2d;
}

/**
 * Renders all house instances
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderHouses = function(timeQuantum, targetCanvasContext) {
	for (var currentHouseRowIndex = 0; currentHouseRowIndex < this.houseRowContainerCollection.length; currentHouseRowIndex++) {		
		this.renderHouseRow(this.houseRowContainerCollection[currentHouseRowIndex], this.standardObjectShader, timeQuantum,
			targetCanvasContext);
	}
}

/**
 * Renders a single row of house instances
 *
 * @param houseRowContainer {HouseRowContainer} A container representing a row of houses
 * @param webGlShader {WebGLShader} Shader that will be used to render the houses within
 *                                  the house row
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderHouseRow = function(houseRowContainer, webGlShader,
	timeQuantum, targetCanvasContext) {
		
	if (validateVarAgainstType(houseRowContainer, HouseRowContainer)) {
		for (currentHouseIndex = 0; currentHouseIndex < houseRowContainer.houseInstanceCollection.length; currentHouseIndex++) {
			houseRowContainer.houseInstanceCollection[currentHouseIndex];
			
			var objectRenderWebGlData = this.objectRenderWebGlDataFromWebGlBufferData(
				houseRowContainer.houseInstanceCollection[currentHouseIndex].objectWebGlBufferData,
				webGlShader);
			var transformationMatrix = this.generateTransformationMatrixForObject(
				houseRowContainer.houseInstanceCollection[currentHouseIndex]);
			this.renderGeometry(objectRenderWebGlData, transformationMatrix, null, targetCanvasContext);
		}
	}
}

/**
 * Renders all giftbox projectiles
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderPackageProjectiles = function(timeQuantum, targetCanvasContext) {
	for (var currentGiftBoxIndex = 0; currentGiftBoxIndex < this.giftBoxInstanceDataCollection.length; currentGiftBoxIndex++) {
		var objRenderWeblGlData = this.objectRenderWebGlDataFromWebGlBufferData(	
			this.giftBoxInstanceDataCollection[currentGiftBoxIndex].objectWebGlBufferData,
			this.standardObjectShader);
		var transformationMatrix = this.generateTransformationMatrixForObject(
			this.giftBoxInstanceDataCollection[currentGiftBoxIndex]);
		this.renderGeometry(objRenderWeblGlData, transformationMatrix, null, targetCanvasContext);
	}	
}

/**
 * Renders the sleigh instance
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderSleigh = function(timeQuantum, targetCanvasContext) {
	// The sleigh will not be drawn if the game has ended.
	if (this.isInActiveGameplayState()) {
		if (validateVar(this.sleighInstance)) {
			var objRenderWeblGlData = this.objectRenderWebGlDataFromWebGlBufferData(	
				this.sleighInstance.objectWebGlBufferData,
				this.standardObjectShader);
			var transformationMatrix = this.generateTransformationMatrixForObject(
				this.sleighInstance);
			this.renderGeometry(objRenderWeblGlData, transformationMatrix, null, targetCanvasContext);		
		}
	}
}

/**
 * Renders all enemy object instances
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderEnemyObjects = function(timeQuantum, targetCanvasContext) {
	for (var currentEnemyIndex = 0; currentEnemyIndex < this.enemyGrinchInstanceDataCollection.length;
		currentEnemyIndex++) {
			
		var objRenderWeblGlData = this.objectRenderWebGlDataFromWebGlBufferData(	
			this.enemyGrinchInstanceDataCollection[currentEnemyIndex].objectWebGlBufferData,
			this.standardObjectShader);
		var transformationMatrix = this.generateTransformationMatrixForObject(
			this.enemyGrinchInstanceDataCollection[currentEnemyIndex]);
		this.renderGeometry(objRenderWeblGlData, transformationMatrix, null, targetCanvasContext);	
	}
}

/**
 * Renders the text buffer output to a specified canvas context
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param staticTextBuffer {StaticTextLineCanvasBuffer} Object that is used to store the rendered
 *                                                      text representation
 * @param coordX {Number} The starting location of the text along the X-axis within the
 *                        output texture
 * @param targetCanvasContext {CanvasRenderingContext2D} The output canvas context
 *                                                       to which the text buffer
 *                                                       will be rendered
 * @param targetTexture {WebGLTexture} The texture in which the buffer will be finally store
 * @param webGlCanvasContext {WebGLRenderingContext2D} A WebGL rendering context used for
 *                                                     writing the final output into a texture
 * @param drawBackground {Boolean} When set to true, a solid background will be drawn
 *                                 before the text is drawn.
 */
MainPackageDropperGameplayScene.prototype.renderStaticTextBufferToTexture = function(timeQuantum, staticTextBuffer, coordX,
																				   targetCanvasContext, targetTexture,
																				   webGlCanvasContext, drawBackground) {
				
	if (validateVar(timeQuantum) && validateVarAgainstType(staticTextBuffer, StaticTextLineCanvasBuffer) &&
		validateVar(targetCanvasContext) && validateVar(webGlCanvasContext) &&
		validateVar(targetTexture)) {
			
		// Clear the background of the area where the text will be rendered...
		targetCanvasContext.clearRect(coordX, 0, staticTextBuffer.requiredRenderingCanvasWidth(),
			staticTextBuffer.requiredRenderingCanvasHeight());
	
		// Draw a background strip in order to enhance readability.
		if (validateVar(drawBackground) && drawBackground) {
			targetCanvasContext.save();
			targetCanvasContext.fillStyle = this.defaultTextAreaBackgroundColor.getRgbaIntValueAsStandardString();
			
			targetCanvasContext.fillRect(0, 0, targetCanvasContext.canvas.width, staticTextBuffer.getTextAreaHeight());
				
			targetCanvasContext.restore();
		}
		
		staticTextBuffer.renderText(targetCanvasContext, coordX, 0);
	
		updateDynamicTextureWithCanvas(webGlCanvasContext, targetTexture, targetCanvasContext.canvas);
	}
}

/**
 * Renders the game score overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderGameScoreOverlay = function(timeQuantum, targetCanvasContext) {
	var gameScoreOverlayTexture = globalResources.getScoreOverlayTexture();	
	if (this.shouldUpdateOverlay()) {
		this.updateGameScoreText();
		var gameScoreOverlayCanvasContext = globalResources.getScoreOverlayCanvasContext();
		gameScoreOverlayCanvasContext.clearRect(0, 0, gameScoreOverlayCanvasContext.canvas.width,
			gameScoreOverlayCanvasContext.canvas.height);
		this.renderStaticTextBufferToTexture(timeQuantum, this.scoreTextCanvasBuffer, this.constOverlayTextLeftMargin,
			gameScoreOverlayCanvasContext, gameScoreOverlayTexture, targetCanvasContext, true);
	}
		
	var overlayRenderWebGlData = this.objectRenderWebGlDataFromWebGlBufferData(	
		this.scoreOverlayRenderWebGlData, this.standardOverlayTextureRenderShader);
		
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();	
	this.renderGeometry(overlayRenderWebGlData, transformationMatrix, gameScoreOverlayTexture,
		targetCanvasContext);
}

/**
 * Renders the Holiday Spirit overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderHolidaySpiritGaugeOverlay = function(timeQuantum, targetCanvasContext) {
	var spiritGaugeOverlayTexture = globalResources.getGaugeOverlayTexture();
	if (this.shouldUpdateOverlay()) {
		var gaugeOverlayCanvasContext = globalResources.getGaugeOverlayCanvasContext();
		var spiritGaugeHeightDifference = 5;
		var spiritGaugeHeight = gaugeOverlayCanvasContext.canvas.height - spiritGaugeHeightDifference;
		
		gaugeOverlayCanvasContext.clearRect(0, 0, gaugeOverlayCanvasContext.canvas.width,
			gaugeOverlayCanvasContext.canvas.height);
		this.updateSpiritGaugeMagnitudeRepresentation(gaugeOverlayCanvasContext, this.constSpiritGaugeWidth,
			spiritGaugeHeight, this.holidaySpiritLabelCanvasBuffer.requiredRenderingCanvasWidth())		
		this.renderStaticTextBufferToTexture(timeQuantum, this.holidaySpiritLabelCanvasBuffer, this.constOverlayTextLeftMargin,
			gaugeOverlayCanvasContext, spiritGaugeOverlayTexture, targetCanvasContext, true);
	}
	
	var overlayRenderWebGlData = this.objectRenderWebGlDataFromWebGlBufferData(	
		this.gaugeOverlayRenderWebGlData, this.standardOverlayTextureRenderShader);
	
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();	
	this.renderGeometry(overlayRenderWebGlData, transformationMatrix, spiritGaugeOverlayTexture,
		targetCanvasContext);
}

/**
 * Renders the "Game Over" overlay
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderGameEndOverlay = function(timeQuantum, targetCanvasContext) {
	if (!this.isInActiveGameplayState()) {
		if (!this.gameEndOverlayContentHasBeenGenerated) {
			var gameEndOverlayCanvasContext = globalResources.getFullScreenOverlayCanvasContext();
			var gameEndOverlayTexture = globalResources.getFullScreenOverlayTexture();
			this.generateGameEndOverlayContent(targetCanvasContext, gameEndOverlayCanvasContext,
				gameEndOverlayTexture);
			this.gameEndOverlayContentHasBeenGenerated = true;
		}
		
		var fullScreenOverlayTexture = globalResources.getFullScreenOverlayTexture();
		var overlayRenderWebGlData = this.objectRenderWebGlDataFromWebGlBufferData(
			this.fullScreenOverlayWebGlData, this.standardOverlayTextureRenderShader);
		
		var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
			this.constTransformationMatrixColumnCount);
		transformationMatrix.setToIdentity();	
		this.renderGeometry(overlayRenderWebGlData, transformationMatrix, fullScreenOverlayTexture,
			targetCanvasContext);
	}	
}

/**
 * Renders the sky background
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderSkybackDrop = function(timeQuantum, targetCanvasContext) {
	var skyBackdropTexture = globalResources.getSkyBackdropTexture();
	
	var backdropRenderWebGlData = this.objectRenderWebGlDataFromWebGlBufferData(	
		this.backdropRenderWebGlData, this.standardOverlayTextureRenderShader);
	
	var transformationMatrix = new MathExt.Matrix(this.constTransformationMatrixRowCount,
		this.constTransformationMatrixColumnCount);
	transformationMatrix.setToIdentity();	
	this.renderGeometry(backdropRenderWebGlData, transformationMatrix, skyBackdropTexture,
		targetCanvasContext);	
}

/**
 * Renders all game overlays
 *
 * @param timeQuantum {number} A time quantum that represents the time delta
 *                             between the current rendering invocation and the
 *                             last rendering invocation (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderOverlayBitmaps = function(timeQuantum, targetCanvasContext) {
	this.renderGameScoreOverlay(timeQuantum, targetCanvasContext);
	this.renderHolidaySpiritGaugeOverlay(timeQuantum, targetCanvasContext);
	this.renderGameEndOverlay(timeQuantum, targetCanvasContext);
}

/**
 * Renders game geometry that is properly represented by data structures
 *  that encapsulate a description of an object to be rendered
 *
 * @param objectRenderWebGlData {ObjectRenderWebGlData} Object that contains the geometry to be
 *                                                      rendered, represented as WebGL buffers
 * @param transformationMatrix {MathExt.Matrix} Transformation matrix to be applied during rendering
 * @param webGlTexture {WebGLTexture} Texture to be used during rendering (if set to null, no
 *                                    texture will be used)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderGeometry = function (objectRenderWebGlData, transformationMatrix,
	webGlTexture, targetCanvasContext) {
		
	if (validateVarAgainstType(objectRenderWebGlData, ObjectRenderWebGlData)) {
		targetCanvasContext.useProgram(objectRenderWebGlData.webGlShaderProgram);
		// Bind the vertex buffer...
		targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexBuffer);
		var vertexPositionAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram,
			"aVertexPosition");
		targetCanvasContext.vertexAttribPointer(vertexPositionAttribute, this.constVertexSize,
			targetCanvasContext.FLOAT, false, 0, 0);
		targetCanvasContext.enableVertexAttribArray(vertexPositionAttribute);
		
		if (objectRenderWebGlData.webGlVertexColorBuffer != null) {
			// Bind the vertex color buffer...
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexColorBuffer);
			var vertexColorAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram, "aVertexColor");
			targetCanvasContext.vertexAttribPointer(vertexColorAttribute, this.constVertexColorSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(vertexColorAttribute);
		}
		
		if (objectRenderWebGlData.webGlVertexNormalBuffer != null) {
			// Bind the vertex normal buffer...
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER, objectRenderWebGlData.webGlVertexNormalBuffer);
			var vertexNormalAttribute = targetCanvasContext.getAttribLocation(objectRenderWebGlData.webGlShaderProgram, "aVertexNormal");
			targetCanvasContext.vertexAttribPointer(vertexNormalAttribute, this.constVectorSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(vertexNormalAttribute);
		}
		
		// Ensure that ambient lighting data is accessible by the shader
		// program (affects all rendered objects).
		var ambientLightUniform = targetCanvasContext.getUniformLocation(objectRenderWebGlData.webGlShaderProgram, "uniform_ambientLightVector");
		if (validateVar(ambientLightUniform)) {
			targetCanvasContext.uniform3fv(ambientLightUniform, this.constAmbientLightVector);
		}
		
		if (webGlTexture != null) {
			targetCanvasContext.bindTexture(targetCanvasContext.TEXTURE_2D, webGlTexture);
		}

		// Set the active texture coordinate buffer, if applicable...
		if (objectRenderWebGlData.webGlTexCoordBuffer !== null) {
			targetCanvasContext.bindBuffer(targetCanvasContext.ARRAY_BUFFER,
				objectRenderWebGlData.webGlTexCoordBuffer);
			var textureCoordinateAttribute = targetCanvasContext.getAttribLocation(
				objectRenderWebGlData.webGlShaderProgram, "aTextureCoord");
			targetCanvasContext.vertexAttribPointer(textureCoordinateAttribute, this.constTextureCoordinateSize,
				targetCanvasContext.FLOAT, false, 0, 0);
			targetCanvasContext.enableVertexAttribArray(textureCoordinateAttribute);
		}

		if (validateVarAgainstType(transformationMatrix, MathExt.Matrix)) {
			var transformationMatrixAsLinearArray = convertMatrixToMatrixLinearArrayRep(transformationMatrix);
			// Apply the transformation matrix (transformation will be performed by
			// vertex shader).
			targetCanvasContext.uniformMatrix4fv(targetCanvasContext.getUniformLocation(objectRenderWebGlData.webGlShaderProgram,
				"uniform_transformationMatrix"), false, transformationMatrixAsLinearArray);
		}
	
		// ...Render the provided geometry.
		targetCanvasContext.drawArrays(targetCanvasContext.TRIANGLES, 0, objectRenderWebGlData.vertexCount);
	}
}

/**
 * Renders the primary, texture-based portion of the scene
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            							the scene data will be rendered
 */
MainPackageDropperGameplayScene.prototype.renderScene = function(timeQuantum, targetCanvasContext) {
	targetCanvasContext.clear(targetCanvasContext.COLOR_BUFFER_BIT);
	
	this.renderSkybackDrop(timeQuantum, targetCanvasContext);
	this.renderHouses(timeQuantum, targetCanvasContext);
	this.renderSleigh(timeQuantum, targetCanvasContext);
	this.renderPackageProjectiles(timeQuantum, targetCanvasContext);
	this.renderEnemyObjects(timeQuantum, targetCanvasContext);
	this.renderOverlayBitmaps(timeQuantum, targetCanvasContext);
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {WebGLRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 */
MainPackageDropperGameplayScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	this.renderScene(timeQuantum, targetCanvasContext);
	this.processAllCollisions();
	this.updateStateInformationForWorldObjects(timeQuantum);
	this.updateGeneralGameStateInformation(timeQuantum);
	this.updateOverlayRefreshInterval(timeQuantum);
	
	this.totalElapsedSceneTimeMs += timeQuantum;
}