'use strict';

function generatePokedexCardHTML(array, i) {
    const pt = getPokemonType(array, i, 0), tc = getPokemonTypeHexColor(pt);
    const st = getPokemonType(array, i, 1), sc = getPokemonTypeHexColor(st);
    return `
        <div class="pokedex-card" onclick="showPokemonDetails(${getArrayNameAsString(array)}, ${i})"> 
            <div class="pokedex-card-header" style="background: linear-gradient(135deg, ${tc}aa 0%, ${tc}cc 100%);">
                <span class="pokemon-id">#${getPokemonID(array, i)}</span>
                <img src="${getPokemonImg(array, i)}" alt="${getPokemonName(array, i)}" class="pokemon-img">
            </div>
            <div class="pokedex-card-body">
                <span class="pokemon-name">${getPokemonName(array, i)}</span>
                <div class="pokemon-types">
                    <span class="pokemon-type" style="background-color: ${tc}">${capitalize(pt)}</span>
                    <span class="pokemon-type ${st}" style="background-color: ${sc}">${capitalize(st)}</span>
                </div>
            </div>
        </div>
    `;
}

function generatePokemonDetailsCardHTML(array, i) {
    const pt = getPokemonType(array, i, 0), tc = getPokemonTypeHexColor(pt), arrStr = getArrayNameAsString(array), id = getPokemonID(array, i);
    return `
        <div class="pokemon-details-card" onclick="event.stopPropagation()">
            <button id="next-pokemon-left-btn" class="nav-btn nav-btn-left btn" onclick="navigatePokemon(${arrStr}, ${i}, -1)" title="Previous Pokémon"><img src="icons/arrowleft.png" alt="Left"></button>
            <div class="pokemon-details-header" style="background: linear-gradient(135deg, ${tc}bb 0%, ${tc}ee 100%);">
                <button onclick="closePokemonDetails()" class="close-details-btn btn" title="Close"><img src="icons/close.png" alt="Close"></button>
                <img src="${getPokemonImg(array, i)}" alt="${getPokemonName(array, i)}" class="pokemon-img pokemon-details-img">
            </div>
            <div class="pokemon-details-body">
                <div class="pokemon-name-container">
                    <span class="pokemon-name pokemon-details-name">${getPokemonName(array, i)}</span>
                    <span class="pokemon-details-id">#${id}</span>
                    <button class="favorite-btn btn" title="Favorite" onclick="setFavoritePokemon(${arrStr}, ${i}, ${id})"><img src="${getPokemonFavoriteState(array, i)}" alt="Fav" id="fav-icon-pokemon-index-${i}"></button>
                </div>
                ${generateStatsHTML(array, i)}
            </div>
            ${generateDetailsFooterHTML(array, i)}
            <button id="next-pokemon-right-btn" class="nav-btn nav-btn-right btn" onclick="navigatePokemon(${arrStr}, ${i}, 1)" title="Next Pokémon"><img src="icons/arrowright.png" alt="Right"></button>
        </div>
    `;
}

function generateStatsHTML(array, i) {
    const stats = ['HP', 'ATK', 'DEF', 'S-ATK', 'S-DEF', 'SPEED'];
    return `<div class="pokemon-stats">${stats.map((s, idx) => `
        <div class="pokemon-stat">
            <span class="pokemon-stat-description">${s}</span>
            <div class="progress"><div class="progress-bar pokemon-stat-${s.toLowerCase().replace('-', '')}" style="width: ${getPokemonStatPercent(array, i, idx)}%">${getPokemonStat(array, i, idx)}</div></div>
        </div>`).join('')}</div>`;
}

function generateDetailsFooterHTML(array, i) {
    return `
        <div class="pokemon-details-footer">
            <div>
                <span class="pokemon-properties-description">Height: </span><span class="pokemon-properties">${getPokemonProperties(array, i, 'height') / 10}m</span>
                <span class="pokemon-properties-description">Weight: </span><span class="pokemon-properties">${getPokemonProperties(array, i, 'weight') / 10}kg</span>
            </div>
            <div>
                <span class="pokemon-properties-description">Abilities: </span>
                <span class="pokemon-properties">${getPokemonAbilities(array, i, 0)}</span>
                <span class="pokemon-properties ${getPokemonAbilities(array, i, 1)}">/ ${getPokemonAbilities(array, i, 1)}</span>
                <span class="pokemon-properties ${getPokemonAbilities(array, i, 2)}">/ ${getPokemonAbilities(array, i, 2)}</span>
            </div>
        </div>
    `;
}

function generateEmptyHTML() {
    return `<div class="empty-container"><span class="empty-text">Oops...</span><span class="empty-text">No Pokémon found!</span></div>`;
}