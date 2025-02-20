// Study buddy data
let studyData = {
    streak: 0,
    totalHours: 0,
    lastStudyDate: null,
    plans: []
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
        plansList.appendChild(planDiv);
    });
}