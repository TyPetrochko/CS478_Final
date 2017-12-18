reflectionMapShader = function (gl) {
	
	var shaderProgram = gl.createProgram();
	
	shaderProgram.vertexShaderSource = "\
		uniform   mat4 uModelViewMatrix;   			\n\
		uniform   mat4 uProjectionMatrix;				\n\
		uniform   mat3 uViewSpaceNormalMatrix; \n\
		attribute vec3 aPosition;								\n\
		attribute vec4 aDiffuse;								\n\
		attribute vec4 aSpecular;								\n\
		attribute vec3 aNormal;									\n\
		attribute vec4 aAmbient;									\n\
		varying  vec3 vPos;											\n\
		varying  vec3 vNormal;									\n\
		varying  vec4 vdiffuse;									\n\
		varying  vec4 vspecular;								\n\
		varying  vec4 vambient;								\n\
		void main(void)													\n\
		{																				\n\
			vdiffuse = aDiffuse;										\n\
			vspecular = aSpecular;								\n\
			vambient = aAmbient; \n\
			vPos = vec3(uModelViewMatrix * vec4(aPosition, 1.0));	\n\
			vNormal =normalize( uViewSpaceNormalMatrix *  aNormal);\n\
			gl_Position = uProjectionMatrix*uModelViewMatrix * vec4(aPosition, 1.0);\n\
		}";
	shaderProgram.fragmentShaderSource = "\
		precision highp float;						\n\
		uniform vec4 uLightDirection;			\n\
		uniform vec3 uLightColor;					\n\
		uniform mat4 uViewToWorldMatrix;	\n\
		uniform  samplerCube uCubeMap;		\n\
		varying  vec3 vPos;								\n\
		varying vec4 vdiffuse;						\n\
		varying vec3 vNormal;							\n\
		varying vec4 vspecular;						\n\
		varying vec4 vambient;\n\
		void main(void)										\n\
		{																	\n\
		// normalize interpolated normal                         \n\
		vec3 N = normalize(vNormal);                             \n\
				                                                   \n\
		// light vector (positional light)                       \n\
		vec3 L = normalize(-uLightDirection.xyz);                \n\
				                                                   \n\
		// diffuse component                                     \n\
		float NdotL = max(0.0, dot(N, L));                       \n\
		vec3 lambert = (vdiffuse.xyz * uLightColor) * NdotL+vambient.xyz*uLightColor;     \n\
\n\
		vec3 reflected_ray 		= vec3(uViewToWorldMatrix* vec4(reflect(vPos,vNormal),0.0));\n\
		vec4 reflected_color 	= textureCube (uCubeMap,reflected_ray);\n\
		gl_FragColor = reflected_color*vspecular + vec4(lambert,1.0);		}";

	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shaderProgram.vertexShaderSource);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shaderProgram.fragmentShaderSource);
	gl.compileShader(fragmentShader);

	// Create the shader program


	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	
	shaderProgram.aPositionIndex = 0;
	shaderProgram.aColorIndex = 1;
	shaderProgram.aNormalIndex = 2;  

	gl.bindAttribLocation(shaderProgram,shaderProgram. aPositionIndex, "aPosition");
	gl.bindAttribLocation(shaderProgram,shaderProgram. aColorIndex, "aColor");
	gl.bindAttribLocation(shaderProgram, shaderProgram.aNormalIndex, "aNormal");

	gl.linkProgram(shaderProgram);
  
	shaderProgram.vertexShader = vertexShader;
	shaderProgram.fragmentShader = fragmentShader;

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n"   + gl.getShaderInfoLog(vertexShader)   + "\n\n";
		str += "FS:\n"   + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	}
	
	shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram,"uProjectionMatrix");
	shaderProgram.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram,"uModelViewMatrix");
	shaderProgram.uViewSpaceNormalMatrixLocation = gl.getUniformLocation(shaderProgram,"uViewSpaceNormalMatrix");

	return shaderProgram;
};

showCubeMapShader = function (gl) {
	
	var shaderProgram = gl.createProgram();
	
	shaderProgram.vertexShaderSource = "\
		uniform   mat4 uModelViewMatrix;                            \n\
		uniform   mat4 uProjectionMatrix;                            \n\
		attribute vec3 aPosition;                                       \n\
		varying vec3 vPos;                                       \n\
		void main(void)                                                 \n\
		{                                                               \n\
			  // vertex normal (in view space)                                   \n\
			vPos = aPosition;\n\
			gl_Position = uProjectionMatrix*uModelViewMatrix * vec4(aPosition, 1.0)  ;                         \n\
		}";
  
	shaderProgram.fragmentShaderSource = "\
		precision highp float;                                          \n\
		varying vec3 vPos;                                       \n\
		uniform  samplerCube uCubeMap; 				\n\
		void main(void)                                                 \n\
		{                                                               \n\
 			gl_FragColor = textureCube (uCubeMap,normalize(vPos));\n\
		}                                                               \n\
	";




	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shaderProgram.vertexShaderSource);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, shaderProgram.fragmentShaderSource);
	gl.compileShader(fragmentShader);

	// Create the shader program


	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	
	shaderProgram.aPositionIndex = 0;

	gl.bindAttribLocation(shaderProgram,shaderProgram. aPositionIndex, "aPosition");

	gl.linkProgram(shaderProgram);
  
	shaderProgram.vertexShader = vertexShader;
	shaderProgram.fragmentShader = fragmentShader;

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n"   + gl.getShaderInfoLog(vertexShader)   + "\n\n";
		str += "FS:\n"   + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	}
	
	shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram,"uProjectionMatrix");
	shaderProgram.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram,"uModelViewMatrix");
	shaderProgram.uCubeMapLocation = gl.getUniformLocation(shaderProgram,"uCubeMap");

	return shaderProgram;
};

lambertianSingleColorShader = function (gl) {

 var shaderProgram = gl.createProgram();
    
shaderProgram.vertex_shader = "\
precision highp float;     \n\
   \n\
uniform mat4 uProjectionMatrix;     \n\
uniform mat4 uModelViewMatrix;   \n\
uniform mat3 uViewSpaceNormalMatrix;   \n\
attribute vec3 aPosition;  \n\
attribute vec3 aNormal;    \n\
varying vec3 vpos;   \n\
varying vec3 vnormal;\n\
   \n\
void main()    \n\
{  \n\
  // vertex normal (in view space)     \n\
  vnormal = normalize(uViewSpaceNormalMatrix * aNormal); \n\
   \n\
  \n\
// vertex position (in view space)   \n\
  vec4 position = vec4(aPosition, 1.0);\n\
  vpos = vec3(uModelViewMatrix *  position);  \n\
   \n\
   \n\
   \n\
  // output    \n\
  gl_Position = uProjectionMatrix *uModelViewMatrix * position;   \n\
}  \n\
"; 

shaderProgram.fragment_shader = "\
precision highp float;     \n\
   \n\
varying vec3 vnormal;\n\
varying vec3 vpos;   \n\
uniform vec4 uLightDirection;\n\
   \n\
// positional light: position and color\n\
uniform vec3 uLightColor;  \n\
uniform vec4 uColor;    \n\
   \n\
void main()    \n\
{  \n\
  // normalize interpolated normal     \n\
  vec3 N = normalize(vnormal);     \n\
   \n\
  // light vector (positional light)   \n\
  vec3 L = normalize(-uLightDirection.xyz); \n\
   \n\
  // diffuse component     \n\
  float NdotL = max(0.0, dot(N, L));   \n\
  vec3 lambert = (uColor.xyz * uLightColor) * NdotL;    \n\
   \n\
  // ambient component     \n\
  float far = 800.0; \n\
  float near = 10.0; \n\
  float fogFactor = (far - abs(vpos[2]))/(far - near); \n\
  vec3 fogColor = vec3(0.8, 0.5, 0.5); \n\
  fogFactor = clamp( fogFactor, 0.0, 1.0 ); \n\
  lambert[0] = (lambert[0]*(fogFactor)+(1.0-fogFactor)*fogColor[0])/2.0; \n\
  lambert[1] = (lambert[1]*(fogFactor)+(1.0-fogFactor)*fogColor[1])/2.0; \n\
  lambert[2] = (lambert[2]*(fogFactor)+(1.0-fogFactor)*fogColor[2])/2.0; \n\
  gl_FragColor  = vec4(lambert, 1.0);     \n\
  }  \n\
";


  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
   gl.shaderSource(vertexShader, shaderProgram.vertex_shader);
  gl.compileShader(vertexShader);
  
  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, shaderProgram.fragment_shader);
  gl.compileShader(fragmentShader);
  

  // Create the shader program
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  shaderProgram.aPositionIndex = 0;
  shaderProgram.aNormalIndex = 2;  
  gl.bindAttribLocation(shaderProgram, shaderProgram.aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, shaderProgram.aNormalIndex, "aNormal");
  gl.linkProgram(shaderProgram);
      
shaderProgram.vertexShader = vertexShader;
shaderProgram.fragmentShader = fragmentShader;
    
  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
    var str = "";
    str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
    str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
    str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
    alert(str);
  }
  

  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram,"uProjectionMatrix");
  shaderProgram.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram,"uModelViewMatrix");
  shaderProgram.uViewSpaceNormalMatrixLocation = gl.getUniformLocation(shaderProgram,"uViewSpaceNormalMatrix");
  shaderProgram.uLightDirectionLocation = gl.getUniformLocation(shaderProgram,"uLightDirection");
  shaderProgram.uLightColorLocation = gl.getUniformLocation(shaderProgram,"uLightColor");
  shaderProgram.uColorLocation = gl.getUniformLocation(shaderProgram,"uColor");
  
  return shaderProgram;
};

phongShader = function (gl) {

 var shaderProgram = gl.createProgram();
	
shaderProgram.vertex_shader = "\
precision highp float;                                               \n\
                                                                     \n\
uniform mat4 uProjectionMatrix;                             \n\
uniform mat4 uModelViewMatrix;                                       \n\
uniform mat3 uViewSpaceNormalMatrix;                                 \n\
uniform vec4 uLightDirection; \n\
attribute vec3 aPosition;                                            \n\
attribute vec3 aNormal;                                              \n\
attribute vec4 aDiffuse; \n\
attribute vec4 aAmbient; \n\
attribute vec4 aSpecular; \n\
attribute vec4 aShininess; \n\
varying vec3 vpos;                                                   \n\
varying vec3 vnormal;                                                \n\
varying vec4 vLightDirection;                                                \n\
varying vec4 vdiffuse;\n\
varying vec4 vambient;\n\
varying vec4 vspecular;\n\
varying vec4 vshininess; \n\
\n\
\n\
void main()                                                          \n\
{                                                                    \n\
  // vertex normal (in view space)                                   \n\
  vnormal = normalize(uViewSpaceNormalMatrix * aNormal);             \n\
                                                                     \n\
  // color   (in view space)                                   \n\
  vdiffuse = aDiffuse;             \n\
  vambient = aAmbient;  \n\
  vspecular = aSpecular;  \n\
  vshininess = aShininess;  \n\
// vertex position (in view space)                                 \n\
  vec4 position = vec4(aPosition, 1.0);                              \n\
  vpos = vec3(uModelViewMatrix * position);                          \n\
                                                                     \n\
  vLightDirection =  uLightDirection; \n\
  // output                                                          \n\
  gl_Position = uProjectionMatrix *uModelViewMatrix * position;               \n\
}                                                                    \n\
"; 

shaderProgram.fragment_shader = "\
precision highp float;                                               \n\
                                                                     \n\
varying vec3 vnormal;                                                \n\
varying vec3 vpos;                                                   \n\
varying vec4 vLightDirection;                                                \n\
varying vec4 vdiffuse;\n\
varying vec4 vambient;\n\
varying vec4 vspecular;\n\
varying vec4 vshininess; \n\
                                                                     \n\
// positional light:  color                              \n\
uniform vec3 uLightColor;                                            \n\
                                                                     \n\
vec3 phongShading( vec3 L, vec3 N, vec3 V, vec3 lightColor){\n\
	vec3 mat_ambient = vambient.xyz;                            \n\
	vec3 mat_diffuse = vdiffuse.xyz;                            \n\
	vec3 mat_specular= vspecular.xyz;                            \n\
	\n\
	// ambient component (ambient light is assumed white)              \n\
	vec3 ambient = mat_ambient*lightColor;                                        \n\
	\n\
	// diffuse component                                               \n\
	float NdotL = max(0.0, dot(N, L));                                 \n\
	vec3 diffuse = (mat_diffuse * lightColor) * NdotL;                \n\
							     \n\
	// specular component                                              \n\
	vec3 R = normalize((2.0 * NdotL * N) - L);                                    \n\
	float RdotV = max(0.0, dot(R, V));                                 \n\
	float spec = pow(RdotV, vshininess.x);                               \n\
	vec3 specular = (mat_specular * lightColor) * spec;               \n\
								 \n\
	vec3 contribution = ambient + diffuse + specular;  \n\
	return    contribution  ; \n\
}\n\
void main()                                                          \n\
{                                                                    \n\
  // normalize interpolated normal                                   \n\
  vec3 N = normalize(vnormal);	                                     \n\
                                                                     \n\
  // light vector (positional light)                                 \n\
  vec3 L =	normalize(-vLightDirection.xyz);                         \n\
                                                                     \n\
  // vertex-to-eye (view vector)                                     \n\
  vec3 V = normalize(-vpos);                                         \n\
                                                                     \n\
  vec3 finalcolor  = phongShading(   L,   N,   V,  uLightColor);  \n\
   gl_FragColor  = vec4(finalcolor,1.0);                             \n\
  }                                                                    \n\
";


  // create the vertex shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
   gl.shaderSource(vertexShader, shaderProgram.vertex_shader);
  gl.compileShader(vertexShader);
  
  // create the fragment shader
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, shaderProgram.fragment_shader);
  gl.compileShader(fragmentShader);
  

  // Create the shader program
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  shaderProgram.aPositionIndex = 0;
  shaderProgram.aColorIndex = 1;
  shaderProgram.aNormalIndex = 2;  
  gl.bindAttribLocation(shaderProgram, shaderProgram.aPositionIndex, "aPosition");
  gl.bindAttribLocation(shaderProgram, shaderProgram.aColorIndex, "aColor");
  gl.bindAttribLocation(shaderProgram, shaderProgram.aNormalIndex, "aNormal");
  gl.linkProgram(shaderProgram);
  	
shaderProgram.vertexShader = vertexShader;
shaderProgram.fragmentShader = fragmentShader;
	
  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
	var str = "";
	str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
	str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
	str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
	alert(str);
  }
  

  shaderProgram.uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram,"uProjectionMatrix");
  shaderProgram.uModelViewMatrixLocation = gl.getUniformLocation(shaderProgram,"uModelViewMatrix");
  shaderProgram.uViewSpaceNormalMatrixLocation = gl.getUniformLocation(shaderProgram,"uViewSpaceNormalMatrix");
  shaderProgram.uLightDirectionLocation = gl.getUniformLocation(shaderProgram,"uLightDirection");
  
  return shaderProgram;
};
