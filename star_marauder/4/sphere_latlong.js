function Sphere (resolution) {

	this.name = "sphere_latlong";

	// vertices definition
	////////////////////////////////////////////////////////////

	this.vertices = new Float32Array(3*(resolution*resolution+1));

	var radius = 1.0;
	var angle1, angle2;
	var pi = 3.141592653589793238462643383280;
	var step1 = pi / (resolution);
	var step2 = (2 * pi)/ resolution;

	var vertexoffset = 0;

	var x, y, z, rad;
	for(var i = 0; i < resolution; i++) {
		angle1 = step1 * i - (pi / 2);
		y = Math.sin(angle1);
		rad = Math.cos(angle1);
		for(var j = 0; j < resolution; j++) {
			angle2 = step2 * j;
			z = Math.sin(angle2) * rad;
			x = Math.cos(angle2) * rad;
			this.vertices[vertexoffset] = x;
			this.vertices[vertexoffset+1] = y;
			this.vertices[vertexoffset+2] = z;
			vertexoffset += 3;
		}
	}

	// Add top
	this.vertices[vertexoffset] = 0;
	this.vertices[vertexoffset+1] = 1;
	this.vertices[vertexoffset+2] = 0;

	// triangles definition
	////////////////////////////////////////////////////////////

	this.triangleIndices = new Uint16Array(3*2*(resolution * resolution));

	var triangleoffset = 0;
	for(var i = 0; i < resolution - 1; i++) {
		for(var j = 0; j < resolution; j++) {
			this.triangleIndices[triangleoffset] = i * resolution + j;
			this.triangleIndices[triangleoffset+1] = (i + 1) * resolution + j;
			this.triangleIndices[triangleoffset+2] = i * resolution + ((j + 1) % resolution);
			triangleoffset += 3;

			this.triangleIndices[triangleoffset] = i * resolution + ((j + 1) % resolution);
			this.triangleIndices[triangleoffset+1] = (i + 1) * resolution + j;
			this.triangleIndices[triangleoffset+2] = (i + 1) * resolution + ((j + 1) % resolution);
			triangleoffset += 3;
		}
	}

	for(var i = 0; i < resolution; i++) {
			this.triangleIndices[triangleoffset] = resolution * (resolution - 1) + i % resolution;
			this.triangleIndices[triangleoffset+1] = resolution * (resolution - 1) + ((i + 1) % resolution);
			this.triangleIndices[triangleoffset+2] = resolution * resolution;
			triangleoffset += 3;
	}

	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
}
