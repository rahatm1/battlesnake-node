var config  = require('../config.json');
var express = require('express');
var router  = express.Router();
var PF = require('pathfinding');


var findDir = function(head, pos) {
    var xdif = pos[0] - head[0];
    var ydif = pos[1] - head[1];

    if (xdif === 1) {
        return 'south';
    } else if (xdif === -1) {
        return 'north';
    } else if (ydif === 1){
        return 'east';
    }
    else if (ydif === -1) {
        return 'west';
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

// Handle POST request to '/move'
router.post(config.routes.move, function (req, res) {
  // Do something here to generate your move
    var body = req.body;
    var snakes = body.snakes;
    var myHead;
    var food = body.food[1];
    console.log("FOOD POS: " + food);

    var grid = new PF.Grid(body.width, body.height);

    for (var i = 0; i < snakes.length; i++) {
        if (config.snake.id === snakes[i].id) {
            myHead = snakes[i].coords[0];
        }
        for (var j = 0; j < snakes[i].coords.length; j++) {
            grid.setWalkableAt(snakes[i].coords[j][0], snakes[i].coords[j][1], false);
        }
    }

    console.log("HEAD POS: " + myHead);


    var finder = new PF.AStarFinder();

    var path = finder.findPath(myHead[0], myHead[1], food[0], food[1], grid);

    console.log("PATH POS: " + path[1]);
    var direction;
    direction = findDir(myHead, path[1]);

    var dirArray = ['east', 'west', 'north', 'south'];

    if (direction === undefined) {
        direction = dirArray[Math.floor(Math.Random()*100) % 4];
        console.log("RANDOM DIRECTIONT TAKEN");
    }

    console.log("DIR: " + direction);
    // Response data
    var data = {
        move: direction, // one of: ["north", "east", "south", "west"]
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
