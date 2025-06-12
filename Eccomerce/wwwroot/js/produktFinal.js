// Fetch the list of products from the API
function fetchProducts() {
    fetch('/api/products')
        .then(response => response.json())  // Parse JSON response
        .then(data => {
            const cases = data.$values || [];  // Extract products array from response
            displayProducts(cases);            // Display products on the page
        })
        .catch(error => console.error('Chyba pri načítaní produktov:', error));  // Log any errors
}

// Render the products into the product list container
function displayProducts(products) {
    const productContainer = document.getElementById('product-list');
    
    // Show message if no products are available
    if (products.length === 0) {
        productContainer.innerHTML = '<p>Žiadne produkty na zobrazenie.</p>';
        return;
    }

    // Loop through each product and create its HTML representation
    products.forEach(product => {
        const availabilityStatus = product.quantity > 0 ? 'Dostupný' : 'Nie je dostupný';
        const availabilityClass = product.quantity <= 0 ? 'Nedostupny' : 'not-available';

        const productElement = `
            <div class="product">
                <h3>${product.name || 'Neznámy názov'}</h3>
                <p>${product.description || 'Popis nie je dostupný'}</p>
                <span>${product.price || 'Cena nie je dostupná'} €</span>                        
                ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Produkt'}" class="product-image" />` : ''}
                <p class="${availabilityClass}">${availabilityStatus}</p>
                <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Pridať do košíka</button>
                <button class="wishlist-btn" data-product-id="${product.id}">Pridať do wishlistu</button>
                <a href="/produkt.html?id=${product.id}" class="btn">Zobraziť detail</a>
            </div>`;
        productContainer.insertAdjacentHTML('beforeend', productElement);  // Add product HTML to container
    });

    // Add event listeners for the new products' buttons
    attachEventListeners(products);
}

// Attach event listeners to "Add to cart" and "Add to wishlist" buttons
function attachEventListeners(products) {
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);  // Find product by ID
            addToCart(product);  // Add product to cart
        });
    });

    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);  // Find product by ID
            addToWishlist(product);  // Add product to wishlist
        });
    });
}

// Add a product to the shopping cart stored in localStorage
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];  // Get existing cart or empty array
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1;  // Increase quantity if product exists
    } else {
        cart.push({ ...product, quantity: 1 });    // Add new product with quantity 1
    }
    localStorage.setItem('cart', JSON.stringify(cart));  // Save updated cart
    updateCartCount();  // Update cart item count display
}

// Redirect user to the order page when clicking "continue to order"
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; 
});

// Update the cart count badge based on the number of items in the cart
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Add a product to the wishlist stored in localStorage
function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    if (existingProductIndex < 0) {
        wishlist.push(product);                      // Add product if not already in wishlist
        localStorage.setItem('wishlist', JSON.stringify(wishlist));  // Save updated wishlist
        updateWishlistCount();                       // Update wishlist count display
        alert(`${product.name} bol pridaný do wishlistu.`);  // Notify user
    }
}

// Update the wishlist count badge based on the number of items in the wishlist
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    document.getElementById('wishlist-count').textContent = wishlistCount;
}

// Show the cart sidebar with the list of products currently in the cart
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';  // Clear previous list

    // If cart is empty, show a message
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Košík je prázdny.</li>';
    } else {
        // Otherwise, list each product with image, name, quantity, price, and a remove button
        cart.forEach(item => {
            const listItem = `
                <li>
                    <img src="${item.imagePath || 'placeholder.png'}" alt="${item.name || 'Produkt'}" style="width: 50px; height: 50px;" />
                    ${item.name || 'Neznámy názov'} - ${item.quantity} ks - ${item.price} €
                    <button class="remove-btn" data-product-id="${item.id}">Odstrániť</button>
                </li>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', listItem);
        });
    }

    cartSidebar.classList.add('active');  // Show the sidebar
    attachRemoveButtonListeners();        // Attach listeners to remove buttons
}

// Attach event listeners to "Remove" buttons inside the cart sidebar
function attachRemoveButtonListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId);  // Remove product from cart when clicked
        });
    });
}

// Remove a product from the cart by filtering it out and update the display
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== parseInt(productId, 10));  // Convert productId to number
    localStorage.setItem('cart', JSON.stringify(cart));  // Save updated cart
    showCartSidebar();  // Refresh cart sidebar to reflect removal
}

// Hide the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active');
}

// Sort products by price in ascending or descending order
function sortProducts(products, order) {
    if (order === 'asc') {
        return products.sort((a, b) => a.price - b.price);  // Sort cheapest first
    } else if (order === 'desc') {
        return products.sort((a, b) => b.price - a.price);  // Sort most expensive first
    }
    return products;  // Return original order if unknown sorting order
}

// Event listener for sorting products by ascending price
document.getElementById('sort-asc').addEventListener('click', function() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'asc');
            document.getElementById('product-list').innerHTML = '';  // Clear product list
            displayProducts(sortedProducts);                          // Show sorted products
        })
        .catch(error => console.error('Chyba pri zoradení produktov:', error));
});

// Event listener for sorting products by descending price
document.getElementById('sort-desc').addEventListener('click', function() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'desc');
            document.getElementById('product-list').innerHTML = '';  // Clear product list
            displayProducts(sortedProducts);                          // Show sorted products
        })
        .catch(error => console.error('Chyba pri zoradení produktov:', error));
});

// Show cart sidebar when cart icon is clicked
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar();
});

// Hide cart sidebar when close button is clicked
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

// Initialize the page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {            
    fetchProducts();      // Load and display products
    updateCartCount();    // Update cart item count display
    updateWishlistCount();// Update wishlist item count display
});
