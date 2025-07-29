import { URLs, API_BASE_URL } from "../modules/global.js";

// Elements
const elmntBody = document.querySelector('body');
const sidenavContacts = document.querySelector('.sidenav__contacts');
const mobileMenu = document.querySelector('.mobileMenu');
const mobileMenuContacts = document.querySelector('.mobileMenu__contacts');
const inputMessage = document.querySelector('.main__bottomSection__input');
const btnSendMessage = document.querySelector('.main__bottomSection__button');
const contactName = document.querySelector('.main__topSection__contactName');
const messageContainer = document.querySelector('.main__middleSection');
const exitIcon = document.getElementById('logOutImage');
const mobileExitIcon = document.getElementById('mobileExiticon');
const burgerMenu1 = document.getElementById('burgerMenu1');
const burgerMenu2 = document.getElementById('burgerMenu2');

const middleSection = document.querySelector('.main__middleSection');
const welcomeView = document.querySelector('.main__middleSection__welcome');

// Variables
const socket = io(API_BASE_URL);
const token = localStorage.getItem('token');
let currentContact = undefined;

let sendEnabled = false;

function main() {
    // Disable sending messages
    enableSendMessages(false);

    // See if token is valid; throw user out if not
    // This prevents accessing this page through the URL
    checkToken();
    // Set socket events
    configureSocket();
    // List contacts on menus
    listUsers();
    // Add event listeners
    addEventListeners();
}

// CHECK TOKEN VALIDITY
function checkToken() {
    fetch(API_BASE_URL + '/users/checkToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify({
            token: token
        })
    }).then((response) => {
        return response.json()
    }).then((data) => {
        if (data.message != 'success') {
            // If token is not valid, show message and throw user out
            // TODO: create snackbar here
            // alert(data.message);
            window.location.href = URLs.login; 
        } else {
            // If token is valid, set user data in sessionStorage
            if (data.user_id)
                sessionStorage.setItem('user_id', data.user_id);
            if (data.username)
                sessionStorage.setItem('username', data.username);
        }
    }).catch((error) => {
        // Throw user out if there's an error
        // TODO: create snackbar here
        //alert('There was an error');
        console.log(error);
        window.location.href = URLs.login;
    });
}

// CONFIGURE SOCKETS
function configureSocket() {
    // Receive message from server
    socket.on('receive_message', (data) => {
        addNextMessage(data.sender_id, data.message)
    });

    // Log message sent from server
    socket.on('log', (data) => {
        console.log(data.message);
    });

    // This might be useful to check that the sockets are working
    // socket.on('connect', () => {});
}

// FUNCTIONS TO LIST USERS ON MENU
function listUsers() {
    getUsers().then((users) => {
        if (users) users.forEach(addUserToMenu);
    });
}

function getUsers() {
    return fetch(API_BASE_URL + '/users/all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, body: JSON.stringify({
            'token': token
        })
    }).then((response) => {
        return response.json();
    }).then((data) => {
        return data.users;
    }).catch((error) => {
        console.log(error);
    })
}

function addUserToMenu(user) {
    // We don't add our own user to the contact list
    if (user.id == sessionStorage.getItem('user_id')) return;

    // MOBILE MENU
    const elmntMobile = document.createElement('div');
    elmntMobile.classList.add('mobileMenu__contacts__item');
    elmntMobile.dataset.user_id = user.id;
    elmntMobile.innerText = user.username;

    mobileMenuContacts.appendChild(elmntMobile);

    elmntMobile.addEventListener('click', () => {
        joinRoomWithUser(elmntMobile, user);
        mobileMenu.style.display = "none";
    })

    // DESKTOP MENU
    // Create element with the user's info (id + username)
    const elmnt = document.createElement('div');
    elmnt.classList.add('sidenav__contacts__item');
    elmnt.dataset.user_id = user.id;
    elmnt.innerText = user.username;
    
    // Add element to DOM
    sidenavContacts.appendChild(elmnt);

    // Add functionality to it
    elmnt.addEventListener('click', () => joinRoomWithUser(elmnt, user));
}

function joinRoomWithUser(elmnt, user) {
    eraseWelcomeView();
    if (currentContact && user.id == currentContact.id) return;

    socket.emit('join_room', {
        user1_id: sessionStorage.getItem('user_id'),
        user2_id: user.id
    });
    contactName.innerText = user.username;
    setRoomMessagesInDOM(user);
    enableSendMessages(true);
    inputMessage.value = "";

    currentContact = user;
}

function setRoomMessagesInDOM(user) {
    // Clear previous messages from view
    messageContainer.innerHTML = '';

    // Get room messages
    fetch(API_BASE_URL + '/messages/getRoomMessages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            token: token,
            contact_id: user.id
        })
    }).then((response) => {
        return response.json()
    }).then((data) => {
        if (!data.messages) return;
        // Add them to DOM
        for (const message of data.messages) {
            addNextMessage(message.sender_id, message.content);
        }
    }).catch((error) => {
        console.log(error);
    })
}

// OTHER FUNCTIONS
function addNextMessage(senderId, message) {
    // Create message element
    const elmntContainer = document.createElement('div');
    elmntContainer.classList.add('main__middleSection__item');
    if (senderId == sessionStorage.getItem('user_id')) {
        elmntContainer.classList.add('message--user');
    }

    const elmntMessage = document.createElement('div');
    elmntMessage.innerText = message;
    elmntMessage.classList.add('main__middleSection__item__content');

    elmntContainer.appendChild(elmntMessage);

    // Add it to the container
    messageContainer.insertBefore(elmntContainer, messageContainer.childNodes[0])
}

// ADD EVENT LISTENERS
function addEventListeners() {
    inputMessage.addEventListener('keydown', (event) => {
        if (event.key == 'Enter') {
            sendMessage(event);
        }
    });
}

main();

/* UI EVENTS */
function reset() {
    if (window.innerWidth >= 700) toggleBurgerMenu();
}
elmntBody.addEventListener('resize', reset);

function logOut() {
    localStorage.removeItem('token');
    window.location.href = URLs.login;
}
exitIcon.addEventListener('click', logOut);
mobileExitIcon.addEventListener('click', logOut);

function toggleBurgerMenu(event) {
    if (!event) {
        mobileMenu.style.display = 'none';
    } else {
        const elmnt = event.target;

        mobileMenu.style.display = 
            elmnt.classList.contains('mobileBurger') ?
            'block' :
            'none';
    }
}
burgerMenu1.addEventListener('click', (event) => toggleBurgerMenu(event));
burgerMenu2.addEventListener('click', (event) => toggleBurgerMenu(event));

function sendMessage(event) {
    if (!sendEnabled) return;

    const value = inputMessage.value;
    if (value.length == 0) return;
    
    socket.emit('message_room', {sender_id: sessionStorage.getItem('user_id'), message: value});

    inputMessage.value = '';
}
btnSendMessage.addEventListener('click', sendMessage);

// OTHERS

function eraseWelcomeView() {
    welcomeView.style.display = "none";
    middleSection.classList.remove('main__middleSection--welcome');
}

function enableSendMessages(enable) {
    if (enable) {
        sendEnabled = true;
        inputMessage.disabled = false;

        // Add styles
        btnSendMessage.classList.remove('button--disabled');
        inputMessage.classList.remove('button--disabled');

    } else {
        sendEnabled = false;
        inputMessage.disabled = true;

        // Add styles
        btnSendMessage.classList.add('button--disabled');
        inputMessage.classList.add('button--disabled');
    }
}