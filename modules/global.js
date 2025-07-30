// Change this when changing environment
let production = true;

// Navigation URLs
let URLs = null;
if (production) {
    URLs = {
        login: "/WhatsDownFront",
        register: "/WhatsDownFront/register/register.html",
        home: "/WhatsDownFront/home/home.html"
    }
} else {
    URLs = {
        login: "/",
        register: "/register/register.html",
        home: "/home/home.html"
    }
}

// API URL
let API_BASE_URL = ''
if (production) {
    API_BASE_URL = 'https://whatsdownapi-production.up.railway.app';
} else {
    API_BASE_URL = 'http://127.0.0.1:5000';
}

const socket = io(API_BASE_URL);

export {
    URLs,
    API_BASE_URL,
    socket
}