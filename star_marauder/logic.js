var speed = 250.0;
var safetyBuffer = 200.0;
var debrisLength = 500.0;
var debrisWidth = 300.0;
var numObstacles = 100;
var dt = 10;
var debrisMin = Y_MIN - 50;
var debrisMax = Y_MAX + 50;
var dayLength = 60000;
var debrisSizeMax = 10.0;
var debrisSizeMin = 3.0;

var numTiles = 25;
var tileWidth = 30;
var hillHeight = 10;
var smoothingFactor = 10.0;
var resolution = 0.12;

var ROCK_COLOR = [150.0/255.0, 65/255.0, 65.0/255.0];

var Objects = {
  cubes : [],
  spheres : [],
  surfaces : [],
  
  update : function (){
    if(gameComplete)
      return;
    if (Objects.cubes.length == 0) {
      Objects.init();
    }
    var t = getTimeElapsed();

    // cubes
    for(var i = 0; i < Objects.cubes.length; i++) {
      var cube = Objects.cubes[i].position;
      cube[2] = cube[2] + t*speed*.001;
      if(cube[2] > 3) {
        cube[0] = POSITION[0] + 2*(Math.random() - 0.5)*debrisWidth;
        cube[1] = debrisMin + (debrisMax - debrisMin)*Math.random();
        cube[2] = -safetyBuffer - debrisLength + debrisLength*Math.random();
      }
      if(distance(cube, POSITION) < Objects.cubes[i].scale*2) {
        speed = 0.0;
        gameOver();
      }
    }

    // spheres
    for(var i = 0; i < Objects.spheres.length; i++) {
      var sphere = Objects.spheres[i].position;
      sphere[2] = sphere[2] + t*speed*.001;
      if(sphere[2] > 3) {
        sphere[0] = POSITION[0] + 2*(Math.random() - 0.5)*debrisWidth;
        sphere[1] = debrisMin + (debrisMax - debrisMin)*Math.random();
        sphere[2] = -safetyBuffer - debrisLength + debrisLength*Math.random();
      }
      if(distance(sphere, POSITION) < Objects.spheres[i].scale) {
        speed = 0.0;
        gameOver();
      }
    }

    for(var i = 0; i < numTiles; i++) {
      for(var j = 0; j < numTiles; j++) {
        Objects.surfaces[i][j].position[2] += t*speed*.001;
        if(Objects.surfaces[i][j].position[2] > 0) {
          Objects.surfaces[i][j].position[2] -= numTiles*tileWidth;
        }
        if(Objects.surfaces[i][j].position[0] > POSITION[0] + numTiles*tileWidth*0.5) {
          Objects.surfaces[i][j].position[0] -= numTiles*tileWidth;
        }
        if(Objects.surfaces[i][j].position[0] < POSITION[0] - numTiles*tileWidth*0.5) {
          Objects.surfaces[i][j].position[0] += numTiles*tileWidth;
        }
      }
    }
  },

  init : function (){
    // Spheres first
    Objects.spheres = [];
    for(var i = 0; i < numObstacles; i++) {
      var pos = [
        POSITION[0] + 2*(Math.random() - 0.5)*debrisWidth,
        debrisMin + (debrisMax - debrisMin)*Math.random(),
        -safetyBuffer - debrisLength + debrisLength*Math.random()
      ];
      var intensity = Math.random();
      Objects.spheres.push({
        position : pos,
        scale : debrisSizeMin+Math.random()*(debrisSizeMax-debrisSizeMin),
        color : [ROCK_COLOR[0]*intensity, ROCK_COLOR[1]*intensity, ROCK_COLOR[2]*intensity, 1.0]
      });
    }
    
    // Cubes
    Objects.cubes = [];
    for(var i = 0; i < numObstacles; i++) {
      var pos = [
        POSITION[0] + 2*(Math.random() - 0.5)*debrisWidth,
        debrisMin + (debrisMax - debrisMin)*Math.random(),
        -safetyBuffer - debrisLength + debrisLength*Math.random()
      ];
      var intensity = Math.random();
      Objects.cubes.push({
        position : pos,
        scale : debrisSizeMin+Math.random()*(debrisSizeMax-debrisSizeMin),
        color : [ROCK_COLOR[0]*intensity, ROCK_COLOR[1]*intensity, ROCK_COLOR[2]*intensity, 1.0]
      });
    }

    // Now surfaces
    Objects.surfaces = [];
    for(var i = 0; i < numTiles; i++){
      var row = [];
      for(var j = 0; j < numTiles; j++){
        row.push({
          position : [i*tileWidth,0,j*tileWidth - numTiles*tileWidth],
          index : [i, j]});
      }
      Objects.surfaces.push(row);
    }
  },

  generateTiles : function(){
    var surfaces = [];
    for(var i = 0; i < numTiles; i++) {
      var row = [];
      for(var j = 0; j < numTiles; j++) {
        // Generate 4 random control points
        var controlPoints = [];
        for(var k = 0; k < 4; k++) {
          controlPoints.push([
              Objects.getNoise(3*i+k, 3*j-1.5),
              Objects.getNoise(3*i+k, 3*j-0.5),
              Objects.getNoise(3*i+k, 3*j+0.5),
              Objects.getNoise(3*i+k, 3*j+1.5)
          ]);
        }

        // Smooth corners
        // controlPoints[0][0] /= smoothingFactor;
        // controlPoints[3][0] /= smoothingFactor;
        // controlPoints[0][3] /= smoothingFactor;
        // controlPoints[3][3] /= smoothingFactor;

        // Do we have a left neighbor?
        if(j > 0) {
          controlPoints[0][0] = row[j-1].controlPoints[0][3];
          controlPoints[1][0] = row[j-1].controlPoints[1][3];
          controlPoints[2][0] = row[j-1].controlPoints[2][3];
          controlPoints[3][0] = row[j-1].controlPoints[3][3];
        }
        
        // Do we have a right neighbor?
        if(j == numTiles - 1) {
          controlPoints[0][3] = row[0].controlPoints[0][0];
          controlPoints[1][3] = row[0].controlPoints[1][0];
          controlPoints[2][3] = row[0].controlPoints[2][0];
          controlPoints[3][3] = row[0].controlPoints[3][0];
          
          // Optional
          controlPoints[0][2] = 2*row[0].controlPoints[0][0] - row[0].controlPoints[0][1];
          controlPoints[1][2] = 2*row[0].controlPoints[1][0] - row[0].controlPoints[1][1];
          controlPoints[2][2] = 2*row[0].controlPoints[2][0] - row[0].controlPoints[2][1];
          controlPoints[3][2] = 2*row[0].controlPoints[3][0] - row[0].controlPoints[3][1];
        }
        
        // Do we have a back neighbor?
        if(i > 0) {
          controlPoints[0][0] = surfaces[i-1][j].controlPoints[3][0];
          controlPoints[0][1] = surfaces[i-1][j].controlPoints[3][1];
          controlPoints[0][2] = surfaces[i-1][j].controlPoints[3][2];
          controlPoints[0][3] = surfaces[i-1][j].controlPoints[3][3];
        }
        
        // Do we have a front neighbor?
        if(i == numTiles - 1) {
          controlPoints[3][0] = surfaces[0][j].controlPoints[0][0];
          controlPoints[3][1] = surfaces[0][j].controlPoints[0][1];
          controlPoints[3][2] = surfaces[0][j].controlPoints[0][2];
          controlPoints[3][3] = surfaces[0][j].controlPoints[0][3];

          // Optional
          controlPoints[2][0] = 2*surfaces[0][j].controlPoints[0][0] - surfaces[0][j].controlPoints[1][0];
          controlPoints[2][1] = 2*surfaces[0][j].controlPoints[0][1] - surfaces[0][j].controlPoints[1][1];
          controlPoints[2][2] = 2*surfaces[0][j].controlPoints[0][2] - surfaces[0][j].controlPoints[1][2];
          controlPoints[2][3] = 2*surfaces[0][j].controlPoints[0][3] - surfaces[0][j].controlPoints[1][3];
        }

        row.push(new Surface(controlPoints, tileWidth));
      }
      surfaces.push(row);
    }
    return surfaces;
  },

  simplex : new SimplexNoise(),

  // Heightmap
  getNoise : function(x, y) {
    // return Math.sin(x)+Math.sin(y);
    return Objects.simplex.noise2D(x*resolution, y*resolution)* hillHeight;
    // var resolutions = [.001, .01, .1, .5, 1];
    // var offsets = [1.0, 5.0, 17.0, 33.0, 65.0, 7.0];
    // var sum = 0.0;
    // for(var i = 0; i < resolutions.length; i++) {
    //   sum += Math.cos(resolutions[i] * x + offsets[i]);
    //   sum += Math.sin(resolutions[i] * y + offsets[i]);
    // }
    // return sum*hillHeight;
  }
};

var timeOfDay = getTime();
function getSunlightAngle() {
  // var timeElapsed = getTime() - timeOfDay;
  // var timeMS = timeElapsed % dayLength;
  // var timeRel = (timeMS*1.0)/dayLength;
  // var angle = [Math.cos(timeRel*Math.PI*2), Math.sin(timeRel*Math.PI*2), 1.0, 0];
  // return angle;
  return [0.0, 1.0, 1.0, 0];
}

// How much time has passed since last calling
var time = null;
function getTimeElapsed() {
  if(time == null) {
    time = getTime();
    return 0;
  }
  var t = getTime();
  var toReturn = t - time;
  time = t;
  return toReturn;
}

// Time in millis
function getTime() {
  var d = new Date();
  var n = d.getTime();
  return n;
}

var taunts = [
  "Looks like you got riggity rek'ed!",
  "Try again! Maybe you'll do better",
  "Next time's a charm!",
  "Ouch.",
  "Ouch. I bet that hurt.",
  "Ouch. I wouldn't want to be you.",
  "Just a flesh wound.",
  "That'll leave a mark.",
  "Is that all you got?",
  "Get back up there champ!",
  "Hey, Rome wasn't built in a day.",
];

var gameComplete = false;
function gameOver() {
  console.log("Game over?");
  document.getElementById("play_again").innerText = "Play again?";
  var canv = document.getElementById("nvmc-canvas");
  canv.parentNode.removeChild(canv);
  document.getElementById("taunt").innerText = taunts[Math.floor(Math.random() * taunts.length)]; 
  gameComplete = true;
}

function distance(a, b){
  return Math.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2 + (a[2]-b[2])**2);
}
    
var score = 0.0;
function updateScore(){
  if(gameComplete)
    return;
  score += 1.0;
  document.getElementById("score").innerText= "Score "+score;
}

setInterval(Objects.update, dt);
setInterval(updateScore, 1000);

