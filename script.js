document.addEventListener("DOMContentLoaded", () => {
  const squares = document.querySelectorAll(".clickable-square");
  const daySelect = document.getElementById("day-select");
  const selectedCountDisplay = document.getElementById("selected-count");
  const clearDayButton = document.getElementById("clear-day-button");
  const clearAllButton = document.getElementById("clear-all-button");
  const tooltip = document.getElementById("tooltip");
  const currentColorDisplay = document.getElementById("currentColorDisplay");
  const mapContainer = document.getElementById("map-container");
  const svgLayer = document.getElementById("arrow-svg-layer");
  const boostSummaryContainer = document.getElementById(
    "boost-summary-content"
  );

  // --- DATA FOR EACH SQUARE ---
  // !!! YOU WILL NEED TO POPULATE THIS OBJECT FOR ALL YOUR SQUARES !!!
  // The 'key' (e.g., 'wind_stone') MUST match the ID of the div in your HTML.
  // Add a 'boosts' array with structured data for calculations.

  const L1 = "LV. 1 ";
  const L2 = "LV. 2 ";
  const L3 = "LV. 3 ";
  const L4 = "LV. 4 ";
  const L5 = "LV. 5 ";

  const RESOURCE_LEVEL_1 = 2.5;
  const RESOURCE_LEVEL_2 = 5;
  const RESOURCE_LEVEL_3 = 7.5;
  const RESOURCE_LEVEL_4 = 10;
  const RESOURCE_LEVEL_5 = 12.5;

  const PERCENT_2_5 = 2.5;
  const PERCENT_3 = 3;
  const PERCENT_5 = 5;
  const PERCENT_7_5 = 7.5;
  const PERCENT_10 = 10;
  const PERCENT_12_5 = 12.5;
  const PERCENT_15 = 15;

  const RESOURCE_YIELD = "Resource Yield Boost";
  const SAWMILL_YIELD = "Sawmill Yield Boost";
  const MINE_YIELD = "Mine Yield Boost";
  const RANCH_YIELD = "Ranch Yield Boost";
  const GATHERING_SPEED = "Gathering Speed Boost";
  const TIMBER_GATHERING_SPEED = "Timber Gathering Speed";
  const STONE_GATHERING_SPEED = "Stone Gathering Speed";
  const RUBY_GATHERING_SPEED = "Ruby Gathering Speed";
  const CONSTRUCTION_SPEED = "Construction Speed";
  const TECH_RESEARCH_SPEED = "Tech Research Speed";
  const MARCHING_SPEED = "Marching Speed Boost";
  const SOLDIER_LOAD = "Soldier Load";
  const SOLDIER_TRAINING_SPEED = "Soldier Training Speed";
  const SOLDIER_HEALING_SPEED = "Soldier Healing Speed";
  const SOLDIER_LOSS = "Soldier Losses";
  const DECREASE_DEFENSIVE_LOSSES = "Decrease Soldier Losses on the Defensive";
  const DECREASE_ATTACKING_LOSSES = "Decrease Soldier Losses When Attacking";
  const INCREASED_DAMAGE_WORLD_MAP = "Increased Damage in World Map Battles";
  const REDUCED_DAMAGE_WORLD_MAP = "Reduced Damage in World Map Battles";
  const GUILD_REFRESH_RESOURCES = "Guild Can Refresh Resources in This Area";
  const GUILD_REFRESH_GUARDIANS = "Guild Can Refresh Guardians in This Area";
  const STAMINA_CAP = "Stamina Cap";
  const WATER = "Water Resource";

  const squareProperties = {
    wind_stone: {
      label: `${L1} - Wind Stone`,
      details: `${RANCH_YIELD}: +10%\n${WATER}: +2.5%`,
      boosts: [
        { type: RANCH_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    desert: {
      label: `${L1} - Desert`,
      details: `${SOLDIER_TRAINING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: SOLDIER_TRAINING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    coast: {
      label: `${L1} - Coast`,
      details: `${CONSTRUCTION_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: CONSTRUCTION_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    river: {
      label: `${L1} - River`,
      details: `${TECH_RESEARCH_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: TECH_RESEARCH_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    tundra: {
      label: `${L1} - Tundra`,
      details: `${MARCHING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: MARCHING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    salt_lake: {
      label: `${L1} - Salt Lake`,
      details: `${GATHERING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: GATHERING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    reef: {
      label: `${L1} - Reef`,
      details: `${MINE_YIELD}: +10%\n${WATER}: +2.5%`,
      boosts: [
        { type: MINE_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    temple: {
      label: `${L2} - Temple`,
      details: `${TIMBER_GATHERING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: TIMBER_GATHERING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    culture: {
      label: `${L2} - Culture`,
      details: `${REDUCED_DAMAGE_WORLD_MAP}: +3%\n${WATER}: +5%`,
      boosts: [
        { type: REDUCED_DAMAGE_WORLD_MAP, value: 3, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    tradition: {
      label: `${L2} - Tradition`,
      details: `${DECREASE_DEFENSIVE_LOSSES}: -5%\n${WATER}: +5%`,
      boosts: [
        { type: DECREASE_DEFENSIVE_LOSSES, value: -5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    sites: {
      label: `${L2} - Sites`,
      details: `${INCREASED_DAMAGE_WORLD_MAP}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    mystery: {
      label: `${L2} - Mystery`,
      details: `${RUBY_GATHERING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: RUBY_GATHERING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    faith: {
      label: `${L2} - Faith`,
      details: `${STONE_GATHERING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: STONE_GATHERING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    frost_ridge_first: {
      label: `${L1} - Frost Ridge`,
      details: `${SAWMILL_YIELD}: +10%\n${WATER}: +2.5%`,
      boosts: [
        { type: SAWMILL_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    old_well: {
      label: `${L3} - Old Well`,
      details: `Timber & Ruby Gather: +15%\n${WATER}: +7.5%`,
      boosts: [
        { type: TIMBER_GATHERING_SPEED, value: 15, unit: "%" },
        { type: RUBY_GATHERING_SPEED, value: 15, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    esteem: {
      label: `${L2} - Esteem`,
      details: `${STAMINA_CAP}: +10%\n${WATER}: +7.5%`,
      boosts: [
        { type: STAMINA_CAP, value: 10, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    trench: {
      label: `${L3} - Trench`,
      details: `${SOLDIER_LOSS}: -5%\n${WATER}: +10%`,
      boosts: [
        { type: SOLDIER_LOSS, value: -5, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    honor: {
      label: `${L2} - Honor`,
      details: `${INCREASED_DAMAGE_WORLD_MAP}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    defense: {
      label: `${L3} - Defense`,
      details: `${INCREASED_DAMAGE_WORLD_MAP}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    warrior: {
      label: `${L2} - Warrior`,
      details: `${SOLDIER_LOAD}: +10%\n${WATER}: +7.5%`,
      boosts: [
        { type: SOLDIER_LOAD, value: 10, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    karst: {
      label: `${L1} - Karst`,
      details: `${SAWMILL_YIELD}: +10%\n${WATER}: +2.5%`,
      boosts: [
        { type: SAWMILL_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    snow_peak: {
      label: `${L1} - Snow Peak`,
      details: `${MINE_YIELD}: +10%\n${WATER}: +2.5%`,
      boosts: [
        { type: MINE_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    altar_first: {
      label: `${L2} - Altar`,
      details: `${STONE_GATHERING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: STONE_GATHERING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    city_wall: {
      label: `${L3} - City Wall`,
      details: `${MARCHING_SPEED}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: MARCHING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    castle: {
      label: `${L3} - Castle`,
      details: `${TECH_RESEARCH_SPEED}: +15%\n${WATER}: +7.5%`,
      boosts: [
        { type: TECH_RESEARCH_SPEED, value: 15, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    sanctuary_first: {
      label: `${L3} - Sanctuary`,
      details: `${TECH_RESEARCH_SPEED}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: TECH_RESEARCH_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    battlefield: {
      label: `${L4} - Battlefield`,
      details: `${GATHERING_SPEED}: +10%\n${WATER}: +10%`,
      boosts: [
        { type: GATHERING_SPEED, value: 10, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    shelter: {
      label: `${L4} - Shelter`,
      details: `${GUILD_REFRESH_GUARDIANS}\n${WATER}: +12.5%`,
      boosts: [
        { type: GUILD_REFRESH_GUARDIANS, value: 0, unit: "" },
        { type: WATER, value: 12.5, unit: "%" },
      ],
    },
    resource: {
      label: `${L5} - Resource`,
      details: `${GUILD_REFRESH_RESOURCES}\n${WATER}: +12.5%`,
      boosts: [
        { type: GUILD_REFRESH_RESOURCES, value: 0, unit: "" },
        { type: WATER, value: 12.5, unit: "%" },
      ],
    },
    fortress: {
      label: `${L4} - Fortress`,
      details: `${INCREASED_DAMAGE_WORLD_MAP}: +5%\n${WATER}: +10%`,
      boosts: [
        { type: INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    royalty: {
      label: `${L3} - Royalty`,
      details: `${SOLDIER_HEALING_SPEED}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: SOLDIER_HEALING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    garden: {
      label: `${L3} - Garden`,
      details: `${CONSTRUCTION_SPEED}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: CONSTRUCTION_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    legend: {
      label: `${L2} - Legend`,
      details: `${SOLDIER_TRAINING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: SOLDIER_TRAINING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    swamp: {
      label: `${L1} - Swamp`,
      details: `${RANCH_YIELD}: +10%\n${WATER}: +2.5%`,
      boosts: [
        { type: RANCH_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    ice_fields: {
      label: `${L1} - Ice Fields`,
      details: `${GATHERING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: GATHERING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    stele: {
      label: `${L2} - Stele`,
      details: `${RUBY_GATHERING_SPEED}: +10%\n${WATER}: +5%`,
      boosts: [
        { type: RUBY_GATHERING_SPEED, value: 10, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    stone_pillar: {
      label: `${L3} - Stone Pillar`,
      details: `${CONSTRUCTION_SPEED}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: CONSTRUCTION_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    guardian: {
      label: `${L4} - Guardian`,
      details: `${GUILD_REFRESH_GUARDIANS}\n${WATER}: +12.5%`,
      boosts: [
        { type: GUILD_REFRESH_GUARDIANS, value: 0, unit: "" },
        { type: WATER, value: 12.5, unit: "%" },
      ],
    },
    king_square: {
      label: "King's Castle",
      details: `Central Point`,
      boosts: [],
    },
    guard: {
      label: `${L4} - Guard`,
      details: `${GUILD_REFRESH_GUARDIANS}\n${WATER}: +12.5%`,
      boosts: [
        { type: GUILD_REFRESH_GUARDIANS, value: 0, unit: "" },
        { type: WATER, value: 12.5, unit: "%" },
      ],
    },
    war: {
      label: `${L4} - War`,
      details: `${GATHERING_SPEED}: +10%\n${WATER}: +10%`,
      boosts: [
        { type: GATHERING_SPEED, value: 10, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    symbol: {
      label: `${L3} - Symbol`,
      details: `${INCREASED_DAMAGE_WORLD_MAP}: +3%\n${WATER}: +7.5%`,
      boosts: [
        { type: INCREASED_DAMAGE_WORLD_MAP, value: 3, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    canyon: {
      label: `${L1} - Canyon`,
      details: `${SOLDIER_TRAINING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: SOLDIER_TRAINING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    stone_wall: {
      label: `${L3} - Stone Wall`,
      details: `${TECH_RESEARCH_SPEED}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: TECH_RESEARCH_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    remants: {
      label: `${L2} - Remnants`,
      details: `${DECREASE_DEFENSIVE_LOSSES}: -5%\n${WATER}: +5%`,
      boosts: [
        { type: DECREASE_DEFENSIVE_LOSSES, value: -5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    glacier: {
      label: `${L1} - Glacier`,
      details: `${CONSTRUCTION_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: CONSTRUCTION_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    rift: {
      label: `${L1} - Rift`,
      details: `${MARCHING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: MARCHING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    plaza: {
      label: `${L2} - Plaza`,
      details: `${SOLDIER_HEALING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: SOLDIER_HEALING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    sanctuary_second: {
      label: `${L3} - Sanctuary`,
      details: `${TECH_RESEARCH_SPEED}: +5%\n${WATER}: +7.5%`,
      boosts: [
        { type: TECH_RESEARCH_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    aqueduct: {
      label: `${L4} - Aqueduct`,
      details: `${SOLDIER_LOAD}: +10%\n${WATER}: +10%`,
      boosts: [
        { type: SOLDIER_LOAD, value: 10, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    warflames: {
      label: `${L4} - Warflames`,
      details: `${REDUCED_DAMAGE_WORLD_MAP}: +5%\n${WATER}: +10%`,
      boosts: [
        { type: REDUCED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    barracks: {
      label: `${L4} - Barracks`,
      details: `${INCREASED_DAMAGE_WORLD_MAP}: +5%\n${WATER}: +10%`,
      boosts: [
        { type: INCREASED_DAMAGE_WORLD_MAP, value: 5, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    treasure: {
      label: `${L5} - Treasure`,
      details: `${GUILD_REFRESH_RESOURCES}\n${WATER}: +12.5%`,
      boosts: [
        { type: GUILD_REFRESH_RESOURCES, value: 0, unit: "" },
        { type: WATER, value: 12.5, unit: "%" },
      ],
    },
    dominion: {
      label: `${L4} - Dominion`,
      details: `${SOLDIER_HEALING_SPEED}: +15%\n${WATER}: +10%`,
      boosts: [
        { type: SOLDIER_HEALING_SPEED, value: 15, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    conquest: {
      label: `${L5} - Conquest`,
      details: `${SOLDIER_LOSS}: -10%\n${WATER}: +12.5%`,
      boosts: [
        { type: SOLDIER_LOSS, value: -10, unit: "%" },
        { type: WATER, value: 12.5, unit: "%" },
      ],
    },
    tomb: {
      label: `${L5} - Tomb`,
      details: `${STAMINA_CAP}: -10%\n${WATER}: +12.5%`,
      boosts: [
        { type: STAMINA_CAP, value: -10, unit: "%" },
        { type: WATER, value: 12.5, unit: "%" },
      ],
    },
    sacrifice: {
      label: `${L4} - Sacrifice`,
      details: `Timber, Stone & Ruby Gather: +10%\n${WATER}: +10%`,
      boosts: [
        { type: TIMBER_GATHERING_SPEED, value: 10, unit: "%" },
        { type: STONE_GATHERING_SPEED, value: 10, unit: "%" },
        { type: RUBY_GATHERING_SPEED, value: 10, unit: "%" },
        { type: WATER, value: 10, unit: "%" },
      ],
    },
    well: {
      label: `${L3} - Well`,
      details: `${MARCHING_SPEED}: +3%\n${WATER}: +7.5%`,
      boosts: [
        { type: MARCHING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    cave: {
      label: `${L1} - Cave`,
      details: `${TECH_RESEARCH_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: TECH_RESEARCH_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    hot_stone: {
      label: `${L1} - Hot Stone`,
      details: `${TECH_RESEARCH_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: TECH_RESEARCH_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    fountain: {
      label: `${L2} - Fountain`,
      details: `${DECREASE_DEFENSIVE_LOSSES}: -3%\n${WATER}: +5%`,
      boosts: [
        { type: DECREASE_DEFENSIVE_LOSSES, value: -3, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    cellar: {
      label: `${L2} - Cellar`,
      details: `${TIMBER_GATHERING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: TIMBER_GATHERING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    bell_tower: {
      label: `${L3} - Bell Tower`,
      details: `${RANCH_YIELD}: +10%\n${WATER}: +7.5%`,
      boosts: [
        { type: RANCH_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    shrine: {
      label: `${L2} - Shrine`,
      details: `${STONE_GATHERING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: STONE_GATHERING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    church: {
      label: `${L2} - Church`,
      details: `${GATHERING_SPEED}: +3%\n${WATER}: +5%`,
      boosts: [
        { type: GATHERING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    monastery: {
      label: `${L2} - Monastery`,
      details: `${SOLDIER_HEALING_SPEED}: +5%\n${WATER}: +5%`,
      boosts: [
        { type: SOLDIER_HEALING_SPEED, value: 5, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    volcano: {
      label: `${L1} - Volcano`,
      details: `${CONSTRUCTION_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: CONSTRUCTION_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    lost_sand: {
      label: `${L1} - Lost Sand`,
      details: `${SOLDIER_TRAINING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: SOLDIER_TRAINING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    statue: {
      label: `${L3} - Statue`,
      details: `${REDUCED_DAMAGE_WORLD_MAP}: +3%\n${WATER}: +7.5%`,
      boosts: [
        { type: REDUCED_DAMAGE_WORLD_MAP, value: 3, unit: "%" },
        { type: WATER, value: 7.5, unit: "%" },
      ],
    },
    frost_ridge_second: {
      label: `${L2} - Frost Ridge`,
      details: `${RANCH_YIELD}: +10%\n${WATER}: +5%`,
      boosts: [
        { type: RANCH_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    haze_rain: {
      label: `${L1} - Haze Rain`,
      details: `${SAWMILL_YIELD}: +10%\n${WATER}: +2.5%`,
      boosts: [
        { type: SAWMILL_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    stream: {
      label: `${L2} - Stream`,
      details: `${MINE_YIELD}: +10%\n${WATER}: +5%`,
      boosts: [
        { type: MINE_YIELD, value: 10, unit: "%" },
        { type: WATER, value: 5, unit: "%" },
      ],
    },
    vine: {
      label: `${L1} - Vine`,
      details: `${GATHERING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: GATHERING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
    rainforest: {
      label: `${L1} - Rainforest`,
      details: `${MARCHING_SPEED}: +3%\n${WATER}: +2.5%`,
      boosts: [
        { type: MARCHING_SPEED, value: 3, unit: "%" },
        { type: WATER, value: 2.5, unit: "%" },
      ],
    },
  };

  const MAX_HELD_RUINS_PER_DAY = 4;
  const dayColors = [
    "rgba(255, 99, 71, 0.7)", // Day 1 (Tomato)
    "rgba(60, 179, 113, 0.7)", // Day 2 (MediumSeaGreen)
    "rgba(100, 149, 237, 0.7)", // Day 3 (CornflowerBlue)
    "rgba(255, 215, 0, 0.7)", // Day 4 (Gold)
    "rgba(186, 85, 211, 0.7)", // Day 5 (MediumOrchid)
  ];
  const INTER_DAY_ARROW_COLOR = "rgba(75, 0, 130, 0.9)"; // Indigo for inter-day connections

  let currentPlanningDay = 1;
  let planData = {};

  // --- INITIALIZATION ---
  function initialize() {
    currentPlanningDay = parseInt(daySelect.value);
    loadPlanFromLocalStorage();
    updateAllSquareAppearances();
    updateSelectedCountDisplay();
    updateCurrentColorDisplay();
    setupEventListeners();
    drawAllArrows();
    displayTotalBoosts();
  }

  function setupEventListeners() {
    daySelect.addEventListener("change", (e) => {
      currentPlanningDay = parseInt(e.target.value);
      updateSelectedCountDisplay();
      updateCurrentColorDisplay();
      // Arrows are persistent, no need to redraw on day change unless plan for THIS day changes
    });

    squares.forEach((square) => {
      square.addEventListener("click", () => handleSquareClick(square));
      square.addEventListener("mousemove", (e) => showTooltip(e, square));
      square.addEventListener("mouseout", hideTooltip);
    });

    clearDayButton.addEventListener("click", clearCurrentDayPlan);
    clearAllButton.addEventListener("click", clearEntirePlan);
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

    tooltip.innerHTML = tooltipContent;
    tooltip.style.display = "block";
    tooltip.style.left = event.pageX + 15 + "px";
    tooltip.style.top = event.pageY + 10 + "px";
  }

  function hideTooltip() {
    tooltip.style.display = "none";
  }

  // --- PLAN MANAGEMENT ---
  function handleSquareClick(square) {
    const squareId = square.id;
    planData[currentPlanningDay] = planData[currentPlanningDay] || [];
    let dayPlan = planData[currentPlanningDay];
    dayPlan.sort((a, b) => a.order - b.order);

    const existingSquareIndex = dayPlan.findIndex((s) => s.id === squareId);

    if (existingSquareIndex > -1) {
      // Clicked an already selected square for THIS day
      dayPlan.splice(existingSquareIndex, 1);
    } else {
      // Attempting to select a NEW square for this day
      for (const day in planData) {
        if (
          parseInt(day) !== currentPlanningDay &&
          planData[day].some((s) => s.id === squareId)
        ) {
          alert(
            `Square ${squareId} is already part of Day ${day}'s plan. Please clear it from Day ${day} to reassign.`
          );
          return;
        }
      }

      let newOrderValue = 0;
      if (dayPlan.length > 0) {
        newOrderValue = dayPlan[dayPlan.length - 1].order + 1;
      }

      if (dayPlan.length < MAX_HELD_RUINS_PER_DAY) {
        dayPlan.push({ id: squareId, order: newOrderValue });
      } else {
        // Current day's plan is FULL
        if (currentPlanningDay === 1) {
          alert(
            `Day 1 plan is full (${MAX_HELD_RUINS_PER_DAY} ruins). You must manually deselect a ruin from Day 1 to add a new one.`
          );
          return;
        }

        const previousDay = currentPlanningDay - 1;
        let previousDayPlan = planData[previousDay];

        if (!previousDayPlan || previousDayPlan.length === 0) {
          alert(
            `Day ${currentPlanningDay} plan is full (${MAX_HELD_RUINS_PER_DAY} ruins), and there are no ruins from Day ${previousDay} to drop. You must manually deselect one from Day ${currentPlanningDay}.`
          );
          return;
        }

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
        promptMessage += `\nEnter the ID of the square to drop from Day ${previousDay} (e.g., square5), or type 'cancel'.`;

        const idToDropFromPrevious = prompt(promptMessage);

        if (
          !idToDropFromPrevious ||
          idToDropFromPrevious.toLowerCase() === "cancel"
        ) {
          alert("Operation cancelled. No square added or dropped.");
          return;
        }

        const prevDaySquareToDropIndex = previousDayPlan.findIndex(
          (s) => s.id === idToDropFromPrevious
        );
        if (prevDaySquareToDropIndex === -1) {
          alert(
            `Invalid square ID '${idToDropFromPrevious}' or not found in Day ${previousDay}'s plan. Operation cancelled.`
          );
          return;
        }

        const droppedFromPrevInfo = previousDayPlan.splice(
          prevDaySquareToDropIndex,
          1
        )[0];
        previousDayPlan.forEach((s, index) => (s.order = index));
        planData[previousDay] = previousDayPlan;
        alert(`Dropped ${droppedFromPrevInfo.id} from Day ${previousDay}.`);

        const droppedFromCurrentInfo = dayPlan.shift(); // Removes oldest from current day
        if (droppedFromCurrentInfo) {
          alert(
            `Dropped ${droppedFromCurrentInfo.id} (oldest) from Day ${currentPlanningDay} to make space for the new ruin.`
          );
        }

        // Recalculate newOrderValue after potential shift from current day's plan
        if (dayPlan.length > 0) {
          newOrderValue = dayPlan[dayPlan.length - 1].order + 1;
        } else {
          newOrderValue = 0;
        }
        dayPlan.push({ id: squareId, order: newOrderValue });
      }
    }

    dayPlan.sort((a, b) => a.order - b.order);
    dayPlan.forEach((s, index) => (s.order = index));
    planData[currentPlanningDay] = dayPlan;

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
    squares.forEach((square) => {
      square.style.backgroundColor = "rgba(220, 220, 220, 0.3)";
      square.style.borderColor = "rgba(0, 0, 0, 0.5)";
      square.classList.remove("highlighted"); // Generic class, if used elsewhere
      // Remove any day-specific classes if you were using them before direct style manipulation
      // dayColors.forEach((_, index) => square.classList.remove(`day${index+1}-selected`));

      let isPlanned = false;
      for (const day in planData) {
        const plannedSquare = planData[day].find((s) => s.id === square.id);
        if (plannedSquare) {
          const dayIndex = parseInt(day) - 1;
          square.style.backgroundColor =
            dayColors[dayIndex] || "rgba(128,128,128,0.7)"; // Fallback color
          square.style.borderColor = darkenColor(
            dayColors[dayIndex] || "#808080",
            30
          );
          isPlanned = true;
          break;
        }
      }
      // If not planned for any day, ensure default styles are applied (already done at the start of function)
    });
  }

  function updateSelectedCountDisplay() {
    const count = planData[currentPlanningDay]
      ? planData[currentPlanningDay].length
      : 0;
    selectedCountDisplay.textContent = count;
  }

  function updateCurrentColorDisplay() {
    const dayIndex = currentPlanningDay - 1;
    if (dayColors[dayIndex]) {
      currentColorDisplay.innerHTML = `Day ${currentPlanningDay} Color: <span style="background-color:${
        dayColors[dayIndex]
      }; color:${
        isColorDark(dayColors[dayIndex]) ? "white" : "black"
      }; padding: 1px 5px; border-radius:3px;">&nbsp;&nbsp;&nbsp;</span>`;
    } else {
      currentColorDisplay.textContent = "N/A";
    }
  }

  // --- BOOST CALCULATION AND DISPLAY FUNCTIONS ---
  function calculateTotalBoosts() {
    const aggregatedBoosts = {};

    for (const day in planData) {
      if (planData[day] && Array.isArray(planData[day])) {
        planData[day].forEach((plannedSquare) => {
          const properties = squareProperties[plannedSquare.id];
          if (
            properties &&
            properties.boosts &&
            Array.isArray(properties.boosts)
          ) {
            properties.boosts.forEach((boost) => {
              if (boost.type && typeof boost.value === "number") {
                if (!aggregatedBoosts[boost.type]) {
                  aggregatedBoosts[boost.type] = {
                    totalValue: 0,
                    unit: boost.unit || "%",
                  };
                }
                aggregatedBoosts[boost.type].totalValue += boost.value;
                if (!aggregatedBoosts[boost.type].unit && boost.unit) {
                  aggregatedBoosts[boost.type].unit = boost.unit;
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
    if (!boostSummaryContainer) return;
    const totalBoosts = calculateTotalBoosts();

    if (Object.keys(totalBoosts).length === 0) {
      boostSummaryContainer.innerHTML =
        "<p>No percentage/numerical boosts acquired from selected ruins.</p>";
      return;
    }

    let html = "<ul>";
    for (const type in totalBoosts) {
      const boostInfo = totalBoosts[type];
      const displayValue = parseFloat(boostInfo.totalValue.toFixed(2));
      html += `<li><strong>${type}:</strong> <span>+${displayValue}${boostInfo.unit}</span></li>`;
    }
    html += "</ul>";
    boostSummaryContainer.innerHTML = html;
  }

  // --- ARROW DRAWING (SVG) ---
  function defineArrowhead() {
    if (!svgLayer) {
      console.error("SVG Layer not found.");
      return;
    }
    const existingDefs = svgLayer.querySelector("defs");
    if (existingDefs) existingDefs.remove();
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto-start-reverse");
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svgLayer.appendChild(defs);
  }

  function drawAllArrows() {
    if (!svgLayer) return;
    clearArrows();
    const sortedDayKeys = Object.keys(planData)
      .map(Number)
      .filter((day) => planData[day] && planData[day].length > 0)
      .sort((a, b) => a - b);

    sortedDayKeys.forEach((dayKey) => {
      const dayPlan = planData[dayKey];
      if (dayPlan.length < 2) return;
      const sortedDayPlan = [...dayPlan].sort((a, b) => a.order - b.order);
      const dayColor = dayColors[dayKey - 1] || "#000000";
      const intraDayArrowColor = darkenColor(dayColor, 40);
      for (let i = 0; i < sortedDayPlan.length - 1; i++) {
        drawArrow(
          sortedDayPlan[i].id,
          sortedDayPlan[i + 1].id,
          intraDayArrowColor,
          false
        );
      }
    });

    for (let i = 0; i < sortedDayKeys.length - 1; i++) {
      const currentDayKey = sortedDayKeys[i];
      const nextDayKey = sortedDayKeys[i + 1];
      const currentDayPlan = planData[currentDayKey];
      const nextDayPlan = planData[nextDayKey];
      // Ensure orders are correct for finding last and first
      const lastOfCurrentDay = currentDayPlan.sort((a, b) => a.order - b.order)[
        currentDayPlan.length - 1
      ].id;
      const firstOfNextDay = nextDayPlan.sort((a, b) => a.order - b.order)[0]
        .id;
      drawArrow(lastOfCurrentDay, firstOfNextDay, INTER_DAY_ARROW_COLOR, true);
    }
  }

  function drawArrow(
    startSquareId,
    endSquareId,
    strokeColor,
    isInterDay = false
  ) {
    if (!svgLayer) return;
    const startEl = document.getElementById(startSquareId);
    const endEl = document.getElementById(endSquareId);
    if (!startEl || !endEl) return;
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
    line.setAttribute("stroke-width", "3");
    line.setAttribute("marker-end", "url(#arrowhead)");
    if (isInterDay) {
      line.setAttribute("stroke-dasharray", "5, 5");
    }
    svgLayer.appendChild(line);
  }

  function clearArrows() {
    if (!svgLayer) return;
    const lines = svgLayer.querySelectorAll("line");
    lines.forEach((line) => line.remove());
  }

  // --- UTILITY FUNCTIONS ---
  function isColorDark(colorString) {
    if (!colorString) return !1;
    let r, g, b;
    if (colorString.startsWith("rgba")) {
      const t = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!t) return !0;
      (r = parseInt(t[1])), (g = parseInt(t[2])), (b = parseInt(t[3]));
    } else if (colorString.startsWith("#")) {
      const t = colorString.replace("#", "");
      if (3 === t.length)
        (r = parseInt(t[0] + t[0], 16)),
          (g = parseInt(t[1] + t[1], 16)),
          (b = parseInt(t[2] + t[2], 16));
      else {
        if (6 !== t.length) return !0;
        (r = parseInt(t.substring(0, 2), 16)),
          (g = parseInt(t.substring(2, 4), 16)),
          (b = parseInt(t.substring(4, 6), 16));
      }
      if (isNaN(r) || isNaN(g) || isNaN(b)) return !0;
    } else return !0;
    return (299 * r + 587 * g + 114 * b) / 1e3 < 128;
  }
  function darkenColor(o, r) {
    let t,
      e,
      a,
      n = 1;
    if (o.startsWith("rgba")) {
      const s = o.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (!s) return o;
      (t = parseInt(s[1])),
        (e = parseInt(s[2])),
        (a = parseInt(s[3])),
        (n = parseFloat(s[4]));
    } else if (o.startsWith("rgb")) {
      const s = o.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!s) return o;
      (t = parseInt(s[1])), (e = parseInt(s[2])), (a = parseInt(s[3]));
    } else {
      if (!o.startsWith("#")) return o;
      let s = o.replace("#", "");
      if (
        (3 === s.length && (s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2]),
        6 !== s.length)
      )
        return o;
      (t = parseInt(s.substring(0, 2), 16)),
        (e = parseInt(s.substring(2, 4), 16)),
        (a = parseInt(s.substring(4, 6), 16));
    }
    return (
      (t = Math.max(0, Math.floor(t * (1 - r / 100)))),
      (e = Math.max(0, Math.floor(e * (1 - r / 100)))),
      (a = Math.max(0, Math.floor(a * (1 - r / 100)))),
      `rgba(${t},${e},${a},${n})`
    );
  }

  // --- LOCAL STORAGE ---
  function savePlanToLocalStorage() {
    try {
      localStorage.setItem("guildMapPlan", JSON.stringify(planData));
    } catch (o) {
      console.error("Error saving to local storage:", o);
    }
  }
  function loadPlanFromLocalStorage() {
    try {
      const o = localStorage.getItem("guildMapPlan");
      o
        ? ((planData = JSON.parse(o)),
          Object.keys(planData).forEach((r) => {
            Array.isArray(planData[r])
              ? planData[r]
                  .sort((o, t) => o.order - t.order)
                  .forEach((o, t) => (o.order = t))
              : (planData[r] = []);
          }))
        : (planData = {});
    } catch (o) {
      console.error("Error loading from local storage:", o), (planData = {});
    }
  }

  // --- START THE APP ---
  if (document.getElementById("arrow-svg-layer")) {
    defineArrowhead();
  } else {
    console.error(
      "SVG Layer for arrows is definitively missing from HTML after DOMContentLoaded."
    );
  }
  initialize();
});
