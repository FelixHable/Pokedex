'use strict';

let offset = 0, limit = 10, pokemonLoading = false, numberOfAllPokemon = 1126;
let allPokemonNamesAndUrl = [], loadedPokemon = [], searchedPokemon = [], favoritePokemon = [];
let userIsOnHome = true, pokemonDetailsOpen = false, xDown = null, yDown = null;

loadFromLocalStorage();

function init() {
    loadPokemonPagination();
    loadAllPokemonNamesAndUrl();
    autocomplete(document.getElementById("search-input"), allPokemonNamesAndUrl);
    initEventListeners();
}

function initEventListeners() {
    window.addEventListener('keydown', handleWindowKeydown);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
}

async function loadAllPokemonNamesAndUrl() {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=${numberOfAllPokemon}`);
        const data = await res.json();
        allPokemonNamesAndUrl = (data.results || []).filter(isValidMainPokemon);
    } catch (e) {console.error("Failed to load Pokémon list.", e);}
}

function isValidMainPokemon(p) {
    const m = p.url.match(/\/pokemon\/(\d+)\//);
    return m && parseInt(m[1]) < 10000;
}

async function loadPokemonPagination() {
    try {
        toggleLoadingScreen(true);
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=${limit}`);
        const data = await res.json();
        await processPaginationResults(data.results);
    } catch (e) { console.error(e); }
    finally { toggleLoadingScreen(false); }
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
    if (json.id < 10000 && !loadedPokemon.some(p => p.id === json.id)) loadedPokemon.push(json);
}

function sortAndRenderLoadedPokemon() {
    loadedPokemon.sort((a, b) => a.id - b.id);
    renderPokemon(loadedPokemon);
}

async function filterPokemon() {
    resetSearchState();
    let searchText = getAndClearSearchInput();
    if (searchText.length < 3) { window.alert('Enter at least 3 chars!'); return; }
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
    document.getElementById('loading-screen').classList.toggle('d-none', !show);
    document.body.style.overflow = show || pokemonDetailsOpen ? 'hidden' : 'auto';
    pokemonLoading = show;
}

function loadMorePokemon() {
    if (userIsOnHome && !pokemonLoading) { offset += limit; loadPokemonPagination(); }
}

function saveToLocalStorage() {
    localStorage.setItem('favoritePokemon', JSON.stringify(favoritePokemon));
}

function loadFromLocalStorage() {
    favoritePokemon = JSON.parse(localStorage.getItem('favoritePokemon')) || [];
}

function renderPokemon(array) {
    let container = document.getElementById('pokedex-render-container');
    container.innerHTML = !array || array.length < 1 ? generateEmptyHTML() : array.map((_, i) => generatePokedexCardHTML(array, i)).join('');
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
    return newIdx < 0 ? length - 1 : newIdx >= length ? 0 : newIdx;
}

function getGlobalIndex(index) {
    return allPokemonNamesAndUrl.findIndex(p => p.name === loadedPokemon[index].name);
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
        if (!loadedPokemon.some(p => p.id === json.id)) loadedPokemon.push(json);
        sortAndRenderLoadedPokemon();
    } catch (e) { console.error(e); }
    finally { toggleLoadingScreen(false); }
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
    favoritePokemon.splice(getSavedPokemonIndex(pokemonID), 1);
    if (userIsOnHome) showPokemonDetails(array, index);
    else { closePokemonDetails(); renderPokemon(favoritePokemon); }
}

function getSavedPokemonIndex(pokemonID) {
    return favoritePokemon.findIndex(p => p.id === pokemonID);
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
    return array === loadedPokemon ? 'loadedPokemon' : array === searchedPokemon ? 'searchedPokemon' : 'favoritePokemon';
}

function capitalize(str) { return str ? str.toUpperCase() : ''; }

function capitalizeFirstLetter(str) { return str ? str.replace(/(^|\/|-)(\S)/g, s => s.toUpperCase()) : ''; }

function capitalizeAfterHyphen(str) { return str ? str.replace(/-([a-z])/g, (_, c) => '-' + c.toUpperCase()) : ''; }

function handleWindowKeydown(e) {
    if (e.key === 'Escape') closePokemonDetails();
    if (e.key === 'ArrowLeft') document.getElementById('next-pokemon-left-btn')?.click();
    if (e.key === 'ArrowRight') document.getElementById('next-pokemon-right-btn')?.click();
}

function handleTouchStart(evt) { xDown = evt.touches[0].clientX; yDown = evt.touches[0].clientY; }

function handleTouchMove(evt) {
    if (!xDown || !yDown) return;
    let xDiff = xDown - evt.touches[0].clientX, yDiff = yDown - evt.touches[0].clientY;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        document.getElementById(xDiff > 0 ? 'next-pokemon-right-btn' : 'next-pokemon-left-btn')?.click();
    }
    xDown = null; yDown = null;
}

function getPokemonProperties(array, index, prop) { return array[index][prop]; }

function getPokemonID(array, index) { return array[index]['id']; }

function getPokemonName(array, index) { return array[index]['name'].replace(/(^|\/|-)(\S)/g, s => s.toUpperCase()); }

function getPokemonImg(array, index) { return array[index]['sprites']['other']['official-artwork']['front_default'] || 'icons/close.png'; }

function getPokemonType(array, index, typeIndex) { return array[index]['types'][typeIndex] ? array[index]['types'][typeIndex]['type']['name'] : 'd-none'; }

function getPokemonStat(array, index, stat) { return array[index]['stats'][stat]['base_stat']; }

function getPokemonStatPercent(array, index, stat) { return (array[index]['stats'][stat]['base_stat'] / 255) * 100; }

function getPokemonTypeHexColor(type) {
    const colors = { normal: '#a8a878', fighting: '#c03028', flying: '#a890f0', poison: '#a040a0', ground: '#e0c068', rock: '#b8a038', bug: '#a8b820', ghost: '#705898', steel: '#b8b8d0', fire: '#f08030', water: '#6890f0', grass: '#78c850', electric: '#f8d030', psychic: '#f85888', ice: '#98d8d8', dragon: '#7038f8', dark: '#705848', fairy: '#ee99ac' };
    return colors[type] || '#a8a878';
}

function getPokemonAbilities(array, index, abilityIndex) {
    return array[index]['abilities'][abilityIndex] ? array[index]['abilities'][abilityIndex]['ability']['name'].replace(/(^|\/|-)(\S)/g, s => s.toUpperCase()) : 'd-none';
}

function getPokemonFavoriteState(array, index) { return array[index]['favorite'] ? 'icons/favorit.png' : 'icons/nonfavorit.png'; }