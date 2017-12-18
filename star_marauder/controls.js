// Global NVMC Client
// ID 4.0
/***********************************************************************/
var NVMCClient = NVMCClient || {};
/***********************************************************************/

var PLAYING = false;

NVMCClient.myPos = function () {
	return this.game.state.players.me.dynamicState.position;
}
NVMCClient.myOri = function () {
	return this.game.state.players.me.dynamicState.orientation;
}

NVMCClient.myFrame = function () {
	return this.game.state.players.me.dynamicState.frame;
}

/***********************************************************************/

NVMCClient.initMotionKeyHandlers = function () {
	var game = this.game;

	var carMotionKey = {};
	carMotionKey["W"] = function (on) {
		game.playerAccelerate = on;
	};
	carMotionKey["S"] = function (on) {
		game.playerBrake = on;
	};
	carMotionKey["A"] = function (on) {
		game.playerSteerLeft = on;
	};
	carMotionKey["D"] = function (on) {
		game.playerSteerRight = on;
	};
	carMotionKey["1"] = function (on) {
    if(!PLAYING) {
      beginPlaying();
      PLAYING = true;
    }
	};
	this.carMotionKey = carMotionKey;
};

// NVMC Client Events
/***********************************************************************/
NVMCClient.onInitialize = function () {// line 290, Listing 4.2{
	var gl = this.ui.gl;
	NVMC.log("SpiderGL Version : " + SGL_VERSION_STRING + "\n");
	this.game.player.color = [1.0, 0.0, 0.0, 1.0];
	//NVMC.GamePlayers.addOpponent();
	this.initMotionKeyHandlers();
	this.stack = new SglMatrixStack();
	this.initializeObjects(gl); //LINE 297}
	this.uniformShader = new uniformShader(gl);
};

NVMCClient.onTerminate = function () {};

NVMCClient.onConnectionOpen = function () {
	NVMC.log("[Connection Open]");
};

NVMCClient.onConnectionClosed = function () {
	NVMC.log("[Connection Closed]");
};

NVMCClient.onConnectionError = function (errData) {
	NVMC.log("[Connection Error] : " + errData);
};

NVMCClient.onLogIn = function () {
	NVMC.log("[Logged In]");
};

NVMCClient.onLogOut = function () {
	NVMC.log("[Logged Out]");
};

NVMCClient.onNewRace = function (race) {
	NVMC.log("[New Race]");
};

NVMCClient.onPlayerJoin = function (playerID) {
	NVMC.log("[Player Join] : " + playerID);
	this.game.opponents[playerID].color = [0.0, 1.0, 0.0, 1.0];
};

NVMCClient.onPlayerLeave = function (playerID) {
	NVMC.log("[Player Leave] : " + playerID);
};

NVMCClient.onKeyDown = function (keyCode, event) {
	this.carMotionKey[keyCode] && this.carMotionKey[keyCode](true);
};

NVMCClient.onKeyUp = function (keyCode, event) {
	this.carMotionKey[keyCode] && this.carMotionKey[keyCode](false);
};

NVMCClient.onKeyPress = function (keyCode, event) {};

NVMCClient.onMouseButtonDown = function (button, x, y, event) {};

NVMCClient.onMouseButtonUp = function (button, x, y, event) {};

NVMCClient.onMouseMove = function (x, y, event) {};

NVMCClient.onMouseWheel = function (delta, x, y, event) {};

NVMCClient.onClick = function (button, x, y, event) {};

NVMCClient.onDoubleClick = function (button, x, y, event) {};

NVMCClient.onDragStart = function (button, x, y) {};

NVMCClient.onDragEnd = function (button, x, y) {};

NVMCClient.onDrag = function (button, x, y) {};

NVMCClient.onResize = function (width, height, event) {};

NVMCClient.onAnimate = function (dt) {
	this.ui.postDrawEvent();
};

NVMCClient.onDraw = function () {
	var gl = this.ui.gl;
	this.drawScene(gl);
};
/***********************************************************************/
