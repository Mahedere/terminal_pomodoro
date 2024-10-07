# Terminal Pomodoro Timer

A simple terminal-based Pomodoro timer application built with Node.js. This application helps you manage your work and break intervals using the Pomodoro technique.

## Features

- Work, short break, and long break intervals
- Notifications for intervals
- Session history tracking
- Statistics on total work and break time

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)

## Installation

1. **Clone the repository** to your local machine:

   ```bash
   git clone https://github.com/yourusername/terminal_pomodoro.git
Navigate to the project directory:

bash
Copy code
cd terminal_pomodoro
Install the necessary packages:

bash
Copy code
npm install node-notifier
Usage
Start the application:

bash
Copy code
node timer.js
Follow the prompts and use the available commands:

start: Start the Pomodoro cycle
s: Stop the current timer
set: Set custom durations for work, short break, and long break
st: Display session statistics
h: View session history
p: Pause the timer
r: Resume the timer
re: Reset the Pomodoro cycle and statistics
help: View the list of available commands
q: Quit the application
Session History
The session history will be saved in the pomodoro_history.txt file. This file is included in the .gitignore, so it will not be tracked by Git.