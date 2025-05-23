/**
 * @file functions to compute model/view/projection matrices
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/21
 */



/**
  * MVPmat
  *
  * @class MVPmat
  * @classdesc Class for holding and computing model/view/projection matrices.
  *
  * @param  {DisplayParameters} dispParams    display parameters
  */
var MVPmat = function ( dispParams ) {

	// Alias for accessing this from a closure
	var _this = this;


	this.modelMat = new THREE.Matrix4();

	this.stereoViewMat =
		{ L: new THREE.Matrix4(), R: new THREE.Matrix4() };

	this.stereoProjectionMat =
		{ L: new THREE.Matrix4(), R: new THREE.Matrix4() };


	/* Functions */

	// A function to compute a model transform matrix
	function computeModelTransform( state ) {

		var modelTranslation = state.modelTranslation;

		var modelRotation = state.modelRotation;

		var translationMat
			= new THREE.Matrix4().makeTranslation(
				modelTranslation.x,	modelTranslation.y, modelTranslation.z );

		var rotationMatX =
			new THREE.Matrix4().makeRotationX(
				modelRotation.x * THREE.MathUtils.DEG2RAD );

		var rotationMatY =
			new THREE.Matrix4().makeRotationY(
				modelRotation.y * THREE.MathUtils.DEG2RAD );

		var modelMatrix = new THREE.Matrix4().
			premultiply( rotationMatY ).
			premultiply( rotationMatX ).
			premultiply( translationMat );

		return modelMatrix;

	}

	// A function to compute a model matrix based on the current state
	function computeViewTransform( state, halfIpdShift ) {

		var viewerPosition = state.viewerPosition;

		var viewerTarget = state.viewerTarget;

		var viewerUp = new THREE.Vector3( 0, 1, 0 );

		var translationMat
	   = new THREE.Matrix4().makeTranslation(
			 - viewerPosition.x,
			 - viewerPosition.y,
			 - viewerPosition.z );

		var rotationMat = new THREE.Matrix4().lookAt(
			viewerPosition, viewerTarget, viewerUp ).transpose();

		var ipdTranslateMat
			= new THREE.Matrix4().makeTranslation( halfIpdShift, 0, 0 );

		return new THREE.Matrix4()
			.premultiply( translationMat )
			.premultiply( rotationMat )
			.premultiply( ipdTranslateMat );

	}


	function computePerspectiveTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		return new THREE.Matrix4()
			.makePerspective( left, right, top, bottom, clipNear, clipFar );

	}

	// A function to compute frustum parameters for stereo rendering.
	// Returns top/bottom/left/right values for left and right eyes.
	//
	// OUTPUT:
	// (left eye) topL, bottomL, leftL, rightL
	// (right eye) topR, bottomR, leftR, rightR
	//
	// NOTE:
	// The default values are wrong. Replace them.
	// All the parameters you need for your calculations are found in the function arguments.
	function computeTopBottomLeftRight( clipNear, clipFar, dispParams ) {
		// console.log(clipNear)
		// console.log(clipFar)
		/* TODO (2.1.2) Stereo Rendering */
		var h = dispParams.canvasHeight * dispParams.pixelPitch * dispParams.lensMagnification;
		var w1 = dispParams.lensMagnification * dispParams.ipd / 2;
		var w2 = dispParams.lensMagnification * (dispParams.canvasWidth * dispParams.pixelPitch - dispParams.ipd ) / 2	;	// in [mm]

		var rightL = clipNear * w1 / (dispParams.distanceScreenViewer) ;
		var leftL = -clipNear * w2 / (dispParams.distanceScreenViewer);
		var topL = clipNear * h / (2 * dispParams.distanceScreenViewer);
		var bottomL = -clipNear * h / (2 * dispParams.distanceScreenViewer);

		var rightR = clipNear * w2 / (dispParams.distanceScreenViewer) ;
		var leftR = -clipNear * w1 / (dispParams.distanceScreenViewer);

		var topR = topL;
		var bottomR = bottomL;
		//console.log( topL + " " + bottomL + " " + leftL + " " + rightL );
		//console.log( w1 + " " + w2 );
		// Return the values
		return {
			topL: topL, bottomL: bottomL, leftL: leftL, rightL: rightL,
			topR: topR, bottomR: bottomR, leftR: leftR, rightR: rightR,
		};

		// return {
		// 	topL: topL, bottomL: bottomL, leftL: leftL, rightL: rightL,
		// 	topR: 80, bottomR: - 80, leftR: - 80, rightR: 80,
		// };

	}

	// Update the model/view/projection matrices based on the current state
	// This function is called in every frame.
	//
	// INPUT
	// state: the state object of StateController
	// renderingMode: this variable decides which matrices are updated
	function update( state ) {

		var clipNear = state.clipNear;

		var clipFar = state.clipFar;

		// Compute model matrix
		this.modelMat = computeModelTransform( state );

		// Compute view matrix
		this.stereoViewMat.L = computeViewTransform( state, dispParams.ipd / 2 );

		this.stereoViewMat.R = computeViewTransform( state, - dispParams.ipd / 2 );

		// Compute projection matrix
		var projParams = computeTopBottomLeftRight( clipNear, clipFar, dispParams );

		this.stereoProjectionMat.L = computePerspectiveTransform(
			projParams.leftL, projParams.rightL, projParams.topL, projParams.bottomL, clipNear, clipFar );

		this.stereoProjectionMat.R = computePerspectiveTransform(
			projParams.leftR, projParams.rightR, projParams.topR, projParams.bottomR, clipNear, clipFar );

	}



	/* Expose as public functions */

	this.computeModelTransform = computeModelTransform;

	this.computeViewTransform = computeViewTransform;

	this.computePerspectiveTransform = computePerspectiveTransform;

	this.computeTopBottomLeftRight = computeTopBottomLeftRight;

	this.update = update;

};
