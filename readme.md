# Kickstarter

The NodeJs data wrapper you always dreamed of using/forking.

## API

### Project

The project domain pertains solely to data found on the project page. 

### new KS.project(option)
* What: Gives you access to detail about a project.
* Options: the single argument passed to the constructor is an object that can contain the following field(s)
	* url: the kickstarter project url

```javascript
var KS = require("./index");
var options = {
	url = "SOME_KICKSTARTER_PROJECT_URL"
}
var project = new KS.project(options);
```

#### pledged(callback)

* What: informs the project object that you want to select the pledged field in your requests.
* Arguments:
	* callback (optional): a callback with err and result aruments can be passed in. The result object will be a keyed object looking something like `{ pledged: 1000 }`. If no callback is passed pledged will be added to a queue of fields to grab on the next request.

```javascript
project.pledged(function(err, data){
	console.log(err);
	console.log(data);
});

/*********** RESULT ************
** err: Undefined             **
** data: {                    **
** 	pledged: 1000             **
** }                          **
*******************************/
```

#### currency(callback)

#### endTime(callback)

#### duration(callback)

#### timeLeft(callback)

#### startTime(callback)

#### posterUrl(callback)

#### creator(callback)

#### request(callback)

* What: Gathers the queued fields and passes an err and result object to the provided callback.

```javascript
project.pledged().timeLeft().request(function(err, data){
	console.log(err);
	console.log(data);
});

/*********** RESULT ************
** err: Undefined             **
** data: {                    **
** 	pledged: 1000,            **
**  timeLeft: 4444            **
** }                          **
*******************************/
```

### Discover

The discover domain pertains to all data found under the discover tab of the site. This is still very much in progress.



