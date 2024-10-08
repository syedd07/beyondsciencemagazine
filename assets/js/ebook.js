document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const loader = document.getElementById('loader');
    const downloadSection = document.createElement('div');
    downloadSection.id = 'download-section';
    form.after(downloadSection);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        loader.style.display = 'block';

        const formData = new FormData(form);

        if (!formData.get('access_key')) {
            console.error('Web3Forms access key is missing. Please ensure it\'s set up correctly.');
            return;
        }

        const selectedEdition = formData.get('E-book');

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loader.style.display = 'none';
            if (data.success) {
                const downloadLink = document.createElement('a');
                downloadLink.href = selectedEdition === 'November Edition' 
                    ? 'assets/books/November Edition.pdf' 
                    : 'assets/books/January Edition.pdf';
                downloadLink.textContent = `Download Now!`;
                downloadLink.className = 'button';
                downloadSection.innerHTML = '';
                downloadSection.appendChild(downloadLink);
                downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                downloadSection.textContent = 'There was an error. Please try again.';
            }
        })
        .catch(error => {
            loader.style.display = 'none';
            downloadSection.textContent = 'There was an error. Please try again.';
            console.error('Error:', error);
        });
    });
});