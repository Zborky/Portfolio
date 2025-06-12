document.addEventListener('DOMContentLoaded', function() {
    const fetchProductsButton = document.getElementById('fetchProducts');
    const createProductForm = document.getElementById('createProductForm');
    const updateProductForm = document.getElementById('updateProductForm');
    const deleteProductForm = document.getElementById('deleteProductForm');
    const productList = document.getElementById('product-list');

    // Check if all elements exist in the DOM
    if (!fetchProductsButton || !createProductForm || !updateProductForm || !deleteProductForm || !productList) {
        console.error('Some elements were not found in the DOM.');
        return;
    }

    // Function to fetch and display the list of products
    function fetchProducts() {
        fetch('/api/trendy')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching products: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                productList.innerHTML = ''; // Clear the product list
                if (data.$values && Array.isArray(data.$values)) { // Check if data.$values is an array
                    data.$values.forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.classList.add('product-item');
                        productElement.innerHTML = `
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Name:</strong> ${product.name}</p>
                            <p><strong>Price:</strong> ${product.price}</p>
                            <p><strong>Category:</strong> ${product.category}</p>
                            <p><strong>Description:</strong> ${product.description}</p>
                            <p><strong>Quantity:</strong> ${product.quantity}</p>
                            ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name}" width="100" />` : ''}
                            <button class="edit-button" data-id="${product.id}">Edit</button>
                        `;
                        productList.appendChild(productElement);
                    });

                    // Add event listeners for product edit buttons
                    document.querySelectorAll('.edit-button').forEach(button => {
                        button.addEventListener('click', function() {
                            const productId = this.getAttribute('data-id');
                            loadProductForEdit(productId);
                        });
                    });
                } else {
                    console.error('Expected an array but received:', data);
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Function to load a product into the edit form
    function loadProductForEdit(productId) {
        fetch(`/api/trendy/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching product: ' + response.statusText);
                }
                return response.json();
            })
            .then(product => {
                document.getElementById('updateProductId').value = product.id;
                document.getElementById('updateName').value = product.name;
                document.getElementById('updatePrice').value = product.price;
                document.getElementById('updateDescription').value = product.description;
                document.getElementById('updateQuantity').value = product.quantity;
            })
            .catch(error => console.error('Error loading product for editing:', error));
    }

    // Function to add a new product
    function addProduct(event) {
        event.preventDefault();
        const formData = new FormData(createProductForm);

        fetch('/api/trendy', {
            method: 'POST',
            body: formData,  // Send FormData directly
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error adding product: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh the product list
            createProductForm.reset(); // Reset the form after adding the product
        })
        .catch(error => console.error('Error adding product:', error));
    }

    // Function to update an existing product
    function updateProduct(event) {
        event.preventDefault();
        const formData = new FormData(updateProductForm);
        const productId = formData.get('id');  // Get the product ID

        fetch(`/api/trendy/${productId}`, {
            method: 'PUT',
            body: formData,  // Send FormData directly
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error updating product: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh the product list
            updateProductForm.reset(); // Reset the form after updating the product
        })
        .catch(error => console.error('Error updating product:', error));
    }

    // Function to delete a product
    function deleteProduct(event) {
        event.preventDefault();
        const productId = document.getElementById('deleteProductId').value;

        fetch(`/api/trendy/${productId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error deleting product: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh the product list
            deleteProductForm.reset(); // Reset the form after deleting the product
        })
        .catch(error => console.error('Error deleting product:', error));
    }

    // Add event listeners
    fetchProductsButton.addEventListener('click', fetchProducts);
    createProductForm.addEventListener('submit', addProduct);
    updateProductForm.addEventListener('submit', updateProduct);
    deleteProductForm.addEventListener('submit', deleteProduct);
});
