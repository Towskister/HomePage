document.addEventListener('DOMContentLoaded', () => {
    const musicList = document.getElementById('music-list');
    const musicForm = document.getElementById('music-form');
    const trackNameInput = document.getElementById('track-name');
    const artistNameInput = document.getElementById('artist-name');
    const trackLinkInput = document.getElementById('track-link');
    const clearListButton = document.getElementById('clear-list');

    // Load saved tracks from localStorage
    const loadFavorites = () => {
        const savedTracks = JSON.parse(localStorage.getItem('favorites')) || [];
        savedTracks.forEach(track => addTrackToList(track));
    };

    // Save tracks to localStorage
    const saveFavorites = () => {
        const tracks = [...musicList.querySelectorAll('li')].map(li => ({
            name: li.querySelector('.track-name').textContent,
            artist: li.querySelector('.artist-name').textContent,
            link: li.querySelector('a').href
        }));
        localStorage.setItem('favorites', JSON.stringify(tracks));
    };

    // Add track to the list
    const addTrackToList = (track) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="track-name">${track.name}</span> by 
            <span class="artist-name">${track.artist}</span>
            <a href="${track.link}" target="_blank">Listen</a>
            <button class="remove-track">Remove</button>
        `;
        musicList.appendChild(li);

        // Add remove functionality
        li.querySelector('.remove-track').addEventListener('click', () => {
            li.remove();
            saveFavorites();
        });
    };

    // Handle form submission
    musicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const track = {
            name: trackNameInput.value,
            artist: artistNameInput.value,
            link: trackLinkInput.value
        };
        addTrackToList(track);
        saveFavorites();

        // Clear inputs
        trackNameInput.value = '';
        artistNameInput.value = '';
        trackLinkInput.value = '';
    });

    // Clear all favorites
    clearListButton.addEventListener('click', () => {
        musicList.innerHTML = '';
        localStorage.removeItem('favorites');
    });

    // Load favorites on page load
    loadFavorites();
});
