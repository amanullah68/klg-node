
var request = require('request');

var authenticateApi = {'email':'triterras@gmail.com','password':'triterras123'};
// var TEST_NET_API_URL = 'http://blockchainadaptor.mwancloud.com:3002/';
var TEST_NET_API_URL = 'http://localhost:3002/';
var AuthToken = "";

console.log('postToApi........');
const postToApi1 = {
    postToApi: (api_endpoint, json_data, callback) => {

    if (AuthToken === ""){
        console.log('postToApi111111111........');
        request.post({
            url: TEST_NET_API_URL+"login",
            headers: {'Content-Type': 'application/json'},
            form: authenticateApi
        }, 
        function (error, response, body) {
            if (error) return callback(error);
            if (typeof body === 'string') {
                console.log('body.........', body);
                body = JSON.parse(body);
                AuthToken = 'Bearer ' + body.accessToken;
                console.log(AuthToken);
                request.post({
                    url: TEST_NET_API_URL+api_endpoint,
                    headers: {'Content-Type': 'application/json','authorization':AuthToken},
                    form: json_data
                }, 
                function (error, response, body2) {
                    if (error){ AuthToken = ""; return callback(error);}
                    if (typeof body2 === 'string') {
                        console.log(body2);
                        body2 = JSON.parse(body2);
                    }
                    return callback(null, body2);
                });
            }
            
            
        });
    }
    
    else{
    
        request.post({
            url: TEST_NET_API_URL+api_endpoint,
            headers: {'Content-Type': 'application/json','authorization':AuthToken},
            form: json_data
        }, 
        function (error, response, body) {
            if (error) return callback(error);
            if (typeof body === 'string') {
                body = JSON.parse(body);
            }
            return callback(null, body);
        });
    }
    }
}
module.exports = postToApi1;
module.postToApi