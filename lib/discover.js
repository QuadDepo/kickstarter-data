var request = require("request");
var cheerio = require("cheerio");

var BASE_URL = "http://www.kickstarter.com/discover";

var DISCOVER = function(options){
	this.page = options!=undefined ? options.page || 1 : 1;
	this.by = options!=undefined ? options.by || undefined : undefined;
	this.group = options!=undefined ? options.group || undefined : undefined;
	this.fields = options!=undefined ? options.fields || [] : [];
}

/**********************************************************************************************************************/

DISCOVER.prototype.byCategory = function(){
	var discover = this;
	discover.by = "category";
	return discover;
}

DISCOVER.prototype.byTag = function(){
	var discover = this;
	discover.by = "tag";
	return discover;
}

DISCOVER.prototype.byCity = function(){
	var discover = this;
	discover.by = "city";
	return discover;
}

/**********************************************************************************************************************/

var end_points = {
	thumbUrl: function($, project){
		return $(project).find(".project-thumbnail a img").attr("src");
	}
};

/**********************************************************************************************************************/

DISCOVER.prototype.thumbUrl = function(callback){
	var discover = this;
	discover.fields.push("thumbUrl");
	if(callback==undefined){ return discover; }
	else{ discover.request(callback); }
}

/**********************************************************************************************************************/

DISCOVER.prototype.url = function(){
	var url = BASE_URL;
	return url;
}

//CAN'T RUN WITHOUT A GROUPAS
DISCOVER.prototype.nextPage = function(callback){
	var discover = this;
	discover.page++;
	if(callback!=undefined){
		discover.request(callback);
	}
	
	return discover;
}

DISCOVER.prototype.request = function(callback){
	var discover = this;

	if(discover.fields.length==0){
		callback("NO FIELDS REQUESTED", undefined);
	}
	else{
		request(discover.url(), function(err, res, body){
			if(err){
				callback(err, undefined);
			}
			else{
				var $ = cheerio.load(body);

				var successes = [];
				var errors = [];


				var projects = $(".project-card").each(function(i, project){
					var resp = parse($, discover.fields, project);
					errors[i] = resp.error;
					successes[i] = resp.success;
				});

				var moveOn = function(){
					if(Object.keys(projects).length==successes.length+1){
						callback(errors, successes);
					}
					else{
						setTimeout(moveOn, 10);
					}
				}
				moveOn();
			}
		});
	}
}

var parse = function($, fields, project){
	var successes = {};
	var errors = {};

	var i = fields.length;
	while(i--){
		var datapoint = fields[i];
		if(end_points[datapoint]!=undefined){
			try{
				successes[datapoint] = end_points[datapoint]($, project);
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
	
	return {error:errors, success:successes};
}


module.exports = DISCOVER;