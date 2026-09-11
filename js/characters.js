/**
 * Comprehensive Character Database: 24 Champions
 */
const CHARACTER_DB = [
  // 5-STAR LEGENDARIES (Base Rate 1.6%)
  { id: 1, name: "Kaelen Dawn", element: "solar", rarity: 5, role: "striker", hp: 1250, atk: 380, def: 120, spd: 110, color: "#f5c842", burstName: "Solar Flare Explosion" },
  { id: 2, name: "Nyx Voidweaver", element: "void", rarity: 5, role: "striker", hp: 1100, atk: 430, def: 95, spd: 118, color: "#8b5cf6", burstName: "Event Horizon" },
  { id: 3, name: "Aurelia Shield", element: "solar", rarity: 5, role: "defender", hp: 1800, atk: 210, def: 230, spd: 95, color: "#eab308", burstName: "Aegis Sanctuary" },
  { id: 4, name: "Leviathan Tide", element: "hydro", rarity: 5, role: "support", hp: 1400, atk: 260, def: 140, spd: 106, color: "#06b6d4", burstName: "Tidal Genesis" },
  { id: 5, name: "Ignis Sovereign", element: "pyre", rarity: 5, role: "striker", hp: 1300, atk: 410, def: 105, spd: 114, color: "#ef4444", burstName: "Supernova Slash" },
  { id: 6, name: "Verdant Yggdras", element: "flora", rarity: 5, role: "support", hp: 1650, atk: 220, def: 180, spd: 98, color: "#10b981", burstName: "World Tree Renewal" },

  // 4-STAR HEROES (Base Rate 13%)
  { id: 7, name: "Cyrus Zephyr", element: "hydro", rarity: 4, role: "striker", hp: 1050, atk: 310, def: 100, spd: 108, color: "#38bdf8", burstName: "Riptide Spiral" },
  { id: 8, name: "Vesper Night", element: "void", rarity: 4, role: "striker", hp: 980, atk: 335, def: 85, spd: 112, color: "#a855f7", burstName: "Shadow Step" },
  { id: 9, name: "Rowan Bark", element: "flora", rarity: 4, role: "defender", hp: 1520, atk: 190, def: 175, spd: 90, color: "#22c55e", burstName: "Bramble Wall" },
  { id: 10, name: "Brant Ember", element: "pyre", rarity: 4, role: "defender", hp: 1480, atk: 220, def: 160, spd: 92, color: "#f97316", burstName: "Molten Core" },
  { id: 11, name: "Lyra Chime", element: "solar", rarity: 4, role: "support", hp: 1150, atk: 240, def: 115, spd: 105, color: "#fde047", burstName: "Dusk Benediction" },
  { id: 12, name: "Nerina Depths", element: "hydro", rarity: 4, role: "support", hp: 1220, atk: 230, def: 125, spd: 101, color: "#0ea5e9", burstName: "Monsoon Surge" },
  { id: 13, name: "Theron Ash", element: "pyre", rarity: 4, role: "striker", hp: 1020, atk: 325, def: 95, spd: 115, color: "#fb7185", burstName: "Cinder Gale" },
  { id: 14, name: "Selene Orbit", element: "void", rarity: 4, role: "support", hp: 1290, atk: 250, def: 130, spd: 103, color: "#c084fc", burstName: "Gravity Well" },

  // 3-STAR BASE CHARACTERS (Base Rate 85.4%)
  { id: 15, name: "Val Guard", element: "solar", rarity: 3, role: "defender", hp: 1200, atk: 180, def: 140, spd: 88, color: "#fef08a", burstName: "Standard Guard" },
  { id: 16, name: "Marina Wave", element: "hydro", rarity: 3, role: "striker", hp: 920, atk: 260, def: 85, spd: 102, color: "#7dd3fc", burstName: "Hydro Bolt" },
  { id: 17, name: "Kip Flint", element: "pyre", rarity: 3, role: "striker", hp: 890, atk: 275, def: 75, spd: 104, color: "#fda4af", burstName: "Firecracker" },
  { id: 18, name: "Fern Moss", element: "flora", rarity: 3, role: "support", hp: 1100, atk: 170, def: 110, spd: 96, color: "#86efac", burstName: "Spore Spray" },
  { id: 19, name: "Umbra Drone", element: "void", rarity: 3, role: "striker", hp: 850, atk: 290, def: 70, spd: 107, color: "#d8b4fe", burstName: "Void Poke" },
  { id: 20, name: "Sol Archer", element: "solar", rarity: 3, role: "striker", hp: 910, atk: 270, def: 80, spd: 103, color: "#fef9c3", burstName: "Flash Arrow" },
  { id: 21, name: "Kelvin Frost", element: "hydro", rarity: 3, role: "defender", hp: 1350, atk: 160, def: 150, spd: 85, color: "#bae6fd", burstName: "Ice Barricade" },
  { id: 22, name: "Bramble Thorn", element: "flora", rarity: 3, role: "striker", hp: 960, atk: 255, def: 90, spd: 99, color: "#a7f3d0", burstName: "Needle Barrage" },
  { id: 23, name: "Cinder Imp", element: "pyre", rarity: 3, role: "support", hp: 1000, atk: 210, def: 95, spd: 101, color: "#fecdd3", burstName: "Ignite Passion" },
  { id: 24, name: "Null Wisp", element: "void", rarity: 3, role: "defender", hp: 1280, atk: 175, def: 135, spd: 89, color: "#f3e8ff", burstName: "Null Ward" }
];

class CharacterManager {
  static getById(id) {
    return CHARACTER_DB.find(c => c.id === id);
  }

  static getUnlockedCharacters() {
    const ids = window.accountService.user.unlockedIds;
    return CHARACTER_DB.filter(c => ids.includes(c.id));
  }

  static getTeamMembers() {
    return window.accountService.user.activeTeam.map(id => this.getById(id));
  }

  static setTeamSlot(index, characterId) {
    if (index >= 0 && index < 3) {
      window.accountService.user.activeTeam[index] = characterId;
      window.accountService.save();
    }
  }
}
