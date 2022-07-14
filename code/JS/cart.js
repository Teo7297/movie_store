const highlight = (elem) =>{
    elem.className = "table-success";
};

const lowlight = (elem) =>{
    elem.removeAttribute("class");
};

const getId = (storeName) => {
    return JSON.parse(localStorage.getItem(storeName)).storeListId;
};


const pay = () => {
  const sessionCli = JSON.parse(localStorage.getItem('sessioncliente'));
  let user = JSON.parse(localStorage.getItem(sessionCli.id));

  let total = 0;
  for(let cartItem of sessionCli.cart){
    total += parseFloat(cartItem.price);
  };
  document.getElementById('total').innerHTML = total+ '€'
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
    }
    if(!user.extra.customizedService){
      user.extra.paymentPreference = null;
      localStorage.setItem(sessionCli.id, JSON.stringify(user));
    } 
}

const setEmptyMsg = () =>{
  document.getElementsByClassName('table')[0].remove();
      document.getElementById('tab-style').remove();
      document.getElementById('pay-all').remove();
      let m = document.createElement('h1');
      m.style.color = 'grey'
      m.innerHTML = 'Aggiungi qualcosa al carrello prima';
      document.getElementById('table-box').appendChild(m);
}

const search = async () =>{
    console.log(document.getElementById('storeId'));
    const stores = JSON.parse(localStorage.getItem("stores"));
    let container = document.getElementById('tbody');
    if(sessionCli.cart.length > 0){
      for(let item of sessionCli.cart){
          let newRow = document.getElementById('storeId').cloneNode(true);
          let children = newRow.children;
          
          newRow.style.display = "";
          newRow.id = item.id;
          
          fetch(url+"3/movie/"+item.id, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'authorization': access_token
              }
            })
            .then(res => res.json())
            .then(movieDetails => {
              //col 1              
              let titleLink = document.createElement('a');
              titleLink.setAttribute('href', '/code/html/movie.html');
              titleLink.innerText = movieDetails.title;
              titleLink.id = movieDetails.id;
              titleLink.setAttribute('onclick', 'openMoviePage(this)')
              children[0].appendChild(titleLink);
              //col 2
              children[1].innerText = (parseInt(movieDetails.vote_average * 10)).toString() + "%";
              //col 3
              if(item.type == 'buy'){
                children[2].innerText = "Acquisto";
              } else {
                children[2].innerText = "Noleggio";
              }
              //col 4
              children[3].innerText = item.price+'€';
              //col 5
              let trashButton = document.createElement('button');
              let trash = document.createElement('i');
              trash.setAttribute('class', 'far fa-trash-alt');
              trashButton.appendChild(trash);
              trashButton.setAttribute('class', "btn btn-outline-danger");
              trashButton.setAttribute('mId',newRow.id);
              trashButton.setAttribute('onclick', 'removeFromCart(this)')   
              children[4].append(trashButton);

            });

          container.appendChild(newRow);
      }

      //set up pay-all button
      let payButton = document.getElementById('pay-all');
      payButton.setAttribute('data-toggle','modal');
      payButton.setAttribute('data-target', '#myModal')
      payButton.onclick = pay;

    }else{
      setEmptyMsg();
    }
}

const openMoviePage = (elem) =>{
  //open the correct movie
  sessionStorage.setItem("selected_movie", elem.id);
};

const clearCart = () =>{
  for(let row of document.getElementsByTagName('td')){
    row.remove();
  };
  sessionCli.cart = [];
  localStorage.setItem('sessioncliente', JSON.stringify(sessionCli));
  setEmptyMsg();
}


const addAllToLibrary = () =>{
  let user = JSON.parse(localStorage.getItem(sessionCli.id));
  let listToIns = [];
  let listId = user.extra.movieListId;
  let movies = new Object();
  movies.items = [];
  let toHistory = [];
  if(user.extra.customizedService){
    savePayInfo(user);
}
  for(let cartItem of sessionCli.cart){
    let historyItem = new Object();
    let toIns = new Object();
    toIns.id = cartItem.id;
    toIns.title = cartItem.title;
    historyItem.title = cartItem.title;
    historyItem.price = cartItem.price;
    historyItem.date = Date.now();
    historyItem.store = cartItem.store;
    if(document.getElementById('inlineRadio1').checked){
      historyItem.payMode = 'Carta di credito';
    }else{
      historyItem.payMode = 'PayPal';
    }

    historyItem.clientId = sessionCli.id;

    if(cartItem.type == 'rent'){
      // Create new Date instance
      var date = new Date();
      // Add 3 days
      date.setDate(date.getDate() + 3);
      toIns.expire = date;
      historyItem.type = 'Noleggio';
  } else {
      toIns.expire = null;
      historyItem.type = 'Acquisto';
  }
    toHistory.push(historyItem);
    listToIns.push(toIns);

    let movie = new Object();
    movie.media_id = cartItem.id;   
    movie.media_type = "movie";
    movies.items.push(movie);
    let store = JSON.parse(localStorage.getItem(cartItem.store));
    store.sales.push(historyItem);
    localStorage.setItem(cartItem.store, JSON.stringify(store));
  };
  
  user.extra.history = user.extra.history.concat(toHistory);
  user.extra.possessedMovies = user.extra.possessedMovies.concat(listToIns);
  localStorage.setItem(sessionCli.id,JSON.stringify(user));

  fetch(url+"4/list/"+listId+"/items", {
      method: 'POST',
      headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'authorization': access_token
      },
      body: JSON.stringify(movies)
  })    
  .then(()=>{
      clearCart();
      window.open('/code/html/myMovies.html', '_self', false);
  })
}


const removeFromCart = (elem) =>{
  let id = elem.getAttribute('mId');
  document.getElementById(id).remove();
  for(let i of sessionCli.cart){
    if(i.id == id){
      sessionCli.cart.splice(sessionCli.cart.indexOf(i),1);
    }
  }
  localStorage.setItem('sessioncliente', JSON.stringify(sessionCli));
  if(sessionCli.cart.length == 0){
    setEmptyMsg();
  }
}



