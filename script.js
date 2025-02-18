// Study buddy data
let studyData = {
    streak: 0,
    totalHours: 0,
    lastStudyDate: null
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

    // Create plan button event
    document.getElementById('create-plan-btn').addEventListener('click', function() {
        alert('Study plan creation coming soon!');
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