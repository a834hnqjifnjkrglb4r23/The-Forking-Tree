var player;
var needCanvasUpdate = true;

// Don't change this
const TMT_VERSION = {
	tmtNum: "2.6.6.2",
	tmtName: "Fixed Reality"
}

function getResetGain(layer, useType = null) {
	let type = useType
	if (!useType){ 
		type = tmp[layer].type
		if (layers[layer].getResetGain !== undefined)
			return layers[layer].getResetGain()
	} 
	if(tmp[layer].type == "none")
		return new Decimal (0)
	if (tmp[layer].gainExp.eq(0)) return decimalZero
	if (type=="static") {
		if ((!tmp[layer].canBuyMax) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalOne
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(tmp[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(tmp[layer].exponent, -1))
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().sub(player[layer].points).add(1).max(1);
	} else if (type=="normal"){
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return decimalZero
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(tmp[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)
		if (gain.gte(tmp[layer].softcap)) gain = gain.pow(tmp[layer].softcapPower).times(tmp[layer].softcap.pow(decimalOne.sub(tmp[layer].softcapPower)))
		gain = gain.times(tmp[layer].directMult)
		return gain.floor().max(0);
	} else if (type=="custom"){
		return layers[layer].getResetGain()
	} else {
		return decimalZero
	}
}

function getNextAt(layer, canMax=false, useType = null) {
	let type = useType
	if (!useType) {
		type = tmp[layer].type
		if (layers[layer].getNextAt !== undefined)
			return layers[layer].getNextAt(canMax)

		}
	if(tmp[layer].type == "none")
		return new Decimal (Infinity)

	if (tmp[layer].gainMult.lte(0)) return new Decimal(Infinity)
	if (tmp[layer].gainExp.lte(0)) return new Decimal(Infinity)

	if (type=="static") 
	{
		if (!tmp[layer].canBuyMax) canMax = false
		let amt = player[layer].points.plus((canMax&&tmp[layer].baseAmount.gte(tmp[layer].nextAt))?tmp[layer].resetGain:0).div(tmp[layer].directMult)
		let extraCost = Decimal.pow(tmp[layer].base, amt.pow(tmp[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
		let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
		if (tmp[layer].roundUpCost) cost = cost.ceil()
		return cost;
	} else if (type=="normal"){
		let next = tmp[layer].resetGain.add(1).div(tmp[layer].directMult)
		if (next.gte(tmp[layer].softcap)) next = next.div(tmp[layer].softcap.pow(decimalOne.sub(tmp[layer].softcapPower))).pow(decimalOne.div(tmp[layer].softcapPower))
		next = next.root(tmp[layer].gainExp).div(tmp[layer].gainMult).root(tmp[layer].exponent).times(tmp[layer].requires).max(tmp[layer].requires)
		if (tmp[layer].roundUpCost) next = next.ceil()
		return next;
	} else if (type=="custom"){
		return layers[layer].getNextAt(canMax)
	} else {
		return decimalZero
	}}

function softcap(value, cap, power) {
	if (value.lte(cap)) return value
	else
		return value.pow(power).times(cap.pow(decimalOne.sub(power)))
}

function undosoftcap(value, cap, power) {
	if (value.lte(cap)) return value
	else
		return value.root(power).times(cap.pow(decimalOne.sub(decimalOne.div(power))))
}

// Return true if the layer should be highlighted. By default checks for upgrades only.
function shouldNotify(layer){
	for (id in tmp[layer].upgrades){
		if (isPlainObject(layers[layer].upgrades[id])){
			if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
				return true
			}
		}
	}
	if (player[layer].activeChallenge && canCompleteChallenge(layer, player[layer].activeChallenge)) {
		return true
	}

	if (tmp[layer].shouldNotify)
		return true

	if (isPlainObject(tmp[layer].tabFormat)) {
		for (subtab in tmp[layer].tabFormat){
			if (subtabShouldNotify(layer, 'mainTabs', subtab)) {
				tmp[layer].trueGlowColor = tmp[layer].tabFormat[subtab].glowColor || defaultGlow

				return true
			}
		}
	}

	for (family in tmp[layer].microtabs) {
		for (subtab in tmp[layer].microtabs[family]){
			if (subtabShouldNotify(layer, family, subtab)) {
				tmp[layer].trueGlowColor = tmp[layer].microtabs[family][subtab].glowColor
				return true
			}
		}
	}
	 
	return false
	
}

function canReset(layer)
{	
	if (layers[layer].canReset!== undefined)
		return run(layers[layer].canReset, layers[layer])
	else if(tmp[layer].type == "normal")
		return tmp[layer].baseAmount.gte(tmp[layer].requires)
	else if(tmp[layer].type== "static")
		return tmp[layer].baseAmount.gte(tmp[layer].nextAt) 
	else 
		return false
}

function rowReset(row, layer) {
	for (lr in ROW_LAYERS[row]){
		if(layers[lr].doReset) {
			if (!isNaN(row)) Vue.set(player[lr], "activeChallenge", null) // Exit challenges on any row reset on an equal or higher row
			run(layers[lr].doReset, layers[lr], layer)
		}
		else
			if(tmp[layer].row > tmp[lr].row && !isNaN(row)) layerDataReset(lr)
	}
}

function layerDataReset(layer, keep = []) {
	let storedData = {unlocked: player[layer].unlocked, forceTooltip: player[layer].forceTooltip, noRespecConfirm: player[layer].noRespecConfirm, prevTab:player[layer].prevTab} // Always keep these

	for (thing in keep) {
		if (player[layer][keep[thing]] !== undefined)
			storedData[keep[thing]] = player[layer][keep[thing]]
	}

	Vue.set(player[layer], "buyables", getStartBuyables(layer))
	Vue.set(player[layer], "clickables", getStartClickables(layer))
	Vue.set(player[layer], "challenges", getStartChallenges(layer))
	Vue.set(player[layer], "grid", getStartGrid(layer))

	layOver(player[layer], getStartLayerData(layer))
	player[layer].upgrades = []
	player[layer].milestones = []
	player[layer].achievements = []

	for (thing in storedData) {
		player[layer][thing] =storedData[thing]
	}
}



function addPoints(layer, gain) {
	player[layer].points = player[layer].points.add(gain).max(0)
	if (player[layer].best) player[layer].best = player[layer].best.max(player[layer].points)
	if (player[layer].total) player[layer].total = player[layer].total.add(gain)
}

function generatePoints(layer, diff) {
	addPoints(layer, tmp[layer].resetGain.times(diff))
}

function doReset(layer, force=false) {
	if (tmp[layer].type == "none") return
	let row = tmp[layer].row
	if (!force) {
		
		if (tmp[layer].canReset === false) return;
		
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return;
		let gain = tmp[layer].resetGain
		if (tmp[layer].type=="static") {
			if (tmp[layer].baseAmount.lt(tmp[layer].nextAt)) return;
			gain =(tmp[layer].canBuyMax ? gain : 1)
		} 


		if (layers[layer].onPrestige)
			run(layers[layer].onPrestige, layers[layer], gain)
		
		addPoints(layer, gain)
		updateMilestones(layer)
		updateAchievements(layer)

		if (!player[layer].unlocked) {
			player[layer].unlocked = true;
			needCanvasUpdate = true;

			if (tmp[layer].increaseUnlockOrder){
				lrs = tmp[layer].increaseUnlockOrder
				for (lr in lrs)
					if (!player[lrs[lr]].unlocked) player[lrs[lr]].unlockOrder++
			}
		}
	
	}

	if (run(layers[layer].resetsNothing, layers[layer])) return
	tmp[layer].baseAmount = decimalZero // quick fix


	for (layerResetting in layers) {
		if (row >= layers[layerResetting].row && (!force || layerResetting != layer)) completeChallenge(layerResetting)
	}

	player.points = (row == 0 ? decimalZero : getStartPoints())

	for (let x = row; x >= 0; x--) rowReset(x, layer)
	for (r in OTHER_LAYERS){
		rowReset(r, layer)
	}

	player[layer].resetTime = 0

	updateTemp()
	updateTemp()
}

function resetRow(row) {
	if (prompt('Are you sure you want to reset this row? It is highly recommended that you wait until the end of your current run before doing this! Type "I WANT TO RESET THIS" to confirm')!="I WANT TO RESET THIS") return
	let pre_layers = ROW_LAYERS[row-1]
	let layers = ROW_LAYERS[row]
	let post_layers = ROW_LAYERS[row+1]
	rowReset(row+1, post_layers[0])
	doReset(pre_layers[0], true)
	for (let layer in layers) {
		player[layer].unlocked = false
		if (player[layer].unlockOrder) player[layer].unlockOrder = 0
	}
	player.points = getStartPoints()
	updateTemp();
	resizeCanvas();
}

function startChallenge(layer, x) {
	let enter = false
	if (!player[layer].unlocked || !tmp[layer].challenges[x].unlocked) return
	if (player[layer].activeChallenge == x) {
		completeChallenge(layer, x)
		Vue.set(player[layer], "activeChallenge", null)
		} else {
		enter = true
	}	
	doReset(layer, true)
	if(enter) {
		Vue.set(player[layer], "activeChallenge", x)
		run(layers[layer].challenges[x].onEnter, layers[layer].challenges[x])
	}
	updateChallengeTemp(layer)
}

function canCompleteChallenge(layer, x)
{
	if (x != player[layer].activeChallenge) return
	let challenge = tmp[layer].challenges[x]
	if (challenge.canComplete !== undefined) return challenge.canComplete

	if (challenge.currencyInternalName){
		let name = challenge.currencyInternalName
		if (challenge.currencyLocation){
			return !(challenge.currencyLocation[name].lt(challenge.goal)) 
		}
		else if (challenge.currencyLayer){
			let lr = challenge.currencyLayer
			return !(player[lr][name].lt(challenge.goal)) 
		}
		else {
			return !(player[name].lt(challenge.goal))
		}
	}
	else {
		return !(player.points.lt(challenge.goal))
	}

}

function completeChallenge(layer, x) {
	var x = player[layer].activeChallenge
	if (!x) return
	
	let completions = canCompleteChallenge(layer, x)
	if (!completions){
		Vue.set(player[layer], "activeChallenge", null)
		run(layers[layer].challenges[x].onExit, layers[layer].challenges[x])
		return
	}
	if (player[layer].challenges[x] < tmp[layer].challenges[x].completionLimit) {
		needCanvasUpdate = true
		player[layer].challenges[x] += completions
		player[layer].challenges[x] = Math.min(player[layer].challenges[x], tmp[layer].challenges[x].completionLimit)
		if (layers[layer].challenges[x].onComplete) run(layers[layer].challenges[x].onComplete, layers[layer].challenges[x])
	}
	Vue.set(player[layer], "activeChallenge", null)
	run(layers[layer].challenges[x].onExit, layers[layer].challenges[x])
	updateChallengeTemp(layer)
}

VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? " Pre-Release " + VERSION.pre : VERSION.pre ? " Beta " + VERSION.beta : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")


function autobuyUpgrades(layer){
	if (!tmp[layer].upgrades) return
	for (id in tmp[layer].upgrades)
		if (isPlainObject(tmp[layer].upgrades[id]) && (layers[layer].upgrades[id].canAfford === undefined || layers[layer].upgrades[id].canAfford() === true))
			buyUpg(layer, id) 
}

// Determines if it should show points/sec
function canGenPoints(){
	temporaryhidewr = player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lt(0.5)

	return !temporaryhidewr
}


// Calculate points/sec!
function getPointGenPerTick(diff) {
	if(!canGenPoints())
		return new Decimal(0)

	baseGain = new Decimal(1)
	baseGain = baseGain.add(buyableEffect('p', 11))
	baseGain = baseGain.add(buyableEffect('mp', 11))
	baseGain = baseGain.add(buyableEffect('bp', 11))
	baseGain = baseGain.add(buyableEffect('sp', 11))
	gainMult = new Decimal(1)
	gainMult = gainMult.add(buyableEffect('p', 12))
	gainMult = gainMult.add(buyableEffect('mp', 12))
	gainMult = gainMult.add(buyableEffect('bp', 12))
	gainMult = gainMult.add(buyableEffect('sp', 12))

	gainraw = baseGain.times(gainMult)
	gainraw = gainraw.times(buyableEffect('l', 11)[0][0]).times(buyableEffect('l', 11)[0][1])
	gainraw = gainraw.times(player.b.points.pow(buyableEffect('b', 11)).max(1))

	gainExp = new Decimal(1)
	gainExp = gainExp.add(buyableEffect('hp', 15))
	gainExp = gainExp.add(buyableEffect('wrte', 15))

	gain = gainraw.pow(gainExp)


	firstSoftcapStrength = new Decimal(20)
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('p', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('mp', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('bp', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('sp', 13))

	secondSoftcapStrength = new Decimal(40)
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('mp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('bp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('sp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('l', 11)[0][2])
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('hp', 14))

	thirdSoftcapStrength = new Decimal(60)
	thirdSoftcapStrength = thirdSoftcapStrength.sub(buyableEffect('l', 11)[0][3])
	thirdSoftcapStrength = thirdSoftcapStrength.sub(buyableEffect('mtp', 13))

	fourthSoftcapStrength = new Decimal(240) //120 left
	fourthSoftcapStrength = fourthSoftcapStrength.sub(buyableEffect('wr', 17))
	fourthSoftcapStrength = fourthSoftcapStrength.sub(buyableEffect('wrp', 17))
	fourthSoftcapStrength = fourthSoftcapStrength.sub(buyableEffect('wrmp', 17))
	fourthSoftcapStrength = fourthSoftcapStrength.sub(buyableEffect('wrbp', 17))
	fourthSoftcapStrength = fourthSoftcapStrength.sub(buyableEffect('wrsp', 17))

	fifthSoftcapStrength = new Decimal(1200)

	sixthSoftcapStrength = new Decimal(7200)

	seventhSoftcapStrength = new Decimal(50400)

	eighthSoftcapStrength = new Decimal(403200)

	ninthSoftcapStrength = new Decimal(3628800)

	pointTotalSoftcapStrength = new Decimal(0)
	if (player.points.gte(1)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(firstSoftcapStrength)}
	if (player.points.gte(2)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(secondSoftcapStrength)}
	if (player.points.gte(3)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(thirdSoftcapStrength)}
	if (player.points.gte(4)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(fourthSoftcapStrength)}
	if (player.points.gte(5)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(fifthSoftcapStrength)}
	if (player.points.gte(6)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(sixthSoftcapStrength)}
	if (player.points.gte(7)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(seventhSoftcapStrength)}
	if (player.points.gte(8)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(eighthSoftcapStrength)}
	if (player.points.gte(9)) {pointTotalSoftcapStrength = pointTotalSoftcapStrength.add(ninthSoftcapStrength)}

	pointTotalSoftcapConst = new Decimal(1)
	//  if (player.points.gte(1)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(1).pow(firstSoftcapStrength))} 
	if (player.points.gte(2)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(2).pow(secondSoftcapStrength))}
	if (player.points.gte(3)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(3).pow(thirdSoftcapStrength))}
	if (player.points.gte(4)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(4).pow(fourthSoftcapStrength))}
	if (player.points.gte(5)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(5).pow(fifthSoftcapStrength))}
	if (player.points.gte(6)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(6).pow(sixthSoftcapStrength))}
	if (player.points.gte(7)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(7).pow(seventhSoftcapStrength))}
	if (player.points.gte(8)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(8).pow(eighthSoftcapStrength))}
	if (player.points.gte(9)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(9).pow(ninthSoftcapStrength))}

	if (player.points.gte(1)) {	
		
		currentPointTime = player.points.pow(pointTotalSoftcapStrength.add(1)).div(pointTotalSoftcapStrength.add(1)).div(pointTotalSoftcapConst).div(gain)
		pointDiff = diff
		if (getBuyableAmount('g', 41).gt(0)) {pointDiff = pointDiff.times(buyableEffect('g', 41))}
		if (getBuyableAmount('g', 42).gt(0)) {pointDiff = pointDiff.times(buyableEffect('g', 42))}
		if (getBuyableAmount('g', 43).gt(0)) {pointDiff = pointDiff.times(buyableEffect('g', 43))}
		nextTickPointTime = currentPointTime.add(pointDiff)
		nextTickPoints = nextTickPointTime.times(pointTotalSoftcapStrength.add(1)).times(pointTotalSoftcapConst).times(gain).root(pointTotalSoftcapStrength.add(1))
		nextTickPoints = nextTickPoints.min(player.points.add(1).floor())


		return nextTickPoints.sub(player.points)}
	else {
		return gain.times(diff).min(1)
	}
}

function gameLoop(diff) {
	if (isEndgame() || tmp.gameEnded){
		tmp.gameEnded = true
		clearParticles()
	}

	if (isNaN(diff) || diff < 0) diff = 0
	if (tmp.gameEnded && !player.keepGoing) {
		diff = 0
		//player.tab = "tmp.gameEnded"
		clearParticles()
	}

	if (maxTickLength) {
		let limit = maxTickLength()
		if(diff > limit)
			diff = limit
	}
	addTime(diff)
	player.points = player.points.add(getPointGenPerTick(diff)).max(0)

	for (let x = 0; x <= maxRow; x++){
		for (item in TREE_LAYERS[x]) {
			let layer = TREE_LAYERS[x][item]
			player[layer].resetTime += diff
			if (tmp[layer].passiveGeneration) generatePoints(layer, diff*tmp[layer].passiveGeneration);
			if (layers[layer].update) layers[layer].update(diff);
		}
	}

	for (row in OTHER_LAYERS){
		for (item in OTHER_LAYERS[row]) {
			let layer = OTHER_LAYERS[row][item]
			player[layer].resetTime += diff
			if (tmp[layer].passiveGeneration) generatePoints(layer, diff*tmp[layer].passiveGeneration);
			if (layers[layer].update) layers[layer].update(diff);
		}
	}	

	for (let x = maxRow; x >= 0; x--){
		for (item in TREE_LAYERS[x]) {
			let layer = TREE_LAYERS[x][item]
			if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
			if (layers[layer].automate) layers[layer].automate();
			if (tmp[layer].autoUpgrade) autobuyUpgrades(layer)
		}
	}

	for (row in OTHER_LAYERS){
		for (item in OTHER_LAYERS[row]) {
			let layer = OTHER_LAYERS[row][item]
			if (tmp[layer].autoPrestige && tmp[layer].canReset) doReset(layer);
			if (layers[layer].automate) layers[layer].automate();
				player[layer].best = player[layer].best.max(player[layer].points)
			if (tmp[layer].autoUpgrade) autobuyUpgrades(layer)
		}
	}

	for (layer in layers){
		if (layers[layer].milestones) updateMilestones(layer);
		if (layers[layer].achievements) updateAchievements(layer)
	}

}

function hardReset(resetOptions) {
	if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return
	player = null
	if(resetOptions) options = null
	save(true);
	window.location.reload();
}

var ticking = false

var interval = setInterval(function() {
	if (player===undefined||tmp===undefined) return;
	if (ticking) return;
	if (tmp.gameEnded&&!player.keepGoing) return;
	ticking = true
	let now = Date.now()
	let diff = (now - player.time) / 1e3
	let trueDiff = diff
	if (player.offTime !== undefined) {
		if (player.offTime.remain > modInfo.offlineLimit * 3600) player.offTime.remain = modInfo.offlineLimit * 3600
		if (player.offTime.remain > 0) {
			let offlineDiff = Math.min(Math.max(player.offTime.remain / 10, diff), maxTickLength())
			player.offTime.remain -= offlineDiff
			diff += offlineDiff
		}
		if (!options.offlineProd || player.offTime.remain <= 0) player.offTime = undefined
	}
	if (player.devSpeed) diff *= player.devSpeed
	player.time = now
	if (needCanvasUpdate){ resizeCanvas();
		needCanvasUpdate = false;
	}
	tmp.scrolled = document.getElementById('treeTab') && document.getElementById('treeTab').scrollTop > 30
	updateTemp();
	updateOomps(diff);
	updateWidth()
	updateTabFormats()
	gameLoop(diff)
	fixNaNs()
	adjustPopupTime(trueDiff)
	updateParticles(trueDiff)
	ticking = false
}, 50)

setInterval(function() {needCanvasUpdate = true}, 500)