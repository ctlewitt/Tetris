
/*
file:///Users/clewittes/Documents/Recurse%20Center/JS%20Workshops/p5_scaffold/index.html
Things to do:
x make board
x make empty array of board (fill in some values, so you can see how they are displayed)
x finish filling in colors assoc. array for all the shapes
x make objects and rules for how they move through board
x  falling
x  rotating
x  stopping when they hit something
x draw objects as they fall
x when they hit the bottom, make them part of the array
x generate a random object

x clear rows when you hit the bottom

x bugs: multiple rows are not being deleted at the bottom
x bug: dropping piece is not dropped all the way (after rows have been removed)

x PAUSE

x increase speed with score
x display score

2 player (add to opponent's rows when you score)

multiple boards for multiple players (need to make functional)
play against your friends
make 3D (with multiple people)


x OBVIOUSLY: I need a "make everything blue feature"
*/




class Color {
	constructor(red, green, blue){
		this.red = red;
		this.green = green;
		this.blue = blue;
	}
}


var timer = 0;
var paused = false;
var yRect = window.innerHeight / 2 - 15;
var allBlue = false;
var redColor = 0;
var greenColor = 0;
var blueColor = 0;
var squareEdge = 25;
var boardWidth = 10;
var boardInvisibleHeight = 2;
var boardVisibleHeight = 20;
var boardHeight = boardVisibleHeight + boardInvisibleHeight;
var boardXPos = window.innerWidth / 2 - (squareEdge * boardWidth) / 2;
var boardYPos = squareEdge;
var colors = {};
//generate empty board
//board is column major, since I will be checking the contents of each column as pieces fall
var boardArray = new Array(boardWidth);
for (var i = 0; i < boardWidth; i++) {
	boardArray[i] = new Array(boardHeight);
}
var shapeStartXPos = boardWidth / 2;
var shapeStartYPos = 0; //was 0
var currentShape = null;
var points = 0;

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
			[shapeStartXPos + 2, shapeStartYPos],
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


//state variables
var READY = 0;
var FALLING = 1;
var HIT = 2;
var GAME_OVER = 3;
var state = READY;

function setup() {
	createCanvas(
		window.innerWidth,
		window.innerHeight
	);
	background(redColor + 100, greenColor + 20, blueColor + 255);
	//defining color options
	colors = {
		"R": new Color(255, 0, 0),
		"G": new Color(0, 255, 0),
		"B": new Color(0, 0, 255),
		"Y": new Color(255, 255, 0),
		"lB": new Color(51, 255, 255),
		"O": new Color(255, 153, 51),
		"P": new Color(153, 51, 255)
	};
	//creating make everything blue button
	button = createButton('blueify');
	button.position(boardXPos + (boardWidth-4)*squareEdge, boardYPos + squareEdge*.5);
	button.size(4 * squareEdge, squareEdge);
	button.mousePressed(blueifyEverything);
}

// you always need a draw function in p5.js
// this is the function that gets called continuously in the background
// you can think of this function as what gets applied in each frame
function draw() {
	//background
	background(redColor + 100, greenColor + 20, blueColor + 255);
	//board background
	fill(0, 0, 0); 
	rect(boardXPos, boardYPos + (boardInvisibleHeight * squareEdge), boardWidth * squareEdge, boardVisibleHeight * squareEdge); //board offset by invisible squares
	textSize(22);
	text("Score: " + points, boardXPos, boardYPos + (boardHeight + 1) *squareEdge);
	
	//draw the accumulated shapes in the board
	boardArray.forEach(function(column, col_idx) {
		column.forEach(function(cell, row_idx) {
			if (cell != null && cell != "" && row_idx >= boardInvisibleHeight) {
				if (!allBlue) {
					fill(colors[cell].red, colors[cell].green, colors[cell].blue);
                }
				else{
					fill(colors[cell].red * .45, colors[cell].green * .30, colors[cell].blue + (255 - colors[cell].blue ) * .9);					
				}
				rect(boardXPos + col_idx * squareEdge, boardYPos + row_idx * squareEdge, squareEdge, squareEdge);
			}
		}, this);
	}, this);
	if (currentShape != null && state != READY && state != GAME_OVER) {
		currentShape.draw();
	}
	
	if (! paused) {
		//increment timer
        timer = (timer + 1) % (30 - Math.floor(points/4));
	}
	else{ //game is paused
		stroke(200, 200, 255, 215);
		fill(200, 200, 255, 215);
		rect(boardXPos, boardYPos + boardInvisibleHeight*squareEdge, boardWidth*squareEdge, boardVisibleHeight*squareEdge);
		stroke(0,0,0);
		fill(0, 0, 0);
		textAlign("center");
		textSize(30);
		text("Paused", boardXPos + boardWidth*squareEdge/2, boardYPos + (boardInvisibleHeight + boardHeight)*squareEdge/2);
		
	}
	
	if (timer == 0) {
		//CHANGE TO SWITCH STATEMENT
		//console.log("State is: " + state);
		if (state == READY) {
			//generate new random shape
			currentShape = new TetrisShape(possibleShapes);
			//set state to falling
			state = FALLING;
		} else if (state == FALLING) {
			currentShape.moveDown();
		} else if (state == HIT) {
			currentShape.addToBoard();
			points += processFullRows();
			//check if game is over
			if (boardOverflowed()) {
				state = GAME_OVER;
				//DISPLAY THAT GAME IS OVER
            }
			else{
				currentShape = new TetrisShape(possibleShapes);
				state = FALLING;
				//state = READY;
				//console.log("keep playing!!!");
			}
//			currentShape = null;
		} else if (state == GAME_OVER) {
			//display game over; click to play again
			//onclick (MAKE THIS FUNCTION) reset game variables and set state to ready again
			//I COULD HAVE ALL OF MY VARIABLE SETTING DONE IN A PRE-READY STATE CALLED 'NEW_GAME' AND THEN SET STATE
			//FROM HERE TO NEW_GAME
		}
    }


	redColor = (redColor + .05) % 255;
	greenColor = (greenColor + .05) % 255;
	blueColor = (blueColor + .05) % 255;
	//debugger;



}

function boardOverflowed() {
    return (getFullnessOfRow(boardInvisibleHeight - 1) > 0);
}

function processFullRows() {
	var currRow = boardHeight - 1;
	var runLength = 0;
	var firstFullRow = -1;
	var lastFullRow = -1;
	var points = 0;
	while (currRow >= 0){
		//console.log("all rows loop: " + currRow);

		//while each subsequent row encountered is full
		while (getFullnessOfRow(currRow) == boardWidth) {
			//console.log("full row loop: " + currRow);
			//if this is the first full row in a series, set firstFullRow as placemarker
			if (firstFullRow == -1) {
				firstFullRow = currRow;
            }
			//update lastFullRow
			lastFullRow = currRow;
			//prep currRow for next loop
			currRow--;
        }
		//check if just processed some full rows
		if (firstFullRow != -1) {
			//console.log();
			//store runLength (for points!!!)
			runLength = firstFullRow - lastFullRow + 1;
			
            //remove the rows between last full row and first full row, inclusive
			//move everything in the boardMatrix down
			boardArray = boardArray.map(col => col.map(function(val, idx, array) {
				if (idx - runLength < 0){
					return "";
				}
				else if (idx <= firstFullRow) {
                    return array[idx - runLength];
				//NOTE: THIS falls out of the ARRAY BOUNDS!!!
                }
				else{
					return val;
				}
			}));

			//update points
			points += Math.pow(2,runLength);
			//update currRow because some rows below it were removed
			currRow += runLength; //WAS +1
			//reset firstFullRow, lastRow, and runLength
			firstFullRow = -1;
			lastFullRow = -1;
			runLength = 0;
        }
		currRow --;
	}
	return points;
}


function getFullnessOfRow(row) {
	return getRow(row).reduce(function(sum, cellContents){
					  if(cellContents != null && cellContents != undefined && cellContents != ""){
						return sum + 1;
					  }
					  else{
						return sum;
					  }
	}, 0);
}

function getRow(row) {
	return boardArray.reduce(function(myAccumRow, nextColumn){
		return myAccumRow.concat(nextColumn[row]);
	},[]);
}

function keyPressed() {
	if (! paused && state != HIT) {
		switch (keyCode) {
			case LEFT_ARROW:
				currentShape.moveLeft();
				break;
			case RIGHT_ARROW:
				currentShape.moveRight();
				break;
			case UP_ARROW:
				currentShape.rotate();
				break;
			case DOWN_ARROW:
				currentShape.drop();
				break;
		}
	}
}

//pause
function keyTyped() {
	//pause
    if (key === ' ') {
		if (! paused) {
            paused = true;
	    }
		else{
			paused = false;
		}
    }
	//blueify
	else if (key === 'b') {
        blueifyEverything();
    }
}

function blueifyEverything() {
	//allBlue is used to determine how to draw the boardGrid and the tetris shapes
	if (! allBlue) {
        allBlue = true;
    }
	else{
		allBlue = false;
	}
	//this.label = "undo";
	//set background color
	blueColor = 0;
	redColor = 0;
	greenColor = 0;
}


function mousePressed() {	
	background(
		random(0, 50),
		random(0, 50),
		random(100, 255)
	);
}

