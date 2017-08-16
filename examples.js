// Import kickstarter-data
const KS = require('./index.js');

// options of kickstarter-data
var options = {
	url: "https://www.kickstarter.com/projects/lumaboards/luma-boards-the-most-futuristic-cruiser-ever-creat/updates",
}
// Creating new KS project with options
var project = new KS.project(options);

// Calling all function using .all()

project.all(function(error, data){
	// if there is an error
	if (error) {
		// error
		console.log(error);
	}
	else{
		// kickstater data
		console.log(data);
	}
})
