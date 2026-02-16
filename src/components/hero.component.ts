import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="w-full pt-20 pb-4 bg-slate-50">
      <div class="container mx-auto px-2 md:px-4">
        <!-- Compact Box Slider -->
        <div class="relative w-full aspect-[2/1] md:aspect-[3/1] lg:h-[400px] rounded-2xl overflow-hidden shadow-lg group border border-emerald-100 bg-slate-200">
          
          <!-- Slides -->
          @if (slides().length > 0) {
              @for (slide of slides(); track slide.id; let i = $index) {
                <div 
                  class="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-white"
                  [class.opacity-100]="currentSlide() === i"
                  [class.opacity-0]="currentSlide() !== i"
                >
                  <img [src]="slide.image" class="w-full h-full object-cover" alt="Banner">
                  <!-- Gradient Overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              }
          } @else {
              <!-- Fallback placeholder if no slides -->
              <div class="absolute inset-0 flex items-center justify-center bg-emerald-100 text-emerald-400 font-bold">
                  No Slides Configured in Admin
              </div>
          }

          <!-- Indicators -->
          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            @for (slide of slides(); track slide.id; let i = $index) {
              <button 
                (click)="setSlide(i)"
                class="h-1.5 rounded-full transition-all duration-300 shadow-sm backdrop-blur-sm"
                [class.bg-emerald-600]="currentSlide() === i"
                [class.w-8]="currentSlide() === i"
                [class.bg-white/60]="currentSlide() !== i"
                [class.w-2]="currentSlide() !== i"
              ></button>
            }
          </div>

          <!-- Navigation Arrows -->
          <button (click)="prev()" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-emerald-600 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 border border-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button (click)="next()" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-emerald-600 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 border border-white/30">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  `
})
export class HeroComponent implements OnInit, OnDestroy {
  store = inject(StoreService);
  currentSlide = signal(0);
  intervalId: any;

  // Linked directly to Admin Settings
  slides = computed(() => this.store.adminSettings().heroSlides);

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.next();
    }, 5000);
  }

  stopAutoSlide() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  setSlide(index: number) {
    this.stopAutoSlide();
    this.currentSlide.set(index);
    this.startAutoSlide();
  }

  next() {
    if (this.slides().length === 0) return;
    this.currentSlide.update(curr => (curr + 1) % this.slides().length);
  }

  prev() {
    if (this.slides().length === 0) return;
    this.currentSlide.update(curr => (curr - 1 + this.slides().length) % this.slides().length);
  }
}