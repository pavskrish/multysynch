const router = require('express').Router()

const gmailAuth = require('../controllers/gmailauth.controller')

router.get('/', (_, res) => {
    res.render('pages/auth');
})

router.get('/google', (_, res) => {
    const authUrl = gmailAuth.generateAuthUrl()

    res.redirect(authUrl)
})

router.get('/google/callback', (req, res) => {
    const code = req.query.code
    gmailAuth.saveTokensFromCode(code)

    res.redirect('/')
})

module.exports = router