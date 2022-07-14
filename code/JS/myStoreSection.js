const prefix = 'http://image.tmdb.org/t/p/w500';  //prefix for fetching images
let url = 'https://api.themoviedb.org/4/';
const access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"
//TODO il bottone carica altro deve esserci se ci sono altre pagine non se ci sono 20 elementi
//TODO save these in local storage so we access them once
let sessId = getCookie("session");
let user = JSON.parse(localStorage.getItem(sessId.toString()));
let store = JSON.parse(localStorage.getItem(user.extra.storeName));
let listId = store.storeListId;

let oldList = [];


const showDD=(elem)=>{
    elem.firstChild.style.display = "block"; 
}

const hideDD=(elem)=>{
    elem.firstChild.style.display = "none";
}

const putPosters = (results, numRes) => {
    if(numRes <= 20*pageNum){
        document.getElementById("load-more-button").style.visibility = "hidden";
    } else{
        document.getElementById("load-more-button").style.visibility = "visible";
    };

    let container = document.getElementsByClassName("grid-container")[0];
    
    for (let movie of results){

        let newElem = document.createElement("button");
        newElem.className = "grid-item1";   //set class for css
        newElem.id = movie.id; //set id of movie as id of element
        newElem.title = movie.title;
        let poster_path = (movie.poster_path != null) ? prefix+movie.poster_path : "../img/not_avail_img.jpg" //sometimes the cover img is not available
        newElem.style.backgroundImage = "url("+poster_path+")";
        newElem.style.backgroundSize = "300px 350px";   
        let ddElem = document.getElementById("movies-dropdown").cloneNode(true);
        ddElem.childNodes[1].setAttribute("refer-to", movie.id);
        ddElem.childNodes[3].setAttribute("refer-to", movie.id);
        newElem.appendChild(ddElem);    
        newElem.setAttribute("onclick", "showDD(this)");
        container.appendChild(newElem);
        newElem.setAttribute("onmouseleave", "hideDD(this)")
        oldList.push(newElem);
    }

};

const removeOld = () =>{
    for (let item of oldList){
        item.remove();
    };
};

const clearSearchList = async () => {
    return await fetch(url+"list/"+searchListId+"/clear", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': access_token
      }
    });
};

const insertSearchList = async (toSearch) => {
    let movies = new Object();
    movies.items = toSearch;

    return await fetch(url+"list/"+searchListId+"/items", {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': access_token
        },
        body: JSON.stringify(movies)
    });
};

const getSearchResults = async () => {
    return await fetch(url+"list/"+searchListId+"?&page="+pageNum+"&sort_by=title.asc", {
        method: 'GET',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': access_token
        }
    })
    .then(resGet => resGet.json())
}
//finds all movies from APIList, any change is replicated to localStorage list

//Come funziona la ricerca nel negozio: 
        //non si puo cercare nelle liste della API.. 
        //aggiungo il titolo alla mia lista nello storage
        //filtro gli id in base alla ricerca per titolo
        //creo una lista con gli id per la ricerca
                //ritorno la lista
//TODO remove awaits + check that no errors occur
const search = async (remove) =>{
    if(remove) {
        removeOld(); 
        pageNum = 1;
    };
    let stringToSearch = document.getElementById('searchbar').value;
    if(stringToSearch.trim() != ""){
        if(pageNum == 1){
            //clear the search list
            await clearSearchList();
            let toSearch = [];
            for (let movie of store.movies){
                if(movie.title.toLowerCase().includes(stringToSearch.toLowerCase())){
                    let s = new Object();
                    s.media_type = "movie";
                    s.media_id = movie.id;
                    toSearch.push(s);
                };
            };
            //inserting search results in list
            await insertSearchList(toSearch);
            
            //finally, getting le list of results
            let dataGet = await getSearchResults();       
            putPosters(dataGet.results, dataGet.total_results); 
            
        }else{
            fetch(url+"list/"+searchListId+"?&page="+pageNum+"&sort_by=title.asc", {
                method: 'GET',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'authorization': access_token
                }
            })
            .then(resGet => resGet.json())
            .then(dataGet => {
                putPosters(dataGet.results, dataGet.total_results);
            });
        }
        

    } else {
        fetch(url+"list/"+listId+"?&page="+pageNum+"&sort_by=title.asc", {
            method: 'GET',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'authorization': access_token
            }
        })
        .then(res => res.json())
        .then(data => {
            putPosters(data.results, data.total_results)
        }); 
    };     
};

let currentMovie = null;

const getMovieId = (elem) => {
    currentMovie = elem.getAttribute("refer-to");
}

const updatePrices = () => {
    const re = /^$|^[+]?\d+(\.\d+)?$/; //checks empty string or valid integer/float

    let newBuyPrice = document.getElementById('buy-price-input').value;
    let newRentPrice = document.getElementById('rent-price-input').value;
    if(!re.test(newBuyPrice) || !re.test(newRentPrice)){
        document.getElementById('modal-error-message').style.display = 'block';
    } else {
        document.getElementById('modal-error-message').style.display = 'none';
        let movieInfo;
        for (let m of store.movies){
            if(m.id == currentMovie){
                movieInfo = m;
                break;
            };
        };
        if(newBuyPrice != "" && movieInfo.buyPrice != newBuyPrice){
            movieInfo.buyPrice = parseFloat(newBuyPrice);
        };
        if(newRentPrice != "" && movieInfo.rentPrice != newRentPrice){
            movieInfo.rentPrice = parseFloat(newRentPrice);
        };
        localStorage.setItem(user.extra.storeName, JSON.stringify(store));
        document.getElementById('buy-price-input').value = "";
        document.getElementById('rent-price-input').value = "";
        $('#myModal').modal('hide');    //jquery unico modo per chiudere modal(?)
        

    }
    

}

const removeMovie = async (remId) => {

    let toRemove = new Object();
    toRemove.items = [];
    let t = new Object();
    t.media_id = remId;   //obtained from a random movie
    t.media_type = "movie";
    toRemove.items.push(t);

    fetch(url+"list/"+listId+"/items", {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'authorization': access_token
      },
      body: JSON.stringify(toRemove)
    })
    .then(()=>{document.getElementById(remId).remove()});
  };

const delMovie = (elem) => {
    movieId = elem.getAttribute("refer-to");
        for (let m of store.movies){
            if(m.id == movieId){         
                store.movies.splice(store.movies.indexOf(m),1);
                localStorage.setItem(user.extra.storeName, JSON.stringify(store));
                removeMovie(m.id);
                break;
            };
        };

}
