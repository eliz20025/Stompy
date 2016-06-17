var canvas;
var ctx;
var score;
var highScore;
var player;
var airborn;
var sliding;
var jumpTimer = 0;
var jetPack = 100;
var inputs = {
    left: false,
    up: false,
    right: false,
    down: false
};
var spritesheet = new Image();
var sprites = {
	left: new sprite(30, 38, 30, 38),
	right: new sprite( 0, 0, 30, 38),
	leftJump: new sprite (0, 38, 30, 38),
	rightJump: new sprite (30, 0, 30, 38),
	jet: new sprite(60, 0, 15, 21),
	enemy: new sprite(78, 0, 35, 47)
};	
var cloud = new Image();
cloud.src = 'cloud.png';
var coin = new Image();
coin.src = 'coin.png';
var facingRight = true;
var platforms = [];
var target;
var jet; 
var enemy;
var enemyPlat;
var timestamp = Date.now();

var ACCEL = 50;
var MAX_VELOCITY = 100;
var MIN_VELOCITY =.5;
var JUMP_VELOCITY= 300;
var JUMP_TIME = .2;
var FRICTION_FACTOR = 3;
var DROP_FACTOR = 3;
var SLIDE_FACTOR = 50;
var GRAVITY = 500; 
var SPLATTER_VELOCITY = 400;
var MAX_DELTA = .03;
var EDGE_CREEP= 7;
var SCORE_DIGITS = 8;
var JET_DECAY = 30;
var JET_RECOVER =20;
var ENEMY_VELOCITY = 50;

function init() {
	spritesheet.src = 'hatguy.png';
	
	highScore = localStorage.getItem('high');
	if(!highScore) highScore = 0;
	
    canvas = document.getElementById('canvas');
    canvas.width = 600;
    canvas.height = 600;
    ctx = canvas.getContext('2d');

    player = new entity(0, 0, 30, 38);
	player.setBottom(canvas.height - 50);
	reset();
	
	platforms.push(new entity(50,100,50,50));
	platforms.push(new entity(400,200,50,50));
	platforms.push(new entity(0,550,600,50));
	platforms.push(new entity(100,450,50,50));
	platforms.push(new entity(200,300,200,50));
	platforms.push(new entity(150,200,50,50));
	
	jet = new entity(-100,-200, 15, 21);
	
	enemy = new entity(0, 0, 30, 30);
	moveEnemy();
	
	target = new entity (0, 0, 10, 20);
	moveTarget();
	
	player = new entity(0,0, 30, 38);
	reset();

    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);

    gameLoop();
}

function reset() {
	score = 0;
	
	player.vx = 0;
	player.vy = 0;
	player.setLeft(0);
	player.setBottom(canvas.height);
}
function moveTarget() {
	score += 5;
	if(score > highScore) { 
		highScore = score;
		localStorage.setItem('high', highScore);
	}
	var platform = pick(platforms);
	target.setMidX(platform.getMidX());
	target.setMidY(platform.getTop() - platform.halfHeight);
}
function moveEnemy() {
score += 20;
	if(score > highScore) { 
		highScore = score;
		localStorage.setItem('high', highScore);
}	


enemy.vx = ENEMY_VELOCITY;
	enemyPlat = pick(platforms);
	enemy.setBottom(enemyPlat.getTop());
	enemy.setMidX(enemyPlat.getMidX());
}	
function gameLoop() {
    updatePosition();
	handleCollision();
    updateCanvas();
    window.requestAnimationFrame(gameLoop);
}

function updatePosition() {
    var now = Date.now();
    var delta = (now - timestamp) / 500;
   if(delta > MAX_DELTA) delta = MAX_DELTA;
    timestamp = now;

    if(inputs.left) {
	facingRight= false
		if(!airborn && player.vx > 0) {
			player.vx -= delta * player.vx * FRICTION_FACTOR;
		} 
		player.vx -= delta *ACCEL;
    } else if(inputs.right) {
		facingRight = true;
		if(! airborn && player.vx < 0) {
		player.vx-= delta * player.vx * FRICTION_FACTOR;
		}
		player.vx += delta *ACCEL;
    }else if (! airborn) {
		player.vx-= delta * player.vx * FRICTION_FACTOR;
	}
	var jetting = false;
    if(inputs.up) {
        if(!airborn) {
			jumpTimer = JUMP_TIME;
			player.vy = -JUMP_VELOCITY;
			player.vx-= delta * player.vx * FRICTION_FACTOR;
		}
		
		if(jumpTimer> 0) {
			jumpTimer-= delta;
		} else {
			player.vy += delta * GRAVITY;
		}
	} else if(inputs.down && jetPack > 0) {
		jetting = true;
		player.vy -= delta * ACCEL;
		jetPack -= delta * JET_DECAY;
	}else{
		if(jumpTimer) jumpTimer = 0;
		if( player.vy <0) player.vy -= delta * player.vy * DROP_FACTOR;
        player.vy += delta * GRAVITY;
	}
	
	if(!inputs.down && jetPack < 100) {
		jetPack += delta * JET_RECOVER;
		if(jetPack > 100) jetPack = 100;
}	
	if(sliding) {
		player.vy -= delta * player.vy * SLIDE_FACTOR;
	}	
		
	if(player.vx > MAX_VELOCITY){
		player.vx = MAX_VELOCITY;
	}else if (player.vx < -MAX_VELOCITY){
		player.vx = -MAX_VELOCITY;
	} else if  (Math.abs(player.vx) < MIN_VELOCITY){
		player.vx = 0;
	}	
	player.x += delta * player.vx;
	player.y += delta * player.vy;
	
	if(jetting) {
		jet.setMidX(player.getMidX());
		jet.setTop(player.getBottom()-3);
		}else {
			jet.x = -100;
			jet.y = -100;
		}
		
		if(enemy.vx > 0) {
			if(enemy.getMidX() > enemyPlat.getRight()) {
				enemy.vx *= -1;
			}
		}else {
			if(enemy.getMidX() < enemyPlat.getLeft()) {
				enemy.vx *= -1;
			}	
		}
		
		enemy.x += delta * enemy.vx;
		enemy.y += delta * enemy.vy;
}	

function handleCollision() {
	airborn = true;
	sliding = false;
	
	if(collideRect(player, enemy)) reset();
	if(collideRect(jet, enemy)) moveEnemy(); 
	
	var platform, dx, dy;
	for(var p=0; p<platforms.length;p++){
		platform=platforms[p];
		if(collideRect(player, platform)) {
			dx = (platform.getMidX() - player.getMidX()) / platform.width;
			dy = (platform.getMidY() - player.getMidY()) / platform.height;
			if(Math.abs(dx) > Math.abs(dy)) {
				sliding = true
				if(dx < 0) {
					player.setLeft(platform.getRight());
				}else {
					if(player.vx < 0) player.vx = 0;
					player.setRight(platform.getLeft());
				}
			}else{
				player.vy = 0;
				if(dy < 0) {
					player.setTop(platform.getBottom());
				}else {
					if (player.vy > SPLATTER_VELOCITY) {
					}else {
						if(player.vy > 0) player.vy = 0;
						player.setBottom(platform.getTop());
						if(Math.abs(player.vx) < EDGE_CREEP) {
							var x = player.getMidX();
							if(x < platform.getLeft() && inputs.right) {
								player.vx = -EDGE_CREEP;
							} else if( x > platform.getRight() && !inputs.left) {
								player.vx = EDGE_CREEP;
							}	
						}
						airborn = false;
					}
				}	
			}
		}	
	}
	
	if(collideRect(player, target)) moveTarget();
	
    if(player.getLeft() < 0) {
        player.setLeft(0);
		player.vx = 0;
    } else if(player.getRight() > canvas.width) {
        player.setRight(canvas.width);
		player.vx = 0;
    }

    if(player.getTop() < 0) {
        player.setTop(0);
		player.vy = 0;
    } else if(player.getBottom() > canvas.height) {
		if(player.vy > SPLATTER_VELOCITY) {
			reset();
		} else {
			player.setBottom(canvas.height);
			player.vy = 0;
			airborn = false;
		}
    }
}

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	ctx.font = 'bold 18px monospace';
	ctx.fillStyle = 'white';
	ctx.fillText(' HIGH: '+pad(highScore, SCORE_DIGITS), 30, 40);
	ctx.fillText('SCORE: '+pad(score, SCORE_DIGITS), 30, 70);
	
	var bar = (jetPack / 100) * player.width;
	var color = 'green';

	if(jetPack <  25) {
		color = 'red';
	} else if (jetPack < 50) {
		color = 'yellow';
	}
	ctx.fillStyle = color;
	ctx.fillRect(player.getLeft(), player.getTop() - 10, bar, 4);
	
		drawSprite(sprites.jet, jet);
	

	var sprite; 
	if(airborn){
		if(facingRight) {
		sprite = sprites.rightJump;
		}else{
		sprite = sprites.leftJump;
		}
	} else {
	 if(facingRight){
		sprite = sprites.right
		} else {
		sprite = sprites.left;
		}
	}
	
	drawSprite(sprite, player);
	
	drawSprite(sprites.enemy,enemy);
	

	var platform;
	for(var p=0; p< platforms.length; p++){
		platform = platforms[p];
		ctx.drawImage(cloud, platform.x, platform.y, platform.width, platform.height);
	}
	ctx.drawImage(coin, target.x, target.y, 40, 40);
}	

function drawSprite(s, e) {
console.log(s,e);
 ctx.drawImage(spritesheet, s.x, s.y, s.width, s.height, e.x, e.y, e.width, e.height);
}
function keyDown(e) {
    e.preventDefault();
    switch(e.keyCode) {
        case 37: //left
            inputs.left = true;
            break;
        case 38: //up
            inputs.up = true;
            break;
        case 39: //right
            inputs.right = true;
            break;
        case 40: //down
            inputs.down = true;
            break;
    }
}

function keyUp(e) {
    e.preventDefault();
    switch(e.keyCode) {
        case 37: //left
            inputs.left = false;
            break;
        case 38: //up
            inputs.up = false;
            break;
        case 39: //right
            inputs.right = false;
            break;
        case 40: //down
            inputs.down = false;
            break;
    }
}

function collideRect(a,b) {
	if (a.getLeft() > b.getRight()) return false;
	
	if (a.getTop() > b.getBottom()) return false;
	
	if (a.getRight() < b.getLeft()) return false;
	
	if (a.getBottom() < b.getTop()) return false;
	
	return true;
}