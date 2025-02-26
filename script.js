// Study buddy data
let studyData = {
    streak: 0,
    totalHours: 0,
    lastStudyDate: null,
    plans: []
};

// Timer state
let timerState = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    interval: null
};

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('studyBuddyData');
    if (saved) {
        studyData = JSON.parse(saved);
    }
    updateDisplay();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('studyBuddyData', JSON.stringify(studyData));
}

// Update the display elements
function updateDisplay() {
    document.getElementById('streak').textContent = `${studyData.streak} days`;
    document.getElementById('total-hours').textContent = `${studyData.totalHours} hrs`;

    const completedCount = studyData.plans.filter(plan => plan.completed).length;
    document.getElementById('completed-plans').textContent = completedCount;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderPlans();

    // Create plan button event
    document.getElementById('create-plan-btn').addEventListener('click', function() {
        document.getElementById('plan-form').classList.remove('hidden');
    });

    // Cancel button event
    document.getElementById('cancel-btn').addEventListener('click', function() {
        document.getElementById('plan-form').classList.add('hidden');
        document.getElementById('study-form').reset();
    });

    // Form submission
    document.getElementById('study-form').addEventListener('submit', function(e) {
        e.preventDefault();
        createStudyPlan();
    });

    // Timer controls
    document.getElementById('start-timer-btn').addEventListener('click', startTimer);
    document.getElementById('pause-timer-btn').addEventListener('click', pauseTimer);
    document.getElementById('reset-timer-btn').addEventListener('click', resetTimer);

    // Timer settings
    document.getElementById('timer-minutes').addEventListener('change', function() {
        if (!timerState.isRunning) {
            timerState.minutes = parseInt(this.value);
            timerState.seconds = 0;
            updateTimerDisplay();
        }
    });

    updateTimerDisplay();
});

// Update streak based on current date
function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = studyData.lastStudyDate;

    if (lastDate === today) {
        return; // Already studied today
    }

    if (lastDate) {
        const daysDiff = Math.floor((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
            studyData.streak += 1;
        } else if (daysDiff > 1) {
            studyData.streak = 1;
        }
    } else {
        studyData.streak = 1;
    }

    studyData.lastStudyDate = today;
    saveData();
    updateDisplay();
}

// Create a new study plan
function createStudyPlan() {
    const subject = document.getElementById('subject').value;
    const duration = parseFloat(document.getElementById('duration').value);
    const difficulty = document.getElementById('difficulty').value;

    const plan = {
        id: Date.now(),
        subject: subject,
        duration: duration,
        difficulty: difficulty,
        completed: false,
        createdAt: new Date().toLocaleDateString()
    };

    studyData.plans.push(plan);
    saveData();
    renderPlans();

    // Hide form and reset
    document.getElementById('plan-form').classList.add('hidden');
    document.getElementById('study-form').reset();
}

// Render study plans
function renderPlans() {
    const plansList = document.getElementById('plans-list');
    plansList.innerHTML = '';

    if (studyData.plans.length === 0) {
        plansList.innerHTML = '<p>No study plans yet. Create your first plan!</p>';
        return;
    }

    studyData.plans.forEach(plan => {
        const planDiv = document.createElement('div');
        planDiv.className = 'plan-item';
        planDiv.innerHTML = `
            <h4>${plan.subject}</h4>
            <div class="plan-meta">
                <span>${plan.duration}h</span>
                <span>${plan.difficulty}</span>
                <span>Created: ${plan.createdAt}</span>
            </div>
        `;

        // Add complete button
        const completeBtn = document.createElement('button');
        completeBtn.textContent = plan.completed ? 'Completed' : 'Mark Complete';
        completeBtn.className = 'complete-btn';
        completeBtn.disabled = plan.completed;
        completeBtn.onclick = () => completePlan(plan.id);

        planDiv.appendChild(completeBtn);
        plansList.appendChild(planDiv);
    });
}

// Timer functions
function updateTimerDisplay() {
    const minutes = String(timerState.minutes).padStart(2, '0');
    const seconds = String(timerState.seconds).padStart(2, '0');
    document.getElementById('timer-time').textContent = `${minutes}:${seconds}`;
}

function startTimer() {
    if (timerState.isRunning) return;

    timerState.isRunning = true;
    timerState.interval = setInterval(function() {
        if (timerState.seconds === 0) {
            if (timerState.minutes === 0) {
                // Timer finished
                clearInterval(timerState.interval);
                timerState.isRunning = false;
                alert('Study session completed! Great job!');

                // Add time to total hours
                const sessionHours = parseInt(document.getElementById('timer-minutes').value) / 60;
                studyData.totalHours = Math.round((studyData.totalHours + sessionHours) * 100) / 100;
                updateStreak();
                saveData();
                updateDisplay();
                resetTimer();
                return;
            }
            timerState.minutes--;
            timerState.seconds = 59;
        } else {
            timerState.seconds--;
        }
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    if (timerState.interval) {
        clearInterval(timerState.interval);
        timerState.isRunning = false;
    }
}

function resetTimer() {
    if (timerState.interval) {
        clearInterval(timerState.interval);
    }
    timerState.isRunning = false;
    timerState.minutes = parseInt(document.getElementById('timer-minutes').value);
    timerState.seconds = 0;
    updateTimerDisplay();
}

// Complete a study plan
function completePlan(planId) {
    const plan = studyData.plans.find(p => p.id === planId);
    if (plan) {
        plan.completed = true;
        plan.completedAt = new Date().toLocaleDateString();
        saveData();
        renderPlans();
        updateDisplay();
    }
}