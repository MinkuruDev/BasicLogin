const cookies = parseCookie(document.cookie)
const content = document.querySelector("#content");

if(cookies["userauth"]){
    content.innerHTML = `
        <p>logged as ${cookies["userauth"]}</p>
        <button onclick="logOut()">Log out</button>
    `;
}else{
    content.innerHTML = `
        <p>Not logged in</p>
        <a href="login.html">Login now</a>
    `
}

function logOut(){
    deleteAllCookies();
    window.location.replace("login.html");
}
