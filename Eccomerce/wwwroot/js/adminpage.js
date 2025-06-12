document.addEventListener('DOMContentLoaded', function() {
    const fetchProductsButton = document.getElementById('fetchProducts');
    const createProductForm = document.getElementById('createProductForm');
    const updateProductForm = document.getElementById('updateProductForm');
    const deleteProductForm = document.getElementById('deleteProductForm');
    const productList = document.getElementById('product-list');

    
    if (!fetchProductsButton || !createProductForm || !updateProductForm || !deleteProductForm || !productList) {
        console.error('Niektoré elementy neboli nájdené v DOM.');
        return;
    }

   
    function fetchProducts() {
        fetch('/api/products')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Chyba pri načítaní produktov: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                productList.innerHTML = ''; // Clean list of products
                if (data.$values && Array.isArray(data.$values)) { //Check if data.$values is array
                    data.$values.forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.classList.add('product-item');
                        productElement.innerHTML = `
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Názov:</strong> ${product.name}</p>
                            <p><strong>Cena:</strong> ${product.price}</p>
                            <p><strong>Popis:</strong> ${product.description}</p>
                            <p><strong>Množstvo:</strong> ${product.quantity}</p>
                            <p><strong>Category:</strong> ${product.category}</p>
                            ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name}" width="100" />` : ''}
                            <button class="edit-button" data-id="${product.id}">Upraviť</button>
                        `;
                        productList.appendChild(productElement);
                    });

                    // Add event button to edit form
                    document.querySelectorAll('.edit-button').forEach(button => {
                        button.addEventListener('click', function() {
                            const productId = this.getAttribute('data-id');
                            loadProductForEdit(productId);
                        });
                    });
                } else {
                    console.error('Očakávalo sa pole, ale dostali sme:', data);
                }
            })
            .catch(error => console.error('Chyba pri načítaní produktov:', error));
    }

    // Function to load product for edit to form
    function loadProductForEdit(productId) {
        fetch(`/api/products/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Chyba pri načítaní produktu: ' + response.statusText);
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
            .catch(error => console.error('Chyba pri načítaní produktu na úpravu:', error));
    }

    // Function to add product
    function addProduct(event) {
        event.preventDefault();
        const formData = new FormData(createProductForm);

        fetch('/api/trendy', {
            method: 'POST',
            body: formData,  // Send form data 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Chyba pri pridávaní produktu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // refrest list of procuts
            createProductForm.reset(); // Clean form after add product
        })
        .catch(error => console.error('Chyba pri pridávaní produktu:', error));
    }

    // Function to update product
    function updateProduct(event) {
        event.preventDefault();
        const formData = new FormData(updateProductForm);
        const productId = formData.get('id');  // Get ID of products

        fetch(`/api/products/${productId}`, {
            method: 'PUT',
            body: formData,  //Send Form Data
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Chyba pri aktualizácii produktu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh products list
            updateProductForm.reset(); //Clean form after update products
        })
        .catch(error => console.error('Chyba pri aktualizácii produktu:', error));
    }

    // Delete products
    function deleteProduct(event) {
        event.preventDefault();
        const productId = document.getElementById('deleteProductId').value;

        fetch(`/api/products/${productId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Chyba pri odstraňovaní produktu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); // Refresh list of procuct
            deleteProductForm.reset(); // Clean form after delete products
        })
        .catch(error => console.error('Chyba pri odstraňovaní produktu:', error));
    }

    // Add events to send form
    createProductForm.addEventListener('submit', addProduct);
    updateProductForm.addEventListener('submit', updateProduct);
    deleteProductForm.addEventListener('submit', deleteProduct);
    fetchProductsButton.addEventListener('click', fetchProducts);
});