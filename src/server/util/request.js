const axios = require("axios")

module.exports = {
    requestGet: function(url, params) {
        return axios.get(url, {params}) // get 
    }
}