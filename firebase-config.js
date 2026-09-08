// Firebase Configuration for Amrutha Pure Ghee Store
// Follow the instructions in the Walkthrough to set up your free Firebase project.

const FIREBASE_CONFIG = {
    // To set up your actual cloud database, replace these placeholder values with your Firebase keys:
    apiKey: "PLACEHOLDER_API_KEY",
    authDomain: "PLACEHOLDER_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://PLACEHOLDER_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "PLACEHOLDER_PROJECT_ID",
    storageBucket: "PLACEHOLDER_PROJECT_ID.appspot.com",
    messagingSenderId: "PLACEHOLDER_SENDER_ID",
    appId: "PLACEHOLDER_APP_ID"
};

// Admin Config
const ADMIN_CONFIG = {
    // Password to log in to the admin.html panel. Change this to secure your dashboard!
    dashboardPassword: "ghee2104@gmail.com"
};

// Export to window object
if (typeof window !== 'undefined') {
    window.firebaseConfig = FIREBASE_CONFIG;
    window.adminConfig = ADMIN_CONFIG;
}
