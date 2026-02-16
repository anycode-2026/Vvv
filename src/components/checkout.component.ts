import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="py-12 bg-emerald-50 min-h-screen pt-20 pb-8"> <!-- Reduced Bottom Padding -->
      <div class="container mx-auto px-4 max-w-5xl">
        <h2 class="text-3xl font-bold text-emerald-900 mb-8 font-serif text-center">Secure Checkout</h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Forms -->
            <div class="space-y-6">
                <!-- Shipping Info -->
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
                    <h3 class="text-lg font-bold text-emerald-900 mb-6 flex items-center">
                        <span class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm mr-3 font-bold shadow-md shadow-emerald-200">1</span>
                        Shipping Information
                    </h3>
                    
                    <div class="grid grid-cols-1 gap-4">
                        <div class="grid gap-4" [ngClass]="{'grid-cols-2': store.adminSettings().authConfig.showLastName, 'grid-cols-1': !store.adminSettings().authConfig.showLastName}">
                            @if(store.adminSettings().authConfig.showFirstName) {
                                <div>
                                    <label class="block text-[10px] font-bold text-emerald-600 uppercase mb-1 ml-1">First Name *</label>
                                    <input type="text" placeholder="e.g. Rahim" [(ngModel)]="checkoutData.firstName" class="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-100 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-emerald-900 placeholder:text-emerald-300">
                                </div>
                            }
                            @if(store.adminSettings().authConfig.showLastName) {
                                <div>
                                    <label class="block text-[10px] font-bold text-emerald-600 uppercase mb-1 ml-1">Last Name *</label>
                                    <input type="text" placeholder="e.g. Uddin" [(ngModel)]="checkoutData.lastName" class="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-100 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-emerald-900 placeholder:text-emerald-300">
                                </div>
                            }
                        </div>
                        
                        @if(store.adminSettings().authConfig.requireEmail) {
                            <div>
                                <label class="block text-[10px] font-bold text-emerald-600 uppercase mb-1 ml-1">Email Address *</label>
                                <input type="email" placeholder="e.g. rahim@example.com" [(ngModel)]="checkoutData.email" class="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-100 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-emerald-900 placeholder:text-emerald-300">
                            </div>
                        }

                        @if(store.adminSettings().authConfig.requirePhone) {
                            <div>
                                <label class="block text-[10px] font-bold text-emerald-600 uppercase mb-1 ml-1">Phone Number *</label>
                                <input type="tel" placeholder="e.g. 01700000000" [(ngModel)]="checkoutData.phone" class="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-100 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-emerald-900 placeholder:text-emerald-300">
                            </div>
                        }
                        
                        @if(store.adminSettings().authConfig.showAddress) {
                            <div>
                                <label class="block text-[10px] font-bold text-emerald-600 uppercase mb-1 ml-1">Delivery Address *</label>
                                <textarea placeholder="House No, Road No, Area, City" [(ngModel)]="checkoutData.address" rows="3" class="w-full p-4 bg-emerald-50 rounded-xl border border-emerald-100 focus:outline-none focus:border-emerald-400 focus:bg-white transition-all text-emerald-900 placeholder:text-emerald-300"></textarea>
                            </div>
                        }

                        <!-- AUTO SIGNUP PASSWORD FIELD (For Guests) -->
                        @if (!store.currentUser()) {
                            <div class="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl animate-pulse-soft">
                                <label class="block text-[10px] font-bold text-emerald-700 uppercase mb-1 ml-1">Create Account Password *</label>
                                <input type="password" placeholder="Set a password for your new account" [(ngModel)]="checkoutData.password" class="w-full p-4 bg-white rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-500 transition-all text-emerald-900 placeholder:text-emerald-300">
                                <p class="text-[10px] text-emerald-600 mt-2 font-bold flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    An account will be automatically created for you to track your order.
                                </p>
                            </div>
                        }
                    </div>
                </div>

                <!-- Payment Method -->
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
                    <h3 class="text-lg font-bold text-emerald-900 mb-6 flex items-center justify-between">
                        <div class="flex items-center">
                             <span class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm mr-3 font-bold shadow-md shadow-emerald-200">2</span>
                             Payment Method
                        </div>
                    </h3>
                    
                    <div class="grid grid-cols-1 gap-3 mb-6">
                        <!-- COD Option (Updated with Specific Logo) -->
                        @if(store.adminSettings().enableCOD) {
                            <div (click)="paymentMethod.set('COD')" 
                                 [class]="paymentMethod() === 'COD' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-100 hover:border-emerald-200'"
                                 class="border rounded-xl p-3 cursor-pointer flex items-center gap-4 transition-all relative overflow-hidden group min-h-[4.5rem]">
                                
                                <!-- Authentic COD Logo Container (Vector Style) -->
                                <div class="w-16 h-12 flex-shrink-0 bg-emerald-50 rounded-lg border border-slate-100 flex items-center justify-center p-1 overflow-hidden">
                                    <img src="https://cdn-icons-png.flaticon.com/512/9198/9198191.png" class="w-full h-full object-contain" alt="Cash On Delivery">
                                </div>
                                
                                <div class="flex-1 min-w-0">
                                    <span class="text-sm font-bold text-slate-700 block truncate">Cash On Delivery</span>
                                    <span class="text-[10px] text-slate-400 break-words leading-tight">Pay only when you receive</span>
                                </div>
                                <div class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                     [class.border-emerald-600]="paymentMethod() === 'COD'"
                                     [class.bg-emerald-600]="paymentMethod() === 'COD'"
                                     [class.border-slate-300]="paymentMethod() !== 'COD'">
                                     <div class="w-2 h-2 bg-white rounded-full" *ngIf="paymentMethod() === 'COD'"></div>
                                </div>
                            </div>
                        }

                        <!-- Other Methods -->
                        @for (method of visiblePaymentMethods(); track method.id) {
                            <div (click)="paymentMethod.set(method.id)" 
                                 [class]="paymentMethod() === method.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-100 hover:border-emerald-200'"
                                 class="border rounded-xl p-3 cursor-pointer flex items-center gap-4 transition-all relative overflow-hidden group min-h-[4rem]">
                                
                                <div class="w-16 h-12 flex-shrink-0 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1">
                                    <img [src]="method.logo" class="max-w-full max-h-full object-contain" [alt]="method.name">
                                </div>
                                
                                <div class="flex-1 min-w-0">
                                    <span class="text-sm font-bold text-slate-700 block truncate">{{ method.name }}</span>
                                    <span class="text-[10px] text-slate-400 break-words leading-tight">Pay securely via {{ method.name }}</span>
                                </div>

                                <div class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                     [class.border-emerald-600]="paymentMethod() === method.id"
                                     [class.bg-emerald-600]="paymentMethod() === method.id"
                                     [class.border-slate-300]="paymentMethod() !== method.id">
                                     <div class="w-2 h-2 bg-white rounded-full" *ngIf="paymentMethod() === method.id"></div>
                                </div>
                            </div>
                        }
                    </div>

                    <!-- Payment Instructions -->
                    @if(paymentMethod() !== 'COD') {
                        <div class="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 transition-all duration-300 relative overflow-hidden">
                             @for (method of visiblePaymentMethods(); track method.id) {
                                @if(paymentMethod() === method.id) {
                                    <div class="text-center animate-fadeIn relative z-10">
                                        <p class="text-xs text-emerald-800 mb-3 font-bold uppercase tracking-wide">Step 1: Send Money</p>
                                        
                                        <div (click)="copyToClipboard(method.number)" class="bg-white px-4 py-3 rounded-xl border border-emerald-200 inline-flex items-center justify-between gap-4 shadow-sm cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group w-full max-w-xs mx-auto mb-2">
                                            <h4 class="text-lg font-bold text-emerald-700 select-all tracking-wider font-mono truncate">{{ method.number }}</h4>
                                        </div>
                                        <p class="text-[10px] text-emerald-400 mb-4">Tap to copy number</p>
                                        <div class="w-full border-t border-emerald-200 my-4"></div>
                                        <p class="text-xs text-emerald-800 mb-2 font-bold uppercase tracking-wide">Step 2: Enter Transaction ID</p>
                                        <input type="text" [(ngModel)]="transactionId" placeholder="e.g. 9JKS82..." class="w-full p-3 bg-white rounded-lg border focus:border-emerald-500 outline-none text-center tracking-widest uppercase font-mono placeholder:font-sans text-emerald-900 border-emerald-300 shadow-inner mb-4">
                                    </div>
                                }
                             }
                        </div>
                    } @else {
                        <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center flex flex-col items-center">
                            <p class="text-emerald-800 font-bold text-sm mb-1">Pay cash when you receive your order.</p>
                            <p class="text-xs text-emerald-600">Please have the exact amount ready.</p>
                        </div>
                    }
                </div>
            </div>

            <!-- Summary Panel -->
            <div class="space-y-6">
                <div class="bg-white p-6 rounded-3xl shadow-lg border border-emerald-100 sticky top-24">
                    <h3 class="text-lg font-bold text-emerald-900 mb-6 font-serif">Order Summary</h3>
                    <div class="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        @for(item of store.cart(); track item.id) {
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <div class="w-12 h-12 bg-emerald-50 rounded-lg mr-3 overflow-hidden border border-emerald-100 relative">
                                        <img [src]="item.image" class="w-full h-full object-cover">
                                    </div>
                                    <div>
                                        <div class="text-sm font-semibold text-emerald-900 line-clamp-1 w-32">{{ item.name }}</div>
                                        <div class="text-xs text-emerald-500">
                                            Qty: {{ item.quantity }} | {{ item.selectedSizes?.join(', ') }}
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-bold text-emerald-900">৳ {{ item.finalPrice * item.quantity | number:'1.0-0' }}</div>
                                </div>
                            </div>
                        }
                    </div>
                    
                    <div class="border-t border-emerald-100 pt-4 space-y-2">
                         <div class="flex justify-between text-emerald-800 text-sm"><span>Subtotal</span><span>৳ {{ store.cartTotal() | number:'1.0-0' }}</span></div>
                         <div class="flex justify-between text-emerald-800 text-sm"><span>Shipping</span><span>৳ {{ store.adminSettings().shippingCost }}</span></div>
                         <div class="flex justify-between text-emerald-600 font-bold text-xl pt-2 border-t border-dashed border-emerald-200 mt-2">
                            <span>Total</span>
                            <span>৳ {{ store.cartTotal() + store.adminSettings().shippingCost | number:'1.0-0' }}</span>
                        </div>
                    </div>

                    <button (click)="placeOrder()" [disabled]="processing()" class="mt-6 w-full bg-gradient-to-r from-emerald-700 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                        @if(processing()) {
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        } @else { {{ paymentMethod() === 'COD' ? (store.currentUser() ? 'Place Order' : 'Sign Up & Place Order') : 'Confirm Payment' }} }
                    </button>
                    
                    <p class="text-[10px] text-center text-slate-400 mt-3">
                        By placing this order, you agree to our Terms of Service.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </section>
  `
})
export class CheckoutComponent {
  store = inject(StoreService);
  paymentMethod = signal<string>('COD');
  processing = signal(false);
  transactionId = '';
  promoCode = '';
  checkoutData = { firstName: '', lastName: '', email: '', phone: '', address: '', password: '' };

  visiblePaymentMethods = computed(() => this.store.paymentMethods().filter(pm => pm.isVisible));

  constructor() {
      if(this.store.adminSettings().enableCOD) { this.paymentMethod.set('COD'); }
      else if(this.visiblePaymentMethods().length > 0) { this.paymentMethod.set(this.visiblePaymentMethods()[0].id); }
      
      // AUTO FILL USER DATA IF LOGGED IN
      effect(() => {
          const user = this.store.currentUser();
          if(user) {
              this.checkoutData = {
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  address: user.addresses && user.addresses.length > 0 ? user.addresses[0] : '',
                  password: '' // Password not needed if logged in
              };
          }
      });
  }

  copyToClipboard(text: string) { navigator.clipboard.writeText(text); alert(`Copied: ${text}`); }
  
  placeOrder() {
    const config = this.store.adminSettings().authConfig;

    // Strict Validation: Checks for empty strings or just spaces
    if (config.showFirstName && !this.checkoutData.firstName.trim()) { alert('Please enter your First Name'); return; }
    if (config.showLastName && !this.checkoutData.lastName.trim()) { alert('Please enter your Last Name'); return; }
    if (config.requirePhone && !this.checkoutData.phone.trim()) { alert('Please enter your Phone Number'); return; }
    if (config.showAddress && !this.checkoutData.address.trim()) { alert('Please enter your Delivery Address'); return; }
    if (config.requireEmail && !this.checkoutData.email.trim()) { alert('Please enter your Email'); return; }

    // GUEST AUTO-SIGNUP LOGIC
    if (!this.store.currentUser()) {
        if(!this.checkoutData.password || this.checkoutData.password.length < 6) {
            alert('Please create a password (min 6 chars) to create your account.');
            return;
        }

        // Check if user already exists
        const existing = this.store.users().find(u => u.email.toLowerCase() === this.checkoutData.email.toLowerCase());
        if (existing) {
             alert('An account with this email already exists. Please login first.');
             this.store.setView('LOGIN');
             return;
        }

        // Register User Silently (Pass 'false' to avoid redirecting to Home)
        this.store.register({
            email: this.checkoutData.email,
            password: this.checkoutData.password,
            firstName: this.checkoutData.firstName,
            lastName: this.checkoutData.lastName,
            phone: this.checkoutData.phone,
            addresses: [this.checkoutData.address]
        }, false); // <--- False prevents redirect
    }

    if(this.paymentMethod() !== 'COD' && !this.transactionId.trim()) { alert('Please enter the Transaction ID for your payment.'); return; }
    
    this.processing.set(true);
    setTimeout(() => {
        const total = this.store.cartTotal() + this.store.adminSettings().shippingCost;
        this.store.placeOrder(this.paymentMethod(), total, this.transactionId, {
            name: `${this.checkoutData.firstName} ${this.checkoutData.lastName}`,
            phone: this.checkoutData.phone,
            email: this.checkoutData.email,
            address: this.checkoutData.address
        });
        this.processing.set(false);
        this.transactionId = ''; 
        alert('Order Placed Successfully! Account Created.');
    }, 1500);
  }
}