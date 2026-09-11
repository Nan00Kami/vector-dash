/**
 * Professional Gacha Banner & Rate Calculation Engine
 */
class GachaEngine {
  constructor() {
    this.BASE_5_STAR_RATE = 0.016; // 1.6%
    this.BASE_4_STAR_RATE = 0.130; // 13.0%
    this.SOFT_PITY_THRESHOLD = 70;
    this.HARD_PITY_MAX = 90;
  }

  calculate5StarProbability(currentPity) {
    if (currentPity < this.SOFT_PITY_THRESHOLD) {
      return this.BASE_5_STAR_RATE;
    }
    // Soft pity accelerates steeply up to 100% at pull 90
    const extraPulls = currentPity - this.SOFT_PITY_THRESHOLD;
    return this.BASE_5_STAR_RATE + (extraPulls * 0.058);
  }

  pullOnce() {
    const user = window.accountService.user;
    user.pityCount++;

    const roll = Math.random();
    const cur5Rate = this.calculate5StarProbability(user.pityCount);

    let resultRarity = 3;

    if (roll < cur5Rate || user.pityCount >= this.HARD_PITY_MAX) {
      resultRarity = 5;
      user.pityCount = 0; // Reset pity
    } else if (roll < (cur5Rate + this.BASE_4_STAR_RATE)) {
      resultRarity = 4;
    } else {
      resultRarity = 3;
    }

    const pool = CHARACTER_DB.filter(c => c.rarity === resultRarity);
    const chosen = pool[Math.floor(Math.random() * pool.length)];

    // Duplicate detection and compensation
    const isNew = !user.unlockedIds.includes(chosen.id);
    if (isNew) {
      user.unlockedIds.push(chosen.id);
    } else {
      user.shards += resultRarity === 5 ? 500 : (resultRarity === 4 ? 80 : 15);
    }

    window.accountService.save();
    return { character: chosen, isNew: isNew };
  }

  executeSummon(count = 1) {
    const user = window.accountService.user;
    const costTickets = count;
    const costShards = count * 160;

    if (user.tickets >= costTickets) {
      user.tickets -= costTickets;
    } else if (user.shards >= costShards) {
      user.shards -= costShards;
    } else {
      alert("Insufficient Astral Shards or Summon Tickets!");
      return null;
    }

    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(this.pullOnce());
    }

    window.accountService.save();
    return results;
  }
}

window.gachaEngine = new GachaEngine();
