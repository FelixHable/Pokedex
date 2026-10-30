'use strict';

const generatePokedexCardHTML = (array, i) => `
    <div class="pokedex-card" onclick="showPokemonDetails(${getArrayNameAsString(array)}, ${i})"> 
        <div class="pokedex-card-header" style="background: linear-gradient(135deg, ${getPokemonTypeHexColor(getPokemonType(array, i, 0))}aa 0%, ${getPokemonTypeHexColor(getPokemonType(array, i, 0))}cc 100%);">
            <span class="pokemon-id">#${getPokemonID(array, i)}</span>
            <img src="${getPokemonImg(array, i)}" alt="${getPokemonName(array, i)}" class="pokemon-img">
        </div>
        <div class="pokedex-card-body">
            <span class="pokemon-name">${getPokemonName(array, i)}</span>
            <div class="pokemon-types">
                <span class="pokemon-type" style="background-color: ${getPokemonTypeHexColor(getPokemonType(array, i, 0))}">${capitalize(getPokemonType(array, i, 0))}</span>
                <span class="pokemon-type ${getPokemonType(array, i, 1)}" style="background-color: ${getPokemonTypeHexColor(getPokemonType(array, i, 1))}">${capitalize(getPokemonType(array, i, 1))}</span>
            </div>
        </div>
    </div>
`;

const generatePokemonDetailsCardHTML = (array, i) => {
    const tc = getPokemonTypeHexColor(getPokemonType(array, i, 0)), arrStr = getArrayNameAsString(array), id = getPokemonID(array, i);
    const isFirst = id === 1, isLast = id === 1025;
    return `
        <div class="pokemon-details-card" onclick="event.stopPropagation()">
            <button id="next-pokemon-left-btn" class="nav-btn nav-btn-left btn ${isFirst ? 'disabled-nav-btn' : ''}" ${isFirst ? 'disabled' : `onclick="navigatePokemon(${arrStr}, ${i}, -1)"`} title="Previous Pokémon"><img src="icons/arrowleft.png" alt="Left"></button>
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
            <button id="next-pokemon-right-btn" class="nav-btn nav-btn-right btn ${isLast ? 'disabled-nav-btn' : ''}" ${isLast ? 'disabled' : `onclick="navigatePokemon(${arrStr}, ${i}, 1)"`} title="Next Pokémon"><img src="icons/arrowright.png" alt="Right"></button>
        </div>
    `;
};

const generateStatsHTML = (array, i) => {
    const stats = [{n: 'HP', c: 'hp'}, {n: 'ATK', c: 'atk'}, {n: 'DEF', c: 'def'}, {n: 'S-ATK', c: 's-atk'}, {n: 'S-DEF', c: 's-def'}, {n: 'SPEED', c: 'speed'}];
    return `<div class="pokemon-stats">${stats.map((s, idx) => `
        <div class="pokemon-stat">
            <span class="pokemon-stat-description">${s.n}</span>
            <div class="progress"><div class="progress-bar pokemon-stat-${s.c}" style="width: ${getPokemonStatPercent(array, i, idx)}%">${getPokemonStat(array, i, idx)}</div></div>
        </div>`).join('')}</div>`;
};

const generateDetailsFooterHTML = (array, i) => `
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

const generateEmptyHTML = () => `<div class="empty-container"><span class="empty-text">Oops...</span><span class="empty-text">No Pokémon found!</span></div>`;