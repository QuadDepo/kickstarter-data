# Kickstarter

The NodeJs data wrapper you always dreamed of using/forking.

## Example

		var KS = require("./index");

		var project = new KS.project("KICKSTARTER_URL");

		project.pledged(function(err, data){
			console.log(err);
			console.log(data);
		});

		/******************* RESULT *******************
		** err: Undefined                            **
		** data: {                                   **
		** 	pledged: 1000                            **
		** }                                         **
		/*********************************************/
