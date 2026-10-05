export function initParticles(): void {
  setTimeout(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.background-canvas');
    if (!canvas) return;

    const contextOrNull = canvas.getContext('2d');
    if (!contextOrNull) return;
    const context: CanvasRenderingContext2D = contextOrNull;

    const connectionDistance = 110;
    const speed = 0.8;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.radius = Math.random() * 2 + 1.5;
      }

      update(): void {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw(color: string): void {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
      }
    }

    let particles: Particle[] = [];

    function createParticles(): void {
      particles = [];
      const screenArea = width * height;
      const particleCount = Math.min(Math.floor(screenArea * 0.00015), 500);

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    createParticles();

    function animate(): void {
      context.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const dotColor = isDark ? 'rgb(255 255 255 / 0.8)' : 'rgb(0 0 0 / 0.5)';
      const lineColor = isDark ? 'rgb(255 255 255 / 0.15)' : 'rgb(0 0 0 / 0.1)';

      for (const particle of particles) {
        particle.update();
        particle.draw(dotColor);
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.strokeStyle = lineColor;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      createParticles();
    });
  }, 100);
}