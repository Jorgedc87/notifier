const { Server } = require("socket.io");
const io = new Server({
    cors: {
        origin: "http://localhost:3000"
    }
});

// io.use((socket, next) => {
//     if(socket.handshake.auth.token === "admin"){
//         socket.data.isAdmin = true;
//     }

//     next();
// });

io.on("connection", socket => {
    console.log(socket.id);

    socket.on("disconnect", reason => {
        console.log(`Socket ${socket.id} disconnected, reason: ${reason}`);
    });
});


io.listen(3001);