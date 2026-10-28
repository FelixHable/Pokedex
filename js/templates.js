function generatePokedexCardHTML(array, i) {
    const primaryType = getPokemonType(array, i, 0);
    const typeColor = getPokemonTypeHexColor(primaryType);

    return `
        <div class="pokedex-card" onclick="showPokemonDetails(${getArrayNameAsString(array)}, ${i})"> 
            <div class="pokedex-card-header" style="background: linear-gradient(135deg, ${typeColor}aa 0%, ${typeColor}cc 100%);">
                <span class="pokemon-id">#${getPokemonID(array, i)}</span>
                <img src="${getPokemonImg(array, i)}" alt="${getPokemonName(array, i)}" class="pokemon-img">
            </div>
            <div class="pokedex-card-body">
                <span class="pokemon-name">${getPokemonName(array, i)}</span>
                <div class="pokemon-types">
                    <span class="pokemon-type" style="background-color: ${typeColor}">${capitalize(primaryType)}</span>
                    <span class="pokemon-type ${getPokemonType(array, i, 1)}" style="background-color: ${getPokemonTypeHexColor(getPokemonType(array, i, 1))}">${capitalize(getPokemonType(array, i, 1))}</span>
                </div>
            </div>
        </div>
    `;
}

function generatePokemonDetailsCardHTML(array, i) {
    const primaryType = getPokemonType(array, i, 0);
    const typeColor = getPokemonTypeHexColor(primaryType);

    return `
        <div class="pokemon-details-card" onclick="event.stopPropagation()">
            <button id="next-pokemon-left-btn" class="nav-btn nav-btn-left btn" onclick="nextPokemonLeft(${getArrayNameAsString(array)}, ${i})" title="Previous Pokémon">
                <img src="icons/arrowleft.png" alt="Left">
            </button>
            <div class="pokemon-details-header" style="background: linear-gradient(135deg, ${typeColor}bb 0%, ${typeColor}ee 100%);">
                <button onclick="closePokemonDetails()" class="close-details-btn btn" title="Close">
                    <img src="icons/close.png" alt="Close">
                </button>
                <img src="${getPokemonImg(array, i)}" alt="${getPokemonName(array, i)}" class="pokemon-img pokemon-details-img">
            </div>
            <div class="pokemon-details-body">
                <div class="pokemon-name-container">
                    <span class="pokemon-name pokemon-details-name">${getPokemonName(array, i)}</span>
                    <span class="pokemon-details-id">#${getPokemonID(array, i)}</span>
                    <button class="favorite-btn btn" title="Save as Favorite" onclick="setFavoritePokemon(${getArrayNameAsString(array)}, ${i}, ${getPokemonID(array, i)})">
                        <img src="${getPokemonFavoriteState(array, i)}" alt="Favorite" id="fav-icon-pokemon-index-${i}">
                    </button>
                </div>
                <div class="pokemon-stats">
                    <div class="pokemon-stat">
                        <span class="pokemon-stat-description">HP</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-hp" style="width: ${getPokemonStatPercent(array, i, 0)}%">${getPokemonStat(array, i, 0)}</div>
                        </div>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-stat-description">ATK</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-atk" style="width: ${getPokemonStatPercent(array, i, 1)}%">${getPokemonStat(array, i, 1)}</div>
                        </div>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-stat-description">DEF</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-def" style="width: ${getPokemonStatPercent(array, i, 2)}%">${getPokemonStat(array, i, 2)}</div>
                        </div>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-stat-description">S-ATK</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-s-atk" style="width: ${getPokemonStatPercent(array, i, 3)}%">${getPokemonStat(array, i, 3)}</div>
                        </div>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-stat-description">S-DEF</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-s-def" style="width: ${getPokemonStatPercent(array, i, 4)}%">${getPokemonStat(array, i, 4)}</div>
                        </div>
                    </div>
                    <div class="pokemon-stat">
                        <span class="pokemon-stat-description">SPEED</span>
                        <div class="progress">
                            <div class="progress-bar pokemon-stat-speed" style="width: ${getPokemonStatPercent(array, i, 5)}%">${getPokemonStat(array, i, 5)}</div>
                        </div>
                    </div>
                </div>
            </div>
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
            <button id="next-pokemon-right-btn" class="nav-btn nav-btn-right btn" onclick="nextPokemonRight(${getArrayNameAsString(array)}, ${i})" title="Next Pokémon">
                <img src="icons/arrowright.png" alt="Right">
            </button>
        </div>
    `;
}

function generateEmptyHTML() {
    return `
        <div class="empty-container">
            <span class="empty-text">Oops...</span>
            <span class="empty-text">No Pokémon found!</span>
        </div>
    `;
}