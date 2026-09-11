/**
 * Core Application Controller & UI Bindings
 */
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const combat = new CombatEngine(canvas, ctx);

  // Resize / Fullscreen handler
  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", handleResize);
  handleResize();

  // Fullscreen Button
  document.getElementById("fullscreen-btn").addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  });

  // Dynamic View Routing
  const tabs = document.querySelectorAll(".nav-tab");
  const panels = document.querySelectorAll(".view-panel");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panels.forEach(p => p.classList.add("hidden"));

      tab.classList.add("active");
      const target = document.getElementById(tab.getAttribute("data-target"));
      if (target) target.classList.remove("hidden");

      if (tab.getAttribute("data-target") === "battle-view") {
        if (!combat.isActive) combat.startBattle();
      } else {
        combat.isActive = false;
      }
    });
  });

  // Render Roster
  function refreshRosterUI() {
    const grid = document.getElementById("roster-grid");
    grid.innerHTML = "";
    const unlocked = window.accountService.user.unlockedIds;
    document.getElementById("unlocked-count").textContent = unlocked.length;

    CHARACTER_DB.forEach(char => {
      const isOwned = unlocked.includes(char.id);
      const card = document.createElement("div");
      card.className = `char-card rarity-${char.rarity}${isOwned ? "" : "locked"}`;
      card.innerHTML = `
        <div class="avatar-circle" style="background:${char.color}">${char.name.charAt(0)}</div>
        <div class="card-title">${char.name}</div>
        <div style="font-size:11px;color:#aaa;">★${char.rarity} \vert{}${char.role}</div>
      `;
      grid.appendChild(card);
    });
  }

  // Render Party Setup
  let selectedSlotIndex = null;
  function refreshTeamUI() {
    const container = document.getElementById("team-slots-container");
    container.innerHTML = "";
    const team = CharacterManager.getTeamMembers();

    team.forEach((hero, index) => {
      const slot = document.createElement("div");
      slot.className = `team-slot ${selectedSlotIndex === index ? "selected" : ""}`;
      slot.innerHTML = `
        <div class="avatar-circle" style="background:${hero.color}">${hero.name.charAt(0)}</div>
        <h4>${hero.name}</h4>
        <small>Slot ${index + 1}</small>
      `;
      slot.onclick = () => {
        selectedSlotIndex = index;
        refreshTeamUI();
      };
      container.appendChild(slot);
    });

    const reserveGrid = document.getElementById("team-selection-grid");
    reserveGrid.innerHTML = "";
    CharacterManager.getUnlockedCharacters().forEach(char => {
      const mini = document.createElement("div");
      mini.className = `char-card rarity-${char.rarity}`;
      mini.innerHTML = `<div class="card-title">${char.name}</div>`;
      mini.onclick = () => {
        if (selectedSlotIndex !== null) {
          CharacterManager.setTeamSlot(selectedSlotIndex, char.id);
          refreshTeamUI();
        }
      };
      reserveGrid.appendChild(mini);
    });
  }

  // Update Currency HUD
  function updateCurrencyDisplay() {
    document.getElementById("shards-display").textContent = window.accountService.user.shards.toLocaleString();
    document.getElementById("tickets-display").textContent = window.accountService.user.tickets;
    document.getElementById("pity-counter").textContent = window.accountService.user.pityCount;
    document.getElementById("player-uid-badge").textContent = window.accountService.user.isGuest ? "Guest Mode" : window.accountService.user.email;
  }

  // Gacha Summon Bindings
  function handleSummon(count) {
    const results = window.gachaEngine.executeSummon(count);
    if (!results) return;

    updateCurrencyDisplay();
    refreshRosterUI();
    refreshTeamUI();

    const modal = document.getElementById("gacha-modal");
    const row = document.getElementById("reveal-cards");
    row.innerHTML = "";

    results.forEach(res => {
      const c = res.character;
      const card = document.createElement("div");
      card.className = `char-card rarity-${c.rarity}`;
      card.innerHTML = `
        <div class="avatar-circle" style="background:${c.color}">${c.name.charAt(0)}</div>
        <div class="card-title">${c.name}</div>
        <div style="font-size:12px;color:var(--accent-gold);">${res.isNew ? "★ NEW!" : "DUP (+Shards)"}</div>
      `;
      row.appendChild(card);
    });

    modal.classList.remove("hidden");
  }

  document.getElementById("pull-1-btn").onclick = () => handleSummon(1);
  document.getElementById("pull-10-btn").onclick = () => handleSummon(10);
  document.getElementById("close-summon-btn").onclick = () => {
    document.getElementById("gacha-modal").classList.add("hidden");
  };

  // Auth & IAP Modal Bindings
  const authModal = document.getElementById("auth-modal");
  document.getElementById("auth-btn").onclick = () => authModal.classList.remove("hidden");
  document.getElementById("close-auth-btn").onclick = () => authModal.classList.add("hidden");
  document.getElementById("google-login-btn").onclick = async () => {
    const res = await window.accountService.linkGoogleAccount();
    if (res.success) {
      alert("Successfully linked Gmail account!");
      authModal.classList.add("hidden");
      updateCurrencyDisplay();
    }
  };
  document.getElementById("buy-currency-btn").onclick = async () => {
    const res = await window.accountService.triggerPurchase("pack_shards_tier1");
    if (res.success) updateCurrencyDisplay();
  };

  // Combat UI Actions
  document.getElementById("btn-basic-atk").onclick = () => combat.executeAction('basic');
  document.getElementById("btn-skill").onclick = () => combat.executeAction('skill');
  document.getElementById("btn-burst").onclick = () => combat.executeAction('burst');

  // Interactive Target Select on Canvas
  canvas.addEventListener("click", (e) => {
    if (!combat.isActive) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    combat.enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - clickX, enemy.y - clickY);
      if (dist < 40) combat.selectedTarget = enemy;
    });
  });

  // Main Graphics Render Loop
  let tick = 0;
  function renderLoop() {
    tick++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (combat.isActive) {
      combat.updateAndRender(tick);
    } else {
      // Idle ambient background stars
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      for (let i = 0; i < 50; i++) {
        const sx = (Math.sin(tick * 0.001 + i) * 0.5 + 0.5) * canvas.width;
        const sy = (Math.cos(tick * 0.002 + i * 2) * 0.5 + 0.5) * canvas.height;
        ctx.fillRect(sx, sy, 2, 2);
      }
    }
    requestAnimationFrame(renderLoop);
  }

  // Initial Boot
  refreshRosterUI();
  refreshTeamUI();
  updateCurrencyDisplay();
  requestAnimationFrame(renderLoop);
});
