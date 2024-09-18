let modInfo = {
	name: "The Modding Tree 866: Need for Speed",
	id: "7h27uZrOwr6jeGtBZ31X6jr1gG1LzSWs",
	author: "nameunavailable866",
	pointsName: "seconds",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "15.9 Pro Max Air",


	name: "Reality Transformation ~everything is but what it is not~",
}


let changelog = `<h1>Changelog:</h1><br>
	<h3>v15.9</h3><br>
		- Added advertisements.<br>
		- Added microtransactions.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	
	return player.totalGameTime().gte(player.points.sub(0.05))
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)


	return player.gamespeed()
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	gamespeed() {
		gamespeed = new Decimal(1)
		return gamespeed
	},
	totalGameTime() {
		totalRealTime = new Decimal(10)  
		if (hasUpgrade('ik', 33)){totalRealTime = totalRealTime.add(upgradeEffect('ik', 33))}
		if (hasUpgrade('ik', 43)){totalRealTime = totalRealTime.add(upgradeEffect('ik', 43))}

 		if (hasUpgrade('p', 13)){totalRealTime = totalRealTime.add(upgradeEffect('p', 13))}
		if (hasUpgrade('p', 23)){totalRealTime = totalRealTime.add(upgradeEffect('p', 23))}
		if (hasUpgrade('p', 33)){totalRealTime = totalRealTime.add(upgradeEffect('p', 33))}
		if (hasUpgrade('p', 43)){totalRealTime = totalRealTime.add(upgradeEffect('p', 43))}
		if (hasUpgrade('p', 53)){totalRealTime = totalRealTime.add(upgradeEffect('p', 53))}
		if (hasUpgrade('p', 63)){totalRealTime = totalRealTime.add(upgradeEffect('p', 63))}
		if (hasUpgrade('p', 73)){totalRealTime = totalRealTime.add(upgradeEffect('p', 73))}
		if (hasUpgrade('p', 83)){totalRealTime = totalRealTime.add(upgradeEffect('p', 83))}

		if (hasUpgrade('p', 133)){totalRealTime = totalRealTime.add(upgradeEffect('p', 133))}
	
		if (hasUpgrade('i', 13)){totalRealTime = totalRealTime.add(upgradeEffect('i', 13))} 

		if (hasUpgrade('cg', 23)){totalRealTime = totalRealTime.add(upgradeEffect('cg', 23))} 

		totalGameTime = totalRealTime.times(player.gamespeed())
		return totalGameTime
	},
	versionNumber() {
		if (hasUpgrade('p', 143)) {Object.defineProperty(VERSION, "num", {value:"23.85 Pro Max Air"})}
	}

}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000")) //i think we wont reach this in a while, actually
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

function factorial(x) {
	if(x == 0) {
		return 1;
	}
	if(x < 0 ) {
		return undefined;
	}
	if (x > 10000) {
		return asdfhlasdfljhkl
	}
	for(var i = x; --i; ) {
		x *= i;
	}
	return x;
}

function choose(n, k) {
	if(n<0||k<0) {
		return undefined;
	}
	return factorial(n)/factorial(k)/factorial(n-k)
}