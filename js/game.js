let gameInfo = {
	name: "Generic Uncreative Incremental",
	id: "O7K6BQomTk8Xue4NnFjT7st6JKRDlqjP",
	author: "nobody",
	pointsName: "points",
	gameFiles: ["layers.js", "tree.js"],
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal(3), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(gameInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(0)
	gain = gain.add(buyableEffect('p', 11))
	gain = gain.add(buyableEffect('p', 12))
	gain = gain.add(buyableEffect('p', 13))
	gain = gain.times(buyableEffect('p', 14))
	gain = gain.times(buyableEffect('me', 11))
	gain = gain.times(buyableEffect('mec', 11))
	gain = gain.times(buyableEffect('cu', 11))
	gain = gain.times(buyableEffect('cu', 12))
	gain = gain.times(buyableEffect('cu', 13))
	gain = gain.times(buyableEffect('cu', 14))
	if (hasUpgrade('p', 11)) {gain = gain.times(upgradeEffect('p', 11))}
	if (hasUpgrade('p', 12)) {gain = gain.times(upgradeEffect('p', 12))}
	if (hasUpgrade('p', 13)) {gain = gain.times(upgradeEffect('p', 13))}
	if (hasUpgrade('p', 14)) {gain = gain.times(upgradeEffect('p', 14))}
	if (hasUpgrade('p', 21)) {gain = gain.times(upgradeEffect('p', 21))}
	if (hasUpgrade('p', 22)) {gain = gain.times(upgradeEffect('p', 22))}
	if (hasUpgrade('p', 32)) {gain = gain.times(upgradeEffect('p', 32))}
	if (hasUpgrade('ca', 11)) {gain = gain.times(upgradeEffect('ca', 11))}
	if (hasUpgrade('ca', 12)) {gain = gain.times(upgradeEffect('ca', 12))}
	if (hasUpgrade('ca', 21)) {gain = gain.times(upgradeEffect('ca', 21))}
	if (hasUpgrade('ca', 22)) {gain = gain.times(upgradeEffect('ca', 22))}
	if (hasUpgrade('ca', 24)) {gain = gain.times(upgradeEffect('ca', 24))}
	if (hasUpgrade('ca', 34)) {gain = gain.times(upgradeEffect('ca', 34))}
	if (hasMilestone('me', 10)) {gain = gain.times(1000)}
	if (hasMilestone('ha', 10)) {gain = gain.times(1000)}
	if (hasMilestone('si', 10)) {gain = gain.times(1000)}
	if (hasMilestone('cu', 10)) {gain = gain.times(1e6)}
	if (hasUpgrade('p', 41)) {gain = gain.pow(upgradeEffect('p', 41))}
	if (hasUpgrade('p', 44)) {gain = gain.pow(upgradeEffect('p', 44))}
	if (hasUpgrade('ca', 41)) {gain = gain.pow(upgradeEffect('ca', 41))}
	if (hasUpgrade('ha', 11)) {gain = gain.pow(upgradeEffect('ha', 11))}
	if (hasUpgrade('ha', 12)) {gain = gain.pow(upgradeEffect('ha', 12))}
	if (hasUpgrade('ha', 13)) {gain = gain.pow(upgradeEffect('ha', 13))}
	if (hasUpgrade('ha', 21)) {gain = gain.pow(upgradeEffect('ha', 21))}
	if (hasUpgrade('si', 11)) {gain = gain.pow(upgradeEffect('si', 11))}
	if (hasUpgrade('si', 12)) {gain = gain.pow(upgradeEffect('si', 12))}
	if (hasUpgrade('si', 13)) {gain = gain.pow(upgradeEffect('si', 13))}
	if (hasUpgrade('si', 21)) {gain = gain.pow(upgradeEffect('si', 21))}
	gain = gain.pow(buyableEffect('cu', 102))
	if (hasUpgrade('gi', 32)) {gain = gain.pow(upgradeEffect('gi', 32))}
	gain = gain.pow(buyableEffect('pr', 12))

	if (hasUpgrade('pr', 14)&&gain.gte(10)) {gain = gain.log10().pow(upgradeEffect('pr', 14)).pow10()}
	if (hasUpgrade('pr', 24)&&gain.gte(10)) {gain = gain.log10().pow(upgradeEffect('pr', 24)).pow10()}

	if (inChallenge('pr', 11)&&gain.gte(10))  {gain = gain.log10().pow(0.5).pow10()}
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	buyablePrice(type, amt, base, exp = Decimal.dOne, mult = Decimal.dOne, limit = Decimal.dInf, floorprice = false) {
		if (type == "large") { //large = 10^(mult*base^(x+1)^pow)
			if (limit.lte('ee10')) {limit = new Decimal('ee10')} //limit is softcap, in currency at which scaling change to triple exponential : linear
			if (Decimal.dTen.pow(base.pow(amt.add(1).pow(exp))).gt(limit)) {
				limitamt = limit.log10().div(mult).log10().div(base.log10()).root(exp).sub(1)
				limitamtplus1 = limitamt.add(1)
				limitpricetriplelog = limit.log10().log10().log10()
				limitplus1pricetriplelog = Decimal.dTen.pow(base.pow(limitamtplus1.add(1).pow(exp)).times(mult)).log10().log10().log10()
				newpricescalingtriplelog = limitplus1pricetriplelog.sub(limitpricetriplelog)
				priceQuantity = amt.sub(limitamt).times(newpricescalingtriplelog).add(limitpricetriplelog).pow10().pow10().pow10()
			} else {
				priceQuantity = Decimal.dTen.pow(base.pow(amt.add(1).pow(exp)).times(mult))
			}
		}
		if (type == "normal") { //normal = mult*base^(x+1)^pow
			if (limit.lte('e10')) {limit = new Decimal('e10')} //limit is softcap, in currency at which scaling change to double exponential : linear
			if (base.pow(amt.add(1).pow(exp)).gt(limit)) {
				limitamt = limit.div(mult).log10().div(base.log10()).pow(exp.pow(-1)).sub(1)
				limitamtplus1 = limitamt.add(1)
				limitpriceloglog = limit.log10().log10()
				limitplus1priceloglog = base.pow(limitamtplus1.add(1).pow(exp)).times(mult).log10().log10()
				newpricescalingloglog = limitplus1priceloglog.sub(limitpriceloglog)
				priceQuantity = amt.sub(limitamt).times(newpricescalingloglog).add(limitpriceloglog).pow10().pow10()
			} else {
				priceQuantity = base.pow(amt.add(1).pow(exp)).times(mult)
			}
		}
		if (type == "small") { //small = base*(x+1)^pow, mult is useless
			if (limit.lte('10')) {limit = new Decimal('10')} //limit is softcap, in currency at which scaling change to exponential : linear
			if (base.times(amt.add(1).pow(exp)).gt(limit)) {
				limitamt = limit.div(base).root(exp).sub(1)
				limitamtplus1 = limitamt.add(1)
				limitpricelog = limit.log10()
				limitplus1pricelog = base.times(limitamtplus1.add(1).pow(exp)).log10()
				newpricescalinglog = limitplus1pricelog.sub(limitpricelog)
				priceQuantity = amt.sub(limitamt).times(newpricescalinglog).add(limitpricelog).pow10()
			} else {
				priceQuantity = base.times(amt.add(1).pow(exp))
			}
		}

		if (type == "asymptote") {
			priceQuantity = base.pow(amt.add(1).times(limit).div(Decimal.sub(limit, amt)).pow(exp)).times(mult).floor() //limit is hard limit, in buyable amount. softcap not needed since hardcapped
		}

		if (type == "largeasymptote") {
			priceQuantity = base.pow(amt.add(1).times(limit).div(Decimal.sub(limit, amt)).pow(exp)).times(mult).pow10().floor() //limit is hard limit, in buyable amount. softcap not needed since hardcapped
		}
		if (floorprice) {
			priceQuantity = priceQuantity.floor()
		}
		return priceQuantity

	},
	buyableMaxPurchaseable(type, currency, base, exp = Decimal.dOne, mult = Decimal.dOne, limit = Decimal.dInf) {
		if (type == "large") {
			if (limit.lte('ee10')) {limit = new Decimal('ee10')} //limit is softcap, in currency at which scaling change to triple exponential : linear
			if (currency.gt(limit)) {
				limitamt = limit.log10().div(mult).log10().div(base.log10()).root(exp)
				limitamtplus1 = limitamt.add(1)
				limitpricetriplelog = base.pow(limitamt.add(1).pow(exp)).times(mult).pow10().log10().log10().log10()
				limitplus1pricetriplelog = base.pow(limitamtplus1.add(1).pow(exp)).times(mult).pow10().log10().log10().log10()
				newpricescalingtriplelog = limitplus1pricetriplelog.sub(limitpricetriplelog)
				return currency.log10().log10().log10().sub(limitpricetriplelog).div(newpricescalingtriplelog).add(limitamt).floor()
			}
			else return currency.max(10).log10().div(mult).max(1).log10().div(base.log10()).root(exp).floor()
		}
		if (type == "normal") {
			if (limit.lte('e10')) {limit = new Decimal('e10')}
			if (currency.gt(limit)) {
				limitamt = limit.div(mult).log10().div(base.log10()).pow(exp.pow(-1))
				limitamtplus1 = limitamt.add(1)
				limitpriceloglog = base.pow(limitamt.add(1).pow(exp)).times(mult).log10().log10()
				limitplus1priceloglog = base.pow(limitamtplus1.add(1).pow(exp)).times(mult).log10().log10()
				newpricescalingloglog = limitplus1priceloglog.sub(limitpriceloglog)
				return currency.log10().log10().sub(limitpriceloglog).div(newpricescalingloglog).add(limitamt).floor()
			} else {
				return currency.div(mult).max(1).log10().div(base.log10()).pow(exp.pow(-1)).floor()
			}
		}
		if (type == "small") {
			if (limit.lte('10')) {limit = new Decimal('10')}
			if (currency.gt(limit)) {
				limitamt = limit.div(base).root(exp)
				limitamtplus1 = limitamt.add(1)
				limitpricelog = base.times(limitamt.add(1).pow(exp)).log10()
				limitplus1pricelog = base.times(limitamtplus1.add(1).pow(exp)).log10()
				newpricescalinglog = limitplus1pricelog.sub(limitpricelog)	
				return currency.log10().sub(limitpricelog).div(newpricescalinglog).add(limitamt).floor()			
			} else {
				return currency.max(0).div(base).root(exp).floor()
			}
		}
	},
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("ee1000"))
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