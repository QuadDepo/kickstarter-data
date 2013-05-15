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
		var creator = {};
		creator.avatar = $("#avatar a img").attr("src");
		creator.bio = "http://www.kickstarter.com"+$("#avatar a").attr("href");
		creator.name = $("#creator-name h5 a").html();
		creator.located = $("#creator-name p span a").html();

		return creator;
	}
};

/**********************************************************************************************************************/

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

PROJECT.prototype.timeLeft = function(callback) {
	var project = this;
	project.fields.push("timeLeft");
	if(callback==undefined){ return project; }
	else{ project.request(callback); }
};

PROJECT.prototype.pledged = function(callback) {
	var project = this;
	project.fields.push("pledged");
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

/**********************************************************************************************************************/

PROJECT.prototype.request = function(callback){
	var project = this;

	if(project.fields.length==0){
		callback("NO FIELDS REQUESTED", undefined);
	}
	else{
		request(project.url, function(err, res, body){
			if(err){
				callback(err, undefined);
			}
			else{
				var successes = {};
				var errors = {};

				var i = project.fields.length;
				while(i--){
					var datapoint = project.fields[i];
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
				project.fields = [];

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