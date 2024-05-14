const buttonsView = document.querySelectorAll("[data-button='view']")
const buttonsEdit = document.querySelectorAll("[data-button='edit']")
const buttonsDelete = document.querySelectorAll("[data-button='delete']")
const buttonClear = document.querySelector("[data-button='clear']")
const lastNameField = document.querySelector('#searchField_ln')
const firstNameField = document.querySelector('#searchField_fn')
const addressField = document.querySelector('#searchField_ad')

function clearSearchFields() {
  lastNameField.value = ''
  firstNameField.value = ''
  addressField.value = ''
}
buttonClear.addEventListener("click", clearSearchFields)

function resizeStyles() {
  if (window.innerWidth < 1000) {   
    // buttonJS[0].textContent = ""; 
    buttonsView.forEach(button => {
      button.innerHTML = '<i class="bi bi-database-add">';
      button.style.width = 40;
      })
      buttonsEdit.forEach(button => {
        button.innerHTML = '<i class="bi bi-pencil">';
        button.style.width = 40;
      })
   
      buttonsDelete.forEach(button => {
        button.innerHTML = '<i class="bi bi-person-x">';
        button.style.width = 40;
      })   
  } else {
    buttonsView.forEach(button => {
      button.innerHTML = '<i class="bi bi-database-add"></i>'
      button.style.width = 95;
    })
    buttonsEdit.forEach(button => {
      button.innerHTML = '<i class="bi bi-pencil"></i>'
      button.style.width = 95;
    })
    buttonsDelete.forEach(button => {
      button.innerHTML = '<i class="bi bi-person-x"></i>'
      button.style.width = 95;
    })
  }
}
window.addEventListener("resize", resizeStyles)

const ln = document.querySelector('#searchField_ln');
const fn = document.querySelector('#searchField_fn');
const ad = document.querySelector('#searchField_ad');
const alertSuccess = document.querySelector('.alert-success')


document.addEventListener('keydown', function(event) {
 if(event.keyCode == 27) {
   ln.value = '';
   fn.value = '';
   ad.value = '';
   alertSuccess.remove();
   ln.focus();
  }
});

function checkdelete() {
return confirm('Czy na pewno usunąć tego studenta?')
}

ln.addEventListener("keypress", function(event) {
if (event.key === "Enter") {
  event.preventDefault()
  document.getElementById("searchFieldButton").click();
}
})
ln.addEventListener("focus", () =>  ln.select())

fn.addEventListener("keypress", function(event) {
if (event.key === "Enter") {
  event.preventDefault()
  document.getElementById("searchFieldButton").click();
}
})
fn.addEventListener("focus", () =>  fn.select())

ad.addEventListener("keypress", function(event) {
if (event.key === "Enter") {
  event.preventDefault()
  document.getElementById("searchFieldButton").click();
}
})
ad.addEventListener("focus", () =>  ad.select())  

let alert = document.querySelector('.alert');

[...document.querySelectorAll('.form-control')].forEach(function(item) {
item.addEventListener('input', textChange)
})

function textChange() {
const val = alert ? alert.hidden = true : '';
}


