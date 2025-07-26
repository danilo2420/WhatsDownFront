// Elements
const inputUsername = document.querySelector('.inputUsername');
const inputPassword = document.querySelector('.inputPassword');
const btnLogin = document.querySelector('.buttons__btnLogin');
const btnRegister = document.querySelector('.buttons__btnRegister');

// Variables


// Functions
function main() {
    testBackend();

    // Redirect user into application if already auth'd
    redirectIfLoggedin();
    // Get user data from recently registered user
    setRecentlyRegisteredUserData();

    // Login logic
    btnLogin.addEventListener('click', handleLogin);
    // Go to register view
    btnRegister.addEventListener('click', () => window.location.href = '/register/register.html');
}

function testBackend() {
    fetch('https://whatsdownapi-production.up.railway.app/health/ping')
        .then((response) => {
            return response.text()
        }).then((text) => {
            console.log(text);
        })
}

function redirectIfLoggedin() {
    sessionStorage.clear();
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('https://whatsdownapi-production.up.railway.app/users/checkToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({
            token: token
        })
    }).then((response) => {
        return response.json()
    }).then((data) => {
        if (data.message == 'success')
            window.location.href = '/home/home.html';
        else 
            localStorage.removeItem('token');
    }).catch((error) => {
        console.log(error);
    })
}

function setRecentlyRegisteredUserData() {
    // See if user was just registered (these properties will have been just set)
    const username = localStorage.getItem('registerUsername');
    const password = localStorage.getItem('registerPassword');
    if (!username || !password) return;

    // Set values in the input fields
    inputUsername.value = username;
    inputPassword.value = password;

    // Remove data from localStorage
    localStorage.removeItem('registerUsername');
    localStorage.removeItem('registerPassword');
}

function handleLogin() {
    const username = inputUsername.value;
    const password = inputPassword.value;

    if (!validateInput(username, password)) return;

    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));

    fetch('https://whatsdownapi-production.up.railway.app/users/auth', {
        method: 'POST',
        headers
    }).then((response) => {
        return response.json()
    }).then((data) => {
        if (!data.message) return;

        if (data.message == 'success') {
            localStorage.setItem('token', data.token);
            document.location.href = '/home/home.html';
        } else if (data.message == 'error') {
            alert(data.content);
        }
    }).catch((error) => {
        console.log(error);
    })
}

function validateInput(username, password) {
    if (username.length == 0) {
        alert('Username cannot be blank');
        return false;
    }
    if (password.length == 0) {
        alert('Password cannot be blank');
        return false;
    }
    return true;
}

main();