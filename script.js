// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const sessionIndicator = document.getElementById('session-indicator');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');
const workEndSound = document.getElementById('work-end-sound');
const breakEndSound = document.getElementById('break-end-sound');

// Timer state variables
let isRunning = false;
let isWorkSession = true; // true for work, false for break
let timeLeft = 25 * 60; // Initial time in seconds (25 minutes)
let timerInterval = null;

// Default durations
const workDuration = 25 * 60; // 25 minutes in seconds
const breakDuration = 5 * 60; // 5 minutes in seconds

// Function to update the timer display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    sessionIndicator.textContent = isWorkSession ? "Work Session" : "Break Time";
    document.title = `${isWorkSession ? "Work" : "Break"} - ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Update page title
}

// Function to manage button states
function updateButtonStates() {
    startButton.disabled = isRunning;
    pauseButton.disabled = !isRunning;
    // Reset button is always enabled
}

// Function to stop all sounds and reset their time
function stopAndResetSounds() {
    if (workEndSound) {
        workEndSound.pause();
        workEndSound.currentTime = 0;
    }
    if (breakEndSound) {
        breakEndSound.pause();
        breakEndSound.currentTime = 0;
    }
}

// Function to start the timer
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    timerInterval = setInterval(countdown, 1000);
    updateButtonStates();
}

// Function to pause the timer
function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    stopAndResetSounds(); // Stop sounds when pausing
    updateButtonStates();
}

// Function to reset the timer
function resetTimer() {
    pauseTimer(); // Clear interval and set isRunning to false
    isWorkSession = true;
    timeLeft = workDuration;
    stopAndResetSounds();
    updateDisplay();
    updateButtonStates();
}

// Function to switch between work and break sessions
function switchSession() {
    pauseTimer(); // Stop current session's interval

    // Play sound for the session that just ended
    if (isWorkSession) {
        if (workEndSound) workEndSound.play().catch(e => console.error("Error playing work end sound:", e));
    } else {
        if (breakEndSound) breakEndSound.play().catch(e => console.error("Error playing break end sound:", e));
    }

    isWorkSession = !isWorkSession;
    timeLeft = isWorkSession ? workDuration : breakDuration;
    updateDisplay();
    // Automatically start the next session or wait for user? For now, wait.
    // If auto-start: startTimer();
    updateButtonStates(); // Ensure buttons are correct for a paused state
}

// Countdown function - called every second when the timer is running
function countdown() {
    if (timeLeft <= 0) {
        switchSession();
        return;
    }
    timeLeft--;
    updateDisplay();
}

// Event Listeners for buttons
startButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);

// Initial setup when the page loads
function initializeTimer() {
    updateDisplay();
    updateButtonStates();
}

// Call initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeTimer);
