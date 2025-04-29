/**
 * @file Fragment shader for anaglyph rendering
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/14
 */

/* TODO (2.4.3) Color Channel Multiplexing */

var shaderID = "fShaderAnaglyph";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */

precision mediump float;

// uv coordinates after interpolation
varying vec2 textureCoords;

// Texture map for the left eye
uniform sampler2D textureMapL;

// Texture map for the right eye
uniform sampler2D textureMapR;

void main() {
	
	//convert to grayscale
	vec4 colorL = texture2D( textureMapL,  textureCoords );
	vec4 colorR = texture2D( textureMapR,  textureCoords );
	float grayColorL = 0.2989 * colorL.r + 0.5870 * colorL.g + 0.1140 * colorL.b;
	float grayColorR = 0.2989 * colorR.r + 0.5870 * colorR.g + 0.1140 * colorR.b;
	vec4 color = vec4( grayColorL, grayColorR, grayColorR, 1.0 );

	gl_FragColor = color;

}
` );

var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
