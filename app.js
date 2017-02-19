"use strict";

var app = angular.module("GameApp", []);

app.controller("GameCtrl", function($rootScope, $scope){

		let pattern_input = [], nGridX = 50, nGridY = 50;
		let gridSize = 10, startX = 20, startY = 20;

    var worldArr = [];
    for(let r = 0; r < nGridY; r++){
        worldArr[r] = [];
        for (let c = 0; c< nGridX; c++){
            worldArr[r][c] = 0;
        }
    }

    // to create grids
    let displayElement = document.getElementById("ttt");
    var createGame = function(n) {
        displayElement.innerHTML = "";
        for (let i = 1, gridSize = 95 / n; i <= n * n; i++) {
            let productElement = document.createElement("div");
            productElement.style.width = gridSize + "%";
            productElement.style.height = gridSize + "%";
            productElement.setAttribute("id", `grid-${i}`);
            productElement.className = "blocks";
            displayElement.appendChild(productElement);
        }
    };
    createGame(9);

	// process events
    $scope.handleEvents = function(){
        if (event.target.innerHTML === "") {
            event.target.innerHTML = "x";
            event.target.style.color = "black";
            event.target.style.backgroundColor = "black";
        } else {
            event.target.innerHTML = "";
            event.target.style.color = "";
            event.target.style.backgroundColor = "";
        }
    };

    $scope.clearInput = function() {
    	let n = 9;
			for (let i = 1; i <= n * n; i++) {
				let targetEmt = document.getElementById(`grid-${i}`);
				targetEmt.innerHTML = "";
				targetEmt.style.color = "";
				targetEmt.style.backgroundColor = "";
			}
    }

    $scope.startGame = function() {
    	for(let r = 0; r < nGridY; r++){
        worldArr[r] = [];
        for (let c = 0; c< nGridX; c++){
            worldArr[r][c] = 0;
        }
	    } // clear previous world
  		getInputPosition(); // collect input pattern
  		initWorld();
  		$scope.clearInput();
      startAnimating(fps); // start game
    }

    $scope.stopGame = function() {
      pauseGame = true;        
    }

		function getInputPosition() {
			let n = 9;
			pattern_input = [];
			for (let i = 1; i <= n * n; i++) {
				let targetEmt = document.getElementById(`grid-${i}`);
				if (targetEmt.innerHTML == "x"){
	        //get index of current item
	        let blockIndex = i;
	        let arr = [];
	        let x=0, y=0;
	        for(let i = 0; i < n; i++){
	            arr[i] = [];    
	            for(let j = 0; j < n; j++){ 
	                arr[i][j] = i * n + j + 1;
	                if (arr[i][j] === blockIndex) {
	                    x = i;
	                    y = j;
	                }
	            }    
	        }
	        pattern_input.push(`(${x},${y})`);
				}
      }
    }
  
    // for status of all drawBlocks
    var pauseGame = false, fps = 2;

    // control requestAnimationFrame speed
    var fpsInterval, startTime, now, then, elapsed;

    // initialize the timer variables and start the animation
    function startAnimating(fps) {
      fpsInterval = 1000 / fps;
      then = Date.now();
      startTime = then;
      animate();
    }

    // the animation loop calculates time elapsed since the last loop
    // and only draws if your specified fps interval is achieved
    function animate() {
      // game stop control
      if (pauseGame === true){
        pauseGame = false;
        return; // to stop game
      }
      // request another frame
      requestAnimationFrame(animate);
      // calc elapsed time since last loop
      now = Date.now();
      elapsed = now - then;
      // if enough time has elapsed, draw the next frame
      if (elapsed > fpsInterval) {
        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);
        //drawing code here
        Game.run();
      }
    }
    
  
    /* Game.js */
    var Game = { };
    Game.canvas = document.getElementById('myCanvas');
    Game.ctx = myCanvas.getContext('2d');

    Game.run = function() {
        // Clear the canvas.
        Game.ctx.fillStyle="black";
        Game.ctx.fillRect(0,0,Game.canvas.width,Game.canvas.height);

        // draw vertical helping lines
        Game.ctx.setLineDash([2, 18]);
        Game.ctx.strokeStyle = '#CCCECB';
        for (let i = 1; i < nGridX; i++){
            Game.ctx.beginPath();
            Game.ctx.moveTo( i * gridSize, 0);
            Game.ctx.lineTo(i * gridSize, 500);
            Game.ctx.stroke();
            Game.ctx.beginPath();
            Game.ctx.moveTo( 0, i * gridSize);
            Game.ctx.lineTo(500, i * gridSize);
            Game.ctx.stroke();
        }
        Game.ctx.setLineDash([]);
        Game.ctx.strokeStyle = 'black';

        // Draw code goes here.
        Tick();
        drawGameArea(worldArr);
        about_to_die = [];
        about_to_born = [];
    };

    // draw.js
    function drawBlock(dx, dy, color){
        Game.ctx.fillStyle = color;
        Game.ctx.fillRect(dx * gridSize, dy * gridSize, gridSize, gridSize);
        Game.ctx.strokeRect(dx * gridSize, dy * gridSize, gridSize, gridSize);
    }

    function drawGameArea(worldArr){
        for(let r = 0; r < worldArr.length; r++){
            for (let c = 0; c< worldArr[0].length; c++){
                if(worldArr[r][c] == 1){
                    drawBlock(c, r, "green");
                }
            }
        }
    }

    // world.js
    let about_to_die = []; // List of cells marked to die
    let about_to_born = []; // List of cells marked to born

    function initWorld()
    {
    	if (pattern_input.length > 0)
        {
            pattern_input.forEach(function(cell)
	            {
	                let match = cell.match(/\d+/g);
	                let x = parseInt(match[0]);
	                let y = parseInt(match[1]);
	                worldArr[x + startX][y + startY] = 1;
	            }
            );
        }
    }

    function Tick() // Passage of time
    {
        LiveOn();
        Reproduction();
        UnderPopulation();
        OverPopolation();

        KillCells();
        BirthCells();
    }

    function BirthCells()
    {
        // look inside and set contents
        if (about_to_born.length > 0)
        {
            about_to_born.forEach(function(cell)
	            {
                let match = cell.match(/\d+/g);
                let x = parseInt(match[0]);
                let y = parseInt(match[1]);
                worldArr[x][y] = 1;
	            }
            );
        }
    }

    function KillCells()
    {
        // look inside and set contents
        if (about_to_die.length > 0)
        {
            about_to_die.forEach (function(cell)
	            {
                let match = cell.match(/\d+/g);
                let x =  parseInt(match[0]);
                let y = parseInt(match[1]);
                worldArr[x][y] = 0;
	            }
            );
        }
    }

    function LiveOn()
    {
        
    }

    function OverPopolation()
    {
        for (let y = 0; y < 50; y++)
        {
            for (let x = 0; x < 50; x++)
            {
                if (worldArr[x][y] == 1)
                {
                    let neighbors = CountLiveNeighbors(x, y);
                    if (neighbors > 3)
                    {
                        about_to_die.push(`(${x},${y})`);
                    }
                }
            }
        }
    }

    function Reproduction()
    {
        for (let y = 0; y < 50; y++)
        {
            for (let x = 0; x < 50; x++)
            {
                if (worldArr[x][y] == 0)
                {
                    let neighbors = CountLiveNeighbors(x, y);
                    if (neighbors == 3)
                    {
                        about_to_born.push(`(${x},${y})`);
                    }
                }
            }
        }
    }

    function UnderPopulation()
    {
        for (let y = 0; y < 50; y++)
        {
            for (let x = 0; x < 50; x++)
            {
                if (worldArr[x][y] == 1)
                {
                    let neighbors = CountLiveNeighbors(x, y);
                    if (neighbors < 2)
                    {
                        about_to_die.push(`(${x},${y})`);
                    }
                }
            }
        }
    }

    function CountLiveNeighbors(x, y)
    {
        if (x > 0 && y > 0 && x < 49 && y < 49)
        {
            let top, bottom, left, right, top_left, top_right, bottom_left, bottom_right;
            top = worldArr[x][y + 1];
            bottom = worldArr[x][y - 1];
            left = worldArr[x - 1][y];
            right = worldArr[x + 1][y];
            top_left = worldArr[x - 1][y + 1];
            top_right = worldArr[x + 1][y + 1];
            bottom_left = worldArr[x - 1][y - 1];
            bottom_right = worldArr[x + 1][y - 1];
            return top + bottom + left + right + top_left + top_right + bottom_left + bottom_right;
        }
        else
            return 0;
    }

});



