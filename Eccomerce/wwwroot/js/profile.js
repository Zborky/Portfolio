document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Attempt to fetch the user profile data from the '/account/profile' endpoint
        const profileResponse = await fetch('/account/profile'); // Fetch without token authorization

        // Check if the response is not OK (status code outside the range 200–299)
        if (!profileResponse.ok) {
            throw new Error(`HTTP error! status: ${profileResponse.status}`); // Throw an error for handling
        }

        // Parse the response JSON to extract user information
        const user = await profileResponse.json();

        // Populate the form fields with the retrieved user data
        document.getElementById("username").value = user.username || ''; // Fill username or set to an empty string
        document.getElementById("email").value = user.email || '';       // Fill email or set to an empty string
        document.getElementById("role").value = user.role || '';         // Fill role or set to an empty string

    } catch (error) {
        // Log the error to the console and display an alert for the user
        console.error('Error while fetching the profile:', error);
        alert('Failed to load profile. Please try again later.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Fetch orders from the '/account/orders' endpoint
    fetch('/account/orders')
        .then(response => response.json()) // Parse the JSON response
        .then(data => {
            const orders = data.$values; // Access the array of orders
            console.log('Orders response:', orders); // Log the response for debugging

            // Validate if the retrieved data is an array
            if (!Array.isArray(orders)) {
                console.error('Orders is not an array:', orders); // Log an error if not an array
                return; // Stop further execution
            }

            // Locate the container element where orders will be displayed
            const ordersContainer = document.getElementById('orders-container');
            if (!ordersContainer) {
                console.error('Element with ID "orders-container" not found.'); // Log if the container is missing
                return; // Stop further execution
            }

            // Clear the existing content in the container
            ordersContainer.innerHTML = '';

            // Loop through each order and create an HTML structure for it
            orders.forEach(order => {
                const orderElement = document.createElement('div'); // Create a new div for the order
                orderElement.classList.add('order-item'); // Add a CSS class for styling
                orderElement.innerHTML = `
                    <p><strong>ID:</strong> ${order.id}</p>
                    <p><strong>Customer Name:</strong> ${order.customerName}</p>
                    <p><strong>Email:</strong> ${order.customerEmail}</p>
                    <p><strong>Phone Number:</strong> ${order.customerPhone}</p>
                    <p><strong>Total:</strong> ${order.total}</p>
                    <p><strong>Products:</strong> ${order.name}</p>
                    <p><strong>Order Date:</strong> ${order.orderDate}</p>
                    <p><strong>Street:</strong> ${order.street}</p>
                    <p><strong>City:</strong> ${order.city}</p>
                    <p><strong>Postal Code:</strong> ${order.postalCode}</p>
                    <p><strong>Country:</strong> ${order.country}</p>
                    <p><strong>Courier:</strong> ${order.kurier}</p>
                `; // Add details of the order
                ordersContainer.appendChild(orderElement); // Append the order to the container
            });
        })
        .catch(error => console.error('Error while fetching orders:', error)); // Log any errors during fetch
});
