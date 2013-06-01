var KS = require("../");
var request = require("request");
var cheerio = require("cheerio");

var BASE_URL = "http://www.kickstarter.com/discover/";

var urls = {
	general: {
		recommended: "recommended",
		recentlyLaunched: "recently-launched",
		endingSoon: "ending-soon",
		smallProjects: "small-projects"
	},
	categories: {
		art: {
			recommended: "categories/art/recommended",
			popular: "categories/art/popular",
			recentlyFunded: "categories/art/successful",
			mostFunded: "categories/art/most-funded"
		},
		comics: {
			recommended: "categories/comics/recommended",
			popular: "categories/comics/popular",
			recentlyFunded: "categories/comics/successful",
			mostFunded: "categories/comics/most-funded"
		},
		dance: {
			recommended: "categories/dance/recommended",
			popular: "categories/dance/popular",
			recentlyFunded: "categories/dance/successful",
			mostFunded: "categories/dance/most-funded"
		},
		design: {
			recommended: "categories/design/recommended",
			popular: "categories/design/popular",
			recentlyFunded: "categories/design/successful",
			mostFunded: "categories/design/most-funded"
		},
		fashion: {
			recommended: "categories/fashion/recommended",
			popular: "categories/fashion/popular",
			recentlyFunded: "categories/fashion/successful",
			mostFunded: "categories/fashion/most-funded"
		},
		filmAndVideo: {
			recommended: "categories/film%20&%20video/recommended",
			popular: "categories/film%20&%20video/popular",
			recentlyFunded: "categories/film%20&%20video/successful",
			mostFunded: "categories/film%20&%20video/most-funded"
		},
		food: {
			recommended: "categories/food/recommended",
			popular: "categories/food/popular",
			recentlyFunded: "categories/food/successful",
			mostFunded: "categories/food/most-funded"
		},
		games: {
			recommended: "categories/games/recommended",
			popular: "categories/games/popular",
			recentlyFunded: "categories/games/successful",
			mostFunded: "categories/games/most-funded"
		},
		music: {
			recommended: "categories/music/recommended",
			popular: "categories/music/popular",
			recentlyFunded: "categories/music/successful",
			mostFunded: "categories/music/most-funded"
		},
		photography: {
			recommended: "categories/photography/recommended",
			popular: "categories/photography/popular",
			recentlyFunded: "categories/photography/successful",
			mostFunded: "categories/photography/most-funded"
		},
		publishing: {
			recommended: "categories/publishing/recommended",
			popular: "categories/publishing/popular",
			recentlyFunded: "categories/publishing/successful",
			mostFunded: "categories/publishing/most-funded"
		},
		technology: {
			recommended: "categories/technology/recommended",
			popular: "categories/technology/popular",
			recentlyFunded: "categories/technology/successful",
			mostFunded: "categories/technology/most-funded"
		},
		theater: {
			recommended: "categories/theater/recommended",
			popular: "categories/theater/popular",
			recentlyFunded: "categories/theater/successful",
			mostFunded: "categories/theater/most-funded"
		}
	},
	tags: {
		arctic: "tags/arctic",
		cats: "tags/cats",
		civic: "tags/civic",
		cthulhu: "tags/cthulhu",
		library: "tags/library",
		maps: "tags/maps",
		openSource: "tags/open-source",
		robots: "tags/robots",
		rpg: "tags/rpg",
		science: "tags/science",
		space: "tags/space",
		zombies: "tags/zombies"
	}
}

var DISCOVER = function(options){
	var discover = this;
	discover.page = options!=undefined ? options.page || 1 : 1;
	discover.by = options!=undefined ? options.by || [] : [];
	discover.fields = options!=undefined ? options.fields || [] : [];
}

/**********************************************************************************************************************/

DISCOVER.prototype.byGeneral = function(group){
	var discover = this;
	discover.by = ["general", group];
	return discover;
}

DISCOVER.prototype.byCategory = function(category, group){
	var discover = this;
	discover.by = ["category", category, group];
	return discover;
}

DISCOVER.prototype.byTag = function(tag){
	var discover = this;
	discover.by = ["tag", tag];
	return discover;
}

/**********************************************************************************************************************/

DISCOVER.prototype.resetFields = function(fields){
	var discover = this;
	discover.fields = fields || [];
	return discover;
}

/**********************************************************************************************************************/

var end_points = {
	thumbUrl: function($, project){
		return $(project).find(".project-thumbnail a img").attr("src");
	},
	projectUrl: function($, project){
		var href = $(project).find(".bbcard_name a").attr("href");
		if(href.indexOf("?")>-1){
			href = href.substring(0, href.indexOf("?"));
		}
		return "http://www.kickstarter.com"+href;
	},
	project: function($, project){
		var url = end_points.projectUrl($, project);
		return new KS.project(url);
	}
};

/**********************************************************************************************************************/

DISCOVER.prototype.doField = function(field, callback){
	var discover = this;
	if(callback==undefined){
		discover.fields.push(field);
	}
	else{
		var fields = discover.fields.slice(0);
		fields.push(field);
		discover.request(fields, callback);
	}
	return discover;
}

DISCOVER.prototype.thumbUrl = function(callback){
	var discover = this;
	return discover.doField("thumbUrl", callback);
}

DISCOVER.prototype.projectUrl = function(callback){
	var discover = this;
	return discover.doField("projectUrl", callback);
}

DISCOVER.prototype.project = function(callback){
	var discover = this;
	return discover.doField("project", callback);
}

/**********************************************************************************************************************/

DISCOVER.prototype.url = function(){
	var discover = this;

	var url = BASE_URL;
	var err = undefined;

	if(discover.by.length>0){
		var addOn = urls;
		for(var i=0; i<discover.by.length; i++){
			var key = discover.by[i];
			addOn = addOn[key];
			if(addOn==undefined){
				break;
			}
		}
		if(typeof addOn != "string"){
			err = "INVALID DISCOVERY GROUP: " + discover.by.join(", ");
		}
		else{
			url += addOn;
		}
	}

	url += "?page="+discover.page;

	return {err: err, url:url};
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

DISCOVER.prototype.request = function(fields, callback){
	var discover = this;

	if(typeof fields == "function"){
		callback = fields;
		fields = discover.fields;
	}

	if(fields.length==0){
		callback("NO FIELDS REQUESTED", undefined);
	}
	else{
		var url = discover.url();
		if(url.err){
			callback(url.err, undefined);
		}
		else{
			request(url.url, function(err, res, body){
				if(err){
					callback(err, undefined);
				}
				else{
					var $ = cheerio.load(body);

					var successes = [];
					var errors = [];


					var projects = $(".project-card").each(function(i, project){
						var resp = parse($, fields, project);
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
	return discover;
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