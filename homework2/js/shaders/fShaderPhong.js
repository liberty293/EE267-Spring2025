/**
 * @file Phong fragment shader
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2021/04/01
 */

/* TODO (2.2.2) */

var shaderID = "fShaderPhong";

var shader = document.createTextNode( `
/**
 * WebGL doesn't set any default precision for fragment shaders.
 * Precision for vertex shader is set to "highp" as default.
 * Do not use "lowp". Some mobile browsers don't support it.
 */
precision mediump float;

varying vec3 normalCam; // Normal in view coordinate
varying vec3 fragPosCam; // Fragment position in view cooridnate

uniform mat4 viewMat;

struct Material {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float shininess;
};

uniform Material material;

uniform vec3 attenuation;

uniform vec3 ambientLightColor;


/***
 * NUM_POINT_LIGHTS is replaced to the number of point lights by the
 * replaceNumLights() function in teapot.js before the shader is compiled.
 */
#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

#endif


void main() {

	// Compute ambient reflection
	vec3 ambientReflection = material.ambient * ambientLightColor;
	vec3 fColor = ambientReflection;

	vec4 P = vec4(fragPosCam,1.0);
	vec3 N = normalize(normalCam);

	for(int i = 0; i < NUM_POINT_LIGHTS; i++) {
		vec4 Lview = viewMat* vec4(pointLights[i].position,1.0);
		vec4 L = Lview - P; //vector from x to position, then in view space
		vec3 R = reflect(-normalize(L.xyz),N);
		float a = 1.0/(attenuation[0]+attenuation[1]*length(L)+attenuation[2]*length(L)*length(L));
		float d = max(dot(N,normalize(L.xyz)),0.0); //diffuse factor
		float s = pow(max(dot(R,normalize(-P.xyz)),0.0),material.shininess); //shine factor
		fColor += a * (d * material.diffuse * pointLights[i].color + s * material.specular * pointLights[i].color);
	}



	gl_FragColor = vec4( fColor, 1.0 );

}
` );


var shaderNode = document.createElement( "script" );

shaderNode.id = shaderID;

shaderNode.setAttribute( "type", "x-shader/x-fragment" );

shaderNode.appendChild( shader );

document.body.appendChild( shaderNode );
