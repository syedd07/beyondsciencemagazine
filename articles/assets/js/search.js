document.getElementById('searchForm').addEventListener('submit', function(event) {
                        event.preventDefault(); // Prevent the form from submitting the traditional way
                
                        const query = document.getElementById('query').value.trim().toLowerCase();
                        const searchMap = {
                            'about': '/articles/about.html',
                            'contact': '/articles/contact.html',
                            'articles': '/articles/aritcles.html',
                            'books': './books.html',
                            'ebooks': './ebooks.html',
                            'current': './current.html',
                            'privacy': '/articles/privacy.html',
                            'abinayah': '/articles/abinayah.html',
                            'brooke': '/articles/brooke.html',
                            'ludmila': '/articles/ludmila.html',
                            'luis': '/articles/luis.html',
                            'vittoria': '/articles/vittoria.html',


                            // Add more mappings here as needed
                        };
                
                        if (query) {
                            const url = searchMap[query];
                            if (url) {
                                // Redirect to the corresponding page
                                window.location.href = url;
                            } else {
                                alert('No results found for: ' + query);
                            }
                        } else {
                            alert('Please enter a search term.');
                        }
                    });
            