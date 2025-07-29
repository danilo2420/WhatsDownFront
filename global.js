console.log("Running global script");

// Change this when changing environment
let production = false;
//

let URLs = null;

if (production) {
    URLs = {
        login: "/WhatsDownFront/home.html",
        register: "/WhatsDownFront/register/register.html",
        home: "/WhatsDownFront"
    }
} else {
    URLs = {
        login: "/",
        register: "/register/register.html",
        home: "/home/home.html"
    }
}


export {
    URLs
}