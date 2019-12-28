// VertexShaderStandardPositionShader.shader - Applies a transformation to vertices, using a
//                                             supplied transformation matrix; also applied
//       									   color, normal, lighting and texture coordinate data
// Author: Ayodeji Oshinnaiye

attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
uniform mediump vec3 uniform_ambientLightVector;
attribute vec2 aTextureCoord;

varying mediump vec2 vTextureCoord;
varying lowp vec4 vBaseFragmentColor;
varying mediump vec3 vNormalVector;

uniform mat4 uniform_transformationMatrix;

void main() {
	vec4 finalPosition = vec4(aVertexPosition, 1.0) * uniform_transformationMatrix;
	gl_Position = finalPosition;//vec4(finalPosition.xyz, (finalPosition.z + 1.0));
	vTextureCoord = aTextureCoord;
	vBaseFragmentColor = aVertexColor;
	vNormalVector = aVertexNormal * mat3(uniform_transformationMatrix);
}
