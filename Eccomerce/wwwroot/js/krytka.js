// Function to fetch products from the '/api/krytky' endpoint and display them
function fetchProducts() {
    fetch('/api/krytky')
        .then(response => response.json())
        .then(data => {
            const cases = data.$values || []; // Handle response structure and fallback to an empty array if no values
            displayProducts(cases); // Display fetched products
        })
        .catch(error => console.error('Chyba pri načítaní produktov:', error)); // Handle errors during fetching
}

// Function to display products on the page
function displayProducts(products) {
    const productContainer = document.getElementById('product-list');
    
    if (products.length === 0) {
        // Display a message if there are no products
        productContainer.innerHTML = '<p>Žiadne produkty na zobrazenie.</p>';
        return;
    }

    // Iterate over each product and generate HTML content
    products.forEach(product => {
        const availabilityStatus = product.quantity > 0 ? 'Dostupný' : 'Nie je dostupný'; // Check product availability
        const availabilityClass = product.quantity < 0 ? 'Nedostupny' : 'not-available'; // Class for styling availability
        
        // Create product card template
        const productElement = `
            <div class="product">
                <h3>${product.name || 'Neznámy názov'}</h3>
                <p>${product.description || 'Popis nie je dostupný'}</p>
                <p>${product.category || 'Kategória nie je dostupná'}</p>
                <span>${product.price || 'Cena nie je dostupná'} €</span>
                ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Produkt'}" class="product-image" />` : ''}
                <p class="${availabilityClass}">${availabilityStatus}</p>
                <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Pridať do košíka</button>
                <button class="wishlist-btn" data-product-id="${product.id}">Pridať do wishlistu</button>
                <a href="/produkt.html?id=${product.id}" class="btn">Zobraziť detail</a>
            </div>`;
        
        // Append the product card to the product container
        productContainer.insertAdjacentHTML('beforeend', productElement);
    });

    attachEventListeners(products); // Attach event listeners for buttons
}

// Function to attach event listeners for adding to cart and wishlist
function attachEventListeners(products) {
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id'); // Get product ID from button
            const product = products.find(p => p.id == productId); // Find product by ID
            addToCart(product); // Add product to cart
        });
    });

    // Add event listeners to "Add to Wishlist" buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id'); // Get product ID from button
            const product = products.find(p => p.id == productId); // Find product by ID
            addToWishlist(product); // Add product to wishlist
        });
    });
}

// Function to add a product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Retrieve existing cart from local storage or initialize
    const existingProductIndex = cart.findIndex(item => item.id === product.id); // Check if product already in cart

    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1; // Increment quantity if product exists
    } else {
        cart.push({ ...product, quantity: 1 }); // Add new product to cart
    }

    localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in local storage
    updateCartCount(); // Update cart item count
}

// Event listener for "Continue to Order" button
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; // Redirect to order page
});

// Function to update the cart item count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || []; // Retrieve cart from local storage
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0); // Calculate total item count
    document.getElementById('cart-count').textContent = cartCount; // Display count
}

// Function to add a product to the wishlist
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; // Retrieve wishlist from local storage or initialize
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id); // Check if product already in wishlist

    if (existingProductIndex < 0) {
        wishlist.push(product); // Add product if not already in wishlist
        localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Update wishlist in local storage
        updateWishlistCount(); // Update wishlist count
        alert(`${product.name} bol pridaný do wishlistu.`); // Notify user
    }
}

// Function to update the wishlist item count
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; // Retrieve wishlist from local storage
    const wishlistCount = wishlist.length; // Calculate wishlist item count
    document.getElementById('wishlist-count').textContent = wishlistCount; // Display count
}

// Function to display the cart sidebar with items
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || []; // Retrieve cart from local storage
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing items

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Košík je prázdny.</li>'; // Show empty message
    } else {
        cart.forEach(item => {
            const listItem = `
                <li>
                    <img src="${item.imagePath || 'placeholder.png'}" alt="${item.name || 'Produkt'}" style="width: 50px; height: 50px;" />
                    ${item.name || 'Neznámy názov'} - ${item.quantity} ks - ${item.price} €
                    <button class="remove-btn" data-product-id="${item.id}">Odstrániť</button>
                </li>`;
            cartItemsContainer.insertAdjacentHTML('beforeend', listItem); // Append item
        });
    }

    cartSidebar.classList.add('active'); // Show sidebar
    attachRemoveButtonListeners(); // Attach listeners to remove buttons
}

// Function to attach event listeners for removing items from the cart
function attachRemoveButtonListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id'); // Get product ID
            removeFromCart(productId); // Remove product from cart
        });
    });
}

// Function to remove an item from the cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Retrieve cart from local storage
    cart = cart.filter(item => item.id !== parseInt(productId, 10)); // Remove the specified product
    localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in local storage
    showCartSidebar(); // Refresh sidebar display
}

// Function to hide the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active'); // Hide sidebar
}

// Function to sort products by price in ascending or descending order
function sortProducts(products, order) {
    if (order === 'asc') {
        return products.sort((a, b) => a.price - b.price); // Sort ascending
    } else if (order === 'desc') {
        return products.sort((a, b) => b.price - a.price); // Sort descending
    }
    return products; // Return unsorted if order is invalid
}

// Event listeners for sorting products by price
document.getElementById('sort-asc').addEventListener('click', function() {
    fetch('/api/krytky')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'asc'); // Sort ascending
            document.getElementById('product-list').innerHTML = ''; // Clear current list
            displayProducts(sortedProducts); // Display sorted products
        })
        .catch(error => console.error('Chyba pri zoradení produktov:', error)); // Handle errors
});

document.getElementById('sort-desc').addEventListener('click', function() {
    fetch('/api/krytky')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'desc'); // Sort descending
            document.getElementById('product-list').innerHTML = ''; // Clear current list
            displayProducts(sortedProducts); // Display sorted products
        })
        .catch(error => console.error('Chyba pri zoradení produktov:', error)); // Handle errors
});

// Event listener to show the cart sidebar
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default action
    showCartSidebar(); // Show cart sidebar
});

// Event listener to hide the cart sidebar
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar(); // Hide cart sidebar
});

// Event listener to initialize the page on load
document.addEventListener('DOMContentLoaded', function() {
    fetchProducts(); // Load products
    updateCartCount(); // Update cart count
    updateWishlistCount(); // Update wishlist count
});
