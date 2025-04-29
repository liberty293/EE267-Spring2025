/**
 * @file Fragment shader for DoF rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.3) DoF Rendering */

var shaderID = "fShaderDof";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// texture map from the first rendering
uniform sampler2D textureMap;

// depth map from the first rendering
uniform sampler2D depthMap;

// Projection matrix used for the first pass
uniform mat4 projectionMat;

// Inverse of projectionMat
uniform mat4 invProjectionMat;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// Gaze position in [pixels]
uniform vec2 gazePosition;

// Diameter of pupil in [mm]
uniform float pupilDiameter;

// pixel pitch in [mm]
uniform float pixelPitch;

const float searchRad = 11.0;


// Compute the distance to fragment in [mm]
// p: texture coordinate of a fragment / a gaze position
//
// Note: GLSL is column major
float distToFrag( vec2 p ) {

	/* TODO (2.3.1) Distance to Fragment */
	float depth = texture2D( depthMap,  p)[0]; //number from 0-1
	float zndc = 2.0*depth-1.0;
	float xndc = 2.0*p.x/windowSize.x-1.0;
	float yndc = 2.0*p.y/windowSize.y-1.0;
	float P23 = projectionMat[2][3]; //bc column major?
	float P22 = projectionMat[2][2];
	float zcam = -P23/(zndc + P22);

	float wclip = -zcam;
	vec4 ndc = vec4(xndc, yndc, zndc, 1.0);
	vec4 clip = ndc*wclip; //in mm
	vec4 cam =  invProjectionMat * clip ;




	return sqrt(cam.x*cam.x + cam.y*cam.y + cam.z*cam.z); //distance to fragment in [mm]

}


// compute the circle of confusion in [mm]
// fragDist: distance to current fragment in [mm]
// focusDist: distance to focus plane in [mm]
float computeCoC( float fragDist, float focusDist ) {

	/* TODO (2.3.2) Circle of Confusion Computation */ 
	//CHECK THIS IT SEEMS SMALL
	float M = 17.0/(fragDist-17.0);
	return pupilDiameter * abs(focusDist-fragDist)/fragDist; //in [mm]

}

//ASK ON ED IF THE ACCOMODATION DIST IS IST TO FRAG FOR GAZE POS
// compute depth of field blur and return color at current fragment
vec3 computeBlur() {

	/* TODO (2.3.3) Retinal Blur */
	float accom = distToFrag(vec2(gazePosition.x/windowSize.x, gazePosition.y/windowSize.y));
	float dist = distToFrag(textureCoords);
	float CoC = computeCoC(dist,accom);
	vec4 col = vec4(0);
	int cols = 0; //colors averaging over
	for(int x = 0; x < 11; x++) {
		for(int y = 0; y < 11; y++) {
			vec2 frag = textureCoords*windowSize - vec2(float(1*(5-x)),float(1*(5-y))); //search frag in pxls
			float mmAway = abs(distance(frag,textureCoords*windowSize))*pixelPitch; //distance from search frag in mm
			if (mmAway < CoC) //within circle; average it
			{
				col += texture2D( textureMap,  frag/windowSize );
				cols ++;
			}
		}
	}
	if (cols == 0) {
		return vec3(texture2D( textureMap,  textureCoords ));;
	}
	return vec3(col/float(cols));
}


void main() {

	gl_FragColor = vec4(computeBlur(),1);

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
