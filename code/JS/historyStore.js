const highlight = (elem) =>{
    elem.className = "table-success";
};

const lowlight = (elem) =>{
    elem.removeAttribute("class");
};

const fillTable = () =>{ 
    const user = JSON.parse(localStorage.getItem(getCookie('session')));
    let store = JSON.parse(localStorage.getItem(user.extra.storeName));
    let container = document.getElementById('tbody');
    for (let h of store.sales){
        let newRow = document.getElementById('storeId').cloneNode(true);
        let children = newRow.children;  
        newRow.style.display = "";
        children[0].innerText = h.title;
        children[1].innerText = h.payMode; 
        children[2].innerText = h.type; 
        children[3].innerText = h.price+'€';
        children[4].innerText = h.clientId;
        let date = new Date(h.date);
        children[5].innerText = date.getDay()+'/'+date.getMonth()+'/'+date.getFullYear();
        container.appendChild(newRow);
    };
    
}


