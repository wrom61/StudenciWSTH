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

