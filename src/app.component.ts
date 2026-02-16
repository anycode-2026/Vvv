import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from './services/store.service';
import { HeaderComponent } from './components/header.component';
import { HeroComponent } from './components/hero.component';
import { ProductListComponent } from './components/product-list.component';
import { ProductDetailComponent } from './components/product-detail.component';
import { CartComponent } from './components/cart.component';
import { CheckoutComponent } from './components/checkout.component';
import { FooterComponent } from './components/footer.component';
import { AuthComponent } from './components/auth.component';
import { ProfileComponent } from './components/profile.component';
import { AdminLoginComponent } from './components/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { InstallComponent } from './components/install.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    FooterComponent,
    AuthComponent,
    ProfileComponent,
    AdminLoginComponent,
    AdminDashboardComponent,
    InstallComponent
  ],
  template: `
    <!-- ADMIN VIEW: Full Screen, no Header/Footer -->
    @if (store.currentView() === 'ADMIN_LOGIN') {
        <app-admin-login></app-admin-login>
    } @else if (store.currentView() === 'ADMIN_DASHBOARD') {
        <app-admin-dashboard></app-admin-dashboard>
    } @else if (store.currentView() === 'INSTALL') {
        <app-install></app-install>
    } @else {
        <!-- PUBLIC VIEW -->
        <div class="bg-emerald-50 min-h-screen pb-20"> <!-- Updated background to Emerald -->
            <app-header></app-header>
            
            <main>
            @switch (store.currentView()) {
                @case ('HOME') {
                <app-hero></app-hero>
                <app-product-list></app-product-list>
                }
                @case ('PRODUCTS') {
                <div class="pt-16">
                    <app-product-list></app-product-list>
                </div>
                }
                @case ('DETAIL') {
                <app-product-detail></app-product-detail>
                }
                @case ('CART') {
                <app-cart></app-cart>
                }
                @case ('CHECKOUT') {
                <app-checkout></app-checkout>
                }
                @case ('LOGIN') {
                <app-auth></app-auth>
                }
                @case ('REGISTER') {
                <app-auth></app-auth>
                }
                @case ('PROFILE') {
                <app-profile></app-profile>
                }
            }
            </main>

            <!-- Show Footer (About Section) everywhere EXCEPT on Cart and Checkout pages. NOW VISIBLE ON DETAIL. -->
            @if (store.currentView() !== 'CART' && store.currentView() !== 'CHECKOUT') {
                <app-footer></app-footer>
            }

            <!-- Fixed Bottom Navigation (Green Theme) -->
            <nav class="fixed bottom-0 left-0 w-full bg-emerald-100/95 backdrop-blur-md border-t border-emerald-200 z-50 shadow-[0_-5px_15px_rgba(16,185,129,0.1)] pb-safe">
                <div class="grid grid-cols-4 h-16">
                    <!-- Home -->
                    <button (click)="store.setView('HOME')" class="flex flex-col items-center justify-center space-y-1 active:bg-emerald-200 transition-colors">
                        <svg class="w-6 h-6" [class.text-emerald-600]="store.currentView() === 'HOME'" [class.fill-emerald-600]="store.currentView() === 'HOME'" [class.text-emerald-400]="store.currentView() !== 'HOME'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 01 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span class="text-[10px] font-bold" [class.text-emerald-600]="store.currentView() === 'HOME'" [class.text-emerald-400]="store.currentView() !== 'HOME'">Home</span>
                    </button>

                    <!-- Shop -->
                    <button (click)="store.setView('PRODUCTS')" class="flex flex-col items-center justify-center space-y-1 active:bg-emerald-200 transition-colors">
                        <svg class="w-6 h-6" [class.text-emerald-600]="store.currentView() === 'PRODUCTS'" [class.fill-emerald-600]="store.currentView() === 'PRODUCTS'" [class.text-emerald-400]="store.currentView() !== 'PRODUCTS'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span class="text-[10px] font-bold" [class.text-emerald-600]="store.currentView() === 'PRODUCTS'" [class.text-emerald-400]="store.currentView() !== 'PRODUCTS'">Shop</span>
                    </button>

                    <!-- Cart -->
                    <button (click)="store.setView('CART')" class="flex flex-col items-center justify-center space-y-1 active:bg-emerald-200 transition-colors relative">
                        <svg class="w-6 h-6" [class.text-emerald-600]="store.currentView() === 'CART'" [class.fill-emerald-600]="store.currentView() === 'CART'" [class.text-emerald-400]="store.currentView() !== 'CART'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        @if(store.cartCount() > 0) {
                            <span class="absolute top-2 right-5 bg-emerald-600 text-white text-[8px] font-bold px-1 py-0.5 rounded-full shadow-sm min-w-[14px] text-center">{{ store.cartCount() }}</span>
                        }
                        <span class="text-[10px] font-bold" [class.text-emerald-600]="store.currentView() === 'CART'" [class.text-emerald-400]="store.currentView() !== 'CART'">Cart</span>
                    </button>

                    <!-- Account -->
                    <button (click)="handleProfileClick()" class="flex flex-col items-center justify-center space-y-1 active:bg-emerald-200 transition-colors">
                        <svg class="w-6 h-6" [class.text-emerald-600]="store.currentView() === 'PROFILE' || store.currentView() === 'LOGIN'" [class.fill-emerald-600]="store.currentView() === 'PROFILE'" [class.text-emerald-400]="store.currentView() !== 'PROFILE' && store.currentView() !== 'LOGIN'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span class="text-[10px] font-bold" [class.text-emerald-600]="store.currentView() === 'PROFILE' || store.currentView() === 'LOGIN'" [class.text-emerald-400]="store.currentView() !== 'PROFILE' && store.currentView() !== 'LOGIN'">Account</span>
                    </button>
                </div>
            </nav>
        </div>
    }
  `,
  styles: [`
    .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  `]
})
export class AppComponent {
  store = inject(StoreService);

  handleProfileClick() {
      if(this.store.currentUser()) {
          this.store.setView('PROFILE');
      } else {
          this.store.setView('LOGIN');
      }
  }
}