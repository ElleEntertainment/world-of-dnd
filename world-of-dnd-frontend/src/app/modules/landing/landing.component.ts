import { Component, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements AfterViewInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Ash particles
    for (let i = 0; i < 32; i++) {
      const ash = this.renderer.createElement('div');
      this.renderer.addClass(ash, 'ash-particle');
      this.renderer.setStyle(ash, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(ash, 'animation-delay', `${Math.random() * 6}s`);
      // Movimento randomico orizzontale
      this.renderer.setStyle(ash, '--ash-x', `${(Math.random() - 0.5) * 80}px`);
      this.el.nativeElement.querySelector('.ash-container').appendChild(ash);
    }

    // Fireball cursor and trail
    const fireball = this.el.nativeElement.querySelector('#fireball-cursor');
    this.renderer.setStyle(fireball, 'pointerEvents', 'none');
    const trailContainer = this.renderer.createElement('div');
    this.renderer.addClass(trailContainer, 'fireball-trail-container');
    this.renderer.setStyle(trailContainer, 'position', 'fixed');
    this.renderer.setStyle(trailContainer, 'top', '0');
    this.renderer.setStyle(trailContainer, 'left', '0');
    this.renderer.setStyle(trailContainer, 'width', '100vw');
    this.renderer.setStyle(trailContainer, 'height', '100vh');
    this.renderer.setStyle(trailContainer, 'pointerEvents', 'none');
    this.renderer.setStyle(trailContainer, 'zIndex', '49');
    document.body.appendChild(trailContainer);

    window.addEventListener('mousemove', (e) => {
      gsap.to(fireball, {
        x: e.clientX - 24,
        y: e.clientY - 24,
        duration: 0.2,
        ease: 'power2.out'
      });

      // Fireball trail
      const trail = this.renderer.createElement('div');
      this.renderer.setStyle(trail, 'position', 'fixed');
      this.renderer.setStyle(trail, 'left', `${e.clientX - 16}px`);
      this.renderer.setStyle(trail, 'top', `${e.clientY - 16}px`);
      this.renderer.setStyle(trail, 'width', '32px');
      this.renderer.setStyle(trail, 'height', '32px');
      this.renderer.setStyle(trail, 'pointerEvents', 'none');
      this.renderer.setStyle(trail, 'zIndex', '48');
      this.renderer.setStyle(trail, 'mixBlendMode', 'plus-lighter');
      this.renderer.setStyle(trail, 'opacity', '0.7');
      this.renderer.setStyle(trail, 'background', 'radial-gradient(circle at 60% 40%, #fbbf24 0%, #f87171 60%, #be185d00 100%)');
      this.renderer.setStyle(trail, 'borderRadius', '50%');
      this.renderer.setStyle(trail, 'transition', 'opacity 0.4s linear');
      trailContainer.appendChild(trail);

      gsap.to(trail, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          trail.remove();
        }
      });
    });
  }
}
