import socketio

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins="*",

)
@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

@sio.event
async def join_room(sid, data):
    """Join any room for updates"""
    print("************",data)
    room_type = data.get('room_type', 'restaurant')
    room_id = data.get('room_id', 'default')
    
    room_name = f"{room_type}_{room_id}"
    await sio.enter_room(sid, room_name)
    print(f"Client {sid} joined {room_name}")