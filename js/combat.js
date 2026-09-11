/**
 * Turn-Based 3v3 Combat Engine
 */
class CombatEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.isActive = false;
    this.allies = [];
    this.enemies = [];
    this.turnQueue = [];
    this.currentActor = null;
    this.selectedTarget = null;
    this.damageNumbers = [];
    this.shakeDuration = 0;
  }

  startBattle() {
    this.isActive = true;
    const party = CharacterManager.getTeamMembers();

    this.allies = party.map((hero, idx) => ({
      ...hero,
      isAlly: true,
      maxHp: hero.hp,
      curHp: hero.hp,
      x: 250,
      y: 180 + idx * 160,
      animOffset: 0
    }));

    // Generate balanced enemy triad
    const pool = CHARACTER_DB;
    this.enemies = [0, 1, 2].map((i) => {
      const template = pool[Math.floor(Math.random() * pool.length)];
      return {
        ...template,
        name: "Shadow " + template.name,
        isAlly: false,
        maxHp: Math.floor(template.hp * 1.1),
        curHp: Math.floor(template.hp * 1.1),
        x: 1030,
        y: 180 + i * 160,
        animOffset: 0
      };
    });

    this.selectedTarget = this.enemies[0];
    this.determineTurnOrder();
    this.nextTurn();
  }

  determineTurnOrder() {
    const all = [...this.allies, ...this.enemies].filter(e => e.curHp > 0);
    all.sort((a, b) => b.spd - a.spd);
    this.turnQueue = all;
  }

  nextTurn() {
    this.turnQueue = this.turnQueue.filter(u => u.curHp > 0);
    if (this.allies.every(a => a.curHp <= 0)) {
      alert("Defeat! Your team succumbed to the Astral Shadows.");
      this.isActive = false;
      return;
    }
    if (this.enemies.every(e => e.curHp <= 0)) {
      alert("Victory! Rewarded 300 Astral Shards!");
      window.accountService.user.shards += 300;
      window.accountService.save();
      this.isActive = false;
      return;
    }

    if (this.turnQueue.length === 0) {
      this.determineTurnOrder();
    }

    this.currentActor = this.turnQueue.shift();

    // Auto-execute if current actor is enemy
    if (!this.currentActor.isAlly) {
      setTimeout(() => this.executeEnemyTurn(), 700);
    }
  }

  executeAction(skillType) {
    if (!this.currentActor || !this.currentActor.isAlly) return;
    if (!this.selectedTarget || this.selectedTarget.curHp <= 0) {
      this.selectedTarget = this.enemies.find(e => e.curHp > 0);
    }

    let multiplier = 1.0;
    if (skillType === 'skill') multiplier = 1.6;
    if (skillType === 'burst') multiplier = 2.8;

    this.applyDamage(this.currentActor, this.selectedTarget, multiplier);
    this.nextTurn();
  }

  executeEnemyTurn() {
    const aliveAllies = this.allies.filter(a => a.curHp > 0);
    if (aliveAllies.length === 0) return;
    const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
    this.applyDamage(this.currentActor, target, 1.1);
    this.nextTurn();
  }

  applyDamage(attacker, defender, multiplier) {
    const isCrit = Math.random() < 0.25;
    const critBonus = isCrit ? 1.75 : 1.0;
    const raw = (attacker.atk * multiplier * critBonus) - (defender.def * 0.4);
    const damage = Math.max(Math.floor(raw), 15);

    defender.curHp = Math.max(0, defender.curHp - damage);

    // Camera shake on crit / burst
    if (isCrit || multiplier > 1.5) this.shakeDuration = 12;

    // Trigger visual float number
    this.damageNumbers.push({
      text: (isCrit ? "CRIT! " : "") + damage,
      x: defender.x + (Math.random() * 40 - 20),
      y: defender.y - 40,
      color: isCrit ? "#ffcc00" : "#ffffff",
      alpha: 1.0
    });

    // Pulse step animation
    attacker.animOffset = attacker.isAlly ? 50 : -50;
    setTimeout(() => { attacker.animOffset = 0; }, 180);
  }

  updateAndRender(tick) {
    if (this.shakeDuration > 0) {
      this.ctx.save();
      this.ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      this.shakeDuration--;
    }

    // Render characters
    [...this.allies, ...this.enemies].forEach(unit => {
      if (unit.curHp <= 0) return;

      const renderX = unit.x + (unit.animOffset || 0);
      const renderY = unit.y;

      // Selection Marker
      if (unit === this.selectedTarget) {
        this.ctx.strokeStyle = "#3df3ff";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(renderX - 45, renderY - 45, 90, 90);
      }

      // Unit Body Renders
      this.ctx.fillStyle = unit.color;
      this.ctx.beginPath();
      this.ctx.arc(renderX, renderY, 36, 0, Math.PI * 2);
      this.ctx.fill();

      // Core Highlight
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 14px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(unit.name.split(" ")[0], renderX, renderY + 5);

      // HP Bar
      const barW = 80;
      const barH = 8;
      const fillW = (unit.curHp / unit.maxHp) * barW;
      this.ctx.fillStyle = "rgba(0,0,0,0.6)";
      this.ctx.fillRect(renderX - barW / 2, renderY + 48, barW, barH);
      this.ctx.fillStyle = unit.isAlly ? "#22c55e" : "#ef4444";
      this.ctx.fillRect(renderX - barW / 2, renderY + 48, fillW, barH);
    });

    // Floating Numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dmg = this.damageNumbers[i];
      dmg.y -= 1.2;
      dmg.alpha -= 0.02;
      this.ctx.fillStyle = dmg.color;
      this.ctx.globalAlpha = Math.max(0, dmg.alpha);
      this.ctx.font = "bold 20px sans-serif";
      this.ctx.fillText(dmg.text, dmg.x, dmg.y);
      this.ctx.globalAlpha = 1.0;
      if (dmg.alpha <= 0) this.damageNumbers.splice(i, 1);
    }

    if (this.shakeDuration > 0) {
      this.ctx.restore();
    }
  }
}
