// Fetches the products in the cart and displays them with an image
function fetchCartProducts() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing items

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Cart is empty.</li>';
    } else {
        cart.forEach(item => {
            const listItem = `
                <li>
                    <img src="${item.image || 'assets/default.jpg'}" alt="${item.name}" class="cart-image" />
                    ${item.name || 'Unknown name'} - ${item.quantity} pcs - ${item.price} €
                </li>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', listItem);
        });
    }
}

// Adds a product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update the cart count
    fetchCartProducts(); // Refresh the cart items
}

// Updates the number of products in the cart
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Displays the cart sidebar with products
function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear existing items

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Cart is empty.</li>';
    } else {
        cart.forEach(item => {
            const listItem = `
                <li>
                    <img src="${item.image || 'placeholder.png'}" alt="${item.name || 'Product'}" style="width: 50px; height: 50px;" />
                    ${item.name || 'Unknown name'} - ${item.quantity} pcs - ${item.price} €
                </li>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', listItem);
        });
    }

    cartSidebar.classList.add('active'); // Show the cart sidebar
}

// Hides the cart sidebar
function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active'); // Remove the active class to hide the sidebar
}

// Event listener for the cart button
document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default behavior (if any)
    showCartSidebar(); // Show the cart sidebar when clicked
});

// Event listener for closing the cart
document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar(); // Hide the cart sidebar when the close button is clicked
});

// Event listener to continue to the order page
document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; // Redirect to the order page
});

// Load products in the cart and update cart count when the page loads
window.onload = function() {
    updateCartCount(); // Load the number of products in the cart
    fetchCartProducts(); // Load the products in the cart
};

// Event listener for form submission (contact form)
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const formData = new FormData(this); // Get the form data

        // Send the message to the server
        fetch('/Contact/SendMessage', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok'); // Check if the response is valid
            }
            return response.json(); // Get the JSON response
        })
        .then(data => {
            if (data.success) {
                // Show a success message if the message is sent successfully
                const successMessage = document.getElementById('success-message');
                successMessage.textContent = data.message; // Set the message text
                successMessage.style.display = 'block'; // Display the message
                this.reset(); // Reset the form after successful submission
            } else {
                throw new Error('Unexpected response from server.');
            }
        })
        .catch(error => {
            console.error('Error:', error); // Log the error in the console
            alert('An error occurred while sending the message.'); // Show an error message
        });
    });
});
