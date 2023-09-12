import AmoCrmService from "../service/AmoCrmService.js"

class AppController {
  async auth(req, res) {
    try {
      await AmoCrmService.fetchToken(req.query)
      res.status(201).json('success')
    } catch (e) {
      res.status(500).json(e)
    }
  }

  async createLead(req, res) {
    try {
      const params = await AmoCrmService.createLead(req.query)
      res.status(201).json(params)
    } catch (e) {
      res.status(500).json(e)
    }
  }
}

export default new AppController()
