import mongoose from 'mongoose'

const Token = new mongoose.Schema({
  access_token: {type: String, required: true},
  refresh_token: {type: String, required: false},
})

export default mongoose.model('Token', Token)
