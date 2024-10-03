const readline = require('readline');
let currentInterval;
let workDuration = 25 * 60;
let shortBreakDuration = 15 * 60;
// let clearIntervalCounter=0;
function countdown(duration, type, next) {
    let remainingTime = duration;
   currentInterval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        // if(clearIntervalCounter % 5 ===0){
        //     console.clear();
        // }
        // clearIntervalCounter
    
        console.log(`${type}Time left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        remainingTime--;
        if (remainingTime < 0) {
            clearInterval(interval);
            console.log(`${type} finished!`);
            if (next) next();
        }
    }, 1000);
}
function startPomodoroCycle() {
    let cycleCount = 0;
    function work() {
        console.log("Work interval started!");
        countdown(1 * 60, "Work", () => {
            cycleCount++;
            if (cycleCount % 4 === 0) {
                longBreak();
            }
            else {
                shortBreak();
            }
        })
    }
    function shortBreak() {
        console.log("Short break started!");
        countdown(5 * 60, "Short Break", work);
    }
    function longBreak() {
        console.log("Long break started!");
        countdown(15 * 60, "Long Break", work);
    }
    work();
}
function stopTimer() {
    if(currentInterval){
    clearInterval(currentInterval);
    console.log("Timer Stopped");
    }
    else{
        console.log('No active timer to stop')
    }
}

function setCustomTimers() {
    inputHandler.question('Set work duration (in minutes):', (work) => {
        workDuration = parseInt(work) * 60;
        inputHandler.question('Set short break duration (in minutes):', (shortBreak) => {
            shortBreakDuration = parseInt(shortBreak) * 60;
            inputHandler.question('Set long break duration (in minutes):', (longBreak) => {
                longBreakDuration = parseInt(longBreak) * 60;
                console.log('Custom durations has been set5 successfully!');
                console.log(`Work Duration:${work} minutes, Short Break: ${shortBreak} minutes ,Long Break: ${longBreak} minutes`);
            })
        })
    })
}
const inputHandler = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
inputHandler.on('line', (input) => {
    switch (input) {
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
            console.log("Unknown Choose from:start,stop,quit")
    }
})
console.log("Well hello You wanna concentrate type 'start' or 'quit' ")