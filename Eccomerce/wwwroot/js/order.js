document.addEventListener('DOMContentLoaded', () => {
    // Display the number of items in the cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').innerText = cart.length;  // Set the cart item count
    displayCartItems(cart);  // Show cart items on the page
    fetchProducts();         // Fetch products from the API
    updateCartCount();       // Update cart item count (just in case)
    updateWishlistCount();   // Update wishlist item count

    // Select elements related to payment method inputs
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const creditCardInfoDiv = document.getElementById('creditCardInfo');
    const cardNumberInput = document.getElementById('cardNumber');
    const cardExpiryInput = document.getElementById('cardExpiry');
    const cardCVCInput = document.getElementById('cardCVC');

    // Function to show/hide credit card payment fields
    function toggleCreditCardFields() {
        if (paymentMethodSelect.value === 'creditCard') {
            creditCardInfoDiv.style.display = 'block'; // Show credit card fields
            cardNumberInput.setAttribute('required', 'required');  // Make fields required
            cardExpiryInput.setAttribute('required', 'required');
            cardCVCInput.setAttribute('required', 'required');
        } else {
            creditCardInfoDiv.style.display = 'none';  // Hide credit card fields
            cardNumberInput.removeAttribute('required'); // Remove required attribute
            cardExpiryInput.removeAttribute('required');
            cardCVCInput.removeAttribute('required');
        }
    }

    // Set the correct visibility on page load
    toggleCreditCardFields();

    // Add event listener to toggle fields when payment method changes
    paymentMethodSelect.addEventListener('change', toggleCreditCardFields);

    // Handle order form submission
    document.getElementById('orderForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission reload

        const formData = new FormData(event.target);
        const orderItems = [];
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Check if the cart is empty before submitting order
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return; // Stop submission if no items
        }

        // Build the list of order items from the cart
        cart.forEach(item => {
            orderItems.push({
                Id: item.id,
                Quantity: item.quantity,
                Price: item.price,
                Name: item.name,
                CustomerEmail: formData.get('customerEmail'),
                CustomerName: formData.get('customerName')
            });
        });

        // Construct order data object with all form inputs
        const orderData = {
            CustomerName: formData.get('customerName'),
            CustomerEmail: formData.get('customerEmail'),
            CustomerPhone: formData.get('customerPhone'),
            Street: formData.get('street'),
            City: formData.get('city'),
            PostalCode: formData.get('postalCode'),
            Country: formData.get('country'),
            Kurier: formData.get('kurier'),
            Products: orderItems,
            Message: formData.get('message') || ''
        };

        // Process payment depending on the selected payment method
        const paymentMethod = formData.get('paymentMethod');
        if (paymentMethod === 'creditCard') {
            // If paying by credit card, gather card details
            const cardNumber = formData.get('cardNumber');
            const cardExpiry = formData.get('cardExpiry');
            const cardCVC = formData.get('cardCVC');
            const amount = 100;  // Replace with actual total amount
            const currency = 'EUR';  // Replace with actual currency

            // Send payment details to server for processing
            fetch('/api/payment/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cardNumber: cardNumber,
                    cardExpiry: cardExpiry,
                    cardCVC: cardCVC,
                    amount: amount,
                    currency: currency
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    submitOrder(orderData); // If payment successful, submit order
                } else {
                    alert('Payment failed: ' + data.error); // Show payment error
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Payment failed'); // Show error if communication fails
            });
        } else {
            // For other payment methods (e.g., cash on delivery), submit order directly
            submitOrder(orderData);
        }
    });

    // Function to submit order data to the server
    function submitOrder(orderData) {
        fetch('https://localhost:5285/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(response => {
            if (!response.ok) {
                // If server responds with error, throw with error message
                return response.text().then(text => {
                    throw new Error('Server error: ' + text);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data && data.orderId) {
                alert('Order successfully placed!'); // Notify success
                localStorage.removeItem('cart');  // Clear cart after successful order
                updateCartCount();  // Update cart count on page
                displayCartItems([]); // Clear cart display
            } else {
                throw new Error('Unexpected server response.');
            }
        })
        .catch(error => {
            console.error('Order submission error:', error);
            alert('Error submitting order: ' + error.message);
        });
    }
});

function fetchProducts() {
    fetch('/api/deliver')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const productContainer = document.getElementById('product-list');
            productContainer.innerHTML = ''; // Clear existing content

            if (products.length === 0) {
                productContainer.innerHTML = '<p>No products available to display.</p>';
                return;
            }

            // Loop through products and add to product container
            products.forEach(product => {
                const productElement = `
                    <div class="product">
                        <h3>${product.name || 'Unknown name'}</h3>
                        <p>${product.description || 'Description not available'}</p>
                        <span>${product.price || 'Price not available'} €</span>
                        ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Product'}" class="product-image" />` : ''}
                        <button class="order-btn" data-product-id="${product.id}">Add to Cart</button>
                        <button class="wishlist-btn" data-product-id="${product.id}">Add to Wishlist</button>
                    </div>`;
                productContainer.insertAdjacentHTML('beforeend', productElement);
            });

            // Add event listeners to "Add to Cart" buttons
            document.querySelectorAll('.order-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-product-id');
                    const product = products.find(p => p.id == productId);
                    addToCart(product);
                });
            });

            // Add event listeners to "Add to Wishlist" buttons
            document.querySelectorAll('.wishlist-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-product-id');
                    const product = products.find(p => p.id == productId);
                    addToWishlist(product);
                });
            });
        })
        .catch(error => console.error('Error loading products:', error));
}

// Function to display items currently in the cart
function displayCartItems(cart) {
    const cartItemsList = document.getElementById('cartItemsList');
    cartItemsList.innerHTML = '';  // Clear previous list
    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.quantity} x ${item.price}€`;
        cartItemsList.appendChild(li);
    });
}

// Function to add a product to the cart
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in the cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1; // Increment quantity if exists
    } else {
        cart.push({ ...product, quantity: 1 }); // Add new product with quantity 1
    }

    // Save updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update cart count display
}

// Function to update the cart item count display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    document.getElementById('cart-count').innerText = cart.length;
}

// Function to update the wishlist item count display
function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    document.getElementById('wishlist-count').innerText = wishlist.length;
}
