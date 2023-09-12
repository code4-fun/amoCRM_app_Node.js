import 'dotenv/config'
import Token from '../dao/Token.js'
import fetch from 'node-fetch'

class AmoCrmService {
  // fetches access token and refresh token and stores them to database
  async fetchToken(params){
    if(params.code){
      const response = await fetch(`${process.env.BASE_URL}/oauth2/access_token`, {
        method: 'POST',
        body: JSON.stringify({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "authorization_code",
          code: params.code,
          redirect_uri: process.env.REDIRECT_URI
        }),
        headers: {'Content-Type': 'application/json'}
      })
      const data = await response.json()
      await Token.deleteMany({})
      await Token.create({
        access_token: data.access_token,
        refresh_token: data.refresh_token
      })
    }
  }

  // updates or creates new contact and creates new lead for that contact
  async createLead(params){
    if(params.hasOwnProperty('name') && params.hasOwnProperty('email') && params.hasOwnProperty('phone')){
      let contacts = await this.findContacts(params.email)
      if(contacts){
        let contact = contacts.filter(el => {
          let field = el.custom_fields_values.find(item => item.field_name === 'Email')
          return field.values.find(item => item.value === params.email)
        })
        if(contact){
          let updatedContactId = await this.updateContact(contact[0], params)
          return await this.addLeadToContact(updatedContactId)
        }
      }
      contacts = await this.findContacts(params.phone)
      if(contacts){
        let contact = contacts.filter(el => {
          let field = el.custom_fields_values.find(item => item.field_name === 'Телефон')
          return field.values.find(item => item.value === params.phone)
        })
        if(contact){
          let updatedContactId = await this.updateContact(contact[0], params)
          return await this.addLeadToContact(updatedContactId)
        }
      }
      let createdContactId = await this.createContact(params)
      return await this.addLeadToContact(createdContactId)
    } else {
      throw new Error('query params are missing')
    }
  }

  // searches for the contact by query string (email or phone number in this case)
  async findContacts(queryString){
    const token = await Token.find()
    try{
      const response = await fetch(`${process.env.BASE_URL}/api/v4/contacts?${new URLSearchParams({
        query: queryString
      })}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token[0].access_token}`
        }
      })
      const json = await response.json()
      return json._embedded.contacts
    } catch(e){
      console.log(e)
    }
  }

  // creates new contact
  async createContact(params){
    const token = await Token.find()
    try{
      const response = await fetch(`${process.env.BASE_URL}/api/v4/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token[0].access_token}`
        },
        body: JSON.stringify([
          {
            name:  params.name,
            custom_fields_values: [
              {
                field_id: 2170621,
                values: [
                  {
                    value: params.phone,
                    enum_id: 4813175,
                  }
                ]
              },
              {
                field_id: 2170623,
                values: [
                  {
                    value: params.email,
                    enum_id: 4813187,
                  }
                ]
              }
            ]
          }
        ])
      })
      const json = await response.json()
      return json._embedded.contacts[0].id
    } catch(e){
      console.log(e)
    }
  }

  // updates contact
  async updateContact(contact, params){
    const token = await Token.find()
    try{
      const response = await fetch(`${process.env.BASE_URL}/api/v4/contacts`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token[0].access_token}`
        },
        body: JSON.stringify([
          {
            id: contact.id,
            name:  params.name,
            custom_fields_values: [
              {
                field_id: contact.custom_fields_values.find(item => item.field_name === 'Телефон').field_id,
                values: [
                  {
                    value: params.phone
                  }
                ]
              },
              {
                field_id: contact.custom_fields_values.find(item => item.field_name === 'Email').field_id,
                values: [
                  {
                    value: params.email
                  }
                ]
              }
            ]
          }
        ])
      })
      const json = await response.json()
      return json._embedded.contacts[0].id
    } catch(e){
      console.log(e)
    }
  }

  // creates a relationship between contact and lead
  async addLeadToContact(id){
    const token = await Token.find()
    try{
      const response = await fetch(`${process.env.BASE_URL}/api/v4/leads`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token[0].access_token}`
        },
        body: JSON.stringify([
          {
            _embedded: {
              contacts: [
                {
                  id: id
                }
              ]
            }
          }
        ])
      })
      const json = await response.json()
      return json._embedded.leads[0].id
    } catch(e){
      console.log(e)
    }
  }
}

export default new AmoCrmService()
