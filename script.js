document.addEventListener("DOMContentLoaded", () => {
  // --- GLOBAL CONFIGURATION ---
  // Centralized configuration for easy updates between seasons or game versions.
  // This is the primary place to modify game-specific values.
  const GameConfig = {
    // Level Prefixes for square labels
    LEVEL_PREFIXES: {
      L1: "LV. 1 ",
      L2: "LV. 2 ",
      L3: "LV. 3 ",
      L4: "LV. 4 ",
      L5: "LV. 5 ",
    },
    // Resource levels (if applicable, though not directly used in display here)
    RESOURCE_LEVELS: {
      LEVEL_1: 2.5,
      LEVEL_2: 5,
      LEVEL_3: 7.5,
      LEVEL_4: 10,
      LEVEL_5: 12.5,
    },
    // Percentage values (if applicable, though not directly used in display here)
    PERCENTAGES: {
      P2_5: 2.5,
      P3: 3,
      P5: 5,
      P7_5: 7.5,
      P10: 10,
      P12_5: 12.5,
      P15: 15,
    },
    // Define all possible boost types. Easily extendable.
    BoostTypes: {
      RESOURCE_YIELD: "Resource Yield Boost",
      SAWMILL_YIELD: "Sawmill Yield Boost",
      MINE_YIELD: "Mine Yield Boost",
      RANCH_YIELD: "Ranch Yield Boost",
      GATHERING_SPEED: "Gathering Speed Boost",
      TIMBER_GATHERING_SPEED: "Timber Gathering Speed",
      STONE_GATHERING_SPEED: "Stone Gathering Speed",
      RUBY_GATHERING_SPEED: "Ruby Gathering Speed",
      CONSTRUCTION_SPEED: "Construction Speed",
      TECH_RESEARCH_SPEED: "Tech Research Speed",
      MARCHING_SPEED: "Marching Speed Boost",
      SOLDIER_LOAD: "Soldier Load",
      SOLDIER_TRAINING_SPEED: "Soldier Training Speed",
      SOLDIER_HEALING_SPEED: "Soldier Healing Speed",
      SOLDIER_LOSS: "Soldier Losses",
      DECREASE_DEFENSIVE_LOSSES: "Decrease Soldier Losses on the Defensive",
      DECREASE_ATTACKING_LOSSES: "Decrease Soldier Losses When Attacking",
      INCREASED_DAMAGE_WORLD_MAP: "Increased Damage in World Map Battles",
      REDUCED_DAMAGE_WORLD_MAP: "Reduced Damage in World Map Battles",
      GUILD_REFRESH_RESOURCES: "Guild Can Refresh Resources in This Area",
      GUILD_REFRESH_GUARDIANS: "Guild Can Refresh Guardians in This Area",
      STAMINA_CAP: "Stamina Cap",
      // --- SEASON-SPECIFIC RESOURCE ---
      // This is the key variable to change for new seasons.
      SEASONAL_RESOURCE_NAME: "Water Resource",
    },
    // Colors for different planning days
    DAY_COLORS: [
      "rgba(255, 99, 71, 0.7)", // Day 1 (Tomato)
      "rgba(60, 179, 113, 0.7)", // Day 2 (MediumSeaGreen)
      "rgba(100, 149, 237, 0.7)", // Day 3 (CornflowerBlue)
      "rgba(255, 215, 0, 0.7)", // Day 4 (Gold)
      "rgba(186, 85, 211, 0.7)", // Day 5 (MediumOrchid)
    ],
    INTER_DAY_ARROW_COLOR: "rgba(75, 0, 130, 0.9)", // Indigo for inter-day connections
    MAX_HELD_RUINS_PER_DAY: 4,
    LOCAL_STORAGE_KEY: "guildMapPlan",
  };

  const {
    LEVEL_PREFIXES,
    BoostTypes,
    DAY_COLORS,
    INTER_DAY_ARROW_COLOR,
    MAX_HELD_RUINS_PER_DAY,
    LOCAL_STORAGE_KEY,
  } = GameConfig;

  // --- UI ELEMENT REFERENCES ---
  // Grouping all DOM element queries for clarity and easier debugging.
  const UI_ELEMENTS = {
    squares: document.querySelectorAll(".clickable-square"),
    daySelect: document.getElementById("day-select"),
    selectedCountDisplay: document.getElementById("selected-count"),
    clearDayButton: document.getElementById("clear-day-button"),
    clearAllButton: document.getElementById("clear-all-button"),
    tooltip: document.getElementById("tooltip"),
    currentColorDisplay: document.getElementById("currentColorDisplay"),
    mapContainer: document.getElementById("map-container"), // Not directly used in JS, but good to have
    svgLayer: document.getElementById("arrow-svg-layer"),
    boostSummaryContainer: document.getElementById("boost-summary-content"),
    modalOverlay: document.getElementById("modal-overlay"),
    modalMessage: document.getElementById("modal-message"),
    modalPromptInput: document.getElementById("modal-prompt-input"),
    modalConfirmButton: document.getElementById("modal-confirm-button"),
    modalCancelButton: document.getElementById("modal-cancel-button"),
    modalPromptConfirmButton: document.getElementById(
      "modal-prompt-confirm-button"
    ),
    modalPromptCancelButton: document.getElementById(
      "modal-prompt-cancel-button"
    ),
    modalTitle: document.getElementById("modal-title"),
    modalPromptTitle: document.getElementById("modal-prompt-title"),
    messageModal: document.getElementById("message-modal"),
    promptModal: document.getElementById("prompt-modal"),
  };

  // Check if essential UI elements are found
  for (const key in UI_ELEMENTS) {
    if (key !== "squares" && !UI_ELEMENTS[key]) {
      console.error(
        `UI Element '${key}' not found. Please ensure it exists in the HTML.`
      );
    }
  }
  if (!UI_ELEMENTS.squares || UI_ELEMENTS.squares.length === 0) {
    console.error("No elements with class 'clickable-square' found.");
  }

  // --- GAME STATE ---
  let currentPlanningDay = 1;
  // planData stores the selected squares for each day.
  // Example: { 1: [{ id: "wind_stone", order: 0 }], 2: [...] }
  let planData = {};

  // --- SQUARE PROPERTIES DATA ---
  // Helper function to create a square property entry.
  // This ensures consistency and simplifies defining new squares.
  const createSquareProperty = (levelPrefix, name, boostsArray) => {
    // Dynamically generate the 'details' string from the 'boosts' array
    const details = boostsArray
      .map((boost) => {
        let value = boost.value;
        let unit = boost.unit || "";
        if (value === 0 && unit === "") {
          return boost.type; // For non-numerical boosts like Guild Refresh
        }
        // Handle negative values for display (e.g., -5% instead of +-5%)
        const sign = value >= 0 ? "+" : "";
        return `${boost.type}: ${sign}${value}${unit}`;
      })
      .join("\n");

    return {
      label: `${levelPrefix}${name}`,
      details: `${details}`,
      boosts: boostsArray,
    };
  };

  // !!! YOU WILL NEED TO POPULATE THIS OBJECT FOR ALL YOUR SQUARES !!!
  // The 'key' (e.g., 'wind_stone') MUST match the ID of the div in your HTML.
  // Add a 'boosts' array with structured data for calculations.
  const squareProperties = {
    wind_stone: createSquareProperty(LEVEL_PREFIXES.L1, "Wind Stone", [
      { type: BoostTypes.RANCH_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    desert: createSquareProperty(LEVEL_PREFIXES.L1, "Desert", [
      { type: BoostTypes.SOLDIER_TRAINING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    coast: createSquareProperty(LEVEL_PREFIXES.L1, "Coast", [
      { type: BoostTypes.CONSTRUCTION_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    river: createSquareProperty(LEVEL_PREFIXES.L1, "River", [
      { type: BoostTypes.TECH_RESEARCH_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    tundra: createSquareProperty(LEVEL_PREFIXES.L1, "Tundra", [
      { type: BoostTypes.MARCHING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    salt_lake: createSquareProperty(LEVEL_PREFIXES.L1, "Salt Lake", [
      { type: BoostTypes.GATHERING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    reef: createSquareProperty(LEVEL_PREFIXES.L1, "Reef", [
      { type: BoostTypes.MINE_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    temple: createSquareProperty(LEVEL_PREFIXES.L2, "Temple", [
      { type: BoostTypes.TIMBER_GATHERING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    culture: createSquareProperty(LEVEL_PREFIXES.L2, "Culture", [
      { type: BoostTypes.REDUCED_DAMAGE_WORLD_MAP, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    tradition: createSquareProperty(LEVEL_PREFIXES.L2, "Tradition", [
      { type: BoostTypes.DECREASE_DEFENSIVE_LOSSES, value: -5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    sites: createSquareProperty(LEVEL_PREFIXES.L2, "Sites", [
      { type: BoostTypes.INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    mystery: createSquareProperty(LEVEL_PREFIXES.L2, "Mystery", [
      { type: BoostTypes.RUBY_GATHERING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    faith: createSquareProperty(LEVEL_PREFIXES.L2, "Faith", [
      { type: BoostTypes.STONE_GATHERING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    frost_ridge_first: createSquareProperty(LEVEL_PREFIXES.L1, "Frost Ridge", [
      { type: BoostTypes.SAWMILL_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    old_well: createSquareProperty(LEVEL_PREFIXES.L3, "Old Well", [
      { type: BoostTypes.TIMBER_GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.RUBY_GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    esteem: createSquareProperty(LEVEL_PREFIXES.L3, "Esteem", [
      { type: BoostTypes.STAMINA_CAP, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    trench: createSquareProperty(LEVEL_PREFIXES.L4, "Trench", [
      { type: BoostTypes.SOLDIER_LOSS, value: -5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    honor: createSquareProperty(LEVEL_PREFIXES.L3, "Honor", [
      { type: BoostTypes.INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    defense: createSquareProperty(LEVEL_PREFIXES.L3, "Defense", [
      { type: BoostTypes.INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    warrior: createSquareProperty(LEVEL_PREFIXES.L3, "Warrior", [
      { type: BoostTypes.SOLDIER_LOAD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    karst: createSquareProperty(LEVEL_PREFIXES.L1, "Karst", [
      { type: BoostTypes.SAWMILL_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    snow_peak: createSquareProperty(LEVEL_PREFIXES.L1, "Snow Peak", [
      { type: BoostTypes.MINE_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    altar_first: createSquareProperty(LEVEL_PREFIXES.L2, "Altar", [
      { type: BoostTypes.STONE_GATHERING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    city_wall: createSquareProperty(LEVEL_PREFIXES.L3, "City Wall", [
      { type: BoostTypes.MARCHING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    castle: createSquareProperty(LEVEL_PREFIXES.L4, "Castle", [
      { type: BoostTypes.TECH_RESEARCH_SPEED, value: 15, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    sanctuary_first: createSquareProperty(LEVEL_PREFIXES.L3, "Sanctuary", [
      { type: BoostTypes.TECH_RESEARCH_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    battlefield: createSquareProperty(LEVEL_PREFIXES.L4, "Battlefield", [
      { type: BoostTypes.GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    shelter: createSquareProperty(LEVEL_PREFIXES.L5, "Shelter", [
      { type: BoostTypes.GUILD_REFRESH_GUARDIANS, value: 0, unit: "" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 12.5, unit: "%" },
    ]),
    resource: createSquareProperty(LEVEL_PREFIXES.L5, "Resource", [
      { type: BoostTypes.GUILD_REFRESH_RESOURCES, value: 0, unit: "" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 12.5, unit: "%" },
    ]),
    fortress: createSquareProperty(LEVEL_PREFIXES.L4, "Fortress", [
      { type: BoostTypes.INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    royalty: createSquareProperty(LEVEL_PREFIXES.L3, "Royalty", [
      { type: BoostTypes.SOLDIER_HEALING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    garden: createSquareProperty(LEVEL_PREFIXES.L3, "Garden", [
      { type: BoostTypes.CONSTRUCTION_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    legend: createSquareProperty(LEVEL_PREFIXES.L2, "Legend", [
      { type: BoostTypes.SOLDIER_TRAINING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    swamp: createSquareProperty(LEVEL_PREFIXES.L1, "Swamp", [
      { type: BoostTypes.RANCH_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    ice_fields: createSquareProperty(LEVEL_PREFIXES.L1, "Ice Fields", [
      { type: BoostTypes.GATHERING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    stele: createSquareProperty(LEVEL_PREFIXES.L2, "Stele", [
      { type: BoostTypes.RUBY_GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    stone_pillar: createSquareProperty(LEVEL_PREFIXES.L3, "Stone Pillar", [
      { type: BoostTypes.CONSTRUCTION_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    guardian: createSquareProperty(LEVEL_PREFIXES.L5, "Guardian", [
      { type: BoostTypes.GUILD_REFRESH_GUARDIANS, value: 0, unit: "" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 12.5, unit: "%" },
    ]),
    king_square: {
      label: "King's Castle",
      details: `Central Point`,
      boosts: [],
    },
    guard: createSquareProperty(LEVEL_PREFIXES.L5, "Guard", [
      { type: BoostTypes.GUILD_REFRESH_GUARDIANS, value: 0, unit: "" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 12.5, unit: "%" },
    ]),
    war: createSquareProperty(LEVEL_PREFIXES.L4, "War", [
      { type: BoostTypes.GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    symbol: createSquareProperty(LEVEL_PREFIXES.L2, "Symbol", [
      { type: BoostTypes.INCREASED_DAMAGE_WORLD_MAP, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    canyon: createSquareProperty(LEVEL_PREFIXES.L1, "Canyon", [
      { type: BoostTypes.SOLDIER_TRAINING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    stone_wall: createSquareProperty(LEVEL_PREFIXES.L3, "Stone Wall", [
      { type: BoostTypes.TECH_RESEARCH_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    remants: createSquareProperty(LEVEL_PREFIXES.L2, "Remnants", [
      { type: BoostTypes.DECREASE_DEFENSIVE_LOSSES, value: -5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    glacier: createSquareProperty(LEVEL_PREFIXES.L1, "Glacier", [
      { type: BoostTypes.CONSTRUCTION_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    rift: createSquareProperty(LEVEL_PREFIXES.L1, "Rift", [
      { type: BoostTypes.MARCHING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    plaza: createSquareProperty(LEVEL_PREFIXES.L2, "Plaza", [
      { type: BoostTypes.SOLDIER_HEALING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    sanctuary_second: createSquareProperty(LEVEL_PREFIXES.L3, "Sanctuary", [
      { type: BoostTypes.TECH_RESEARCH_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    aqueduct: createSquareProperty(LEVEL_PREFIXES.L3, "Aqueduct", [
      { type: BoostTypes.SOLDIER_LOAD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    warflames: createSquareProperty(LEVEL_PREFIXES.L4, "Warflames", [
      { type: BoostTypes.REDUCED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    barracks: createSquareProperty(LEVEL_PREFIXES.L4, "Barracks", [
      { type: BoostTypes.INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    treasure: createSquareProperty(LEVEL_PREFIXES.L5, "Treasure", [
      { type: BoostTypes.GUILD_REFRESH_RESOURCES, value: 0, unit: "" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 12.5, unit: "%" },
    ]),
    dominion: createSquareProperty(LEVEL_PREFIXES.L4, "Dominion", [
      { type: BoostTypes.SOLDIER_HEALING_SPEED, value: 15, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    conquest: createSquareProperty(LEVEL_PREFIXES.L4, "Conquest", [
      { type: BoostTypes.SOLDIER_LOSS, value: -10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 12.5, unit: "%" },
    ]),
    tomb: createSquareProperty(LEVEL_PREFIXES.L3, "Tomb", [
      { type: BoostTypes.STAMINA_CAP, value: -10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 12.5, unit: "%" },
    ]),
    sacrifice: createSquareProperty(LEVEL_PREFIXES.L3, "Sacrifice", [
      { type: BoostTypes.TIMBER_GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.STONE_GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.RUBY_GATHERING_SPEED, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 10, unit: "%" },
    ]),
    well: createSquareProperty(LEVEL_PREFIXES.L3, "Well", [
      { type: BoostTypes.MARCHING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    cave: createSquareProperty(LEVEL_PREFIXES.L1, "Cave", [
      { type: BoostTypes.TECH_RESEARCH_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    hot_stone: createSquareProperty(LEVEL_PREFIXES.L1, "Hot Stone", [
      { type: BoostTypes.TECH_RESEARCH_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    fountain: createSquareProperty(LEVEL_PREFIXES.L2, "Fountain", [
      { type: BoostTypes.DECREASE_DEFENSIVE_LOSSES, value: -3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    cellar: createSquareProperty(LEVEL_PREFIXES.L2, "Cellar", [
      { type: BoostTypes.TIMBER_GATHERING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    bell_tower: createSquareProperty(LEVEL_PREFIXES.L2, "Bell Tower", [
      { type: BoostTypes.RANCH_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    shrine: createSquareProperty(LEVEL_PREFIXES.L2, "Shrine", [
      { type: BoostTypes.STONE_GATHERING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    church: createSquareProperty(LEVEL_PREFIXES.L2, "Church", [
      { type: BoostTypes.GATHERING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    monastery: createSquareProperty(LEVEL_PREFIXES.L2, "Monastery", [
      { type: BoostTypes.SOLDIER_HEALING_SPEED, value: 5, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    volcano: createSquareProperty(LEVEL_PREFIXES.L1, "Volcano", [
      { type: BoostTypes.CONSTRUCTION_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    lost_sand: createSquareProperty(LEVEL_PREFIXES.L1, "Lost Sand", [
      { type: BoostTypes.SOLDIER_TRAINING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    statue: createSquareProperty(LEVEL_PREFIXES.L2, "Statue", [
      { type: BoostTypes.REDUCED_DAMAGE_WORLD_MAP, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 7.5, unit: "%" },
    ]),
    frost_ridge_second: createSquareProperty(LEVEL_PREFIXES.L1, "Frost Ridge", [
      { type: BoostTypes.RANCH_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    haze_rain: createSquareProperty(LEVEL_PREFIXES.L1, "Haze Rain", [
      { type: BoostTypes.SAWMILL_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    stream: createSquareProperty(LEVEL_PREFIXES.L1, "Stream", [
      { type: BoostTypes.MINE_YIELD, value: 10, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 5, unit: "%" },
    ]),
    vine: createSquareProperty(LEVEL_PREFIXES.L1, "Vine", [
      { type: BoostTypes.GATHERING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
    rainforest: createSquareProperty(LEVEL_PREFIXES.L1, "Rainforest", [
      { type: BoostTypes.MARCHING_SPEED, value: 3, unit: "%" },
      { type: BoostTypes.SEASONAL_RESOURCE_NAME, value: 2.5, unit: "%" },
    ]),
  };

  // --- INITIALIZATION ---
  function initialize() {
    currentPlanningDay = parseInt(UI_ELEMENTS.daySelect.value);
    loadPlanFromLocalStorage();
    updateAllSquareAppearances();
    updateSelectedCountDisplay();
    updateCurrentColorDisplay();
    setupEventListeners();
    drawAllArrows();
    displayTotalBoosts();
  }

  function setupEventListeners() {
    UI_ELEMENTS.daySelect.addEventListener("change", (e) => {
      currentPlanningDay = parseInt(e.target.value);
      updateSelectedCountDisplay();
      updateCurrentColorDisplay();
      // Arrows are persistent, no need to redraw on day change unless plan for THIS day changes
    });

    UI_ELEMENTS.squares.forEach((square) => {
      square.addEventListener("click", () => handleSquareClick(square));
      square.addEventListener("mousemove", (e) => showTooltip(e, square));
      square.addEventListener("mouseout", hideTooltip);
    });

    UI_ELEMENTS.clearDayButton.addEventListener("click", clearCurrentDayPlan);
    UI_ELEMENTS.clearAllButton.addEventListener("click", clearEntirePlan);

    // Modal buttons event listeners
    UI_ELEMENTS.modalConfirmButton.addEventListener("click", () =>
      resolveModal(true)
    );
    UI_ELEMENTS.modalCancelButton.addEventListener("click", () =>
      resolveModal(false)
    );
    UI_ELEMENTS.modalPromptConfirmButton.addEventListener("click", () =>
      resolvePromptModal(true)
    );
    UI_ELEMENTS.modalPromptCancelButton.addEventListener("click", () =>
      resolvePromptModal(false)
    );
  }

  // --- MODAL DIALOGS (replacing alert/prompt) ---
  let modalResolver = null;

  /**
   * Displays a custom message modal.
   * @param {string} message - The message to display.
   * @param {string} title - The title of the modal.
   * @returns {Promise<boolean>} Resolves true if confirmed, false if canceled.
   */
  function showMessageModal(message, title = "Notification") {
    return new Promise((resolve) => {
      UI_ELEMENTS.modalTitle.textContent = title;
      UI_ELEMENTS.modalMessage.innerHTML = message;
      UI_ELEMENTS.messageModal.classList.remove("hidden");
      UI_ELEMENTS.modalOverlay.classList.remove("hidden");
      modalResolver = resolve;
    });
  }

  /**
   * Displays a custom prompt modal.
   * @param {string} message - The message to display.
   * @param {string} title - The title of the modal.
   * @param {string} defaultValue - The default value for the input field.
   * @returns {Promise<string|null>} Resolves with the input value if confirmed, null if canceled.
   */
  function showPromptModal(
    message,
    title = "Input Required",
    defaultValue = ""
  ) {
    return new Promise((resolve) => {
      UI_ELEMENTS.modalPromptTitle.textContent = title;
      UI_ELEMENTS.modalPromptInput.value = defaultValue;
      UI_ELEMENTS.modalMessage.innerHTML = message; // Reusing modalMessage for prompt message
      UI_ELEMENTS.promptModal.classList.remove("hidden");
      UI_ELEMENTS.modalOverlay.classList.remove("hidden");
      modalResolver = resolve;
    });
  }

  /**
   * Resolves the current message modal and hides it.
   * @param {boolean} result - The result to resolve the promise with.
   */
  function resolveModal(result) {
    if (modalResolver) {
      modalResolver(result);
      modalResolver = null;
    }
    UI_ELEMENTS.messageModal.classList.add("hidden");
    UI_ELEMENTS.modalOverlay.classList.add("hidden");
  }

  /**
   * Resolves the current prompt modal and hides it.
   * @param {boolean} confirmed - True if the user confirmed, false if canceled.
   */
  function resolvePromptModal(confirmed) {
    let result = null;
    if (confirmed) {
      result = UI_ELEMENTS.modalPromptInput.value;
    }
    if (modalResolver) {
      modalResolver(result);
      modalResolver = null;
    }
    UI_ELEMENTS.promptModal.classList.add("hidden");
    UI_ELEMENTS.modalOverlay.classList.add("hidden");
  }

  // --- TOOLTIP ---
  function showTooltip(event, squareElement) {
    const squareId = squareElement.id;
    const properties = squareProperties[squareId];
    let tooltipContent = "";

    if (properties) {
      tooltipContent = `<strong>${properties.label || squareId}</strong>`;
      if (properties.details) {
        tooltipContent += `<br>${properties.details.replace(/\n/g, "<br>")}`;
      }
    } else {
      tooltipContent = squareElement.dataset.name || `ID: ${squareId}`;
    }

    UI_ELEMENTS.tooltip.innerHTML = tooltipContent;
    UI_ELEMENTS.tooltip.style.display = "block";
    UI_ELEMENTS.tooltip.style.left = event.clientX + 15 + "px";
    UI_ELEMENTS.tooltip.style.top = event.clientY + 10 + "px";
  }

  function hideTooltip() {
    UI_ELEMENTS.tooltip.style.display = "none";
  }

  // --- PLAN MANAGEMENT LOGIC ---
  async function handleSquareClick(square) {
    const squareId = square.id;
    // Ensure planData for the current day is initialized as an array
    planData[currentPlanningDay] = planData[currentPlanningDay] || [];
    let dayPlan = planData[currentPlanningDay];

    // Find if the square is already selected for the current day
    const existingSquareIndex = dayPlan.findIndex((s) => s.id === squareId);

    if (existingSquareIndex > -1) {
      // If square is already selected for THIS day, deselect it
      dayPlan.splice(existingSquareIndex, 1);
      // Re-order the remaining squares for this day
      dayPlan.forEach((s, index) => (s.order = index));
      planData[currentPlanningDay] = dayPlan;
    } else {
      // Attempting to select a NEW square for this day
      // First, check if the square is already planned for ANY other day
      for (const day in planData) {
        if (
          parseInt(day) !== currentPlanningDay &&
          planData[day].some((s) => s.id === squareId)
        ) {
          await showMessageModal(
            `Square ${squareId} is already part of Day ${day}'s plan. Please clear it from Day ${day} to reassign.`
          );
          return; // Exit function if already planned elsewhere
        }
      }

      // Determine the next order value for the new square
      let newOrderValue =
        dayPlan.length > 0 ? Math.max(...dayPlan.map((s) => s.order)) + 1 : 0;

      if (dayPlan.length < MAX_HELD_RUINS_PER_DAY) {
        // If current day's plan has space, just add the square
        dayPlan.push({ id: squareId, order: newOrderValue });
      } else {
        // Current day's plan is FULL. Logic for dropping old squares.
        if (currentPlanningDay === 1) {
          // Day 1 has no previous day to drop from, so user must deselect manually
          await showMessageModal(
            `Day 1 plan is full (${MAX_HELD_RUINS_PER_DAY} ruins). You must manually deselect a ruin from Day 1 to add a new one.`
          );
          return; // Exit function if Day 1 is full
        }

        const previousDay = currentPlanningDay - 1;
        let previousDayPlan = planData[previousDay] || [];

        if (previousDayPlan.length === 0) {
          // No ruins from previous day to drop, so current day cannot accept new ones automatically
          await showMessageModal(
            `Day ${currentPlanningDay} plan is full (${MAX_HELD_RUINS_PER_DAY} ruins), and there are no ruins from Day ${previousDay} to drop. You must manually deselect one from Day ${currentPlanningDay}.`
          );
          return; // Exit function if previous day is empty
        }

        // Prompt user to select a square to drop from the previous day
        let promptMessage = `Day ${currentPlanningDay} is full. To add ${squareId}, you must drop a ruin from Day ${previousDay}.\n\nAvailable to drop from Day ${previousDay}:\n`;
        previousDayPlan
          .sort((a, b) => a.order - b.order)
          .forEach((s) => {
            const el = document.getElementById(s.id);
            const name =
              (el ? el.dataset.name : "") ||
              (squareProperties[s.id] ? squareProperties[s.id].label : s.id);
            promptMessage += `- ${s.id} (${name})\n`;
          });
        promptMessage += `\nEnter the ID of the square to drop from Day ${previousDay}, or type 'cancel'.`;

        const idToDropFromPrevious = await showPromptModal(
          promptMessage,
          "Drop Ruin from Previous Day"
        );

        if (
          !idToDropFromPrevious ||
          idToDropFromPrevious.toLowerCase() === "cancel"
        ) {
          await showMessageModal(
            "Operation cancelled. No square added or dropped."
          );
          return; // Exit function if user cancels
        }

        const prevDaySquareToDropIndex = previousDayPlan.findIndex(
          (s) => s.id === idToDropFromPrevious
        );
        if (prevDaySquareToDropIndex === -1) {
          await showMessageModal(
            `Invalid square ID '${idToDropFromPrevious}' or not found in Day ${previousDay}'s plan. Operation cancelled.`
          );
          return; // Exit function if invalid ID is entered
        }

        // Perform the drop from previous day and add to current day
        const droppedFromPrevInfo = previousDayPlan.splice(
          prevDaySquareToDropIndex,
          1
        )[0];
        // Re-order previous day's plan after removal
        previousDayPlan.forEach((s, index) => (s.order = index));
        planData[previousDay] = previousDayPlan;
        await showMessageModal(
          `Dropped ${droppedFromPrevInfo.id} from Day ${previousDay}.`
        );

        // Now, remove the oldest square from the current day to make space, then add the new one
        const droppedFromCurrentInfo = dayPlan.shift(); // Removes the oldest square from the current day's plan
        if (droppedFromCurrentInfo) {
          await showMessageModal(
            `Dropped ${droppedFromCurrentInfo.id} (oldest) from Day ${currentPlanningDay} to make space for the new ruin.`
          );
        }

        // Re-calculate newOrderValue after potential shift from current day's plan
        newOrderValue =
          dayPlan.length > 0 ? Math.max(...dayPlan.map((s) => s.order)) + 1 : 0;
        dayPlan.push({ id: squareId, order: newOrderValue });
      }
    }

    // Always re-sort and re-index the current day's plan after any modification
    dayPlan.sort((a, b) => a.order - b.order);
    dayPlan.forEach((s, index) => (s.order = index));
    planData[currentPlanningDay] = dayPlan;

    // Update UI and save state
    updateAllSquareAppearances();
    updateSelectedCountDisplay();
    savePlanToLocalStorage();
    drawAllArrows();
    displayTotalBoosts();
  }

  function clearCurrentDayPlan() {
    if (planData[currentPlanningDay]) {
      planData[currentPlanningDay] = [];
      updateAllSquareAppearances();
      updateSelectedCountDisplay();
      savePlanToLocalStorage();
      drawAllArrows();
      displayTotalBoosts();
    }
  }

  function clearEntirePlan() {
    planData = {};
    updateAllSquareAppearances();
    updateSelectedCountDisplay();
    savePlanToLocalStorage();
    drawAllArrows();
    displayTotalBoosts();
  }

  // --- UI UPDATES ---
  function updateAllSquareAppearances() {
    UI_ELEMENTS.squares.forEach((square) => {
      // Reset to default style first
      square.style.backgroundColor = "rgba(220, 220, 220, 0.3)";
      square.style.borderColor = "rgba(0, 0, 0, 0.5)";
      square.classList.remove("highlighted"); // Remove any highlight class if it exists

      let isPlannedForAnyDay = false;
      for (const day in planData) {
        const plannedSquare = planData[day].find((s) => s.id === square.id);
        if (plannedSquare) {
          const dayIndex = parseInt(day) - 1;
          square.style.backgroundColor =
            DAY_COLORS[dayIndex] || "rgba(128,128,128,0.7)"; // Fallback color
          square.style.borderColor = darkenColor(
            DAY_COLORS[dayIndex] || "#808080",
            30
          );
          isPlannedForAnyDay = true;
          break; // Found it in a day, no need to check other days
        }
      }
      // If not planned for any day, its default styles remain from the reset at the start.
    });
  }

  function updateSelectedCountDisplay() {
    const count = planData[currentPlanningDay]
      ? planData[currentPlanningDay].length
      : 0;
    UI_ELEMENTS.selectedCountDisplay.textContent = count;
  }

  function updateCurrentColorDisplay() {
    const dayIndex = currentPlanningDay - 1;
    if (DAY_COLORS[dayIndex]) {
      const displayColor = DAY_COLORS[dayIndex];
      UI_ELEMENTS.currentColorDisplay.innerHTML = `Day ${currentPlanningDay} Color: <span style="background-color:${displayColor}; color:${
        isColorDark(displayColor) ? "white" : "black"
      }; padding: 1px 5px; border-radius:3px;">&nbsp;&nbsp;&nbsp;</span>`;
    } else {
      UI_ELEMENTS.currentColorDisplay.textContent = "N/A";
    }
  }

  // --- BOOST CALCULATION AND DISPLAY FUNCTIONS ---
  function calculateTotalBoosts() {
    const aggregatedBoosts = {};

    // Iterate through each day's plan
    for (const dayKey in planData) {
      if (planData[dayKey] && Array.isArray(planData[dayKey])) {
        // Iterate through each planned square in the day
        planData[dayKey].forEach((plannedSquare) => {
          const properties = squareProperties[plannedSquare.id];
          if (
            properties &&
            properties.boosts &&
            Array.isArray(properties.boosts)
          ) {
            // Aggregate boosts for each square
            properties.boosts.forEach((boost) => {
              if (boost.type && typeof boost.value === "number") {
                // Initialize boost type if not already present
                if (!aggregatedBoosts[boost.type]) {
                  aggregatedBoosts[boost.type] = {
                    totalValue: 0,
                    unit: boost.unit || "", // Default unit to empty string if not provided
                  };
                }
                // Accumulate boost value
                aggregatedBoosts[boost.type].totalValue += boost.value;
                // Ensure unit is set if it wasn't already (in case first boost had no unit)
                if (!aggregatedBoosts[boost.type].unit && boost.unit) {
                  aggregatedBoosts[boost.type].unit = boost.unit;
                }
              } else if (boost.type && boost.value === 0 && boost.unit === "") {
                // Handle special non-numerical boosts (e.g., "Guild Can Refresh Resources")
                // Store them as a boolean or a distinct object to indicate presence
                if (!aggregatedBoosts[boost.type]) {
                  aggregatedBoosts[boost.type] = {
                    isPresent: true, // Indicate presence
                  };
                }
              }
            });
          }
        });
      }
    }
    return aggregatedBoosts;
  }

  function displayTotalBoosts() {
    if (!UI_ELEMENTS.boostSummaryContainer) {
      console.warn("Boost summary container not found.");
      return;
    }
    const totalBoosts = calculateTotalBoosts();

    if (Object.keys(totalBoosts).length === 0) {
      UI_ELEMENTS.boostSummaryContainer.innerHTML =
        "<p>No percentage/numerical boosts acquired from selected ruins.</p>";
      return;
    }

    let html = "<ul>";
    for (const type in totalBoosts) {
      const boostInfo = totalBoosts[type];
      if (boostInfo.hasOwnProperty("totalValue")) {
        // Format numerical boosts
        const displayValue = parseFloat(boostInfo.totalValue.toFixed(2));
        const sign = displayValue >= 0 ? "+" : ""; // Add '+' for positive values
        html += `<li><strong>${type}:</strong> <span>${sign}${displayValue}${boostInfo.unit}</span></li>`;
      } else if (boostInfo.hasOwnProperty("isPresent")) {
        // Display non-numerical boosts simply as present
        html += `<li><strong>${type}</strong></li>`;
      }
    }
    html += "</ul>";
    UI_ELEMENTS.boostSummaryContainer.innerHTML = html;
  }

  // --- ARROW DRAWING (SVG) ---
  function defineArrowhead(markerId, color) {
    if (!UI_ELEMENTS.svgLayer) {
      console.error("SVG Layer not found. Cannot define arrowhead.");
      return;
    }

    // Find or create the <defs> container
    let defs = UI_ELEMENTS.svgLayer.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      UI_ELEMENTS.svgLayer.prepend(defs); // Use prepend to add it at the beginning
    }

    // Check if a marker with this ID already exists
    if (document.getElementById(markerId)) {
      return; // Already defined, no need to recreate
    }

    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    marker.setAttribute("id", markerId); // Use the unique ID
    marker.setAttribute("markerWidth", "10"); // Slightly smaller can look cleaner
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "9"); // Adjust refX since markerWidth changed
    marker.setAttribute("refY", "3.5"); // Center vertically
    marker.setAttribute("orient", "auto-start-reverse");

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7"); // Adjust points for new size

    // CHANGE 2: Use the provided solid color for the fill
    polygon.setAttribute("fill", color);

    marker.appendChild(polygon);
    defs.appendChild(marker);
  }

  function drawAllArrows() {
    if (!UI_ELEMENTS.svgLayer) return;
    clearArrows(); // Clear existing arrows before redrawing

    // Get sorted list of days that have planned squares
    const sortedDayKeys = Object.keys(planData)
      .map(Number)
      .filter((day) => planData[day] && planData[day].length > 0)
      .sort((a, b) => a - b);

    // Draw intra-day arrows
    sortedDayKeys.forEach((dayKey) => {
      const dayPlan = planData[dayKey];
      // Need at least two squares for an arrow within a day
      if (dayPlan.length < 2) return;

      // Sort the day's plan by order to draw arrows correctly
      const sortedDayPlan = [...dayPlan].sort((a, b) => a.order - b.order);
      const dayColor = DAY_COLORS[dayKey - 1] || "#000000"; // Get color for this day
      const intraDayArrowColor = darkenColor(dayColor, 40); // Darken for intra-day lines

      for (let i = 0; i < sortedDayPlan.length - 1; i++) {
        drawArrow(
          sortedDayPlan[i].id,
          sortedDayPlan[i + 1].id,
          intraDayArrowColor,
          false // Not an inter-day arrow
        );
      }
    });

    // Draw inter-day arrows
    for (let i = 0; i < sortedDayKeys.length - 1; i++) {
      const currentDayKey = sortedDayKeys[i];
      const nextDayKey = sortedDayKeys[i + 1];

      const currentDayPlan = planData[currentDayKey];
      const nextDayPlan = planData[nextDayKey];

      // Ensure both days have plans to connect
      if (currentDayPlan.length > 0 && nextDayPlan.length > 0) {
        // Get the last square of the current day and the first of the next day
        const lastOfCurrentDay = currentDayPlan.sort(
          (a, b) => a.order - b.order
        )[currentDayPlan.length - 1].id;
        const firstOfNextDay = nextDayPlan.sort((a, b) => a.order - b.order)[0]
          .id;

        drawArrow(
          lastOfCurrentDay,
          firstOfNextDay,
          INTER_DAY_ARROW_COLOR,
          true
        ); // True for inter-day (dashed)
      }
    }
  }
  /**
   * Draws an SVG arrow between two square elements.
   * @param {string} startSquareId - The ID of the starting square.
   * @param {string} endSquareId - The ID of the ending square.
   * @param {string} strokeColor - The color of the arrow (can be rgba).
   * @param {boolean} isInterDay - True if it's an arrow between days (dashed line).
   */
  function drawArrow(
    startSquareId,
    endSquareId,
    strokeColor,
    isInterDay = false
  ) {
    if (!UI_ELEMENTS.svgLayer) return;

    const startEl = document.getElementById(startSquareId);
    const endEl = document.getElementById(endSquareId);

    if (!startEl || !endEl) {
      console.warn(
        `Could not find square elements for arrow: ${startSquareId} -> ${endSquareId}`
      );
      return;
    }

    // CHANGE 3: Create a solid version of the color for the marker
    // This takes the rgba color and makes it fully opaque for the arrowhead fill.
    const solidColor = strokeColor.replace(/,([\d.]+)\)/, ", 1)"); // Replaces alpha with 1
    const markerId = `arrowhead-${solidColor.replace(/[^a-zA-Z0-9]/g, "")}`; // Create a valid ID from the color string

    // Define the arrowhead for this specific color if it doesn't exist yet
    defineArrowhead(markerId, solidColor);

    // Calculate center coordinates of the squares
    const startX = startEl.offsetLeft + startEl.offsetWidth / 2;
    const startY = startEl.offsetTop + startEl.offsetHeight / 2;
    const endX = endEl.offsetLeft + endEl.offsetWidth / 2;
    const endY = endEl.offsetTop + endEl.offsetHeight / 2;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startX.toString());
    line.setAttribute("y1", startY.toString());
    line.setAttribute("x2", endX.toString());
    line.setAttribute("y2", endY.toString());
    line.setAttribute("stroke", strokeColor);
    line.setAttribute("stroke-width", "4"); // A thinner line might look better with a clear arrowhead

    // CHANGE 4: Attach the correctly-colored marker
    line.setAttribute("marker-end", `url(#${markerId})`);

    if (isInterDay) {
      line.setAttribute("stroke-dasharray", "5, 5");
    }
    UI_ELEMENTS.svgLayer.appendChild(line);
  }

  function clearArrows() {
    if (!UI_ELEMENTS.svgLayer) return;
    // Select all 'line' elements within the SVG layer and remove them
    const lines = UI_ELEMENTS.svgLayer.querySelectorAll("line");
    lines.forEach((line) => line.remove());
  }

  // --- UTILITY FUNCTIONS ---
  /**
   * Determines if a given color string represents a "dark" color for text contrast.
   * @param {string} colorString - The color string (e.g., "rgba(R,G,B,A)", "#RRGGBB", "#RGB").
   * @returns {boolean} True if the color is considered dark, false otherwise.
   */
  function isColorDark(colorString) {
    if (!colorString) return false;
    let r, g, b;

    if (colorString.startsWith("rgba")) {
      const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) return true; // Fallback to true if parse fails
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    } else if (colorString.startsWith("#")) {
      let hex = colorString.replace("#", "");
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) return true; // Fallback if not 3 or 6 hex digits

      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return true; // Unknown format, consider dark
    }

    // Check for NaN after parsing
    if (isNaN(r) || isNaN(g) || isNaN(b)) return true;

    // Calculate luminance (standard formula for perceived brightness)
    // Values less than 128 are generally considered "dark"
    return (299 * r + 587 * g + 114 * b) / 1000 < 128;
  }

  /**
   * Darkens a given color by a specified percentage.
   * Supports rgba, rgb, and hex color formats.
   * @param {string} colorString - The original color string.
   * @param {number} percentage - The percentage to darken (e.g., 30 for 30%).
   * @returns {string} The darkened color string in rgba format.
   */
  function darkenColor(colorString, percentage) {
    let r,
      g,
      b,
      alpha = 1;

    // Handle rgba format
    if (colorString.startsWith("rgba")) {
      const match = colorString.match(
        /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
      );
      if (!match) return colorString; // Return original if regex fails
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
      alpha = parseFloat(match[4]);
    }
    // Handle rgb format
    else if (colorString.startsWith("rgb")) {
      const match = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return colorString;
      r = parseInt(match[1]);
      g = parseInt(match[2]);
      b = parseInt(match[3]);
    }
    // Handle hex format
    else if (colorString.startsWith("#")) {
      let hex = colorString.replace("#", "");
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) return colorString;

      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return colorString; // Return original if unknown format
    }

    // Calculate new RGB values
    r = Math.max(0, Math.floor(r * (1 - percentage / 100)));
    g = Math.max(0, Math.floor(g * (1 - percentage / 100)));
    b = Math.max(0, Math.floor(b * (1 - percentage / 100)));

    return `rgba(${r},${g},${b},${alpha})`;
  }

  // --- LOCAL STORAGE ---
  function savePlanToLocalStorage() {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(planData));
    } catch (error) {
      console.error("Error saving to local storage:", error);
    }
  }

  function loadPlanFromLocalStorage() {
    try {
      const storedPlan = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPlan) {
        planData = JSON.parse(storedPlan);
        // Ensure that each day's plan is an array and re-index orders if necessary
        Object.keys(planData).forEach((dayKey) => {
          if (Array.isArray(planData[dayKey])) {
            // Sort and re-index to ensure correct order after loading
            planData[dayKey].sort((a, b) => a.order - b.order);
            planData[dayKey].forEach((s, index) => (s.order = index));
          } else {
            planData[dayKey] = []; // If corrupted, reset to empty array
          }
        });
      } else {
        planData = {}; // Initialize as empty if nothing found
      }
    } catch (error) {
      console.error("Error loading from local storage:", error);
      planData = {}; // Reset planData on error
    }
  }

  // --- START THE APPLICATION ---
  initialize();
});
