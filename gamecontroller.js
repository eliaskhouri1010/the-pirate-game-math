function makeNormalQuestions(r) {
  const shift = r - 1;
  return [
    {q:`${3 + shift} + ${4 + shift}`, a:(3 + shift) + (4 + shift)},
    {q:`${10 + shift} - ${5 + shift}`, a:(10 + shift) - (5 + shift)},
    {q:`${6 + shift} + ${8 + shift}`, a:(6 + shift) + (8 + shift)},
    {q:`${5 + (shift % 5)} × ${3 + (shift % 4)}`, a:(5 + (shift % 5)) * (3 + (shift % 4))},
    {q:`${12 + shift} + ${9 + shift}`, a:(12 + shift) + (9 + shift)},
    {q:`${18 + shift} - ${7 + shift}`, a:(18 + shift) - (7 + shift)},
    {q:`${7 + (shift % 6)} × ${4 + (shift % 5)}`, a:(7 + (shift % 6)) * (4 + (shift % 5))},
    {q:`${45 + shift * 2} ÷ 5`, a:(45 + shift * 2) / 5},
    {q:`${16 + shift} + ${27 + shift * 2}`, a:(16 + shift) + (27 + shift * 2)},
    {q:`${8 + (shift % 7)} × ${9 + (shift % 3)}`, a:(8 + (shift % 7)) * (9 + (shift % 3))}
  ];
}

let round = 1, position = 0, coins = 0, mode = "normal", challengeType = null;
let blobColor = "green";
let hasCrown = false;
const owned = new Set(["green"]);
const $ = id => document.getElementById(id);

function challengeFor(r, type) {
  if (type === "mountain") {
    const a = 8 + r, b = 4 + (r % 6), c = 2 + (r % 5);
    return { q:`What is ${a} × ${b} + ${c}?`, a:a*b+c };
  }
  const a = 10 + r, b = 5 + (r % 7), c = 3 + (r % 6);
  return { q:`What is ${a} × ${b} - ${c}?`, a:a*b-c };
}

const blobColors = {
  green:"#43c943",
  blue:"#3f8cff",
  red:"#ef4b4b",
  purple:"#9b59d6",
  gold:"#f2c94c"
};
const itemPrices = {green:0, blue:5, red:5, purple:5, gold:8, crown:10};

function mountainSVG() {
  return `<svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg">
    <rect width="700" height="360" rx="24" fill="#cceeff"/>
    <circle cx="575" cy="70" r="45" fill="#fff2a6"/>
    <path d="M0 330 L190 100 L300 220 L405 65 L700 330 Z" fill="#6b93a9"/>
    <path d="M120 330 L250 160 L360 330 Z" fill="#496f89"/>
    <path d="M405 65 L360 155 L420 135 L455 165 L510 118 L700 330 L405 65 Z" fill="#577f98"/>
    <path d="M190 100 L160 140 L205 132 L230 160 L250 160 L300 220 Z" fill="white"/>
    <path d="M405 65 L382 106 L420 95 L443 120 L465 102 Z" fill="white"/>
    <path d="M0 330 Q180 270 350 325 T700 315 V360 H0Z" fill="#79c96b"/>
    <circle cx="90" cy="280" r="10" fill="#3f9c48"/><circle cx="110" cy="270" r="7" fill="#3f9c48"/>
  </svg>`;
}
function dragonSVG() {
  return `<svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg">
    <rect width="700" height="360" rx="24" fill="#e7ddff"/>
    <circle cx="100" cy="75" r="42" fill="#fff2a6"/>
    <path d="M160 300 Q180 130 350 105 Q500 80 575 185 Q605 230 565 285 Q500 330 390 285 Q310 345 160 300Z" fill="#7b52c9" stroke="#4d328c" stroke-width="7"/>
    <path d="M195 170 L110 85 L230 115 Z" fill="#a67be8" stroke="#4d328c" stroke-width="7"/>
    <path d="M490 135 L585 75 L555 175 Z" fill="#a67be8" stroke="#4d328c" stroke-width="7"/>
    <circle cx="455" cy="160" r="11" fill="#ffd84d"/><circle cx="505" cy="158" r="11" fill="#ffd84d"/>
    <circle cx="455" cy="160" r="4" fill="#351d61"/><circle cx="505" cy="158" r="4" fill="#351d61"/>
    <path d="M430 205 Q480 230 525 200" fill="none" stroke="#351d61" stroke-width="8" stroke-linecap="round"/>
    <path d="M255 260 Q180 220 130 245 Q105 258 85 280" fill="none" stroke="#4d328c" stroke-width="20" stroke-linecap="round"/>
    <path d="M580 245 Q635 210 660 235" fill="none" stroke="#4d328c" stroke-width="18" stroke-linecap="round"/>
    <path d="M320 290 L290 335 L350 315 L380 345 L410 290" fill="#a67be8" stroke="#4d328c" stroke-width="6"/>
  </svg>`;
}
function chestSVG(open=false) {
  return `<svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="500" height="300" rx="24" fill="#eaf7ff"/>
    ${open ? '<path d="M130 120 Q250 35 370 120 L350 165 L150 165Z" fill="#c58b32" stroke="#7a4e17" stroke-width="9"/>' : ''}
    <rect x="110" y="145" width="280" height="110" rx="12" fill="#a8661f" stroke="#6e4012" stroke-width="9"/>
    <path d="M110 185 H390" stroke="#6e4012" stroke-width="8"/>
    <rect x="225" y="175" width="50" height="55" rx="8" fill="#f5c542" stroke="#9b7010" stroke-width="6"/>
    ${open ? '<circle cx="250" cy="110" r="18" fill="#ffd84d"/><circle cx="300" cy="105" r="13" fill="#ffd84d"/><circle cx="205" cy="105" r="12" fill="#ffd84d"/>' : ''}
  </svg>`;
}

function buildGrid() {
  const grid = $("grid");
  grid.innerHTML = "";
  for (let i=0; i<10; i++) {
    const area = document.createElement("div");
    area.className = "cell-area";
    const landmark = document.createElement("div");
    landmark.className = "landmark";
    if (i === 4) landmark.innerHTML = mountainSVG().replace('<svg', '<svg aria-label="mountain"');
    if (i === 9) landmark.innerHTML = dragonSVG().replace('<svg', '<svg aria-label="dragon"');
    area.appendChild(landmark);
    const cell = document.createElement("div");
    cell.className = "cell";
    if (i < position) cell.classList.add("done");
    if (i === position) {
      cell.classList.add("current");
      const color = blobColors[blobColor] || blobColors.green;
      const crown = hasCrown ? '<div style="position:absolute;top:-25px;font-size:22px;">👑</div>' : '';
      cell.innerHTML = `<div class="blob" title="${blobColor} blob" style="background:${color};border-color:${color};">${crown}</div>`;
    } else {
      cell.textContent = i+1;
    }
    area.appendChild(cell);
    grid.appendChild(area);
  }

  const xArea = document.createElement("div");
  xArea.className = "cell-area";
  xArea.innerHTML = '<div class="landmark"></div><div style="font-size:clamp(42px,6vw,72px);font-weight:900;color:#b51f1f;line-height:1;">✕</div>';
  grid.appendChild(xArea);
}

function updateUI() {
  buildGrid();
  $("roundLabel").textContent = "Round " + round;
  $("coins").textContent = coins;
  $("progress").textContent = `Square ${position + 1} of 10`;
  const questions = makeNormalQuestions(round);
  $("question").textContent = questions[position].q + " = ?";
  $("message").textContent = "";
  $("message").className = "message";
  $("answer").value = "";
  $("answer").focus();
}

function startGame() {
  round = 1; position = 0; coins = 0;
  blobColor = "green";
  hasCrown = false;
  owned.clear();
  owned.add("green");
  $("startScreen").classList.add("hidden");
  $("gameScreen").classList.remove("hidden");
  updateUI();
}
function restartFromRoundOne() {
  round = 1;
  position = 0;
  coins = 0;
  blobColor = "green";
  hasCrown = false;
  owned.clear();
  owned.add("green");
  mode = "normal";
  challengeType = null;

  // Return completely to the original home screen.
  $("rewardScreen").classList.add("hidden");
  $("shopScreen").classList.add("hidden");
  $("gameScreen").classList.add("hidden");
  $("challengeScreen").classList.add("hidden");
  $("startScreen").classList.remove("hidden");
}

function nextRound() {
  round++;
  position = 0;
  $("rewardScreen").classList.add("hidden");
  $("shopScreen").classList.add("hidden");
  $("gameScreen").classList.remove("hidden");
  updateUI();
}
function openShop() {
  $("rewardScreen").classList.add("hidden");
  $("shopScreen").classList.remove("hidden");
  $("shopMessage").textContent = `You have ${coins} coins.`;
  updateShop();
}
function showChallenge(type) {
  mode = "challenge"; challengeType = type;
  $("gameScreen").classList.add("hidden");
  $("challengeScreen").classList.remove("hidden");
  $("challengeMessage").textContent = "";
  $("challengeMessage").className = "message";
  $("challengeAnswer").value = "";
  const challenge = challengeFor(round, type);
  $("challengeAnswer").dataset.answer = String(challenge.a);
  if (type === "mountain") {
    $("challengeArt").innerHTML = mountainSVG();
    $("challengeTitle").textContent = "⛰️ Mountain Challenge";
    $("challengeText").textContent = "To climb the mountain you must complete a challenge question.";
  } else {
    $("challengeArt").innerHTML = dragonSVG();
    $("challengeTitle").textContent = "🐉 Final Boss Fight";
    $("challengeText").textContent = "Final boss fight. Complete the question to defeat the dragon.";
  }
  $("challengeQuestion").textContent = challenge.q;
  $("challengeAnswer").focus();
}
function checkMain() {
  const input = $("answer");
  const value = input.value.trim();
  const correct = String(makeNormalQuestions(round)[position].a);
  if (value === correct) {
    $("message").textContent = "Correct! The blob moves forward! 🌟";
    $("message").className = "message right";
    setTimeout(() => {
      if (position === 4) {
        showChallenge("mountain");
      } else if (position === 9) {
        showChallenge("dragon");
      } else {
        position++;
        updateUI();
      }
    }, 650);
  } else {
    $("message").textContent = "Not quite — try the question again.";
    $("message").className = "message wrong";
    input.select();
  }
}
function checkChallenge() {
  const input = $("challengeAnswer");
  if (input.value.trim() === input.dataset.answer) {
    $("challengeMessage").textContent = "Correct! Challenge complete! 🎉";
    $("challengeMessage").className = "message right";
    setTimeout(() => {
      $("challengeScreen").classList.add("hidden");
      if (challengeType === "mountain") {
        position++;
        mode = "normal";
        $("gameScreen").classList.remove("hidden");
        updateUI();
      } else {
        coins += 10;
        $("rewardText").textContent = `You defeated the dragon in Round ${round}! Your total is ${coins} coins.`;
        $("chestArt").innerHTML = chestSVG(true);
        $("rewardScreen").classList.remove("hidden");
        $("shopBtn").onclick = openShop;
        $("nextRoundBtn").onclick = nextRound;
      }
    }, 700);
  } else {
    $("challengeMessage").textContent = "The challenge is still active — try again!";
    $("challengeMessage").className = "message wrong";
    input.select();
  }
}

function updateShop() {
  document.querySelectorAll("[data-item]").forEach(btn => {
    const item = btn.dataset.item;
    const ownedItem = owned.has(item);
    const selected = (item === blobColor) || (item === "crown" && hasCrown);
    if (selected) {
      btn.textContent = "SELECTED";
      btn.disabled = true;
    } else if (ownedItem) {
      btn.textContent = "SELECT";
      btn.disabled = false;
    } else {
      btn.textContent = `BUY (${itemPrices[item]} 🪙)`;
      btn.disabled = coins < itemPrices[item];
    }
  });
}

document.querySelectorAll("[data-item]").forEach(btn => {
  btn.onclick = () => {
    const item = btn.dataset.item;
    if (!owned.has(item)) {
      const price = itemPrices[item];
      if (coins < price) return;
      coins -= price;
      owned.add(item);
    }
    if (item === "crown") hasCrown = true;
    else blobColor = item;
    $("shopMessage").textContent = `Selected! You have ${coins} coins.`;
    updateShop();
  };
});

$("startBtn").onclick = startGame;
$("submitBtn").onclick = checkMain;
$("shopNextBtn").onclick = nextRound;
$("restartBtn").onclick = restartFromRoundOne;
$("restartShopBtn").onclick = restartFromRoundOne;
$("challengeSubmit").onclick = checkChallenge;

$("answer").addEventListener("keydown", e => { if (e.key === "Enter") checkMain(); });
$("challengeAnswer").addEventListener("keydown", e => { if (e.key === "Enter") checkChallenge(); });
