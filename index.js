var request = require("request");
var cheerio = require("cheerio");

var KS = module.exports;

KS.project = require("./lib/project");
KS.discover = require("./lib/discover");