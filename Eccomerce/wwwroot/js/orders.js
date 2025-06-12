document.addEventListener('DOMContentLoaded', () => {
    /* 
    This function is executed when the DOM is fully loaded. 
    - It initializes the cart by loading items from local storage.
    - Updates the cart count display based on the cart content.
    - Displays the cart items in the UI.
    - Fetches product data from the server.
    */
    const cart = getCart();
    updateCartCount(cart);
    displayCartItems(cart);
    fetchProducts();
});

// Function to load the cart from local storage
function getCart() {
    /*
    - Attempts to parse the 'cart' data from local storage.
    - If parsing fails, it catches the error and logs it, returning an empty array as a fallback.
    */
    try {
        return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error('Error parsing cart data:', e);
        return [];
    }
}

// Function to update the cart item count display
function updateCartCount(cart = getCart()) {
    /*
    - Updates the inner text of the cart count element with the number of items in the cart.
    - Checks if the element with ID 'cart-count' exists before attempting to update it.
    */
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = cart.length;
    }
}

// Function to fetch products from the server
function fetchProducts() {
    /*
    - Sends a GET request to fetch product data from the '/api/deliver' endpoint.
    - If the response is successful, parses the JSON and renders the products in the UI.
    - Logs errors if the request fails or if there are issues with the response.
    */
    fetch('/api/deliver')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const products = data.$values || [];
            renderProducts(products);
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Function to render products on the page
function renderProducts(products) {
    /*
    - Retrieves the product container element and clears its existing content.
    - If there are no products, displays a message indicating no products are available.
    - Iterates through the products and generates HTML for each product, adding it to the container.
    - Attaches event listeners to buttons for adding products to the cart and wishlist.
    */
    const productContainer = document.getElementById('product-list');
    if (!productContainer) {
        console.error('Element with ID "product-list" does not exist.');
        return;
    }

    productContainer.innerHTML = ''; // Clear existing content

    if (products.length === 0) {
        productContainer.innerHTML = '<p>No products available.</p>';
        return;
    }

    products.forEach(product => {
        const productElement = `
            <div class="product">
                <h3>${product.name || 'Unknown Name'}</h3>
                <p>${product.description || 'Description not available'}</p>
                <span>${product.price || 'Price not available'} €</span>
                ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Product'}" class="product-image" />` : ''}
                <button class="order-btn" data-product-id="${product.id}">Add to Cart</button>
                <button class="wishlist-btn" data-product-id="${product.id}">Add to Wishlist</button>
            </div>`;
        productContainer.insertAdjacentHTML('beforeend', productElement);
    });

    // Add event listeners to 'Add to Cart' buttons
    document.querySelectorAll('.order-btn').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            if (product) addToCart(product);
        });
    });

    // Add event listeners to 'Add to Wishlist' buttons
    document.querySelectorAll('.wishlist-btn').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-product-id');
            const product = products.find(p => p.id == productId);
            if (product) addToWishlist(product);
        });
    });
}

// Function to display cart items
function displayCartItems(cart = getCart()) {
    /*
    - Retrieves the cart items list element and clears its existing content.
    - If the cart is empty, displays a message indicating the cart is empty.
    - Iterates through the cart items and creates a list item for each, displaying the item name, quantity, and price.
    */
    const cartItemsList = document.getElementById('cartItemsList');
    if (!cartItemsList) {
        console.error('Element with ID "cartItemsList" does not exist.');
        return;
    }

    cartItemsList.innerHTML = ''; // Clear previous items
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>The cart is empty</li>';
        return;
    }

    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} - ${item.quantity} x ${item.price}€`;
        cartItemsList.appendChild(li);
    });
}

// Function to add a product to the cart
function addToCart(product) {
    /*
    - Checks if the product already exists in the cart. If it does, increments the quantity.
    - Otherwise, adds the product to the cart with a quantity of 1.
    - Updates the cart in local storage and refreshes the cart count.
    */
    const cart = getCart();

    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(cart);
}

// Event listener for submitting an order
document.getElementById('orderForm')?.addEventListener('submit', function (event) {
    /*
    - Prevents the default form submission behavior.
    - Retrieves form data and the cart items.
    - Validates that the cart is not empty before proceeding.
    - Sends the order data to the server using a POST request.
    - If successful, clears the cart and displays a success message.
    - Handles and logs errors if the request fails.
    */
    event.preventDefault();

    const formData = new FormData(event.target);
    const cart = getCart();

    if (cart.length === 0) {
        alert('The cart is empty!');
        return;
    }

    const orderItems = cart.map(item => ({
        Id: item.id,
        Quantity: item.quantity,
        Price: item.price,
        Name: item.name
    }));

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

    fetch('https://localhost:5285/api/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error('Server error: ' + text);
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Order submitted successfully!');
            localStorage.removeItem('cart');
            updateCartCount([]);
            displayCartItems([]);
        })
        .catch(error => {
            console.error('Error submitting order:', error);
            alert('Error submitting order: ' + error.message);
        });
});
