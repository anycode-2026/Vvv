import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 bg-emerald-50 min-h-screen pt-20 pb-32">
      <div class="container mx-auto px-4 max-w-5xl">
        <h2 class="text-3xl font-bold text-emerald-900 mb-8 font-serif flex items-center">
          <span class="bg-emerald-200 text-emerald-600 p-2 rounded-lg mr-3 shadow-inner">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </span>
          Your Shopping Bag
        </h2>

        @if (store.cart().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Cart Items List (Redesigned for Professional Mobile View) -->
            <div class="lg:col-span-2 space-y-4">
              @for (item of store.cart(); track item.id) {
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-row items-center gap-4 relative overflow-hidden group hover:border-emerald-300 transition-all">
                  
                  <!-- Left: Image -->
                  <div class="w-24 h-24 flex-shrink-0 bg-emerald-50 rounded-xl overflow-hidden relative cursor-pointer" (click)="store.viewProduct(item.id)">
                    <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover">
                    @if(item.selectedBundle !== 'single' && item.selectedBundle) {
                        <div class="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] text-center font-bold py-0.5 uppercase">
                            {{ item.selectedBundle }}
                        </div>
                    }
                  </div>
                  
                  <!-- Middle: Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <h3 class="text-sm font-bold text-emerald-900 leading-tight mb-1 cursor-pointer truncate pr-2" (click)="store.viewProduct(item.id)">
                            {{ item.name }}
                        </h3>
                        <!-- Remove Icon Top Right -->
                        <button (click)="store.removeFromCart(item.id)" class="text-gray-400 hover:text-red-500 p-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    
                    <p class="text-[10px] text-emerald-500 mb-2">{{ item.category }}</p>
                    
                    <div class="flex items-end justify-between mt-2">
                        <div class="font-bold text-lg text-emerald-600">৳ {{ item.finalPrice | number }}</div>
                        
                        <!-- Professional Quantity Control -->
                        <div class="flex items-center bg-emerald-50 rounded-lg border border-emerald-200">
                            <button (click)="store.updateQuantity(item.id, -1)" [disabled]="item.quantity <= 1" class="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 rounded-l-lg disabled:opacity-30 transition-colors font-bold text-lg">-</button>
                            <span class="w-6 text-center text-xs font-bold text-emerald-900">{{ item.quantity }}</span>
                            <button (click)="store.updateQuantity(item.id, 1)" class="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 rounded-r-lg transition-colors font-bold text-lg">+</button>
                        </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white p-6 rounded-3xl shadow-lg border border-emerald-100 lg:sticky lg:top-24">
                <h3 class="text-lg font-bold text-emerald-900 mb-4 font-serif border-b border-emerald-100 pb-2">Order Summary</h3>
                
                <div class="space-y-3 text-sm mb-6">
                  <div class="flex justify-between text-emerald-700">
                    <span>Subtotal</span>
                    <span class="font-semibold">৳ {{ store.cartTotal() | number }}</span>
                  </div>
                  <div class="flex justify-between text-emerald-700">
                    <span>Shipping</span>
                    <span class="font-semibold">৳ {{ store.adminSettings().shippingCost }}</span>
                  </div>
                  
                  <div class="pt-3 mt-2 border-t border-dashed border-emerald-200">
                    <div class="flex justify-between items-end">
                        <span class="font-bold text-emerald-900">Total</span>
                        <div class="text-right">
                             <span class="block text-xl font-bold text-emerald-600">৳ {{ store.cartTotal() + store.adminSettings().shippingCost | number:'1.0-0' }}</span>
                             <span class="text-[9px] text-emerald-400">VAT Included</span>
                        </div>
                    </div>
                  </div>
                </div>

                <!-- Desktop Checkout Button (GREEN) -->
                <button (click)="store.setView('CHECKOUT')" class="hidden lg:flex w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 justify-center items-center group">
                  Proceed to Checkout
                  <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
                
                <!-- Mobile Fixed Checkout Button (GREEN) -->
                <div class="lg:hidden fixed bottom-16 left-0 w-full p-4 bg-white/90 backdrop-blur-md border-t border-emerald-100 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <div class="flex justify-between items-center mb-2 px-2">
                        <span class="text-xs text-emerald-500 font-bold">Total Payable</span>
                        <span class="text-lg font-bold text-emerald-900">৳ {{ store.cartTotal() + store.adminSettings().shippingCost | number:'1.0-0' }}</span>
                    </div>
                    <button (click)="store.setView('CHECKOUT')" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex justify-center items-center">
                        Checkout Now
                    </button>
                </div>
              </div>
            </div>

          </div>
        } @else {
          <div class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-emerald-100 text-center animate-fadeIn mx-2">
            <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-emerald-900 mb-2 font-serif">Your bag is empty</h3>
            <p class="text-emerald-600 mb-6 text-sm">Looks like you haven't added anything yet.</p>
            <button (click)="store.setView('PRODUCTS')" class="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
              Start Shopping
            </button>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
    }
  `]
})
export class CartComponent {
  store = inject(StoreService);
}