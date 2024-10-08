const readline = require("readline");
const fs = require("fs");
const notifier = require("node-notifier"); // Import Node Notifier
let currentInterval;
let defaultWorkDuration = 1 * 60; // Default durations in seconds
let defaultShortBreakDuration = 1 * 60;
let defaultLongBreakDuration = 1 * 60;
let workDuration = 1 * 60;
let shortBreakDuration = 1 * 60;
let longBreakDuration = 1 * 60;
let cycleCount = 0;
let inputHandler;
let totalWorkTime = 0;
let totalBreakTime = 0;
let remainingTime;
let paused = false;
let currentPhase;
const historyFilePath = "pomodoro_history.txt";
/**
 * Starts the countdown timer for a given duration and type (Work, Short Break, Long Break).
 * Notifies the user when the timer is complete and moves to the next phase if applicable.
 *
 * @param {number} duration - The duration of the timer in seconds.
 * @param {string} type - The type of the timer (e.g., "Work", "Short Break", "Long Break").
 * @param {Function} [next] - The function to call when the timer is finished (optional).
 */
function countdown(duration, type, next) {
  remainingTime = duration;
  currentInterval = setInterval(() => {
    if (paused) return;
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    process.stdout.write(
      `\r${type} Time left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    );
    remainingTime--;
    if (remainingTime < 0) {
      clearInterval(currentInterval);
      console.log(`\n${type} finished!`);
      notifier.notify({
        title: `${type} Finished`,
        message: `Your ${type.toLowerCase()} is complete!`,
        sound: true,
      });
      if (next) next();
    }
  }, 1000);
}
/**
 * Initiates the work phase of the Pomodoro cycle.
 * When the work phase is complete, either starts a short or long break based on the cycle count.
 */
function work() {
  console.log("\nWork interval started!");
  currentPhase = "Work";
  notifier.notify({
    title: "Work Interval Started",
    message: "Get ready to focus!",
    sound: true,
  });
  countdown(workDuration, "Work", () => {
    cycleCount++;
    totalWorkTime += workDuration / 60;
    saveSession("Work", workDuration);
    if (cycleCount % 4 === 0) {
      longBreak();
    } else {
      shortBreak();
    }
  });
}
/**
 * Starts a short break and notifies the user. After the break, it transitions back to work.
 */
function shortBreak() {
  console.log("\nShort break started!");
  currentPhase = "Short Break";
  notifier.notify({
    title: "Short Break Started",
    message: "Take a short break!",
    sound: true,
  });
  countdown(shortBreakDuration, "Short Break", () => {
    totalBreakTime += shortBreakDuration / 60;
    saveSession("Short Break", shortBreakDuration);
    work();
  });
}
/**
 * Starts a long break and notifies the user. After the break, it transitions back to work.
 */
function longBreak() {
  console.log("\nLong break started!");
  currentPhase = "Long Break";
  notifier.notify({
    title: "Long Break Started",
    message: "Enjoy your long break!",
    sound: true,
  });
  countdown(longBreakDuration, "Long Break", () => {
    totalBreakTime += longBreakDuration / 60;
    saveSession("Long Break", longBreakDuration);
    work();
  });
}
/**
 * Starts the Pomodoro cycle by initiating the first work session.
 */
function startPomodoroCycle() {
  work(); // Initiates the first work cycle
}
/**
 * Pauses the current timer, if one is running, and notifies the user.
 */
function pauseTimer() {
  if (currentInterval) {
    clearInterval(currentInterval);
    paused = true;
    notifier.notify({
      title: "Pomodoro Timer",
      message: "The timer has been paused.",
      sound: true, // Add a sound notification
    });
    console.log(
      `\nTimer Paused with ${Math.floor(remainingTime / 60)}:${
        remainingTime % 60
      } remaining`
    );
  } else {
    console.log("\nNo active timer to pause");
  }
}
/**
 * Resumes the paused timer and notifies the user. Continues the current phase (work, short break, or long break).
 */
function resumeTimer() {
  if (paused) {
    console.log("\nResuming Timer...");
    paused = false;
    notifier.notify({
      title: "Pomodoro Timer",
      message: "The timer has been resumed.",
      sound: true, // Add a sound notification
    });
    countdown(remainingTime, currentPhase, () => {
      if (currentPhase === "Work") {
        cycleCount++;
        totalWorkTime += workDuration / 60;
        saveSession("Work", workDuration);
        if (cycleCount % 4 === 0) {
          longBreak();
        } else {
          shortBreak();
        }
      } else if (currentPhase === "Short Break") {
        totalBreakTime += shortBreakDuration / 60;
        saveSession("Short Break", shortBreakDuration);
        work();
      } else if (currentPhase === "Long Break") {
        totalBreakTime += longBreakDuration / 60;
        saveSession("Long Break", longBreakDuration);
        work();
      }
    });
  } else {
    console.log("\nNo paused timer to resume.");
  }
}
/**
 * Resets the Pomodoro cycle, restoring default durations and clearing all statistics.
 * Stops the current timer, if any, and notifies the user.
 */
function resetTimer() {
  if (currentInterval) {
    clearInterval(currentInterval);
    console.log("\nTimer Reset.");
  }
  workDuration = defaultWorkDuration;
  shortBreakDuration = defaultShortBreakDuration;
  longBreakDuration = defaultLongBreakDuration;

  paused = false;
  remainingTime = null;
  cycleCount = 0;
  totalWorkTime = 0;
  totalBreakTime = 0;

  console.log("Pomodoro cycle and statistics reset to default.");
  console.log(
    `Work Duration: ${workDuration / 60} minutes, Short Break: ${
      shortBreakDuration / 60
    } minutes, Long Break: ${longBreakDuration / 60} minutes`
  );
}
/**
 * Stops the current timer, if one is running, and notifies the user.
 */
function stopTimer() {
  if (currentInterval) {
    clearInterval(currentInterval);
    console.log("\nTimer Stopped");
    notifier.notify({
      title: "Pomodoro Timer",
      message: "The timer has been stopped.",
      sound: true, 
    });
  } else {
    console.log("\nNo active timer to stop");
  }
}
/**
 * Allows the user to set custom durations for work, short break, and long break intervals.
 * Prompts the user for each duration.
 */
function setCustomTimers() {
  inputHandler.question("Set work duration (in minutes):", (work) => {
    workDuration = parseInt(work) * 60;
    inputHandler.question(
      "Set short break duration (in minutes):",
      (shortBreak) => {
        shortBreakDuration = parseInt(shortBreak) * 60;
        inputHandler.question(
          "Set long break duration (in minutes):",
          (longBreak) => {
            longBreakDuration = parseInt(longBreak) * 60;
            console.log("Custom durations set successfully!");
            console.log(
              `Work Duration: ${work} minutes, Short Break: ${shortBreak} minutes, Long Break: ${longBreak} minutes`
            );
          }
        );
      }
    );
  });
}
/**
 * Saves session data to the history file, including the type of session and its duration.
 *
 * @param {string} type - The type of session (e.g., "Work", "Short Break", "Long Break").
 * @param {number} duration - The duration of the session in seconds.
 */
function saveSession(type, duration) {
  const date = new Date();
  const sessionData = `${date.toLocaleString()} - ${type} for ${Math.floor(
    duration / 60
  )} minutes\n`;
  fs.appendFile(historyFilePath, sessionData, (err) => {
    if (err) throw err;
  });
}
/**
 * Reads and displays the session history from the history file.
 */
function viewHistory() {
  fs.readFile(historyFilePath, "utf8", (err, data) => {
    if (err) {
      console.log("No session history found.");
    } else {
      console.log("\nSession History:\n");
      console.log(data);
    }
  });
}
/**
 * Displays the statistics of the Pomodoro sessions, including total work time, break time, and sessions completed.
 */

function displayStatistics() {
  console.log(`\nStatistics:`);
  console.log(`Total Work Time: ${totalWorkTime} minutes`);
  console.log(`Total Break Time: ${totalBreakTime} minutes`);
  console.log(`Total Pomodoro Sessions Completed: ${cycleCount}`);
}

// Command handling
inputHandler = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
//
function handleCommands() {
  inputHandler.on("line", (input) => {
    switch (input.trim()) {
      case "1":
        startPomodoroCycle();
        break;
      case "4":
        stopTimer();
        console.log("----Available options----")
        console.log("1. Start Pomodoro Cycle");
        console.log("2. Pause Timer");
        console.log("3. Resume Timer");
        console.log("4. Stop Timer");
        console.log("5. Reset Timer");
        console.log("6. Set Custom Durations");
        console.log("7. View Session History");
        console.log("8. View Statistics");
        console.log("9. Exit");
        console.log("10. Help")
        console.log("Please select an option")
        break;
      case "6":
        setCustomTimers();
        break;
      case "8":
        displayStatistics();
        console.log("----Available options----")
        console.log("1. Start Pomodoro Cycle");
        console.log("2. Pause Timer");
        console.log("3. Resume Timer");
        console.log("4. Stop Timer");
        console.log("5. Reset Timer");
        console.log("6. Set Custom Durations");
        console.log("7. View Session History");
        console.log("8. View Statistics");
        console.log("9. Exit");
        console.log("10. Help")
        console.log("Please select an option")
        break;
      case "10":
        console.log("----Available options----")
        console.log("1. Start Pomodoro Cycle");
        console.log("2. Pause Timer");
        console.log("3. Resume Timer");
        console.log("4. Stop Timer");
        console.log("5. Reset Timer");
        console.log("6. Set Custom Durations");
        console.log("7. View Session History");
        console.log("8. View Statistics");
        console.log("9. Exit");
        console.log("10. Help")
        console.log("Please select an option")
        break;
      case "2":
        pauseTimer();
        break;
      case "3":
        resumeTimer();
        break;
      case "5":
        resetTimer();
        break;
      case "7":
        viewHistory();
        break;
      case "9":
        inputHandler.close();
        process.exit();
      default:
        console.log(
          "\nUnknown option. press 10 to see all available options."
        );
    }
  });
}

console.log("\n--- Pomodoro Timer ---");
console.log("1. Start Pomodoro Cycle");
console.log("2. Pause Timer");
console.log("3. Resume Timer");
console.log("4. Stop Timer");
console.log("5. Reset Timer");
console.log("6. Set Custom Durations");
console.log("7. View Session History");
console.log("8. View Statistics");
console.log("9. Exit");
console.log("10. Help")
console.log("Please select an option")
handleCommands();
