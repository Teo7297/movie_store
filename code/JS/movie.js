const prefix = 'http://image.tmdb.org/t/p/original';  //prefix for fetching images
const prefix_small = 'http://image.tmdb.org/t/p/w500';
const url = 'https://api.themoviedb.org/';
const access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"
const sessionCli = JSON.parse(localStorage.getItem('sessioncliente'));



const loadMovie = () =>{
    fetch(url+'3/movie/'+selectedMovie, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': access_token
        }
    })
    .then(res => res.json())
    .then(data => { 
        let header = document.getElementsByClassName('header-img')[0];
        header.style.backgroundImage = 'url('+ prefix + data.backdrop_path+')'
        document.getElementsByClassName('poster')[0].style.backgroundImage = 'url('+ prefix_small + data.poster_path+')'
        document.getElementsByClassName('movie-title')[0].innerHTML = data.title;
        let vote = (data.vote_average*10)+'%'
        document.getElementsByClassName('movie-rating')[0].innerHTML += vote;
        document.getElementsByClassName('progress-bar')[0].style.width = (data.vote_average*10)+'%'
        document.getElementsByClassName('movie-description')[0].innerHTML = data.overview;
        let gen = document.getElementsByClassName('movie-infos')[0];
        let n = 0;
        for(let genre of data.genres){
            n++;
            gen.innerHTML += genre.name;
            if(n < data.genres.length){
                gen.innerHTML += '&nbsp;&#183;&nbsp;' 
            }
        };
        for(let cartItem of sessionCli.cart){
            if (cartItem.id == data.id.toString()){
                disableButton(document.getElementById('rent-cart'));
                disableButton(document.getElementById('buy-cart'));
            }
        }
    });
}

const loadActors = () =>{
    fetch(url+'3/movie/'+sessionStorage.getItem("selected_movie")+'/credits', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': access_token
        }
    })
    .then(res => res.json())
    .then(data => { 
        let ul = document.getElementById('actors-list')
        console.log(data);
        for(let profile of data.cast){
            let li = document.createElement('li');
            let card = document.createElement('div');
            card.className = 'actors-card';
            let textName = document.createElement('h4');
            textName.textContent = profile.name;
            card.appendChild(textName);
            let textChar = document.createElement('h6');
            textChar.textContent = profile.character;
            card.appendChild(textChar);
            li.appendChild(card);
            if(profile.profile_path != null){
                li.style.backgroundImage = 'url('+prefix_small+profile.profile_path+')';
            }else{
                li.style.backgroundImage = 'url(/code/img/no_person_img.png)';
            }
            ul.appendChild(li);
        }

    });
};

const loadPrices = () =>{
    let store = JSON.parse(localStorage.getItem(selectedStore.name));
    for (let m of store.movies){
        if(m.id == selectedMovie){
            document.getElementById('buy').innerHTML += m.buyPrice + '€';
            document.getElementById('buy').setAttribute('price', m.buyPrice);
            document.getElementById('buy-cart').setAttribute('price', m.buyPrice);
            document.getElementById('rent').innerHTML += m.rentPrice + '€';
            document.getElementById('rent').setAttribute('price', m.rentPrice);
            document.getElementById('rent-cart').setAttribute('price', m.rentPrice);

            break;
        };
    };
};

const toPayment = (elem) => {
    let user = JSON.parse(localStorage.getItem(sessionCli.id));
    let info = new Object();
    info.price = elem.getAttribute("price");
    info.type = elem.id;
    sessionStorage.setItem("payment", JSON.stringify(info));
    document.getElementById('total').innerHTML = info.price+ '€'
    let pref = user.extra.paymentPreference;
    if(pref == null){
        return;
    } else if(pref.type == 'credit card'){
        document.getElementById('inlineRadio1').checked = true;
        document.getElementById('name').value = pref.name;
        document.getElementById('surname').value = pref.surname;
        document.getElementById('card-number').value = pref.creditCard;
        document.getElementById('cvv').value = pref.cvv;
        document.getElementById('expire').value = pref.expire;
        toggleCard();
        document.getElementById('pay-now').removeAttribute('disabled');
    } else {
        document.getElementById('inlineRadio2').checked = true;
        togglePayPal();
    };
    if(!user.extra.customizedService){
        user.extra.paymentPreference = null;
        localStorage.setItem(sessionCli.id, JSON.stringify(user));
    }
     
};

const toggleCard = () =>{
    document.getElementById('pay-form').style.display = 'block';
    document.getElementById('pp').style.display = 'none';
    document.getElementById('pay-now').setAttribute('disabled','');
    
}


const togglePayPal = () =>{
    document.getElementById('pay-form').style.display = 'none';
    document.getElementById('pp').style.display = 'flex';
    document.getElementById('pay-now').setAttribute('disabled','');
    document.getElementById('check').style.display = 'none';
    document.getElementById('card-number').value = "";

}

const toPayPal = () =>{
    //here we should go to paypal api payment window
    document.getElementById('pay-now').removeAttribute('disabled') ;
    document.getElementById('check').style.display = 'block'   ;
}


const checkCardNumber=(elem)=>{
    if(!/\d{12}/.test(elem.value)){
        document.getElementById('card-label').style.display = 'block';
        return false;
    } else {
        document.getElementById('card-label').style.display = 'none';
        return true;
    }
}

const checkCVV = elem =>{
    if(!/\d{3}/.test(elem.value)){
        document.getElementById('cvv-label').style.display = 'block';
        return false;
    } else {
        document.getElementById('cvv-label').style.display = 'none';
        return true;

    }
}

const checkName = (n, s) => 
    /^\S+$/.test(n.value) && /^\S+$/.test(s.value)


const checkForm = () =>{
    if(
        checkCardNumber(document.getElementById('card-number')) &&
        checkCVV(document.getElementById('cvv')) &&
        checkName(document.getElementById('name'), document.getElementById('surname')) &&
        checkDate(document.getElementById('expire'))
    ){
        //activate button
        document.getElementById('pay-now').removeAttribute('disabled');
    }else{
        document.getElementById('pay-now').setAttribute('disabled', '');
    }
}

const checkDate=(elem)=>{
    if(!(Date.parse(elem.value) > Date.now())){
        document.getElementById('modal-error-message').style.display = 'block';
        return false;
    } else {
        document.getElementById('modal-error-message').style.display = 'none';
        return true;
    };
};


const getTitle = async (id) => {
    const rawResponse = await fetch(url+"3/movie"+id, {
        method: 'GET',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        }
    });
    const content = await rawResponse.json();
    console.log(content.title);
    return content.title;
};

const savePayInfo = (user) => {
    let obj = new Object();
    if(document.getElementById('inlineRadio1').checked){
        obj.type = 'credit card';
        obj.name = document.getElementById('name').value;
        obj.surname = document.getElementById('surname').value;
        obj.creditCard = document.getElementById('card-number').value;
        obj.cvv = document.getElementById('cvv').value;
        obj.expire = document.getElementById('expire').value;
    } else{
        obj.type = 'PayPal';
    }
    user.extra.paymentPreference = obj;
    localStorage.setItem(sessionCli.id, JSON.stringify(user));
}

const addToLibrary=()=>{
    
    let session = getCookie('session');
    let user = JSON.parse(localStorage.getItem(session));
    if(user.extra.customizedService){
        savePayInfo(user);
    }
    let listId = user.extra.movieListId;
    let movies = new Object();
    movies.items = [];
    let movie = new Object();
    movie.media_id = sessionStorage.getItem('selected_movie');   
    movie.media_type = "movie";
    movies.items.push(movie);
    let historyItem = new Object();
    historyItem.title = document.getElementsByClassName('movie-title')[0].innerHTML;
    let info = JSON.parse(sessionStorage.getItem('payment'));
    historyItem.price = info.price;
    historyItem.date = Date.now();
    historyItem.store = JSON.parse(sessionStorage.getItem('selected_store')).name;
    if(document.getElementById('inlineRadio1').checked){
        historyItem.payMode = 'Carta di credito';
      }else{
        historyItem.payMode = 'PayPal';
    }
    historyItem.clientId = sessionCli.id;
    if(info.type == 'buy'){
        historyItem.type = 'Acquisto';
    } else{
        historyItem.type = 'Noleggio';
    }
    console.log(user.extra);
    user.extra.history.push(historyItem);
    let store = JSON.parse(localStorage.getItem(historyItem.store));
    store.sales.push(historyItem);
    console.log(store, historyItem.store);
    localStorage.setItem(historyItem.store, JSON.stringify(store));


    fetch(url+"4/list/"+listId+"/items", {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': access_token
        },
        body: JSON.stringify(movies)
    }).then(()=>{
        //update user movie list
        let m = new Object();
        m.id = movie.media_id;
        m.title = document.getElementsByClassName('movie-title')[0].innerHTML;
        let type = JSON.parse(sessionStorage.getItem('payment')).type;
        if(type == 'rent'){
            // Create new Date instance
            var date = new Date();
            // Add 3 days
            date.setDate(date.getDate() + 3);
            m.expire = date;
        } else {
            m.expire = null;
        }
        user.extra.possessedMovies.push(m);
        localStorage.setItem(session, JSON.stringify(user));
       
        for (let cartItem of sessionCli.cart){
            if(m.id == cartItem.id){
                sessionCli.cart.splice(sessionCli.cart.indexOf(cartItem),1);
            };
            localStorage.setItem('sessioncliente', JSON.stringify(sessionCli));
            break;
        };
        
    }).then(()=>{
       window.open('/code/html/myMovies.html', '_self', false);
    })

};

const disableButton = elem =>{
    elem.setAttribute('disabled', '');
    elem.removeChild(elem.firstChild);
    let tick = document.createElement('i');
    tick.setAttribute('class', 'fas fa-check');
    elem.appendChild(tick);
}

const addToCart=(elem)=>{
    let cartItem = new Object();
    cartItem.id = sessionStorage.getItem('selected_movie');
    cartItem.title = document.getElementsByClassName('movie-title')[0].innerHTML;
    cartItem.price = elem.getAttribute('price');
    cartItem.type = elem.getAttribute('transaction');
    cartItem.store = JSON.parse(sessionStorage.getItem('selected_store')).name;
    let sess = JSON.parse(localStorage.getItem('sessioncliente'));
    sess.cart.push(cartItem);
    localStorage.setItem('sessioncliente', JSON.stringify(sess));
    disableButton(document.getElementById('rent-cart'));
    disableButton(document.getElementById('buy-cart'));

  }
  
  
