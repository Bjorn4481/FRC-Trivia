let currentTeam = {};
let gameStarted = false;
let guessMade = false; // Flag to track if a guess has been made
var teams = [];
var sampleTeams = []; // Array to hold the random sample of 25 teams
var currentIndex = 0; // Index to track the current team in the sample
var chart = null;
let score = {"correct": 0, "incorrect": 0};	
let list_amount = 1;

import("./top100.js").then((module) => {
  module.loadTop100
    .then((loadedTeams) => {
      teams = loadedTeams;
      if (teams.length === 0) {
        console.error("Teams array is empty after loading.");
      }
    })
    .catch((error) => {
      console.error("Failed to load teams:", error);
    });
});

function getRandomSample(arr, size) {
  const shuffled = arr.slice(0);
  let i = arr.length;
  let min = i - size;
  let temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

function startGame() {
  if (teams.length === 0) {
    alert("No team data available.");
    return;
  }
  gameStarted = true;
  guessMade = false; // Reset the flag when the game starts
  sampleTeams = getRandomSample(teams, list_amount); // Get a random sample of 25 teams
  currentIndex = 0; // Reset the index
  score = {"correct": 0, "incorrect": 0}; // Reset the score
  chart.data.datasets[0].data = [0, 0]; // Reset the chart data
  chart.update(); // Update the chart
  updateScoreLabelInDoughnutChart(); // Update the score label in the chart
  document.getElementById("start-button").style.display = "none";
  document.getElementById("yes-button").style.display = "block";
  document.getElementById("no-button").style.display = "block";
  document.getElementById("result").innerText = "";
  nextTeam();
}

function nextTeam() {
  if (currentIndex >= sampleTeams.length) {
    // make a <dialog> element
    let dialog = document.getElementById("game-over-dialog");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "game-over-dialog";
      document.body.appendChild(dialog);
    }
    dialog.innerHTML = `
      <div style="text-align: center;">
      <h1>Game Over!</h1>
      <p>You scored ${score.correct} out of ${list_amount}.</p>
      <button style="display: block; margin: 0 auto; width: 150px;" onclick="document.getElementById('game-over-dialog').close();">Close</button>
      </div>
    `;
    dialog.showModal();
    gameStarted = false;
    document.getElementById("start-button").style.display = "block";
    document.getElementById("yes-button").style.display = "none";
    document.getElementById("no-button").style.display = "none";
    return;
  }
  currentTeam = sampleTeams[currentIndex];
  currentIndex++;
  document.getElementById("team-number").innerText = `Team Number: ${currentTeam.Number}`;
  document.getElementById("result").innerText = "";
  guessMade = false; // Reset the flag when a new team is shown
  document.getElementById("yes-button").classList.remove("disabled-button");
  document.getElementById("no-button").classList.remove("disabled-button");
}

function guess(remembered) {
  if (!gameStarted || guessMade) return; // Prevent new guess if a guess has already been made

  guessMade = true; // Set the flag to indicate a guess has been made
  const resultDiv = document.getElementById("result");
  if (remembered) {
    score.correct++;
    resultDiv.innerText = `${currentTeam.Teamname}`;
    resultDiv.style.color = "green";
    document.getElementById("no-button").classList.add("disabled-button");
  } else {
    score.incorrect++;
    resultDiv.innerText = `${currentTeam.Teamname}`;
    resultDiv.style.color = "red";
    document.getElementById("yes-button").classList.add("disabled-button");
  }
  chart.data.datasets[0].data = [score.correct, score.incorrect];
  chart.update();
  updateScoreLabelInDoughnutChart();

  setTimeout(nextTeam, 2000);
}

// event listener for enter key press
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (!gameStarted) {
      startGame();
    }
  }
});

// event listeners for key press
document.addEventListener("keydown", function (event) {
  if (!gameStarted) {
    if (event.key === "Enter") {
      startGame();
    }
  } else {
    if (event.key === "ArrowRight") {
      guess(true);
    } else if (event.key === "ArrowLeft") {
      guess(false);
    }
  }
});

// Attach functions to the window object
window.startGame = startGame;
window.nextTeam = nextTeam;
window.guess = guess;

(async function() {
    chart = new Chart(
      document.getElementById('acquisitions'),
      {
        type: 'doughnut',
        data: {
          datasets: [
            {
              label: 'Amount',
              data: [0, 0],
              backgroundColor: ['green', 'red']
            }
          ]
        },
        options: {
          plugins: {
            centerText: true
          }
        }
      }
    );
    updateScoreLabelInDoughnutChart();
})();

function updateScoreLabelInDoughnutChart() {
  // add text to center of doughnut chart
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function(chart) {
      if (chart.config.type === 'doughnut') {
        var width = chart.width,
            height = chart.height,
            ctx = chart.ctx;

        ctx.restore();
        var fontSize = (height / 114).toFixed(2);
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";

        var total = score.correct + score.incorrect;
        if (total > 0) {
          var percentage = Math.round(score.correct / total * 100) + '%';
          var text = `${percentage}`,
              textX = Math.round((width - ctx.measureText(text).width) / 2),
              textY = (height / 2) + 5;

          ctx.fillText(text, textX, textY);
        }
        ctx.save();
      }
    }
  };

  Chart.register(centerTextPlugin);
}