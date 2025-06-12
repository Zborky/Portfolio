// Function to fetch products from the API
function fetchProducts() {
    fetch('/api/capes')
        .then(response => response.json())
        .then(data => {
            const cases = data.$values || []; // Extract products from API response
            displayProducts(cases); // Display products on the page
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to display products on the page
function displayProducts(products) {
    const productContainer = document.getElementById('product-list');
    
    if (products.length === 0) {
        productContainer.innerHTML = '<p>Ziadne produkty na zobrazenie.</p>';
        return;
    }

    products.forEach(product => {
        // Determine availability text and CSS class based on quantity
        const availabilityStatus = product.quantity > 0 ? 'Available' : 'Not available';
        const availabilityClass = product.quantity > 0 ? 'available' : 'not-available';
    
        // Build HTML for each product
        const productElement = `
            <div class="product">
                <h3>${product.name || 'Unknown Name'}</h3>
                <p>${product.description || 'Description not available'}</p>
                <h4>${product.category || 'Category not available'}</h4>
                <span>${product.price || 'Price not available'} €</span>                        
                ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Product'}" class="product-image" />` : ''}
                <p class="${availabilityClass}">${availabilityStatus}</p>
                <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Add to cart</button>
                <button class="wishlist-btn" data-product-id="${product.id}">Add to wishlist</button>
                <a href="/produkt.html?id=${product.id}" class="btn">View details</a>
            </div>`;
        productContainer.insertAdjacentHTML('beforeend', productElement);
    });

    attachEventListeners(products); // Attach event listeners to buttons
}

// Function to attach event listeners to order and wishlist buttons
function attachEventListeners(products) {
    // Add to cart button click handler
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToCart(product); // Add selected product to cart
        });
    });

    // Add to wishlist button click handler
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToWishlist(product); // Add selected product to wishlist
        });
    });
}

// Function to add a product to the cart in localStorage
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1; // Increase quantity if already in cart
    } else {
        cart.push({ ...product, quantity: 1 }); // Add new product with quantity 1
    }
    localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
    updateCartCount(); // Update cart item count display
}

// Event listener for "Continue to Order" button redirecting to order page
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; 
});

// Function to update the cart item count display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to add a product to the wishlist in localStorage
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    if (existingProductIndex < 0) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Save updated wishlist
        updateWishlistCount(); // Update wishlist item count display
        alert(`${product.name} bol pridany do wishlistu.`);
    }
}

// Function to update the wishlist item count display
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    document.getElementById('wishlist-count').textContent = wishlistCount;
}

// Function to display the cart sidebar with current cart items
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        cart.forEach(item => {
            const listItem = `
                <li>
                    <img src="${item.imagePath || 'placeholder.png'}" alt="${item.name || 'Product'}" style="width: 50px; height: 50px;" />
                    ${item.name || 'Unknown Name'} - ${item.quantity} pcs - ${item.price} €
                    <button class="remove-btn" data-product-id="${item.id}">Remove</button>
                </li>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', listItem);
        });
    }

    cartSidebar.classList.add('active'); // Show sidebar
    attachRemoveButtonListeners(); // Attach listeners for remove buttons
}

// Function to attach event listeners to remove buttons in the cart sidebar
function attachRemoveButtonListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId); // Remove product from cart
        });
    });
}

// Function to remove a product from the cart by product ID
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== parseInt(productId, 10)); // Filter out the removed product
    localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
    showCartSidebar(); // Refresh cart sidebar display
}

// Function to hide the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active');
}

// Function to sort products by price in ascending or descending order
function sortProducts(products, order) {
    if (order === 'asc') {
        return products.sort((a, b) => a.price - b.price); // Sort ascending (cheapest first)
    } else if (order === 'desc') {
        return products.sort((a, b) => b.price - a.price); // Sort descending (most expensive first)
    }
    return products; // Return original order if no valid sort order provided
}

// Event listener for sorting products ascending by price
document.getElementById('sort-asc').addEventListener('click', function() {
    fetch('/api/capes')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'asc');
            document.getElementById('product-list').innerHTML = ''; // Clear existing list
            displayProducts(sortedProducts); // Display sorted products
        })
        .catch(error => console.error('Error sorting products:', error));
});

// Event listener for sorting products descending by price
document.getElementById('sort-desc').addEventListener('click', function() {
    fetch('/api/capes')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'desc');
            document.getElementById('product-list').innerHTML = ''; // Clear existing list
            displayProducts(sortedProducts); // Display sorted products
        })
        .catch(error => console.error('Error sorting products:', error));
});

// Event listener to show the cart sidebar when cart icon/button is clicked
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar();
});

// Event listener to hide the cart sidebar when close button is clicked
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

// On page load, fetch products and update cart and wishlist counts
document.addEventListener('DOMContentLoaded', function() {            
    fetchProducts();
    updateCartCount();
    updateWishlistCount();
});
