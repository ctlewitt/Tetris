//game state
var points = 0;
var timer = 0;
var paused = false;
var allBlue = false;

//state variables
var READY = 0;
var FALLING = 1;
var HIT = 2;
var GAME_OVER = 3;
var state = READY;

//background colors
var redColor = 0;
var greenColor = 0;
var blueColor = 0;

//board dimensions and positions
var squareEdge = 25;
var boardWidth = 10;
var boardInvisibleHeight = 2;
var boardVisibleHeight = 20;
var boardHeight = boardVisibleHeight + boardInvisibleHeight;
var boardXPos = window.innerWidth / 2 - (squareEdge * boardWidth) / 2;
var boardYPos = squareEdge;
//colors for pieces (and board)
var colors = {};


//board is column major, since I will be checking the contents of each column as pieces fall
var boardArray = new Array(boardWidth);

//shape position and pieces
var shapeStartXPos = boardWidth / 2;
var shapeStartYPos = boardInvisibleHeight - 1; //was 0
var nextShape = null;
var currentShape = null;

//preview box dimensions and positions
var previewEdge = 5;
var previewXPos = boardXPos + boardWidth*squareEdge + squareEdge*2;
var previewYPos = boardYPos + + (boardInvisibleHeight * squareEdge); //was without part in parentheses
var previewShapeXPos = ((previewEdge) / 2) ;//(previewEdge*squareEdge-1/2)/2;
var previewShapeYPos = ((previewEdge) / 2);//(previewEdge*squareEdge-1/2)/2;


//possible shapes to generate
var possibleShapes = {
	"Square": {
		"color": "Y",
		"startPositions": [
			[shapeStartXPos, shapeStartYPos],
			[shapeStartXPos - 1, shapeStartYPos],
			[shapeStartXPos - 1, shapeStartYPos - 1],
			[shapeStartXPos, shapeStartYPos - 1],
		]
	},
	"Zigzag": {
		"color": "R",
		"startPositions": [
			[shapeStartXPos, shapeStartYPos],
			[shapeStartXPos, shapeStartYPos - 1],
			[shapeStartXPos + 1, shapeStartYPos],
			[shapeStartXPos - 1, shapeStartYPos - 1],
		]
	},
	"ZigzagB": {
		"color": "G",
		"startPositions": [
			[shapeStartXPos, shapeStartYPos],
			[shapeStartXPos, shapeStartYPos - 1],
			[shapeStartXPos - 1, shapeStartYPos],
			[shapeStartXPos + 1, shapeStartYPos - 1],
		]
	},
	"LShape": {
		"color": "O",
		"startPositions": [
			[shapeStartXPos, shapeStartYPos],
			[shapeStartXPos + 1, shapeStartYPos],
			[shapeStartXPos + 1, shapeStartYPos - 1],
			[shapeStartXPos - 1, shapeStartYPos],
		]
	},
	"LShapeB": {
		"color": "B",		
		"startPositions": [
			[shapeStartXPos, shapeStartYPos],
			[shapeStartXPos - 1, shapeStartYPos],
			[shapeStartXPos - 1, shapeStartYPos - 1],
			[shapeStartXPos + 1, shapeStartYPos],
		]
	},
	"Stick": {
		"color": "lB",
		"startPositions": [
			[shapeStartXPos, shapeStartYPos],
			[shapeStartXPos + 1, shapeStartYPos],
			[shapeStartXPos - 2, shapeStartYPos],
			[shapeStartXPos - 1, shapeStartYPos],
		]
	},
	"Tee": {
		"color": "P",
		"startPositions": [
			[shapeStartXPos, shapeStartYPos],
			[shapeStartXPos + 1, shapeStartYPos],
			[shapeStartXPos - 1, shapeStartYPos],
			[shapeStartXPos, shapeStartYPos - 1],
		]
	}
};