const main = () => {
const socket = new WebSocket('ws://terrogram.ru:3779');

const log = document.getElementById("log");
const reg = document.getElementById("reg");
const exit = document.getElementById("exit");

const name = document.getElementById("login");
const password = document.getElementById("password");
const passRep = document.getElementById("passwordRep");
const back = document.getElementById("back");

const greeter = document.getElementById("userGreeter");

const type = document.getElementById("bottom");
const text = document.getElementById("write");

const Cur = {
    name: null,
};

const firstHundCopy = new Array();

const showMesg = (name, content, id) => {
    const mesArea = document.getElementById('mesArea');
    const mesHead = document.createElement('div');
    const mesBody = document.createElement('div');
    const mesCont = document.createElement('div');

    mesHead.className = 'mesAuthor';
    mesBody.className = 'mesBody';
    mesCont.className = 'mesContainer';

    
    if (Cur.name != name) {
        mesHead.innerHTML = name;
        Cur.name = name;
    }

    mesBody.innerHTML = content;

    if (id === auth.id) mesCont.classList.add('me');

    mesCont.appendChild(mesHead);
    mesCont.appendChild(mesBody);

    mesArea.appendChild(mesCont);
}

const placer = (arr) => {
    const mesArea = document.getElementById('mesArea');
    while (mesArea.children.length > 1) mesArea.removeChild(mesArea.lastChild);

    for (var i = 0; i < 100; i++) {
        showMesg(arr[i].name, arr[i].content, arr[i].id);
    }
}

socket.onmessage = () => {
    const data = JSON.parse(event.data);
    console.log(data);

    if (data.event === 'init') {        
        for (var i = 0; i < 100; i++) {
            showMesg(data.data.messages[i].name, data.data.messages[i].content, data.data.messages[i].userId);
            firstHundCopy.push({
                name: data.data.messages[i].name,
                content: data.data.messages[i].content,
                id: data.data.messages[i].userId,
            });
        }
    } else if (data.event === 'typing') {
        type.innerHTML = `${data.data.name} набирает сообщение...`;
    } else if (data.event === 'conversation') {
        const scrollDown = mesArea.scrollTop + mesArea.offsetHeight == mesArea.scrollHeight;

        showMesg(data.data.name, data.data.content, data.data.userId);
        firstHundCopy.shift();
        firstHundCopy.push({
            name: data.data.name,
            content: data.data.content,
            id: data.data.userId,
        });

        type.innerHTML = null;

        if (scrollDown) mesArea.scrollTop = mesArea.scrollHeight;
    } else if (data.event === 'auth') {
        if (data.data.success) {
            
        console.log(firstHundCopy);
            auth.id = data.data.id;
            placer(firstHundCopy);
            alert('Вы авторизованы');
            greeter.hidden = false;
            greeter.innerHTML = `Приветствую, ${auth.name}`;
            name.hidden = true;
            password.hidden = true;
            log.hidden = true;
            reg.hidden = true;
            exit.hidden = false;
        } else {
            alert('Неправильно введны имя или пароль');
        }
    } else if (data.event === 'reg') {
        if (data.data.success) {
            auth.id = data.data.id;
            placer(firstHundCopy);
            alert('Вы авторизованы');
            greeter.hidden = false;
            greeter.innerHTML = `Приветствую, ${regData.name}`;
            name.hidden = true;
            password.hidden = true;
            log.hidden = true;
            reg.hidden = true;
            passRep.hidden = true;
            exit.hidden = false;
            back.hidden = true;
        } else if (data.data.reason === 'name') {
            alert('Дебил слепой, сука, имя введи нормально');
        } else if (data.data.reason === 'password') {
            alert('Даже пароль нормально придумать не можешь');
        } else if (data.data.reason === 'taken') {
            alert(`Имя уже занято, попробуйте ${regData.name}1`);
        }else {
            alert('Что-то пошло не так :(');
        }
    } else if (data.event === 'exit') {
        alert('Вы вышли! (Жаль, что не в окно)');
            getLogMenu();
    }
}

var send = obj => {
    console.log('Просто создать функцию', obj);
};

socket.onopen = () => {    
    send = obj => socket.send(JSON.stringify(obj));
}

const textIt = val => {
    message.content = val;
    send(message);
    text.value = null;
}

const auth = {
    event: 'auth',
};

const regData = {
    event: 'reg',
};

const message = {
    event: 'conversation',
    content: 'Не получилось, не фортануло',
};

const exitData = {
    event: 'exit',
};

const login = () => {
    auth.name = name.value;
    auth.password = password.value;
    send(auth);

    name.value = null;
    password.value = null;
}

const register = () => {
    if (password.value === passRep.value) {
        regData.name = name.value;
        regData.password = password.value;
        send(regData);
    } else {
        alert('Пароли не совпадают');
        return;
    }
}

const getRegMenu = () => {
    log.hidden = true;
    passRep.hidden = false;
    back.hidden = false;

    name.placeholder = 'Имя - латинница с большой буквы';
    password.placeholder = 'Пароль'
    reg.innerHTML = 'Зарегистрироваться';

    reg.removeEventListener('click', getRegMenu);
    reg.addEventListener('click', register);
}

const getLogMenu = () => {
    greeter.hidden = true;
    name.hidden = false;
    password.hidden = false;
    reg.hidden = false;
    log.hidden = false;
    passRep.hidden = true;
    back.hidden = true;
    exit.hidden = true;
    
    auth.id = null;

    name.placeholder = 'Say your name';
    password.placeholder = 'Password or credit card number'
    reg.innerHTML = 'Регистрация';

    name.value = null;
    password.value = null;
    passRep.value = null;

    reg.removeEventListener('click', register);
    reg.addEventListener('click', getRegMenu);
}

log.addEventListener('click', login);
reg.addEventListener('click', getRegMenu);
back.addEventListener('click', getLogMenu);
exit.addEventListener('click', () => send(exitData));

text.addEventListener('keypress', event => {
    if (event.key == 'Enter') {
        const content = text.value;
        if (content) {
            textIt(content);
        } else return;
    } else return;
});
}

document.addEventListener('DOMContentLoaded', main);