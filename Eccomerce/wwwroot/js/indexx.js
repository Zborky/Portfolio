/**
 * Function to fetch products from the API and display them on the page.
 */
function fetchProducts() {
    fetch('/api/trendy')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = ''; // Clear existing content

            // If no products are available, display a message
            if (products.length === 0) {
                productContainer.innerHTML = '<p>No products available to display.</p>';
                return;
            }

            // For each product, create an HTML structure and add it to the list
            products.forEach(product => {
                const availabilityStatus = product.quantity > 0 ? 'Available' : 'Out of stock';
                const availabilityClass = product.quantity < 0 ? 'Unavailable' : 'not-available';

                const productElement = `
                    <div class="product">
                        <h3>${product.name || 'Unknown name'}</h3>
                        <p>${product.description || 'Description not available'}</p>
                        <h5>${product.category || 'Category not available'}</h5>
                        <span>${product.price || 'Price not available'} €</span>                        
                        ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Product'}" class="product-image" />` : ''}
                        <p class="${availabilityClass}">${availabilityStatus}</p>
                        <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Add to cart</button>
                        <button class="wishlist-btn" data-product-id="${product.id}">Add to wishlist</button>
                    </div>`;
                productContainer.insertAdjacentHTML('beforeend', productElement);
            });

            attachEventListeners(products); // Attach event listeners to the buttons
        });
}

/**
 * Adds event listeners to the product buttons (cart and wishlist).
 */
function attachEventListeners(products) {
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToCart(product); // Add to cart
        });
    });

    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToWishlist(product); // Add to wishlist
        });
    });
}

/**
 * Adds a product to the local storage (cart).
 */
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1; // If the product is already in the cart, increase the quantity
    } else {
        cart.push({ ...product, quantity: 1 }); // Add new product to the cart
    }
    localStorage.setItem('cart', JSON.stringify(cart)); // Save to local storage
    updateCartCount(); // Update the cart count
}

/**
 * Event handler for continuing to the checkout page.
 */
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; // Redirect to order page
});

/**
 * Updates the cart item count displayed in the header.
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0); // Calculate total number of items
    document.getElementById('cart-count').textContent = cartCount;
}

/**
 * Adds a product to the wishlist in local storage.
 */
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    if (existingProductIndex < 0) {
        wishlist.push(product); // Add product to wishlist if it doesn't exist
        localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Save to local storage
        updateWishlistCount(); // Update wishlist count
        alert(`${product.name} has been added to the wishlist.`); // Notify user
    }
}

/**
 * Updates the wishlist item count displayed in the header.
 */
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length; // Calculate the number of items in the wishlist
    const wishlistCountElement = document.getElementById('wishlist-count');
    if (wishlistCountElement) {
        wishlistCountElement.textContent = wishlistCount;
    }
}

/**
 * Displays the cart sidebar with the products in the cart.
 */
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing cart items

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Cart is empty.</li>'; // If cart is empty, display message
    } else {
        // For each item in the cart, create an HTML structure and add it to the cart
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

    cartSidebar.classList.add('active'); // Show the cart sidebar

    // Add event listeners to the "Remove" buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId); // Remove product from cart
        });
    });
}

/**
 * Removes a product from the cart in local storage.
 */
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId); // Filter out the product from the cart
    localStorage.setItem('cart', JSON.stringify(cart)); // Save the updated cart to local storage
    updateCartCount(); // Update the cart count
    showCartSidebar(); // Display the updated cart
}

/**
 * Hides the cart sidebar.
 */
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active'); // Remove the "active" class to hide the sidebar
}

/**
 * Event listener for clicking the cart icon to display the cart sidebar.
 */
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar(); // Show the cart sidebar
});

/**
 * Event listener for closing the cart sidebar.
 */
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar(); // Hide the cart sidebar
});

/**
 * Event listener to check if the user is authenticated and update the profile link accordingly.
 */
document.addEventListener('DOMContentLoaded', function() {
    fetch('/account/profile')
        .then(response => {
            if (response.ok) {
                return response.json(); // Get user data if authenticated
            } else {
                throw new Error('Not authenticated');
            }
        })
        .then(user => {
            const authLink = document.getElementById('auth-link');
            authLink.href = 'profile.html'; // Set the profile link
            authLink.textContent = 'Profile'; // Change link text to 'Profile'
        })
        .catch(error => {
            console.log('User not authenticated:', error); // Log error if not authenticated
        });
});

/**
 * Event listener to display the user's authentication status (logged in or not).
 */
document.addEventListener("DOMContentLoaded", async () => {
    const userStatusElement = document.getElementById("user-status");

    try {
        // Call backend to get current user
        const response = await fetch('/account/current-user');
        const data = await response.json();

        if (data.username) {
            // If user is logged in, display their username
            userStatusElement.innerHTML = `<span>Logged in as: ${data.username}</span>`;
        } else {
            // If not logged in, show registration/login link
            userStatusElement.innerHTML = `<a href="register.html">Register/Login</a>`;
        }
    } catch (error) {
        console.error('Error fetching user status:', error);
        userStatusElement.innerHTML = `<a href="register.html">Register/Login</a>`; // Show registration/login link on error
    }
});

/**
 * Initialize functions when the document is loaded.
 */
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts(); // Fetch products and display them
    updateCartCount(); // Update cart count
    updateWishlistCount(); // Update wishlist count
});
