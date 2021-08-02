//Canvas SETUP
const canvas = document.getElementById('main-canvas');

//Gain access to 2d build in drawing methods
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0; //use it to add periodic events to the game
ctx.font = '40px Georgia';
let gameSpeed = 1;
let gameOver = false;


//Create a variable to get the bounds of the canvas
let canvasPosition = canvas.getBoundingClientRect();
console.log(canvasPosition);


//Mouse INTERACTIVITY
const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click: false
}

/*
//(these mouse coords will be relative to the body not canvas)
canvas.addEventListener('mousedown', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
});
*/

//(these mouse coords will be relative to the canvas)
canvas.addEventListener('mousedown', function(event){
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener('mouseup', function(){
    mouse.click = false;
});

//Create PLAYER
const playerLeft = new Image();
playerLeft.src = '../fish_game/used_sprites/yellow_fish_swim_left.png';
const playerRight = new Image();
playerRight.src = '../fish_game/used_sprites/yellow_fish_swim_right.png';

class Player{
    constructor(){
        //this.x and this.y will have the coordinates given at the creation of variable "mouse", till we click the canvas
        this.x = canvas.width; 
        this.y = canvas.height/2;
        this.radius = 50;
        this.angle = 0;
        this.frameX = 0; //currently displayed frames
        this.frameY = 0;
        this.frame = 0;
        this.spriteWidth = 418; //depends on the spritesheet dimensions (look at sprite we have 4 fish on the line, so divide img width by 4 to get this number, same with height look at number of fish on height)
        this.spriteHeight = 397; //depends on the spritesheet dimensions
    }

    update(){
        const dx = this.x - mouse.x; //x-distance between player and mouseClick
        const dy = this.y - mouse.y; //y-distance between player and mouseClick
        
        //calculate the angle rotation for the fish
        let theta = Math.atan2(dy, dx);
        this.angle = theta;

        if(mouse.x != this.x){
            this.x -= dx/20; //divide by a number so player doesn't jump
            //directly to mouse x, but "moves towards it".
        }
        if(mouse.y != this.y){
            this.y -= dy/20;
        }

        //ANIMATE the enemy, to look like he swims
        if(gameFrame % 5 == 0){
            this.frame++;
            if(this.frame >= 12){
                this.frame = 0;
            }
            if(this.frame == 3 || this.frame == 7 || this.frame ==11){
                this.frameX = 0;
            } else{
                this.frameX++;
            }
            if(this.frame < 3){
                this.frameY = 0;
            } else if(this.frame < 7){
                this.frameY = 1;
            } else if(this.frame < 11){
                this.frameY = 2;
            } else{
                this.frameY = 0;
            }
        }        

    }

    draw(){
        if(mouse.click){
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y); //start point of line
            ctx.lineTo(mouse.x, mouse.y); //end point of the line
            ctx.stroke(); //connect the start-end points
        }
        /* REPLACED by playerImage 
        ctx.fillStyle = 'red'; //player color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); //draw a circle
        ctx.fill(); //draw circle
        ctx.closePath();
        ctx.fillRect(this.x, this.y, this.radius, 10);
        */
        //this.x & this.y you adjust them so the fish will be on top of
        //the red circle, depends by case, try and readjust
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        //in the if statement we changed this.x & this.y by 0, since
        //they are reflected in the ctx.translate(this.x, this.y); call above
        if(this.x >= mouse.x){
        ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, 
            this.frameY * this.spriteHeight, this.spriteWidth, 
            this.spriteHeight, /*this.x*/ 0 - 50, /*this.y*/ 0 -50 , this.spriteWidth/4, 
            this.spriteHeight/4);
        }else{
            ctx.drawImage(playerRight, this.frameX * this.spriteWidth, 
                this.frameY * this.spriteHeight, this.spriteWidth, 
                this.spriteHeight, /*this.x*/ 0 - 50, /*this.y*/ 0 -50 , this.spriteWidth/4, 
                this.spriteHeight/4);
        }
        ctx.restore();
    }
}

const player = new Player();

//Create Water Bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = '../fish_game/used_sprites/buble_pop_two_01.png';

class Bubble{
    constructor(){
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1;
        this.distance;
        this.counted = false;
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }

    update(){
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt(dx*dx + dy*dy);
    }

    draw(){
        /*
        COMMENT THIS, IT has been replaced with bubbleImage
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        */
        ctx.drawImage(bubbleImage, this.x - 70, this.y -70, this.radius * 2.8, this.radius * 2.8);
    }
}

let bubblePop1 = document.createElement(`audio`);
bubblePop1.src = '../fish_game/sounds/Plop.ogg'; //entire path, since this would be like it would be in index.html
const bubblePop2 = document.createElement('audio');
bubblePop2.src = '../fish_game/sounds/bubbles-single1.wav';

function handleBubble(){
    //every 50 frames add a bubble
    if(gameFrame % 50 == 0){
        bubblesArray.push(new Bubble());
        //console.log(bubblesArray.length);
    }
    for(let i=0; i<bubblesArray.length; i++){
        bubblesArray[i].update();
        bubblesArray[i].draw();
        if(bubblesArray[i].y < 0 - bubblesArray[i].radius * 2){
            //use setTimeout, so when we remove an element graphics won't flicker
            setTimeout( ()=>{
                bubblesArray.splice(i, 1);
            },0);
        } else if(bubblesArray[i].distance <bubblesArray[i].radius + player.radius){
                if(!bubblesArray[i].counted){
                    if(bubblesArray[i].sound == 'sound1'){
                        bubblePop1.play();
                    }else{
                        bubblePop2.play();
                    }
                    score++;
                    bubblesArray[i].counted = true;
                    setTimeout( ()=>{
                        bubblesArray.splice(i, 1);
                    },0);
                }
            }
    }   
}

//set image background
//Repeating backgrounds
const background = new Image();
background.src = '../fish_game/images/background1.png';

const BG = {
    x1:0,
    x2:canvas.width,
    y: 0,
    width:canvas.width,
    height:canvas.height
}

function handleBackground(){
    BG.x1 -=gameSpeed;
    if(BG.x1 < -BG.width){
        BG.x1 = BG.width;
    }

    BG.x2 -=gameSpeed;
    if(BG.x2 < -BG.width){
        BG.x2 = BG.width;
    }

    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

//create enemies
const enemyImage = new Image();
enemyImage.src = '../fish_game/used_sprites/red_fish_swim_left.png';

class Enemy{
    constructor(){
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150) + 90;
        this.radius = 50;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 418;
        this.spriteHeight = 397;
    }

    draw(){
        /* PLACED BY enemyIMAGE
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0 , Math.PI * 2);
        ctx.fill();
        */
        ctx.drawImage(enemyImage, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - 50, this.y - 50, this.spriteWidth/4, this.spriteHeight/4);
    }

    update(){
        this.x -= this.speed;
        if(this.x < 0 - this.radius * 2){
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150) + 90;
            this.speed = Math.random() * 2 + 2;
        }

        //ANIMATE the enemy, to look like he swims
        if(gameFrame % 5 == 0){
            this.frame++;
            if(this.frame >= 12){
                this.frame = 0;
            }
            if(this.frame == 3 || this.frame == 7 || this.frame ==11){
                this.frameX = 0;
            } else{
                this.frameX++;
            }
            if(this.frame < 3){
                this.frameY = 0;
            } else if(this.frame < 7){
                this.frameY = 1;
            } else if(this.frame < 11){
                this.frameY = 2;
            } else{
                this.frameY = 0;
            }
        }

        //collision with player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < this.radius + player.radius){
            handleGameOver();
        }
    }
}

const enemy1 = new Enemy();
function handleEnemies(){
    enemy1.draw();
    enemy1.update();
}

function handleGameOver(){
    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, you reached score:' + score, 130, 250);
    gameOver = true;
}

//Animate
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBackground();
    handleBubble();
    player.update();
    player.draw();
    handleEnemies();
    ctx.fillStyle = 'black'
    ctx.fillText('score: ' + score, 10, 50);
    gameFrame++;
    if(!gameOver){
        requestAnimationFrame(animate);
    }
}
//console.log(ctx);
animate();

//fix issue with mouse position when resizing browser
window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
});
