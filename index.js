import express from 'express'
import mongoose from 'mongoose'
import router from './src/router/index.js'
import 'dotenv/config'

const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use('/api', router)

const startApp = async () => {
  try{
    await mongoose.connect(process.env.DB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
    app.listen(PORT, () => console.log('started'))
  } catch(e){
    console.log(e)
  }
}

startApp()
