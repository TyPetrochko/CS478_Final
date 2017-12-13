// Global NVMC Client
// ID 6.0
/***********************************************************************/
var NVMCClient = NVMCClient || {};
/***********************************************************************/
NVMCClient.sgl_car_model = null;
NVMCClient.sgl_renderer = null;

NVMCClient.sunLightDirection = SglVec4.normalize([1, -0.5, 0, 0,0.0]);

var print = true;
NVMCClient.drawCube = function (gl, shaderToUse, position, scale, color) {
  if(print){
    print = false;
    console.log(this.cone);
    console.log(this.cylinder);
    console.log(this.cube);
  }
  stack = this.stack;

	stack.push();
	var M_0_tra1 = SglMat4.translation(position);
	stack.multiply(M_0_tra1);

	var M_0_sca = SglMat4.scaling(scale);
	stack.multiply(M_0_sca);

	gl.uniformMatrix4fv(shaderToUse.uModelViewMatrixLocation, false, stack.matrix);
	var InvT = SglMat4.inverse(this.stack.matrix)
	InvT = SglMat4.transpose(InvT);
	gl.uniformMatrix3fv(shaderToUse.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(InvT));
	this.drawObject(gl, this.cube, shaderToUse, color);
	stack.pop();
};

NVMCClient.drawTree = function (gl, shaderToUse, stackToUse) {
	var stack = stackToUse;
	if (!stack)
		stack = this.stack;

	stack.push();
	var M_0_tra1 = SglMat4.translation([0, 0.8, 0]);
	stack.multiply(M_0_tra1);

	var M_0_sca = SglMat4.scaling([0.6, 1.65, 0.6]);
	stack.multiply(M_0_sca);

	gl.uniformMatrix4fv(shaderToUse.uModelViewMatrixLocation, false, stack.matrix);
	var InvT = SglMat4.inverse(this.stack.matrix)
	InvT = SglMat4.transpose(InvT);
	gl.uniformMatrix3fv(shaderToUse.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(InvT));
	this.drawObject(gl, this.cone, shaderToUse, [0.2, 0.52, 0.1, 1.0]);
	stack.pop();

	stack.push();
	var M_1_sca = SglMat4.scaling([0.25, 0.4, 0.25]);
	stack.multiply(M_1_sca);

	gl.uniformMatrix4fv(shaderToUse.uModelViewMatrixLocation, false, stack.matrix);
	var InvT = SglMat4.inverse(this.stack.matrix)
	InvT = SglMat4.transpose(InvT);
	gl.uniformMatrix3fv(shaderToUse.uViewSpaceNormalMatrixLocation, false, SglMat4.to33(InvT));
	this.drawObject(gl, this.cylinder, shaderToUse, [0.5, 0.13, 0.12, 1.0]);
	stack.pop();
};

NVMCClient.loadCarModel = function (gl, data) {//line 158, Listing 6.5{
	if (!data)
		data = NVMC.resource_path+"geometry/cars/eclipse/eclipse.obj";
	var that = this;
	this.sgl_car_model = null;
	sglRequestObj(data, function (modelDescriptor) {
		that.sgl_car_model = new SglModel(that.ui.gl, modelDescriptor);
		that.ui.postDrawEvent();
	});
};//line 167}

