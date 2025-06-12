function fetchProducts() {
    fetch('/api/capes')
        .then(response => response.json())
        .then(data => {
            const cases = data.$values || [];
            displayProducts(cases);
        })
        .catch(error => console.error('Chyba pri načítaní produktov:', error));
}
//this is same like produktyy.js
function displayProducts(products) {
    const productContainer = document.getElementById('product-list');
    
    if (products.length === 0) {
        productContainer.innerHTML = '<p>Žiadne produkty na zobrazenie.</p>';
        return;
    }

    products.forEach(product => {
        const availabilityStatus = product.quantity > 0 ? 'Dostupný' : 'Nie je dostupný';
        const availabilityClass = product.quantity > 0 ? 'available' : 'not-available';
    
        const productElement = `
            <div class="product">
                <h3>${product.name || 'Neznámy názov'}</h3>
                <p>${product.description || 'Popis nie je dostupný'}</p>
                <h4>${product.category || 'Kategória nie je dostupná'}</h4>
                <span>${product.price || 'Cena nie je dostupná'} €</span>                        
                ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name || 'Produkt'}" class="product-image" />` : ''}
                <p class="${availabilityClass}">${availabilityStatus}</p>
                <button class="order-btn" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>Pridať do košíka</button>
                <button class="wishlist-btn" data-product-id="${product.id}">Pridať do wishlistu</button>
                <a href="/produkt.html?id=${product.id}" class="btn">Zobraziť detail</a>
            </div>`;
        productContainer.insertAdjacentHTML('beforeend', productElement);
    });

    attachEventListeners(products); 
}

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

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); 
}

document.getElementById('continue-to-order').addEventListener('click', function() {
    window.location.href = 'order.html'; 
});

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

function addToWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const existingProductIndex = wishlist.findIndex(item => item.id === product.id);
    if (existingProductIndex < 0) {
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount(); 
        alert(`${product.name} bol pridaný do wishlistu.`);
    }
}

function updateWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistCount = wishlist.length;
    document.getElementById('wishlist-count').textContent = wishlistCount;
}

function showCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<li>Košík je prázdny.</li>';
    } else {
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

    cartSidebar.classList.add('active');
    attachRemoveButtonListeners();
}

function attachRemoveButtonListeners() {
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            removeFromCart(productId);
        });
    });
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== parseInt(productId, 10));
    localStorage.setItem('cart', JSON.stringify(cart));
    showCartSidebar();
}

function hideCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.remove('active');
}

function sortProducts(products, order) {
    if (order === 'asc') {
        return products.sort((a, b) => a.price - b.price);
    } else if (order === 'desc') {
        return products.sort((a, b) => b.price - a.price);
    }
    return products;
}

document.getElementById('sort-asc').addEventListener('click', function() {
    fetch('/api/capes')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'asc');
            document.getElementById('product-list').innerHTML = '';
            displayProducts(sortedProducts);
        })
        .catch(error => console.error('Chyba pri zoradení produktov:', error));
});

document.getElementById('sort-desc').addEventListener('click', function() {
    fetch('/api/capes')
        .then(response => response.json())
        .then(data => {
            const products = data.$values || [];
            const sortedProducts = sortProducts(products, 'desc');
            document.getElementById('product-list').innerHTML = '';
            displayProducts(sortedProducts);
        })
        .catch(error => console.error('Chyba pri zoradení produktov:', error));
});

document.getElementById('cart').addEventListener('click', function(event) {
    event.preventDefault();
    showCartSidebar();
});

document.getElementById('close-cart').addEventListener('click', function() {
    hideCartSidebar();
});

document.addEventListener('DOMContentLoaded', function() {            
    fetchProducts();
    updateCartCount();
    updateWishlistCount();
});