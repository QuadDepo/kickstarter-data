var request = require("request");
var cheerio = require("cheerio");
var crypto = require('crypto');

var PROJECT = function(options){
	this.url = options!=undefined ? options.url || undefined : undefined;
	this.fields = options!=undefined ? options.fields || [] : [];

	if(typeof options=="string"){
		this.url = options;
	}
}

/**********************************************************************************************************************/

PROJECT.prototype.resetFields = function(fields){
	var project = this;
	project.fields = fields || [];
	return project;
}

/**********************************************************************************************************************/

var end_points = {
	pledged: function(html){
		var $ = cheerio.load(html);
		return $("#pledged").attr("data-pledged");
	},
	goal: function(html){
		var $ = cheerio.load(html);
		var goal = $("#pledged").attr("data-goal");
		return parseFloat(goal);
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

		var currency = end_points.currency(html);

		var $ = cheerio.load(html);
		var gifts = $("#what-you-get li");
		var numGifts = gifts.length;
		
		var gift = gifts.first();
		var data = [];
		while(numGifts--){
			var reward = {};

			//GET THE NEEDED DONATION AMT
			var valueTitle = gift.find("h5").text();
			var valueWorthStart = valueTitle.indexOf(currency)+1;
			var valueWorth = valueTitle.substring(valueWorthStart,valueTitle.indexOf(" ", valueWorthStart));
			valueWorth = valueWorth.replace(/,/g, "");
			reward.minPledged = parseInt(valueWorth);

			reward.desc = gift.find(".desc").text();

			reward.numBackers = parseInt(gift.find(".num-backers").text().replace(/[^0-9]/g, ""));

			var limitText = gift.find(".limited").text();
			var soldText = gift.find(".sold-out");

			if(limitText!=""){
				reward.isLimited = true;
				reward.soldOut = false;
				reward.maxBackers = parseInt(limitText.substring(limitText.indexOf("of ")).replace(/[^0-9]/g, ""));
			}
			else if(soldText.length>0){
				reward.isLimited = true;
				reward.soldOut = true;
				reward.maxBackers = reward.numBackers;
			}
			else{
				reward.isLimited =  false;
				reward.soldOut = false;
				reward.maxBackers = 0;
			}

			var md5 = crypto.createHash('md5');
			md5.update(valueTitle);
			md5.update(reward.desc);

			reward._id = md5.digest('hex');
			
			data[numGifts] = reward;
			gift = gift.next();
		}

		return data;
	}
}

/**********************************************************************************************************************/

PROJECT.prototype.doField = function(field, callback){
	var project = this;
	if(callback==undefined){
		project.fields.push(field);
	}
	else{
		var fields = project.fields.slice(0);
		fields.push(field);
		project.request(fields, callback);
	}
	return project;
}

PROJECT.prototype.rewards = function(callback) {
	var project = this;
	return project.doField("rewards", callback);
}

PROJECT.prototype.backers = function(callback) {
	var project = this;
	return project.doField("backers", callback);
}

PROJECT.prototype.creator = function(callback) {
	var project = this;
	return project.doField("creator", callback);
}

PROJECT.prototype.posterUrl = function(callback) {
	var project = this;
	return project.doField("posterUrl", callback);
}

PROJECT.prototype.startTime = function(callback) {
	var project = this;
	return project.doField("startTime", callback);
}

PROJECT.prototype.duration = function(callback) {
	var project = this;
	return project.doField("duration", callback);
}

PROJECT.prototype.timeLeft = function(callback) {
	var project = this;
	return project.doField("timeLeft", callback);
}

PROJECT.prototype.pledged = function(callback) {
	var project = this;
	return project.doField("pledged", callback);
}

PROJECT.prototype.goal = function(callback){
	var project = this;
	return project.doField("goal", callback);
}

PROJECT.prototype.currency = function(callback){
	var project = this;
	return project.doField("currency", callback);
}

PROJECT.prototype.endTime = function(callback){
	var project = this;
	return project.doField("endTime", callback);
}

/**********************************************************************************************************************/

PROJECT.prototype.request = function(fields, callback){
	var project = this;

	if(typeof fields == "function"){
		callback = fields;
		fields = project.fields;
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