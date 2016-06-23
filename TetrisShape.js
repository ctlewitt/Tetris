LEFT = -1;
RIGHT = 1;
UP = -1;
DOWN = 1;
NOTHING = 0;

Xidx = 0;
Yidx = 1;

class TetrisShape {
	constructor(possibleShapes) {
		var shapeList = Object.keys(possibleShapes);
		this.shape = shapeList[Math.floor(Math.random() * (shapeList.length))];
		//console.log(this.shape);
		this.color = possibleShapes[this.shape].color;
		this.pointsInSpace = Array.from(possibleShapes[this.shape].startPositions);
		return this;
	}

	draw() {
		this.drawHelperSetColors();
		this.pointsInSpace.forEach(function(point) {
			if (point[Yidx] >= boardInvisibleHeight) {
				//draw box
				rect(boardXPos + point[0] * squareEdge, boardYPos + point[1] * squareEdge, squareEdge, squareEdge);
			}
		}, this);
	}

	drawPreview() {
		this.drawHelperSetColors();
		var centerPoint = this.pointsInSpace[0];
		console.log("drawing shape");
		this.pointsInSpace.forEach(function(point) {
			//draw box
			//rect(previewXPos, previewYPos, squareEdge, squareEdge);
			rect(previewXPos + (point[0] - centerPoint[0] + previewShapeXPos) * squareEdge, previewYPos + (point[1] - centerPoint[1] + previewShapeYPos) * squareEdge, squareEdge, squareEdge);
			//console.log("")
		}, this);		
	}
	
	drawHelperSetColors(){
		if (!allBlue) {
			fill(colors[this.color].red, colors[this.color].green, colors[this.color].blue);			
        }
		else{
			fill(colors[this.color].red * .45, colors[this.color].green * .30, colors[this.color].blue + (255 - colors[this.color].blue ) * .9);					
		}		
	}
	
	moveDown() {
		//check if it can move down
		var tempPointsInSpace = this.pointsInSpace.map(pos =>  [pos[Xidx], pos[Yidx]+1]);
		if (! this.hitSomething(tempPointsInSpace)) {
			this.pointsInSpace = tempPointsInSpace;
		} else {
			//set state to hit (waiting until next cycle to add to board, so user can sneak in 1 more move; left/right/rotate)
			state = HIT;
		}
	}

	addToBoard() {
		this.pointsInSpace.forEach(pos => boardArray[pos[Xidx]][pos[Yidx]] = this.color);
	}
		
	hitSomething(tempPointsInSpace){
		var hitBottom = tempPointsInSpace.some(pos => pos[Yidx] >= boardHeight);
		var hitSide = tempPointsInSpace.some(pos => pos[Xidx] >= boardWidth || pos[Xidx] < 0);
		//return true if tempPointsInSpace has fallen out of board
		//Note: must return early like this if hit an edge or hitAnotherObject will access outside of boardArray
		if (hitBottom || hitSide) {
			return true;
        }
		var hitAnotherObject = tempPointsInSpace.some((pos) =>
													boardArray[pos[Xidx]][pos[Yidx]] != null
												   && boardArray[pos[Xidx]][pos[Yidx]] != ""
												   && boardArray[pos[Xidx]][pos[Yidx]] != undefined
												   );

		return hitAnotherObject;
	}
/*
e-a = (0,-1)
a + (-y, +x) = (1,1) + (1,0) = (2,1)

f-a = (1,0)
a+ (-y, +x) = (1,1) + (0, 1) = (1, 2)

	 e (1,0)
  h  a(1,1)  f(2,1)
	 g(1,2)

a-a = (0,0)
a+...a
*/	 
	rotate() {
		var centerPoint = this.pointsInSpace[0];
		var tempPointsInSpace = this.pointsInSpace.map(pos => {
			var xDiff = pos[Xidx] - centerPoint[Xidx];
			var yDiff = pos[Yidx] - centerPoint[Yidx];
			return [centerPoint[Xidx] - yDiff, centerPoint[Yidx] + xDiff]});
		if (! this.hitSomething(tempPointsInSpace)) {
            this.pointsInSpace = tempPointsInSpace;
			this.draw();
			if (state == HIT) {
                this.moveDown();
            }
        }
		//else, do nothing; hits something when rotating
	}

	moveLeft(){
		this.moveDir(-1);
	}
	
	moveRight(){
		this.moveDir(1);
	}
	
	//helper function to moveLeft and moveRight;
	moveDir(dir){
		var tempPointsInSpace = this.pointsInSpace.map(pos => [pos[Xidx]+dir, pos[Yidx]]);
		if (! this.hitSomething(tempPointsInSpace)) {
			this.pointsInSpace = tempPointsInSpace;
			this.draw();
			if (state == HIT) {
				this.moveDown();
            }
		}
	}
	
	drop(){
		while (state != HIT) {
			this.moveDown();
	    }
	}
}