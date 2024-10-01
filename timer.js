const readline = require('readline');
function countdown(duration, type, next) {
    let remainingTime = duration;
    const interval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        console.clear();
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
    clearInterval(currentInterval);
    console.log("Timer Stopped");
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
        case 'quit':
            inputHandler.close();
            process.exit();
            break;
        default:
            console.log("Unknown Choose from:start,stop,quit")
    }
})
console.log("Well hello You wanna concentrate type 'start' or 'quit' ")