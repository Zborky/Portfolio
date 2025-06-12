// Function to fetch cases from the server
// This function makes a GET request to the '/api/cases' endpoint.
// If the response is successful, it processes the data, extracting the array of cases from the '$values' property.
// The cases are then passed to the 'displayProducts' function for rendering.
// If an error occurs during the fetch, it logs the error to the console.
function fetchCases() {
    fetch('/api/cases')
        .then(response => response.json())
        .then(data => {
            const cases = data.$values || [];
            displayProducts(cases);
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to fetch capes from the server
// Similar to 'fetchCases', it fetches data from the '/api/capes' endpoint
// and passes the capes data to 'displayProducts'.
function fetchCapes() {
    fetch('/api/capes')
        .then(response => response.json())
        .then(data => {
            const capes = data.$values || [];
            displayProducts(capes);
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to fetch krytky from the server
// Follows the same logic as 'fetchCases' and 'fetchCapes'.
// Fetches data from '/api/krytky' and displays the krytky products.
function fetchKrytky() {
    fetch('/api/krytky')
        .then(response => response.json())
        .then(data => {
            const cases = data.$values || [];
            displayProducts(cases);
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to display products on the page
// Accepts an array of product items and populates the product container with their details.
// If no items are available, a message is displayed indicating no products are present.
// Each product is rendered with its name, description, price, image (if available), and buttons for adding to cart or wishlist.
function displayProducts(items) {
    const productContainer = document.getElementById('product-list');
    
    if (items.length === 0) {
        productContainer.innerHTML = '<p>No products to display.</p>';
        return;
    }

    items.forEach(item => {
        const productElement = `
            <div class="product">
                <h3>${item.name || 'Unknown name'}</h3>
                <p>${item.description || 'Description not available'}</p>
                <span>${item.price || 'Price not available'} €</span>
                ${item.imagePath ? `<img src="${item.imagePath}" alt="${item.name || 'Product'}" class="product-image" />` : ''}
                <button class="order-btn" data-product-id="${item.id}">Add to Cart</button>
                <button class="wishlist-btn" data-product-id="${item.id}">Add to Wishlist</button>
            </div>`;
        productContainer.insertAdjacentHTML('beforeend', productElement);
    });

    // Attach event listeners to dynamically added product buttons
    attachEventListeners(items);
}

// Function to attach event listeners to the product buttons
// Adds 'click' listeners to the "Add to Cart" and "Add to Wishlist" buttons
// Finds the corresponding product using its ID and invokes the appropriate action (add to cart or wishlist).
function attachEventListeners(products) {
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToCart(product);
        });
    });

    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            addToWishlist(product);
        });
    });
}

// Function to add a product to the cart
// Retrieves the current cart from localStorage, parses it, and checks if the product already exists.
// If it exists, the quantity is incremented; otherwise, the product is added to the cart.
// The updated cart is saved back to localStorage, and the cart count is updated.
function addToCart(product) {
    let cart = [];
    
    // Retrieve the cart data from localStorage
    const storedCart = localStorage.getItem('cart');
    
    // Parse the cart data, handling any potential parsing errors
    try {
        cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error('Error parsing cart data:', e);
        cart = [];
    }

    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update the cart count displayed on the page
    updateCartCount();
}

// Event listener for the "Continue to Order" button
// Redirects the user to the order page when clicked.
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; 
});

// Function to update the cart count displayed on the page
// Calculates the total quantity of items in the cart and updates the cart count indicator.
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to add a product to the wishlist
// Retrieves the wishlist from localStorage, checks if the product already exists, and adds it if not.
// Updates the wishlist count and displays a confirmation message.
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    if (existingProductIndex < 0) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
        alert(`${product.name} was added to your wishlist.`);
    }
}

// Function to update the wishlist count displayed on the page
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    document.getElementById('wishlist-count').textContent = wishlistCount;
}

// Function to display the cart sidebar
// Retrieves the cart items from localStorage and renders them in the sidebar.
// Adds event listeners to the "Remove" buttons for each cart item.
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>The cart is empty.</li>';
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
    attachRemoveButtonListeners();
}

// Function to attach event listeners to "Remove" buttons in the cart
function attachRemoveButtonListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });
}

// Function to remove a product from the cart
// Filters the cart to exclude the product with the specified ID and updates localStorage.
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== parseInt(productId, 10)); 
    localStorage.setItem('cart', JSON.stringify(cart));
    showCartSidebar();
}

// Function to hide the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active');
}

// Event listener for the cart button
// Prevents default behavior and shows the cart sidebar when clicked.
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar();
});

// Event listener for the "Close Cart" button
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

// Event listener for the document load event
// Fetches products and updates the cart and wishlist counts when the page is loaded.
document.addEventListener('DOMContentLoaded', function() {
    fetchCases();
    fetchCapes();
    fetchKrytky();
    updateCartCount();
    updateWishlistCount();
});
