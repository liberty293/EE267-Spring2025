
/**
 * @file functions to compute model/view/projection matrices
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2025/03/18

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


	// A model matrix
	this.modelMat = new THREE.Matrix4();

	// A view matrix
	this.viewMat = new THREE.Matrix4();

	// A projection matrix
	this.projectionMat = new THREE.Matrix4();


	var topViewMat = new THREE.Matrix4().set(
		1, 0, 0, 0,
		0, 0, - 1, 0,
		0, 1, 0, - 1500,
		0, 0, 0, 1 );

	/* Functions */

	// A function to compute a model matrix based on the current state
	//
	// INPUT
	// state: state of StateController
	function computeModelTransform( state ) {

		/* TODO (2.1.
		1.3) Matrix Update / (2.1.2) Model Rotation  */
		
		var matx = new THREE.Matrix4().makeTranslation(state.modelTranslation);
		matx.makeRotationY(state.modelRotation.y);
		
		return matx.premultiply( new THREE.Matrix4().makeRotationX(state.modelRotation.x));

	}

	// A function to compute a view matrix based on the current state
	//
	// NOTE
	// Do not use lookAt().
	//
	// INPUT
	// state: state of StateController
	function computeViewTransform( state ) {

		/* TODO (2.2.3) Implement View Transform */
		let eye = state.viewerPosition.clone();
		let center = state.viewerTarget.clone();
		let z = (eye.sub(center)).normalize();
		let up = new THREE.Vector3(0,1,0);
		let x = new THREE.Vector3();
		x.crossVectors(up,z).normalize;
		let y = new THREE.Vector3();
		y.crossVectors(z,x).normalize;
		eye = state.viewerPosition.clone();

		var r = new THREE.Matrix4().set(
			x.x, x.y, x.z, 0,
			y.x, y.y, y.z, 0,
			z.x, z.y, z.z, 0,
			0, 0, 0, 1 );
		var t =   new THREE.Matrix4().set(
			1, 0, 0, -eye.x,
			0, 1, 0, -eye.y,
			0, 0, 1, -eye.z,
			0, 0, 0, 1 );
		
		var test = new THREE.Matrix4().set(
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1 );

		//console.log(test.multiplyMatrices(r,t));
		//console.log(state.viewerPosition.clone());

		return test.multiplyMatrices(r,t);
		// return new THREE.Matrix4().set(
		// 	1, 0, 0, 0,
		// 	0, 1, 0, 0,
		// 	0, 0, 1, - 800,
		// 	0, 0, 0, 1 );

	}

	// A function to compute a perspective projection matrix based on the
	// current state
	//
	// NOTE
	// Do not use makePerspective().
	//
	// INPUT
	// Notations for the input is the same as in the class.
	function computePerspectiveTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		/* TODO (2.3.1) Implement Perspective Projection */
		
		let jo =  new THREE.Matrix4().set(
			2*clipNear/(right-left), 0, (right+left)/(right-left), 0,
			0, 2*clipNear/(top-bottom), (top+bottom)/(top-bottom), 0,
			0, 0, -(clipFar+clipNear)/(clipFar-clipNear), -2*(clipFar*clipNear)/(clipFar-clipNear),
			0, 0, -1,  0);
			//
			
		let ans =  new THREE.Matrix4().set(
			6.7, 0, 0, 0,
			0, 6.5, 0, 0,
			0, 0, - 1.0, - 2.0,
			0, 0, - 1.0, 0 );

		return jo;


	}

	// A function to compute a orthographic projection matrix based on the
	// current state
	//
	// NOTE
	// Do not use makeOrthographic().
	//
	// INPUT
	// Notations for the input is the same as in the class.
	function computeOrthographicTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		/* TODO (2.3.2) Implement Orthographic Projection */
		
		
		let fo = new THREE.Matrix4().set(
			2/(right-left), 0, 0, -(right+left)/(right-left),
			0, 2/(top-bottom), 0, -(top+bottom)/(top-bottom),
			0, 0, - 2/(clipFar-clipNear), - (clipFar+clipNear)/(clipFar-clipNear),
			0, 0, 0, 1);

		// return new THREE.Matrix4().set(
		// 	6.7, 0, 0, 0,
		// 	0, 6.5, 0, 0,
		// 	0, 0, - 1.0, - 2.0,
		// 	0, 0, - 1.0, 0 );

		return fo;

	}

	// Update the model/view/projection matrices
	// This function is called in every frame (animate() function in render.js).
	function update( state ) {

		// Compute model matrix
		this.modelMat.copy( computeModelTransform( state ) );
		this.

		// Use the hard-coded view and projection matrices for top view
		if ( state.topView ) {

			this.viewMat.copy( topViewMat );

			var right = ( dispParams.canvasWidth * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

			var left = - right;

			var top = ( dispParams.canvasHeight * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

			var bottom = - top;

			this.projectionMat.makePerspective( left, right, top, bottom, 1, 10000 );

		} else {

			// Compute view matrix
			this.viewMat.copy( computeViewTransform( state ) );

			// Compute projection matrix
			if ( state.perspectiveMat ) {

				var right = ( dispParams.canvasWidth * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

				var left = - right;

				var top = ( dispParams.canvasHeight * dispParams.pixelPitch / 2 )
				* ( state.clipNear / dispParams.distanceScreenViewer );

				var bottom = - top;

				this.projectionMat.copy( computePerspectiveTransform(
					left, right, top, bottom, state.clipNear, state.clipFar ) );

			} else {

				var right = dispParams.canvasWidth * dispParams.pixelPitch / 2;

				var left = - right;

				var top = dispParams.canvasHeight * dispParams.pixelPitch / 2;

				var bottom = - top;

				this.projectionMat.copy( computeOrthographicTransform(
					left, right, top, bottom, state.clipNear, state.clipFar ) );

			}

		}

	}



	/* Expose as public functions */

	this.computeModelTransform = computeModelTransform;

	this.computeViewTransform = computeViewTransform;

	this.computePerspectiveTransform = computePerspectiveTransform;

	this.computeOrthographicTransform = computeOrthographicTransform;

	this.update = update;

};
