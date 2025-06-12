document.addEventListener('DOMContentLoaded', function() {
    // Get references to key elements in the DOM
    const fetchProductsButton = document.getElementById('fetchProducts');
    const createProductForm = document.getElementById('createProductForm');
    const updateProductForm = document.getElementById('updateProductForm');
    const deleteProductForm = document.getElementById('deleteProductForm');
    const productList = document.getElementById('product-list');

    // Check if all required elements exist in the DOM
    if (!fetchProductsButton || !createProductForm || !updateProductForm || !deleteProductForm || !productList) {
        console.error('Some elements were not found in the DOM.');
        return; // Exit the function if elements are missing
    }

    // Function to fetch and display products
    function fetchProducts() {
        fetch('/api/products') // Send a request to fetch products
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching products: ' + response.statusText);
                }
                return response.json(); // Parse the response as JSON
            })
            .then(data => {
                productList.innerHTML = ''; // Clear the product list

                // Check if the response contains an array of products
                if (data.$values && Array.isArray(data.$values)) {
                    // Iterate through the product array and create HTML elements
                    data.$values.forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.classList.add('product-item'); // Add a CSS class for styling
                        productElement.innerHTML = `
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Name:</strong> ${product.name}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                            <p><strong>Description:</strong> ${product.description}</p>
                            <p><strong>Quantity:</strong> ${product.quantity}</p>
                            ${
                                product.imagePath 
                                ? `<img src="${product.imagePath}" alt="${product.name}" width="100" />` 
                                : ''
                            }
                            <button class="edit-button" data-id="${product.id}">Edit</button>
                        `;
                        productList.appendChild(productElement);
                    });

                    // Attach click event listeners to "Edit" buttons
                    document.querySelectorAll('.edit-button').forEach(button => {
                        button.addEventListener('click', function() {
                            const productId = this.getAttribute('data-id');
                            loadProductForEdit(productId); // Load product details for editing
                        });
                    });
                } else {
                    console.error('Expected an array but received:', data);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Function to load a product's details into the edit form
    function loadProductForEdit(productId) {
        fetch(`/api/products/${productId}`) // Request details for a specific product
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching product: ' + response.statusText);
                }
                return response.json(); // Parse the product data
            })
            .then(product => {
                // Populate the edit form with product details
                document.getElementById('updateProductId').value = product.id;
                document.getElementById('updateName').value = product.name;
                document.getElementById('updatePrice').value = product.price;
                document.getElementById('updateDescription').value = product.description;
                document.getElementById('updateQuantity').value = product.quantity;
            })
            .catch(error => console.error('Error loading product for edit:', error));
    }

    // Function to add a new product
    function addProduct(event) {
        event.preventDefault(); // Prevent the form from submitting normally
        const formData = new FormData(createProductForm); // Collect form data

        fetch('/api/trendy', {
            method: 'POST', // Use POST for creating a new product
            body: formData, // Send the form data as the request body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error adding product: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh the product list
            createProductForm.reset(); // Clear the form after submission
        })
        .catch(error => console.error('Error adding product:', error));
    }

    // Function to update an existing product
    function updateProduct(event) {
        event.preventDefault(); // Prevent the form from submitting normally
        const formData = new FormData(updateProductForm); // Collect form data
        const productId = formData.get('id'); // Get the product ID

        fetch(`/api/products/${productId}`, {
            method: 'PUT', // Use PUT for updating a product
            body: formData, // Send the form data as the request body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating product: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh the product list
            updateProductForm.reset(); // Clear the form after submission
        })
        .catch(error => console.error('Error updating product:', error));
    }

    // Function to delete a product
    function deleteProduct(event) {
        event.preventDefault(); // Prevent the form from submitting normally
        const productId = document.getElementById('deleteProductId').value; // Get the product ID

        fetch(`/api/products/${productId}`, {
            method: 'DELETE', // Use DELETE for removing a product
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting product: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh the product list
            deleteProductForm.reset(); // Clear the form after submission
        })
        .catch(error => console.error('Error deleting product:', error));
    }

    // Attach event listeners to forms and buttons
    createProductForm.addEventListener('submit', addProduct);
    updateProductForm.addEventListener('submit', updateProduct);
    deleteProductForm.addEventListener('submit', deleteProduct);
    fetchProductsButton.addEventListener('click', fetchProducts);
});
