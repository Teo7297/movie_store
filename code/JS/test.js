let url = 'https://api.themoviedb.org/3/list';
let key = '?api_key=77e8e2387323d9a16b026e64c0b66d70';
let token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3N2U4ZTIzODczMjNkOWExNmIwMjZlNjRjMGI2NmQ3MCIsInN1YiI6IjYwMTFjNzVmN2YxZDgzMDA0MTZlYTI3OSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.aQET7d5uGgA7Bhxd1dZ88-OIQloh4adcwQ4xDNQyPCQ'
let obj = new Object();
sessID = "b1cf4172a3224d18b8a1c0e81be422919f6650c4"

obj.name = "nome_lista";
obj.description = "descrizione";
obj.language = "en";

const create = async () => {
    const rawResponse = await fetch(url+key+"&session_id="+sessID, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj)
    });
    const content = await rawResponse.json();
    console.log(content);
};

let urll = 'https://api.themoviedb.org/3/';
let objj = new Object();

objj.request_token = 'c0be143ae8a745105048a88133263a4ed092c9f3';

const createS = async () => {
    const rawResponse = await fetch(urll + "authentication/session/new"+key, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objj)
    });
    const content = await rawResponse.json();
    console.log(content);
};



let newToken = 'c0be143ae8a745105048a88133263a4ed092c9f3'

const get = () =>{
    fetch(urll+'authentication/token/new'+key)
        .then(res => res.json())
        .then(data =>{
            console.log(data);
        })
};


const add = async () => {
    const rawResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify(obj)
    });
    const content = await rawResponse.json();
    console.log(content);
};


