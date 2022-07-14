const showFields = () => {
    let userField = document.getElementsByClassName('useronly');
    let vendorField = document.getElementsByClassName('vendoronly');

    if (userType == 'cliente'){
        for(let element of userField){
            
            element.removeAttribute('hidden');
        }
        for(let element of vendorField){
            element.setAttribute('hidden', '');
        }
    } else {
        for(let element of userField){
            
            element.setAttribute('hidden', '');
        }
        for(let element of vendorField){
            element.removeAttribute('hidden');
        }
    } 
}

const autoComplete = () =>{
    document.getElementById('name').value = user.name;
    document.getElementById('surname').value = user.surname;
    document.getElementById('email').value = user.email;
    if(userType == 'cliente'){
        if(user.extra.customizedService){
            document.getElementById('service-cb').checked = true;
        };
    }else{
        document.getElementById('phone').value = user.extra.phone;
        document.getElementById('piva').value = user.extra.piva;
        document.getElementById('street').value = user.extra.address.street; 
        document.getElementById('street-number').value = user.extra.address.streetNumber; 
        document.getElementById('city').value = user.extra.address.city; 
        document.getElementById('zip').value = user.extra.address.cap; 
        document.getElementById('store-name').value = user.extra.storeName;

    }
}

const unlockConfirm = () => {
    document.getElementById('reg-button').removeAttribute('disabled');
    document.getElementById('reg-button').classList.add("login_btn");
}


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

const checkUserExist = (id) =>{
    return localStorage.getItem(id) != null;
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

const checkEmail = () => {
    if (document.getElementById("email").value.length == 0 || checkUserExist(hashCode(document.getElementById("email").value).toString())){
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
const checkStoreExist = (sName) =>{
    return JSON.parse(localStorage.getItem('stores')).stores.filter((el)=>el.name == sName).length > 0;
}


const confirm = () =>{
    let valid = true;
    let val = document.getElementById('name').value;
    if(val != "" && val != user.name){
        user.name = val;
    }
    val = document.getElementById('surname').value;
    if(val != "" && val != user.surname){
        user.surname = val;
    }
    val = document.getElementById('email').value;
    if(val != "" && val != user.email){
        if(checkEmail()){
            user.email = val;
        }else{
            alert('Email not valid!')
            valid = false;
        }
    }
    
    val = document.getElementById('phone').value;
    if(val != "" && val != user.extra.phone){
        user.extra.phone = val;
    }
    val = document.getElementById('piva').value;
    if(val != "" && val != user.extra.piva){
        user.extra.piva = val;
    }
    val = document.getElementById('street').value;
    if(val != "" && val != user.extra.address.street){
        user.extra.address.street = val;
    }
    val = document.getElementById('street-number').value;
    if(val != "" && val != user.extra.address.streetNumber){
        user.extra.address.streetNumber = val;
    }
    val = document.getElementById('zip').value;
    if(val != "" && val != user.extra.address.cap){
        user.extra.address.cap = val;
    }
    val = document.getElementById('city').value;
    if(val != "" && val != user.extra.address.city){
        user.extra.address.city = val;
    }
    val = document.getElementById('password').value;
    if(val != "" && val != user.password){
        if(checkPsw()){
            user.password = val;
        }else{
            alert('Password not valid')
            valid = false;
        }
    }
    
    user.extra.customizedService = document.getElementById('service-cb').checked;
    if(!user.extra.customizedService ){
        user.extra.paymentPreference = null;
    }

    val = document.getElementById('store-name').value;
    if(val != "" && val != user.extra.storeName ){
        if(checkStoreExist(val)){
            alert('Nome negozio gia in uso')
        }else{
            let access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"
            let url = 'https://api.themoviedb.org/4/';
            let oldName = user.extra.storeName;
            let store = JSON.parse(localStorage.getItem(oldName));
            let listId = store.storeListId;
            let obj = new Object();
            newName = val;
            obj.name = newName;
            fetch(url+"list/"+listId, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'authorization': access_token
                },
                body: JSON.stringify(obj)
                }).then(res => res.json)
                .then(data =>{
                    console.log(data);
                    
                    localStorage.removeItem(oldName);

                    localStorage.setItem(newName, JSON.stringify(store));

                    let storesList = JSON.parse(localStorage.getItem('stores'));
                    
                    let storesFiltered = new Object() 
                    storesFiltered.stores = storesList.stores.filter((el)=>el.name != oldName);
                    let ne = new Object();
                    ne.name = newName;
                    storesFiltered.stores.push(ne);
                    localStorage.setItem('stores', JSON.stringify(storesFiltered))
                        
                    
                    user.extra.storeName = val;
                    if(valid){
                        localStorage.setItem(getCookie('session'), JSON.stringify(user));
                        console.log('info updated');
                        alert("Informazioni account aggiornate!")
                    }
                    window.location.reload();
                    
                })
            }
            
        
        
    }else{
        if(valid){
            localStorage.setItem(getCookie('session'), JSON.stringify(user));
            console.log('info updated');
            alert("Informazioni account aggiornate!")
        }
        window.location.reload();
    }

    
}

const deleteAccount =()=>{
    let url = 'https://api.themoviedb.org/4/';
    let userId = getCookie('session');
    let access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"
    let listId;
    if(userType == 'cliente'){
        listId=user.extra.movieListId;
        localStorage.removeItem('sessioncliente');
    }else{
        let store = JSON.parse(localStorage.getItem(user.extra.storeName));
        listId = store.storeListId;
        localStorage.removeItem(user.extra.storeName);
        localStorage.removeItem('sessionvenditore');
        let stores = JSON.parse(localStorage.getItem('stores'));
        for(s of stores.stores){
            if(s.name == user.extra.storeName){
                stores.stores.splice(stores.stores.indexOf(s), 1);
                localStorage.setItem('stores', JSON.stringify(stores));
                break;
            }
        }
    }
    fetch(url+"list/"+listId, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'authorization': access_token
        }
    }).then((res)=>{
        localStorage.removeItem(userId);
        
        alert('Account eliminato con successo!')
        window.open('loginPage.html', '_self', false);
    })
    
      
}