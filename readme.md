# Kickstarter

The NodeJs data wrapper you always dreamed of using/forking.

## API

### Project

* What: Gives you access to detail about a project.
* Options: the single argument passed to the constructor is an object that can contain the following field(s)
	* url: the kickstarter project url

```javascript
var KS = require("./index");
var project = new KS.project("KICKSTARTER_URL");
```

#### pledged()

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

#### currency()

#### endTime()

#### duration()

#### timeLeft()

#### startTime()

#### posterUrl()

#### creator()

### Discover



