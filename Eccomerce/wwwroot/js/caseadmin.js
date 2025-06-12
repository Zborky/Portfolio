document.addEventListener('DOMContentLoaded', function() {
    const fetchProductsButton = document.getElementById('fetchProducts');
    const createProductForm = document.getElementById('createProductForm');
    const updateProductForm = document.getElementById('updateProductForm');
    const deleteProductForm = document.getElementById('deleteProductForm');
    const productList = document.getElementById('product-list');

   //this is same like admin.js

    if (!fetchProductsButton || !createProductForm || !updateProductForm || !deleteProductForm || !productList) {
        console.error('Niektoré elementy neboli nájdené v DOM.');
        return;
    }

  
    function fetchProducts() {
        fetch('/api/cases')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Chyba pri načítaní produktov: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                productList.innerHTML = '';
                if (data.$values && Array.isArray(data.$values)) { 
                    data.$values.forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.classList.add('product-item');
                        productElement.innerHTML = `
                            <p><strong>ID:</strong> ${product.id}</p>
                            <p><strong>Názov:</strong> ${product.name}</p>
                            <p><strong>Cena:</strong> ${product.price}</p>
                            <p><strong>Popis:</strong> ${product.description}</p>
                            <p><strong>Množstvo:</strong> ${product.quantity}</p>
                            ${product.imagePath ? `<img src="${product.imagePath}" alt="${product.name}" width="100" />` : ''}
                            <button class="edit-button" data-id="${product.id}">Upraviť</button>
                        `;
                        productList.appendChild(productElement);
                    });

                    
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

    
    function loadProductForEdit(productId) {
        fetch(`/api/cases/${productId}`)
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

    
    function addProduct(event) {
        event.preventDefault();
        const formData = new FormData(createProductForm);

        fetch('/api/cases', {
            method: 'POST',
            body: formData,  
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Chyba pri pridávaní produktu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); 
            createProductForm.reset(); 
        })
        .catch(error => console.error('Chyba pri pridávaní produktu:', error));
    }

    
    function updateProduct(event) {
        event.preventDefault();
        const formData = new FormData(updateProductForm);
        const productId = formData.get('id');  

        fetch(`/api/cases/${productId}`, {
            method: 'PUT',
            body: formData,  
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Chyba pri aktualizácii produktu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); 
            updateProductForm.reset(); 
        })
        .catch(error => console.error('Chyba pri aktualizácii produktu:', error));
    }

    
    function deleteProduct(event) {
        event.preventDefault();
        const productId = document.getElementById('deleteProductId').value;

        fetch(`/api/cases/${productId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Chyba pri odstraňovaní produktu: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            fetchProducts(); 
            deleteProductForm.reset(); 
        })
        .catch(error => console.error('Chyba pri odstraňovaní produktu:', error));
    }

    
    fetchProductsButton.addEventListener('click', fetchProducts);
    createProductForm.addEventListener('submit', addProduct);
    updateProductForm.addEventListener('submit', updateProduct);
    deleteProductForm.addEventListener('submit', deleteProduct);
});