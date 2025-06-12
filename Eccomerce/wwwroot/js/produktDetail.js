document.addEventListener("DOMContentLoaded", function() {
    // Get the container element where product details will be displayed
    const productDetails = document.getElementById("product-details");

    // Get the product ID from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    // If no product ID is found in the URL, display a message and stop execution
    if (!productId) {
        productDetails.innerHTML = "<p>Produkt sa nenašiel.</p>";  // Product not found message
        return;
    }

    // Fetch product data from the API using the product ID
    fetch(`/api/products/${productId}`) 
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            // Determine availability status text and CSS class based on quantity
            const availabilityStatus = data.quantity > 0 ? 'Dostupný' : 'Nie je dostupný';
            const availabilityClass = data.quantity <= 0 ? 'unavailable' : 'available';

            // Render product details inside the container element
            productDetails.innerHTML = `
                <div class="product-container">
                    <div class="product-image">
                        <img src="${data.imagePath}" alt="${data.name}" />
                    </div>
                    <div class="product-info">
                        <h3>${data.name || 'Neznámy názov'}</h3>
                        <p class="description">${data.description || 'Popis nie je dostupný'}</p>
                        <span class="price">${data.price || 'Cena nie je dostupná'} €</span>
                        <p class="availability ${availabilityClass}">${availabilityStatus}</p>
                        <button class="order-btn" data-product-id="${data.id}" ${data.quantity === 0 ? 'disabled' : ''}>Pridať do košíka</button>
                        <button class="wishlist-btn" data-product-id="${data.id}">Pridať do wishlistu</button>
                    </div>
                </div>`;
            
            // Attach click event listener to the "Add to cart" button
            document.querySelector(".order-btn").addEventListener("click", () => {
                addToCart(data);  // Call function to add product to cart
            });
        })
        .catch(error => {
            // Log any errors that occur during fetching and show error message
            console.error("Chyba pri načítaní detailov produktu:", error);
            productDetails.innerHTML = "<p>Chyba pri načítaní detailov produktu.</p>";
        });

    // Function to add a product to the shopping cart stored in localStorage
    function addToCart(product) {
        // Retrieve current cart from localStorage or initialize as empty array
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        // Check if the product already exists in the cart
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex >= 0) {
            // If product exists, increase the quantity by 1
            cart[existingProductIndex].quantity += 1;
        } else {
            // Otherwise, add new product to the cart with quantity 1
            cart.push({ ...product, quantity: 1 });
        }
        // Save updated cart back to localStorage
        localStorage.setItem("cart", JSON.stringify(cart));
        // Notify the user that the product has been added
        alert("Produkt bol pridaný do košíka.");
    }
});
