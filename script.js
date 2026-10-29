'use strict';

let offset = 0;
let limit = 10;
let pokemonLoading = false;

let numberOfAllPokemon = 1126;
let allPokemonNamesAndUrl = [];

let loadedPokemon = [];
let searchedPokemon = [];
let favoritePokemon = [];

let userIsOnHome = true;
let pokemonDetailsOpen = false;

let xDown = null;
let yDown = null;

loadFromLocalStorage();

function init() {
    loadPokemonPagination();
    loadAllPokemonNamesAndUrl();
    autocomplete(document.getElementById("search-input"), allPokemonNamesAndUrl);
    initEventListeners();
}

function initEventListeners() {
    window.addEventListener('scroll', handleWindowScroll);
    window.addEventListener('keydown', handleWindowKeydown);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
}

async function loadAllPokemonNamesAndUrl() {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/?limit=${numberOfAllPokemon}`;
        const response = await fetch(url);
        const responseJSON = await response.json();
        // Filtere Form-IDs über 10000 direkt heraus, damit nur echte Haupt-Pokémon genutzt werden
        allPokemonNamesAndUrl = (responseJSON.results || []).filter(p => {
            const idMatch = p.url.match(/\/pokemon\/(\d+)\//);
            return idMatch && parseInt(idMatch[1]) < 10000;
        });
    } catch (error) {
        console.error("Error loading all pokemon names and urls:", error);
    }
}

async function loadPokemonPagination() {
    try {
        toggleLoadingScreen(true);
        const url = `https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`;
        const response = await fetch(url);
        const responseJSON = await response.json();
        await getPokemonForPagination(responseJSON);
    } catch (error) {
        console.error("Error loading pokemon pagination:", error);
    } finally {
        toggleLoadingScreen(false);
    }
}

async function getPokemonForPagination(responseJSON) {
    for (let i = 0; i < responseJSON.results.length; i++) {
        const url = responseJSON.results[i].url;
        const responseSinglePokemon = await fetch(url);
        const responseSinglePokemonJSON = await responseSinglePokemon.json();
        // Nur Haupt-Pokémon (< 10000) für die Standard-Pagination übernehmen
        if (responseSinglePokemonJSON.id < 10000 && !loadedPokemon.some(p => p.id === responseSinglePokemonJSON.id)) {
            loadedPokemon.push(responseSinglePokemonJSON);
        }
    }
    loadedPokemon.sort((a, b) => a.id - b.id);
    renderPokemon(loadedPokemon);
}

async function filterPokemon() {
    searchedPokemon = [];
    userIsOnHome = false;
    document.getElementById('load-more-container').classList.add('d-none');

    let searchText = document.getElementById('search-input').value.toLowerCase().trim();
    document.getElementById('search-input').value = '';

    if (searchText.length >= 3) {
        toggleLoadingScreen(true);
        const matches = allPokemonNamesAndUrl.filter(p => p.name.toLowerCase().includes(searchText));

        for (let i = 0; i < matches.length; i++) {
            const response = await fetch(matches[i].url);
            const responseJSON = await response.json();
            searchedPokemon.push(responseJSON);
        }

        toggleLoadingScreen(false);
        renderPokemon(searchedPokemon);
    } else {
        window.alert('Please enter at least 3 characters!');
    }
}

function toggleLoadingScreen(show) {
    const loadingScreen = document.getElementById('loading-screen');
    if (show) {
        loadingScreen.classList.remove('d-none');
        document.body.style.overflow = 'hidden';
        pokemonLoading = true;
    } else {
        loadingScreen.classList.add('d-none');
        if (!pokemonDetailsOpen) {
            document.body.style.overflow = 'auto';
        }
        pokemonLoading = false;
    }
}

function loadMorePokemon() {
    if (userIsOnHome && !pokemonLoading) {
        offset += limit;
        loadPokemonPagination();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('favoritePokemon', JSON.stringify(favoritePokemon));
}

function loadFromLocalStorage() {
    let favoritePokemonAsString = localStorage.getItem('favoritePokemon');
    favoritePokemon = JSON.parse(favoritePokemonAsString) || [];
}

function renderPokemon(array) {
    let container = document.getElementById('pokedex-render-container');
    container.innerHTML = '';

    if (!array || array.length < 1) {
        container.innerHTML = generateEmptyHTML();
        return;
    }

    for (let i = 0; i < array.length; i++) {
        container.innerHTML += generatePokedexCardHTML(array, i);
    }
}

function showPokemonDetails(array, index) {
    pokemonDetailsOpen = true;
    document.body.style.overflow = 'hidden';

    let container = document.getElementById('pokemon-details-container');
    container.classList.remove('d-none');
    container.innerHTML = generatePokemonDetailsCardHTML(array, index);
}

async function navigatePokemon(array, index, direction) {
    if (array !== loadedPokemon) {
        let newIndex = index + direction;
        if (newIndex < 0) newIndex = array.length - 1;
        if (newIndex >= array.length) newIndex = 0;
        showPokemonDetails(array, newIndex);
        return;
    }

    const currentPokemon = loadedPokemon[index];
    let globalIdx = allPokemonNamesAndUrl.findIndex(p => p.name === currentPokemon.name);
    
    if (globalIdx === -1) {
        let newIndex = index + direction;
        if (newIndex < 0) newIndex = loadedPokemon.length - 1;
        if (newIndex >= loadedPokemon.length) newIndex = 0;
        showPokemonDetails(loadedPokemon, newIndex);
        return;
    }

    let newGlobalIdx = globalIdx + direction;
    if (newGlobalIdx < 0) {
        newGlobalIdx = allPokemonNamesAndUrl.length - 1;
    } else if (newGlobalIdx >= allPokemonNamesAndUrl.length) {
        newGlobalIdx = 0;
    }

    const targetEntry = allPokemonNamesAndUrl[newGlobalIdx];
    let targetIndexInLoaded = loadedPokemon.findIndex(p => p.name === targetEntry.name);

    if (targetIndexInLoaded !== -1) {
        showPokemonDetails(loadedPokemon, targetIndexInLoaded);
    } else {
        toggleLoadingScreen(true);
        try {
            const response = await fetch(targetEntry.url);
            const targetJSON = await response.json();
            if (!loadedPokemon.some(p => p.id === targetJSON.id)) {
                loadedPokemon.push(targetJSON);
            }
            loadedPokemon.sort((a, b) => a.id - b.id);
            renderPokemon(loadedPokemon);
        } catch (error) {
            console.error("Error loading adjacent pokemon:", error);
        } finally {
            toggleLoadingScreen(false);
        }
        
        let finalIndex = loadedPokemon.findIndex(p => p.name === targetEntry.name);
        showPokemonDetails(loadedPokemon, finalIndex !== -1 ? finalIndex : 0);
    }
}

function closePokemonDetails() {
    pokemonDetailsOpen = false;
    let container = document.getElementById('pokemon-details-container');
    container.classList.add('d-none');
    container.innerHTML = '';
    document.body.style.overflow = 'auto';
}

function setFavoritePokemon(array, index, pokemonID) {
    if (array[index]['favorite'] === undefined) {
        array[index]['favorite'] = false;
    }

    array[index]['favorite'] = !array[index]['favorite'];

    if (array[index]['favorite']) {
        document.getElementById(`fav-icon-pokemon-index-${index}`).src = 'icons/favorit.png';
        favoritePokemon.push(array[index]);
    } else {
        const favIndex = getSavedPokemonIndex(pokemonID);
        if (favIndex !== undefined) favoritePokemon.splice(favIndex, 1);

        if (userIsOnHome) {
            showPokemonDetails(array, index);
        } else {
            closePokemonDetails();
            renderPokemon(favoritePokemon);
        }
    }

    saveToLocalStorage();
}

function getSavedPokemonIndex(pokemonID) {
    for (let i = 0; i < favoritePokemon.length; i++) {
        if (favoritePokemon[i]['id'] === pokemonID) {
            return i;
        }
    }
}

function home() {
    userIsOnHome = true;
    searchedPokemon = [];
    document.getElementById('load-more-container').classList.remove('d-none');
    renderPokemon(loadedPokemon);
}

function showFavoritePokemon() {
    userIsOnHome = false;
    document.getElementById('load-more-container').classList.add('d-none');
    if (favoritePokemon.length > 0) {
        renderPokemon(favoritePokemon);
    } else {
        renderPokemon([]);
    }
}

function getArrayNameAsString(array) {
    if (array === loadedPokemon) return 'loadedPokemon';
    if (array === searchedPokemon) return 'searchedPokemon';
    if (array === favoritePokemon) return 'favoritePokemon';
    return 'loadedPokemon';
}

function capitalize(str) {
    return str ? str.toUpperCase() : '';
}

function capitalizeFirstLetter(str) {
    return str ? str.replace(/(^|\/|-)(\S)/g, s => s.toUpperCase()) : '';
}

function capitalizeAfterHyphen(str) {
    return str ? str.replace(/-([a-z])/g, (_, char) => '-' + char.toUpperCase()) : '';
}

function handleWindowScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 100 && !pokemonLoading) {
        loadMorePokemon();
    }
}

function handleWindowKeydown(e) {
    if (e.key === 'Escape') closePokemonDetails();
    if (e.key === 'ArrowLeft') {
        const btn = document.getElementById('next-pokemon-left-btn');
        if (btn) btn.click();
    }
    if (e.key === 'ArrowRight') {
        const btn = document.getElementById('next-pokemon-right-btn');
        if (btn) btn.click();
    }
}

function handleTouchStart(evt) {
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) return;

    let xDiff = xDown - evt.touches[0].clientX;
    let yDiff = yDown - evt.touches[0].clientY;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            const btn = document.getElementById('next-pokemon-right-btn');
            if (btn) btn.click();
        } else {
            const btn = document.getElementById('next-pokemon-left-btn');
            if (btn) btn.click();
        }
    }

    xDown = null;
    yDown = null;
}

function getPokemonProperties(array, index, property) {
    return array[index][property];
}

function getPokemonID(array, index) {
    return array[index]['id'];
}

function getPokemonName(array, index) {
    let name = array[index]['name'];
    return name.replace(/(^|\/|-)(\S)/g, s => s.toUpperCase());
}

function getPokemonImg(array, index) {
    return array[index]['sprites']['other']['official-artwork']['front_default'] || 'icons/close.png';
}

function getPokemonType(array, index, typeIndex) {
    if (array[index]['types'][typeIndex]) {
        return array[index]['types'][typeIndex]['type']['name'];
    }
    return 'd-none';
}

function getPokemonStat(array, index, stat) {
    return array[index]['stats'][stat]['base_stat'];
}

function getPokemonStatPercent(array, index, stat) {
    let maxStat = 255;
    let stats = array[index]['stats'][stat]['base_stat'];
    return (stats / maxStat) * 100;
}

function getPokemonTypeHexColor(type) {
    const colors = {
        normal: '#a8a878', fighting: '#c03028', flying: '#a890f0', poison: '#a040a0',
        ground: '#e0c068', rock: '#b8a038', bug: '#a8b820', ghost: '#705898',
        steel: '#b8b8d0', fire: '#f08030', water: '#6890f0', grass: '#78c850',
        electric: '#f8d030', psychic: '#f85888', ice: '#98d8d8', dragon: '#7038f8',
        dark: '#705848', fairy: '#ee99ac'
    };
    return colors[type] || '#a8a878';
}

function getPokemonAbilities(array, index, abilityIndex) {
    if (array[index]['abilities'][abilityIndex]) {
        return array[index]['abilities'][abilityIndex]['ability']['name'].replace(/(^|\/|-)(\S)/g, s => s.toUpperCase());
    }
    return 'd-none';
}

function getPokemonFavoriteState(array, index) {
    return array[index]['favorite'] ? 'icons/favorit.png' : 'icons/nonfavorit.png';
}