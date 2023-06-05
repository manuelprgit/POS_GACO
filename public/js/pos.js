(async () => {

    let tableArticleBody = document.getElementById('tableArticleBody');
    let bar_code_input = document.getElementById('bar_code_input');
    bar_code_input.focus();
    let totalArticles = document.getElementById('totalArticles');    
    let totalPrice = document.getElementById('totalPrice');
    let btnInsert = document.getElementById('btnInsert');
    let btnDelete = document.getElementById('btnDelete');
    let btnSend = document.getElementById('btnSend');

    let itemsToInvoice = {};
    let articleCounter = 0;

    let totalArt = 0;
    let totalPric = 0;

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

    let calculateTotals = (quantity,price) => {

      totalArt += quantity;
      totalPric += price;

      totalArticles.textContent = totalArt;
      totalPrice.textContent = totalPric;
      
    }

    let renderRow = (articles) => { 
        
        let {ID, descripcion, precio} = articles;
        let row = `
            <div class="tr" data-id="${ID}">
                <div class="td">${descripcion}</div>
                <div class="td text-center">1</div>
                <div class="td text-right">${precio}</div>
            </div>
        `;

        tableArticleBody.insertAdjacentHTML('afterbegin',row);

        //TODO: Ver en donde poner la calculadora.
        calculateTotals(1,precio);

    }

    let fillItemsToInvoice = (item) => {
      
        itemsToInvoice[articleCounter] = item;
        articleCounter++;
        console.log(itemsToInvoice);

    }

    let deleteArticleToInvoice = (counter) => {
        console.log('delete')
        console.log(itemsToInvoice[counter])    
        delete itemsToInvoice[counter];
    }

    bar_code_input.addEventListener('change', e => {

        let article = getArticleById(e.target.value)

        if (article) {  
            e.target.value = "";
            renderRow(article);
            fillItemsToInvoice(article);
        } else {
            console.log('Articulo no encontrado')
            e.target.select();
        }
    })

    btnDelete.addEventListener('click',e=>{
        deleteArticleToInvoice(articleCounter);
        console.log(itemsToInvoice)
    })

})()