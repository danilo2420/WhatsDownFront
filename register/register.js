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
    btnGoBack.addEventListener('click', () => window.location.href = '/index.html');
}

function handleSignup() {
    const username = inputUsername.value;
    const password = inputPassword.value;
    const passwordConfirm = inputPasswordConfirm.value;

    if (!validateInput(username, password, passwordConfirm)) {
        return;
    }

    fetch('https://whatsdownapi-production.up.railway.app/users/create', {
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
            alert('User created successfully');
            passUserInfoToLogin(username, password);
            window.location.href = '/index.html';
        } else if(data.message == 'error') {
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
        alert('Fields cannot be empty');
        return false;
    }
    if (password != passwordConfirm) {
        alert('Passwords do not coincide');
        return false;
    }
    return true;
}

main();