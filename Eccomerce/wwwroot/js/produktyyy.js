// Function to fetch products from the API
function fetchProducts() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const cases = data.$values || []; // Retrieve products from the response
            displayProducts(cases); // Display the retrieved products
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to display the list of products
function displayProducts(products) {
    const productContainer = document.getElementById('product-list');
    
    // Show a message if there are no products to display
    if (products.length === 0) {
        productContainer.innerHTML = '<p>No products available.</p>';
        return;
    }

    // Loop through each product and create its HTML structure
    products.forEach(product => {
        const availabilityStatus = product.quantity > 0 ? 'Available' : 'Not Available';
        const availabilityClass = product.quantity < 0 ? 'unavailable' : 'not-available';
    
        const productElement = `
            <div class="product">
                <h3>${product.name || 'Unknown Name'}</h3>
                <p>${product.description || 'No description available'}</p>
                <p>${product.category || 'Category not available'}</p>
                <span>${product.price || 'Price not available'} €</span>                        
                ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Product'}" class="product-image" />` : ''}
                <p class="${availabilityClass}">${availabilityStatus}</p>
                <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Add to Cart</button>
                <button class="wishlist-btn" data-product-id="${product.id}">Add to Wishlist</button>
                <a href="/produkt.html?id=${product.id}" class="btn">View Details</a>
            </div>`;
        productContainer.insertAdjacentHTML('beforeend', productElement);
    });

    attachEventListeners(products); // Attach event listeners to buttons
}

// Function to attach event listeners to buttons
function attachEventListeners(products) {
    // Attach click event for the "Add to Cart" buttons
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToCart(product); // Add the product to the cart
        });
    });

    // Attach click event for the "Add to Wishlist" buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToWishlist(product); // Add the product to the wishlist
        });
    });
}

// Function to add a product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1; // Increase quantity if the product already exists in the cart
    } else {
        cart.push({ ...product, quantity: 1 }); // Add new product with quantity 1
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update cart item count
}

// Event listener for the "Proceed to Order" button
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; 
});

// Function to update the cart item count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to add a product to the wishlist
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    if (existingProductIndex < 0) {
        wishlist.push(product); // Add product to the wishlist if it doesn't already exist
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount(); // Update wishlist item count
        alert(`${product.name} was added to your wishlist.`);
    }
}

// Function to update the wishlist item count
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    document.getElementById('wishlist-count').textContent = wishlistCount;
}

// Function to display the cart sidebar
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; 

    // Show a message if the cart is empty
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Your cart is empty.</li>';
    } else {
        // Populate cart items
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

    cartSidebar.classList.add('active');
    attachRemoveButtonListeners(); // Attach event listeners for "Remove" buttons
}

// Function to attach event listeners to "Remove" buttons
function attachRemoveButtonListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId); // Remove product from cart
        });
    });
}

// Function to remove a product from the cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== parseInt(productId, 10)); // Filter out the product
    localStorage.setItem('cart', JSON.stringify(cart));
    showCartSidebar(); // Refresh the cart sidebar
}

// Function to hide the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active');
}

// Function to sort products based on the specified order
function sortProducts(products, order) {
    if (order === 'asc') {
        return products.sort((a, b) => a.price - b.price); // Sort by ascending price
    } else if (order === 'desc') {
        return products.sort((a, b) => b.price - a.price); // Sort by descending price
    }
    return products; // Return unsorted if no valid order is provided
}

// Event listener for sorting products in ascending order
document.getElementById('sort-asc').addEventListener('click', function() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'asc');
            document.getElementById('product-list').innerHTML = ''; // Clear the product list
            displayProducts(sortedProducts);
        })
        .catch(error => console.error('Error sorting products:', error));
});

// Event listener for sorting products in descending order
document.getElementById('sort-desc').addEventListener('click', function() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'desc');
            document.getElementById('product-list').innerHTML = ''; // Clear the product list
            displayProducts(sortedProducts);
        })
        .catch(error => console.error('Error sorting products:', error));
});

// Event listener to show the cart sidebar when the cart button is clicked
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar();
});

// Event listener to hide the cart sidebar when the close button is clicked
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

// Event listener to fetch products and update the cart and wishlist counts when the page loads
document.addEventListener('DOMContentLoaded', function() {            
    fetchProducts();
    updateCartCount();
    updateWishlistCount();
});
