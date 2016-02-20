var config  = require('../config.json');
var express = require('express');
var router  = express.Router();
var PF = require('pathfinding');

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
    console.log(JSON.parse(body));
    var snakes = body.snakes;
    var myHead;
    var food = body.food[0];

    for (var i = 0; i < snakes.length; i++) {
        if (config.snake.id === snake[i].id) {
            myHead = snake[i].coords[0];
        }

    }

    var grid = new PF.Grid(body.width, body.height);

    var finder = new PF.AStarFinder(myHead[0], myHead[1], food[0], food[1], grid);

    console.log(matrix);

    // Response data
    var data = {
        move: 'north', // one of: ["north", "east", "south", "west"]
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
