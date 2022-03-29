/*
Uniforms already defined by THREE.js
------------------------------------------------------
uniform mat4 modelMatrix; = object.matrixWorld
uniform mat4 modelViewMatrix; = camera.matrixWorldInverse * object.matrixWorld
uniform mat4 projectionMatrix; = camera.projectionMatrix
uniform mat4 viewMatrix; = camera.matrixWorldInverse
uniform mat3 normalMatrix; = inverse transpose of modelViewMatrix
uniform vec3 cameraPosition; = camera position in world space
attribute vec3 position; = position of vertex in local space
attribute vec3 normal; = direction of normal in local space
attribute vec2 uv; = uv coordinates of current vertex relative to texture coordinates
------------------------------------------------------
*/

//Custom defined Uniforms for TP3
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

out vec3 shading; //On passe la couleur du sommet au fragment shader
out vec3 shadingTexture;
out vec2 uvCoord;

void main() {
	// phong shading
	
    // Multiply each vertex by the model-view matrix and the projection matrix to get final vertex position
    vec4 relativeVertexPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 relativeNormal = normalize(normalMatrix * normal);
    vec3 lightDirection = normalize(viewMatrix * vec4(-lightDirection, 0.0)).xyz;
    vec3 viewDirection = normalize(-relativeVertexPosition.xyz);
    vec3 r = normalize(-reflect(lightDirection, relativeNormal));

    // ambiant light
    vec3 ambiant = ambientLightColor * materialAmbientColor;
    vec3 ambiantT = ambientLightColor * maskLightColor;

    // diffuse light
    vec3 diffuse = lightColor * materialDiffuseColor * max(dot(lightDirection, relativeNormal), 0.0);
    vec3 diffuseT = lightColor * maskLightColor * max(dot(lightDirection, relativeNormal), 0.0);

    // specular light
    vec3 specular = lightColor * materialSpecularColor * pow(max(dot(viewDirection, r), 0.0), shininess);
    vec3 specularT = lightColor * maskLightColor * pow(max(dot(viewDirection, r), 0.0), shininess);

    // shading
    shading = ambiant + diffuse + specular;
    shadingTexture = ambiantT + diffuseT + specularT;

    uvCoord = uv;

    gl_Position = projectionMatrix * relativeVertexPosition;
}
