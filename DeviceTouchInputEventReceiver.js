// DeviceTouchInputEventReceiver.js - Input event reciever that registers for touch events,
//                                    translating the events into ScalarInputEvents
//
//
// Author: Ayodeji Oshinnaiye
// Dependent upon:
// -ScalarInputEvent.js



function DeviceTouchInputEventReceiver(eventTarget) {
	this.eventDispatcher = new CustomCompatibleEventTarget();


	this.constDeviceTouchStartEventName = "touchstart";
	this.constDeviceTouchEndEventName = "touchend";


	this.constTouchInputSpecifier = 0;

	if (validateVar(eventTarget)) {	
		eventTarget.addEventListener(this.constDeviceTouchStartEventName, this);
		eventTarget.addEventListener(this.constDeviceTouchEndEventName, this);
	}	
}

/**
 * Returns the event dispatcher object that can be employed to forward
 *  events
 *
 * @return {EventTarget} An event target object used to forward events
 */
DeviceTouchInputEventReceiver.prototype.getEventDispatcher = function() {
	return this.eventDispatcher;
}

/**
 * Method required by all scalar input event dispatching
 *  implementations - returns the identifier of the data type associated with
 *  scalar input events
 *
 * @return {String} Data type identifier for the data included in the Event.detail
 *                  field for scalar input events
 */
DeviceTouchInputEventReceiver.prototype.getDispatchedScalarInputEventDataType = function() {
	var constScalarEventTypeData = "_InputStandardDeviceTouchScalarEventData";
	
	return constScalarEventTypeData;
}


DeviceTouchInputEventReceiver.prototype.handleEvent = function(event) {
	
	var scalarInputEventType = this.getDispatchedScalarInputEventDataType();
	
	// Construct the scalar input event (clients can handle scalar input
	// events without consideration for binary states, etc.).
	var scalarInputEvent = new ScalarInputEvent();
	
	scalarInputEvent.inputEventType = scalarInputEventType;	
	scalarInputEvent.inputEventCode = this.constTouchInputSpecifier;
	
	if (event.type === this.constDeviceTouchStartEventName) {
		scalarInputEvent.inputUnitMagnitude = Constants.maxScalarInputEventMagnitude;
	}
	else {
		scalarInputEvent.inputUnitMagnitude = 0.0;
	}	

	var customEvent = new CustomCompatibleEvent(Constants.eventTypeScalarInput, {detail: scalarInputEvent});
	this.eventDispatcher.dispatchEvent(customEvent);
}
