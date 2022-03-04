module.exports = (io) => {
  const {generateMessage} = require('../utils/socket/messages')
  const { addUser, removeUser, getUser, getUsersInRoom} = require('../utils/socket/users')

  io.on('connection', (socket) =>{
    // console.log('소켓 연결')
  
    socket.on('join',(options, callback)=>{
      const {error, user} = addUser({ id:socket.id, ...options })
      
      if(error){
        return callback(error)
      }
  
      socket.join(user.room)
  
      // socket.emit('message', generateMessage('Admin', {
      //     content: '환영합니다. 대화를 자유롭게 하세요!',
      //     _id:'admin1234',
      //     senderId:'admin1234'
      //   }) 
      // )
      socket.broadcast.to(user.room).emit(
        'message', 
        generateMessage('Admin', {
          content:`${user.username}님이 입장하였습니다.!`,
          _id:'admin1234',
          senderId:'admin1234'
        })
      )
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
  
      callback()
    })
  
    socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id)
      
      
      io.to(user.room).emit('message', generateMessage(user.username, message))
      callback()
    })
  
    socket.on('disconnect', () =>{
      const user = removeUser(socket.id)
  
      if(user){
        io.to(user.room).emit('message', generateMessage('Admin', {
          content: `${user.username}님이 떠났습니다!`,
          _id: 'admin1234',
          senderId:'admin1234'
        }))
        io.to(user.room).emit('roomData',{
          room: user.room,
          users: getUsersInRoom(user.room)
        })
        // console.log('나갓음')
      }
    })
  })
}