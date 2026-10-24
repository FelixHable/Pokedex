'use strict';

// ####################################### GLOBAL SCOPE #######################################

// Pagination Settings
let offset = 0;
let limit = 25;
let pokemonLoading = false;

// All Pokemon names and url 
let numberOfAllPokemon = 1126;
let allPokemonNamesAndUrl = [];

// Save Pokemon
let loadedPokemon = []; // Stores all Pokémon which were loaded before from pagination or filter
let searchedPokemon = []; // Stores all Pokémon which were already filtered by user
let favoritePokemon = [];

let userIsOnHome = true;
let pokemonDetailsOpen = false;

// Touch controls
let xDown = null;
let yDown = null;

// ####################################### INIT, FETCH API #######################################

preloadImages();
loadFromLocalStorage();

/**
 * Help function to preload all images
 */
function preloadImages() {
    preloadImage('./assets/img/abstract_bg.jpg');
    preloadImage('./assets/img/no_image.svg');
    preloadImage('./assets/img/pokeball.svg');
    preloadImage('./assets/img/psyduck.png');
    preloadImage('./assets/img/statistics_bg2.jpg');
    preloadImage('./assets/img/technology_bg.jpg');
    preloadImage('./assets/img/technology_bg3.jpg');
}

/**
 * Creates a new object for the passed image
 * @param {string} url The path of the single image
 */
function preloadImage(url) {
    const img = new Image();
    img.src = url;
}

/**
 * Initializes the app, fetches the first 25 Pokémon and displays them
 * loadAllPokemonNamesAndUrl(); is called that the search works
 */
function init() {
    loadPokemonPagination();
    loadAllPokemonNamesAndUrl();
    autocomplete(document.getElementById("search-input"), allPokemonNamesAndUrl);
}

/**
 * All names and the URLs of the Pokémon are fetched and stored in the array allPokemonNamesAndUrl
 * The names and URLs are needed for the search function
 */
async function loadAllPokemonNamesAndUrl() {
    const url = `https://pokeapi.co/api/v2/pokemon/?limit=${numberOfAllPokemon}`;
    const response = await fetch(url);
    const responseJSON = await response.json();

    // console.log('All Pokemon: ', responseJSON);

    // Push all fetched names and Url's into an array
    for (let i = 0; i < responseJSON['results'].length; i++) {
        allPokemonNamesAndUrl.push(responseJSON['results'][i]);
    }
}

/**
 * https://stackoverflow.com/questions/72386863/how-to-show-and-hide-loader-while-using-fetch-in-javascript
 * @returns Promise
 */
function mock() {
    return new Promise(resolve => setTimeout(() => resolve({ json: () => Promise.resolve([1, 2, 3]) }), 2000));
};

/**
 * Fetches more Pokémon when the user has scrolled to the bottom of the page
 * Standard settings: offset = 0; let limit = 25
 */
async function loadPokemonPagination() {
    try {
        showLoadingScreen();
        pokemonLoading = true;

        const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`;
        const response = await fetch(url);
        const responseJSON = await response.json();
        getPokemonForPagination(responseJSON);

        const res = await mock();
        const states = await res.json();
        // console.log("fetching completes");
        // console.log("states:", states);
    } catch (error) {
        // console.log(error.toString());
    } finally {
        setTimeout(() => {
            hideLoadingScreen();
        }, 1000)

        pokemonLoading = false;
    }
}

/**
 * Iterates through the response of loadPokemonPagination() and stores each Pokemon in the array loadedPokemon.
 * @param {JSON} responseJSON 
 */
async function getPokemonForPagination(responseJSON) {
    // The response from loadPokemonPagination() stores the pokemon in ['results']. Now we get each of the pokemon 
    for (let i = 0; i < responseJSON['results'].length; i++) {
        const url = responseJSON['results'][i]['url'];
        const responseSinglePokemon = await fetch(url);
        const responseSinglePokemonJSON = await responseSinglePokemon.json();

        // Push all Pokemon in global array - After every recall +offset
        loadedPokemon.push(responseSinglePokemonJSON);
    }

    renderPokemon(loadedPokemon);
}

async function filterPokemon() {
    searchedPokemon = []; // Clear previous search results
    userIsOnHome = false; // Prevent pagination to load more pokemon

    // Get search input from user
    let searchText = document.getElementById('search-input').value.toLowerCase();
    // console.log('Search Text: ', searchText);

    // Clear user input after submit
    document.getElementById('search-input').value = '';

    if (searchText.length >= 3) {
        // Iterate through all Pokemon names and urls
        for (let i = 0; i < allPokemonNamesAndUrl.length; i++) {
            // Check which pokemon name matches search input from user
            if (allPokemonNamesAndUrl[i]['name'].toLowerCase().includes(searchText)) {
                // Fetch searched pokemon
                const url = allPokemonNamesAndUrl[i]['url'];
                const response = await fetch(url);
                const responseJSON = await response.json();

                // Push searched pokemon in extra array
                searchedPokemon.push(responseJSON);
            } else {
                generateEmptyHTML();
            }
        }

        renderPokemon(searchedPokemon);
    } else {
        window.alert('Please enter at least 3 or more characters!')
    }
}

/**
 * Shows the loading screen
 */
function showLoadingScreen() {
    document.getElementById('loading-screen').classList.remove('d-none');
    document.body.style = 'overflow: hidden';
}

/**
 * Hides the loading screen
 */
function hideLoadingScreen() {
    document.getElementById('loading-screen').classList.add('d-none');

    if (!pokemonDetailsOpen) { // Needed for navigating through the Pokémon when more are loaded
        document.body.style = 'overflow: auto';
    }
}

// ####################################### MAIN #######################################

/**
 * Loads more Pokemon
 */
function loadMorePokemon() {
    // Check if user is on home. This function should not be called on favorite-site or when pokemon are filtered
    if (userIsOnHome) {
        offset += 25;
        loadPokemonPagination();
    }
}

/**
 * Saves data to the localStorage
 */
function saveToLocalStorage() {
    // Deactivated! To save all loaded pokemon in local storage will cause in an error because it's too big data
    // let loadedPokemonAsString = JSON.stringify(loadedPokemon);
    // localStorage.setItem('loadedPokemon', loadedPokemonAsString);

    let favoritePokemonAsString = JSON.stringify(favoritePokemon);
    localStorage.setItem('favoritePokemon', favoritePokemonAsString);
}

/**
 * Loads data from localStorage
 */
function loadFromLocalStorage() {
    // Deactivated! To save all loaded pokemon in local storage will cause in an error because it's too big data
    // let loadedPokemonAsString = localStorage.getItem('loadedPokemon');
    // loadedPokemon = JSON.parse(loadedPokemonAsString) || [];

    let favoritePokemonAsString = localStorage.getItem('favoritePokemon');
    favoritePokemon = JSON.parse(favoritePokemonAsString) || [];
}

/**
 * Renders the Pokémon depending on which array is sent through the function
 * @param {Array} array 
 */
function renderPokemon(array) {
    // Get render container and clear it
    let container = document.getElementById('pokedex-render-container');
    container.innerHTML = '';

    // Check if there are any pokemon to display. If not, display a message
    if (array.length < 1) {
        container.innerHTML = generateEmptyHTML();
    }

    // Iterate through all pokemon and generate each of it
    for (let i = 0; i < array.length; i++) {
        container.innerHTML += generatePokedexCardHTML(array, i);
    }
}

/**
 * Opens the clicked Pokémon and shows its details
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon (to be opened)
 */
function showPokemonDetails(array, index) {
    pokemonDetailsOpen = true;

    // Prevent user to scroll when pokemon details are open
    document.body.style.overflow = 'hidden';
    document.getElementById('btn-up').classList.add('d-none');

    let container = document.getElementById('pokemon-details-container');
    container.classList.remove('d-none');
    container.innerHTML = generatePokemonDetailsCardHTML(array, index);
}

/**
 * Opens the previous Pokémon
 * @param {*} array The array with the Pokémon
 * @param {*} index The index of the current Pokémon
 */
function nextPokemonLeft(array, index) {
    if (array == loadedPokemon) {
        if (index > 0) {
            showPokemonDetails(loadedPokemon, index - 1);
        }
    } else if (array == favoritePokemon) {
        if (index > 0) {
            showPokemonDetails(favoritePokemon, index - 1);
        }
    }
}

/**
 * Opens the next Pokémon
 * @param {*} array The array with the Pokémon
 * @param {*} index The index of the current Pokémon
 */
function nextPokemonRight(array, index) {
    if (array == loadedPokemon) {
        if (index < loadedPokemon.length - 1) {
            showPokemonDetails(loadedPokemon, index + 1);
        } else {
            loadMorePokemon();
            showPokemonDetails(loadedPokemon, index);
        }
    } else if (array == favoritePokemon) {
        if (index < favoritePokemon.length - 1) {
            showPokemonDetails(favoritePokemon, index + 1);
        } else {
            loadMorePokemon();
            showPokemonDetails(favoritePokemon, index);
        }
    }
}

/**
 * Closes the opened Pokémon
 */
function closePokemonDetails() {
    pokemonDetailsOpen = false;

    let container = document.getElementById('pokemon-details-container');
    container.classList.add('d-none');
    container.innerHTML = '';

    document.body.style.overflow = 'auto';

    if (upBtnVisible()) {
        document.getElementById('btn-up').classList.remove('d-none');
    }
}

/**
 * Sets a Pokémon as a favorite for the user and stores it in the localStorage
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @param {number} pokemonID The ID of the saved Pokémon
 */
function setFavoritePokemon(array, index, pokemonID) {
    // Checks if the property of the current object exists. If not set it to favorite to change it below
    if (array[index]['favorite'] == undefined) {
        array[index]['favorite'] = false;
    }

    // Changes current favorite status false = true / true = false
    array[index]['favorite'] = !array[index]['favorite'];

    // Add Pokemon to favorites 
    if (array[index]['favorite'] == true) {
        document.getElementById(`fav-icon-pokemon-index-${index}`).src = './assets/img/icons/favorite_saved.svg';
        favoritePokemon.push(array[index]);

        // Remove Pokemon from favorites
    } else {
        favoritePokemon.splice(getSavedPokemonIndex(pokemonID), 1);

        if (userIsOnHome) {
            showPokemonDetails(array, index);
        }

        // To prevent the render of the favorite Pokemon when the user is on home and removes a favorite Pokemon
        if (!userIsOnHome) {
            closePokemonDetails();
            renderPokemon(favoritePokemon);
        }
    }

    saveToLocalStorage();
}

/**
 * Iterates through the stored Pokémon and compares if the actual ID of the Pokémon matches pokemonID. If yes, returns the index of the array
 * @param {number} pokemonID The ID of the saved Pokémon
 * @returns The index of the array from the stored Pokémon
 */
function getSavedPokemonIndex(pokemonID) {
    for (let i = 0; i < favoritePokemon.length; i++) {
        const pokemon = favoritePokemon[i];

        // Returns the index of the favorite pokemon when the current pokemonID matches the ID in favoritePokemon array
        if (pokemon['id'] == pokemonID) {
            return favoritePokemon.indexOf(favoritePokemon[i]);
        }
    }
}

/**
 * "Navigates" back to the home page, displays the first 25 Pokémon and deletes the filtered Pokémon
 */
function home() {
    userIsOnHome = true;

    // Clear searched Pokemon
    searchedPokemon = [];

    renderPokemon(loadedPokemon);
}

/**
 * "Navigates" to the favorite Pokem
 */
function showFavoritePokemon() {
    // Prevent pagination to load more pokemon
    userIsOnHome = false;

    if (favoritePokemon.length > 0) {
        renderPokemon(favoritePokemon);
    } else {
        window.alert('There are no Pokemon to display! Go and catch some you like!');
    }
}

/**
 * Used to add in the HTML templates to the onclick="" attribute with the name of the array instead of the object.
 * @param {Array} array The array with the Pokémon
 * @returns The name of the passed array
 */
function getArrayNameAsString(array) {
    let arrayNameAsString;

    switch (array) {
        case loadedPokemon:
            arrayNameAsString = 'loadedPokemon';
            break;

        case searchedPokemon:
            arrayNameAsString = 'searchedPokemon';
            break;

        case favoritePokemon:
            arrayNameAsString = 'favoritePokemon';
            break;
    }

    return arrayNameAsString;
}

/**
 * Changes a passed string to uppercase letters
 * @param {string} string 
 * @returns string
 */
function capitalize(str) {
    if (str) {
        return str.toUpperCase();
    }
}

/**
 * Changes the first letter of a passed string to an uppercase letter
 * @param {string} str 
 * @returns string
 */
function capitalizeFirstLetter(str) {
    return str.replace(/(^|\/|-)(\S)/g, s => s.toUpperCase());
}

/**
 * Changes the first letter after a hyphen of a passed string to an uppercase letter
 * @param {string} str 
 * @returns string
 */
function capitalizeAfterHyphen(str) {
    return str.replace(/-([a-z])/g, (_, char) => '-' + char.toUpperCase());
}

// Track scrolling and when user scrolled to bottom of pagination, load more pokemon
window.addEventListener('scroll', function() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 100 && !pokemonLoading) { // Add 100px offset for mobile devices
        // console.log('Scrolled to bottom');
        loadMorePokemon();
    }

    // Show / Hide up-btn when user scrolls
    if (upBtnVisible() && !pokemonLoading) {
        document.getElementById('btn-up').classList.remove('d-none');
    } else {
        document.getElementById('btn-up').classList.add('d-none');
    }
});

// Track user keyboard
window.addEventListener('keydown', (e) => {
    // console.log(e);

    if (e.key == 'Enter') {
        filterPokemon();
    }

    if (e.key == 'Escape') {
        closePokemonDetails();
    }

    if (e.key == 'ArrowLeft') {
        document.getElementById('next-pokemon-left-btn').click();
    }

    if (e.key == 'ArrowRight') {
        document.getElementById('next-pokemon-right-btn').click();
    }
});

/**
 * Scrolls to the top of the page
 */
function scrollToTop() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 200)
}

/**
 * Check if the up-button should be visible
 * @returns true/false
 */
function upBtnVisible() {
    return window.pageYOffset >= 100 && !pokemonDetailsOpen;
}

// ####################################### TOUCH CONTROLS #######################################

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            document.getElementById('next-pokemon-right-btn').click();
        } else {
            document.getElementById('next-pokemon-left-btn').click();
        }
    } else {
        if (yDiff > 0) {
            // Swipe down
        } else {
            // Swipe up
        }
    }

    // Reset values
    xDown = null;
    yDown = null;
};

// ####################################### POKEMON PROPERTIES #######################################

/**
 * Returns the properties of the Pokémon based on the passed property as a string
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @param {string} property The property of the Pokémon ('height', 'weight')
 * @returns The properties of the Pokémon as a number (height/weight)
 */
function getPokemonProperties(array, index, property) {
    return array[index][property];
}

/**
 * Returns the ID of the Pokémon
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @returns The ID of the Pokémon
 */
function getPokemonID(array, index) {
    return array[index]['id'];
}

/**
 * Returns the name of the Pokémon
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon 
 * @returns The name of the Pokémon as string
 */
function getPokemonName(array, index) {
    let name = array[index]['name'];

    // Returns name and capitalize the first and every letter after - and /
    // https://stackoverflow.com/questions/41490076/capitalize-every-letter-after-and-characters
    return name.replace(/(^|\/|-)(\S)/g, s => s.toUpperCase());
}

/**
 * Returns the URL of the image of the respective Pokémon
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon 
 * @returns The URL of the image 
 */
function getPokemonImg(array, index) {
    if (array[index]['sprites']['other']['official-artwork']['front_default']) {
        return array[index]['sprites']['other']['official-artwork']['front_default'];
    } else {
        return './assets/img/no_image.svg';
    }
}

/**
 * Returns the type of the Pokémon as a string
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @param {number} typeIndex The index of the type. Each Pokémon has either 1 or 2 types
 * @returns The types of the Pokémon as a string
 */
function getPokemonType(array, index, typeIndex) {
    // Some pokemon have to types: Type 1 = typeIndex 0, type 2 = typeIndex 1
    if (array[index]['types'][typeIndex]) {
        return array[index]['types'][typeIndex]['type']['name'];
    } else {
        // If there is no type 2, the return sends the class 'd-none' to the class="" of the second type and is not displayed
        return 'd-none';
    }
}

/**
 * Returns the name of the Pokémon's statistics
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @param {number} stat The index of the statistic. Each Pokémon has 6 statistics
 * @returns The name of the Pokémon's statistics as string
 */
function getPokemonStat(array, index, stat) {
    return array[index]['stats'][stat]['base_stat'];
}

/**
 * Returns the value of the statistic of the respective Pokémon as number
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @param {number} stat The index of the statistic. Each Pokémon has 6 statistics
 * @returns The value of the statistic of the Pokémon as number
 */
function getPokemonStatPercent(array, index, stat) {
    // There has to be a cap of each stat. After some research, this was the maximum i found
    let maxStat = 255;
    let stats = array[index]['stats'][stat]['base_stat'];

    // Calculate the percentage of each stat in relation to the maximum
    return (stats / maxStat) * 100;
}

/**
 * Returns the hex color code of the respective passed type of Pokémon
 * @param {string} type The type of Pokémon as string
 * @returns 
 */
function getPokemonTypeHexColor(type) {
    switch (type) {
        case 'normal':
            return '#a9a977';
            break;

        case 'fighting':
            return '#c03028';
            break;

        case 'flying':
            return '#98a4e0';
            break;

        case 'poison':
            return '#bb5a9f';
            break;

        case 'ground':
            return '#e7d4a9';
            break;

        case 'rock':
            return '#bea563';
            break;

        case 'bug':
            return '#a9bd42';
            break;

        case 'ghost':
            return '#6663b2';
            break;

        case 'steel':
            return '#afadc3';
            break;

        case 'fire':
            return '#fe4833';
            break;

        case 'water':
            return '#1f93f6';
            break;

        case 'grass':
            return '#74d767';
            break;

        case 'electric':
            return '#fec446';
            break;

        case 'psychic':
            return '#fd6fa1';
            break;

        case 'ice':
            return '#47cee4';
            break;

        case 'dragon':
            return '#8667ee';
            break;

        case 'dark':
            return '#765a4e';
            break;

        case 'fairy':
            return '#fdb6f2';
            break;
    }
}

/**
 * Returns the Pokémon's ability as a string
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @param {number} abilityIndex The index of the ability
 * @returns The Pokémon's ability as a string
 */
function getPokemonAbilities(array, index, abilityIndex) {
    // Some pokemon have more then one ability: Ability 1 = abilityIndex 0, ability 2 = abilityIndex 1 and ability 3 = abilityIndex 2
    if (array[index]['abilities'][abilityIndex]) {
        return array[index]['abilities'][abilityIndex]['ability']['name'].replace(/(^|\/|-)(\S)/g, s => s.toUpperCase());
    } else {
        // If there is no ability, the return sends the class 'd-none' to the class="" and further abilities are not displayed
        return 'd-none';
    }
}

/**
 * Check if the Pokemon has been favored and if so, fill in the Fav-Star
 * @param {Array} array The array with the Pokémon
 * @param {number} index The index of the current Pokémon
 * @returns The URL of the image with the favorite star (Either filled or not)
 */
function getPokemonFavoriteState(array, index) {
    if (array[index]['favorite'] == true) {
        return './assets/img/icons/favorite_saved.svg';
    } else {
        return './assets/img/icons/favorite.svg';
    }
}