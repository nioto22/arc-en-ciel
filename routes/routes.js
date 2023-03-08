const passport = require('passport')
const {Router} = require('express')

const {connexion, inscription, startup} = require('../controllers/ctrl')
const router = Router()

//WEB SITE CONST
const SITE_ACCUEIL = '/accueil'
const SITE_PLANNING = '/planning'
const SITE_PARAMETERS = '/parametres'
const SITE_CONTACT = '/contacts'

//API CONST
const API_INSCRIPTION = '/inscription'
const API_CONNEXION = '/connexion'
const API_STARTUP = '/startup'


/** SITE WEB */
router.get('/', (req, res) => {
    const templateData = {
        title: "Arc en Ciel Home", 
        title_h1 : "Bienvenue sur le planning d'Arc en Ciel du Genevois",
        hasNavigation : false,
        styles: ["connexion.css"]
    }
    res.render("connexion", templateData)
})

router.get(SITE_ACCUEIL, (req, res) => {
     headerConst = {
        hasNavigation : true,
        title: "Arc en Ciel Home", 
        title_h1 : "Home"
    }
    res.render("accueil", headerConst)
})
router.get(SITE_PLANNING, (req, res) => {
    const headerConst = {
        hasNavigation : true,
        title: "Arc en Ciel Planning", 
        title_h1 : "Planning",
        styles: ["planning.css"]
    }
    res.render("planning", headerConst)
})
router.get(SITE_PARAMETERS, (req, res) => {
    const headerConst = {
        hasNavigation : true,
        title: "Arc en Ciel Paramètres", 
        title_h1 : "Paramètres"
    }
    res.render("settings", headerConst)
})
router.get(SITE_CONTACT, (req, res) => {
    const headerConst = {
        hasNavigation : true,
        title: "Arc en Ciel Contacts", 
        title_h1 : "Contacts"
    }
    res.render("contacts", headerConst)
})



/** END SITE WEB */


/** API */

router.post('/connexion', connexion)
router.post('/inscription', inscription)
router.get('/startup', startup)

// This line to protect with jwt
router.use(passport.authenticate("jwt", {session : false}))
// ** All routes above are protected




/** END API */

module.exports = router

