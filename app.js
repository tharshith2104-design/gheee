// Vijayawada Pure Ghee Store - Core JavaScript Logic

// Configuration - USER CAN UPDATE THESE DETAILS
const STORE_CONFIG = {
    whatsappNumber: "9849998509", // Store WhatsApp number (with country code 91, no +, spaces, or dashes)
    storeName: "AMRUTHA PURE GHEE",
    storeAddress: "20-4-182, Ayodhya Nagar, Donka Road, Vijayawada, Andhra Pradesh"
};

// State Management
let cart = [];
let storeProducts = [];

// Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    setupCartDrawerEventListeners();
    setupCheckoutForm();
    setupAccordion();
    setupTrackOrder();
    updateCartUI();
    initializeAppDatabase();
});

// Load products onto UI
function renderProducts() {
    const productGrid = document.getElementById("product-grid");
    if (!productGrid) return;

    productGrid.innerHTML = "";

    storeProducts.forEach((product, productIndex) => {
        // Create product card element
        const productCard = document.createElement("div");
        productCard.className = "bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col glass-card group";
        
        // Active selected size index (fallback to 0 if defaultSizeIndex is missing or invalid)
        let activeSizeIndex = (typeof product.defaultSizeIndex === 'number' && product.defaultSizeIndex < product.sizes.length) ? product.defaultSizeIndex : 0;
        productCard.setAttribute('data-selected-size-idx', activeSizeIndex);

        // Build HTML for sizes selector
        let sizesHTML = "";
        product.sizes.forEach((sz, idx) => {
            const isSelected = idx === activeSizeIndex;
            sizesHTML += `
                <button 
                    type="button"
                    onclick="selectProductSize(${productIndex}, ${idx}, this)" 
                    class="px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
                        isSelected 
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                        : 'border-gray-200 hover:border-amber-500 text-gray-700 bg-white'
                    }"
                    data-price="${sz.price}"
                    data-size="${sz.size}"
                    data-idx="${idx}"
                >
                    ${sz.size}
                </button>
            `;
        });

        // Features list
        let featuresHTML = "";
        if (product.features && product.features.length) {
            product.features.forEach(feat => {
                featuresHTML += `
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100">
                        ${feat}
                    </span>
                `;
            });
        }

        // Default price
        const initialPrice = product.sizes[activeSizeIndex] ? product.sizes[activeSizeIndex].price : 0;
        const initialSizeName = product.sizes[activeSizeIndex] ? product.sizes[activeSizeIndex].size : '';

        productCard.innerHTML = `
            <div class="relative overflow-hidden cursor-pointer" onclick="openProductModal(${productIndex})">
                <img 
                    src="${product.image}" 
                    alt="${product.name}" 
                    class="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div class="absolute top-3 left-3 bg-amber-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded shadow-sm">
                    Pure & Natural
                </div>
            </div>
            
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex flex-wrap gap-1 mb-3">
                    ${featuresHTML}
                </div>
                
                <h3 class="text-xl font-bold text-gray-800 mb-1 group-hover:text-amber-700 transition-colors cursor-pointer" onclick="openProductModal(${productIndex})">
                    ${product.name}
                </h3>
                <p class="text-xs text-amber-600 font-semibold mb-3 tracking-wide uppercase">${product.subtitle}</p>
                <p class="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                    ${product.description}
                </p>

                <!-- Sizes Selector -->
                <div class="mb-5">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Size:</span>
                        <span class="text-xs font-extrabold text-amber-700 selected-size-label">${initialSizeName}</span>
                    </div>
                    <div class="flex flex-wrap gap-2 size-selector-container">
                        ${sizesHTML}
                    </div>
                </div>

                <!-- Price and Action Buttons (Mobile-first) -->
                <div class="pt-4 border-t border-amber-100 mt-auto space-y-3">
                    <div class="flex items-baseline justify-between">
                        <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Price:</span>
                        <div class="text-2xl sm:text-3xl font-black text-amber-950">
                            ₹<span class="price-display">${initialPrice}</span>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2">
                        <button 
                            type="button"
                            onclick="addProductToCart(${productIndex})" 
                            class="py-3 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-amber-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <i class="fa-solid fa-cart-plus"></i>
                            <span>Add to Cart</span>
                        </button>
                        <button 
                            type="button"
                            onclick="buyNowWhatsApp(${productIndex})" 
                            class="py-3 px-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
                            title="Direct Order on WhatsApp"
                        >
                            <i class="fa-brands fa-whatsapp text-base"></i>
                            <span>WhatsApp</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        productGrid.appendChild(productCard);
    });
}

// Direct 1-Click WhatsApp Quick Order for Mobile Users
window.buyNowWhatsApp = function(productIndex) {
    const product = storeProducts[productIndex];
    if (!product) return;

    const productGrid = document.getElementById("product-grid");
    const card = productGrid ? productGrid.children[productIndex] : null;
    let sizeIndex = 0;
    if (card) {
        const attr = card.getAttribute('data-selected-size-idx');
        if (attr !== null && !isNaN(parseInt(attr))) {
            sizeIndex = parseInt(attr);
        }
    }
    const chosenSize = product.sizes[sizeIndex] || product.sizes[0];

    const waText = 
`🧈 *AMRUTHA PURE GHEE - DIRECT ORDER* 🧈
--------------------------------
*Product:* ${product.name}
*Size:* ${chosenSize.size}
*Price:* ₹${chosenSize.price}
*Quantity:* 1
--------------------------------
Please confirm availability and delivery to my address in Vijayawada. Thank you!`;

    const encodedMsg = encodeURIComponent(waText);
    const waURL = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMsg}`;
    window.open(waURL, "_blank");
};

// Handle Size Selection Change on Product Card
window.selectProductSize = function(productIndex, sizeIndex, buttonElement) {
    const parentCard = buttonElement.closest('.glass-card') || buttonElement.closest('.group');
    if (!parentCard) return;
    
    const product = storeProducts[productIndex];
    if (!product || !product.sizes || !product.sizes[sizeIndex]) return;
    const chosen = product.sizes[sizeIndex];

    // Update button visual states inside this card
    const allButtons = parentCard.querySelectorAll('.size-selector-container button');
    allButtons.forEach(btn => {
        btn.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer border-gray-200 hover:border-amber-500 text-gray-700 bg-white";
    });
    
    buttonElement.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer bg-amber-500 border-amber-500 text-white shadow-sm";

    // Update Price display
    const priceDisplay = parentCard.querySelector('.price-display');
    if (priceDisplay) {
        priceDisplay.textContent = chosen.price;
    }

    // Update Selected Size Label
    const sizeLabel = parentCard.querySelector('.selected-size-label');
    if (sizeLabel) {
        sizeLabel.textContent = chosen.size;
    }

    // Track chosen size directly on the HTML card
    parentCard.setAttribute('data-selected-size-idx', sizeIndex);
};

// Add product to Cart
window.addProductToCart = function(productIndex, explicitSizeIndex) {
    const product = storeProducts[productIndex];
    if (!product) return;

    let selectedSizeIndex;
    if (typeof explicitSizeIndex === 'number') {
        selectedSizeIndex = explicitSizeIndex;
    } else {
        const productGrid = document.getElementById("product-grid");
        const card = productGrid ? productGrid.children[productIndex] : null;
        const attr = card ? card.getAttribute('data-selected-size-idx') : null;
        if (attr !== null && attr !== undefined && !isNaN(parseInt(attr))) {
            selectedSizeIndex = parseInt(attr);
        } else {
            selectedSizeIndex = (typeof product.defaultSizeIndex === 'number') ? product.defaultSizeIndex : 0;
        }
    }

    if (!product.sizes[selectedSizeIndex]) {
        selectedSizeIndex = 0;
    }
    const chosenSize = product.sizes[selectedSizeIndex];
    const cartItemId = `${product.id}-${chosenSize.size.replace(/\s+/g, '-').toLowerCase()}`;

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === cartItemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: cartItemId,
            productId: product.id,
            name: product.name,
            size: chosenSize.size,
            price: chosenSize.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCartToLocalStorage();
    updateCartUI();
    openCartDrawer();

    // Trigger minor bounce effect on cart header icon
    const cartBtn = document.getElementById("cart-header-btn");
    if (cartBtn) {
        cartBtn.classList.add("scale-110");
        setTimeout(() => cartBtn.classList.remove("scale-110"), 200);
    }
};

// Cart drawer functions
function setupCartDrawerEventListeners() {
    const openCartBtn = document.getElementById("cart-header-btn");
    const openCartHeroBtn = document.getElementById("cart-hero-btn");
    const closeCartBtn = document.getElementById("cart-close-btn");
    const cartOverlay = document.getElementById("cart-overlay");
    const continueShoppingBtn = document.getElementById("continue-shopping-btn");

    if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
    if (openCartHeroBtn) openCartHeroBtn.addEventListener("click", openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartDrawer);
    if (continueShoppingBtn) continueShoppingBtn.addEventListener("click", closeCartDrawer);
}

function openCartDrawer() {
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");

    cartSidebar.classList.remove("translate-x-full");
    cartOverlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

function closeCartDrawer() {
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");

    cartSidebar.classList.add("translate-x-full");
    cartOverlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}

// Update Cart View and Counts
function updateCartUI() {
    const cartItemsList = document.getElementById("cart-items-list");
    const cartCountBadges = document.querySelectorAll(".cart-count-badge");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartEmptyState = document.getElementById("cart-empty-state");
    const cartFilledState = document.getElementById("cart-filled-state");

    let totalItems = 0;
    let subtotalAmount = 0;

    cart.forEach(item => {
        totalItems += item.quantity;
        subtotalAmount += (item.price * item.quantity);
    });

    // Update cart item count badges in Header
    cartCountBadges.forEach(badge => {
        badge.textContent = totalItems;
        if (totalItems > 0) {
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    });

    if (cart.length === 0) {
        cartEmptyState.classList.remove("hidden");
        cartFilledState.classList.add("hidden");
    } else {
        cartEmptyState.classList.add("hidden");
        cartFilledState.classList.remove("hidden");

        cartItemsList.innerHTML = "";
        cart.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.className = "flex gap-4 items-center border-b border-gray-100 py-4";
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-gray-800 text-sm truncate">${item.name}</h4>
                    <span class="inline-block bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100 mt-1">${item.size}</span>
                    <div class="text-sm font-extrabold text-gray-900 mt-1">₹${item.price}</div>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <button onclick="removeCartItem(${index})" class="text-gray-400 hover:text-red-500 text-xs transition-colors">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <div class="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button onclick="updateQuantity(${index}, -1)" class="px-2 py-1 text-gray-500 hover:text-amber-600 transition-colors font-bold text-xs">-</button>
                        <span class="px-2 text-xs font-bold text-gray-700">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" class="px-2 py-1 text-gray-500 hover:text-amber-600 transition-colors font-bold text-xs">+</button>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(itemElement);
        });

        cartSubtotal.textContent = `₹${subtotalAmount}`;
    }
}

// Modify Quantities
window.updateQuantity = function(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCartToLocalStorage();
    updateCartUI();
};

// Delete Cart Item Completely
window.removeCartItem = function(index) {
    cart.splice(index, 1);
    saveCartToLocalStorage();
    updateCartUI();
};

// Save Cart
function saveCartToLocalStorage() {
    localStorage.setItem("vijayawada_ghee_cart", JSON.stringify(cart));
}

// Load Cart
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem("vijayawada_ghee_cart");
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
}

// Checkout Modal management
window.openCheckoutModal = function() {
    const checkoutModal = document.getElementById("checkout-modal");
    checkoutModal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
};

window.closeCheckoutModal = function() {
    const checkoutModal = document.getElementById("checkout-modal");
    checkoutModal.classList.add("hidden");
    if (!document.getElementById("product-modal").classList.contains("hidden")) {
        // Keep overflow hidden if product detail modal is open
    } else {
        document.body.classList.remove("overflow-hidden");
    }
};

// Setup checkout form submit action
function setupCheckoutForm() {
    const checkoutForm = document.getElementById("checkout-form");
    if (!checkoutForm) return;

    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Collect form data
        const customerName = document.getElementById("cust-name").value.trim();
        const customerPhone = document.getElementById("cust-phone").value.trim();
        const customerAddress = document.getElementById("cust-address").value.trim();
        const customerLandmark = document.getElementById("cust-landmark").value.trim();
        
        // Determine action based on button clicked
        const submitAction = document.activeElement.getAttribute("data-action");

        if (submitAction === "whatsapp") {
            triggerWhatsAppCheckout(customerName, customerPhone, customerAddress, customerLandmark);
        } else {
            triggerCODCheckout(customerName, customerPhone, customerAddress, customerLandmark);
        }
    });
}

// WhatsApp ordering API trigger
function triggerWhatsAppCheckout(name, phone, address, landmark) {
    let subtotalAmount = 0;
    let itemsText = "";
    const itemsArray = [];

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotalAmount += itemTotal;
        itemsText += `${index + 1}. *${item.name}* (${item.size}) - Qty: ${item.quantity} [₹${item.price} each] \n`;
        itemsArray.push({
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity
        });
    });

    const landmarkText = landmark ? `\n*Landmark*: ${landmark}` : "";

    const orderId = "AMR-" + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
        id: orderId,
        timestamp: Date.now(),
        customer: {
            name: name,
            phone: phone,
            address: address,
            landmark: landmark
        },
        items: itemsArray,
        subtotal: subtotalAmount,
        status: "Pending",
        checkoutMethod: "WhatsApp"
    };

    // Formatted WhatsApp Message
    const textMsg = 
`*NEW ORDER RECEIVED - ${STORE_CONFIG.storeName}*
---------------------------------------
*Order ID*: ${orderId}
*Order Details:*
${itemsText}
*Total Bill Amount:* ₹${subtotalAmount}
---------------------------------------
*Delivery Details:*
*Name*: ${name}
*Phone Number*: ${phone}
*Address*: ${address}${landmarkText}
*Location*: Vijayawada Area
---------------------------------------
Please confirm the order & approximate delivery time. Thank you!`;

    // Encode message for URL
    const encodedMsg = encodeURIComponent(textMsg);
    
    // Redirect URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${STORE_CONFIG.whatsappNumber}&text=${encodedMsg}`;
    
    localStorage.setItem("amrutha_last_order_id", orderId);

    saveOrderToDatabase(orderData, () => {
        // Clear cart and redirect
        cart = [];
        saveCartToLocalStorage();
        updateCartUI();
        closeCheckoutModal();
        closeCartDrawer();
        
        // Open in new tab
        window.open(whatsappUrl, "_blank");
    });
}

// Mock Cash on Delivery placement
function triggerCODCheckout(name, phone, address, landmark) {
    // Show success state
    const checkoutModalContent = document.querySelector("#checkout-modal .modal-container");
    const originalContent = checkoutModalContent.innerHTML;

    let subtotalAmount = 0;
    const itemsArray = [];
    cart.forEach(item => {
        subtotalAmount += (item.price * item.quantity);
        itemsArray.push({
            name: item.name,
            size: item.size,
            price: item.price,
            quantity: item.quantity
        });
    });

    const orderId = "AMR-" + Math.floor(100000 + Math.random() * 900000);
    const orderData = {
        id: orderId,
        timestamp: Date.now(),
        customer: {
            name: name,
            phone: phone,
            address: address,
            landmark: landmark
        },
        items: itemsArray,
        subtotal: subtotalAmount,
        status: "Pending",
        checkoutMethod: "COD"
    };

    localStorage.setItem("amrutha_last_order_id", orderId);

    saveOrderToDatabase(orderData, () => {
        checkoutModalContent.innerHTML = `
            <div class="p-6 sm:p-8 text-center">
                <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
                    <i class="fa-solid fa-circle-check"></i>
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-1 serif-font">Order Placed Successfully!</h3>
                <p class="text-xs sm:text-sm text-gray-500 mb-5">Thank you, <strong class="text-gray-700">${name}</strong>! Your Cash on Delivery order is registered.</p>
                
                <div class="bg-amber-50/70 rounded-2xl p-4 text-left border border-amber-200/70 mb-5 text-xs sm:text-sm space-y-2">
                    <div class="flex justify-between items-center py-0.5">
                        <span class="text-gray-500 font-semibold">Order ID:</span>
                        <div class="flex items-center gap-1.5">
                            <span class="font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">${orderId}</span>
                            <button onclick="copyOrderId('${orderId}')" class="text-gray-400 hover:text-amber-700 text-xs p-1" title="Copy Order ID">
                                <i class="fa-regular fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex justify-between py-0.5"><span class="text-gray-500 font-semibold">Amount to Pay:</span> <span class="font-extrabold text-gray-900">₹${subtotalAmount}</span></div>
                    <div class="flex justify-between py-0.5"><span class="text-gray-500 font-semibold">Delivery Location:</span> <span class="font-medium text-gray-700 text-right truncate max-w-[190px]">${address}</span></div>
                </div>

                <p class="text-xs text-amber-700 font-semibold mb-5 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60 flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-truck-fast text-amber-600"></i> Fast Delivery across Vijayawada within 4-12 hours.
                </p>
                
                <button onclick="closeCheckoutModal(); openTrackOrderModal('${orderId}');" class="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-black py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer mb-2.5">
                    <i class="fa-solid fa-truck-fast"></i>
                    <span>Track This Order Now</span>
                </button>

                <button onclick="restoreCheckoutModal('${encodeURIComponent(originalContent)}')" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer">
                    Continue Shopping
                </button>
            </div>
        `;

        // Clear cart
        cart = [];
        saveCartToLocalStorage();
        updateCartUI();
        closeCartDrawer();
    });
}

// Restore checkout modal design after cod completes
window.restoreCheckoutModal = function(escapedOriginalContent) {
    const checkoutModalContent = document.querySelector("#checkout-modal .modal-container");
    checkoutModalContent.innerHTML = decodeURIComponent(escapedOriginalContent);
    closeCheckoutModal();
    setupCheckoutForm(); // Rebind event listeners
};

// Product detail modal loading
let modalActiveSizeIndex = 0;

window.openProductModal = function(productIndex) {
    const product = storeProducts[productIndex];
    if (!product) return;
    const productModal = document.getElementById("product-modal");
    
    // Read currently selected size from card, fallback to default
    const productGrid = document.getElementById("product-grid");
    const card = productGrid ? productGrid.children[productIndex] : null;
    const attr = card ? card.getAttribute('data-selected-size-idx') : null;
    if (attr !== null && attr !== undefined && !isNaN(parseInt(attr))) {
        modalActiveSizeIndex = parseInt(attr);
    } else {
        modalActiveSizeIndex = (typeof product.defaultSizeIndex === 'number') ? product.defaultSizeIndex : 0;
    }

    if (!product.sizes[modalActiveSizeIndex]) {
        modalActiveSizeIndex = 0;
    }
    
    // Generate benefits list
    let benefitsHTML = "";
    if (product.benefits) {
        product.benefits.forEach(benefit => {
            benefitsHTML += `
                <li class="flex items-start gap-2 text-sm text-gray-600">
                    <span class="text-amber-500 mt-1"><i class="fa-solid fa-circle-check"></i></span>
                    <span>${benefit}</span>
                </li>
            `;
        });
    }

    // Populate modal contents
    document.getElementById("modal-prod-img").src = product.image;
    document.getElementById("modal-prod-img").alt = product.name;
    document.getElementById("modal-prod-name").textContent = product.name;
    document.getElementById("modal-prod-subtitle").textContent = product.subtitle;
    document.getElementById("modal-prod-desc").textContent = product.description;
    document.getElementById("modal-prod-benefits").innerHTML = benefitsHTML;
    
    // Render dynamic modal size buttons and update price
    renderModalSizes(productIndex);

    // Quick Add button
    const addBtn = document.getElementById("modal-add-to-cart-btn");
    if (addBtn) {
        addBtn.onclick = function() {
            window.addProductToCart(productIndex, modalActiveSizeIndex);
            closeProductModal();
        };
    }

    // Show modal
    productModal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
};

function renderModalSizes(productIndex) {
    const product = storeProducts[productIndex];
    if (!product) return;
    const container = document.getElementById("modal-sizes-container");
    const priceDisplay = document.getElementById("modal-price-display");
    if (!container) return;

    container.innerHTML = "";
    product.sizes.forEach((sz, idx) => {
        const isSelected = idx === modalActiveSizeIndex;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 cursor-pointer ${
            isSelected 
            ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
            : 'border-gray-200 hover:border-amber-500 text-gray-700 bg-white'
        }`;
        btn.textContent = sz.size;
        btn.onclick = function() {
            modalActiveSizeIndex = idx;
            renderModalSizes(productIndex);
            // Also sync selection back to the storefront card
            const productGrid = document.getElementById("product-grid");
            const card = productGrid ? productGrid.children[productIndex] : null;
            if (card) {
                const btnInCard = card.querySelectorAll('.size-selector-container button')[idx];
                if (btnInCard) {
                    window.selectProductSize(productIndex, idx, btnInCard);
                }
            }
        };
        container.appendChild(btn);
    });

    if (priceDisplay && product.sizes[modalActiveSizeIndex]) {
        priceDisplay.textContent = product.sizes[modalActiveSizeIndex].price;
    }
}

window.closeProductModal = function() {
    const productModal = document.getElementById("product-modal");
    productModal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
};

// Add to cart directly from within detail modal
window.addProductFromModal = function(productIndex) {
    window.addProductToCart(productIndex, modalActiveSizeIndex);
    closeProductModal();
};

// Interactive FAQs Accordion
function setupAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const header = item.querySelector(".faq-header");
        header.addEventListener("click", () => {
            // Check if active
            const isActive = item.classList.contains("accordion-active");
            
            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove("accordion-active");
            });

            // Toggle selected item
            if (!isActive) {
                item.classList.add("accordion-active");
            }
        });
    });
}

// Handle Send an Enquiry Form Submission
window.handleEnquirySubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById("enquiry-name").value.trim();
    const phone = document.getElementById("enquiry-phone").value.trim();
    const message = document.getElementById("enquiry-message").value.trim();

    if (!name || !phone || !message) {
        alert("Please fill in all details before sending.");
        return;
    }

    // Auto-formatted WhatsApp enquiry message
    const waText = 
`🧈 *AMRUTHA PURE GHEE - CUSTOMER ENQUIRY* 🧈
--------------------------------
*From:* ${name}
*Phone / WhatsApp:* ${phone}
--------------------------------
*Question / Enquiry:*
${message}
--------------------------------
_Sent from AMRUTHA PURE GHEE Website_`;

    const encodedMsg = encodeURIComponent(waText);
    const waURL = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodedMsg}`;

    // Open WhatsApp directly
    window.open(waURL, "_blank");

    // Reset form
    const form = document.getElementById("enquiry-form");
    if (form) form.reset();
};

// Database Integration for Order & Product Logging
let appDbRef = null;
let appDbRefProducts = null;
let isAppDemoMode = true;

function initializeAppDatabase() {
    if (typeof firebase !== 'undefined' && window.firebaseConfig) {
        const config = window.firebaseConfig;
        const isPlaceholder = config.apiKey === "PLACEHOLDER_API_KEY" || config.projectId === "PLACEHOLDER_PROJECT_ID";
        if (!isPlaceholder) {
            isAppDemoMode = false;
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(config);
                }
                appDbRef = firebase.database().ref("orders");
                appDbRefProducts = firebase.database().ref("products");
                console.log("Storefront: Connected to Cloud Firebase.");
                
                // Read & listen to products from Firebase Realtime Database
                appDbRefProducts.on("value", (snapshot) => {
                    const data = snapshot.val();
                    if (!data || Object.keys(data).length === 0) {
                        storeProducts = [];
                        renderProducts();
                    } else {
                        const deletedIds = JSON.parse(localStorage.getItem("amrutha_deleted_products") || "[]");
                        storeProducts = Object.keys(data)
                            .filter(key => !deletedIds.includes(key))
                            .map(key => data[key]);
                        renderProducts();
                    }
                });
            } catch (e) {
                console.error("Storefront: Cloud DB initialization failed:", e);
                isAppDemoMode = true;
                loadDemoProducts();
            }
        } else {
            isAppDemoMode = true;
            console.log("Storefront: Database running in Demo offline mode.");
            loadDemoProducts();
        }
    } else {
        isAppDemoMode = true;
        console.log("Storefront: Firebase SDK not loaded, running in offline mode.");
        loadDemoProducts();
    }
}

function loadDemoProducts() {
    syncDemoProductsInStore();
    // Listen to local storage updates (e.g. from admin tab)
    window.addEventListener("storage", syncDemoProductsInStore);
}

function syncDemoProductsInStore() {
    const rawProducts = localStorage.getItem("amrutha_ghee_cloud_products");
    const stored = rawProducts ? JSON.parse(rawProducts) : {};
    const deletedIds = JSON.parse(localStorage.getItem("amrutha_deleted_products") || "[]");
    
    // Purge old deleted placeholders and permanently deleted products
    deletedIds.push("a2-cow-ghee", "premium-buffalo-ghee", "golden-cow-ghee");
    deletedIds.forEach(id => {
        delete stored[id];
    });
    
    // Seed default products only if not initialized before
    const isInitialized = localStorage.getItem("amrutha_ghee_products_initialized_v2");
    if (!isInitialized && window.gheeProducts) {
        window.gheeProducts.forEach(p => {
            if (!deletedIds.includes(p.id)) {
                stored[p.id] = p;
            }
        });
        localStorage.setItem("amrutha_ghee_products_initialized_v2", "true");
    }
    
    localStorage.setItem("amrutha_ghee_cloud_products", JSON.stringify(stored));
    storeProducts = Object.keys(stored).map(key => stored[key]);
    renderProducts();
}

function seedInitialProductsInCloud() {
    const initialProducts = {};
    window.gheeProducts.forEach(p => {
        initialProducts[p.id] = p;
    });
    appDbRefProducts.set(initialProducts)
        .then(() => {
            console.log("Storefront: Seeding products in cloud completed.");
        })
        .catch(err => console.error("Storefront: Failed to seed products:", err));
}

function saveOrderToDatabase(orderData, callback) {
    if (isAppDemoMode) {
        // Sync to localStorage as simulated cloud db
        const rawOrders = localStorage.getItem("amrutha_ghee_cloud_orders");
        const orders = rawOrders ? JSON.parse(rawOrders) : {};
        orders[orderData.id] = orderData;
        localStorage.setItem("amrutha_ghee_cloud_orders", JSON.stringify(orders));
        
        // Trigger storage event so admin dashboard can sync immediately if open in another tab
        window.dispatchEvent(new Event('storage'));
        console.log("Storefront: Order saved locally in demo mode.", orderData);
        callback();
    } else {
        // Push to Firebase Realtime Database
        appDbRef.child(orderData.id).set(orderData)
            .then(() => {
                console.log("Storefront: Order synced to Firebase database successfully.", orderData.id);
                callback();
            })
            .catch(err => {
                console.error("Failed to sync order to Firebase:", err);
                // Fallback to local storage
                const rawOrders = localStorage.getItem("amrutha_ghee_cloud_orders") || "{}";
                const orders = JSON.parse(rawOrders);
                orders[orderData.id] = orderData;
                localStorage.setItem("amrutha_ghee_cloud_orders", JSON.stringify(orders));
                callback();
            });
    }
}

// ----------------------------------------------------
// CUSTOMER ORDER TRACKING MODULE
// ----------------------------------------------------

let currentTrackedOrderId = null;
let firebaseTrackListener = null;

function setupTrackOrder() {
    // Listen for localStorage changes from admin dashboard (cross-tab reactive sync)
    window.addEventListener("storage", (e) => {
        if (!e.key || e.key === "amrutha_ghee_cloud_orders") {
            const modal = document.getElementById("track-order-modal");
            if (modal && !modal.classList.contains("hidden") && currentTrackedOrderId) {
                console.log("Storefront: Syncing order update from storage event...");
                fetchAndDisplayOrder(currentTrackedOrderId, true);
            }
        }
    });

    // Close on escape key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            const modal = document.getElementById("track-order-modal");
            if (modal && !modal.classList.contains("hidden")) {
                closeTrackOrderModal();
            }
        }
    });
}

// Open Order Tracking Modal
window.openTrackOrderModal = function(orderIdOpt) {
    const modal = document.getElementById("track-order-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    // Check for recent order in local storage
    const recentId = localStorage.getItem("amrutha_last_order_id");
    const recentPillContainer = document.getElementById("track-recent-pill-container");
    const recentPillId = document.getElementById("track-recent-pill-id");

    if (recentId && recentPillContainer && recentPillId) {
        recentPillId.textContent = recentId;
        recentPillContainer.classList.remove("hidden");
    }

    const input = document.getElementById("track-order-input");

    if (orderIdOpt) {
        if (input) input.value = orderIdOpt;
        fetchAndDisplayOrder(orderIdOpt);
    } else if (recentId && (!input.value || !currentTrackedOrderId)) {
        // Prefill input with recent order ID for 1-click convenience
        if (input) input.value = recentId;
        fetchAndDisplayOrder(recentId);
    }
};

// Close Order Tracking Modal
window.closeTrackOrderModal = function() {
    const modal = document.getElementById("track-order-modal");
    if (modal) modal.classList.add("hidden");

    // Clean up Firebase active listener if any
    if (firebaseTrackListener && appDbRef && currentTrackedOrderId) {
        appDbRef.child(currentTrackedOrderId).off("value", firebaseTrackListener);
        firebaseTrackListener = null;
    }

    // Only restore body overflow if no other modals are open
    const prodModal = document.getElementById("product-modal");
    const checkoutModal = document.getElementById("checkout-modal");
    const isOtherModalOpen = (prodModal && !prodModal.classList.contains("hidden")) || 
                             (checkoutModal && !checkoutModal.classList.contains("hidden"));
    
    if (!isOtherModalOpen) {
        document.body.classList.remove("overflow-hidden");
    }
};

// Quick Track Recent Order
window.quickTrackRecentOrder = function() {
    const recentId = localStorage.getItem("amrutha_last_order_id");
    if (recentId) {
        const input = document.getElementById("track-order-input");
        if (input) input.value = recentId;
        fetchAndDisplayOrder(recentId);
    }
};

// Form search submit handler
window.handleTrackOrderSearch = function(event) {
    if (event) event.preventDefault();
    const input = document.getElementById("track-order-input");
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    fetchAndDisplayOrder(query);
};

// Fetch order by ID or Phone and display
function fetchAndDisplayOrder(rawQuery, isBackgroundRefresh = false) {
    if (!rawQuery) return;
    const query = rawQuery.trim();
    const notFoundEl = document.getElementById("track-not-found");
    const initialEl = document.getElementById("track-initial-state");
    const resultContainer = document.getElementById("track-result-container");

    if (!isBackgroundRefresh) {
        if (notFoundEl) notFoundEl.classList.add("hidden");
        if (initialEl) initialEl.classList.add("hidden");
    }

    // Clean search token
    const queryClean = query.toUpperCase();
    const queryDigits = query.replace(/\D/g, '');

    function findInOrdersObject(orders) {
        if (!orders) return null;

        // 1. Direct ID match
        if (orders[queryClean]) return orders[queryClean];
        if (orders[query]) return orders[query];

        // 2. Search all orders
        const ordersArray = Object.values(orders);
        
        // Exact ID match or suffix match (e.g. searching '123456' matches 'AMR-123456')
        const idMatch = ordersArray.find(o => {
            if (!o || !o.id) return false;
            const oId = String(o.id).toUpperCase();
            if (oId === queryClean) return true;
            if (queryDigits.length >= 4 && String(o.id).replace(/\D/g, '').includes(queryDigits)) return true;
            return false;
        });
        if (idMatch) return idMatch;

        // 3. Phone number match (pick newest order for that customer)
        if (queryDigits.length >= 8) {
            const phoneMatches = ordersArray.filter(o => {
                if (!o || !o.customer || !o.customer.phone) return false;
                const custPhoneDigits = String(o.customer.phone).replace(/\D/g, '');
                return custPhoneDigits.includes(queryDigits) || queryDigits.includes(custPhoneDigits);
            });
            if (phoneMatches.length > 0) {
                // Sort by newest
                phoneMatches.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                return phoneMatches[0];
            }
        }

        return null;
    }

    // Search LocalStorage first
    const rawStored = localStorage.getItem("amrutha_ghee_cloud_orders");
    let localOrders = {};
    try {
        localOrders = rawStored ? JSON.parse(rawStored) : {};
    } catch (e) {
        localOrders = {};
    }

    const localFound = findInOrdersObject(localOrders);

    if (localFound) {
        renderTrackOrderDetails(localFound);
        // If Firebase is also enabled, attach live listener for real-time updates
        attachFirebaseListenerIfAvailable(localFound.id);
        return;
    }

    // If not found locally, try Firebase if active
    if (!isAppDemoMode && appDbRef) {
        appDbRef.once("value").then(snapshot => {
            const cloudOrders = snapshot.val() || {};
            const cloudFound = findInOrdersObject(cloudOrders);
            if (cloudFound) {
                renderTrackOrderDetails(cloudFound);
                attachFirebaseListenerIfAvailable(cloudFound.id);
            } else {
                showOrderNotFound();
            }
        }).catch(err => {
            console.error("Failed to query cloud orders:", err);
            showOrderNotFound();
        });
    } else {
        showOrderNotFound();
    }
}

function showOrderNotFound() {
    const notFoundEl = document.getElementById("track-not-found");
    const initialEl = document.getElementById("track-initial-state");
    const resultContainer = document.getElementById("track-result-container");

    if (initialEl) initialEl.classList.add("hidden");
    if (resultContainer) resultContainer.classList.add("hidden");
    if (notFoundEl) notFoundEl.classList.remove("hidden");
}

function attachFirebaseListenerIfAvailable(orderId) {
    if (isAppDemoMode || !appDbRef || !orderId) return;

    if (firebaseTrackListener && currentTrackedOrderId) {
        appDbRef.child(currentTrackedOrderId).off("value", firebaseTrackListener);
    }

    firebaseTrackListener = (snapshot) => {
        const data = snapshot.val();
        if (data) {
            console.log("Firebase real-time update received for tracked order:", data.id, data.status);
            renderTrackOrderDetails(data);
        }
    };

    appDbRef.child(orderId).on("value", firebaseTrackListener);
}

// Refresh currently tracked order
window.refreshCurrentTrackedOrder = function() {
    if (currentTrackedOrderId) {
        fetchAndDisplayOrder(currentTrackedOrderId, true);
    }
};

// Render full order tracking details into resultContainer
function renderTrackOrderDetails(order) {
    currentTrackedOrderId = order.id;
    const notFoundEl = document.getElementById("track-not-found");
    const initialEl = document.getElementById("track-initial-state");
    const resultContainer = document.getElementById("track-result-container");

    if (notFoundEl) notFoundEl.classList.add("hidden");
    if (initialEl) initialEl.classList.add("hidden");
    if (!resultContainer) return;

    resultContainer.classList.remove("hidden");

    // Format dates
    const orderDate = new Date(order.timestamp).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });

    const isCancelled = order.status === "Cancelled";
    const status = order.status || "Pending";
    const timestamps = order.statusTimestamps || {};

    // Helper to format timestamps
    function formatTime(ts) {
        if (!ts) return "";
        const d = new Date(ts);
        return d.toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' });
    }

    // Determine status badge colors and descriptions
    let statusBadgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    let statusBadgeText = "Pending Store Confirmation";
    let statusSubtext = "Our store manager is verifying your order and preparing fresh ghee.";
    let progressPercent = 12;

    if (status === "Confirmed") {
        statusBadgeColor = "bg-blue-100 text-blue-900 border-blue-300";
        statusBadgeText = "Order Confirmed & Packing";
        statusSubtext = "Your order is confirmed! Fresh bilona ghee jar is packaged with care.";
        progressPercent = 40;
    } else if (status === "Shipped") {
        statusBadgeColor = "bg-indigo-100 text-indigo-900 border-indigo-300";
        statusBadgeText = "Out for Delivery (Vijayawada)";
        statusSubtext = "Our delivery partner has picked up your order and is on the way to your address.";
        progressPercent = 75;
    } else if (status === "Delivered") {
        statusBadgeColor = "bg-green-100 text-green-900 border-green-300";
        statusBadgeText = "Delivered to Doorstep";
        statusSubtext = "Order delivered! Thank you for choosing Amrutha Pure Ghee.";
        progressPercent = 100;
    } else if (isCancelled) {
        statusBadgeColor = "bg-red-100 text-red-900 border-red-300";
        statusBadgeText = "Order Cancelled";
        statusSubtext = "This order has been cancelled. Please contact us on WhatsApp if you have questions.";
        progressPercent = 0;
    }

    // Calculate Step States: 'done', 'active', 'pending'
    const stepOrder = ["Pending", "Confirmed", "Shipped", "Delivered"];
    const currentStepIdx = stepOrder.indexOf(status);

    function getStepClass(stepIndex) {
        if (isCancelled) return "track-step-pending opacity-40";
        if (stepIndex < currentStepIdx) return "track-step-done";
        if (stepIndex === currentStepIdx) return "track-step-active";
        return "track-step-pending";
    }

    function getStepIcon(stepIndex) {
        if (!isCancelled && stepIndex < currentStepIdx) {
            return `<i class="fa-solid fa-check text-xs"></i>`;
        }
        if (stepIndex === 0) return `<i class="fa-solid fa-receipt text-xs"></i>`;
        if (stepIndex === 1) return `<i class="fa-solid fa-circle-check text-xs"></i>`;
        if (stepIndex === 2) return `<i class="fa-solid fa-truck-fast text-xs"></i>`;
        if (stepIndex === 3) return `<i class="fa-solid fa-house-chimney-check text-xs"></i>`;
        return `<i class="fa-solid fa-circle text-[8px]"></i>`;
    }

    // Stepper HTML
    const stepperHTML = isCancelled ? `
        <div class="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <span class="text-red-500 text-2xl mt-0.5"><i class="fa-solid fa-ban"></i></span>
            <div class="space-y-1">
                <h4 class="font-bold text-sm text-red-900">Order Was Cancelled</h4>
                <p class="text-xs text-red-700 leading-relaxed">
                    This order record was marked as cancelled by store management. If this was unexpected, please reach out to us directly on WhatsApp with Order ID <strong class="font-mono">${order.id}</strong>.
                </p>
                <div class="pt-2">
                    <a href="https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello Amrutha Ghee, my order ' + order.id + ' is showing as cancelled. Could you please help?')}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg shadow-xs">
                        <i class="fa-brands fa-whatsapp"></i> Chat with Support
                    </a>
                </div>
            </div>
        </div>
    ` : `
        <div class="relative py-2">
            <!-- Connecting Progress Line Background -->
            <div class="absolute top-5 left-6 right-6 h-1 bg-gray-200 -z-0 rounded-full"></div>
            <!-- Connecting Progress Line Active -->
            <div class="absolute top-5 left-6 h-1 bg-gradient-to-r from-amber-500 to-green-500 -z-0 rounded-full transition-all duration-700" style="width: calc(${progressPercent}% - 30px); max-width: calc(100% - 48px);"></div>

            <!-- Stepper Items -->
            <div class="grid grid-cols-4 gap-1 relative z-10 text-center">
                
                <!-- Step 1: Placed -->
                <div class="flex flex-col items-center space-y-1.5 ${getStepClass(0)}">
                    <div class="step-icon-box w-9 h-9 rounded-full flex items-center justify-center border-2 bg-white transition-all">
                        ${getStepIcon(0)}
                    </div>
                    <div>
                        <span class="block text-[11px] font-extrabold text-gray-800 leading-tight">Order Placed</span>
                        <span class="block text-[10px] text-gray-500 mt-0.5">${formatTime(order.timestamp) || 'Received'}</span>
                    </div>
                </div>

                <!-- Step 2: Confirmed -->
                <div class="flex flex-col items-center space-y-1.5 ${getStepClass(1)}">
                    <div class="step-icon-box w-9 h-9 rounded-full flex items-center justify-center border-2 bg-white transition-all">
                        ${getStepIcon(1)}
                    </div>
                    <div>
                        <span class="block text-[11px] font-extrabold text-gray-800 leading-tight">Confirmed</span>
                        <span class="block text-[10px] text-gray-500 mt-0.5">${timestamps.Confirmed ? formatTime(timestamps.Confirmed) : (currentStepIdx > 1 ? 'Done' : 'Verified')}</span>
                    </div>
                </div>

                <!-- Step 3: Shipped -->
                <div class="flex flex-col items-center space-y-1.5 ${getStepClass(2)}">
                    <div class="step-icon-box w-9 h-9 rounded-full flex items-center justify-center border-2 bg-white transition-all">
                        ${getStepIcon(2)}
                    </div>
                    <div>
                        <span class="block text-[11px] font-extrabold text-gray-800 leading-tight">Shipped</span>
                        <span class="block text-[10px] text-gray-500 mt-0.5">${timestamps.Shipped ? formatTime(timestamps.Shipped) : (currentStepIdx > 2 ? 'Dispatched' : '4-12 hrs')}</span>
                    </div>
                </div>

                <!-- Step 4: Delivered -->
                <div class="flex flex-col items-center space-y-1.5 ${getStepClass(3)}">
                    <div class="step-icon-box w-9 h-9 rounded-full flex items-center justify-center border-2 bg-white transition-all">
                        ${getStepIcon(3)}
                    </div>
                    <div>
                        <span class="block text-[11px] font-extrabold text-gray-800 leading-tight">Delivered</span>
                        <span class="block text-[10px] text-gray-500 mt-0.5">${timestamps.Delivered ? formatTime(timestamps.Delivered) : 'Doorstep'}</span>
                    </div>
                </div>

            </div>
        </div>
    `;

    // Itemized table HTML
    let itemsHTML = '';
    order.items.forEach(it => {
        itemsHTML += `
            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-xs">
                <div class="space-y-0.5">
                    <div class="font-bold text-gray-800">${it.name}</div>
                    <div class="text-[11px] text-gray-500">Size: <span class="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">${it.size}</span> × Qty: <strong>${it.quantity}</strong></div>
                </div>
                <div class="font-bold text-gray-900 text-sm">
                    ₹${it.price * it.quantity}
                </div>
            </div>
        `;
    });

    // Landmark display
    const landmarkHTML = order.customer.landmark ? `
        <div class="text-xs text-gray-500 mt-0.5"><strong class="text-gray-700">Landmark:</strong> ${order.customer.landmark}</div>
    ` : '';

    const whatsappSupportUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hello Amrutha Ghee Store, I am inquiring about my order ${order.id} (Status: ${order.status}).`)}`;

    resultContainer.innerHTML = `
        <!-- Top Status Card -->
        <div class="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID:</span>
                    <span class="font-mono font-black text-sm sm:text-base text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-300 flex items-center gap-1.5">
                        ${order.id}
                        <button onclick="copyOrderId('${order.id}')" class="text-amber-800 hover:text-amber-950 text-xs cursor-pointer p-0.5" title="Copy Order ID">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="refreshCurrentTrackedOrder()" class="text-xs text-gray-500 hover:text-amber-700 font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs transition-colors cursor-pointer" title="Refresh Live Status">
                        <i class="fa-solid fa-rotate text-[11px] text-amber-600"></i>
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 pt-1">
                <span class="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${statusBadgeColor}">
                    <span class="w-2 h-2 rounded-full ${isCancelled ? 'bg-red-500' : 'bg-green-500 animate-ping'}"></span>
                    ${statusBadgeText}
                </span>
                <span class="text-xs text-gray-500 flex items-center gap-1">
                    <i class="fa-regular fa-clock text-gray-400 text-xs"></i> Placed: ${orderDate}
                </span>
            </div>

            <p class="text-xs text-amber-900/80 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-200/50">
                <i class="fa-solid fa-circle-info text-amber-600 mr-1"></i> ${statusSubtext}
            </p>
        </div>

        <!-- Stepper Component -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <i class="fa-solid fa-timeline text-amber-500"></i> Delivery Timeline
            </h4>
            ${stepperHTML}
        </div>

        <!-- Order Items & Bill Details -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i class="fa-solid fa-basket-shopping text-amber-500"></i> Ordered Items (${order.items.length})
                </h4>
                <span class="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">
                    ${order.checkoutMethod || 'COD'}
                </span>
            </div>

            <div class="divide-y divide-gray-50">
                ${itemsHTML}
            </div>

            <div class="pt-2 border-t border-gray-100 flex justify-between items-center text-sm font-bold">
                <span class="text-gray-700">Total Amount:</span>
                <span class="text-lg font-black text-amber-950">₹${order.subtotal}</span>
            </div>
        </div>

        <!-- Customer & Delivery Address Card -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-location-dot text-amber-500"></i> Delivery Address
            </h4>
            <div class="text-xs text-gray-700 space-y-1 leading-relaxed">
                <div class="font-bold text-gray-900 text-sm">${order.customer.name}</div>
                <div class="text-amber-700 font-semibold flex items-center gap-1.5">
                    <i class="fa-solid fa-phone text-[10px]"></i> ${order.customer.phone}
                </div>
                <div class="text-gray-600">${order.customer.address}</div>
                ${landmarkHTML}
            </div>
        </div>

        <!-- Help Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-2.5 pt-1">
            <a href="${whatsappSupportUrl}" target="_blank" class="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-center">
                <i class="fa-brands fa-whatsapp text-base"></i>
                <span>Ask Store on WhatsApp</span>
            </a>
            <button onclick="closeTrackOrderModal()" class="py-3 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center">
                Close
            </button>
        </div>
    `;
}

// Copy Order ID utility
window.copyOrderId = function(orderId) {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId).then(() => {
        alert(`Order ID copied: ${orderId}`);
    }).catch(() => {
        prompt("Copy your Order ID:", orderId);
    });
};

