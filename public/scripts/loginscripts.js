const checkBox = document.getElementById("checkboxLogin")
const loginNick = document.getElementById("userNick")
const loginPassword = document.getElementById("password") // usunąć w wersji produkcyjnej
const submitButton = document.getElementById("submitButton")
const checkBoxLabel = document.getElementById('checkboxLabel')

function setLocalStorage() {
  
  if (checkBox.checked === true && checkBoxLabel.textContent === 'Zapamiętaj mnie'){
    localStorage.setItem('login', loginNick.value)
    localStorage.setItem('pass', loginPassword.value) // usunąć w wersji produkcyjnej
  } else if (checkBox.checked === true && checkBoxLabel.textContent.slice(0, 2) === 'Po') {
    localStorage.removeItem('login');
    localStorage.removeItem('pass') //usunąć w wersji produkcyjnej
  }
}

submitButton.addEventListener("click", setLocalStorage)

function getUserNickFromLocalStorage() {
  const userNick = localStorage.getItem('login')
  const pass = localStorage.getItem('pass')
  console.log(userNick);
  
  if(userNick) {
    loginNick.value = userNick;
    loginPassword.value = pass  // usunąć w wersji produkcyjnej
    submitButton.focus();
    checkBoxLabel.textContent = `Po zalogowaniu zapomnij mnie (${userNick})`
  } else {
    loginNick.focus();
    checkBoxLabel.textContent = 'Zapamiętaj mnie'
  }
}

getUserNickFromLocalStorage();

let alert = document.querySelector('.alert');

[...document.querySelectorAll('.form-control')].forEach(function(item) {
item.addEventListener('focus', textChange)
})

function textChange() {
  const val = alert ? alert.hidden = true : '';
}
