



// Store
//localStorage.setItem("user1", {"name": "scemo", "surname":"cane"});

// Retrieve
//document.getElementById("result").innerHTML = localStorage.getItem("lastname");
//https://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage


const rememberUser = (email, password) => {
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem("user", {"email": email, "password": password});

  } else {
    // Sorry! No Web Storage support..
  }
}

const registerUser = ()