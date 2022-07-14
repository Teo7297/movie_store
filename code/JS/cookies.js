const checkCookie = () => {
    let cookieSession = getCookie("session");
    let userType = getCookie("userType");
    let session = JSON.parse(localStorage.getItem("session"+userType));
    if (document.title != 'Registration Page' && !(cookieSession != "" && cookieSession != null && cookieSession == session.id)){
        alert("Sessione scaduta!");
        window.open('/code/html/loginPage.html', '_self', false)
    }else{
        if(getCookie("remember") == "false"){
            let expiration = 300000;        
            setCookie("session", cookieSession, expiration);      
            setCookie("userType", userType, expiration);
        };
    };  
};

const checkCookieLogin = () =>{
    let cookieSession = getCookie("session");
    let userType = getCookie("userType");
    let session = JSON.parse(localStorage.getItem("session"+userType));    
    if(session != null && cookieSession == session.id){
        if(userType == "cliente"){
            window.open('/code/html/mainPage.html', '_self', false)
        } else{
            window.open('/code/html/mainPageVendor.html', '_self', false)
        }
    }
};



const setCookie = (cname, cvalue, exmillis) => {
    let d = new Date();
    d.setTime(d.getTime() + (exmillis));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};



const getCookie = (cname) => {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
};

const delCookieSession = () =>{
    session = getCookie('session');
    type = getCookie('userType');
    document.cookie = "session=" + session + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userType=" + type + "; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}




