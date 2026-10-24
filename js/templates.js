/**
 * Help function: Returns HTML code
 * @param {Array} array The array with the Pokémon
 * @param {number} i The current Pokémon
 * @returns HTML-Code
 */
function generatePokedexCardHTML(array, i) {
    return `
            <div class="pokedex-card" onclick="showPokemonDetails(${getArrayNameAsString(array)}, ${i})"> 
                <div class="pokedex-card-header">
                    <span class="pokemon-id">#${getPokemonID(array, i)}</span>
                    <img src="${getPokemonImg(array, i)}" alt="No Image found!" class="pokemon-img">
                </div>
                <div class="pokedex-card-body">
                    <span class="pokemon-name">${getPokemonName(array, i)}</span>
                    <br>
                    <div class="pokemon-types">
                        <span class="pokemon-type" style="background-color: ${getPokemonTypeHexColor(getPokemonType(array, i, 0))}">${capitalize(getPokemonType(array, i, 0))}</span>
                        <span class="pokemon-type ${getPokemonType(array, i, 1)}" style="background-color: ${getPokemonTypeHexColor(getPokemonType(array, i, 1))}">${capitalize(getPokemonType(array, i, 1))}</span>
                    </div>
                </div>
            </div>
        `;
}

/**
 * Help function: Returns HTML code
 * @param {Array} array The array with the Pokémon
 * @param {number} i The current Pokémon
 * @returns HTML-Code
 */
function generatePokemonDetailsCardHTML(array, i) {
    return `
        <div class="pokemon-details-card" onclick="event.stopPropagation()">
        <button id="next-pokemon-left-btn" class="nav-btn nav-btn-left btn" onclick="nextPokemonLeft(${getArrayNameAsString(array)}, ${i})"><img src="./assets/img/icons/arrow_left.svg" alt="Arrow Left" title="Left!"></button>
            <div class="pokemon-details-header">
                <button onclick="closePokemonDetails()" class="close-details-btn btn" title="Close!">
                    <img src="./assets/img/icons/close.svg" alt="Close">
                </button>
                <img src="${getPokemonImg(array, i)}" alt="No Image found!" class="pokemon-img pokemon-details-img">
            </div>
            <div class="pokemon-details-body">
                <div class="pokemon-name-container">
                    <span class="pokemon-name pokemon-details-name">${getPokemonName(array, i)}</span>
                    <span class="pokemon-details-id">#${getPokemonID(array, i)}</span>
                    <button class="favorite-btn btn" title="Save me!" onclick="setFavoritePokemon(${getArrayNameAsString(array)}, ${i}, ${getPokemonID(array, i)})">
                        <img src="${getPokemonFavoriteState(array, i)}" alt="Favorite" id="fav-icon-pokemon-index-${i}">
                    </button>
                </div>
                <div class="pokemon-stats">
                    <div class="pokemon-stat">
                        <span class="pokemon-properties pokemon-stat-description">HP</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-hp" role="progressbar" style="width: ${getPokemonStatPercent(array, i, 0)}%" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">${getPokemonStat(array, i, 0)}</div>
                        </div>
                        <span class="pokemon-properties">255</span>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-properties pokemon-stat-description">ATK</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-atk" role="progressbar" style="width: ${getPokemonStatPercent(array, i, 1)}%" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">${getPokemonStat(array, i, 1)}</div>
                        </div>
                        <span class="pokemon-properties">255</span>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-properties pokemon-stat-description">DEF</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-def" role="progressbar" style="width: ${getPokemonStatPercent(array, i, 2)}%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">${getPokemonStat(array, i, 2)}</div>
                        </div>
                        <span class="pokemon-properties">255</span>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-properties pokemon-stat-description">S-ATK</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-s-atk" role="progressbar" style="width: ${getPokemonStatPercent(array, i, 3)}%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">${getPokemonStat(array, i, 3)}</div>
                        </div>
                        <span class="pokemon-properties">255</span>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-properties pokemon-stat-description">S-DEF</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-s-def" role="progressbar" style="width: ${getPokemonStatPercent(array, i, 4)}%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">${getPokemonStat(array, i, 4)}</div>
                        </div>
                        <span class="pokemon-properties">255</span>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-properties pokemon-stat-description">SPEED</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-speed" role="progressbar" style="width: ${getPokemonStatPercent(array, i, 5)}%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">${getPokemonStat(array, i, 5)}</div>
                        </div>
                        <span class="pokemon-properties">255</span>
                    </div>
                </div>
            </div>
            <div class="pokemon-details-footer">
                <div>
                    <span class="pokemon-properties-description">Height: </span><span class="pokemon-properties">${getPokemonProperties(array, i, 'height') / 10}m</span>
                    <span class="pokemon-properties-description">Weight: </span><span class="pokemon-properties">${getPokemonProperties(array, i, 'weight') / 10}kg</span>
                </div>
                <div>
                    <span class="pokemon-properties-description">Abilities:</span>
                    <span class="pokemon-properties">${getPokemonAbilities(array, i, 0)}</span>
                    <span class="pokemon-properties ${getPokemonAbilities(array, i, 1)}">/ ${getPokemonAbilities(array, i, 1)}</span>
                    <span class="pokemon-properties ${getPokemonAbilities(array, i, 2)}">/ ${getPokemonAbilities(array, i, 2)}</span>
                </div>
            </div>
            <button id="next-pokemon-right-btn" class="nav-btn nav-btn-right btn" onclick="nextPokemonRight(${getArrayNameAsString(array)}, ${i})"><img src="./assets/img/icons/arrow_right.svg" alt="Arrow Right" title="Right!"></button>
        </div>
    `;
}

/**
 * Help function: Returns HTML code
 * @returns HTML-Code
 */
function generateEmptyHTML() {
    return `
        <div class="empty-container">
            <span class="empty-text">Uh Oh...</span>
            <img src="./assets/img/psyduck.png" ald="Empty" class="empty-img">
            <span class="empty-text">Nothing to see here :(</span>
        </div>
    `;
}