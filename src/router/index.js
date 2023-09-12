import {Router} from 'express'
import AppController from '../controller/AppController.js'

const router = Router()

router.get('/auth', AppController.auth)
router.get('/leads', AppController.createLead)

export default router
