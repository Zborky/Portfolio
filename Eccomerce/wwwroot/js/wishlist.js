// Loads the wishlist and displays it on the page, including images
function loadWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; // Retrieve the wishlist from localStorage
    const wishlistContainer = document.getElementById('wishlist-container');
    wishlistContainer.innerHTML = ''; // Clear any existing content

    if (wishlist.length === 0) {
        // If the wishlist is empty, display a placeholder message
        wishlistContainer.innerHTML = '<p>Wishlist je prázdny.</p>';
    } else {
        // Iterate through wishlist items and create HTML for each
        wishlist.forEach(item => {
            const listItem = `
                <div class="wishlist-item">
                    <img src="${item.imagePath || 'assets/default-image.png'}" alt="${item.name || 'Neznámy názov'}" class="product-image" />
                    <h3>${item.name || 'Neznámy názov'}</h3>
                    <p>${item.price || 'Cena nie je dostupná'} €</p>
                    <button class="move-to-cart-btn" data-product-id="${item.id}">Presunúť do košíka</button>
                    <button class="remove-btn" data-product-id="${item.id}">Odstrániť</button>
                </div>
            `;
            wishlistContainer.insertAdjacentHTML('beforeend', listItem);
        });

        // Add event listeners for moving items to the cart and removing them from the wishlist
        document.querySelectorAll('.move-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id'); // Get product ID from the button
                const product = wishlist.find(p => p.id == productId); // Find the product in the wishlist
                addToCart(product); // Add the product to the cart
                removeFromWishlist(productId); // Remove the product from the wishlist
            });
        });

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-product-id'); // Get product ID from the button
                removeFromWishlist(productId); // Remove the product from the wishlist
            });
        });
    }
}

// Adds a product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Retrieve the cart from localStorage
    const existingProductIndex = cart.findIndex(item => item.id === product.id); // Check if the product already exists in the cart
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1; // Increment quantity if the product exists
    } else {
        cart.push({ ...product, quantity: 1 }); // Add a new product to the cart
    }
    localStorage.setItem('cart', JSON.stringify(cart)); // Save the updated cart back to localStorage
    updateCartCount(); // Update the cart count display
}

// Removes a product from the wishlist
function removeFromWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || []; // Retrieve the wishlist from localStorage
    wishlist = wishlist.filter(item => item.id !== parseInt(productId, 10)); // Remove the product with the matching ID
    localStorage.setItem('wishlist', JSON.stringify(wishlist)); // Save the updated wishlist back to localStorage
    loadWishlist(); // Reload the wishlist display
}

// Updates the displayed count of products in the cart
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || []; // Retrieve the cart from localStorage
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0); // Calculate the total quantity
    document.getElementById('cart-count').textContent = cartCount; // Update the cart count element
}

// Event listener to proceed to the order page
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; // Redirect to the order page
});

// Displays the sidebar containing products in the cart
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || []; // Retrieve the cart from localStorage
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear any existing items

    if (cart.length === 0) {
        // If the cart is empty, display a placeholder message
        cartItemsContainer.innerHTML = '<li>Košík je prázdny.</li>';
    } else {
        // Iterate through cart items and create HTML for each
        cart.forEach(item => {
            const listItem = `
                <li>
                    <img src="${item.imagePath || 'placeholder.png'}" alt="${item.name || 'Produkt'}" style="width: 50px; height: 50px;" />
                    ${item.name || 'Neznámy názov'} - ${item.quantity} ks - ${item.price} €
                </li>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', listItem);
        });
    }

    cartSidebar.classList.add('active'); // Display the cart sidebar
}

// Hides the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active'); // Hide the cart sidebar
}

// Event listener for showing the cart sidebar when the cart button is clicked
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default behavior of the link
    showCartSidebar();
});

// Event listener for hiding the cart sidebar when the close button is clicked
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

// Load wishlist and update cart count when the page is loaded
window.onload = function() {
    loadWishlist();
    updateCartCount();
};
