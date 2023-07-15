(async ()=>{

    let login = document.getElementById('login');
    let username = document.getElementById('username');
    let password = document.getElementById('password'); 

    let baseURL = 'http://localhost:4551';
    
    let validateUser = async (userProfile) => {
      
        let userValiate;
//
        await fetch(`${baseURL}/api/user/validateSuperVisor`,{
            method: 'POST',
            body: JSON.stringify(userProfile),
            headers: { "Content-Type": "application/json" }
        })
        .then(res=>{
            if(res.status >= 400) {
                userValiate = false;
                throw Error('error al validar el usuario')
            }
            return res.json();
        })
        .then(res=>{
            console.log(res)
            userValiate = true;
        })

        return userValiate;
    }

    let getSupervisor = await fetch(`${baseURL}/api/user/superVisor`)
    .then(res => {
        if (res.status >= 400) throw Error('Error al traer los super visores');
        return res.json();
    })
    
    fillSelectSuperVisorSelect(getSupervisor,username);

    login.addEventListener('click',async e=>{
        e.preventDefault()

        let userInfo = {
            userId: username.value,
            passWord: password.value
        };
        let validateResult = await validateUser(userInfo);
        console.log(validateResult)
        if(validateResult){
            // window.location.href = './'
        }

    })

})()
