const socket = io();

let btn = document.getElementById('increment');
const $messageForm = document.querySelector('#sendmsg');
const $messageInput = document.querySelector('input');
const $sendBtn = document.querySelector('#send-btn');
const $result = document.querySelector('#result');
const $locationBtn = document.querySelector('#location-btn');
const $messageFace = document.querySelector('#message-face');
const $linkFace = document.querySelector('#link-face');

// Template
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $linkTemplate = document.querySelector('#link-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const displayMessages = msg => {
	const newh1 = document.createElement('h1');
	newh1.innerText = msg;
	$result.prepend(newh1);
};
const autoScroll = () => {
	//last message
	const newMessage = $messageFace.lastElementChild;

	// height of the new message
	const newMessageStyles = getComputedStyle(newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
	// Visible Height
	const visibleHeight = $messageFace.offsetHeight;

	// Height of messages Container
	const containerHeight = $messageFace.scrollHeight;

	// How far I've scrolled
	const scrollOffset = $messageFace.scrollTop + visibleHeight;

	// Added 250 to newMessageHeight to make it better!
	const exxag = newMessageHeight + 250;
	if (containerHeight - exxag <= scrollOffset) {
		$messageFace.scrollTop = $messageFace.scrollHeight;
	}
};

$messageForm.addEventListener('submit', ev => {
	ev.preventDefault();
	$sendBtn.setAttribute('disabled', 'disabled');
	let msg = ev.target.elements.msg.value;
	$messageInput.value = '';
	$messageInput.focus();
	$sendBtn.removeAttribute('disabled');
	socket.emit('msg', msg, resp => {
		if (resp) return displayMessages(resp);
	});
});
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});
socket.on('sendEvery', data => {
	// displayMessages(data);
	const html = Mustache.render($messageTemplate, {
		username: data.username,
		message: data.message,
		createdAt: moment(data.createdAt).format('h:mm a'),
	});
	$messageFace.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	document.querySelector('#sidebar').innerHTML = html;
});

socket.on('location', data => {
	// displayMessages(`<a href="https://google.com/maps?q=${msg.longitude},${msg.latitude}">Locateion</a>`);
	const html = Mustache.render($linkTemplate, {
		username: data.username,
		location: data.url,
		createdAt: moment(data.createdAt).format('h:mm a'),
	});
	$messageFace.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.emit('join', { username, room }, error => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});

$locationBtn.addEventListener('click', () => {
	$locationBtn.setAttribute('disabled', 'disabled');
	if (!navigator.geolocation) {
		return alert("Your browser isn't supported");
	}

	navigator.geolocation.getCurrentPosition(position => {
		socket.emit(
			'greenEarth',
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			respLoc => {
				console.log(respLoc);
				$locationBtn.removeAttribute('disabled');
			}
		);
	});
});
// $messageForm.addEventListener('submit', ev => {
// 	ev.preventDefault();
// 	const val = msgBox.value;
// 	msgBox.value = '';
// 	socket.emit('userMessage', val);
// });
// socket.on('countness', data => {
// 	$result.innerText = data;
// });

// btn.addEventListener('click', () => {
// 	socket.emit('increment');
// });

// socket.on('countUpdate', data => {
// 	$result.innerText = data;
// });

// socket.on('sendAll', data => {
// 	$result.insertAdjacentText('afterend', data);
// });
