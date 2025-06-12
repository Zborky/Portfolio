// Function to fetch products from the API
function fetchProducts() {
    fetch('/api/cases')
        .then(response => response.json())
        .then(data => {
            const cases = data.$values || []; // Get products from the response
            displayProducts(cases); // Display the products
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to display products on the page
function displayProducts(products) {
    const productContainer = document.getElementById('product-list');
    
    if (products.length === 0) {
        productContainer.innerHTML = '<p>No products to display.</p>';
        return;
    }

    products.forEach(product => {
        const availabilityStatus = product.quantity > 0 ? 'Available' : 'Out of stock';
        const availabilityClass = product.quantity < 0 ? 'Unavailable' : 'not-available';
    
        const productElement = `
            <div class="product">
                <h3>${product.name || 'Unknown name'}</h3>
                <p>${product.description || 'Description not available'}</p>
                <h4>${product.category || 'Category not available'}</h4>
                <span>${product.price || 'Price not available'} €</span>                        
                ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Product'}" class="product-image" />` : ''}
                <p class="${availabilityClass}">${availabilityStatus}</p>
                <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Add to cart</button>
                <button class="wishlist-btn" data-product-id="${product.id}">Add to wishlist</button>
                <a href="/product.html?id=${product.id}" class="btn">View details</a>
            </div>`;
        productContainer.insertAdjacentHTML('beforeend', productElement);
    });

    attachEventListeners(products); // Attach event listeners to buttons
}

// Function to attach event listeners to buttons (Add to cart, Add to wishlist)
function attachEventListeners(products) {
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToCart(product); // Add product to the cart
        });
    });

    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToWishlist(product); // Add product to the wishlist
        });
    });
}

// Function to add product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update the cart item count
}

// Event listener for "Proceed to Order" button
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; 
});

// Function to update the number of items in the cart
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to add product to the wishlist
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    if (existingProductIndex < 0) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount(); // Update the wishlist item count
        alert(`${product.name} has been added to the wishlist.`);
    }
}

// Function to update the number of items in the wishlist
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    document.getElementById('wishlist-count').textContent = wishlistCount;
}

// Function to show the cart sidebar
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Cart is empty.</li>';
    } else {
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
    attachRemoveButtonListeners(); // Attach event listeners for remove buttons
}

// Function to attach event listeners for remove buttons in the cart
function attachRemoveButtonListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId); // Remove product from the cart
        });
    });
}

// Function to remove product from the cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== parseInt(productId, 10)); // Convert to number
    localStorage.setItem('cart', JSON.stringify(cart));
    showCartSidebar(); // Show the cart after removal
}

// Function to hide the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active');
}

// Function to sort products by price
function sortProducts(products, order) {
    if (order === 'asc') {
        return products.sort((a, b) => a.price - b.price); // Cheapest first
    } else if (order === 'desc') {
        return products.sort((a, b) => b.price - a.price); // Most expensive first
    }
    return products; // Default order
}

// Event listener for sorting products in ascending order
document.getElementById('sort-asc').addEventListener('click', function() {
    fetch('/api/cases')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'asc');
            document.getElementById('product-list').innerHTML = ''; // Clear the list
            displayProducts(sortedProducts);
        })
        .catch(error => console.error('Error sorting products:', error));
});

// Event listener for sorting products in descending order
document.getElementById('sort-desc').addEventListener('click', function() {
    fetch('/api/cases')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'desc');
            document.getElementById('product-list').innerHTML = ''; // Clear the list
            displayProducts(sortedProducts);
        })
        .catch(error => console.error('Error sorting products:', error));
});

// Event listener for showing the cart sidebar
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar();
});

// Event listener for hiding the cart sidebar
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

// Event listener to load products and update cart and wishlist counts when the page loads
document.addEventListener('DOMContentLoaded', function() {            
    fetchProducts();
    updateCartCount();
    updateWishlistCount();
});
