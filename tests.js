// Mock DOM elements and functions that script.js interacts with
// These are needed because script.js will try to access them.
// We are testing logic, not DOM interaction here.

// Mock UI elements
document.getElementById = (id) => {
    if (!window.mockElements) {
        window.mockElements = {};
    }
    if (!window.mockElements[id]) {
        const mockElement = {
            textContent: '',
            style: {},
            addEventListener: () => {}, // Mock addEventListener
            // Mock audio methods if the ID corresponds to an audio element
            play: ()_ => {
                // console.log(`Mock play called for ${id}`);
                if (mockElement.onplay) mockElement.onplay();
                return Promise.resolve();
            },
            pause: () => { /* console.log(`Mock pause called for ${id}`); */ },
            load: () => { /* console.log(`Mock load called for ${id}`); */ },
            currentTime: 0,
            // Add any other properties or methods script.js might use
        };
        window.mockElements[id] = mockElement;
    }
    return window.mockElements[id];
};

// Mock global functions from script.js that update UI or play sounds
// if they are not already part of the mocked elements.
// updateDisplay and updateButtonStates are internal to script.js,
// but they modify the mock elements, which is fine.

// Test Results Reporting
const resultsDiv = document.getElementById('test-results'); // This will use our mock getElementById

function clearResults() {
    // If tests.html is loaded in a real browser, this would get the actual div
    const actualResultsDiv = window.document.getElementById('test-results');
    if (actualResultsDiv) {
        actualResultsDiv.innerHTML = ''; // Clear previous results
    }
}

function reportTest(description, success, details = '') {
    const actualResultsDiv = window.document.getElementById('test-results');
    const resultP = window.document.createElement('p');
    resultP.textContent = `${description}: ${success ? 'PASSED' : 'FAILED'}`;
    resultP.className = success ? 'success' : 'failure';
    if (!success && details) {
        const detailSpan = window.document.createElement('span');
        detailSpan.textContent = ` (${details})`;
        resultP.appendChild(detailSpan);
    }
    if (actualResultsDiv) {
        actualResultsDiv.appendChild(resultP);
    } else { // Fallback for environments where actual DOM might not be fully available
        console.log(`${description}: ${success ? 'PASSED' : 'FAILED'} ${details}`);
    }
}

// Helper function to reset timer state for tests
function resetTimerStateForTest() {
    // These directly manipulate variables in script.js
    // This assumes script.js has been loaded and these variables are global or accessible
    if (typeof pauseTimer === 'function') pauseTimer(); // Clear any existing intervals and set isRunning false
    isWorkSession = true;
    timeLeft = workDuration;
    isRunning = false; // Ensure it's reset
    if (timerInterval) { // Ensure no rogue intervals
        clearInterval(timerInterval);
        timerInterval = null;
    }
    // Reset mock audio elements' play status if needed
    if (window.mockElements && window.mockElements['work-end-sound']) {
        window.mockElements['work-end-sound'].played = false;
         window.mockElements['work-end-sound'].onplay = () => { window.mockElements['work-end-sound'].played = true; };
    }
    if (window.mockElements && window.mockElements['break-end-sound']) {
        window.mockElements['break-end-sound'].played = false;
        window.mockElements['break-end-sound'].onplay = () => { window.mockElements['break-end-sound'].played = true; };
    }
}


// --- Test Cases ---
function runAllTests() {
    clearResults(); // Clear results from previous runs if any

    // Test Suite: Timer Controls
    resetTimerStateForTest();
    reportTest("Initial state: isRunning should be false", isRunning === false);
    reportTest("Initial state: timeLeft should be workDuration", timeLeft === workDuration);
    reportTest("Initial state: isWorkSession should be true", isWorkSession === true);

    // Test startTimer()
    resetTimerStateForTest();
    startTimer();
    reportTest("startTimer(): isRunning becomes true", isRunning === true);
    reportTest("startTimer(): timerInterval is set", timerInterval !== null);
    pauseTimer(); // Clean up

    // Test pauseTimer()
    resetTimerStateForTest();
    startTimer(); // First start, then pause
    pauseTimer();
    reportTest("pauseTimer(): isRunning becomes false", isRunning === false);
    reportTest("pauseTimer(): timerInterval is cleared (cannot directly check, but isRunning is key)", isRunning === false); // Indirect check

    // Test resetTimer()
    resetTimerStateForTest();
    startTimer(); // Change some state
    timeLeft = 100;
    isWorkSession = false;
    resetTimer();
    reportTest("resetTimer(): timeLeft is reset to workDuration", timeLeft === workDuration);
    reportTest("resetTimer(): isWorkSession is true", isWorkSession === true);
    reportTest("resetTimer(): isRunning is false", isRunning === false);

    // Test Suite: Session Switching
    // Test switchSession() from work to break
    resetTimerStateForTest(); // Should be work session, timeLeft = workDuration
    isWorkSession = true; // Explicitly set
    timeLeft = workDuration;
    if (window.mockElements && window.mockElements['work-end-sound']) window.mockElements['work-end-sound'].played = false; // Reset mock played status
    
    switchSession(); // Switch from work to break
    reportTest("switchSession() (work to break): isWorkSession becomes false", isWorkSession === false);
    reportTest("switchSession() (work to break): timeLeft becomes breakDuration", timeLeft === breakDuration);
    // Conceptual sound test: Check if play was called on work-end-sound
    // This depends on the mock setup. For this example, we add a 'played' flag in the mock.
    if (window.mockElements && window.mockElements['work-end-sound']) {
        reportTest("switchSession() (work to break): work-end-sound should be played", window.mockElements['work-end-sound'].played === true, "Mock sound 'played' flag check");
    }


    // Test switchSession() from break to work
    resetTimerStateForTest();
    isWorkSession = false; // Set to break session
    timeLeft = breakDuration; // Set time to break duration
    if (window.mockElements && window.mockElements['break-end-sound']) window.mockElements['break-end-sound'].played = false; // Reset mock played status

    switchSession(); // Switch from break to work
    reportTest("switchSession() (break to work): isWorkSession becomes true", isWorkSession === true);
    reportTest("switchSession() (break to work): timeLeft becomes workDuration", timeLeft === workDuration);
    if (window.mockElements && window.mockElements['break-end-sound']) {
         reportTest("switchSession() (break to work): break-end-sound should be played", window.mockElements['break-end-sound'].played === true, "Mock sound 'played' flag check");
    }


    // Test Suite: Countdown Logic
    // Test countdown() tick
    resetTimerStateForTest();
    timeLeft = 1500;
    const timeBeforeCountdown = timeLeft;
    countdown();
    reportTest("countdown(): timeLeft decreases by 1", timeLeft === (timeBeforeCountdown - 1));

    // Test countdown() session end (work to break)
    resetTimerStateForTest(); // Resets to work session, timeLeft = workDuration
    isWorkSession = true;
    timeLeft = 1; // Set time to 1 second before session end
    if (window.mockElements && window.mockElements['work-end-sound']) window.mockElements['work-end-sound'].played = false;

    countdown(); // This should trigger switchSession
    reportTest("countdown() (session end work->break): isWorkSession becomes false", isWorkSession === false);
    reportTest("countdown() (session end work->break): timeLeft is breakDuration", timeLeft === breakDuration);
    reportTest("countdown() (session end work->break): isRunning becomes false (timer pauses)", isRunning === false);
    if (window.mockElements && window.mockElements['work-end-sound']) {
       reportTest("countdown() (session end work->break): work-end-sound should be played", window.mockElements['work-end-sound'].played === true);
    }


    // Test countdown() session end (break to work)
    resetTimerStateForTest();
    isWorkSession = false; // Set to break session
    timeLeft = 1; // Set time to 1 second before session end
    if (window.mockElements && window.mockElements['break-end-sound']) window.mockElements['break-end-sound'].played = false;

    countdown(); // This should trigger switchSession
    reportTest("countdown() (session end break->work): isWorkSession becomes true", isWorkSession === true);
    reportTest("countdown() (session end break->work): timeLeft is workDuration", timeLeft === workDuration);
    reportTest("countdown() (session end break->work): isRunning becomes false (timer pauses)", isRunning === false);
    if (window.mockElements && window.mockElements['break-end-sound']) {
        reportTest("countdown() (session end break->work): break-end-sound should be played", window.mockElements['break-end-sound'].played === true);
    }

    // Final message
    const finalMsg = window.document.createElement('p');
    finalMsg.textContent = "All tests completed. Check results above.";
    const actualResultsDiv = window.document.getElementById('test-results');
    if (actualResultsDiv) actualResultsDiv.appendChild(finalMsg);

}

// Run tests when the script is loaded if script.js is available
if (typeof startTimer === 'function') { // Check if script.js functions are available
    // The `initializeTimer` in script.js runs on DOMContentLoaded.
    // We need to ensure our mocks are set up before it, or parts of it, run.
    // For testing, we are calling functions directly, so direct DOMContentLoaded conflicts are less likely
    // to interfere with *these specific tests* once mocks are in place.
    // Running tests after a slight delay or on window.onload can sometimes help if there are race conditions with script.js's own init.
    // However, our mocks should make `script.js` "safe" to load.
    runAllTests();
} else {
    reportTest("Framework Error", false, "script.js not loaded or functions not found.");
}
