var reqpromise = require('request-promise');

function register(value, keys,  baseurl) {
	let uri = baseurl + "register/";
	var options = {
	    method: 'POST',
	    uri: uri,
			headers: {
				'Accept':'application/json',
			  'X-API-Key': keys
	 },
	    body: {
	    	"hashes" : value
	    },
	    json: true
	};

	return reqpromise(options)
	    .then(function (obj) {
			// console.dir(obj);
	    	return obj.documents;
	    })
	    .catch(function (err) {
	    	console.log("ERROR!: " + err);
	    	let retval = { "result" : "failed - blame Olaf"};
	    	return retval;
	});
}
exports.register = register;