const readline = require('readline');
let currentInterval;
let workDuration = 25 * 60;
let shortBreakDuration = 15 * 60;
let longBreakDuration = 30 * 60;
let cycleCount = 0;
let inputHandler;

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
        countdown(shortBreakDuration, "Short Break", work);
    }

    function longBreak() {
        console.log("\nLong break started!");
        countdown(longBreakDuration, "Long Break", work);
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
            case 'stop':
                stopTimer();
                break;
            case 'set':
                setCustomTimers();
                break;
            case 'quit':
                inputHandler.close();
                process.exit();
            default:
                console.log("\nUnknown command. Choose from: start, stop, set, quit");
        }
    });
}

console.log("Welcome! Type 'start', 'stop', 'set', or 'quit' to control the timer.");
handleCommands();
