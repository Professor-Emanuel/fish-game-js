//Canvas SETUP
const canvas = document.getElementById('main-canvas');

//Gain access to 2d build in drawing methods
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 500;

let score = 0;
let gameFrame = 0; //use it to add periodic events to the game
ctx.font = '50px Georgia';


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
        this.spriteWidth = 498; //depends on the spritesheet dimensions
        this.spriteHeight = 327; //depends on the spritesheet dimensions
    }

    update(){
        const dx = this.x - mouse.x; //x-distance between player and mouseClick
        const dy = this.y - mouse.y; //y-distance between player and mouseClick
        if(mouse.x != this.x){
            this.x -= dx/20; //divide by a number so player doesn't jump
            //directly to mouse x, but "moves towards it".
        }
        if(mouse.y != this.y){
            this.y -= dy/20;
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
        ctx.fillStyle = 'red'; //player color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); //draw a circle
        ctx.fill(); //draw circle
        ctx.closePath();
        ctx.fillRect(this.x, this.y, this.radius, 10);
    }
}

const player = new Player();

//Create Water Bubbles
const bubblesArray = [];
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
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
    }
}

const bubblePop1 = document.createElement('audio');
bubblePop1.src = 'Plop.ogg';
const bubblePop2 = document.createElement('audio');
bubblePop2.src = 'bubbles-single1.wav';

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
        }
        if(bubblesArray[i].distance <bubblesArray[i].radius + player.radius){
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

//Animate
function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleBubble();
    player.update();
    player.draw();
    ctx.fillStyle = 'black'
    ctx.fillText('score: ' + score, 10, 50);
    gameFrame++;
    requestAnimationFrame(animate);
}
//console.log(ctx);
animate();