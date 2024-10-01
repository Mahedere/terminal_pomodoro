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
        countdown(1* 60, "Work", () => {
            cycleCount++;
            if (cycleCount % 4 === 0) {
                longBreak();
            }
            else {
                shortBreak();
            }
        })
    }
function shortBreak(){
    console.log("Short break started!");
    countdown(5*60,"Short Break",work);
}
function longBreak(){
    console.log("Long break started!");
    countdown(15*60,"Long Break",work);
}
work();
}
startPomodoroCycle(10);
