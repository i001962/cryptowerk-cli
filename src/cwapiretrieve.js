var reqpromise = require('request-promise');

function retrieve(value, keys, baseurl) {
	let uri = baseurl + "verify/";
	var options = {
	    method: 'POST',
	    uri: uri,
			headers: {
				'Accept':'application/json',
			  'X-API-Key': keys
	 },
	    body: {
	    	"retrievalIds" : value
	    },
	    json: true
	};

	return reqpromise(options)
	    .then(function (obj) {
	    	return obj;
	    })
	    .catch(function (err) {
	    	console.log("ERROR!: " + err);
	    	let retval = { "result" : "failed - blame Olaf"};
	    	return retval;
	});
}
exports.retrieve = retrieve;
