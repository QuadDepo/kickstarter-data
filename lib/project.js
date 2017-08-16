const request = require("request");
const end_points = require('./end_points');
const api = require('./requests');

var PROJECT = function(options){
	this.url = options!=undefined ? options.url || undefined : undefined;
	this.fields = options!=undefined ? options.fields || [] : [];

	if(typeof options=="string"){
		this.url = options;
	}
}

var end_urls = [
	'updates',
	'faqs',
	'description'
]

/**********************************************************************************************************************/

PROJECT.prototype.backers = function(callback) {
	var project = this;
	project.fields.push("backers");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.creator = function(callback) {
	var project = this;
	project.fields.push("creator");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.posterUrl = function(callback) {
	var project = this;
	project.fields.push("posterUrl");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.startTime = function(callback) {
	var project = this;
	project.fields.push("startTime");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.duration = function(callback) {
	var project = this;
	project.fields.push("duration");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.daysLeft = function(callback) {
	var project = this;
	project.fields.push("daysLeft");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.pledged = function(callback) {
	var project = this;
	project.fields.push("pledged");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.pledgeGoal = function(callback) {
	var project = this;
	project.fields.push("pledgeGoal");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.currency = function(callback){
	var project = this;
	project.fields.push("currency");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
}

PROJECT.prototype.endTime = function(callback){
	var project = this;
	project.fields.push("endTime");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
}

PROJECT.prototype.all = function(callback){
	var project = this;
	for (var endpoints in end_points) {
		project.fields.push(endpoints)
	}
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
}

/**********************************************************************************************************************/

PROJECT.prototype.request = function(callback){
	var project = this;
	var data = ''
	if (true) {

	}

	if(project.fields.length==0){
		callback("NO FIELDS REQUESTED", undefined);
	}
	else{
		Promise.all([
			api(project.url + 'updates'),
			api(project.url + 'faqs'),
			api(project.url + 'description'),
		]).then((val => {
		  console.log(val[1]);
		}))


		


		// request(project.url, function(err, res, body){
		// 	if(err){
		// 		callback(err, undefined);
		// 	}
		// 	else{
		// 		var successes = {};
		// 		var errors = {};
		//
		// 		var i = project.fields.length;
		// 		while(i--){
		// 			var datapoint = project.fields[i];
		// 			if(end_points[datapoint]!=undefined){
		// 				try{
		// 					successes[datapoint] = end_points[datapoint](body);
		// 				}
		// 				catch(e){
		// 					successes[datapoint] = undefined;
		// 					errors[datapoint] = e;
		// 				}
		// 			}
		// 			else{
		// 				successes[datapoint] = undefined;
		// 				errors[datapoint] = "NOT A VALID DATAPOINT";
		// 			}
		// 		}
		// 		project.fields = [];
		// 		data = successes
		// 		if(Object.keys(errors).length==0){
		// 			callback(undefined, data);
		// 		}
		// 		else{
		// 			callback(errors, successes);
		// 		}
		//
		// 	}
		// });
	}
}


module.exports = PROJECT;
