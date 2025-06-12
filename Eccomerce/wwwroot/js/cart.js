document.addEventListener("DOMContentLoaded", () => {
    const showCartButton = document.getElementById("showCartButton");
    const orderForm = document.getElementById("orderForm");

    // Load products in the cart with images
    function fetchCartProducts() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = ''; // Clear existing items

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<li>Košík je prázdny.</li>';
        } else {
            cart.forEach(item => {
                const listItem = `
                    <li>
                        <img src="${item.image || 'assets/default.jpg'}" alt="${item.name}" class="cart-image" />
                        ${item.name || 'Neznámy názov'} - ${item.quantity} ks - ${item.price} €
                    </li>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', listItem);
            });
        }
    }

    // Show sidebar with cart products
    function showCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.getElementById('cart-items');
        cartItemsContainer.innerHTML = ''; // Clear existing items

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<li>Košík je prázdny.</li>';
        } else {
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

        cartSidebar.classList.add('active'); // Show the sidebar
    }

    // Hide the sidebar
    function hideCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        cartSidebar.classList.remove('active'); // Hide the sidebar
    }

    // Event listener for cart icon/button to show cart sidebar
    document.getElementById('cart').addEventListener('click', function(event) {
        event.preventDefault();
        showCartSidebar();
    });

    // Event listener for close button to hide cart sidebar
    document.getElementById('close-cart').addEventListener('click', function() {
        hideCartSidebar();
    });

    // Load cart products on page load
    fetchCartProducts();

    // Submit order form asynchronously
    orderForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Collect order data from form inputs and cart
        const orderData = {
            customerName: document.getElementById("customerName").value,
            customerEmail: document.getElementById("customerEmail").value,
            customerPhone: document.getElementById("customerPhone").value,
            address: {
                street: document.getElementById("street").value,
                city: document.getElementById("city").value,
                postalCode: document.getElementById("postalCode").value,
                country: document.getElementById("country").value,
            },
            courier: document.getElementById("courier").value, 
            cartItems: JSON.parse(localStorage.getItem("cart")) || []
        };

        try {
            // Send order data to the backend API
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });

            if (!response.ok) {
                throw new Error("Nepodarilo sa odoslať objednávku.");
            }

            alert("Objednávka bola úspešne odoslaná.");
            localStorage.removeItem("cart"); // Clear cart after successful order
        } catch (error) {
            console.error("Chyba pri odosielaní objednávky:", error);
            alert("Nastala chyba pri odosielaní objednávky.");
        }
    });
});
