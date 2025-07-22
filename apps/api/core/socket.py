import socketio

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*"
)


@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event  
async def join_mess(sid, data):
    mess_id = data['mess_id']
    await sio.enter_room(sid, f"mess_{mess_id}")
    await sio.emit('joined', {'mess_id': mess_id}, room=sid)

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")