import { URLs, API_BASE_URL, socket } from "../modules/global.js";

// Elements
const inputUsername = document.querySelector('.inputUsername');
const inputPassword = document.querySelector('.inputPassword');
const inputPasswordConfirm = document.querySelector('.inputPasswordConfirm');

const btnSignup = document.querySelector('.buttons__btnSignup');
const btnGoBack = document.querySelector('.buttons__btnGoBack');

// Variables

// Functions 
function main() {
    // Handle user creation logic
    btnSignup.addEventListener('click', handleSignup);
    // Go back to login
    btnGoBack.addEventListener('click', () => window.location.href = URLs.login);
}

function handleSignup() {
    const username = inputUsername.value;
    const password = inputPassword.value;
    const passwordConfirm = inputPasswordConfirm.value;

    if (!validateInput(username, password, passwordConfirm)) {
        return;
    }

    fetch(API_BASE_URL + '/users/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            username: username,
            password: password
        })
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if (!data.message) return;

        if (data.message == 'success') {
            // TODO: create snackbar here
            alert('User created successfully');
            passUserInfoToLogin(username, password);
            socket.emit('user_created_client');
            window.location.href = URLs.login;
        } else if(data.message == 'error') {
            // TODO: create snackbar here
            alert(data.content);
        }
    }).catch((error) => {
        console.log(error);
    })
}

function passUserInfoToLogin(username, password) {
    localStorage.setItem('registerUsername', username);
    localStorage.setItem('registerPassword', password);
}

function validateInput(username, password, passwordConfirm) {
    if (username.length == 0 || password.length == 0 || passwordConfirm.length == 0) {
        // TODO: create snackbar here
        alert('Fields cannot be empty');
        return false;
    }
    if (password != passwordConfirm) {
        // TODO: create snackbar here
        alert('Passwords do not coincide');
        return false;
    }
    return true;
}

main();