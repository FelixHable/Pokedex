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
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${numberOfAllPokemon}`);
        const data = await res.json();
        allPokemonNamesAndUrl = (data.results || []).filter(isValidMainPokemon);
    } catch (error) {
        console.error("Error loading all pokemon names and urls:", error);
    }
}

function isValidMainPokemon(p) {
    const idMatch = p.url.match(/\/pokemon\/(\d+)\//);
    return idMatch && parseInt(idMatch[1]) < 10000;
}

async function loadPokemonPagination() {
    try {
        toggleLoadingScreen(true);
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`);
        const data = await res.json();
        await processPaginationResults(data.results);
    } catch (error) {
        console.error("Error loading pokemon pagination:", error);
    } finally {
        toggleLoadingScreen(false);
    }
}

async function processPaginationResults(results) {
    for (let i = 0; i < results.length; i++) {
        await fetchAndPushPokemon(results[i].url);
    }
    sortAndRenderLoadedPokemon();
}

async function fetchAndPushPokemon(url) {
    const res = await fetch(url);
    const json = await res.json();
    if (json.id < 10000 && !loadedPokemon.some(p => p.id === json.id)) {
        loadedPokemon.push(json);
    }
}

function sortAndRenderLoadedPokemon() {
    loadedPokemon.sort((a, b) => a.id - b.id);
    renderPokemon(loadedPokemon);
}

async function filterPokemon() {
    resetSearchState();
    let searchText = getAndClearSearchInput();
    if (searchText.length < 3) {
        window.alert('Please enter at least 3 characters!');
        return;
    }
    await executeSearch(searchText);
}

function resetSearchState() {
    searchedPokemon = [];
    userIsOnHome = false;
    document.getElementById('load-more-container').classList.add('d-none');
}

function getAndClearSearchInput() {
    let input = document.getElementById('search-input');
    let text = input.value.toLowerCase().trim();
    input.value = '';
    return text;
}

async function executeSearch(searchText) {
    toggleLoadingScreen(true);
    const matches = allPokemonNamesAndUrl.filter(p => p.name.toLowerCase().includes(searchText));
    for (let i = 0; i < matches.length; i++) {
        const res = await fetch(matches[i].url);
        searchedPokemon.push(await res.json());
    }
    toggleLoadingScreen(false);
    renderPokemon(searchedPokemon);
}

function toggleLoadingScreen(show) {
    const loadingScreen = document.getElementById('loading-screen');
    if (show) {
        loadingScreen.classList.remove('d-none');
        document.body.style.overflow = 'hidden';
        pokemonLoading = true;
    } else {
        loadingScreen.classList.add('d-none');
        if (!pokemonDetailsOpen) document.body.style.overflow = 'auto';
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
    let data = localStorage.getItem('favoritePokemon');
    favoritePokemon = JSON.parse(data) || [];
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
        showPokemonDetails(array, getWrappedIndex(index + direction, array.length));
        return;
    }
    let globalIdx = getGlobalIndex(index);
    let newGlobalIdx = getWrappedIndex(globalIdx + direction, allPokemonNamesAndUrl.length);
    await handleGlobalNavigation(newGlobalIdx);
}

function getWrappedIndex(newIdx, length) {
    if (newIdx < 0) return length - 1;
    if (newIdx >= length) return 0;
    return newIdx;
}

function getGlobalIndex(index) {
    const current = loadedPokemon[index];
    return allPokemonNamesAndUrl.findIndex(p => p.name === current.name);
}

async function handleGlobalNavigation(newGlobalIdx) {
    const targetEntry = allPokemonNamesAndUrl[newGlobalIdx];
    let targetIndex = loadedPokemon.findIndex(p => p.name === targetEntry.name);

    if (targetIndex === -1) {
        await fetchAndInsertTargetPokemon(targetEntry);
        targetIndex = loadedPokemon.findIndex(p => p.name === targetEntry.name);
    }
    showPokemonDetails(loadedPokemon, targetIndex !== -1 ? targetIndex : 0);
}

async function fetchAndInsertTargetPokemon(targetEntry) {
    toggleLoadingScreen(true);
    try {
        const res = await fetch(targetEntry.url);
        const json = await res.json();
        if (!loadedPokemon.some(p => p.id === json.id)) {
            loadedPokemon.push(json);
        }
        sortAndRenderLoadedPokemon();
    } catch (error) {
        console.error("Error loading adjacent pokemon:", error);
    } finally {
        toggleLoadingScreen(false);
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
    if (array[index]['favorite'] === undefined) array[index]['favorite'] = false;
    array[index]['favorite'] = !array[index]['favorite'];

    if (array[index]['favorite']) {
        document.getElementById(`fav-icon-pokemon-index-${index}`).src = 'icons/favorit.png';
        favoritePokemon.push(array[index]);
    } else {
        handleFavoriteRemoval(pokemonID, array, index);
    }
    saveToLocalStorage();
}

function handleFavoriteRemoval(pokemonID, array, index) {
    const favIndex = getSavedPokemonIndex(pokemonID);
    if (favIndex !== undefined) favoritePokemon.splice(favIndex, 1);

    if (userIsOnHome) {
        showPokemonDetails(array, index);
    } else {
        closePokemonDetails();
        renderPokemon(favoritePokemon);
    }
}

function getSavedPokemonIndex(pokemonID) {
    for (let i = 0; i < favoritePokemon.length; i++) {
        if (favoritePokemon[i]['id'] === pokemonID) return i;
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
    renderPokemon(favoritePokemon.length > 0 ? favoritePokemon : []);
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
    let reachedBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 100;
    if (reachedBottom && !pokemonLoading) {
        loadMorePokemon();
    }
}

function handleWindowKeydown(e) {
    if (e.key === 'Escape') closePokemonDetails();
    if (e.key === 'ArrowLeft') document.getElementById('next-pokemon-left-btn')?.click();
    if (e.key === 'ArrowRight') document.getElementById('next-pokemon-right-btn')?.click();
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
        if (xDiff > 0) document.getElementById('next-pokemon-right-btn')?.click();
        else document.getElementById('next-pokemon-left-btn')?.click();
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