function countdown(duration) {
    let remainingTime = duration;
    const interval = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        console.log(`Time left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        remainingTime--;
        if (remainingTime < 0) {
            clearInterval(interval);
            console.log("Timer finished!");
        }
    }, 1000);
}
countdown(150);