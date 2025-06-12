document.addEventListener("DOMContentLoaded", function () {
    const reviewForm = document.getElementById("reviewForm");
    const reviewList = document.getElementById("reviewsTable");

    // Načíta recenzie z backendu
    function loadReviews() {
        fetch('/api/review')
            .then(response => {
                if (!response.ok) throw new Error('Chyba pri načítaní recenzií.');
                return response.json();
            })
            .then(data => {
                const reviews = data.$values || [];
                reviewList.innerHTML = ''; // Vyčisti tabuľku

                reviews.forEach(review => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${review.name}</td>
                        <td>${review.email}</td>
                        <td>${review.product || 'N/A'}</td>
                        <td>${review.text}</td>
                        <td>${review.rating}</td>
                        <td><button class="delete-btn" data-id="${review.id}">Vymazať</button></td>
                    `;
                    reviewList.appendChild(row);
                });

                // Pripojenie udalostí k delete tlačidlám (po načítaní DOMu)
                document.querySelectorAll('.delete-btn').forEach(button => {
                    button.addEventListener('click', function () {
                        const id = this.getAttribute('data-id');
                        if (confirm("Naozaj chceš vymazať túto recenziu?")) {
                            fetch('/api/review/' + id, {
                                method: 'DELETE'
                            })
                            .then(response => {
                                if (!response.ok) throw new Error('Chyba pri mazaní recenzie.');
                                return;
                            })
                            .then(data => {
                                alert('Recenzia bola úspešne vymazaná.');
                                loadReviews();
                            })
                            .catch(error => {
                                console.error('Chyba pri mazaní recenzie:', error);
                                alert('Nepodarilo sa vymazať recenziu.');
                            });
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Chyba pri načítaní recenzií:', error);
                alert('Nepodarilo sa načítať recenzie, skúste znova.');
            });
    }

    // Odoslanie recenzie do backendu
    reviewForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const reviewData = {
            name: document.getElementById('reviewName').value,
            email: document.getElementById('reviewEmail').value,
            product: document.getElementById('reviewProduct').value,
            text: document.getElementById('reviewText').value,
            rating: parseInt(document.getElementById('reviewRating').value.trim())
        };

        if (!reviewData.name || !reviewData.email || !reviewData.product || !reviewData.text || !reviewData.rating) {
            alert('Prosím, vyplňte všetky polia.');
            return;
        }

        fetch('/api/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Chyba pri odoslaní recenzie.');
            return response.json();
        })
        .then(data => {
            alert('Recenzia bola úspešne odoslaná!');
            reviewForm.reset();
            loadReviews();
        })
        .catch(error => {
            console.error('Chyba pri odoslaní recenzie:', error);
            alert('Nepodarilo sa odoslať recenziu, skúste znova.');
        });
    });

    loadReviews();
});
