window.baseURL = 'http://localhost:4551'

let contextMenu = document.getElementById('contextMenu');
let profile = document.getElementById('profile');

var formatter = Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

let setWrongClass = (input) => input.classList.add('wrong-input');

var removeWrongClass = (input) => input.classList.remove('wrong-input');

var validateInput = (container) => {
    let inputs = container.querySelectorAll('.required');
    inputs.forEach(input => setWrongClass(input));
}

var fillSelectSuperVisorSelect = (superVisors,selectTag) => {
    let fragment = document.createDocumentFragment();
    for (let superVisor of superVisors) {
        let option = document.createElement('option');
        option.setAttribute('value', superVisor.NUMERO);
        option.innerText = superVisor.USUARIO;
        fragment.append(option);
    }
    selectTag.append(fragment);
}

profile.addEventListener('click',e=>{
    if(contextMenu.classList.contains('show')){
        contextMenu.classList.remove('show');
    }else{
        contextMenu.classList.add('show');
    }
})

