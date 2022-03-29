/*
Uniforms already defined by THREE.js
------------------------------------------------------
uniform mat4 viewMatrix; = camera.matrixWorldInverse
uniform vec3 cameraPosition; = camera position in world space
------------------------------------------------------
*/

uniform sampler2D textureMask; //Texture mask, color is different depending on whether this mask is white or black.
uniform sampler2D textureNumberMask; //Texture containing the billard ball's number, the final color should be black when this mask is black.
uniform vec3 maskLightColor; //Ambient/Diffuse/Specular Color when textureMask is white
uniform vec3 materialDiffuseColor; //Diffuse color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform vec3 materialSpecularColor; //Specular color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform vec3 materialAmbientColor; //Ambient color when textureMask is black (You can assume this is the default color when you are not using textures)
uniform float shininess; //Shininess factor

uniform vec3 lightDirection; //Direction of directional light in world space
uniform vec3 lightColor; //Color of directional light
uniform vec3 ambientLightColor; //Color of ambient light

in vec3 shading;
in vec3 shadingTexture;
in vec2 uvCoord;

void main() {
	// Phong shading

	vec3 textureNumber = texture2D(textureNumberMask, uvCoord).xyz;
	vec3 texture = texture2D(textureMask, uvCoord).xyz;

	vec3 mixTexture = mix(shading, shadingTexture, texture);
	vec3 mixTextureNumber = mix(mixTexture, textureNumber, texture);

	gl_FragColor = vec4(mixTextureNumber, 1.0);
}