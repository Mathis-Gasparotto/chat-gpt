import { Application } from 'express-ws'
import path from 'path'
import { getAllMessages, getAuthorNameByMessageId } from '../../repositories/chatRepository'
import { findUserById } from '../../repositories/userRepository'
import { authMiddleware } from '../middlewares/auth'

export function getChat(app: Application) {
  app.get('/chat', authMiddleware, async (req, res) => {
    const user = await findUserById(req.signedCookies.ssid)
    if (!user) {
      return
    }
    var messages = Array()
    try {
      const messagesDB = await getAllMessages()
      if (!messagesDB) {
        res.render(path.join(__dirname, '../views/messages.ejs'))
        return
      }
      messagesDB.forEach(async (message) => {
        let dataToPush = {
          author: await getAuthorNameByMessageId(message.id),
          isMe: false,
          content: message.content,
          createdAt: message.createdAt,
        }
        if (message.authorId === user.id) {
          dataToPush.isMe = true
        }
        messages.push(dataToPush)
      })
      setTimeout(function () {
        messages.sort(function (a, b) {
          return b.createdAt + a.createdAt
        })
        res.render(path.join(__dirname, '../views/chat.ejs'), { messages })
      }, 500) // add timeout to have time to get author name on DB
    } catch (e) {
      console.error(e)
      res.status(500).send('Internal Server Error')
    }
  })
}
