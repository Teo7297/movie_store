const checkPsw = () => {
    if(document.getElementById('password').value.length == 0){
        document.getElementById('message').innerHTML = '';
        return false;
    } else {

        if(document.getElementById('password').value.length < 5 ){
            document.getElementById('message').style.color = 'red';
            document.getElementById('message').innerHTML = 'password is too short';
            return false;
        } else {

            if (document.getElementById('password').value == document.getElementById('confirm_password').value) {
            document.getElementById('message').style.color = 'green';
            document.getElementById('message').innerHTML = 'password matching';
            return true;
            } else {
            document.getElementById('message').style.color = 'red';
            document.getElementById('message').innerHTML = 'password not matching';
            return false;
            }
        }   
    }
};

const checkEmail = () => {

    if (document.getElementById("email").value.length == 0){
        document.getElementById("messageEmail").innerHTML = '';
        return false;

    } else {
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(document.getElementById("email").value)){
            document.getElementById("email").style.color = 'black';
            document.getElementById("messageEmail").style.color = 'green';
            document.getElementById("messageEmail").innerHTML = 'email valid';
            return true;
        }else{
            document.getElementById("email").style.color = 'red';
            document.getElementById("messageEmail").style.color = 'red';
            document.getElementById("messageEmail").innerHTML = 'email not valid';
            return false;
        }
    }
}

const showFields = () => {
    let userField = document.getElementsByClassName('useronly');
    let vendorField = document.getElementsByClassName('vendoronly');
    let newValue = document.getElementById('select-user-type').value;

    if (newValue == 1){
        for(let element of userField){
            
            element.removeAttribute('hidden');
        }
        for(let element of vendorField){
            element.setAttribute('hidden', '');
        }
    } else if(newValue == 2){
        for(let element of userField){
            
            element.setAttribute('hidden', '');
        }
        for(let element of vendorField){
            element.removeAttribute('hidden');
        }
    } else{
        for(let element of userField){
            
            element.setAttribute('hidden', '');
        }
        for(let element of vendorField){
            element.setAttribute('hidden', '');
        }
    }
}

const checkForm = () => {
    let fields = [
        document.getElementById('name').value,
        document.getElementById('surname').value,
        document.getElementById('email').value,
        document.getElementById('password').value
    ];
    if (document.getElementById('select-user-type').value == 2){
        fields = fields.concat([
            document.getElementById('store-name').value,
            document.getElementById('phone').value,
            document.getElementById('piva').value,
            document.getElementById('street').value,
            document.getElementById('street-number').value,
            document.getElementById('city').value,
            document.getElementById('zip').value

        ]);
    };

    
const checkLength = (elem) => elem.length == 0;
    return (
        !(fields.some(checkLength)) && 
        document.getElementById('select-user-type').value != 0 &&
        checkEmail() &&
        checkPsw()
        )
}

const hashCode = (st) => {
    let hash = 0, i, chr;
    for (i = 0; i < st.length; i++) {
      chr   = st.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const createSession = (remember, userId, userType) =>{
    if(remember){
        let expiration = 999999999;
        setCookie("session", generateSessionId(expiration, userId, userType), expiration); //session won't expire
        setCookie("userType", userType, expiration);
        setCookie("remember", "true", expiration);
    }else{
        let expiration = 300000;
        setCookie("session", generateSessionId(expiration, userId, userType), expiration);      //session expires after 5 mins
        setCookie("userType", userType, expiration);
        setCookie("remember", "false", expiration);
    }
}


const createAPIList = async (lsName, ls, vendorUserId, user, userType) =>{
    const url = 'https://api.themoviedb.org/4/';
    let access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"

    let obj = new Object();
    obj.name = lsName;
    obj.iso_639_1 = "it";

    
    
    fetch(url+"list", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': access_token
        },
        body: JSON.stringify(obj)
    })
        .then(res => res.json())
        .then(data =>{
            if(userType == 2){
                ls.storeListId = data.id;
                //create movie list in db
                localStorage.setItem(lsName, JSON.stringify(ls));
                //setting user ID as hash of his email since its the only unique field (id used to recover account during login phase)
                localStorage.setItem(vendorUserId, JSON.stringify(user));

                //add to stores list
                let stores = JSON.parse(localStorage.getItem('stores'));
                let toAdd = new Object();
                toAdd.name = lsName;
                console.log(stores.stores);
                stores.stores.push(toAdd);
                localStorage.setItem('stores', JSON.stringify(stores))

                createSession(false,vendorUserId, user.type);
            }else{
                user.extra.movieListId = data.id;
                //create movie list in db
                
                //setting user ID as hash of his email since its the only unique field (id used to recover account during login phase)
                localStorage.setItem(lsName, JSON.stringify(user));
                createSession(false, lsName, user.type);
            }
        })
        .then(()=>{
            //open new window ONLY when DB has been updated successfully  
            if(userType == 2){    
                window.open('/code/html/mainPageVendor.html', '_self', false);
            }else{
                window.open('/code/html/mainPage.html', '_self', false);
            }
        })
   
}

const checkUserExist = (id) =>{
    return localStorage.getItem(id) != null;
}

const checkStoreExist = (sName) =>{
    return JSON.parse(localStorage.getItem('stores')).stores.filter((el)=>el.name == sName).length > 0;
}


const signupUser = () => {

    if (checkForm()){
        let user = new Object;
        let extra = new Object;

        let type = document.getElementById('select-user-type');
        user.type = type.options[type.selectedIndex].text;
        user.name = document.getElementById('name').value;
        user.surname = document.getElementById('surname').value;
        user.email = document.getElementById('email').value;
        user.password = document.getElementById('password').value;
        user.privacyAccepted = true;
        
        if(type.value == 1){
            extra.paymentPreference = null;
            extra.customizedService = document.getElementById('service-cb').checked;
            extra.possessedMovies = [];
            extra.history = [];
            user.extra = extra;

            let userId = hashCode(user.email).toString();
            let ls = new Object();
            ls.movies = [];
            if(!checkUserExist(userId)){
                createAPIList(userId, ls, '', user, 1);
            }else{
                alert("Questa email e' gia' in uso da un utente")
            }
            
            //TODO delete 3 rows down here
            //setting user ID as hash of his email since its the only unique field (id used to recover account during login phase)
            //localStorage.setItem(userId, JSON.stringify(user));
            //createSession(false,userId, user.type);
            //window.open('/code/html/mainPage.html', '_self', false);
        }else{
            let address = new Object;
            extra.storeName = document.getElementById('store-name').value;
            extra.phone = document.getElementById('phone').value;
            extra.piva = document.getElementById('piva').value;               
            address.street = document.getElementById('street').value;
            address.streetNumber = document.getElementById('street-number').value;
            address.city = document.getElementById('city').value;
            address.cap = document.getElementById('zip').value;
            extra.address = address;
            user.extra = extra;

            //TODO fare funzione wrapper per il controllo del browser

            let store = new Object();
            store.movies = [];
            store.sales = [];
            let userId = hashCode(user.email).toString();
            //create movie list in db
            //localStorage.setItem(extra.storeName, JSON.stringify(store));
            //create a list on the API, so we get all movies with 1 request
            if(!checkUserExist(userId) && !checkStoreExist(extra.storeName)){
                createAPIList(extra.storeName, store, userId, user, 2);
            }else{
                alert("Email o nome negozio gia' in uso")
            }
            
        }
    }else{
        //show error message
        document.getElementById('empty-fields-message').removeAttribute('hidden');
    }   
};

const toggleButton = () => {
    if(document.getElementById("privacy-checkbox").checked){
        document.getElementById('reg-button').disabled = false;
        document.getElementById('reg-button').classList.add("login_btn");
    }else{
        document.getElementById('reg-button').disabled = true;
        document.getElementById('reg-button').classList.remove("login_btn");
    }
};


//clear db
//set hardcoded search list id
const clearDB = () => {
    localStorage.clear();
    console.log("deleted, storage size: "+localStorage.length);
    localStorage.setItem("search_list_id", "7075518")
    let stores = new Object();
    stores.stores = [];
    localStorage.setItem("stores", JSON.stringify(stores));
};

const generateSessionId = (expMillis, userId, userType) =>{
    //creates random id, returns it as string, creates an entry in the db (localstorage)

    let session = new Object();
    let expiration = new Date();
    expiration.setTime(expiration.getTime() + (expMillis));
    
    session.expiration = expiration;
    session.id = userId; //id utente = id sessione

    if(userType == "cliente"){
        session.cart = [];
    } else {
        //eventual needed session data for vendor
    }
    
    localStorage.setItem("session"+userType, JSON.stringify(session));

    return session.id;
}



const checkLoginForm = () => {
    let email = document.getElementById('email').value;
    let psw = document.getElementById('password').value;
    if(email.length == 0 || psw.length == 0){
        document.getElementById('message').innerHTML = 'Compilare tutti i campi';
        document.getElementById('message').style.color = 'red';
    } else {
        let userId = hashCode(email).toString();
        let user = JSON.parse(localStorage.getItem(userId))

        if(user.password == psw){
            createSession(document.getElementById('remember').checked, userId, user.type);           
            if(user.type == "cliente"){
                window.open('/code/html/mainPage.html', '_self', false)
            } else{
                window.open('/code/html/mainPageVendor.html', '_self', false)
            }
        } else {
            document.getElementById('message').innerHTML = 'Credenziali non valide';
            document.getElementById('message').style.color = 'red';
        }
    }
}
