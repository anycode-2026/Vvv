import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, Product } from '../services/store.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (store.activeProduct(); as product) {
        <section class="bg-emerald-50 min-h-screen pt-20 pb-4 relative overflow-x-hidden">
            
            <!-- Breadcrumb -->
            <div class="container mx-auto px-4 mb-4">
                <div class="text-xs text-emerald-700 flex items-center gap-2">
                    <button (click)="store.setView('HOME')" class="hover:text-emerald-900 font-bold bg-white px-2 py-1 rounded shadow-sm">Home</button> 
                    <span class="text-emerald-300">/</span>
                    <span class="text-emerald-900 font-medium truncate max-w-[200px]">{{ product.category }}</span>
                </div>
            </div>

            <div class="container mx-auto px-4 mb-4">
                <div class="bg-white rounded-3xl p-4 md:p-8 shadow-xl border border-emerald-100">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8">
                        
                        <!-- Left: Image/Video Gallery -->
                        <div class="space-y-4">
                            <!-- Main Image or Video -->
                            <div class="relative w-full aspect-square bg-emerald-50 rounded-2xl overflow-hidden border border-emerald-100 group">
                                @if (isMainMediaVideo()) {
                                    <video [src]="mainMedia()" controls autoplay muted loop class="w-full h-full object-cover"></video>
                                } @else {
                                    <img [src]="mainMedia()" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" [alt]="product.name">
                                }
                                
                                <!-- Wishlist -->
                                <button (click)="store.toggleWishlist(product.id)" class="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-emerald-50 transition-colors z-20">
                                    <svg class="w-6 h-6" [class.fill-emerald-600]="store.isInWishlist(product.id)" [class.text-emerald-600]="store.isInWishlist(product.id)" [class.text-emerald-300]="!store.isInWishlist(product.id)" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </button>
                                
                                <!-- Verified Badge Detail View -->
                                @if(product.isVerified) {
                                    <div class="absolute bottom-4 right-4 bg-blue-600/90 backdrop-blur text-white font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-10 animate-fadeIn">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                        <span class="text-xs uppercase tracking-wide">Verified Trust</span>
                                    </div>
                                }

                                @if(product.badge) {
                                    <div class="absolute top-4 left-4 text-white font-bold px-4 py-1.5 rounded-full shadow-lg uppercase text-xs z-10 tracking-wider" [ngClass]="product.badge.colorClass || 'bg-red-500'">
                                        {{ product.badge.text }}
                                    </div>
                                }
                            </div>
                            
                            <!-- Thumbnails (Images & Video) - Side/Bottom Accessible -->
                            <div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                <!-- Images -->
                                @for(img of galleryImages(); track img) {
                                    <div (click)="mainMedia.set(img)" 
                                         class="w-20 h-20 rounded-xl border-2 cursor-pointer overflow-hidden relative transition-all duration-300 flex-shrink-0"
                                         [class.border-emerald-600]="mainMedia() === img"
                                         [class.ring-2]="mainMedia() === img"
                                         [class.ring-emerald-100]="mainMedia() === img"
                                         [class.border-emerald-100]="mainMedia() !== img">
                                        <img [src]="img" class="w-full h-full object-cover">
                                    </div>
                                }
                                <!-- Video Thumbnail -->
                                @if(product.video) {
                                     <div (click)="mainMedia.set(product.video!)" 
                                         class="w-20 h-20 rounded-xl border-2 cursor-pointer overflow-hidden relative transition-all duration-300 flex-shrink-0 bg-black"
                                         [class.border-emerald-600]="mainMedia() === product.video"
                                         [class.ring-2]="mainMedia() === product.video"
                                         [class.ring-emerald-100]="mainMedia() === product.video"
                                         [class.border-emerald-100]="mainMedia() !== product.video">
                                         <!-- Play Icon Overlay -->
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center pl-1">
                                                <svg class="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                        <!-- Right: Info -->
                        <div class="flex flex-col min-w-0">
                            <!-- Title with wrapping fix -->
                            <h1 class="text-2xl md:text-3xl font-bold text-emerald-900 mb-2 leading-tight font-serif flex flex-wrap items-center gap-2 w-full break-words whitespace-normal">
                                {{ product.name }}
                                @if(product.isVerified) {
                                    <svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" title="Verified Product"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                }
                            </h1>
                            
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center text-yellow-500 text-sm">
                                    <span class="font-bold text-lg mr-1 text-emerald-900">{{ product.rating }}</span>
                                    <svg *ngFor="let s of [1,2,3,4,5]" class="w-4 h-4" [class.text-gray-300]="s > product.rating" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                    <span class="text-xs text-slate-400 ml-2">({{ product.reviews }} Reviews)</span>
                                </div>
                                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{{ product.sold }} Sold</span>
                            </div>

                            <div class="bg-gradient-to-r from-emerald-50 to-white p-4 rounded-2xl border border-emerald-100 mb-6 flex items-end justify-between">
                                <div>
                                    <p class="text-xs text-emerald-500 font-bold uppercase tracking-wider mb-1">Total Price</p>
                                    <div class="flex items-baseline gap-2">
                                        <span class="text-4xl font-bold text-emerald-600">৳{{ currentPrice() | number:'1.0-0' }}</span>
                                        @if(product.originalPrice && selectedBundle() === 'single') {
                                            <span class="text-lg text-slate-400 line-through font-bold">৳{{ product.originalPrice | number:'1.0-0' }}</span>
                                        }
                                    </div>
                                </div>
                            </div>

                            <!-- Size Selector -->
                            <div class="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100" *ngIf="product.sizes && product.sizes.length > 0">
                                <div class="flex justify-between items-center mb-3">
                                    <h3 class="text-sm font-black text-emerald-900 uppercase tracking-wide flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                                        Select Size
                                    </h3>
                                    <span class="text-[10px] text-red-500 font-bold animate-pulse" *ngIf="selectedSizes().length === 0">Required</span>
                                </div>
                                <div class="flex flex-wrap gap-3">
                                    @for(size of product.sizes; track size) {
                                        <button (click)="toggleSize(size)" 
                                                class="min-w-[50px] h-12 px-4 rounded-xl border-2 font-bold text-sm transition-all shadow-sm flex items-center justify-center relative overflow-hidden group"
                                                [class.border-emerald-600]="selectedSizes().includes(size)"
                                                [class.bg-emerald-600]="selectedSizes().includes(size)"
                                                [class.text-white]="selectedSizes().includes(size)"
                                                [class.shadow-emerald-200]="selectedSizes().includes(size)"
                                                [class.shadow-md]="selectedSizes().includes(size)"
                                                [class.scale-105]="selectedSizes().includes(size)"
                                                [class.border-slate-200]="!selectedSizes().includes(size)"
                                                [class.text-slate-600]="!selectedSizes().includes(size)"
                                                [class.bg-white]="!selectedSizes().includes(size)">
                                            {{ size }}
                                            @if(selectedSizes().includes(size)) {
                                                <div class="absolute inset-0 bg-white opacity-10"></div>
                                            }
                                        </button>
                                    }
                                </div>
                            </div>

                            <!-- VERTICAL BUNDLE SYSTEM -->
                            <div class="mb-6 space-y-3">
                                <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Select Package</h3>
                                
                                <!-- 1. Single (Top) -->
                                <div (click)="selectedBundle.set('single')" 
                                     class="w-full border-2 rounded-xl p-3 cursor-pointer transition-all relative overflow-hidden flex items-center justify-between group bg-white hover:bg-emerald-50"
                                     [class.border-emerald-600]="selectedBundle() === 'single'"
                                     [class.ring-1]="selectedBundle() === 'single'"
                                     [class.ring-emerald-600]="selectedBundle() === 'single'"
                                     [class.border-slate-100]="selectedBundle() !== 'single'">
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" [class.border-emerald-600]="selectedBundle() === 'single'" [class.border-slate-300]="selectedBundle() !== 'single'">
                                            <div *ngIf="selectedBundle() === 'single'" class="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-slate-800">1 Unit (Standard)</div>
                                            <div class="text-[10px] text-slate-500">Normal Price</div>
                                        </div>
                                    </div>
                                    <div class="font-bold text-slate-700">৳{{ product.price }}</div>
                                </div>

                                <!-- 2. Double (Middle) -->
                                @if(product.bundleConfig?.allowDouble) {
                                    <div (click)="selectedBundle.set('double')" 
                                         class="w-full border-2 rounded-xl p-3 cursor-pointer transition-all relative overflow-hidden flex items-center justify-between group bg-white hover:bg-blue-50"
                                         [class.border-blue-500]="selectedBundle() === 'double'"
                                         [class.ring-1]="selectedBundle() === 'double'"
                                         [class.ring-blue-500]="selectedBundle() === 'double'"
                                         [class.border-slate-100]="selectedBundle() !== 'double'">
                                        <div class="absolute top-0 right-0 bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                                            SAVE {{ product.bundleConfig?.doubleDiscount }}%
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" [class.border-blue-500]="selectedBundle() === 'double'" [class.border-slate-300]="selectedBundle() !== 'double'">
                                                <div *ngIf="selectedBundle() === 'double'" class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                            </div>
                                            <div>
                                                <div class="text-sm font-bold text-slate-800">2 Units (Double)</div>
                                                <div class="text-[10px] text-blue-500 font-bold">Popular Choice</div>
                                            </div>
                                        </div>
                                        <div class="font-bold text-blue-700">৳{{ calculatePrice('double') | number:'1.0-0' }}</div>
                                    </div>
                                }

                                <!-- 3. Family (Bottom) -->
                                @if(product.bundleConfig?.allowFamily) {
                                    <div (click)="selectedBundle.set('family')" 
                                         class="w-full border-2 rounded-xl p-3 cursor-pointer transition-all relative overflow-hidden flex items-center justify-between group bg-white hover:bg-purple-50"
                                         [class.border-purple-500]="selectedBundle() === 'family'"
                                         [class.ring-1]="selectedBundle() === 'family'"
                                         [class.ring-purple-500]="selectedBundle() === 'family'"
                                         [class.border-slate-100]="selectedBundle() !== 'family'">
                                        <div class="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                                            BEST VALUE -{{ product.bundleConfig?.familyDiscount }}%
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center" [class.border-purple-500]="selectedBundle() === 'family'" [class.border-slate-300]="selectedBundle() !== 'family'">
                                                <div *ngIf="selectedBundle() === 'family'" class="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                            </div>
                                            <div>
                                                <div class="text-sm font-bold text-slate-800">3 Units (Family)</div>
                                                <div class="text-[10px] text-purple-600 font-bold">Maximum Discount</div>
                                            </div>
                                        </div>
                                        <div class="font-bold text-purple-700">৳{{ calculatePrice('family') | number:'1.0-0' }}</div>
                                    </div>
                                }
                            </div>

                            <!-- ACTION BUTTONS (TOGGLEABLE) -->
                            <div class="flex gap-3 mb-4">
                                @if(store.adminSettings().showBuyButton) {
                                    <button (click)="buyNow(product)" class="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-1 transition-all uppercase tracking-wide">Buy Now</button>
                                }
                                @if(store.adminSettings().showAddToCartButton) {
                                    <button (click)="addToCart(product)" class="flex-1 bg-white border-2 border-emerald-600 text-emerald-700 py-3.5 rounded-xl font-bold text-base shadow-sm hover:bg-emerald-50 uppercase tracking-wide">Add to Cart</button>
                                }
                            </div>
                            
                            <!-- SERVICE HIGHLIGHT STRIP (RECOVERED) -->
                            <div class="grid grid-cols-4 gap-2 mb-6">
                                <div class="bg-white border border-slate-100 rounded-lg p-2 flex flex-col items-center text-center">
                                    <svg class="w-5 h-5 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span class="text-[8px] font-bold text-slate-600 uppercase">100% Original</span>
                                </div>
                                <div class="bg-white border border-slate-100 rounded-lg p-2 flex flex-col items-center text-center">
                                    <svg class="w-5 h-5 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    <span class="text-[8px] font-bold text-slate-600 uppercase">Fast Ship</span>
                                </div>
                                <div class="bg-white border border-slate-100 rounded-lg p-2 flex flex-col items-center text-center">
                                    <svg class="w-5 h-5 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                    <span class="text-[8px] font-bold text-slate-600 uppercase">Secure Pay</span>
                                </div>
                                <div class="bg-white border border-slate-100 rounded-lg p-2 flex flex-col items-center text-center">
                                    <svg class="w-5 h-5 text-emerald-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    <span class="text-[8px] font-bold text-slate-600 uppercase">Support</span>
                                </div>
                            </div>

                            <!-- DYNAMIC SOCIAL BUTTONS -->
                            <div class="grid grid-cols-2 gap-3 mb-6">
                                @if(store.adminSettings().productSocialLinks.whatsapp.isEnabled) {
                                    <a [href]="store.adminSettings().productSocialLinks.whatsapp.url" target="_blank" class="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-green-100 hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden">
                                        @if(store.adminSettings().productSocialLinks.whatsapp.icon) {
                                            <img [src]="store.adminSettings().productSocialLinks.whatsapp.icon" class="w-6 h-6 object-contain">
                                        } @else {
                                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                        }
                                        {{ store.adminSettings().productSocialLinks.whatsapp.platform }}
                                    </a>
                                }
                                @if(store.adminSettings().productSocialLinks.facebook.isEnabled) {
                                    <a [href]="store.adminSettings().productSocialLinks.facebook.url" target="_blank" class="flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-100 hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden">
                                        @if(store.adminSettings().productSocialLinks.facebook.icon) {
                                            <img [src]="store.adminSettings().productSocialLinks.facebook.icon" class="w-6 h-6 object-contain">
                                        } @else {
                                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        }
                                        {{ store.adminSettings().productSocialLinks.facebook.platform }}
                                    </a>
                                }
                            </div>

                        </div>
                    </div>

                    <!-- Description (Left) & Shipping Info (Right) -->
                    <div class="mt-8 border-t border-emerald-100 pt-8">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            <!-- LEFT: Description & Reviews & Extra Gallery -->
                            <div class="lg:col-span-2">
                                <h3 class="text-xl font-bold text-emerald-900 font-serif mb-6 flex items-center gap-2">
                                    <span class="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                    Product Description
                                </h3>
                                <div class="text-sm text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-line mb-8">
                                    {{ product.description }}
                                </div>
                                
                                <!-- Video Player Below Description -->
                                @if(product.video) {
                                    <div class="mb-8">
                                        <h3 class="text-sm font-bold text-emerald-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Product Video
                                        </h3>
                                        <div class="w-full rounded-2xl overflow-hidden shadow-sm border border-emerald-50 bg-black">
                                            <video [src]="product.video" controls class="w-full h-auto"></video>
                                        </div>
                                    </div>
                                }
                                
                                <!-- CUSTOMER REVIEWS (RECOVERED) -->
                                <div class="mb-8">
                                    <h3 class="text-xl font-bold text-emerald-900 font-serif mb-6 flex items-center gap-2">
                                        <span class="w-1 h-6 bg-yellow-400 rounded-full"></span>
                                        Customer Reviews ({{ product.reviews }})
                                    </h3>
                                    
                                    <div class="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
                                        <!-- Mock Reviews for Visual (In real app, filter store.customerReviews by product ID) -->
                                        <div class="flex gap-4 items-start border-b border-dashed border-slate-100 pb-4">
                                            <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">A</div>
                                            <div>
                                                <div class="flex items-center gap-2 mb-1">
                                                    <span class="font-bold text-sm text-slate-900">Anonymous User</span>
                                                    <span class="text-[10px] text-slate-400">Verified Purchase</span>
                                                </div>
                                                <div class="flex text-yellow-400 text-xs mb-2">★★★★★</div>
                                                <p class="text-sm text-slate-600">Great quality product! Very satisfied with the delivery time.</p>
                                            </div>
                                        </div>
                                        <div class="flex gap-4 items-start pb-2">
                                            <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">S</div>
                                            <div>
                                                <div class="flex items-center gap-2 mb-1">
                                                    <span class="font-bold text-sm text-slate-900">Satisfied Customer</span>
                                                    <span class="text-[10px] text-slate-400">Verified Purchase</span>
                                                </div>
                                                <div class="flex text-yellow-400 text-xs mb-2">★★★★☆</div>
                                                <p class="text-sm text-slate-600">Good value for money. Highly recommended.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Auto Sliding LARGE PRODUCTS LIST (Seamless Loop) -->
                                <div class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 overflow-hidden relative group">
                                    <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-4 text-center">You May Also Like</h4>
                                    <!-- Full width container, no margins -->
                                    <div class="flex gap-4 animate-scroll whitespace-nowrap hover:pause overflow-visible items-center w-full">
                                        @for(item of sliderProducts(); track $index) {
                                            <div class="inline-flex flex-col items-center w-24 cursor-pointer flex-shrink-0 bg-white p-2 rounded-xl shadow-sm border border-emerald-50 hover:border-emerald-200 hover:-translate-y-1 transition-all" (click)="store.viewProduct(item.id); window.scrollTo({top:0,behavior:'smooth'})">
                                                <div class="w-20 h-20 rounded-lg overflow-hidden mb-2">
                                                    <img [src]="item.image" class="w-full h-full object-cover">
                                                </div>
                                                <span class="text-[10px] font-bold text-slate-700 truncate w-full text-center">{{ item.name }}</span>
                                                <span class="text-[10px] text-emerald-600 font-bold">৳{{ item.price }}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            
                            <!-- RIGHT: Shipping Cost & Info Card -->
                            <div class="lg:col-span-1">
                                <div class="bg-gradient-to-br from-white to-emerald-50 rounded-3xl p-6 shadow-lg border border-emerald-100 relative overflow-hidden sticky top-24">
                                    <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -mr-10 -mt-10 opacity-50 blur-xl"></div>
                                    <div class="absolute bottom-0 left-0 w-20 h-20 bg-teal-100 rounded-full -ml-8 -mb-8 opacity-50 blur-xl"></div>
                                    
                                    <h3 class="text-lg font-bold text-emerald-900 font-serif mb-5 flex items-center gap-2 relative z-10">
                                        <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        Shipping & Costs
                                    </h3>

                                    <div class="space-y-4 relative z-10">
                                        <!-- Delivery Cost Table Look -->
                                        <div class="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-sm">
                                            <div class="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
                                                <span class="text-[10px] font-bold text-emerald-800 uppercase">Delivery Charge</span>
                                            </div>
                                            <div class="p-4 space-y-3">
                                                <div class="flex justify-between items-center text-sm border-b border-dashed border-slate-100 pb-2">
                                                    <div>
                                                        <span class="text-slate-600 font-bold block">Inside Dhaka</span>
                                                        <span class="text-[10px] text-emerald-500 font-bold">2-3 Days Delivery</span>
                                                    </div>
                                                    <span class="font-bold text-emerald-600">৳{{ product.shippingInsideDhaka || 60 }}</span>
                                                </div>
                                                <div class="flex justify-between items-center text-sm">
                                                    <div>
                                                        <span class="text-slate-600 font-bold block">Outside Dhaka</span>
                                                        <span class="text-[10px] text-emerald-500 font-bold">3-5 Days Delivery</span>
                                                    </div>
                                                    <span class="font-bold text-emerald-600">৳{{ product.shippingOutsideDhaka || 120 }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex gap-3 items-start">
                                            <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-1">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                            </div>
                                            <div>
                                                <h4 class="text-xs font-bold text-slate-800 uppercase">Estimated Time</h4>
                                                <div class="text-xs text-slate-600 whitespace-pre-wrap">{{ product.shippingInfo || 'Standard Delivery applicable for all regions.' }}</div>
                                            </div>
                                        </div>

                                        <!-- UPDATED COD SECTION WITH REAL IMAGE -->
                                        <div class="flex gap-3 items-center bg-white p-3 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                                            <div class="w-16 h-10 rounded-lg bg-emerald-50 border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                                                <!-- REPLACED SVG WITH IMAGE LOGO -->
                                                <img src="https://cdn-icons-png.flaticon.com/512/9198/9198191.png" class="w-full h-full object-contain" alt="COD">
                                            </div>
                                            <div>
                                                <div class="text-[10px] font-bold text-slate-800 uppercase">Cash On Delivery</div>
                                                <div class="text-[9px] text-slate-500">Available Nationwide</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> 
            </div>
            
        </section>
    }
  `,
  styles: [`
    @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); } /* Seamless loop by sliding exactly half (duplicated set) */
    }
    .animate-scroll {
        animation: scroll 30s linear infinite; /* Faster smooth scroll */
    }
    .hover\:pause:hover {
        animation-play-state: paused;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class ProductDetailComponent {
  store = inject(StoreService);
  selectedBundle = signal<'single' | 'double' | 'family'>('single');
  selectedSizes = signal<string[]>([]);
  activeTab = signal<'desc' | 'reviews' | 'shipping'>('desc');
  mainMedia = signal<string>(''); // Renamed from mainImage to support both
  
  // Expose window for template
  window = window;

  galleryImages = computed(() => {
      const p = this.store.activeProduct();
      if(!p) return [];
      if (p.gallery && p.gallery.length > 0) return [p.image, ...p.gallery];
      return [p.image];
  });

  isMainMediaVideo = computed(() => {
     const p = this.store.activeProduct();
     return p && p.video && this.mainMedia() === p.video;
  });

  // Updated Logic: Seamless Infinite Slider
  // We duplicate the list enough times to ensure it covers the screen width + extra for scrolling
  sliderProducts = computed(() => {
      const activeId = this.store.activeProduct()?.id;
      // Get products, exclude current
      const rawList = this.store.products().filter(p => p.id !== activeId).slice(0, 15);
      
      // Duplicate enough times. 
      // If we slide -50%, we need 2 full sets visible/buffered.
      // So 4 sets total is safe (Set 1 + Set 2 visible, slide to Set 3 + Set 4 which are identical copies)
      return [...rawList, ...rawList, ...rawList, ...rawList]; 
  });

  constructor() {
      effect(() => {
          const p = this.store.activeProduct();
          if(p) { this.mainMedia.set(p.image); }
      });
  }
  
  calculatePrice(type: 'single' | 'double' | 'family'): number {
      const p = this.store.activeProduct();
      if(!p) return 0;
      
      let price = p.price;
      if (type === 'double' && p.bundleConfig?.allowDouble) {
          // Double Price = (Price * 2) - Discount%
          const raw = price * 2;
          const discount = raw * (p.bundleConfig.doubleDiscount / 100);
          return raw - discount;
      }
      if (type === 'family' && p.bundleConfig?.allowFamily) {
          // Family Price = (Price * 3) - Discount%
          const raw = price * 3;
          const discount = raw * (p.bundleConfig.familyDiscount / 100);
          return raw - discount;
      }
      return price;
  }

  toggleSize(size: string) {
      this.selectedSizes.update(sizes => {
          if (sizes.includes(size)) return sizes.filter(s => s !== size);
          // Single select or multi select logic. Assuming single select for clothes usually, but cart supports array.
          // Let's make it single select for simplicity in UI, but keep array structure for future
          return [size]; 
      });
  }

  addToCart(product: Product) {
      if (product.sizes && product.sizes.length > 0 && this.selectedSizes().length === 0) {
          alert('Please select a size');
          return;
      }
      
      // Calculate specific price based on bundle
      const bundleType = this.selectedBundle();
      const finalPricePerUnit = this.calculatePrice(bundleType) / (bundleType === 'single' ? 1 : (bundleType === 'double' ? 2 : 3));
      const qty = bundleType === 'single' ? 1 : (bundleType === 'double' ? 2 : 3);

      this.store.addToCart(product, qty, bundleType, finalPricePerUnit, this.selectedSizes());
      
      // Visual feedback
      alert('Added to Cart!');
  }

  buyNow(product: Product) {
      if (product.sizes && product.sizes.length > 0 && this.selectedSizes().length === 0) {
          alert('Please select a size');
          return;
      }
      this.addToCart(product);
      this.store.setView('CHECKOUT');
  }
  
  currentPrice() {
      return this.calculatePrice(this.selectedBundle());
  }
}