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

var mySnake = {};

var shortestPath = function(body, target){
	// used to find shortest path to a target destination (gold or food)
	var snakes = body.snakes;
	var walls = body.walls;
	console.log("TARGET POS: " + target);

    var grid = new PF.Grid(body.width, body.height);

    for (var i = 0; i < snakes.length; i++) {

		// find our snake's head
        if (config.snake.id === snakes[i].id) {
            mySnake.head = snakes[i].coords[0];
			mySnake.health = snakes[i].health;
        }

		// set unwalkable squares - snake's tails
        for (var j = 0; j < snakes[i].coords.length; j++) {
            grid.setWalkableAt(snakes[i].coords[j][0], snakes[i].coords[j][1], false);
        }
    }
	
	// set unwalkable squares - walls
	if(walls){
		for (i = 0; i < walls.length; i++) {
			for (var j = 0; j < walls[i].coords.length; j++) {
				grid.setWalkableAt(walls[i].coords[j][0], walls[i].coords[j][1], false);
			}
		}
	}

	// use A* algorithm to find the shortest path to target item
    var finder = new PF.AStarFinder();
    var path = finder.findPath(mySnake.head[0], mySnake.head[1], target[0], target[1], grid);

    console.log("Current Path:");
    console.log(path);
	return path;
};

// Handle POST request to '/move'
router.post(config.routes.move, function (req, res) {
  // Do something here to generate your move
    var body = req.body;
    var direction;

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

	var foodPath;

	for(var i = 0; i < foodArray.length; i++){
		var path = shortestPath(body, foodArray[i], mySnake.head);
		if(foodPath === undefined) foodPath = path;
		else{
			if(path.length < foodPath.length){
				foodPath = path;
			}
		}
	}
	//now, foodPath should be the shortest path to food on the grid.

	//check for gold:
	var goldArray = body.gold;
	var goldPath;
	
	if(goldArray){
		// run shortest path, for gold this time
		for(var i = 0; i < goldArray.length; i++){
			var path = shortestPath(body, goldArray[i], mySnake.head);
			if(goldPath === undefined) goldPath = path;
			else{
				if(path.length < goldPath.length){
					goldPath = path;
				}
			}
		}
	}
	
	// strategy question: when should we prioritize gold over food?
	// right now, do: if health is low (under 20), go for food. Else, go for gold.
	var bestPath = foodPath;
	if(goldPath){
		if(mySnake.health > 20 && goldPath.length < foodPath.length{
			bestPath = goldPath;
		}
	}
	
	console.log(bestPath);
    console.log(mySnake.head);

	console.log("DIR: " + findDir(mySnake.head, bestPath[1]));
    // Response data
    var data = {
        move: findDir(mySnake.head, bestPath[1]), // one of: ["north", "east", "south", "west"]
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
