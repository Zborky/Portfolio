document.addEventListener('DOMContentLoaded', function() {
    // Select key elements from the DOM
    const fetchProductsButton = document.getElementById('fetchProducts'); // Button to fetch products
    const createProductForm = document.getElementById('createProductForm'); // Form to create a new product
    const updateProductForm = document.getElementById('updateProductForm'); // Form to update an existing product
    const deleteProductForm = document.getElementById('deleteProductForm'); // Form to delete a product
    const productList = document.getElementById('product-list'); // Container for displaying products

    // Verify that all the required elements exist in the DOM
    if (!fetchProductsButton || !createProductForm || !updateProductForm || !deleteProductForm || !productList) {
        console.error('Some elements were not found in the DOM.'); // Log an error and stop execution if elements are missing
        return;
    }

    // Function to fetch and display products from the API
    function fetchProducts() {
        fetch('/api/krytky') // Send a GET request to the API endpoint
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching products: ' + response.statusText); // Handle HTTP errors
                }
                return response.json(); // Parse the response JSON
            })
            .then(data => {
                productList.innerHTML = ''; // Clear the current product list

                // Check if the response contains a valid array of products
                if (data.$values && Array.isArray(data.$values)) {
                    data.$values.forEach(product => {
                        // Create a new element for each product and display its details
                        const productElement = document.createElement('div');
                        productElement.classList.add('product-item');
                        productElement.innerHTML = `
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Name:</strong> ${product.name}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                            <p><strong>Description:</strong> ${product.description}</p>
                            <p><strong>Quantity:</strong> ${product.quantity}</p>
                            ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name}" width="100" />` : ''}
                            <button class="edit-button" data-id="${product.id}">Edit</button>
                        `;
                        productList.appendChild(productElement); // Append the product to the list
                    });

                    // Attach click event listeners to all "Edit" buttons
                    document.querySelectorAll('.edit-button').forEach(button => {
                        button.addEventListener('click', function() {
                            const productId = this.getAttribute('data-id'); // Get the product ID from the button's data attribute
                            loadProductForEdit(productId); // Load the product details into the edit form
                        });
                    });
                } else {
                    console.error('Expected an array, but received:', data); // Handle unexpected API responses
                }
            })
            .catch(error => console.error('Error fetching products:', error)); // Handle errors during fetching
    }

    // Function to load product details into the update form for editing
    function loadProductForEdit(productId) {
        fetch(`/api/krytky/${productId}`) // Send a GET request for the specific product
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching product: ' + response.statusText); // Handle HTTP errors
                }
                return response.json(); // Parse the response JSON
            })
            .then(product => {
                // Populate the update form with the product data
                document.getElementById('updateProductId').value = product.id;
                document.getElementById('updateName').value = product.name;
                document.getElementById('updatePrice').value = product.price;
                document.getElementById('updateDescription').value = product.description;
                document.getElementById('updateQuantity').value = product.quantity;
            })
            .catch(error => console.error('Error fetching product for editing:', error)); // Handle errors during fetching
    }

    // Function to add a new product to the API
    function addProduct(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        const formData = new FormData(createProductForm); // Collect form data

        fetch('/api/krytky', {
            method: 'POST', // Send a POST request to add a product
            body: formData, // Include form data in the request body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error adding product: ' + response.statusText); // Handle HTTP errors
            }
            return response.json(); // Parse the response JSON
        })
        .then(data => {
            fetchProducts(); // Refresh the product list to include the new product
            createProductForm.reset(); // Reset the form fields
        })
        .catch(error => console.error('Error adding product:', error)); // Handle errors during the request
    }

    // Function to update an existing product
    function updateProduct(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        const formData = new FormData(updateProductForm); // Collect form data
        const productId = formData.get('id'); // Extract the product ID from the form data

        fetch(`/api/krytky/${productId}`, {
            method: 'PUT', // Send a PUT request to update the product
            body: formData, // Include form data in the request body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating product: ' + response.statusText); // Handle HTTP errors
            }
            return response.json(); // Parse the response JSON
        })
        .then(data => {
            fetchProducts(); // Refresh the product list to show updated details
            updateProductForm.reset(); // Reset the form fields
        })
        .catch(error => console.error('Error updating product:', error)); // Handle errors during the request
    }

    // Function to delete a product
    function deleteProduct(event) {
        event.preventDefault(); // Prevent the default form submission behavior
        const productId = document.getElementById('deleteProductId').value; // Get the product ID from the form input

        fetch(`/api/krytky/${productId}`, {
            method: 'DELETE', // Send a DELETE request to remove the product
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting product: ' + response.statusText); // Handle HTTP errors
            }
            return response.json(); // Parse the response JSON
        })
        .then(data => {
            fetchProducts(); // Refresh the product list to exclude the deleted product
            deleteProductForm.reset(); // Reset the form fields
        })
        .catch(error => console.error('Error deleting product:', error)); // Handle errors during the request
    }

    // Add event listeners for actions
    fetchProductsButton.addEventListener('click', fetchProducts); // Fetch products when the button is clicked
    createProductForm.addEventListener('submit', addProduct); // Add a new product when the form is submitted
    updateProductForm.addEventListener('submit', updateProduct); // Update a product when the form is submitted
    deleteProductForm.addEventListener('submit', deleteProduct); // Delete a product when the form is submitted
});
