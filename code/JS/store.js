const prefix = 'http://image.tmdb.org/t/p/w500';  //prefix for fetching images
let url = 'https://api.themoviedb.org/';
const access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"

//TODO save these in local storage so we access them once

let storeInfo = JSON.parse(sessionStorage.getItem("selected_store"));

let store = JSON.parse(localStorage.getItem(storeInfo.name));

let session = getCookie('session');
let user = JSON.parse(localStorage.getItem(session));
let possessed = [];

for(let p of user.extra.possessedMovies){
    possessed.push(p.id);
};

let oldList = [];

const openMoviePage = (elem) =>{
    //open the correct movie
    sessionStorage.setItem("selected_movie", elem.id);
    window.open('/code/html/movie.html', '_self', false);
};


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
            if(!possessed.includes(movie.id.toString())){
                newElem.setAttribute("onclick", "openMoviePage(this)")  
            } else {
                newElem.style.cursor = 'default';
                let badge = document.createElement('span');
                badge.className = "badge bg-secondary";
                badge.innerHTML = 'Posseduto'
                newElem.appendChild(badge)
            }    
            container.appendChild(newElem);
            oldList.push(newElem);
        
    }

};

const removeOld = () =>{
    for (let item of oldList){
        item.remove();
    };
};

const clearSearchList = async () => {
    return await fetch(url+"4/list/"+searchListId+"/clear", {
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

    return await fetch(url+"4/list/"+searchListId+"/items", {
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
    return await fetch(url+"4/list/"+searchListId+"?&page="+pageNum+"&sort_by=title.asc", {
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
        fetch(url+"4/list/"+storeInfo.id+"?&page="+pageNum+"&sort_by=title.asc", {
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

