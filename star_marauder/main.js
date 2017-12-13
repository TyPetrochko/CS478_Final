// Global NVMC Client
// ID 7.4
//

var SHIP_COLOR = [0.15,0.05,0.05];
var TILT_MODIFIER = 0.006;
var YAW_MODIFIER = 0.003;
var COLLISION_ROOM = 0.5;
var DIRT_COLOR = [.347, .257, .257, 1]
/***********************************************************************/
var NVMCClient = NVMCClient || {};
/***********************************************************************/
NVMCClient.reflectionMap = null;
NVMCClient.reflectionMapShader = null;	
NVMCClient.cubeMapFrameBuffers = [];
	
NVMCClient.prepareRenderToCubeMapFrameBuffer= function (gl) {
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.reflectionMap);
	var faces = [ 	gl.TEXTURE_CUBE_MAP_POSITIVE_X,gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Y,gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Z,gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
			
	for(var f = 0; f < 6; ++f){
		var newframebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, newframebuffer);
		newframebuffer.width = 512;
		newframebuffer.height = 512;	

		var renderbuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, newframebuffer.width, newframebuffer.height);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, faces[f], this.reflectionMap, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
		
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		    if (status != gl.FRAMEBUFFER_COMPLETE) {
		      throw("gl.checkFramebufferStatus() returned " + WebGLDebugUtils.glEnumToString(status));
		    }
		this.cubeMapFrameBuffers [f] = newframebuffer;

	}

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


NVMCClient.createReflectionMap = function(gl){
	this.reflectionMap = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP,  this.reflectionMap);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,		0, 	gl.RGBA, 512,512,0,	gl.RGBA, 	gl.UNSIGNED_BYTE,null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, 	gl.UNSIGNED_BYTE,null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, 	gl.UNSIGNED_BYTE,null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, 	gl.UNSIGNED_BYTE,null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, 	gl.UNSIGNED_BYTE,null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 	0, 	gl.RGBA, 512,512,0,	gl.RGBA, 	gl.UNSIGNED_BYTE,null);
	
 	gl.texParameteri(	gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
 	gl.texParameteri(	gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);        
        gl.texParameteri(	gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(	gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}

NVMCClient.drawOnReflectionMap = function (gl, position){//line61, Listing 7.9{
	this.projectionMatrix = SglMat4.perspective(Math.PI/2.0,1.0,0.1,300);
	gl.viewport(0,0,this.cubeMapFrameBuffers[0].width,this.cubeMapFrameBuffers[0].height);
	gl.clearColor(0,0,0,1);
	// +x
	this.stack.load(SglMat4.lookAt(position,SglVec3.add(position,[1.0,0.0,0.0]),[0.0,-1.0,0.0]));
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.cubeMapFrameBuffers[0]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	this.drawSkyBox(gl);
	this.drawEverything(gl,true, this.cubeMapFrameBuffers[0]);	
	
	// -x
	this.stack.load(SglMat4.lookAt(position,SglVec3.add(position,[-1.0,0.0,0.0]),[0.0,-1.0,0.0]));
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.cubeMapFrameBuffers[1]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	this.drawSkyBox(gl);//line 76}
	this.drawEverything(gl,true, this.cubeMapFrameBuffers[1]);	
		
	// +z
	this.stack.load(SglMat4.lookAt(position,SglVec3.add(position,[0.0,0.0,1.0]),[0.0,-1.0,0.0]));
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.cubeMapFrameBuffers[4]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	this.drawSkyBox(gl);
	this.drawEverything(gl,true, this.cubeMapFrameBuffers[2]);

	// -z
	this.stack.load(SglMat4.lookAt(position,SglVec3.add(position,[0.0,0.0,-1.0]),[0.0,-1.0,0.0]));
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.cubeMapFrameBuffers[5]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	this.drawSkyBox(gl);
	this.drawEverything(gl,true, this.cubeMapFrameBuffers[3]);
	
	// +y
	this.stack.load(SglMat4.lookAt(position,SglVec3.add(position,[0.0,1.0,0.0]),[0.0,0.0,1.0]));
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.cubeMapFrameBuffers[2]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	this.drawSkyBox(gl);
	this.drawEverything(gl,true, this.cubeMapFrameBuffers[4]);

	// -y
	this.stack.load(SglMat4.lookAt(position,SglVec3.add(position,[ 0.0,-1.0,1.0]),[0.0,0.0,-1.0]));
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.cubeMapFrameBuffers[3]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	this.drawSkyBox(gl);
	this.drawEverything(gl,true, this.cubeMapFrameBuffers[5]);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


NVMCClient.drawCar = function (gl){
  	this.sgl_renderer.begin();
   	this.sgl_renderer.setTechnique(this.sgl_technique);
   
	 
    	this.sgl_renderer.setGlobals({
   					"PROJECTION_MATRIX":this.projectionMatrix,
					"WORLD_VIEW_MATRIX":this.stack.matrix,
					"VIEW_SPACE_NORMAL_MATRIX"     : SglMat4.to33(this.stack.matrix) ,
					"CUBE_MAP"            : 2,
					"VIEW_TO_WORLD_MATRIX": this.viewFrame,
					"LIGHTS_GEOMETRY":		this.sunLightDirectionViewSpace,
					"LIGHT_COLOR": SHIP_COLOR
		});
   
   	this.sgl_renderer.setPrimitiveMode("FILL");
   	
  	this.sgl_renderer.setModel(this.sgl_car_model);
 	this.sgl_renderer.setTexture(2,new SglTextureCubeMap(gl,this.reflectionMap));
	this.sgl_renderer.renderModel();
	this.sgl_renderer.end();
};	

NVMCClient.createTechniqueReflection = function (gl){
	
	this.sgl_renderer = new SglModelRenderer(gl);	
	this.sgl_technique = new SglTechnique( gl,
		{	vertexShader	:this.reflectionMapShader.vertexShaderSource, 
			fragmentShader	:this.reflectionMapShader.fragmentShaderSource,
			vertexStreams 		: 
			{
				"aPosition"		: [ 0.0,0.0,0.0],
				"aDiffuse"		: [ 0.0,0.0,0.0,1.0],
				"aSpecular"		: [ 0.0,0.0,0.0,1.0],
				"aNormal" 		: [ 0.0,1.0,1.0],
				"aAmbient" 		: [ 0.0,1.0,1.0,1.0]
			},
			globals : {
				"uProjectionMatrix" : { semantic : "PROJECTION_MATRIX", value : this.projectionMatrix },
				"uModelViewMatrix":{semantic:"WORLD_VIEW_MATRIX",value : this.stack.matrix },
				"uViewSpaceNormalMatrix"     : { semantic : "VIEW_SPACE_NORMAL_MATRIX",     value :SglMat4.to33(this.stack.matrix) },
				"uViewToWorldMatrix": { semantic : "VIEW_TO_WORLD_MATRIX",     value :SglMat4.identity()},
 				"uCubeMap":						{semantic: "CUBE_MAP", value:2},
				"uLightDirection": 		{semantic: "LIGHTS_GEOMETRY",value: this.sunLightDirectionViewSpace},
				"uLightColor": 				{semantic: "LIGHT_COLOR",value: [0.4,0.4,0.4]},
			}
		});
};


NVMCClient.drawEverything = function (gl,excludeCar) {
	var stack  = this.stack;
	this.sunLightDirectionViewSpace = SglMat4.mul4(this.stack.matrix,this.sunLightDirection);
	var pos  = this.game.state.players.me.dynamicState.position;	
	
	// Setup projection matrix
	gl.useProgram(this.lambertianSingleColorShader);
	gl.uniformMatrix4fv(this.lambertianSingleColorShader.uProjectionMatrixLocation,false,this.projectionMatrix);
	gl.uniform4fv(this.lambertianSingleColorShader.uLightDirectionLocation,this.sunLightDirectionViewSpace);
	gl.uniform3fv(this.lambertianSingleColorShader.uLightColorLocation,[1.0,1.0,1.0]);
	// var trees = this.game.race.trees;
	// for (var t in trees) {
	// 	stack.push();
	// 		var M_8 = SglMat4.translation(trees[t].position);
	// 		stack.multiply(M_8);
	// 		this.drawTree(gl,this.lambertianSingleColorShader);
	// 	stack.pop();
	// }
  
  for (var i = 0; i < Objects.cubes.length; i++) {
    var cube = Objects.cubes[i];
    this.drawCube(gl, this.lambertianSingleColorShader,
        cube.position, [cube.scale, cube.scale, cube.scale], cube.color);
  }
  
  for (var i = 0; i < Objects.spheres.length; i++) {
    var sphere = Objects.spheres[i];
    this.drawSphere(gl, this.lambertianSingleColorShader,
        sphere.position, [sphere.scale, sphere.scale, sphere.scale], sphere.color);
  }

  for (var i = 0; i < Objects.surfaces.length; i++) {
    for (var j = 0; j < Objects.surfaces[i].length; j++){
      var obj = Objects.surfaces[i][j];
      this.drawSurface(obj.index[0], obj.index[1], gl, this.lambertianSingleColorShader, 
          obj.position, [1, 1, 1], DIRT_COLOR);

      if((POSITION[0] != 0 || POSITION[1] != 0 || POSITION[2] != 0)
          && this.surfaces[obj.index[0]][obj.index[1]].ycollider - POSITION[1] > COLLISION_ROOM) {
        gameOver();
        speed = 0.0;
      }
    }
  }
  // this.drawSurface(0, 1, gl, this.lambertianSingleColorShader, Objects.surfaces[0][1], [1, 1, 1], [1, 1, 1, 1]);

  this.sunLightDirection = getSunlightAngle();

	gl.activeTexture(gl.TEXTURE0);
  	gl.bindTexture(gl.TEXTURE_2D,this.texture_ground);
	gl.useProgram(this.textureShader);
	gl.uniformMatrix4fv(this.textureShader.uProjectionMatrixLocation, false, this.projectionMatrix);
	gl.uniformMatrix4fv(this.textureShader.uModelViewMatrixLocation, false, stack.matrix);
	gl.uniform1i(this.textureShader.uTextureLocation, 0);
	// this.drawObject(gl,this.ground,this.textureShader,[0.3, 0.7, 0.2,1.0], [0, 0, 0,1.0]);
  //   gl.bindTexture(gl.TEXTURE_2D, this.texture_street);
  //   this.drawObject(gl, this.track, this.textureShader, [0.9, 0.8, 0.7, 1.0], [0, 0, 0, 1.0]);

  // for (var i in this.buildings) {
 	// 	gl.bindTexture(gl.TEXTURE_2D, this.texture_facade[i%this.texture_facade.length]);
	// 	this.drawObject(gl, this.buildings[i], this.textureShader, [0.2, 0.2, 0.2, 1.0], [0, 0, 0, 1.0]);
  // }
 
	// gl.bindTexture(gl.TEXTURE_2D,this.texture_roof);
	// for (var i in this.buildings){
	// 	this.drawObject(gl, this.buildings[i].roof,this.textureShader, [0.2, 0.2, 0.2,1.0], [0, 0, 0,1.0]);
	// }

	if( !excludeCar &&  this.currentCamera!=3 ){
 		stack.push();
			var M_9 = SglMat4.translation(pos);
			stack.multiply(M_9);

			// var M_9bis = SglMat4.rotationAngleAxis(
      //     this.game.state.players.me.dynamicState.orientation, 
      //     [Math.sin(TILT*TILT_MODIFIER), Math.cos(TILT*TILT_MODIFIER), 0]);
			var M_9bis = SglMat4.rotationAngleAxis(
          this.game.state.players.me.dynamicState.orientation, 
          [Math.sin(TILT*TILT_MODIFIER),
          Math.cos(TILT*TILT_MODIFIER) + Math.cos(YAW*YAW_MODIFIER),
          Math.sin(YAW*YAW_MODIFIER)]);
			stack.multiply(M_9bis);

			this.drawCar(gl);
		stack.pop();
/*		{
			var M_9 = SglMat4.translation(SglVec3.add(pos,[0.0,5.0,0.0]));
			stack.multiply(M_9);
			
			gl.useProgram(this.showCubeMapShader);

 			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP,this.reflectionMap);
			gl.uniformMatrix4fv(this.showCubeMapShader.uProjectionMatrixLocation, false, this.projectionMatrix);
			gl.uniformMatrix4fv(this.showCubeMapShader.uModelViewMatrixLocation, false, stack.matrix);
			gl.uniform1i(this.showCubeMapShader.uCubeMapLocation, 0);			
			this.drawObject(gl,this.cube,this.showCubeMapShader, [0.2, 0.2, 0.2,1.0], [0, 0, 0,1.0]);
 		

		}	
		*/
	}
}

NVMCClient.drawScene = function (gl) {
    if(NVMCClient.n_resources_to_wait_for>0)return;
  var width  = this.ui.width;
	var height = this.ui.height
	var ratio  = width / height;
	 
	this.drawOnReflectionMap(gl,SglVec3.add(this.game.state.players.me.dynamicState.position,[0.0,1.5,0.0]));
	gl.viewport(0, 0, width, height);

	// Clear the framebuffer
	var stack  = this.stack;
	gl.clearColor(0.4, 0.6, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	 


	this.projectionMatrix = SglMat4.perspective(3.14/4,ratio,0.1,1000);
	this.cameras[2].projectionMatrix = this.projectionMatrix;

	stack.loadIdentity();
	var pos  = this.myPos();
	var orientation  = this.myOri();
	this.cameras[this.currentCamera].setView(this.stack,this.myFrame());

	this.viewFrame = SglMat4.inverse(this.stack.matrix);
	this.drawSkyBox(gl);

	gl.enable(gl.DEPTH_TEST);
	

  gl.disable(gl.STENCIL_TEST);
	
	 
	this.drawEverything(gl);
		 
	
	if( this.currentCamera==3 ){
		
		// draw the scene for the back mirror
		this.stack.loadIdentity();
		gl.useProgram(this.lambertianSingleColorShader);
		var invPositionMatrix 	= SglMat4.translation		(SglVec3.neg(SglVec3.add(this.game.state.players.me.dynamicState.position,[0,1.8,0])));
		var xMatrix 	= SglMat4.rotationAngleAxis	(-0.2, [1, 0, 0]);
		var invOrientationMatrix 	= SglMat4.rotationAngleAxis	(-this.game.state.players.me.dynamicState.orientation, [0, 1, 0]);
		var invV = SglMat4.mul(SglMat4.mul(xMatrix,invOrientationMatrix),invPositionMatrix);
		this.stack.multiply(invV);
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.rearMirrorTextureTarget.framebuffer);
		gl.disable(gl.STENCIL_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.drawEverything(gl);
		gl.bindFramebuffer(gl.FRAMEBUFFER,  null);
		
	 
		gl.useProgram(this.textureShader);
		gl.bindTexture(gl.TEXTURE_2D,this.rearMirrorTextureTarget.texture);
		gl.uniformMatrix4fv(this.textureShader.uModelViewMatrixLocation, false, SglMat4.identity());
		gl.uniformMatrix4fv(this.textureShader.uProjectionMatrixLocation, false, SglMat4.identity());
		this.drawObject( gl, this.rearMirror, this.textureShader,[1.0,1.0,1.0,1.0],[1.0,1.0,1.0,1.0]);
		
	}  
	
};
/***********************************************************************/



// NVMC Client Events
/***********************************************************************/
NVMCClient.onInitialize = function () {
	var gl = this.ui.gl;
	this.cameras[2].width  = this.ui.width;
	this.cameras[2].height = this.ui.height;


	/*************************************************************/
	NVMC.log("SpiderGL Version : " + SGL_VERSION_STRING + "\n");
	/*************************************************************/

	/*************************************************************/
	this.game.player.color = [ 1.0, 0.0, 0.0, 1.0 ];
	/*************************************************************/

	/*************************************************************/
	this.initMotionKeyHandlers();
	/*************************************************************/
	
	/*************************************************************/
	this.stack 			= new SglMatrixStack();
	this.projection_matrix 	=  SglMat4.identity();
	
	/*************************************************************/
	this.initializeObjects(gl);
	this.initializeCameras();

	this.lambertianSingleColorShader 	= new lambertianSingleColorShader(gl);
	this.phongShader 			        = new phongShader(gl);
	this.textureShader 			        = new textureShader(gl);
	this.skyBoxShader 			        = new skyBoxShader(gl);
	this.reflectionMapShader 	        = new reflectionMapShader(gl);
	this.showCubeMapShader	            = new showCubeMapShader(gl);
	
	/*************************************************************/

    this.texture_street = this.createTexture(gl, 				NVMC.resource_path+'textures/street4.png');
    this.texture_ground = this.createTexture(gl, 				NVMC.resource_path+'textures/grass_tile_003_col.png');
    NVMCClient.texture_facade.push(this.createTexture(gl,       NVMC.resource_path+'textures/facade1.jpg'));
    NVMCClient.texture_facade.push(this.createTexture(gl,       NVMC.resource_path+'textures/facade2.jpg'));
    NVMCClient.texture_facade.push(this.createTexture(gl,       NVMC.resource_path+'textures/facade3.jpg'));
    NVMCClient.texture_roof = this.createTexture(gl,			NVMC.resource_path+'textures/concreteplane2k.jpg');


    this.cubeMap = this.createCubeMap(gl,
        // NVMC.resource_path+'textures/cubemap/posx.jpg',
        // NVMC.resource_path+'textures/cubemap/negx.jpg',
        // NVMC.resource_path+'textures/cubemap/posy.jpg',
        // NVMC.resource_path+'textures/cubemap/bkg/blue/bkg1_right.png',
        // NVMC.resource_path+'textures/cubemap/bkg/blue/bkg1_left.png',
        // NVMC.resource_path+'textures/cubemap/bkg/blue/bkg1_top.png',
        NVMC.resource_path+'textures/cubemap/bkg/red/bkg2_right1.png',
        NVMC.resource_path+'textures/cubemap/bkg/red/bkg2_left2.png',
        NVMC.resource_path+'textures/cubemap/bkg/red/bkg2_top3.png',
        // NVMC.resource_path+'textures/cubemap/negy.jpg',
        // NVMC.resource_path+'textures/cubemap/posz.jpg',
        // NVMC.resource_path+'textures/cubemap/negz.jpg'
        // NVMC.resource_path+'textures/cubemap/bkg/blue/bkg1_bot.png',
        // NVMC.resource_path+'textures/cubemap/bkg/blue/bkg1_front.png',
        // NVMC.resource_path+'textures/cubemap/bkg/blue/bkg1_back.png'
        NVMC.resource_path+'textures/cubemap/bkg/red/bkg2_bottom4.png',
        NVMC.resource_path+'textures/cubemap/bkg/red/bkg2_front5.png',
        NVMC.resource_path+'textures/cubemap/bkg/red/bkg2_back6.png'
    );


	this.createReflectionMap(gl);
	
	// this.loadCarModel(gl,NVMC.resource_path+"geometry/cars/eclipse/eclipse-white.obj");
	// this.loadCarModel(gl,NVMC.resource_path+"geometry/cars/eclipse/sphere.obj");
	this.loadCarModel(gl,NVMC.resource_path+"geometry/ship.obj");
	this.createTechniqueReflection(gl);

	this.rearMirrorTextureTarget = this.prepareRenderToTextureFrameBuffer(gl);
	this.prepareRenderToCubeMapFrameBuffer(gl);
	// this.sunLightDirection = [-this.sunLightDirection[0],this.sunLightDirection[1],this.sunLightDirection[2],0.0]
	// this.sunLightDirection = [0,1,1,0.0]
  this.sunLightDirection = getSunlightAngle();

};


/***********************************************************************/
