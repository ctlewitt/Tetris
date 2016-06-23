/*
file:
/Users/clewittes/Documents/Recurse Center/Projects/tetris_game/index.html

Things to do:
use pages.github.com to make it into a website
make pieces a little spread out on the blue spectrum to differentiate between them
make next piece displayed a little more centered (icing)



2 player (add to opponent's rows when you score)
multiple boards for multiple players (need to make board an object (currently only shapes are objects))
play against your friends
make 3D (with multiple people)
*/

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

function draw() {
	if (timer == 0) {
		switch (state) {
            case READY:
				//reset game state variables
				points = 0;
				timer = 0;
				paused = false;
				allBlue = false;
				//reset board (board is column major, since I will be checking the contents of each column as pieces fall)
				boardArray = new Array(boardWidth);
				for (var i = 0; i < boardWidth; i++) {
					boardArray[i] = new Array(boardHeight);
				}
				//generate new random shape
				currentShape = new TetrisShape(possibleShapes);
				nextShape = new TetrisShape(possibleShapes);
				//set state to falling
				state = FALLING;
				break;
			case FALLING:
				currentShape.moveDown();
				break;
			case HIT:
				currentShape.addToBoard();
				points += processFullRows();
				//check if game is over
				if (boardOverflowed()) {
					state = GAME_OVER;
				}
				else{
					currentShape = nextShape;
					nextShape = new TetrisShape(possibleShapes);
					state = FALLING;
				}
				break;
			//case GAMEOVER: do nothing
        }
	}

	//background
	background(redColor + 100, greenColor + 20, blueColor + 255);
	//board background
	fill(0, 0, 0); 
	rect(boardXPos, boardYPos + (boardInvisibleHeight * squareEdge), boardWidth * squareEdge, boardVisibleHeight * squareEdge); //board offset by invisible squares
	textSize(22);
	text("Score: " + points, boardXPos, boardYPos + (boardHeight + 1) *squareEdge);
	text("Level: " + Math.floor(points / 4), boardXPos + (boardWidth/2)*squareEdge, boardYPos + (boardHeight + 1) *squareEdge);	
	
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
	//draw the current shape
	if (currentShape != null && state != READY && state != GAME_OVER) {
		currentShape.draw();
	}
	
	//draw preview board background
	fill(0, 0, 0); 
	rect(previewXPos, previewYPos, previewEdge * squareEdge, previewEdge * squareEdge); 

	//draw preview shape
	if (nextShape != null && state != READY && state != GAME_OVER && !paused) {
		fill(255,255,255);
        nextShape.drawPreview();
    }
	
	
	if (! paused && state != GAME_OVER) {
		//increment timer (speeds up as score increases)
        timer = (timer + 1) % (30 - Math.floor(points/4));
	}
	else{ //game is paused or over
		//cover board
		stroke(200, 200, 255, 215);
		fill(200, 200, 255, 215);
		rect(boardXPos, boardYPos + boardInvisibleHeight*squareEdge, boardWidth*squareEdge, boardVisibleHeight*squareEdge);
		//displaying "Game Over" or "Pause" message
		var mainText = "";
		var subText = "";
		//setting text for game over scenario
		if (state == GAME_OVER) {
            mainMessage = "Game Over";
			instructions = "Press \'s\' to play again.";
        }
		//setting text for paused scenario
		else{ //paused
			mainMessage = "Paused";
			instructions = "Press \'p\' to unpause.";
		}
		stroke(0,0,0);
		fill(0, 0, 0);
		textAlign("center");
		textSize(30);
		text(mainMessage, boardXPos + boardWidth*squareEdge/2, boardYPos + (boardInvisibleHeight + boardHeight)*squareEdge/2);
		textSize(15);
		//instructions for starting over
		text(instructions, boardXPos + boardWidth*squareEdge/2, boardYPos + (boardInvisibleHeight + boardHeight + 2)*squareEdge/2);		
	}
	
	//background color is constantly changing
	redColor = (redColor + .05) % 155;
	greenColor = (greenColor + .05) % 155;
	blueColor = (blueColor + .05) % 255;



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
				currentShape.moveDown();
				break;
		}
	}
}

//pause
function keyTyped() {
	switch (key) {
		//pause/unpause
		case 'p':
			if (! paused) {
	            paused = true;
		    }
			else{
				paused = false;
			}
			break;
		//blueify
		case 'b':
			blueifyEverything();
			break;
		case 's':
			if (state == GAME_OVER) {
				state = READY;
			}
	        break;
		case ' ':
			currentShape.drop();
			break;
	}
}

function blueifyEverything() {
	//allBlue is used to determine how to draw the boardGrid and the tetris shapes
	if (! allBlue) {
        allBlue = true;
		button.html("colorify");
    }
	else{
		allBlue = false;
		button.html("blueify");
	}
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

