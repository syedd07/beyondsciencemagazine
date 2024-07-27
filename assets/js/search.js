document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const query = document.getElementById('query').value;
    if (query) {
        // Here you can define what to do with the search query
        // For example, display an alert or redirect to a search results page
        alert('Searching for: ' + query);

        // Example: Redirect to a search results page
        // window.location.href = 'search-results.html?query=' + encodeURIComponent(query);
    } else {
        alert('Please enter a search term.');
    }
});
