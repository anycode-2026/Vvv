import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Product, Review } from '../services/store.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="pb-6 bg-slate-50/30 min-h-screen overflow-x-hidden">
      <div class="container mx-auto px-2 md:px-4">
        
        <!-- 1. COMPACT SERVICE STRIP -->
        @if(!store.searchQuery() && selectedCategory() === 'All') {
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 my-4 px-1">
                @for(service of visibleServices(); track service.id) {
                    <div class="bg-white/80 backdrop-blur border border-slate-100 p-2 rounded-lg flex items-center gap-2 shadow-sm">
                        <div class="w-8 h-8 rounded-full text-white flex items-center justify-center flex-shrink-0" [style.background-color]="store.adminSettings().themeColor">
                             @if(service.icon === 'truck') {
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                             } @else if(service.icon === 'check') {
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                             } @else if(service.icon === 'cash') {
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                             } @else {
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                             }
                        </div>
                        <div>
                            <div class="text-[10px] font-bold text-slate-800 uppercase tracking-wide">{{ service.title }}</div>
                            <div class="text-[8px] text-slate-500">{{ service.subtitle }}</div>
                        </div>
                    </div>
                }
            </div>
        }

        <!-- 2. CATEGORY TABS -->
        @if(!store.searchQuery()) {
            <div class="mb-6 sticky top-16 z-30 bg-white/95 backdrop-blur py-2 shadow-sm">
                 <div class="flex overflow-x-auto gap-0 items-center no-scrollbar">
                     <button (click)="setCategory('All')" 
                             class="px-5 py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all relative group"
                             [style.color]="selectedCategory() === 'All' ? store.adminSettings().themeColor : '#64748b'">
                        All
                        <span class="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" 
                              [class.scale-x-100]="selectedCategory() === 'All'"
                              [style.background-color]="store.adminSettings().themeColor"></span>
                     </button>
                     
                     @for(cat of visibleCategories(); track cat) {
                        @if(cat !== 'All') {
                            <button (click)="setCategory(cat)" 
                                    class="px-5 py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all relative group"
                                    [style.color]="selectedCategory() === cat ? store.adminSettings().themeColor : '#64748b'">
                                {{ cat }}
                                <span class="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" 
                                      [class.scale-x-100]="selectedCategory() === cat"
                                      [style.background-color]="store.adminSettings().themeColor"></span>
                            </button>
                        }
                     }
                 </div>
            </div>
        }
        
        <!-- 2.5 BEST SELLERS SECTION (Added as requested) -->
        @if(!store.searchQuery() && selectedCategory() === 'All') {
            <div class="mb-10 px-1 animate-fadeIn">
                <h3 class="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
                    <span class="text-amber-500 text-2xl">★</span> Best Selling Products
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    @for (product of store.topSellingProducts(); track product.id) {
                        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative cursor-pointer" (click)="store.viewProduct(product.id)">
                            <!-- Badge -->
                            <div class="absolute top-0 left-0 z-20 bg-amber-500 text-white text-[8px] font-bold px-2 py-1 rounded-br-lg shadow-sm uppercase tracking-wide">
                                Hot
                            </div>
                            <div class="aspect-square p-2 bg-slate-50 relative overflow-hidden">
                                <img [src]="product.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-lg">
                            </div>
                            <div class="p-3 flex-grow flex flex-col justify-between">
                                <div>
                                    <h3 class="text-xs font-bold text-slate-900 mb-1 leading-tight line-clamp-2 min-h-[2.4em]">{{ product.name }}</h3>
                                </div>
                                <div class="mt-1">
                                     <div class="flex items-center gap-1.5">
                                         <span class="text-sm font-bold" [style.color]="store.adminSettings().themeColor">৳{{ product.price }}</span>
                                         @if(product.originalPrice) { <span class="text-[10px] text-slate-400 line-through">৳{{ product.originalPrice }}</span> }
                                     </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        }

        <!-- 3. MAIN PRODUCTS GRID -->
        <div class="mb-12 px-1 animate-fadeIn" style="animation-delay: 0.2s">
            <h3 class="text-xl font-bold text-slate-900 font-serif mb-4 flex items-center gap-2">
               @if(store.searchQuery()) { 🔍 Search Results } @else { All Products }
            </h3>
            
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                @for (product of visibleProducts(); track product.id) {
                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative cursor-pointer" (click)="store.viewProduct(product.id)">
                        <!-- Badge -->
                        @if(product.badge) { <div class="absolute top-0 left-0 z-20 text-white text-[9px] font-bold px-2 py-1 rounded-br-lg shadow-sm uppercase tracking-wide" [ngClass]="product.badge.colorClass">{{ product.badge.text }}</div> }
                        
                        <!-- Wishlist Btn -->
                        <button (click)="toggleWishlist($event, product.id)" class="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition-colors group-hover:scale-110">
                           <svg class="w-4 h-4" [style.color]="store.isInWishlist(product.id) ? store.adminSettings().themeColor : '#94a3b8'" [class.fill-current]="store.isInWishlist(product.id)" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                        
                        <!-- Image Container -->
                        <div class="aspect-square p-3 bg-slate-50 relative overflow-hidden">
                            <img [src]="product.image" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 rounded-lg shadow-sm">
                            
                            <!-- VERIFIED BADGE -->
                            @if(product.isVerified) {
                                <div class="absolute bottom-2 right-2 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    Verified
                                </div>
                            }

                            @if(product.stock < 5) {
                                <div class="absolute bottom-0 inset-x-0 w-full bg-red-500/80 text-white text-[9px] text-center font-bold py-0.5">Low Stock</div>
                            }
                        </div>
                        
                        <!-- Details -->
                        <div class="p-3 flex-grow flex flex-col justify-between">
                            <div>
                                <div class="flex items-center mb-1.5">
                                    <div class="flex items-center gap-0.5">
                                        @for(star of [1,2,3,4,5]; track star) {
                                            <svg class="w-2.5 h-2.5" [class.text-yellow-400]="star <= product.rating" [class.text-gray-200]="star > product.rating" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                        }
                                        <span class="text-[9px] text-slate-400 ml-1">({{ product.reviews }})</span>
                                    </div>
                                </div>
                                <h3 class="text-xs font-bold text-slate-900 mb-1 leading-tight line-clamp-2 min-h-[2.4em] group-hover:text-emerald-600 transition-colors">{{ product.name }}</h3>
                            </div>
                            <div class="mt-2">
                                 <div class="flex items-center justify-between mb-3">
                                     <div class="flex items-baseline gap-1.5">
                                         <span class="text-sm font-bold" [style.color]="store.adminSettings().themeColor">৳{{ product.price }}</span>
                                         @if(product.originalPrice) {
                                             <span class="text-[10px] text-slate-400 line-through font-medium">৳{{ product.originalPrice }}</span>
                                         } @else if(product.sale) {
                                             <span class="text-[9px] text-slate-300 line-through">৳{{ (product.price * 1.2).toFixed(0) }}</span>
                                         }
                                     </div>
                                 </div>
                                <button (click)="addToCart($event, product)" class="w-full relative overflow-hidden group/btn text-white py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2" [style.background-color]="store.adminSettings().themeColor">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                    <span class="relative z-10 font-bold text-[10px] uppercase tracking-wider">Add To Bag</span>
                                </button>
                            </div>
                        </div>
                    </div>
                }
            </div>
            
             @if (visibleProducts().length < filteredProductsSource().length) {
                <div class="flex justify-center mb-8 py-6">
                    <button (click)="loadMore()" class="text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 active:scale-95 border-2 border-white/50" [style.background-color]="store.adminSettings().themeColor">
                        @if(isLoadingMore()) {
                             <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                             Loading...
                        } @else {
                             <span>Show More Products</span>
                             <svg class="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                        }
                    </button>
                </div>
            }
        </div>

        <!-- 4. CUSTOMER REVIEWS SECTION (Auto Rotating) -->
        @if(!store.searchQuery() && store.customerReviews().length > 0) {
            <div class="mb-10 px-1 animate-fadeIn">
                 <h3 class="text-xl font-bold text-slate-900 font-serif mb-6 flex items-center gap-2">
                    <span [style.color]="store.adminSettings().themeColor">💬</span> Customer Reviews
                 </h3>
                 
                 <!-- Dynamic Sliding Review Grid -->
                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
                     @for(review of rotatingReviews(); track review.id) {
                         <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full relative group hover:border-emerald-300 transition-all hover:shadow-md animate-fadeIn">
                             <!-- Quote Icon -->
                             <div class="absolute top-4 right-4 text-emerald-100 group-hover:text-emerald-500 transition-colors">
                                 <svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 16.6569 20.6739 18 19.017 18H16.017C15.4647 18 15.017 18.4477 15.017 19V21L14.017 21ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 16.6569 11.6738 18 10.017 18H7.01697C6.46468 18 6.01697 18.4477 6.01697 19V21L5.01697 21Z" /></svg>
                             </div>
                             
                             <div class="mb-4">
                                 <div class="flex items-center gap-1 mb-3">
                                     @for(star of [1,2,3,4,5]; track star) {
                                         <svg class="w-4 h-4" [class.text-yellow-400]="star <= review.rating" [class.text-gray-200]="star > review.rating" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                     }
                                 </div>
                                 <p class="text-sm text-slate-600 leading-relaxed italic mb-2 line-clamp-3">"{{ review.comment }}"</p>
                             </div>
                             
                             <div class="flex items-center gap-3 mt-auto border-t border-slate-50 pt-4">
                                 <img [src]="review.avatar" class="w-10 h-10 rounded-full object-cover border-2 border-emerald-50">
                                 <div>
                                     <div class="text-sm font-bold text-slate-900">{{ review.user }}</div>
                                     <div class="text-[10px] text-emerald-500 truncate max-w-[150px] font-medium">{{ review.productName }}</div>
                                 </div>
                             </div>
                         </div>
                     }
                 </div>
            </div>
        }

        <!-- 5. LATEST NEWS (Shifted Right) -->
        @if(!store.searchQuery() && visibleBlogs().length > 0) {
            <div class="mb-10 px-1 animate-fadeIn pl-4 md:pl-10"> <!-- Shifted Right via Padding -->
                 <h3 class="text-xl font-bold text-slate-900 font-serif mb-6 flex items-center gap-2">
                    <span [style.color]="store.adminSettings().themeColor">📰</span> Latest News & Updates
                 </h3>
                 <div class="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
                     @for(news of visibleBlogs(); track news.id) {
                         <div class="snap-center shrink-0 w-[280px] md:w-[320px] bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                             <div class="h-40 w-full overflow-hidden relative">
                                 <img [src]="news.image" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                                 <div class="absolute bottom-0 left-0 text-white text-[10px] px-3 py-1 rounded-tr-lg font-bold" [style.background-color]="store.adminSettings().themeColor">
                                     {{ news.date }}
                                 </div>
                             </div>
                             <div class="p-4">
                                 <h4 class="font-bold text-slate-900 text-sm mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">{{ news.title }}</h4>
                                 <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">{{ news.excerpt }}</p>
                                 <button class="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all" [style.color]="store.adminSettings().themeColor">
                                     Read More <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                 </button>
                             </div>
                         </div>
                     }
                 </div>
            </div>
        }

        <!-- 6. PARTNERSHIP PLATFORMS (Glass Box Design) -->
        @if(!store.searchQuery() && store.adminSettings().partnershipPlatforms.length > 0) {
            <div class="mb-12 px-1 animate-fadeIn">
                <h3 class="text-xl font-bold text-slate-900 font-serif mb-6 flex items-center gap-2 justify-center">
                    Trusted Partners & Platforms
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    @for(platform of store.adminSettings().partnershipPlatforms; track platform.id) {
                        <div class="glass-box p-4 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer group hover:scale-105 transition-transform h-32">
                            <img [src]="platform.image" class="h-10 w-full object-contain mb-3 mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity">
                            <h4 class="font-bold text-slate-800 text-xs">{{ platform.title }}</h4>
                            <a [href]="platform.url" target="_blank" class="text-[9px] text-slate-400 uppercase tracking-wider mt-1 hover:text-emerald-600">Open</a>
                        </div>
                    }
                </div>
            </div>
        }

      </div>
    </section>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
    .custom-scrollbar::-webkit-scrollbar {
        height: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    .glass-box {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.6);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  readonly store = inject(StoreService);
  
  selectedCategory = signal<string>('All');
  displayLimit = signal<number>(40); 
  isLoadingMore = signal<boolean>(false);
  
  // Review Rotating Logic
  reviewOffset = signal(0);
  reviewInterval: any;

  constructor() {}

  ngOnInit() {
      // Start auto-rotation for reviews every 2 seconds
      this.reviewInterval = setInterval(() => {
          this.reviewOffset.update(v => v + 1);
      }, 2000);
  }

  ngOnDestroy() {
      if (this.reviewInterval) clearInterval(this.reviewInterval);
  }

  rotatingReviews = computed<Review[]>(() => {
      const allReviews = this.store.customerReviews();
      if (allReviews.length === 0) return [];
      
      const count = 3;
      const offset = this.reviewOffset() % allReviews.length;
      
      // Create a rotated copy
      const rotated = [
          ...allReviews.slice(offset),
          ...allReviews.slice(0, offset)
      ];
      
      return rotated.slice(0, count);
  });

  visibleServices = computed(() => this.store.adminSettings().serviceStrips.filter(s => s.isVisible));

  // NEW: Filter for Visible Blogs to avoid Arrow Function in Template
  visibleBlogs = computed(() => this.store.blogs().filter(b => b.isVisible));

  visibleCategories = computed(() => {
      const hidden = this.store.adminSettings().hiddenCategories || [];
      const limit = this.store.adminSettings().categoryLimit || 10;
      const list = this.store.categories().filter(c => !hidden.includes(c));
      return list.slice(0, limit);
  });

  filteredProductsSource = computed(() => {
    const all = this.store.products();
    const query = this.store.searchQuery().toLowerCase();
    const cat = this.selectedCategory();
    let result = all;

    if (cat !== 'All') {
      result = result.filter(p => p.category === cat);
    }

    if (query) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
      );
    }
    
    return result;
  });

  visibleProducts = computed(() => {
    const adminLimit = this.store.adminSettings().homeProductLimit || 40; 
    const currentLimit = Math.max(this.displayLimit(), adminLimit);
    // Respect Admin Limit first for initial load
    return this.filteredProductsSource().slice(0, adminLimit);
  });

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.displayLimit.set(this.store.adminSettings().homeProductLimit || 40);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadMore() {
    this.isLoadingMore.set(true);
    setTimeout(() => {
        this.displayLimit.update(n => n + 20);
        this.isLoadingMore.set(false);
    }, 800);
  }

  toggleWishlist(event: Event, id: number) {
    event.stopPropagation();
    this.store.toggleWishlist(id);
  }

  addToCart(event: Event, product: Product) {
    event.stopPropagation();
    this.store.addToCart(product);
  }
}