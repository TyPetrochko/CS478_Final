
function normalize(x, y, z) {
	var length = Math.sqrt(x*x + y*y + z*z);
	return [x / length, y / length, z / length];
}

function SphereFromCube (resolution) {
	this.name = "sphere_from_cube";

	// vertices definition
	////////////////////////////////////////////////////////////

	this.vertices = new Float32Array(3*6*((resolution+1)*(resolution+1)));

	var step = 1.0 / resolution;

	var vertexoffset = 0;
	var normalized;
	var x, y, z;
	for(var i = 0; i <= resolution; i++) {
		for(var j = 0; j <= resolution; j++) {
			x = -0.5 + step * j;
			y = -0.5 + step * i;
			z = -0.5;

			normalized = normalize(x, y, z);
			this.vertices[vertexoffset] = normalized[0];
			this.vertices[vertexoffset+1] = normalized[1];
			this.vertices[vertexoffset+2] = normalized[2];
			vertexoffset += 3;
		}
	}

	for(var i = 0; i <= resolution; i++) {
		for(var j = 0; j <= resolution; j++) {
			x = -0.5 + step * j;
			y = -0.5 + step * i;
			z = 0.5;

			normalized = normalize(x, y, z);
			this.vertices[vertexoffset] = normalized[0];
			this.vertices[vertexoffset+1] = normalized[1];
			this.vertices[vertexoffset+2] = normalized[2];
			vertexoffset += 3;
		}
	}

	for(var i = 0; i <= resolution; i++) {
		for(var j = 0; j <= resolution; j++) {
			x = -0.5 + step * j;
			z = -0.5 + step * i;
			y = -0.5;

			normalized = normalize(x, y, z);
			this.vertices[vertexoffset] = normalized[0];
			this.vertices[vertexoffset+1] = normalized[1];
			this.vertices[vertexoffset+2] = normalized[2];
			vertexoffset += 3;
		}
	}

	for(var i = 0; i <= resolution; i++) {
		for(var j = 0; j <= resolution; j++) {
			x = -0.5 + step * j;
			z = -0.5 + step * i;
			y = 0.5;

			normalized = normalize(x, y, z);
			this.vertices[vertexoffset] = normalized[0];
			this.vertices[vertexoffset+1] = normalized[1];
			this.vertices[vertexoffset+2] = normalized[2];
			vertexoffset += 3;
		}
	}

	for(var i = 0; i <= resolution; i++) {
		for(var j = 0; j <= resolution; j++) {
			y = -0.5 + step * j;
			z = -0.5 + step * i;
			x = -0.5;

			normalized = normalize(x, y, z);
			this.vertices[vertexoffset] = normalized[0];
			this.vertices[vertexoffset+1] = normalized[1];
			this.vertices[vertexoffset+2] = normalized[2];
			vertexoffset += 3;
		}
	}

	for(var i = 0; i <= resolution; i++) {
		for(var j = 0; j <= resolution; j++) {
			y = -0.5 + step * j;
			z = -0.5 + step * i;
			x = 0.5;

			normalized = normalize(x, y, z);
			this.vertices[vertexoffset] = normalized[0];
			this.vertices[vertexoffset+1] = normalized[1];
			this.vertices[vertexoffset+2] = normalized[2];
			vertexoffset += 3;
		}
	}

	// triangles definition
	////////////////////////////////////////////////////////////

	this.triangleIndices = new Uint16Array(3*2*6*(resolution*resolution));

	var triangleoffset = 0;
	for(var side = 0; side < 6; side++) {
		var offset = side * (resolution+1)*(resolution+1);
		for(var i = 0; i < resolution; i++) {
			for(var j = 0; j < resolution; j++) {
				this.triangleIndices[triangleoffset] = offset + i * (resolution+1) + j;
				this.triangleIndices[triangleoffset+1] = offset + (i + 1) * (resolution+1) + j;
				this.triangleIndices[triangleoffset+2] = offset + (i + 1) * (resolution+1) + 1 + j;
				triangleoffset += 3;

				this.triangleIndices[triangleoffset] = offset + i * (resolution+1) + j;
				this.triangleIndices[triangleoffset+1] = offset + i * (resolution+1) + 1 + j;
				this.triangleIndices[triangleoffset+2] = offset + (i + 1) * (resolution+1) + 1 + j;
				triangleoffset += 3;
			}
		}
	}
	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
}
