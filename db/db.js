const {connect} = require('mongoose')

function dbConnexion() {
    /*mongodb+srv://aprouxdev:FQ%5Ed!ARoMS4r@cluster0.mi9qhky.mongodb.net/authentication*/ 
    /* old : mongodb+srv://aprouxdev:FQ^d!ARoMS4r@cluster0.mi9qhky.mongodb.net/authentication*/
    connect('mongodb+srv://aprouxdev:FQ%5Ed!ARoMS4r@cluster0.mi9qhky.mongodb.net/authentication')
    .then(() => console.log("Connexion base de donnée"))
    .catch(error => console.log(error))
}

module.exports = dbConnexion