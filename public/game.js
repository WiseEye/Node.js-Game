const socket = io.connect('localhost:3000');
console.log(socket);
const canvas = document.getElementById('canvas');
const canvasContainer = document.getElementById('canvas-container');
const ctx = canvas.getContext('2d');

const p1button = document.getElementById('p1');
const p2button = document.getElementById('p2');

const chatContainer = document.getElementById('chat-container');
const chat = document.getElementById('chat');
const chatOutput = document.getElementById('chat-output');
const chatBox = document.getElementById('chat-box');
const chatSend = document.getElementById('chat-send');

const readyUp = document.getElementById('ready-up');

const nameContainer = document.getElementById('name-container');
const nameEntry = document.getElementById('name-entry');
const nameSubmit = document.getElementById('name-submit');

const conPlayers = document.getElementById('con-players');
const displayName = document.getElementById('display-name');

let userId = -1;
let userName = '';
let otherUsers = [];
let ready = false;

function sanitizeUserName(str) {
    const pattern = new RegExp('^\s*([0-9a-zA-Z]+)\s*$');
    return pattern.test(str);
}

function sanitizeMessage(str) {
    const pattern = new RegExp('^\s*([0-9a-zA-Z_ ]+)\s*$');
    return pattern.test(str);
}

nameSubmit.addEventListener('click', (e) => {
    const name = nameEntry.value;
    if (sanitizeUserName(name)) {
        socket.emit('name', name);
        nameContainer.style.display = 'none';
        chatContainer.style.display = 'block';
        nameEntry.value = '';
    }
});

socket.on('signin', (data) => {
    userId = data.userId;
    userName = data.userName;
    displayName.innerText = userName;
});

socket.on('newuser', (data) => {
    conPlayers.innerHTML += '<li id=' + data.userName + '>' + data.userName + '</li>';
    otherUsers.push(data);
});

chatSend.addEventListener('click', (e) => {
    const msg = chatBox.value;
    if (sanitizeMessage(msg)) {
        socket.emit('chat', msg);
        chatBox.value = '';
    }
});

socket.on('chat', (data) => {
    if (data.userId === userId) {
        chatOutput.innerHTML += '<h2 style="text-align: right;">' + 'you: ' + data.msg + '</h2>';
    } else {
        chatOutput.innerHTML += '<p>' + data.userName + ': ' + data.msg + '</p>';
    }
    
});

readyUp.addEventListener('click', (e) => {
    socket.emit('ready', ready);
});

socket.on('ready', (data) => {
    const tag = document.getElementById(data.userName);
    if (tag) {
        if (data.ready) {
            tag.style.backgroundColor = 'blue';
            tag.style.color = 'white';
        } else {
            tag.style.backgroundColor = '';
            tag.style.color = '#575ed8';
        }
    }

    if (data.userId === userId) {
        ready = data.ready;
        if (ready) {
            readyUp.innerText = 'Unready';
        } else {
            readyUp.innerText = 'Ready Up';
        }
    }
});

socket.on('begin', () => {
    chatContainer.style.display = 'none';
    init();
});


let player1 = {
    id: 0,
    x: 50,
    y: 50,
    xvel: 0,
    yvel: 0,
    vel: 5,
    color: 'red',
    radius: 25
};

let player2 = {
    id: 1,
    x: 200,
    y: 200,
    xvel: 0,
    yvel: 0,
    vel: 5,
    color: 'blue',
    radius: 25
};

let player = {};
let players = [player1, player2];

p1button.addEventListener('click', (e) => {
    player = player1;
});

p2button.addEventListener('click', (e) => {
    player = player2;
});

socket.on('move', (data) => {
    players[data.id].x = data.x;
    players[data.id].y = data.y;
})

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#cec8c8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.x += player.xvel;
    player.y += player.yvel;

    if (player.x) {
        socket.emit('move', {
            id: player.id,
            x: player.x,
            y: player.y
        });
    }

    for (let p in players) {
        ctx.beginPath();
        ctx.arc(players[p].x, players[p].y, players[p].radius, 0, 2 * Math.PI);
        ctx.fillStyle = players[p].color;
        ctx.fill();
        ctx.stroke();
    }
}


function init() {
    canvasContainer.style.display = 'block';
    setInterval(update, 1000/30);
    canvas.width = 800;
    canvas.height = 450;

    // w -> 87
    // a -> 65
    // s -> 83
    // d -> 68
    // space -> 32
    window.addEventListener('keydown', (e) => {
        if (e.keyCode === 87) {
            player.yvel = -player.vel;
        }
        if (e.keyCode === 65) {
            player.xvel = -player.vel;
        }
        if (e.keyCode === 83) {
            player.yvel = player.vel;
        }
        if (e.keyCode === 68) {
            player.xvel = player.vel;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.keyCode === 87) {
            player.yvel = 0;
        }
        if (e.keyCode === 65) {
            player.xvel = 0;
        }
        if (e.keyCode === 83) {
            player.yvel = 0;
        }
        if (e.keyCode === 68) {
            player.xvel = 0;
        }
    });
}


