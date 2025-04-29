/**
 * @file Fragment shader for foveated rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.2.4) Fragment Shader Foveation Blur */

var shaderID = "fShaderFoveated";

var shader = document.createTextNode( `
/***
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

// texture or uv coordinates of current fragment in normalized coordinates [0,1]
varying vec2 textureCoords;

// texture map from the first rendering pass
uniform sampler2D textureMap;

// resolution of the window in [pixels]
uniform vec2 windowSize;

// window space coordinates of gaze position in [pixels]
uniform vec2 gazePosition;

// eccentricity angle at boundary of foveal and middle layers
uniform float e1;

// eccentricity angle at boundary of middle and outer layers
uniform float e2;

// visual angle of one pixel
uniform float pixelVA;

// radius of middle layer blur kernel [in pixels]
const float middleKernelRad = 2.0;

// radius of outer layer blur kernel [in pixels]
const float outerKernelRad = 4.0;

// gaussian blur kernel for middle layer (5x5)
uniform float middleBlurKernel[int(middleKernelRad)*2+1];

// gaussian blur kernel for outer layer (9x9)
uniform float outerBlurKernel[int(outerKernelRad)*2+1];


void main() {

	vec2 windowPos = textureCoords*windowSize;
	float dist = length(gazePosition - windowPos); // distance to gaze position in [pixels]
	float distDegree = dist*pixelVA; // distance to gaze position in [degrees]





//This is wrong. use ed to fix this!! FIXXX

	vec4 frag = vec4(0,0,0,0);

	if (distDegree > e2) // outter layer
	{
		for(int x = 0; x < 9; x++) {
			for(int y = 0; y < 9; y++) {
				frag += outerBlurKernel[x]*outerBlurKernel[y]*texture2D( textureMap,  textureCoords - vec2(float(x - 4), float(y - 4)) / windowSize);
			}
		}
	}

	else if (distDegree > e1) // middle layer
	{
		for(int x = 0; x < 5; x++) {
			for(int y = 0; y < 5; y++) {
				frag += middleBlurKernel[x]*middleBlurKernel[y]*texture2D( textureMap,  textureCoords - vec2(float(x - 2), float(y - 2))/windowSize);
			}
		}
	}

	else
		frag += texture2D( textureMap,  textureCoords );
		
	gl_FragColor = frag;
	//gl_FragColor = texture2D( textureMap,  textureCoords );

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
