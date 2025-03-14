// Study buddy data
let studyData = {
    streak: 0,
    totalHours: 0,
    lastStudyDate: null,
    plans: [],
    sessions: []
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
    document.getElementById('streak').textContent = `${studyData.streak} day${studyData.streak !== 1 ? 's' : ''}`;
    document.getElementById('total-hours').textContent = `${studyData.totalHours} hr${studyData.totalHours !== 1 ? 's' : ''}`;

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
    updateAnalytics();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Data management
    document.getElementById('export-btn').addEventListener('click', exportData);
    document.getElementById('import-btn').addEventListener('click', function() {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importData);
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

                // Show completion notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Study session completed!', {
                        body: 'Great job! Time for a break.',
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎉</text></svg>'
                    });
                } else {
                    alert('Study session completed! Great job!');
                }

                // Add time to total hours and record session
                const sessionMinutes = parseInt(document.getElementById('timer-minutes').value);
                const sessionHours = sessionMinutes / 60;
                studyData.totalHours = Math.round((studyData.totalHours + sessionHours) * 100) / 100;

                // Record study session
                studyData.sessions.push({
                    date: new Date().toDateString(),
                    duration: sessionMinutes,
                    timestamp: Date.now()
                });

                updateStreak();
                saveData();
                updateDisplay();
                updateAnalytics();
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
        updateAnalytics();
    }
}

// Update analytics and insights
function updateAnalytics() {
    updateInsights();
    drawChart();
}

function updateInsights() {
    const completedCount = studyData.plans.filter(plan => plan.completed).length;
    const totalPlans = studyData.plans.length;
    const completionRate = totalPlans > 0 ? Math.round((completedCount / totalPlans) * 100) : 0;

    document.getElementById('completion-rate').textContent = `${completionRate}%`;

    if (studyData.sessions.length > 0) {
        const avgSession = Math.round(studyData.sessions.reduce((sum, session) => sum + session.duration, 0) / studyData.sessions.length);
        document.getElementById('avg-session').textContent = `${avgSession} minutes`;

        // Find most productive day
        const dayCount = {};
        studyData.sessions.forEach(session => {
            const day = new Date(session.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
            dayCount[day] = (dayCount[day] || 0) + session.duration;
        });

        const mostProductiveDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 'Not enough data');
        document.getElementById('productive-day').textContent = mostProductiveDay;
    }
}

function drawChart() {
    const canvas = document.getElementById('timeChart');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (studyData.sessions.length === 0) {
        ctx.fillStyle = '#a0aec0';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display yet', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Get last 7 days of data
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toDateString());
    }

    // Calculate total minutes per day
    const dailyMinutes = last7Days.map(day => {
        return studyData.sessions
            .filter(session => session.date === day)
            .reduce((sum, session) => sum + session.duration, 0);
    });

    // Draw chart
    const maxMinutes = Math.max(...dailyMinutes, 60);
    const barWidth = canvas.width / 7;
    const maxBarHeight = canvas.height - 60;

    dailyMinutes.forEach((minutes, index) => {
        const barHeight = (minutes / maxMinutes) * maxBarHeight;
        const x = index * barWidth + 10;
        const y = canvas.height - barHeight - 30;

        // Draw bar
        ctx.fillStyle = '#667eea';
        ctx.fillRect(x, y, barWidth - 20, barHeight);

        // Draw day label
        ctx.fillStyle = '#4a5568';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const dayName = new Date(last7Days[index]).toLocaleDateString('en-US', { weekday: 'short' });
        ctx.fillText(dayName, x + (barWidth - 20) / 2, canvas.height - 5);

        // Draw minutes label
        if (minutes > 0) {
            ctx.fillStyle = '#2d3748';
            ctx.font = '10px Arial';
            ctx.fillText(`${minutes}m`, x + (barWidth - 20) / 2, y - 5);
        }
    });
}

// Export data to JSON file
function exportData() {
    const dataStr = JSON.stringify(studyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-study-buddy-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

// Import data from JSON file
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validate data structure
            if (typeof importedData === 'object' &&
                importedData.hasOwnProperty('plans') &&
                importedData.hasOwnProperty('sessions')) {

                studyData = {
                    streak: importedData.streak || 0,
                    totalHours: importedData.totalHours || 0,
                    lastStudyDate: importedData.lastStudyDate || null,
                    plans: importedData.plans || [],
                    sessions: importedData.sessions || []
                };

                saveData();
                updateDisplay();
                renderPlans();
                updateAnalytics();

                alert('Data imported successfully!');
            } else {
                alert('Invalid data format. Please select a valid backup file.');
            }
        } catch (error) {
            alert('Error reading file. Please select a valid JSON file.');
        }
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
}