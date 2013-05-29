var request = require("request");
var cheerio = require("cheerio");

var PROJECT = function(options){
	this.url = options!=undefined ? options.url || undefined : undefined;
	this.fields = options!=undefined ? options.fields || [] : [];

	if(typeof options=="string"){
		this.url = options;
	}
}

/**********************************************************************************************************************/

var end_points = {
	pledged: function(html){
		var $ = cheerio.load(html);
		return $("#pledged").attr("data-pledged");
	},
	currency: function(html){
		var $ = cheerio.load(html);
		var currency = $("#pledged data").attr("data-currency");

		if(currency=="GBP"){
			currency = "£";
		}
		else if(currency=="USD"){
			currency = "$";
		}

		return currency;
	},
	endTime: function(html){
		var $ = cheerio.load(html);
		var endtime = $("#project_duration_data").attr("data-end_time");
		var date = new Date(endtime);
		return date.getTime();
	},
	duration: function(html){
		var $ = cheerio.load(html);
		var day = 1000*60*60*24;
		var duration = parseFloat($("#project_duration_data").attr("data-duration"))*day;
		return duration;
	},
	timeLeft: function(html){
		var $ = cheerio.load(html);
		var hour = 1000*60*60;
		var hours_left = parseInt(parseFloat($("#project_duration_data").attr("data-hours-remaining"))*hour);
		return hours_left;
	},
	startTime: function(html){
		var endTime = end_points.endTime(html);
		var duration = end_points.duration(html);
		return endTime - duration;
	},
	posterUrl: function(html){
		var $ = cheerio.load(html);
		return $("#video-section .video-player").attr("data-image");
	},
	creator: function(html){
		var $ = cheerio.load(html);
		var creator = {}
		creator.avatar = $("#avatar a img").attr("src");
		creator.bio = "http://www.kickstarter.com"+$("#avatar a").attr("href");
		creator.name = $("#creator-name h5 a").html();
		creator.located = $("#creator-name p span a").html();

		return creator;
	},
	backers: function(html){
		var $ = cheerio.load(html);
		return $("#backers_count").attr("data-backers-count");
	},
	rewards: function(html){
		var $ = cheerio.load(html);
		var gifts = $("#what-you-get li");
		var numGifts = gifts.length;
		
		var gift = gifts.first();
		var data = [];
		while(numGifts--){
			data[numGifts] = gift.find("h5").text();
			gift = gift.next();
		}

		return data;
	}
}

/**********************************************************************************************************************/

PROJECT.prototype.rewards = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("rewards");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		console.log("PRE PROJECT", project.fields);
		console.log("PRE FIELDS", fields);
		fields.push("rewards");
		console.log("POST PROJECT", project.fields);
		console.log("POST FIELDS", fields);
		project.request(fields, callback);
	}
}

PROJECT.prototype.backers = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("backers");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("backers");
		project.request(fields, callback);
	}
}

PROJECT.prototype.creator = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("creator");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("creator");
		project.request(fields, callback);
	}
}

PROJECT.prototype.posterUrl = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("posterUrl");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("posterUrl");
		project.request(fields, callback);
	}
}

PROJECT.prototype.startTime = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("startTime");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("startTime");
		project.request(fields, callback);
	}
}

PROJECT.prototype.duration = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("duration");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("duration");
		project.request(fields, callback);
	}
}

PROJECT.prototype.timeLeft = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("timeLeft");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("timeLeft");
		project.request(fields, callback);
	}
}

PROJECT.prototype.pledged = function(callback) {
	var project = this;
	if(callback==undefined){
		project.fields.push("pledged");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("pledged");
		project.request(fields, callback);
	}
}

PROJECT.prototype.currency = function(callback){
	var project = this;
	if(callback==undefined){
		project.fields.push("currency");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("currency");
		project.request(fields, callback);
	}
}

PROJECT.prototype.endTime = function(callback){
	var project = this;
	if(callback==undefined){
		project.fields.push("endTime");
		return project; 
	}
	else{
		var fields = project.fields.slice(0);
		fields.push("endTime");
		project.request(fields, callback);
	}
}

/**********************************************************************************************************************/

PROJECT.prototype.request = function(fields, callback){
	var project = this;

	if(typeof fields == "function"){
		callback = fields;
		fields = project.fields;
		project.fields = [];
		console.log(fields.length-project.fields.length);
	}

	if(fields.length==0){
		callback("NO FIELDS REQUESTED", undefined);
	}
	else{
		request(project.url, function(err, res, body){
			if(err){
				callback(err, undefined);
			}
			else{
				var successes = {}
				var errors = {}

				var i = fields.length;
				while(i--){
					var datapoint = fields[i];
					if(end_points[datapoint]!=undefined){
						try{
							successes[datapoint] = end_points[datapoint](body);
						}
						catch(e){
							successes[datapoint] = undefined;
							errors[datapoint] = e;
						}
					}
					else{
						successes[datapoint] = undefined;
						errors[datapoint] = "NOT A VALID DATAPOINT";
					}
				}

				if(Object.keys(errors).length==0){
					callback(undefined, successes);
				}
				else{
					callback(errors, successes);
				}

			}
		});
	}
}


module.exports = PROJECT;