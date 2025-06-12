function fetchUsersAndOrders() {
    // Fetch users from backend API
    fetch('/api/users') // Make sure the URL matches your backend endpoint
        .then(response => response.json())
        .then(data => {
            console.log('API response for users:', data); // Debugging output

            // Depending on API response format, extract user list
            const users = data.$values || data || [];

            if (users.length === 0) {
                console.error('No users found.');
            } else {
                // Display users in the table
                displayUsers(users);
            }
        })
        .catch(error => console.error('Error loading users:', error));

    // Fetch orders from backend API
    fetch('/api/order') // Make sure the URL matches your backend endpoint
        .then(response => response.json())
        .then(data => {
            console.log('API response for orders:', data); // Debugging output

            // Depending on API response format, extract order list
            const orders = data.$values || data || [];

            if (orders.length === 0) {
                console.error('No orders found.');
            } else {
                // Display orders in the table
                displayOrders(orders);
            }
        })
        .catch(error => console.error('Error loading orders:', error));
}

// Function to display users data in the users table
function displayUsers(users) {
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = ''; // Clear previous table content

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>            
            <td>${user.email}</td>
            <td>${user.passwordHash}</td>
            <td>${user.role}</td>
        `;
        usersTable.appendChild(row);
    });
}

// Function to display orders data in the orders table
function displayOrders(orders) {
    const ordersTable = document.getElementById('ordersTable');
    ordersTable.innerHTML = ''; // Clear previous table content

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.customerEmail}</td>
            <td>${order.customerPhone}</td>
            <td>${order.total}</td>
            <td>${order.orderDate}</td>
            <td>${order.street}</td>
            <td>${order.city}</td>
            <td>${order.postalCode}</td>
            <td>${order.country}</td>
            <td>${order.kurier}</td>
            <td>${order.name}</td>
        `;
        ordersTable.appendChild(row);
    });
}

// Call the fetch function when the window loads to populate tables with data
window.onload = fetchUsersAndOrders;
