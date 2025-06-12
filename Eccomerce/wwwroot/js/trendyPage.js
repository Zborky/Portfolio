function fetchProducts() {
    fetch('/api/trendy')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = ''; // Clear existing content

            // If no products available, show message
            if (products.length === 0) {
                productContainer.innerHTML = '<p>No products to display.</p>';
                return;
            }

            // Loop through products and create HTML elements for each
            products.forEach(product => {
                const availabilityStatus = product.quantity > 0 ? 'Available' : 'Not Available';
                // Note: seems like there is a logic inconsistency here, but keeping as is
                const availabilityClass = product.quantity < 0 ? 'Nedostupny' : 'not-available';

                // Create product HTML block with details and buttons
                const productElement = `
                    <div class="product">
                        <h3>${product.name || 'Unknown name'}</h3>
                        <p>${product.description || 'Description not available'}</p>
                        <p>${product.category || 'Category not available'}</p>
                        <span>${product.price || 'Price not available'} €</span>                        
                        ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Product'}" class="product-image" />` : ''}
                        <p class="${availabilityClass}">${availabilityStatus}</p>
                        <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Add to cart</button>
                        <button class="wishlist-btn" data-product-id="${product.id}">Add to wishlist</button>
                    </div>`;
                productContainer.insertAdjacentHTML('beforeend', productElement);
            });

            // Attach event listeners to buttons after rendering products
            attachEventListeners(products);
        });
}

// Attach click event listeners to the order and wishlist buttons
function attachEventListeners(products) {
    // Add to cart button event
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToCart(product);
        });
    });

    // Add to wishlist button event
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToWishlist(product);
        });
    });
}

// Add product to shopping cart stored in localStorage
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex >= 0) {
        // If product already in cart, increment quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // Otherwise add product with quantity 1
        cart.push({ ...product, quantity: 1 });
    }
    // Save updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Event listener to continue to order page
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; // Redirect to order page
});

// Update the cart count displayed in UI
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Sum quantities of all products in cart
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Add product to wishlist stored in localStorage
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);

    if (existingProductIndex < 0) {
        // If product not in wishlist, add it
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
        alert(`${product.name} has been added to the wishlist.`); // Notify user
    }
}

// Update the wishlist count displayed in UI
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    const wishlistCountElement = document.getElementById('wishlist-count');
    if (wishlistCountElement) {
        wishlistCountElement.textContent = wishlistCount;
    }
}

// Show the cart sidebar with current cart items
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing items

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>The cart is empty.</li>';
    } else {
        // Loop through cart items and display each
        cart.forEach(item => {
            const listItem = `
                <li>
                    <img src="${item.imagePath || 'placeholder.png'}" alt="${item.name || 'Product'}" style="width: 50px; height: 50px;" />
                    ${item.name || 'Unknown name'} - ${item.quantity} pcs - ${item.price} €
                    <button class="remove-btn" data-product-id="${item.id}">Remove</button>
                </li>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', listItem);
        });
    }

    cartSidebar.classList.add('active');

    // Attach event listeners to remove buttons inside cart sidebar
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });
}

// Remove product from cart by productId
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    // Filter out the product to be removed
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showCartSidebar(); // Refresh cart sidebar view after removal
}

// Hide the cart sidebar panel
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active');
}

// Event listener to show cart sidebar when cart icon/button is clicked
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar();
});

// Event listener to close cart sidebar when close button is clicked
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

// On DOM load, check user login status and update UI accordingly
document.addEventListener("DOMContentLoaded", async () => {
    const userStatusElement = document.getElementById("user-status");

    try {
        // Fetch current logged in user info from backend
        const response = await fetch('/account/current-user');
        const data = await response.json();

        if (data.username) {
            // If logged in, show username
            userStatusElement.innerHTML = `<span>Logged in as: ${data.username}</span>`;
        } else {
            // If not logged in, show register/login link
            userStatusElement.innerHTML = `<a href="register.html">Register/Login</a>`;
        }
    } catch (error) {
        console.error('Error fetching user status:', error);
        // On error, fallback to register/login link
        userStatusElement.innerHTML = `<a href="register.html">Register/Login</a>`;
    }
});

// Initialization after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts();        // Load products from backend
    updateCartCount();      // Update cart count in UI
    updateWishlistCount();  // Update wishlist count in UI
});
