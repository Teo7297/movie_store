const getUserName = () => {
    const user = JSON.parse(localStorage.getItem(getCookie('session')));
    return user.name;
}

const getStoreName = () =>{
    const s = JSON.parse(localStorage.getItem(getCookie('session')));
    return s.extra.storeName;
}


