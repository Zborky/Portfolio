document.addEventListener('DOMContentLoaded', function() {
    // Get references to key elements in the DOM
    const fetchProductsButton = document.getElementById('fetchProducts');
    const createProductForm = document.getElementById('createProductForm');
    const updateProductForm = document.getElementById('updateProductForm');
    const deleteProductForm = document.getElementById('deleteProductForm');
    const productList = document.getElementById('product-list');

    // Check if all required elements exist to avoid runtime errors
    if (!fetchProductsButton || !createProductForm || !updateProductForm || !deleteProductForm || !productList) {
        console.error('Some elements were not found in the DOM.');
        return;  // Stop script if elements are missing
    }

    // Function to fetch all products from the API and display them
    function fetchProducts() {
        fetch('/api/capes')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching products: ' + response.statusText);
                }
                return response.json();  // Parse JSON response
            })
            .then(data => {
                productList.innerHTML = ''; // Clear current product list
                if (data && Array.isArray(data)) {  // Ensure data is an array
                    data.forEach(product => {
                        // Create a container div for each product
                        const productElement = document.createElement('div');
                        productElement.classList.add('product-item');
                        // Fill product info inside the div, including image if available
                        productElement.innerHTML = `
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Name:</strong> ${product.name}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                            <p><strong>Description:</strong> ${product.description}</p>
                            <p><strong>Quantity:</strong> ${product.quantity}</p>
                            ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name}" width="100" />` : ''}
                            <button class="edit-button" data-id="${product.id}">Edit</button>
                        `;
                        productList.appendChild(productElement); // Add product div to product list container
                    });

                    // Attach click event listeners to all "Edit" buttons
                    document.querySelectorAll('.edit-button').forEach(button => {
                        button.addEventListener('click', function() {
                            const productId = this.getAttribute('data-id');
                            loadProductForEdit(productId);  // Load product details into the update form
                        });
                    });
                } else {
                    console.error('Expected an array, but received:', data);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Function to load a single product's details into the update form for editing
    function loadProductForEdit(productId) {
        fetch(`/api/capes/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error loading product: ' + response.statusText);
                }
                return response.json();  // Parse JSON response
            })
            .then(product => {
                // Populate update form fields with product details
                document.getElementById('updateProductId').value = product.id;
                document.getElementById('updateName').value = product.name;
                document.getElementById('updatePrice').value = product.price;
                document.getElementById('updateDescription').value = product.description;
                document.getElementById('updateQuantity').value = product.quantity;
            })
            .catch(error => console.error('Error loading product for edit:', error));
    }

    // Function to handle adding a new product via form submission
    function addProduct(event) {
        event.preventDefault();  // Prevent default form submission behavior (page reload)
        const formData = new FormData(createProductForm);  // Collect form data

        fetch('/api/capes', {
            method: 'POST',
            body: formData,  // Send form data directly, including files if any
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error adding product: ' + response.statusText);
            }
            return response.json();  // Parse response JSON
        })
        .then(data => {
            fetchProducts();         // Refresh product list to include the new product
            createProductForm.reset(); // Clear form fields after successful addition
        })
        .catch(error => console.error('Error adding product:', error));
    }

    // Function to handle updating an existing product via form submission
    function updateProduct(event) {
        event.preventDefault();  // Prevent form reload
        const formData = new FormData(updateProductForm);  // Collect updated data
        const productId = formData.get('id');  // Extract product ID from form

        fetch(`/api/capes/${productId}`, {
            method: 'PUT',
            body: formData,  // Send updated data as FormData (can include files)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating product: ' + response.statusText);
            }
            return response.json();  // Parse response JSON
        })
        .then(data => {
            fetchProducts();         // Refresh the product list after update
            updateProductForm.reset(); // Clear the update form
        })
        .catch(error => console.error('Error updating product:', error));
    }

    // Function to handle deleting a product via form submission
    function deleteProduct(event) {
        event.preventDefault();  // Prevent page reload on form submission
        const productId = document.getElementById('deleteProductId').value;  // Get product ID to delete

        fetch(`/api/capes/${productId}`, {
            method: 'DELETE',  // Use HTTP DELETE method
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting product: ' + response.statusText);
            }
            return response.json();  // Parse response JSON
        })
        .then(data => {
            fetchProducts();         // Refresh product list after deletion
            deleteProductForm.reset(); // Clear the delete form input
        })
        .catch(error => console.error('Error deleting product:', error));
    }

    // Attach event listeners to buttons and forms
    fetchProductsButton.addEventListener('click', fetchProducts);
    createProductForm.addEventListener('submit', addProduct);
    updateProductForm.addEventListener('submit', updateProduct);
    deleteProductForm.addEventListener('submit', deleteProduct);
});
