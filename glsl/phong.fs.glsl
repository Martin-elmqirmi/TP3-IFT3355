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

in vec3 relativeVertex;
in vec3 relativeNormal;
in vec2 uvCoord;

void main() {
	// phong shading
	vec3 newLightDirection = normalize(viewMatrix * vec4(-lightDirection, 0.0)).xyz;
	vec3 viewDirection = normalize(-relativeVertex);
	vec3 normal = normalize(relativeNormal);
	vec3 r = normalize(reflect(-newLightDirection, normal));

	// ambiant light
	vec3 ambiant = ambientLightColor * materialAmbientColor;
	vec3 ambiantT = ambientLightColor * maskLightColor;

	// diffuse light
	vec3 diffuse = lightColor * materialDiffuseColor * max(dot(newLightDirection, normal), 0.0);
	vec3 diffuseT = lightColor * maskLightColor * max(dot(newLightDirection, normal), 0.0);

	// specular light
	vec3 specular = lightColor * materialSpecularColor * pow(max(dot(viewDirection, r), 0.0), shininess);
	vec3 specularT = lightColor * maskLightColor * pow(max(dot(viewDirection, r), 0.0), shininess);

	vec3 textureNumber = texture2D(textureNumberMask, uvCoord).xyz;
	vec3 texture = texture2D(textureMask, uvCoord).xyz;
	vec3 shadingTexture = ambiantT + diffuseT + specularT;
	vec3 shading = ambiant + diffuse + specular;

	vec3 mixTexture = mix(shading, shadingTexture, texture);
	vec3 mixTextureNumber = mix(mixTexture, textureNumber, texture);

	// final color
	gl_FragColor = vec4(mixTextureNumber, 1.0);
}