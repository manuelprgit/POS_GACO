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

    let itemsToInvoice = {};
    let articleCounter = 0;
    let articlesSelected = [];

    let totalArt = 0;
    let totalPric = 0;

    let mode = 'NORMAL';
    let btndltStatus = 'NORMAL';

    let articles;
    await fetch('http://localhost:3000/articulos')
        .then(res => {
            if (res.status >= 400) 'Arror al traer los articulos';
            return res.json();
        })
        .then(res => {
            articles = res;
        })


    let getArticleById = (barCode) => articles.find(art => art.codigoBarra == barCode);

    let calculateTotals = (quantity, price) => {

        totalArt += quantity;
        totalPric += price;

        totalArticles.textContent = formatter.format(totalArt);
        totalPrice.textContent = formatter.format(totalPric);

    }

    let renderRow = (articles) => {

        let { ID, descripcion, precio } = articles;
        let row = `
            <div class="tr" data-id="${ID}" data-counter="${articleCounter}">
                <div class="td">${descripcion}</div>
                <div class="td text-center">1</div>
                <div class="td text-right">${formatter.format(precio)}</div>
            </div>
        `;

        tableArticleBody.insertAdjacentHTML('afterbegin', row);

        //TODO: Ver en donde poner la calculadora.
        calculateTotals(1, precio);

    }

    let fillItemsToInvoice = (item) => {

        itemsToInvoice[articleCounter] = item;
        articleCounter++; 

    }

    let changeDltBtnStatus = (condition) => {

        if(condition){
            btnDelete.querySelector('i').classList.remove('fa-trash-can');
            btnDelete.querySelector('i').classList.add('fa-x');
            btnDelete.querySelector('span').textContent = 'Cancelar';
        }else{
            btnDelete.querySelector('i').classList.remove('fa-x');
            btnDelete.querySelector('i').classList.add('fa-trash-can');
            btnDelete.querySelector('span').textContent = 'Eliminar';
        }
      
    }

    let deleteArticleToInvoice = (counter) => delete itemsToInvoice[counter];

    bar_code_input.addEventListener('change', e => {

        let article = getArticleById(e.target.value)

        if (article) {
            e.target.value = "";
            renderRow(article);
            fillItemsToInvoice(article);
            btnDelete.classList.remove('disable');
            btnSend.classList.remove('disable');
        } else { 
            e.target.select();
        }
    });

    btnDelete.addEventListener('click', e => { 
        
        if(btndltStatus == 'DELETE'){
             console.log(articlesSelected)
            if(articlesSelected.length){
                articlesSelected.forEach(article =>{
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

            if(!list.length){
                btnDelete.classList.add('disable');
                btnSend.classList.add('disable');
            }

        }else{

            changeDltBtnStatus(true);
            
            tableArticle.classList.add('select');
            
            bar_code_input.classList.add('disable');
            name_client.classList.add('disable');
            btnSend.classList.add('disable');
            btndltStatus = 'DELETE';

        }

        // deleteArticleToInvoice(articleCounter);
        // console.log(itemsToInvoice)
    });

    btnInsert.addEventListener('click',e=>{
        
        if(mode == 'NORMAL'){
            btnInsert.classList.add('disable');     
            bar_code_input.disabled = false;
            name_client.disabled = false;
            bar_code_input.focus();

            mode = 'INSERT';
        }
    });

    btnSend.addEventListener('click',e=>{
        let invoiceList = Object.entries(itemsToInvoice); 
        let result = invoiceList.map(article=> article[1])
        console.log(result);
    })

    tableArticleBody.addEventListener('click',e=>{ 

        if(e.target.closest('.tr') && tableArticle.classList.contains('select')){
            let row = e.target.closest('.tr');
            if(row.classList.contains('article-selected')){
                row.closest('.tr').classList.remove('article-selected');
            }else{
                row.closest('.tr').classList.add('article-selected');
            } 
            
            articlesSelected = tableArticleBody.querySelectorAll('.tr.article-selected');
            
            if(articlesSelected.length > 0){
                changeDltBtnStatus(false);
            }else{
                changeDltBtnStatus(true);
            }
        }

    });

})()