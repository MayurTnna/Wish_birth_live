/**
 * VISH — THE WISH GOD FULFILLED
 * Central Configuration & Global State Manager
 */

const storyConfig = {
    herName: "Vishwa Jambudiya",
    nicknames: ["Vish", "Vishu", "Dr. Vishwa"],
    birthday: {
        day: 18,
        month: 7,
        year: null // Add birth year if known
    },
    school: "Smt. Jayshreeben Virambhai Godhaniya English Medium School",
    tuitionTeacher: "Rupa Madam",
    tuitionBatch: "STAR Batch",
    hostel: "Shree Jalaram Lohana Vidyarthi Bhavan",
    hostelCity: "Vallabh Vidyanagar, Anand",
    studyCity: "Jamnagar",
    profession: "Dentist",
    achievement: {
        exam: "NEET MDS",
        year: 2026,
        allIndiaRank: 497
    },
    song: {
        title: "Perfect",
        artist: "Ed Sheeran",
        src: "./assets/audio/perfect.mp3"
    },
    birthdayTarget: "2026-07-12T14:10:00" // Test target date (July 12, 2026, at 13:50:00)
};

// Global App State
const appState = {
    audioEnabled: false,
    audioInitialized: false,
    birthdayUnlocked: false,
    currentChapter: 0,
    isMobile: false,
    isMuted: false,
    scrollEnabled: false,
    userInteracted: false
};

// Helper: Detect Mobile
function checkMobile() {
    appState.isMobile = window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (appState.isMobile) {
        document.body.classList.add('is-mobile');
    } else {
        document.body.classList.remove('is-mobile');
    }
}

// Window Events
window.addEventListener('resize', checkMobile);
window.addEventListener('DOMContentLoaded', () => {
    checkMobile();

    // Accessibility: Reduced Motion query
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
        document.body.classList.add('reduced-motion');
    }
});

// Helper: Custom Event Dispatcher
const AppEvents = {
    emit(event, data) {
        const customEvent = new CustomEvent(event, { detail: data });
        window.dispatchEvent(customEvent);
    },
    on(event, callback) {
        window.addEventListener(event, (e) => callback(e.detail));
    }
};
