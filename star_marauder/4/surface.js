function getMaxPoint(surface) {
  var max = -100000;
  for(var i = 0; i < surface.vertices.length; i += 3) {
    max = Math.max(max, surface.vertices[i+1]);
  }
  return max;
}

function getMinPoint(surface) {
  var min = 100000;
  for(var i = 0; i < surface.vertices.length; i += 3) {
    min = Math.min(min, surface.vertices[i+1]);
  }
  return min;
}

var use_bspline = false;

var M_bspline = [
	[1.0/6.0, 2.0/3.0, 1.0/6.0, 0.0],
	[-1.0/2.0, 0.0, 1.0/2.0, 0.0],
	[1.0/2.0, -1.0, 1.0/2.0, 0.0],
	[-1.0/6.0, 1.0/2.0, -1.0/2.0, 1.0/6.0]
];

var M_bezier = [
	[1, 0, 0, 0],
	[-3, 3, 0, 0],
	[3, -6, 3, 0],
	[-1, 3, -3, 1]
];

function getPoint(u, v, M, B) {
	var U = [
		[1, u, u*u, u*u*u]
	];

	var V = [
		[1],
		[v],
		[v*v],
		[v*v*v]
	];

	var tmp = matrixMultiply(U, M);
	tmp = matrixMultiply(tmp, B);
	tmp = matrixMultiply(tmp, transpose(M));
	tmp = matrixMultiply(tmp, V);

	return tmp;
}

// Generate a matrix with all 0's
function newMatrix(h, w){
	var m = [];
	for (var i = 0; i < h; i++){
		m.push([]);
		for(var j = 0; j < w; j++){
			m[i].push(0);
		}
	}

	return m;
}

// Height and width of matrix
function height(m) {
	return m.length;
}
function width(m) {
	return m[0].length;
}

// Transpose a matrix
function transpose(m) {
	var h = height(m);
	var w = width(m);
	var copy = newMatrix(w, h);

	for (var i = 0; i < h; i++) {
		for (var j = 0; j < w; j++) {
			copy[j][i] = m[i][j];
		}
	}

	return copy;
}

// Add two constants, two vectors, or anything to zero
function componentSum(c1, c2){
	if(c1 == 0) {
		return c2;
	} else if(c2 == 0) {
		return c1;
	} else if(c1 instanceof Array) {
		if(c1.length != c2.length) {
			console.log("Vector length mismatch!");
			return 0;
		}
		var tmp = [];
		for (var i = 0; i < c1.length; i++) {
			// console.log("Vec add " + c1[i] + " and " + c2[i]);
			tmp.push(c1[i]+c2[i]);
		}
		return tmp;
	} else {
		return c1 + c2;
	}
}

// Multiply two constants, or a constant and a vector, but not two vectors
function componentMultiply(c1, c2) {
	if(c1 instanceof Array) {
		var tmp = [];
		for(var i = 0; i < c1.length; i++) {
			tmp.push(c1[i] * c2);
		}
		return tmp;
	} else if(c2 instanceof Array) {
		var tmp = [];
		for(var i = 0; i < c2.length; i++) {
			tmp.push(c2[i] * c1);
		}
		return tmp;
	}
	else{
		return c1*c2;
	}
}

// Matrix Multiply
function matrixMultiply(m1, m2) {
	if(width(m1) != height(m2)) {
		console.log("Dimension mismatch!");
		console.log("WxH:" + width(m1) + "x" + height(m1));
		console.log("WxH:" + width(m2) + "x" + height(m2));
		return [];
	}
	var h = height(m1);
	var w = width(m2);

	var out = newMatrix(h, w);

	for(var i = 0; i < h; i++) {
		for(var j = 0; j < w; j++) {
			var sum = 0;
			for(var ii = 0; ii < width(m1); ii++) {
				sum = componentSum(sum, componentMultiply(m1[i][ii], m2[ii][j]));
			}
			out[i][j] = sum;
		}
	}

	return out;
}

function Surface(controlPoints, scale) {

  this.controlPoints = controlPoints;

	// Maybe change this later
	this.name = "surface";

	// Get input
	var x = [];
	var y = [];
	var z = [];
	for(var i = 0; i < 4; i++) {
		x.push([]);
		y.push([]);
		z.push([]);
		for(var j = 0; j < 4; j++) {
			x[i].push(i);
			y[i].push(controlPoints[i][j]);
			z[i].push(j);
		}
	}


	var B = [
		[ [0, y[0][0], 0], [ 1, y[1][0], 0], [ 2, y[2][0], 0], [ 3, y[3][0], 0]],
		[ [0, y[0][1], 1], [ 1, y[1][1], 1], [ 2, y[2][1], 1], [ 3, y[3][1], 1]],
		[ [0, y[0][2], 2], [ 1, y[1][2], 2], [ 2, y[2][2], 2], [ 3, y[3][2], 2]],
		[ [0, y[0][3], 3], [ 1, y[1][3], 3], [ 2, y[2][3], 3], [ 3, y[3][3], 3]]
	];

	var points = [];
	for (var u = 0.0; u <= 1.0; u += 0.25) {
		for (var v = 0.0; v <= 1.0; v += 0.25) {
			if(use_bspline){
				var p = getPoint(u, v, M_bspline, B);
			} else {
				var p = getPoint(u, v, M_bezier, B);
			}
        
      points.push((p[0][0][0]/3.0)*scale);

      // Snap
      // if(u == 0.0 && v == 0.0) {
      //   console.log("Snapping A");
      //   points.push(controlPoints[0][0]/3.0);
      // } else if (u == 0.0 && v == 1.0) {
      //   console.log("Snapping B");
      //   points.push(controlPoints[3][0]/3.0);
      // } else if (u == 1.0 && v == 0.0 ) {
      //   console.log("Snapping C");
      //   points.push(controlPoints[0][3]/3.0);
      // } else if (u == 1.0 && v == 1.0) {
      //   console.log("Snapping D");
      //   points.push(controlPoints[3][3]/3.0);
      // } else {
      //   points.push((p[0][0][1]/3.0));
      // }
      points.push((p[0][0][1]));
      points.push((p[0][0][2]/3.0)*scale);
		}
	}

	this.vertices = new Float32Array(points);

	var triangles = [];
	for(var i = 0; i < 4; i++) {
		for(var j = 0; j < 4; j++) {
			triangles.push(j*5 + (i+1));
			triangles.push(j*5 + i);
			triangles.push((j+1)*5 + (i+1));

			triangles.push(j*5 + i);
			triangles.push((j+1)*5 + i);
			triangles.push((j+1)*5 + (i+1));
		}
	}

	this.triangleIndices = new Uint16Array(triangles);

	this.numVertices = this.vertices.length/3;
	this.numTriangles = this.triangleIndices.length/3;
  this.ycollider = (getMaxPoint(this) + getMaxPoint(this))/2.0;
}



