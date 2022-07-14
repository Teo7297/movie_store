let oldList = [];
let selectedList = [];

//TODO save these in localstorage to access only once 
let sessId = getCookie("session");
let user = JSON.parse(localStorage.getItem(sessId.toString()));
let store = JSON.parse(localStorage.getItem(user.extra.storeName));

let listId = store.storeListId;

//here it's faster to make 2 lists, because removing items from a list of objects is slow
const setOk = (item) =>{
    
    if (item.childNodes[0].getAttribute("src") == null){ 
        item.childNodes[0].setAttribute("src", "../img/ok.svg");
        let toIns = new Object();
        toIns.id = item.id;
        toIns.title = item.title; 
        selectedList.push(toIns);
    } else{
        item.childNodes[0].removeAttribute("src");
        for(let i of selectedList){ 
            if (i.id == item.id){
                selectedList.splice(selectedList.indexOf(i), 1); 
            }
        }
    };
    if(selectedList.length > 0){
        document.getElementById("add-button").removeAttribute("disabled");
    }else{
        document.getElementById("add-button").setAttribute("disabled", "");

    }

};

const toMovie = (elem, ev) =>{
    ev.stopPropagation();
    sessionStorage.setItem('selected_movie', elem.getAttribute('refer-to'));
    window.open('/code/html/movieInfoVendor.html', '_self', false);
}

//TODO vedere specifica per fetch(serve scrivere method, ecc?)
const putPosters = async (prefix, url) => {
    return fetch(url)
        .then(res => res.json())
        .then(data => {
            if(data.results.length < 20){
                document.getElementById("load-more-button").style.visibility = "hidden";
            } else{
                document.getElementById("load-more-button").style.visibility = "visible";
            }
            let container = document.getElementsByClassName("grid-container")[0];
            let sessId = getCookie("session");
            let user = JSON.parse(localStorage.getItem(sessId.toString()));
            let store = JSON.parse(localStorage.getItem(user.extra.storeName));
            let idList = [];
            for (let movie of store.movies){
                idList.push(parseInt(movie.id));
            };

            for (let movie of data.results){
                
                if (idList.includes(movie.id)){     
                    break;
                }
                
                
                let newElem = document.createElement("button");
                newElem.className = "grid-item1";   //set class for css
                newElem.id = movie.id; //set id of movie as id of element
                newElem.title = movie.title;
                let poster_path = (movie.poster_path != null) ? prefix+movie.poster_path : "../img/not_avail_img.jpg" //sometimes the cover img is not available
                newElem.style.backgroundImage = "url("+poster_path+")";
                newElem.style.backgroundSize = "300px 350px"; 
                let ok = document.createElement("img");
                ok.setAttribute("class", "ok");
                newElem.setAttribute("onclick", "setOk(this)")
                newElem.appendChild(ok);
                let infoCard = document.createElement('div');
                infoCard.className = 'info-card';
                let title = document.createElement('h5');
                title.style.color = 'white';
                title.style.fontFamily = 'helvetica neue'
                title.innerHTML = movie.title;
                let infoButton = document.createElement('i');
                infoButton.className = 'fas fa-info-circle';
                infoButton.style.color = 'white';
                infoButton.setAttribute('refer-to', movie.id);
                infoButton.setAttribute('onclick', 'toMovie(this, event)');
                console.log(infoButton);
                infoCard.appendChild(infoButton);
                infoCard.appendChild(title)
                newElem.appendChild(infoCard);
                container.appendChild(newElem);
                oldList.push(newElem);
            }
            if(container.children.length < 10){
                document.getElementById('load-more-button').click();
            }
        })
}


const removeOld = () =>{
    for (let item of oldList){
        item.remove();
    };
};


//save nodes in var while adding, at next search hide them

const search = (remove) =>
{
    if(remove) {
        removeOld(); 
        pageNum = 1;
    }
  
    const prefix = 'http://image.tmdb.org/t/p/w500';  //prefix for fetching images
    let url = 'https://api.themoviedb.org/3/search/movie?api_key=77e8e2387323d9a16b026e64c0b66d70&include_adult=false&query='; //at run time add page number and query


    if(document.getElementById('searchbar').value.trim() != ""){
        url += document.getElementById('searchbar').value.replace(" ", "+");
    }else{
        url += "a";
    }
  
    url += "&page="+pageNum;
    
    putPosters(prefix, url);
    
};


const addToShop = () =>{
    let url = 'https://api.themoviedb.org/4/';
    let access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"

    let moviesToAdd = [];

    for(let movie of selectedList){
        let obj = new Object();
        obj.id = movie.id;
        obj.title = movie.title
        obj.buyPrice = 10.00;
        obj.rentPrice = 5.00;
        store.movies.push(obj);

        let toAdd = new Object();
        toAdd.media_type = "movie";
        toAdd.media_id = movie.id;
        moviesToAdd.push(toAdd);

        
    };
    console.log("added: " + selectedList.length)
    selectedList = [];
    document.getElementById("add-button").setAttribute("disabled", "");
    let ls = new Object();
    ls.items = moviesToAdd;
    localStorage.setItem(user.extra.storeName, JSON.stringify(store));

    fetch(url+"list/"+listId+"/items", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'authorization': access_token
        },
        body: JSON.stringify(ls)
      }).then(()=>{search(true)})
};


