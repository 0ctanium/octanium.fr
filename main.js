let loaded = false;
let initialized = false;
let loader = false;

const perfData = window.performance.timing, // The PerformanceTiming interface represents timing-related performance information for the given page.
    EstimatedTime = -(perfData.loadEventEnd - perfData.navigationStart),
    time = parseInt((EstimatedTime/1000)%60)*100;

let current = 0;

const timer = setInterval(function() {
    current += 1;
    document.getElementById("loader-progress").style.width = current + "%";
    document.getElementById('percent').innerText = current + "%";

    if (current === 100) {
        clearInterval(timer);
        document.getElementById("loader").style.opacity = '0';
        setTimeout(function() {
            document.body.className = 'loaded';
            loaded = true;

            // // scrollbar
            // const scrollbar = new SimpleBar(document.getElementById('container'), { autoHide: false });
        }, 400)
    }
// }, 1000);
}, Math.abs(Math.floor(time / 100)));


const mouseRepulsionForce = 8; // low number => high repulsion
const textReconstructionForce = 80; // low number => fast reconstruction
const globalFriction = 0.81; // low number => high friction (fast particle slowing)

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let xCorrection = -365;
let yCorrection = -52 - 13;

let particles = [];

const mouse = {
    x: null,
    y: null,
    radius: 50,
}

class Particle {
    constructor(x, y) {
        if(loaded) {
            this.x = x + canvas.width / 2 + xCorrection;
            this.y = y + canvas.height / 2 + yCorrection;
        } else {
            this.x = Math.random()* canvas.width;
            this.y =Math.random()* canvas.height;
        }

        this.size = 0.5;
        this.destX = x + canvas.width / 2 + xCorrection;
        this.destY = y + canvas.height / 2 + yCorrection;
        this.vx = (Math.random()-0.5)*3;
        this.vy = (Math.random()-0.5)*3;
        this.accX = 0;
        this.accY = 0;
        this.friction = Math.random()*0.05 + globalFriction;
    }

    draw() {
        ctx.fillStyle = '#f1f1f1';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0,Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        if(loaded && initialized) {
            this.accX = (this.destX - this.x)/textReconstructionForce;
            this.accY = (this.destY - this.y)/textReconstructionForce;
            this.vx += this.accX;
            this.vy += this.accY;
            this.vx *= this.friction;
            this.vy *= this.friction;

            this.x += this.vx;
            this.y +=  this.vy;

            const a = this.x - mouse.x;
            const b = this.y - mouse.y;

            let distance = Math.sqrt( a*a + b*b );
            if(distance < mouse.radius) {
                this.accX = (this.x - mouse.x)/mouseRepulsionForce;
                this.accY = (this.y - mouse.y)/mouseRepulsionForce;
                this.vx += this.accX;
                this.vy += this.accY;
            }
        } else {
            if(this.x > canvas.width || this.x < 0) {
                this.vx = -this.vx;
            }
            if(this.y > canvas.height || this.y < 0) {
                this.vy = -this.vy;
            }

            const a = this.x - canvas.width / 2;
            const b = this.y - canvas.height / 2;
            let distance = Math.sqrt( a*a + b*b );
            if(distance < 150) {
                this.accX = (this.x - canvas.width / 2)/500;
                this.accY = (this.y - canvas.height / 2)/500;
                this.vx += this.accX;
                this.vy += this.accY;
            }

            this.x += this.vx;
            this.y +=  this.vy;
        }
    }
}

function init() {
    particles = [];

    ctx.fillStyle = 'white'
    ctx.font = '35px Trispace';
    ctx.fillText('Octanium', 0, 26);

    const textCoordinates = ctx.getImageData(0, 0, 184, 28);

    for(let y = 0, y2 = textCoordinates.height; y < y2; y++) {
        for(let x = 0, x2 = textCoordinates.width; x < x2; x++) {
            if(textCoordinates.data[(y * 4 * textCoordinates.width) + (x* 4 + 3)] > 120) {
                particles.push(new Particle(x * 4, y *4));
            }
        }
    }

    initialized = true;
}

WebFont.load({
    google: {
        families: ['Trispace']
    },
    active: init
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(particle) {
        particle.draw()
        particle.update()
    })
    connect();
    requestAnimationFrame(animate);
}

animate();
function connect() {
    for(let a = 0; a < particles.length; a++) {
        for(let b = a; b < particles.length; b++) {
            let dx = particles[b].x - particles[a].x,
                dy = particles[b].y - particles[a].y,
                d = Math.sqrt(dx ** 2 + dy ** 2);

            if(-0.75 < particles[a].destX - particles[a].x  && particles[a].destX - particles[a].x < 0.75
                && -0.75 < particles[a].destY - particles[a].y && particles[a].destY - particles[a].y < 0.75) {
                if(d < 6) {
                    ctx.strokeStyle = `rgba(241,241,241,${1})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            else {
                if(d < 15) {
                    ctx.strokeStyle = `rgba(241,241,241,${1 - (d/20)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.closePath();
                    ctx.stroke();
                }
            }
        }
    }
}

window.addEventListener('mousemove', function (e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener("touchmove", function (e) {
    if(e.touches.length > 0 ){
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
    }
});

window.addEventListener("touchend", function () {
    mouse.x = -9999;
    mouse.y = -9999;
});

window.addEventListener('resize', function(){
    ctx.canvas.width  = canvas.width = window.innerWidth
    ctx.canvas.height = canvas.height = window.innerHeight;
    init();
})
