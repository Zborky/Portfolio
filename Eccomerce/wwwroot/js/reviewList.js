document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("reviewForm");
    const reviewList = document.getElementById("reviewsTable");

    // Load reviews from the backend
    function loadReviews() {
        fetch('/api/review')
            .then(response => {
                if (!response.ok) throw new Error('Error loading reviews.'); // Check if response is successful
                return response.json();
            })
            .then(data => {
                const reviews = data.$values || [];  // Get array of reviews
                reviewList.innerHTML = '';           // Clear the table before inserting new reviews

                // For each review create a new table row
                reviews.forEach(review => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${review.name}</td>
                        <td>${review.email}</td>
                        <td>${review.product || 'N/A'}</td>
                        <td>${review.text}</td>
                        <td>${review.rating}</td>
                        <td><button class="delete-btn" data-id="${review.id}">Delete</button></td>
                    `;
                    reviewList.appendChild(row);  // Add row to the table
                });

                // Attach event listeners to delete buttons (after DOM is loaded)
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const id = this.getAttribute('data-id');
                        if (confirm("Are you sure you want to delete this review?")) {
                            // Send DELETE request to remove the review
                            fetch('/api/review/' + id, {
                                method: 'DELETE'
                            })
                            .then(response => {
                                if (!response.ok) throw new Error('Error deleting review.');
                                return;
                            })
                            .then(data => {
                                alert('Review was successfully deleted.');
                                loadReviews();  // Reload reviews after deletion
                            })
                            .catch(error => {
                                console.error('Error deleting review:', error);
                                alert('Failed to delete the review.');
                            });
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error loading reviews:', error);
                alert('Failed to load reviews, please try again.');
            });
    }

    // Submit review to the backend
    reviewForm.addEventListener('submit', function (event) {
        event.preventDefault();  // Prevent default form submission

        // Get values from the form
        const reviewData = {
            name: document.getElementById('reviewName').value,
            email: document.getElementById('reviewEmail').value,
            product: document.getElementById('reviewProduct').value,
            text: document.getElementById('reviewText').value,
            rating: parseInt(document.getElementById('reviewRating').value.trim())  // Convert rating to number
        };

        // Check if all fields are filled
        if (!reviewData.name || !reviewData.email || !reviewData.product || !reviewData.text || !reviewData.rating) {
            alert('Please fill in all fields.');
            return;
        }

        // Send POST request to backend with review data in request body
        fetch('/api/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  // Set correct content type
            },
            body: JSON.stringify(reviewData)       // Convert data to JSON
        })
        .then(response => {
            if (!response.ok) throw new Error('Error submitting review.');
            return response.json();
        })
        .then(data => {
            alert('Review submitted successfully!');
            reviewForm.reset();  // Clear the form after successful submission
            loadReviews();       // Reload reviews including the new one
        })
        .catch(error => {
            console.error('Error submitting review:', error);
            alert('Failed to submit review, please try again.');
        });
    });

    loadReviews();  // Load reviews when the page loads
});
