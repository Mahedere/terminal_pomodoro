const readline = require('readline');
const fs = require('fs');
let currentInterval;
let workDuration = 1 * 60;
let shortBreakDuration = 1 * 60;
let longBreakDuration = 1 * 60;
let cycleCount = 0;
let inputHandler;
let totalWorkTime = 0;
let totalBreakTime = 0;
const historyFilePath = 'pomodoro_history.txt';
function countdown(duration, type, next) {
    let remainingTime = duration;
    currentInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        process.stdout.write(`\r${type} Time left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        remainingTime--;
        if (remainingTime < 0) {
            clearInterval(currentInterval);
            console.log(`\n${type} finished!`);
            if (next) next();
        }
    }, 1000);
}

function startPomodoroCycle() {
    function work() {
        console.log("\nWork interval started!");
        countdown(workDuration, "Work", () => {
            cycleCount++;
            totalWorkTime += workDuration / 60;
            saveSession('Work', workDuration);
            if (cycleCount % 4 === 0) {
                longBreak();
            }
            else {
                shortBreak();
            }
        });
    }

    function shortBreak() {
        console.log("\nShort break started!");
        countdown(shortBreakDuration, "Short Break", () => {
            totalBreakTime += shortBreakDuration / 60;
            saveSession('Short Break', shortBreakDuration);
            work();
        });
    }

    function longBreak() {
        console.log("\nLong break started!");
        countdown(longBreakDuration, "Long Break", () => {
            totalBreakTime += longBreakDuration / 60;
            saveSession('Long Break', longBreakDuration);
            work();
        });
    }
    work();
}

function stopTimer() {
    if (currentInterval) {
        clearInterval(currentInterval);
        console.log("\nTimer Stopped");
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
function saveSession(type, duration) {
    const date = new Date();
    const sessionData = `${date.toLocaleString()}-${type} for ${Math.floor(duration / 60)}minutes\n`;
    fs.appendFile(historyFilePath, sessionData, (err) => {
        if (err) throw err;
    })
}
function viewHistory() {
    fs.readFile(historyFilePath, 'utf8', (err, data) => {
        if (err) {
            console.log('No session history found.');
        }
        else {
            console.log('\nSession History:\n');
            console.log(data);
        }
    })
}
function displayStatistics() {
    console.log(`\nStatistics:`);
    console.log(`Total Work Time: ${totalWorkTime} minutes`);
    console.log(`Total Break Time: ${totalBreakTime} minutes`);
    console.log(`Total Pomodoro Sessions Completed: ${cycleCount}`);
}
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
                - help: View the list of available commands
                - q: Quit the application
                        `);
                break;
            case 'h':
                viewHistory();
                break;
            case 'q':
                inputHandler.close();
                process.exit();
            default:
                console.log("\nUnknown command.Type 'help' to see all available commands.");
        }
    });
}

console.log("Welcome! Type 'start','set', 's' to stop, 'help' for available commands, or 'q' to quit.");
handleCommands();
