document.addEventListener("DOMContentLoaded", () => {
  // Auto-show instructions when page loads
  setTimeout(showInstruction, 500);

  const playButton = document.getElementById("playButton");
  const nameInput = document.querySelector('[name="name"]');
  const levelSelect = document.querySelector('[name="level"]');
  const gunRadios = document.querySelectorAll('[name="gun"]');
  const targetRadios = document.querySelectorAll('[name="target"]');
  const errorMessage = document.getElementById("error-message");

  function validateForm() {
    const nameValid = nameInput.value.trim() !== "";
    const levelValid = levelSelect.value !== "";
    const gunValid = Array.from(gunRadios).some((radio) => radio.checked);
    const targetValid = Array.from(targetRadios).some((radio) => radio.checked);

    if (nameValid && levelValid && gunValid && targetValid) {
      playButton.disabled = false;
      errorMessage.classList.add("hide");
    } else {
      playButton.disabled = true;
      if (nameInput.value.trim() !== "") {
        errorMessage.classList.remove("hide");
      }
    }
  }

  nameInput.addEventListener("input", validateForm);
  levelSelect.addEventListener("change", validateForm);
  gunRadios.forEach((radio) => radio.addEventListener("change", validateForm));
  targetRadios.forEach((radio) =>
    radio.addEventListener("change", validateForm)
  );

  // Initial validation
  validateForm();
});

class Game {
  constructor() {
    this.clicked = false;
    this.countdown = 4;
    this.countdownInterval = null;
    this.score = 0;
    this.targetInterval = null;
    this.gameRunning = false;
    this.paused = false;
    this.board = document.querySelector(".board");
    this.initialize();
  }

  initialize() {
    this.name = document.querySelector('[name="name"]')?.value || "Player";
    this.timer =
      parseInt(document.querySelector('[name="level"]')?.value) || 30;
    this.targetType =
      document.querySelector('[name="target"]:checked')?.value || 1;
    this.gunType =
      document.querySelector('[name="gun"]:checked')?.value == "true";
    const nameGun = this.gunType ? "Sprites/gun1.png" : "Sprites/gun2.png";
    this.board.innerHTML = `
            <div class="header">
              <span><b id="playerTxt">${this.name}</b></span>
              <span><b id="scoreTxt">Score: 0</b></span>
              <span><b id="timeTxt">Time: ${this.timer}</b></span>
            </div>
            <h1 class="count">3</h1>
            <img src="Sprites/pointer.png" alt="Targeting pointer" class="pointer">
            <img src="${nameGun}" alt="Game weapon" class="gun">`;
    this.gun = document.querySelector(".gun");
    this.pointer = document.querySelector(".pointer");
    this.bound = this.board.getBoundingClientRect();
    this.target = document.querySelectorAll(".target");

    // Center the pointer initially
    this.pointer.style.left = this.board.clientWidth / 2 - 25 + "px";
    this.pointer.style.top = this.board.clientHeight / 2 - 25 + "px";
    this.gun.style.left = parseInt(this.pointer.style.left) + 50 + "px";
    this.gun.style.top = parseInt(this.pointer.style.top) + 150 + "px";

    // Set up save score button
    document.getElementById("saveScoreBtn").onclick = () => {
      this.saveLeaderboard(this.name, this.score);
    };

    // Set up mouse movement
    this.board.onmousemove = (e) => {
      const x = e.clientX - this.bound.left;
      const y = e.clientY - this.bound.top;
      this.pointer.style.left = x - 25 + "px";
      this.pointer.style.top = y - 25 + "px";
      this.gun.style.left = parseInt(this.pointer.style.left) + 50 + "px";
    };

    // Handle window resize
    window.onresize = (e) => {
      this.bound = this.board.getBoundingClientRect();
    };

    // Set up keyboard handlers
    window.onkeydown = (e) => {
      if (e.code == "Escape" && this.gameRunning) {
        this.handlePause();
      }
      if (e.code == "Space" && this.gameRunning && !this.paused) {
        this.switchGun();
      }
    };
  }

  handlePause() {
    const pause = document.getElementById("pause");
    if (this.paused) {
      // Resume game
      pause.classList.add("hide");
      this.paused = false;

      // Show countdown before resuming
      const countdownText = document.querySelector(".count");
      countdownText.classList.remove("hide");
      this.countdown = 3;
      countdownText.innerHTML = this.countdown;

      this.countdownInterval = setInterval(() => {
        this.countdown--;
        countdownText.innerHTML = this.countdown;
        if (this.countdown <= 0) {
          countdownText.classList.add("hide");
          clearInterval(this.countdownInterval);

          // Restart the intervals
          this.targetInterval = setInterval(() => {
            this.createTarget();
          }, 3000);

          this.interval = setInterval(() => {
            this.timer -= 0.1;
            document.getElementById(
              "timeTxt"
            ).innerText = `Time: ${this.timer.toFixed(0)}`;
            if (this.timer <= 0) {
              this.endGame();
            }
          }, 100);
        }
      }, 1000);
    } else {
      // Pause game
      pause.classList.remove("hide");
      this.paused = true;
      clearInterval(this.interval);
      clearInterval(this.targetInterval);
    }
  }

  switchGun() {
    this.gunType = !this.gunType;
    this.gun.src = `Sprites/gun${this.gunType ? 1 : 2}.png`;
    this.gun.classList.add("up");
    setTimeout(() => {
      this.gun.classList.remove("up");
    }, 300);
  }

  generateTarget() {
    for (let i = 0; i < 3; i++) {
      this.createTarget();
    }
    this.target = document.querySelectorAll(".target");
  }

  start() {
    this.gameRunning = true;
    const countdownText = document.querySelector(".count");
    this.countdown = 3;
    countdownText.innerHTML = this.countdown;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      countdownText.innerHTML = this.countdown;
      if (this.countdown <= 0) {
        this.finishSetup();
        this.targetInterval = setInterval(() => {
          this.createTarget();
        }, 3000);
        countdownText.classList.add("hide");
        clearInterval(this.countdownInterval);
        this.interval = setInterval(() => {
          this.timer -= 0.1;
          document.getElementById(
            "timeTxt"
          ).innerText = `Time: ${this.timer.toFixed(0)}`;
          if (this.timer <= 0) {
            this.endGame();
          }
        }, 100);
      }
    }, 1000);
  }

  endGame() {
    this.gameRunning = false;
    clearInterval(this.interval);
    clearInterval(this.targetInterval);
    document.getElementById("gameOver").classList.remove("hide");
    document.getElementById("playerNameOver").innerText =
      "Player Name : " + this.name;
    document.getElementById("scoreOver").innerText = "Score : " + this.score;
  }

  finishSetup() {
    this.pointer.onclick = (e) => {
      if (this.paused) return;

      const x = e.clientX - this.bound.left;
      const y = e.clientY - this.bound.top;
      let clicked = false;
      this.target.forEach((item) => {
        if (
          x < parseInt(item.style.left) + item.clientWidth &&
          x > parseInt(item.style.left) &&
          y < parseInt(item.style.top) + item.clientHeight &&
          y > parseInt(item.style.top)
        ) {
          if (!item.classList.contains("remove")) {
            item.classList.add("remove");
            this.score++;
            document.getElementById(
              "scoreTxt"
            ).innerText = `Score: ${this.score}`;
            clicked = true;
            // Remove target from DOM after shot
            setTimeout(() => {
              item.remove();
            }, 200);
            return;
          }
        }
      });
      if (!clicked) {
        this.timer -= 5;
        document.getElementById(
          "timeTxt"
        ).innerText = `Time: ${this.timer.toFixed(0)}`;
        if (this.timer <= 0) {
          this.endGame();
        }
      }
    };
  }

  createTarget() {
    const target = document.createElement("img");
    target.classList.add("target");
    target.src = `Sprites/target${this.targetType}.png`;
    target.width = "70";
    target.alt = "Game target";
    target.style.left = Math.random() * (this.board.clientWidth - 70) + "px";
    target.style.top = Math.random() * (this.board.clientHeight - 70) + "px";
    this.board.appendChild(target);
    this.target = document.querySelectorAll(".target");
  }

  saveLeaderboard(name, score) {
    const leader = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leader.push({
      name,
      score,
      date: Date.now(),
    });
    localStorage.setItem("leaderboard", JSON.stringify(leader));
    this.fetchLeaderboard();
  }

  fetchLeaderboard() {
    let leader = JSON.parse(localStorage.getItem("leaderboard")) || [];
    const sortValue = document.getElementById("sort").value;

    if (sortValue === "score") {
      leader = leader.sort((a, b) => b.score - a.score);
    } else {
      leader = leader.sort((a, b) => b.date - a.date);
    }

    let html = "";
    leader.forEach((item, index) => {
      const date = new Date(item.date);
      const formattedDate =
        date.toLocaleDateString() + " " + date.toLocaleTimeString();

      html += `
              <div class="board-item" role="listitem">
                <div class="user-text">
                  <b>${item.name}</b>
                  <p><i>Score: ${item.score}</i></p>
                  <small>Date: ${formattedDate}</small>
                </div>
                <div class="btn-item">
                  <button style="padding: 2px;" id="detail-${index}" onclick="showScoreDetails(${index})">Detail</button>
                </div>
              </div>
            `;
    });

    document.getElementById("leaderboardSection").innerHTML =
      html || "<p>No scores saved yet.</p>";
  }
}

function main() {
  document.getElementById("gameOver").classList.add("hide");
  document.querySelectorAll(".target").forEach((target) => target.remove());
  fetchLeaderboard();
  const game = new Game();
  game.generateTarget();
  game.start();
}

function play() {
  if (
    document.querySelector('input[name="name"]').value.trim() &&
    document.querySelector('select[name="level"]').value &&
    document.querySelector('input[name="gun"]:checked') &&
    document.querySelector('input[name="target"]:checked')
  ) {
    document.querySelector(".container").classList.add("hide");
    document.querySelector(".game").classList.remove("hide");
    main();
  } else {
    document.getElementById("error-message").classList.remove("hide");
  }
}

function showInstruction() {
  document.querySelector(".instructBoard").classList.remove("hide");
}

document.getElementById("sort")?.addEventListener("change", function (event) {
  sortLeaderBoard(event.target.value);
});

function sortLeaderBoard(value) {
  let leader = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const sortValue = value;

  if (sortValue === "score") {
    leader.sort((a, b) => b.score - a.score);
  } else {
    leader.sort((a, b) => b.date - a.date);
  }

  let html = "";
  leader.forEach((item, index) => {
    const date = new Date(item.date);
    const formattedDate =
      date.toLocaleDateString() + " " + date.toLocaleTimeString();

    html += `
            <div class="board-item" role="listitem">
              <div class="user-text">
                <b>${item.name}</b>
                <p><i>Score: ${item.score}</i></p>
                <small>Date: ${formattedDate}</small>
              </div>
              <div class="btn-item">
                <button style="padding: 2px;" id="detail-${index}" onclick="showScoreDetails(${index})">Detail</button>
              </div>
            </div>
          `;
  });

  document.getElementById("leaderboardSection").innerHTML =
    html || "<p>No scores saved yet.</p>";
}

function fetchLeaderboard() {
  const game = new Game();
  game.fetchLeaderboard();
}

function togglePause() {
  const game = new Game();
  game.handlePause();
}

function showScoreDetails(index) {
  const leader = JSON.parse(localStorage.getItem("leaderboard")) || [];
  if (leader[index]) {
    const item = leader[index];
    const date = new Date(item.date);
    const formattedDate =
      date.toLocaleDateString() + " " + date.toLocaleTimeString();

    alert(`Player: ${item.name}\nScore: ${item.score}\nDate: ${formattedDate}`);
  }
}

// Show instructions when page loads
window.onload = function () {
  document.getElementById("sort").value = "time"; // Default sort by last match
  fetchLeaderboard();
};
