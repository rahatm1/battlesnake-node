var config  = require('../config.json');
var express = require('express');
var router  = express.Router();
var PF = require('pathfinding');


var findDir = function(head, pos) {
    var xdif = pos[0] - head[0];
    var ydif = pos[1] - head[1];

    if (xdif === 1) {
        return 'east';
    } else if (xdif === -1) {
        return 'west';
    } else if (ydif === 1){
        return 'south';
    }
    else if (ydif === -1){
        return 'north';
    }
};
// Handle GET request to '/'
router.get(config.routes.info, function (req, res) {
  // Response data
    var data = {
        color: config.snake.color,
        head_url: config.snake.head_url,
    };

    return res.json(data);
});

// Handle POST request to '/start'
router.post(config.routes.start, function (req, res) {
  // Do something here to start the game

  // Response data
    var data = {
        taunt: config.snake.taunt.start
    };

    return res.json(data);
});

var myHead;

var shortestPath = function(body, food){
	var snakes = body.snakes;
	console.log("FOOD POS: " + food);

    var grid = new PF.Grid(body.width, body.height);

    for (var i = 0; i < snakes.length; i++) {

		// find our snake's head
        if (config.snake.id === snakes[i].id) {
            myHead = snakes[i].coords[0];
        }

		// set unwalkable squares
        for (var j = 0; j < snakes[i].coords.length; j++) {
            grid.setWalkableAt(snakes[i].coords[j][0], snakes[i].coords[j][1], false);
        }
    }

	// use A* algorithm to find the shortest path to food
    var finder = new PF.AStarFinder();
    var path = finder.findPath(myHead[0], myHead[1], food[0], food[1], grid);

    console.log("Current Path:");
    console.log(path);
	return path;
};


//returns best path
var findBestPathWrapper = function(foodArray, body){

    var bestPathArray = [];

    for(var i = 0; i < foodArray.length; i++){
        var path = shortestPath(body, foodArray[i]);
        bestPathArray.push(path);
    }

    //sort array
    bestPathArray.sort(function(a,b){
        return (a.length - b.length);
    });

    return bestPathArray;
};

var findSnakeHeads = function(snakeList){
    var snakeHeads = [];

    for (var i = 0; i < snakeList.length; i++) {
        var snake = snakeList[i];
                    // find our snake's head
        if (config.snake.id === snake.id) {
            continue;
        }

        snakeHeads.push(snake.coords[0]);
        //add snake head to head list
    }

    return snakeHeads;
};


var findDist = function(pos1, pos2){

    return ( Math.abs(pos1[0]-pos2[0]) + Math.abs(pos1[1]-pos2[1]) );
};

// Handle POST request to '/move'
router.post(config.routes.move, function (req, res) {
  // Do something here to generate your move
    var body = req.body;
    var direction;
    var snakeHeadList = findSnakeHeads(body.snakes);

	// find closest food
    var foodArray = body.food;
    console.log(foodArray);

    var dirArray = ['north', 'south', 'east', 'west'];

    if (!foodArray) {
        console.log("No Food");
        direction = dirArray[(Math.floor(Math.random()*100)%4)];
        return res.json({
            move: direction
        });
    }

	var bestPath;
    var bestPathArray = findBestPathWrapper(foodArray,body);
    var bestPathPos = 0;

    for(var i = 0; i < bestPathArray.length; i++){

        for(var snakehead in snakeHeadList){
            console.log(snakehead);
            //distance between enemy snake to current best food
            var distance = findDist(snakehead, bestPathArray[i][bestPathArray[i].length -1]);
            if(distance <= bestPathArray[i].length){
                //TODO: eat snake
                bestPathPos++;
                break;
            }
        }
    }
    console.log(bestPathPos);

    if(bestPathPos>=bestPathArray.length){
        //TODO:get random safe dir
        console.log("safe");
    }

    else {
       bestPath = bestPathArray[bestPathPos];
    }

	//now, bestPath should be the shortest path to food on the grid.
	console.log(bestPath);
    console.log(myHead);

	console.log("DIR: " + findDir(myHead, bestPath[1]));
    // Response data
    var data = {
        move: findDir(myHead, bestPath[1]), // one of: ["north", "east", "south", "west"]
        taunt: config.snake.taunt.move
    };

    return res.json(data);
});

// Handle POST request to '/end'
router.post(config.routes.end, function (req, res) {
  // Do something here to end your snake's session

  // We don't need a response so just send back a 200
    res.status(200);
    res.end();
    return;
});


module.exports = router;
