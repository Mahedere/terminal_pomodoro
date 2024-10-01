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
            if(next)next();
        }
    }, 1000);
}
countdown(10);