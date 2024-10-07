const readline = require('readline');
const fs = require('fs');
const notifier = require('node-notifier'); // Import Node Notifier
let currentInterval;
let workDuration = 1 * 60; // Default durations in seconds
let shortBreakDuration = 1 * 60;
let longBreakDuration = 1 * 60;
let cycleCount = 0;
let inputHandler;
let totalWorkTime = 0;
let totalBreakTime = 0;
let remainingTime;
let paused = false;
let currentPhase;
const historyFilePath = 'pomodoro_history.txt';
// Countdown function
function countdown(duration, type, next) {
    remainingTime = duration;
    currentInterval = setInterval(() => {
        if (paused) return;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        process.stdout.write(`\r${type} Time left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        remainingTime--;
        if (remainingTime < 0) {
            clearInterval(currentInterval);
            console.log(`\n${type} finished!`);
            notifier.notify({ // Notification when the timer ends
                title: `${type} Finished`,
                message: `Your ${type.toLowerCase()} is complete!`,
                sound: true // Play sound
            });
            if (next) next();
        }
    }, 1000);
}
// Work, Short Break, and Long Break functions
function work() {
    console.log("\nWork interval started!");
    currentPhase = 'Work';
    notifier.notify({ // Notification when the work starts
        title: 'Work Interval Started',
        message: 'Get ready to focus!',
        sound: true
    });
    countdown(workDuration, "Work", () => {
        cycleCount++;
        totalWorkTime += workDuration / 60;
        saveSession('Work', workDuration);
        if (cycleCount % 4 === 0) {
            longBreak();
        } else {
            shortBreak();
        }
    });
}

function shortBreak() {
    console.log("\nShort break started!");
    currentPhase = 'Short Break';
    notifier.notify({ 
        title: 'Short Break Started',
        message: 'Take a short break!',
        sound: true
    });
    countdown(shortBreakDuration, "Short Break", () => {
        totalBreakTime += shortBreakDuration / 60;
        saveSession('Short Break', shortBreakDuration);
        work();
    });
}

function longBreak() {
    console.log("\nLong break started!");
    currentPhase = 'Long Break';
    notifier.notify({ 
        title: 'Long Break Started',
        message: 'Enjoy your long break!',
        sound: true
    });
    countdown(longBreakDuration, "Long Break", () => {
        totalBreakTime += longBreakDuration / 60;
        saveSession('Long Break', longBreakDuration);
        work();
    });
}

// Start Pomodoro cycle
function startPomodoroCycle() {
    work(); // Initiates the first work cycle
}

// Pause, resume, reset, stop, and set custom timers
function pauseTimer() {
    if (currentInterval) {
        clearInterval(currentInterval);
        paused = true;
        console.log(`\nTimer Paused with ${Math.floor(remainingTime / 60)}:${remainingTime % 60} remaining`);
    } else {
        console.log("\nNo active timer to pause");
    }
}

function resumeTimer() {
    if (paused) {
        console.log("\nResuming Timer...");
        paused = false;
        countdown(remainingTime, currentPhase, () => {
            if (currentPhase === 'Work') {
                cycleCount++;
                totalWorkTime += workDuration / 60;
                saveSession('Work', workDuration);
                if (cycleCount % 4 === 0) {
                    longBreak();
                } else {
                    shortBreak();
                }
            } else if (currentPhase === 'Short Break') {
                totalBreakTime += shortBreakDuration / 60;
                saveSession('Short Break', shortBreakDuration);
                work();
            } else if (currentPhase === 'Long Break') {
                totalBreakTime += longBreakDuration / 60;
                saveSession('Long Break', longBreakDuration);
                work();
            }
        });
    } else {
        console.log("\nNo paused timer to resume.");
    }
}

function resetTimer() {
    if (currentInterval) {
        clearInterval(currentInterval);
        console.log("\nTimer Reset.");
    }
    paused = false;
    remainingTime = null;
    cycleCount = 0;
    totalWorkTime = 0;
    totalBreakTime = 0;
    console.log("Pomodoro cycle and statistics reset.");
}

function stopTimer() {
    if (currentInterval) {
        clearInterval(currentInterval);
        console.log("\nTimer Stopped");
        notifier.notify({
            title: 'Pomodoro Timer',
            message: 'The timer has been stopped.',
            sound: true, // Add a sound notification
        });
    } else {
        console.log('\nNo active timer to stop');
    }
}


function setCustomTimers() {
    inputHandler.question('Set work duration (in minutes):', (work) => {
        workDuration = parseInt(work) * 60;
        inputHandler.question('Set short break duration (in minutes):', (shortBreak) => {
            shortBreakDuration = parseInt(shortBreak) * 60;
            inputHandler.question('Set long break duration (in minutes):', (longBreak) => {
                longBreakDuration = parseInt(longBreak) * 60;
                console.log('Custom durations set successfully!');
                console.log(`Work Duration: ${work} minutes, Short Break: ${shortBreak} minutes, Long Break: ${longBreak} minutes`);
            });
        });
    });
}

// Session history and statistics
function saveSession(type, duration) {
    const date = new Date();
    const sessionData = `${date.toLocaleString()} - ${type} for ${Math.floor(duration / 60)} minutes\n`;
    fs.appendFile(historyFilePath, sessionData, (err) => {
        if (err) throw err;
    });
}

function viewHistory() {
    fs.readFile(historyFilePath, 'utf8', (err, data) => {
        if (err) {
            console.log('No session history found.');
        } else {
            console.log('\nSession History:\n');
            console.log(data);
        }
    });
}

function displayStatistics() {
    console.log(`\nStatistics:`);
    console.log(`Total Work Time: ${totalWorkTime} minutes`);
    console.log(`Total Break Time: ${totalBreakTime} minutes`);
    console.log(`Total Pomodoro Sessions Completed: ${cycleCount}`);
}

// Command handling
inputHandler = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function handleCommands() {
    inputHandler.on('line', (input) => {
        switch (input.trim()) {
            case 'start':
                startPomodoroCycle();
                break;
            case 's':
                stopTimer();
                break;
            case 'set':
                setCustomTimers();
                break;
            case 'st':
                displayStatistics();
                break;
            case 'help':
                console.log(`
                Available commands:
                - start: Start the Pomodoro cycle
                - s: Stop the current timer
                - set: Set custom durations for work, short break, and long break
                - st: Display session statistics
                - h: View session history
                - p: Pause the timer
                - r: Resume the timer
                - re: Reset the Pomodoro cycle and statistics
                - help: View the list of available commands
                - q: Quit the application
                `);
                break;
            case 'p':
                pauseTimer();
                break;
            case 'r':
                resumeTimer();
                break;
            case 're':
                resetTimer();
                break;
            case 'h':
                viewHistory();
                break;
            case 'q':
                inputHandler.close();
                process.exit();
            default:
                console.log("\nUnknown command. Type 'help' to see all available commands.");
        }
    });
}

console.log("Welcome! Type 'start', 'set', 's' to stop, 'help' for available commands, or 'q' to quit.");
handleCommands();
