(async () => {

    let tableArticleBody = document.getElementById('tableArticleBody');
    let bar_code_input = document.getElementById('bar_code_input');
    let name_client = document.getElementById('name_client');
    let totalArticles = document.getElementById('totalArticles');
    let totalPrice = document.getElementById('totalPrice');
    let btnInsert = document.getElementById('btnInsert');
    let btnDelete = document.getElementById('btnDelete');
    let btnSend = document.getElementById('btnSend');
    let tableArticle = document.getElementById('tableArticle');
    let userSuperVisor = document.getElementById('userSuperVisor');
    let btnAccept = document.getElementById('btnAccept');
    let btnCancel = document.getElementById('btnCancel');
    let modalUser = document.getElementById('modalUser');

    let itemsToInvoice = {};
    let articleCounter = 0;
    let articlesSelected = [];

    let quantity = 1;
    let totalArt = 0;
    let totalPric = 0;

    let mode = 'NORMAL';
    let btndltStatus = 'NORMAL';

    let baseURL = 'http://localhost:4551'

    let getSupervisor = await fetch(`${baseURL}/api/user/superVisor`)
        .then(res => {
            if (res.status >= 400) throw Error('Error al traer los super visores');
            return res.json();
        })

    let fillSelectSuperVisorSelect = (superVisors) => {
        let fragment = document.createDocumentFragment();
        for (let superVisor of superVisors) {
            let option = document.createElement('option');
            option.setAttribute('value', superVisor.NUMERO);
            option.innerText = superVisor.USUARIOS;
            fragment.append(option);
        }
        userSuperVisor.append(fragment)

    }
    fillSelectSuperVisorSelect(getSupervisor);
 
    let getArticleByBarcode = async (barCode,quantity) => {
        try {

            return await fetch(`${baseURL}/api/product`,{
                method: 'POST',
                body: {
                    barCode,
                    quantity
                },
                headers:{
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                if (res.status >= 400) throw Error(`Error al traer articulo. Error ${res.status}`);
                return res.json();
            });

        } catch (error) {
            console.log(error);
        }
    };

    let calculateTotals = (quantity, price) => {

        totalArt += quantity;
        totalPric += price * quantity;

        totalArticles.textContent = formatter.format(totalArt);
        totalPrice.textContent = formatter.format(totalPric);

    }

    let renderRow = (articles, quantity) => {

        let { CODIGO, DESCRIPCION, PRECIO } = articles;

        let row = `
            <div class="tr" data-id="${CODIGO}" data-counter="${articleCounter}">
                <div class="td">${DESCRIPCION}</div>
                <div class="td text-center">${quantity}</div>
                <div class="td text-right">${formatter.format(PRECIO * quantity)}</div>
            </div>
        `;

        tableArticleBody.insertAdjacentHTML('afterbegin', row);

        calculateTotals(quantity, PRECIO);

    }

    let fillItemsToInvoice = (item) => {

        itemsToInvoice[articleCounter] = item;
        articleCounter++;

    }

    let changeDltBtnStatus = (condition) => {

        if (condition) {
            btnDelete.querySelector('i').classList.remove('fa-trash-can');
            btnDelete.querySelector('i').classList.add('fa-x');
            btnDelete.querySelector('span').textContent = 'Cancelar';
        } else {
            btnDelete.querySelector('i').classList.remove('fa-x');
            btnDelete.querySelector('i').classList.add('fa-trash-can');
            btnDelete.querySelector('span').textContent = 'Eliminar';
        }

    }

    let deleteArticleToInvoice = (counter) => delete itemsToInvoice[counter];

    let checkIfHaveMoreAsterisk = (input) => {

        let destructuringInput = input.split('');
        let counterFlag = 0;
        for (let i = 0; i < destructuringInput.length; i++) {
            if (destructuringInput[i] === '*') {
                counterFlag++;
            }
        }

        if (counterFlag > 1) {
            return true;
        }
        return false;
    }

    let showAcceptButton = () => {
        return new Promise((resolve, reject) => {
 
            modalUser.classList.add('show');

            btnAccept.addEventListener('click', e => {
                
                let hasEmptyValue = validateInput(modalUser);
                
                if(hasEmptyValue) return

                let userId = userSuperVisor.value;
                let pass = userPassword.value;
                
                let superVisorInfo = {
                    userId,
                    pass
                }
                
                fetch(`${baseURL}/api/user/validateSuperVisor`,{
                    method: 'POST',
                    body: JSON.stringify(superVisorInfo),
                    headers: { "Content-Type": "application/json" }
                })
                .then(res=>{ 
                    if(res.status >= 400){
                        console.log(res)
                        wrongPassword.style.opacity = 1;
                        userPassword.select();
                        return;
                    }
                        modalUser.classList.remove('show');
                        userPassword.textContent = "";
                        userSuperVisor.value = 0;
                        resolve(true);
                    }) 

            })

            btnCancel.addEventListener('click', e => {
                modalUser.classList.remove('show');
                resolve(false)
            })

        })
    }

    bar_code_input.addEventListener('change', async e => {

        let thisElement = e.target;
        if (thisElement.classList.contains('wrong-input'))
            thisElement.classList.remove('wrong-input');


        if (thisElement.value.startsWith('*')) {

            let hasMoreAsterisk = checkIfHaveMoreAsterisk(thisElement.value)

            if (hasMoreAsterisk) {
                console.log('Solo se acepta 1 asterisco');
                thisElement.classList.add('wrong-input');

                return;
            }

            quantity = (Number(thisElement.value.slice(1)) == 0)
                ? 1 :
                Number(thisElement.value.slice(1));
            thisElement.value = "";
            return;
        }

        thisElement.disabled = true;

        let article = await getArticleByBarcode(thisElement.value,quantity);
        console.log(article);
        if (article) {
            renderRow(article, quantity);
            fillItemsToInvoice(article);
            btnDelete.classList.remove('disable');
            btnSend.classList.remove('disable');
            quantity = 1;
            thisElement.value = "";
            thisElement.disabled = false;
            thisElement.focus()

        } else {
            thisElement.classList.add('wrong-input');
            thisElement.select();
            thisElement.disabled = false;
            thisElement.focus()
        }
    });

    btnDelete.addEventListener('click', async e => {


        if (btndltStatus == 'DELETE') {
            if (articlesSelected.length) {
                articlesSelected.forEach(article => {
                    // let attri = article.getAttribute('data-counter');
                    console.log(article)
                    deleteArticleToInvoice(article.getAttribute('data-counter'));
                    article.remove();
                });
            }

            tableArticle.classList.remove('select');

            changeDltBtnStatus(false);

            bar_code_input.classList.remove('disable');
            name_client.classList.remove('disable');
            btnSend.classList.remove('disable');
            btndltStatus = 'NORMAL';
            let list = tableArticleBody.querySelectorAll('.tr');

            if (!list.length) {
                btnDelete.classList.add('disable');
                btnSend.classList.add('disable');
            }

        } else {
            userSuperVisor.value = 0;
            userPassword.value = '';
            wrongPassword.style.opacity = 0;
            userSuperVisor.focus();

            let buttonResult = await showAcceptButton();

            if (buttonResult) {

                changeDltBtnStatus(true);

                tableArticle.classList.add('select');

                bar_code_input.classList.add('disable');
                name_client.classList.add('disable');
                btnSend.classList.add('disable');
                btndltStatus = 'DELETE';
            }
        }
 
    });

    btnInsert.addEventListener('click', e => {
        console.log('object')
        if (mode == 'NORMAL') {
            btnInsert.classList.add('disable');
            bar_code_input.disabled = false;
            name_client.disabled = false;
            bar_code_input.focus();

            mode = 'INSERT';
        }
    });

    btnSend.addEventListener('click', e => {
        let invoiceList = Object.entries(itemsToInvoice);
        let result = invoiceList.map(article => article[1])
        console.log(result);
    })

    tableArticleBody.addEventListener('click', e => {

        if (e.target.closest('.tr') && tableArticle.classList.contains('select')) {
            let row = e.target.closest('.tr');
            if (row.classList.contains('article-selected')) {
                row.closest('.tr').classList.remove('article-selected');
            } else {
                row.closest('.tr').classList.add('article-selected');
            }

            articlesSelected = tableArticleBody.querySelectorAll('.tr.article-selected');

            if (articlesSelected.length > 0) {
                changeDltBtnStatus(false);
            } else {
                changeDltBtnStatus(true);
            }
        }

    });

    userPassword.addEventListener('keydown',e=> {
        wrongPassword.style.opacity = 0;
        if(e.key == 'Enter'){
           btnAccept.click();
        }
    })

    document.addEventListener('change',e => {
        if(element.classList.contains('wrong-input')) removeWrongClass(e.target);
    })

    btnAccept.addEventListener('click', e => showAcceptButton('hide'))
    btnCancel.addEventListener('click', e => showAcceptButton('hide'))

})()