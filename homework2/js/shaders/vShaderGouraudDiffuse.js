/**
 * @file Gouraud vertex shader with diffuse and ambient light
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.1.1), (2.1.3) */

var shaderID = "vShaderGouraudDiffuse";

var shader = document.createTextNode( `
/**
 * varying qualifier is used for passing variables from a vertex shader
 * to a fragment shader. In the fragment shader, these variables are
 * interpolated between neighboring vertexes.
 */
varying vec3 vColor; // Color at a vertex

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform mat4 modelViewMat;
uniform mat3 normalMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;

attribute vec3 position;
attribute vec3 normal;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 color;
		vec3 position; //I believe this is world space??
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	//translate into view space
	vec4 P =  modelViewMat * vec4(position,1.0);
	vec3 N = normalMat * normal;


	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;
	for(int i = 0; i < NUM_POINT_LIGHTS; i++) {
		vec4 Lview = viewMat* vec4(pointLights[i].position,1.0);
		vec4 L = Lview - P; //vector from x to position, then in view space
		float a = 1.0/(attenuation[0]+attenuation[1]*length(L)+attenuation[2]*length(L)*length(L));
		float d = max(dot(N,normalize(L.xyz)),0.0);
		vColor += a * d * material.diffuse * pointLights[i].color;
	}
	vColor += ambientReflection;
	//vColor.r = dot(N,normalize(L.xyz));

	gl_Position =
		projectionMat * modelViewMat * vec4( position, 1.0 );





}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-vertex" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
