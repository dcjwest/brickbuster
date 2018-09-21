$(function(){
	var screenWidth = window.screen.width;
	//Canvas Variables
	var canvas = $('#myCanvas')[0];
	var canvasMsg = $('#msg');
	var replayBtn = $('#replay');
	var ctx = canvas.getContext('2d');
	var timer;
	var timer_ON = false;
	var score = 0;
	var lives = 3;
	var manDown = false;
	var gameOver = false;
	//Ball variables
	var ballRadius = 10;
	var ball_X = (canvas.width)/2;
	var ball_Y = (canvas.height)-30;
	var ballSpeed = 1.5;
	var ball_dx = ballSpeed;
	var ball_dy = -ballSpeed;
	var ballColour = "yellow";
	var ballCollision = false;
	//Paddle variables
	var paddleHeight = 10;
	var paddleWidth = 75;
	var paddle_X = (canvas.width - paddleWidth)/2;
	//User input variables
	var rightPressed = false;
	var leftPressed = false;
	//Touch variables
	var touchObj = null;
	var touchStartX = 0;
	//Brick variables
	var brickWidth = 78;
	var brickHeight = 20;
	var brickRows = 3;
	var brickColumns = 8;
	var brickPadding = 10;
	var brickTopOffset = 30;
	var brickLeftOffset = 50;
	var brickArr = [];

	//Re-initialize canvas dimensions and object parameters for small mobile device
	if (screenWidth < 330){
		canvas.width = 600;
		canvas.height = 280;
		brickColumns = 6;
		brickWidth = 75;
		brickHeight = 15;
		ball_X = (canvas.width)/2;
		ball_Y = (canvas.height)-30;
		paddle_X = (canvas.width - paddleWidth)/2;
	}

	//Initialize brick stack
	for(var c = 0; c < brickColumns; c++){
		brickArr[c] = [];
		for(var r = 0; r < brickRows; r++){
			brickArr[c][r] = {x:0, y:0, status:1};
		}
	}

	//Event Listeners
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	document.addEventListener("mousemove", mouseHandler, false);
	canvas.addEventListener("click", togglePause, false);
	canvas.addEventListener("touchstart", detectTouch);
	canvas.addEventListener("touchmove", touchHandler);

	//Draw the initial layout. Game is triggered by clicking on the canvas
	draw();

	//Event handlers for controlling paddle movement
	function keyDownHandler(event){
		if(event.which == 80 || event.which == 13){
			togglePause();
		}
		if(event.which == 39){
			rightPressed = true;
		}
		else if(event.which == 37){
			leftPressed = true;
		}
	}

	function keyUpHandler(event){
		if(event.which == 39){
			rightPressed = false;
		}
		else if(event.which == 37){
			leftPressed = false;
		}
	}

	function mouseHandler(event){
		var relativeX = event.clientX - canvas.offsetLeft;
		if(relativeX > 0 && relativeX < canvas.width){
			paddle_X = relativeX - paddleWidth;
		}
	}

	function detectTouch(event){
		touchObj = event.changedTouches[0];
		touchStartX = parseInt(touchObj.clientX);
	}

	function touchHandler(event){
		touchObj = event.changedTouches[0];
		var relativeX = parseInt(touchObj.clientX);
		if(relativeX > 0 && relativeX < canvas.width){
			paddle_X = relativeX - paddleWidth;
		}
	}

	function togglePause(){
		if(!gameOver){
			if(timer_ON){
				timer_ON = false;
				clearInterval(timer);
				if(manDown){
					canvasMsg.html('Click/Press Enter to Try Again').show();
				}
				else {
					canvasMsg.html('Game Paused (P)').show();
				}
			}
			else{
				canvasMsg.hide();
				timer_ON = true;
				timer = setInterval(draw, 10);
			}
		}
	}

	function detectCollision(){
		for(var c = 0; c < brickColumns; c++){
			for(var r = 0; r < brickRows; r++){
				var b = brickArr[c][r];

				if(b.status == 1){
					if(ball_X >= b.x && ball_X <= b.x + brickWidth 
						&& ball_Y >= b.y-ballRadius && ball_Y <= b.y + brickHeight + ballRadius){
						b.status = 0;
						ball_dy = -ball_dy;
						ballCollision = true;
						score++;

						if(score == brickRows*brickColumns){
							clearInterval(timer);
							canvasMsg.addClass('animate').html('YOU WIN! CONGRATULATIONS!').show();
							replayBtn.show();
							replayBtn.on('click', function(){document.location.reload();});
						}
					}
				}
			}
		}
	}

	function drawBall(){
		if(ballCollision){
			newColour = colourBall();
			ctx.beginPath();
			ctx.arc(ball_X, ball_Y, ballRadius, 0, Math.PI*2);
			ctx.fillStyle = newColour;
			ctx.fill();
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.closePath();
			ballCollision = false;
			ballColour = newColour;
		}

		else{
			ctx.beginPath();
			ctx.arc(ball_X, ball_Y, ballRadius, 0, Math.PI*2);
			ctx.fillStyle = ballColour;
			ctx.fill();
			ctx.closePath();
			ballCollision = false;
		}
	}

	//Change ball colour every time it hits a brick
	function colourBall(){
		var coloursArr = new Array("black", "red", "orange", "yellow", "green", "blue", "purple");
		var randNum = Math.floor(Math.random()*6+1);
		return coloursArr[randNum];
	}

	function drawPaddle(){
		ctx.beginPath();
		ctx.rect(paddle_X, canvas.height-(paddleHeight+10), paddleWidth, paddleHeight);
		ctx.fillStyle = "#333";
		ctx.fill();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.closePath();
	}

	function drawBricks(){
		for(var c = 0; c < brickColumns; c++){
			for(var r = 0; r < brickRows; r++){
				if(brickArr[c][r].status == 1){
					var brickX = (c*(brickWidth + brickPadding)) + brickLeftOffset;
					var brickY = (r*(brickHeight + brickPadding)) + brickTopOffset;
					brickArr[c][r].x = brickX;
					brickArr[c][r].y = brickY;
					ctx.beginPath();
					ctx.rect(brickX, brickY, brickWidth, brickHeight);
					ctx.fillStyle = "#9F0000";
					ctx.fill();
					ctx.strokeStyle = "#000";
					ctx.lineWidth = 2;
					ctx.stroke();
					ctx.closePath();
				}
			}
		}
	}

	function drawScore(){
		ctx.font = "16px Comic Sans MS";
		ctx.fillStyle = "black";
		ctx.fillText("Score: "+score, 8, 20);
	}

	function drawLives(){
		ctx.font = "16px Comic Sans MS";
		ctx.fillStyle = "black";
		ctx.fillText("Lives: "+lives, canvas.width-65, 20);
	}

	function draw(){
		if (manDown){
			togglePause();
			manDown = false;
		}
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawBricks();
		drawBall();
		drawPaddle();
		drawScore();
		drawLives();
		//Handle collision detection
		detectCollision();
		//Collision with either right or left wall
		if(ball_X + ball_dx > canvas.width - ballRadius || ball_X + ball_dx < ballRadius){
			ball_dx = -ball_dx;
		}
		//Collision with ceiling
		if(ball_Y + ball_dy < ballRadius){
			ball_dy = -ball_dy;
		}
		//Collision with paddle
		if(ball_Y > canvas.height - (paddleHeight + 2*ballRadius)){
			if(ball_X > paddle_X && ball_X < paddle_X + paddleWidth){
				ball_dy = -ball_dy;
			}
		}
		//Ball falls out of bounds
		if(ball_Y > canvas.height + ballRadius){
			lives--;
			if(!lives){
				gameOver = true;
				clearInterval(timer);
				canvasMsg.addClass('animate').html('GAME OVER!').show();
				replayBtn.show();
				replayBtn.on('click', function(){document.location.reload();})
			}
			else{
				manDown = true;
				ball_X = (canvas.width)/2;
				ball_Y = (canvas.height)-30;
				paddle_X = (canvas.width - paddleWidth)/2;
			}
		}
		//Control paddle movement within canvas
		if(rightPressed && paddle_X < canvas.width-paddleWidth){
			paddle_X += 7;
		}
		else if (leftPressed && paddle_X > 0){
			paddle_X -= 7;
		}
		//Increment ball position coordinates i.e. make ball move
		ball_X += ball_dx;
		ball_Y += ball_dy;
	}
});