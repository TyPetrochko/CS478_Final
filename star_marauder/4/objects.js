var speed = 500.0;
var safetyBuffer = 200.0;
var debrisLength = 300.0;
var debrisWidth = 100.0;
var numObstacles = 100;
var dt = 10;
var debrisMin = Y_MIN - 5;
var debrisMax = Y_MAX + 5;
var dayLength = 60000;

var Objects = {
  cubes : [],
  spheres : [],
  update : function (){
    if (Objects.cubes.length == 0) {
      Objects.init();
    }
    var t = getTimeElapsed();
    
    for(var i = 0; i < Objects.cubes.length; i++) {
      var cube = Objects.cubes[i];
      cube[2] = cube[2] + t*speed*.0001;
      if(cube[2] > 3) {
        cube[0] = POSITION[0] + 2*(Math.random() - 0.5)*debrisWidth;
        cube[1] = debrisMin + (debrisMax - debrisMin)*Math.random();
        cube[2] = -safetyBuffer - debrisLength + debrisLength*Math.random();
      }
    }
  },

  init : function (){
    Objects.cubes = [];
    for(var i = 0; i < numObstacles; i++) {
      var cube = [
        POSITION[0] + 2*(Math.random() - 0.5)*debrisWidth,
        debrisMin + (debrisMax - debrisMin)*Math.random(),
        -safetyBuffer - debrisLength + debrisLength*Math.random()
      ];
      Objects.cubes.push(cube);
    }
  }
};

var timeOfDay = getTime();
function getSunlightAngle() {
  var timeElapsed = getTime() - timeOfDay;
  var timeMS = timeElapsed % dayLength;
  var timeRel = (timeMS*1.0)/dayLength;
  var angle = [Math.cos(timeRel*Math.PI*2), Math.sin(timeRel*Math.PI*2), 1.0, 0];
  return angle;
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

setInterval(Objects.update, dt);

