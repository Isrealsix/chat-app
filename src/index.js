const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');
const {
	addUser,
	getUser,
	getUsersInRoom,
	removeUser,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on('connection', socket => {
	console.log('Thank God for life!!!');

	socket.on('join', (data, callback) => {
		const { error, user } = addUser({ id: socket.id, ...data });
		if (error) {
			return callback(error);
		}
		socket.join(user.room);
		socket.emit(
			'sendEvery',
			generateMessage('Admin', `Welcome home ${user.username}`)
		);
		socket.broadcast
			.to(user.room)
			.emit(
				'sendEvery',
				generateMessage('Admin', `${user.username} has joined`)
			);

		io.to(user.room).emit('roomData', {
			room: user.room,
			users: getUsersInRoom(user.room),
		});
	});

	socket.on('msg', (data, callback) => {
		const filter = new Filter();
		const user = getUser(socket.id);
		if (filter.isProfane(data)) {
			return socket.emit(
				'sendEvery',
				generateMessage('Admin', `Your message: '${data}' contains bad word`)
			);
		}
		io.to(user.room).emit('sendEvery', generateMessage(user.username, data));
		callback();
	});

	socket.on('greenEarth', (data, respLoc) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			'location',
			generateLocation(
				user.username,
				`https://google.com/maps?q=${data.latitude},${data.longitude}`
			)
		);
		respLoc('Location Shared!!!');
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				'sendEvery',
				generateMessage('Admin', user.username + ' has left!')
			);
			io.to(user.room).emit('roomData', {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Pegasus is alive on port ${port}`);
});
