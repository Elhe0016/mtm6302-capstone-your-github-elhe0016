const search_term = document.getElementById('search_q');
const search_btn = document.getElementById('search-btn');

// api https://pokeapi.co/
const getPokemonData = async term => {
  document.getElementById('show_error').classList.remove('show');
  document.getElementById('show_error').classList.add('hidden');

  const url = `https://pokeapi.co/api/v2/pokemon/${term}`;
  const response = await fetch(url);

  if (response.status === 404 || response.statusText === 'Not Found') {
    document.getElementById('show_error').classList.add('show');
    document.getElementById('show_error').classList.remove('hidden');
    return;
  }

  const pokemon = await response.json();

  // update ui with data
  document.getElementById('update_img').setAttribute('src', pokemon.sprites.other.dream_world.front_default);
  document.getElementById('update_name').innerHTML = pokemon.name;
  document.getElementById('update_candy_title').innerHTML = `${pokemon.name} Candy`;
  document.getElementById('update_hp').innerHTML = `HP ${Math.floor((Math.random() * pokemon.stats[0].base_stat) + 1)}/${pokemon.stats[0].base_stat}`;
  document.getElementById('update_cp').innerHTML = `XP ${pokemon.base_experience}`;
  document.getElementById('update_type').innerHTML = `${pokemon.types[0].type.name} / ${pokemon.types[1]?.type.name || ''}`;
  document.getElementById('update_weight').innerHTML = `${pokemon.weight}kg`;
  document.getElementById('update_height').innerHTML = `0.${pokemon.height}m`;
  document.getElementById('update_stardust').innerHTML = Math.floor((Math.random() * 10000) + 1);
  document.getElementById('update_candy').innerHTML = Math.floor((Math.random() * 200) + 1);
};

search_btn.addEventListener('click', () => getPokemonData(search_term.value));

// image gallery
const galleryContainer = document.getElementById('gallery-container');
const pokemonArray = [];

/* First API fetch call to return names and URL's of first 50 Pokemon after promise is resolved.*/
fetch('https://pokeapi.co/api/v2/pokemon/?limit=50')
  .then(response => response.json())
  .then(data => {
    let results = data.results;
    let promisesArray = results.map(result => {
      return fetch(result.url).then(response => response.json()).then(data => pokemonArray.push(data));
    })
    return Promise.all(promisesArray)
  })
  .then(() => {
    pokemonArray.forEach(pokemon => {
      const img = document.createElement('img');
      img.src = pokemon.sprites.other.dream_world.front_default;
      galleryContainer.appendChild(img);
    });
  });
  
// get caught pokemon list from local storage or initialize an empty array
let caughtPokemonList = JSON.parse(localStorage.getItem('caughtPokemonList')) || [];

// function to add a pokemon to the caught list
const addPokemonToCaughtList = (pokemon) => {
  // check if the pokemon is already in the caught list
  const index = caughtPokemonList.findIndex(p => p.id === pokemon.id);
  if (index !== -1) {
    // pokemon already exists in the list, no need to add it again
    return;
  }
  // add the pokemon to the caught list
  caughtPokemonList.push(pokemon);
  // save the updated caught list to local storage
  localStorage.setItem('caughtPokemonList', JSON.stringify(caughtPokemonList));
};

// function to remove a pokemon from the caught list
const removePokemonFromCaughtList = (pokemon) => {
  // find the index of the pokemon in the caught list
  const index = caughtPokemonList.findIndex(p => p.id === pokemon.id);
  if (index !== -1) {
    // pokemon found in the caught list, remove it
    caughtPokemonList.splice(index, 1);
    // save the updated caught list to local storage
    localStorage.setItem('caughtPokemonList', JSON.stringify(caughtPokemonList));
  }
};

// function to update the UI to reflect the caught status of a pokemon
const updateCaughtStatus = (pokemon, isCaught) => {
  // find the pokemon in the gallery and update its UI
  const galleryPokemon = pokemonArray.find(p => p.id === pokemon.id);
  if (galleryPokemon) {
    const galleryPokemonElement = galleryContainer.querySelector(`[data-id="${pokemon.id}"]`);
    if (isCaught) {
      // add the "caught" class to the pokemon's UI
      galleryPokemonElement.classList.add('caught');
      // add the pokemon to the caught list
      addPokemonToCaughtList(pokemon);
    } else {
      // remove the "caught" class from the pokemon's UI
      galleryPokemonElement.classList.remove('caught');
      // remove the pokemon from the caught list
      removePokemonFromCaughtList(pokemon);
    }
  }
};


// function to initialize the caught status of all pokemon in the gallery
const initializeCaughtStatus = () => {
  caughtPokemonList.forEach(pokemon => {
    const galleryPokemonElement = galleryContainer.querySelector(`[data-id="${pokemon.id}"]`);
    if (galleryPokemonElement) {
      // add the "caught" class to the pokemon's UI
      galleryPokemonElement.classList.add('caught');
    }
  });
};
initializeCaughtStatus();

// event listener for clicking on a pokemon in the gallery
galleryContainer.addEventListener('click', event => {
  const clickedElement = event.target.closest('.pokemon');
  if (clickedElement) {
    const pokemonId = parseInt(clickedElement.dataset.id);
    const pokemon = pokemonArray.find(p => p.id === pokemonId);
    if (pokemon) {
      const isCaught = clickedElement.classList.contains('caught');
      updateCaughtStatus(pokemon, !isCaught);
    }
  }
});

