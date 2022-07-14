let url = 'https://api.themoviedb.org/4/';
const access_token = "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYmYiOjE2MTI0NjkxOTIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsImp0aSI6IjI3ODgxNDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiLCJhcGlfd3JpdGUiXSwidmVyc2lvbiI6MSwiYXVkIjoiNzdlOGUyMzg3MzIzZDlhMTZiMDI2ZTY0YzBiNjZkNzAifQ.XylsNKSrkdH7QZryPCkz78Z7VKw8OOFyF1JVicVa2k8"



const highlight = (elem) =>{
    elem.className = "table-success";
};

const lowlight = (elem) =>{
    elem.removeAttribute("class");
};

const getId = (storeName) => {
    return JSON.parse(localStorage.getItem(storeName)).storeListId;
};

const search = async () =>{
    const stores = JSON.parse(localStorage.getItem("stores"));
    let container = document.getElementById('tbody');
    for (s of stores.stores){
        //per ogni store recupera le info
        //mostra le info nella table
        //salva l'id del negozio come id della row
        //on click della row salva l'id cliccato nel sessionstorage
        let newRow = document.getElementById('storeId').cloneNode(true);
        let children = newRow.children;
        
        newRow.style.display = "";
        newRow.id = getId(s.name);
        
        fetch(url+"list/"+newRow.id, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'authorization': access_token
            }
          })
          .then(res => res.json())
          .then(listDetails => {
            children[1].innerText = listDetails.total_results;
            children[2].innerText = (parseInt(listDetails.average_rating * 10)).toString() + "%";
          });

        children[0].innerText = s.name;

        container.appendChild(newRow);

    }
}


const toStore = (elem) => {
    let storeInfo = new Object();
    storeInfo.id = elem.id;
    storeInfo.name = elem.children[0].innerText;
    sessionStorage.setItem("selected_store", JSON.stringify(storeInfo));
    window.open("store.html", '_self', false);
}



