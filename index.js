const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.height = innerHeight
canvas.width = innerWidth

const scoreElement = document.querySelector('#scoreElement')
const startGameElement = document.querySelector('#startGameElement')
const startElement = document.querySelector('#startElement')
const finalScore = document.querySelector('#finalScore')

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 30, 'blue')
let projectiles = []
let enemies = []
let particles = []
let score

function init() {
    player = new Player(x, y, 30, 'blue')
    projectiles = []
    enemies = []
    particles = []
    score = 0

    scoreElement.innerHTML = score
    finalScore.innerHTML = score
}

function spawnEnemy(){
    setInterval(() => {
        const radius = Math.random() * (50 - 10) + 10


        let x
        let y
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height             
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius 
        }
     
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2((canvas.height / 2) - y, (canvas.width / 2) - x)
        
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    
    player.draw()

    particles.forEach((particle,i) => {
        if (particle.alpha <= 0) {
            particles.splice(i,1) 
        }else{
            particle.update()
        }

    })

    projectiles.forEach((projectile,i) => {
        projectile.update()
        if ( projectile.x + projectile.radius < 0 || projectile.x + projectile.radius > canvas.width 
             || projectile.y + projectile.radius < 0 || projectile.y + projectile.radius > canvas.height
            ) {
            projectiles.splice(i, 1)
        }
        
    })

    enemies.forEach((enemy, i) => {
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if ( dist < enemy.radius + player.radius ){
            cancelAnimationFrame(animationId)
            startElement.style.display = 'flex'
            finalScore.innerHTML = score
        }
        projectiles.forEach((projectile, j) =>{
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if ( dist < enemy.radius + projectile.radius ){
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color, 
                    {x: (Math.random() - 0.5) * Math.random() * 8, y: (Math.random() - 0.5) * Math.random() * 2}))
                }
                if (enemy.radius - 10 > 8) {
                    enemy.radius -= 10
                    score += 100
                    setTimeout(() => {                        
                        projectiles.splice(j, 1)
                    },0)
                } else {
                    score += 150
                    setTimeout(() => {
                        enemies.splice(i, 1)
                        projectiles.splice(j, 1)
                    },0)                    
                }
                scoreElement.innerHTML = score
            }
        })
    })

}

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - (canvas.height / 2), event.clientX - (canvas.width / 2))
    
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2,  5, 'red', velocity))
    
    
})

startGameElement.addEventListener('click', () => {
    init()
    console.log('here');
    animate()
    spawnEnemy()
    startElement.style.display = 'none'
    
})