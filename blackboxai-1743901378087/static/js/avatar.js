class Avatar {
  constructor() {
    this.canvas = document.getElementById('avatarCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.x = 100;
    this.y = 100;
    this.state = 'idle';
    this.animations = {
      'idle': this.drawIdle.bind(this),
      'speaking': this.drawSpeaking.bind(this),
      'processing': this.drawProcessing.bind(this)
    };
    this.frame = 0;
    setInterval(this.update.bind(this), 100);
  }

  drawIdle() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#4a89dc';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, 50, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eyes
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.arc(this.x-20, this.y-10, 10, 0, Math.PI * 2);
    this.ctx.arc(this.x+20, this.y-10, 10, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawSpeaking() {
    this.drawIdle();
    // Animated mouth
    const mouthHeight = 5 + Math.sin(this.frame * 0.2) * 5;
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(this.x-15, this.y+15, 30, mouthHeight);
  }

  drawProcessing() {
    this.drawIdle();
    // Thinking animation
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 3;
    for(let i=0; i<3; i++) {
      const offset = this.frame * 0.1 + i;
      const radius = 5 + Math.sin(offset) * 3;
      this.ctx.beginPath();
      this.ctx.arc(this.x + i*15 - 15, this.y + 40, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  }

  update() {
    this.frame++;
    this.animations[this.state]();
  }

  setState(state) {
    this.state = state;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.avatar = new Avatar();
});