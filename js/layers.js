addLayer("b", {
    name: "building points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#a07030",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "building points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multb = new Decimal(1)


        return multb
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expb = new Decimal(2/3).add(buyableEffect('p', 13))
        if (hasUpgrade('h', 11)) {expb = expb.times(upgradeEffect('h', 11))}
        if (hasUpgrade('h', 41)) {expb = expb.times(upgradeEffect('h', 41))}
        expb = expb.times(buyableEffect('c', 11)) //ok
        return expb
    },
    getResetGain() {
        bp = player.points.times(multb).pow(expb)

        return bp.floor().max(0)
    },
    getNextAt() {
        nextb = getResetGain('b').add(1)
        return nextb.root(expb).div(multb)
    },
    canReset() {return getResetGain('b').gte(0)&&!(hasMilestone('h', 0))}, //change false to autogain trigger
    update(diff) { if (hasMilestone('h', 0)) {
        resetTimePeriod = new Decimal(1).times(buyableEffect('h', 11))
        if (expb.lte(1)) {resetTimePeriod = new Decimal(1)} //calculate reset period

        bgainPerReset = resetTimePeriod.times(getPointGen()).times(multb).pow(expb) //calculate point gain per reset
        bgainPerSecond = bgainPerReset.div(resetTimePeriod) // calculate point gain per second

        

        setBuyableAmount('b', 101, bgainPerSecond)
        addPoints('b', bgainPerSecond.times(diff))
        } else {}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {
        if (hasMilestone('h', 0)) {
            return "The automatic resets are giving you "+format(getBuyableAmount('b', 101))+" building points every second"
        } else {
            return "Reset for "+formatWhole(getResetGain('b'))+" building points. Next at "+format(getNextAt('b'))+" cookies" 
        }
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for building points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    automate() {//change to when player unlock autobuy
        if (false) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) { //change false to keep building trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {
            keepSugarRow = 2
            if (hasMilestone('c', 0)) {keepSugarRow = 3}
            if (hasMilestone('m', 0)) {keepSugarRow = 999}
            if ((layers[resettingLayer].row <= keepSugarRow)) {
                tempvar1 = [Decimal.dZero]
                tempvar2 = [Decimal.dZero]
                for (let i = 1; i < 10; i++ ) {
                    tempvar1.push(getBuyableAmount('b', i*10+3))
                    tempvar2.push(getBuyableAmount('b', i*10+4))
                }
                layerDataReset(this.layer, [])
                for (let i = 1; i < 10; i++ ) {
                    setBuyableAmount('b', i*10+3, tempvar1[i])
                    setBuyableAmount('b', i*10+4, tempvar2[i])
                }
            } else {
                layerDataReset(this.layer, [])
            }
            if (hasMilestone('h', 0)||hasMilestone('c', 0)||hasMilestone('m', 0)) {addPoints('b', 14)}
        }

    },
    clickables: {
        11: {
            display() { return "click me to gain "+format(player.clickgain())+" cookies"},
            unlocked: true,
            onClick() {
                player.points = player.points.add(player.clickgain())
            },
            canClick() {return true},

        },

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costStackb11 = new Decimal(x).add(buyableEffect('b', 12).spent)
                buyableTierb11 = new Decimal(10/9)
                constantCostb11 = Decimal.pow(1.04, buyableTierb11.pow(2)).times(Decimal.pow(10, buyableTierb11))

                linearCostb11 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb11 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))


                if (hasUpgrade('h', 21)) {linearCostb11 = linearCostb11.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb11 = quadraticCostb11.root(upgradeEffect('h', 21))}

                constantCostLogb11 = constantCostb11.log10()
                linearCostLogb11 = linearCostb11.log10()
                quadraticCostLogb11 = quadraticCostb11.log10()

                if (player.b.points.lte(constantCostb11.div(linearCostb11).times(quadraticCostb11))) {continuumb11 = new Decimal(0)} else {continuumb11 = player.b.points.log10().sub(constantCostLogb11).times(quadraticCostLogb11).times(4).add(linearCostLogb11.pow(2)).pow(1/2).sub(linearCostLogb11).div(quadraticCostLogb11).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb11.times(linearCostb11.pow(costStackb11)).times(quadraticCostb11.pow(costStackb11.pow(2))).floor(), continuum: continuumb11}
            },
            effect(x) {
                effBaseb11 = Decimal.dTen.pow(buyableTierb11).times(buyableEffect('b', 12).effect)

                if (hasMilestone('c', 1)) {effStackb11 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb11 = this.cost().continuum.sub(buyableEffect('b', 12).spent)} else {effStackb11 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+1).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+1).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb11 = effBaseb11.times(totalSynergyBoost)


                return Decimal.times(effBaseb11, effStackb11).max(0)
            },
            title() { return "building 11"},
            display() { return "increase cookie gain by "+format(effBaseb11)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb11)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                initialCostb12 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb12 = initialCostb12.div(upgradeEffect('h', 22))}

                costMultb12 = new Decimal(x).add(1)

                continuumb12 = layers.b.buyables[11].cost().continuum.div(initialCostb12).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 14))

                return {cost: Decimal.times(initialCostb12, costMultb12), continuum: continuumb12}
            },
            effect(x) {
                effBaseb12 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 11))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb12 = effBaseb12.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb12 = effBaseb12.times(upgradeEffect('h', 23))}
                effBaseb12 = effBaseb12.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(1)) {effBaseb12 = effBaseb12.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(1)) {effBaseb12 = effBaseb12.pow(buyableEffect('p', 22))}


                if (hasMilestone('c', 1)) {spentStackb12 = this.cost().continuum} else {spentStackb12 = new Decimal(x)}
                effStackb12 = spentStackb12.times(buyableEffect('sf', 22)).add(buyableEffect('b', 13)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb12, effStackb12), spent: initialCostb12.times(spentStackb12).times(spentStackb12.add(1)).div(2)}
            },
            title() { return "building 12"},
            display() { return "multiply building 11 effect by "+format(effBaseb12)+" <br> cost: "+format(this.cost().cost)+" building 11s <br> owned: "+format(effStackb12)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[11].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[11].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        13: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb13 = new Decimal(x).add(1)

                continuumb13 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 14))

                return {cost: costStackb13, continuum: continuumb13}
            },
            effect(x) {
                effBaseb13 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb13 = this.cost().continuum} else {effStackb13 = new Decimal(x)}

                return Decimal.times(effBaseb13, effStackb13)
            },
            title() { return "building 13"},
            display() { return "gives "+format(effBaseb13)+" free levels to building 12 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb13)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        14: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb14 = new Decimal(1)
                costStackb14 = new Decimal(x).add(1)

                return Decimal.times(linearCostb14, costStackb14).round()
            },
            effect(x) {
                effBaseb14 = new Decimal(2)
                effStackb14 = new Decimal(x)

                return Decimal.pow(effBaseb14, effStackb14)
            },
            title() { return "building 14"},
            display() { return "multiplies building 12 levels by "+format(effBaseb14)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb14)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costStackb21 = new Decimal(x).add(buyableEffect('b', 22).spent)
                buyableTierb21 = new Decimal(20/8)
                constantCostb21 = Decimal.pow(1.04, buyableTierb21.pow(2)).times(Decimal.pow(10, buyableTierb21))

                linearCostb21 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb21 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))

                
                if (hasUpgrade('h', 21)) {linearCostb21 = linearCostb21.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb21 = quadraticCostb21.root(upgradeEffect('h', 21))}

                constantCostLogb21 = constantCostb21.log10()
                linearCostLogb21 = linearCostb21.log10()
                quadraticCostLogb21 = quadraticCostb21.log10()
                
                if (player.b.points.lte(constantCostb21.div(linearCostb21).times(quadraticCostb21))) {continuumb21 = new Decimal(0)} else {continuumb21 = player.b.points.log10().sub(constantCostLogb21).times(quadraticCostLogb21).times(4).add(linearCostLogb21.pow(2)).pow(1/2).sub(linearCostLogb21).div(quadraticCostLogb21).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb21.times(linearCostb21.pow(costStackb21)).times(quadraticCostb21.pow(costStackb21.pow(2))).floor(), continuum: continuumb21}
            },
            effect(x) {
                effBaseb21 = Decimal.dTen.pow(buyableTierb21).times(buyableEffect('b', 22).effect)

                if (hasMilestone('c', 1)) {effStackb21 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb21 = this.cost().continuum.sub(buyableEffect('b', 22).spent)} else {effStackb21 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+2).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+2).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb21 = effBaseb21.times(totalSynergyBoost)


                return Decimal.times(effBaseb21, effStackb21).max(0)
            },
            title() { return "building 21"},
            display() { return "increase cookie gain by "+format(effBaseb21)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb21)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                initialCostb22 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb22 = initialCostb22.div(upgradeEffect('h', 22))}

                costMultb22 = new Decimal(x).add(1)

                continuumb22 = layers.b.buyables[21].cost().continuum.div(initialCostb22).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 24))

                return {cost: Decimal.times(initialCostb22, costMultb22), continuum: continuumb22}
            },
            effect(x) {
                effBaseb22 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 12))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb22 = effBaseb22.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb22 = effBaseb22.times(upgradeEffect('h', 23))}
                effBaseb22 = effBaseb22.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb22 = this.cost().continuum} else {spentStackb22 = new Decimal(x)}
                effStackb22 = spentStackb22.times(buyableEffect('sf', 22)).add(buyableEffect('b', 23)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb22, effStackb22), spent: initialCostb22.times(spentStackb22).times(spentStackb22.add(1)).div(2)}
            },
            title() { return "building 22"},
            display() { return "multiply building 21 effect by "+format(effBaseb22)+" <br> cost: "+format(this.cost().cost)+" building 21s <br> owned: "+format(effStackb22)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[21].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[21].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[21] = player[this.layer].buyables[21].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        23: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb23 = new Decimal(x).add(1)

                continuumb23 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 24))

                return {cost: costStackb23, continuum: continuumb23}
            },
            effect(x) {
                effBaseb23 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb23 = this.cost().continuum} else {effStackb23 = new Decimal(x)}

                return Decimal.times(effBaseb23, effStackb23)
            },
            title() { return "building 23"},
            display() { return "gives "+format(effBaseb23)+" free levels to building 22 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb23)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        24: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb24 = new Decimal(1)
                costStackb24 = new Decimal(x).add(1)

                return Decimal.times(linearCostb24, costStackb24).round()
            },
            effect(x) {
                effBaseb24 = new Decimal(2)
                effStackb24 = new Decimal(x)

                return Decimal.pow(effBaseb24, effStackb24)
            },
            title() { return "building 24"},
            display() { return "multiplies building 22 levels by "+format(effBaseb24)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb24)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costStackb31 = new Decimal(x).add(buyableEffect('b', 32).spent)
                buyableTierb31 = new Decimal(30/7)
                constantCostb31 = Decimal.pow(1.045, buyableTierb31.pow(2)).times(Decimal.pow(10, buyableTierb31))

                linearCostb31 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb31 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))

                
                if (hasUpgrade('h', 21)) {linearCostb31 = linearCostb31.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb31 = quadraticCostb31.root(upgradeEffect('h', 21))}

                constantCostLogb31 = constantCostb31.log10()
                linearCostLogb31 = linearCostb31.log10()
                quadraticCostLogb31 = quadraticCostb31.log10()
                
                if (player.b.points.lte(constantCostb31.div(linearCostb31).times(quadraticCostb31))) {continuumb31 = new Decimal(0)} else {continuumb31 = player.b.points.log10().sub(constantCostLogb31).times(quadraticCostLogb31).times(4).add(linearCostLogb31.pow(2)).pow(1/2).sub(linearCostLogb31).div(quadraticCostLogb31).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb31.times(linearCostb31.pow(costStackb31)).times(quadraticCostb31.pow(costStackb31.pow(2))).floor(), continuum: continuumb31}
            },
            effect(x) {
                effBaseb31 = Decimal.dTen.pow(buyableTierb31).times(buyableEffect('b', 32).effect)
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb32 = effBaseb32.add(getClickableState('au', 17))}
                if (hasMilestone('c', 1)) {effStackb31 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb31 = this.cost().continuum.sub(buyableEffect('b', 32).spent)} else {effStackb31 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+3).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+3).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb31 = effBaseb31.times(totalSynergyBoost)


                return Decimal.times(effBaseb31, effStackb31).max(0)
            },
            title() { return "building 31"},
            display() { return "increase cookie gain by "+format(effBaseb31)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb31)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                initialCostb32 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb32 = initialCostb32.div(upgradeEffect('h', 22))}

                costMultb32 = new Decimal(x).add(1)

                continuumb32 = layers.b.buyables[31].cost().continuum.div(initialCostb32).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 34))

                return {cost: Decimal.times(initialCostb32, costMultb32), continuum: continuumb32}
            },
            effect(x) {
                effBaseb32 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 13))
                
                if (hasUpgrade('h', 23)) {effBaseb32 = effBaseb32.times(upgradeEffect('h', 23))}
                effBaseb32 = effBaseb32.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb32 = this.cost().continuum} else {spentStackb32 = new Decimal(x)}
                effStackb32 = spentStackb32.times(buyableEffect('sf', 22)).add(buyableEffect('b', 33)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb32, effStackb32), spent: initialCostb32.times(spentStackb32).times(spentStackb32.add(1)).div(2)}
            },
            title() { return "building 32"},
            display() { return "multiply building 31 effect by "+format(effBaseb32)+" <br> cost: "+format(this.cost().cost)+" building 31s <br> owned: "+format(effStackb32)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[31].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[31].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[31] = player[this.layer].buyables[31].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        33: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb33 = new Decimal(x).add(1)

                continuumb33 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 34))

                return {cost: costStackb33, continuum: continuumb33}
            },
            effect(x) {
                effBaseb33 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb33 = this.cost().continuum} else {effStackb33 = new Decimal(x)}

                return Decimal.times(effBaseb33, effStackb33)
            },
            title() { return "building 33"},
            display() { return "gives "+format(effBaseb33)+" free levels to building 32 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb33)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        34: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb34 = new Decimal(1)
                costStackb34 = new Decimal(x).add(1)

                return Decimal.times(linearCostb34, costStackb34).round()
            },
            effect(x) {
                effBaseb34 = new Decimal(2)
                effStackb34 = new Decimal(x)

                return Decimal.pow(effBaseb34, effStackb34)
            },
            title() { return "building 34"},
            display() { return "multiplies building 32 levels by "+format(effBaseb34)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb34)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costStackb41 = new Decimal(x).add(buyableEffect('b', 42).spent)
                buyableTierb41 = new Decimal(40/6)
                constantCostb41 = Decimal.pow(1.04, buyableTierb41.pow(2)).times(Decimal.pow(10, buyableTierb41))

                linearCostb41 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb41 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))

                if (hasUpgrade('h', 21)) {linearCostb41 = linearCostb41.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb41 = quadraticCostb41.root(upgradeEffect('h', 21))}

                constantCostLogb41 = constantCostb41.log10()
                linearCostLogb41 = linearCostb41.log10()
                quadraticCostLogb41 = quadraticCostb41.log10()
                
                if (player.b.points.lte(constantCostb41.div(linearCostb41).times(quadraticCostb41))) {continuumb41 = new Decimal(0)} else {continuumb41 = player.b.points.log10().sub(constantCostLogb41).times(quadraticCostLogb41).times(4).add(linearCostLogb41.pow(2)).pow(1/2).sub(linearCostLogb41).div(quadraticCostLogb41).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb41.times(linearCostb41.pow(costStackb41)).times(quadraticCostb41.pow(costStackb41.pow(2))).floor(), continuum: continuumb41}
            },
            effect(x) {
                effBaseb41 = Decimal.dTen.pow(buyableTierb41).times(buyableEffect('b', 42).effect)

                if (hasMilestone('c', 1)) {effStackb41 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb41 = this.cost().continuum.sub(buyableEffect('b', 42).spent)} else {effStackb41 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+4).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+4).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb41 = effBaseb41.times(totalSynergyBoost)


                return Decimal.times(effBaseb41, effStackb41).max(0)
            },
            title() { return "building 41"},
            display() { return "increase cookie gain by "+format(effBaseb41)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb41)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                initialCostb42 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb42 = initialCostb42.div(upgradeEffect('h', 22))}

                costMultb42 = new Decimal(x).add(1)

                continuumb42 = layers.b.buyables[41].cost().continuum.div(initialCostb22).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 44))

                return {cost: Decimal.times(initialCostb42, costMultb42), continuum: continuumb42}
            },
            effect(x) {
                effBaseb42 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 14))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb42 = effBaseb42.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb42 = effBaseb42.times(upgradeEffect('h', 23))}
                effBaseb42 = effBaseb42.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb42 = this.cost().continuum} else {spentStackb42 = new Decimal(x)}
                effStackb42 = spentStackb42.times(buyableEffect('sf', 22)).add(buyableEffect('b', 43)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb42, effStackb42), spent: initialCostb42.times(spentStackb42).times(spentStackb42.add(1)).div(2)}
            },
            title() { return "building 42"},
            display() { return "multiply building 41 effect by "+format(effBaseb42)+" <br> cost: "+format(this.cost().cost)+" building 41s <br> owned: "+format(effStackb42)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[41].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[41].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[41] = player[this.layer].buyables[41].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        43: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb43 = new Decimal(x).add(1)

                continuumb43 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 44))

                return {cost: costStackb43, continuum: continuumb43}
            },
            effect(x) {
                effBaseb43 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb43 = this.cost().continuum} else {effStackb43 = new Decimal(x)}

                return Decimal.times(effBaseb43, effStackb43)
            },
            title() { return "building 43"},
            display() { return "gives "+format(effBaseb43)+" free levels to building 42 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb43)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        44: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb44 = new Decimal(1)
                costStackb44 = new Decimal(x).add(1)

                return Decimal.times(linearCostb44, costStackb44).round()
            },
            effect(x) {
                effBaseb44 = new Decimal(2)
                effStackb44 = new Decimal(x)

                return Decimal.pow(effBaseb44, effStackb44)
            },
            title() { return "building 44"},
            display() { return "multiplies building 42 levels by "+format(effBaseb44)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb44)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costStackb51 = new Decimal(x).add(buyableEffect('b', 52).spent)
                buyableTierb51 = new Decimal(50/5)
                constantCostb51 = Decimal.pow(1.04, buyableTierb51.pow(2)).times(Decimal.pow(10, buyableTierb51))
                linearCostb51 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb51 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))

                if (hasUpgrade('h', 21)) {linearCostb51 = linearCostb51.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb51 = quadraticCostb51.root(upgradeEffect('h', 21))}

                constantCostLogb51 = constantCostb51.log10()
                linearCostLogb51 = linearCostb51.log10()
                quadraticCostLogb51 = quadraticCostb51.log10()
                
                if (player.b.points.lte(constantCostb51.div(linearCostb51).times(quadraticCostb51))) {continuumb51 = new Decimal(0)} else {continuumb51 = player.b.points.log10().sub(constantCostLogb51).times(quadraticCostLogb51).times(4).add(linearCostLogb51.pow(2)).pow(1/2).sub(linearCostLogb51).div(quadraticCostLogb51).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb51.times(linearCostb51.pow(costStackb51)).times(quadraticCostb51.pow(costStackb51.pow(2))).floor(), continuum: continuumb51}
            },
            effect(x) {
                effBaseb51 = Decimal.dTen.pow(buyableTierb51).times(buyableEffect('b', 52).effect)

                if (hasMilestone('c', 1)) {effStackb51 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb51 = this.cost().continuum.sub(buyableEffect('b', 52).spent)} else {effStackb51 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+5).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+5).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb51 = effBaseb51.times(totalSynergyBoost)


                return Decimal.times(effBaseb51, effStackb51).max(0)
            },
            title() { return "building 51"},
            display() { return "increase cookie gain by "+format(effBaseb51)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb51)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                initialCostb52 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb52 = initialCostb52.div(upgradeEffect('h', 22))}

                costMultb52 = new Decimal(x).add(1)

                continuumb52 = layers.b.buyables[51].cost().continuum.div(initialCostb52).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 54))

                return {cost: Decimal.times(initialCostb52, costMultb52), continuum: continuumb52}

            },
            effect(x) {
                effBaseb52 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 15))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb52 = effBaseb52.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb52 = effBaseb52.times(upgradeEffect('h', 23))}
                effBaseb52 = effBaseb52.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb52 = this.cost().continuum} else {spentStackb52 = new Decimal(x)}
                effStackb52 = spentStackb52.times(buyableEffect('sf', 22)).add(buyableEffect('b', 53)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb52, effStackb52), spent: initialCostb52.times(spentStackb52).times(spentStackb52.add(1)).div(2)}
            },
            title() { return "building 52"},
            display() { return "multiply building 51 effect by "+format(effBaseb52)+" <br> cost: "+format(this.cost().cost)+" building 51s <br> owned: "+format(effStackb52)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[51].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[51].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[51] = player[this.layer].buyables[51].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        53: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb53 = new Decimal(x).add(1)

                continuumb53 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 54))

                return {cost: costStackb53, continuum: continuumb53}
            },
            effect(x) {
                effBaseb53 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb53 = this.cost().continuum} else {effStackb53 = new Decimal(x)}

                return Decimal.times(effBaseb53, effStackb53)
            },
            title() { return "building 53"},
            display() { return "gives "+format(effBaseb53)+" free levels to building 52 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb53)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        54: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb54 = new Decimal(1)
                costStackb54 = new Decimal(x).add(1)

                return Decimal.times(linearCostb54, costStackb54).round()
            },
            effect(x) {
                effBaseb54 = new Decimal(2)
                effStackb54 = new Decimal(x)

                return Decimal.pow(effBaseb54, effStackb54)
            },
            title() { return "building 54"},
            display() { return "multiplies building 52 levels by "+format(effBaseb54)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb54)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        61: {
            unlocked() {return true},
            cost(x) {
                costStackb61 = new Decimal(x).add(buyableEffect('b', 62).spent)
                buyableTierb61 = new Decimal(60/4)
                constantCostb61 = Decimal.pow(1.04, buyableTierb61.pow(2)).times(Decimal.pow(10, buyableTierb61))
                linearCostb61 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb61 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))

                if (hasUpgrade('h', 21)) {linearCostb61 = linearCostb61.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb61 = quadraticCostb61.root(upgradeEffect('h', 21))}

                constantCostLogb61 = constantCostb61.log10()
                linearCostLogb61 = linearCostb61.log10()
                quadraticCostLogb61 = quadraticCostb61.log10()
                
                if (player.b.points.lte(constantCostb61.div(linearCostb61).times(quadraticCostb61))) {continuumb61 = new Decimal(0)} else {continuumb61 = player.b.points.log10().sub(constantCostLogb61).times(quadraticCostLogb61).times(4).add(linearCostLogb61.pow(2)).pow(1/2).sub(linearCostLogb61).div(quadraticCostLogb61).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb61.times(linearCostb61.pow(costStackb61)).times(quadraticCostb61.pow(costStackb61.pow(2))).floor(), continuum: continuumb61}
            },
            effect(x) {
                effBaseb61 = Decimal.dTen.pow(buyableTierb61).times(buyableEffect('b', 62).effect)

                if (hasMilestone('c', 1)) {effStackb61 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb61 = this.cost().continuum.sub(buyableEffect('b', 62).spent)} else {effStackb61 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+6).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+6).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb61 = effBaseb61.times(totalSynergyBoost)


                return Decimal.times(effBaseb61, effStackb61).max(0)
            },
            title() { return "building 61"},
            display() { return "increase cookie gain by "+format(effBaseb61)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb61)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        62: {
            unlocked() {return true},
            cost(x) {
                initialCostb62 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb62 = initialCostb62.div(upgradeEffect('h', 22))}

                costMultb62 = new Decimal(x).add(1)

                continuumb62 = layers.b.buyables[61].cost().continuum.div(initialCostb62).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 64))

                return {cost: Decimal.times(initialCostb62, costMultb62), continuum: continuumb62}

            },
            effect(x) {
                effBaseb62 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 16))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb62 = effBaseb62.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb62 = effBaseb62.times(upgradeEffect('h', 23))}
                effBaseb62 = effBaseb62.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb62 = this.cost().continuum} else {spentStackb62 = new Decimal(x)}
                effStackb62 = spentStackb62.times(buyableEffect('sf', 22)).add(buyableEffect('b', 63)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb62, effStackb62), spent: initialCostb62.times(spentStackb62).times(spentStackb62.add(1)).div(2)}
            },
            title() { return "building 62"},
            display() { return "multiply building 61 effect by "+format(effBaseb62)+" <br> cost: "+format(this.cost().cost)+" building 61s <br> owned: "+format(effStackb62)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[61].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[61].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[61] = player[this.layer].buyables[61].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        63: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb63 = new Decimal(x).add(1)

                continuumb63 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 64))

                return {cost: costStackb63, continuum: continuumb63}
            },
            effect(x) {
                effBaseb63 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb63 = this.cost().continuum} else {effStackb63 = new Decimal(x)}

                return Decimal.times(effBaseb63, effStackb63)
            },
            title() { return "building 63"},
            display() { return "gives "+format(effBaseb63)+" free levels to building 62 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb63)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        64: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb64 = new Decimal(1)
                costStackb64 = new Decimal(x).add(1)

                return Decimal.times(linearCostb64, costStackb64).round()
            },
            effect(x) {
                effBaseb64 = new Decimal(2)
                effStackb64 = new Decimal(x)

                return Decimal.pow(effBaseb64, effStackb64)
            },
            title() { return "building 64"},
            display() { return "multiplies building 62 levels by "+format(effBaseb64)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb64)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        71: {
            unlocked() {return true},
            cost(x) {
                costStackb71 = new Decimal(x).add(buyableEffect('b', 72).spent)
                buyableTierb71 = new Decimal(70/3)
                constantCostb71 = Decimal.pow(1.04, buyableTierb71.pow(2)).times(Decimal.pow(10, buyableTierb71))
                linearCostb71 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb71 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))

                if (hasUpgrade('h', 21)) {linearCostb71 = linearCostb71.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb71 = quadraticCostb71.root(upgradeEffect('h', 21))}

                constantCostLogb71 = constantCostb71.log10()
                linearCostLogb71 = linearCostb71.log10()
                quadraticCostLogb71 = quadraticCostb71.log10()
                
                if (player.b.points.lte(constantCostb71.div(linearCostb71).times(quadraticCostb71))) {continuumb71 = new Decimal(0)} else {continuumb71 = player.b.points.log10().sub(constantCostLogb71).times(quadraticCostLogb71).times(4).add(linearCostLogb71.pow(2)).pow(1/2).sub(linearCostLogb71).div(quadraticCostLogb71).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb71.times(linearCostb71.pow(costStackb71)).times(quadraticCostb71.pow(costStackb71.pow(2))).floor(), continuum: continuumb71}
            },
            effect(x) {
                effBaseb71 = Decimal.dTen.pow(buyableTierb71).times(buyableEffect('b', 72).effect)

                if (hasMilestone('c', 1)) {effStackb71 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb71 = this.cost().continuum.sub(buyableEffect('b', 72).spent)} else {effStackb71 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+7).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+7).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb71 = effBaseb71.times(totalSynergyBoost)


                return Decimal.times(effBaseb71, effStackb71).max(0)
            },
            title() { return "building 71"},
            display() { return "increase cookie gain by "+format(effBaseb71)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb71)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        72: {
            unlocked() {return true},
            cost(x) {
                initialCostb72 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb72 = initialCostb72.div(upgradeEffect('h', 22))}

                costMultb72 = new Decimal(x).add(1)

                continuumb72 = layers.b.buyables[71].cost().continuum.div(initialCostb72).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 74))

                return {cost: Decimal.times(initialCostb72, costMultb72), continuum: continuumb72}
            },
            effect(x) {
                effBaseb72 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 17))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb72 = effBaseb72.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb72 = effBaseb72.times(upgradeEffect('h', 23))}
                effBaseb72 = effBaseb72.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb72 = this.cost().continuum} else {spentStackb72 = new Decimal(x)}
                effStackb72 = spentStackb72.times(buyableEffect('sf', 22)).add(buyableEffect('b', 73)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb72, effStackb72), spent: initialCostb72.times(spentStackb72).times(spentStackb72.add(1)).div(2)}
            },
            title() { return "building 72"},
            display() { return "multiply building 71 effect by "+format(effBaseb72)+" <br> cost: "+format(this.cost().cost)+" building 71s <br> owned: "+format(effStackb72)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[71].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[71].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[71] = player[this.layer].buyables[71].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        73: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb73 = new Decimal(x).add(1)

                continuumb73 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 74))

                return {cost: costStackb73, continuum: continuumb73}
            },
            effect(x) {
                effBaseb73 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb73 = this.cost().continuum} else {effStackb73 = new Decimal(x)}

                return Decimal.times(effBaseb73, effStackb73)
            },
            title() { return "building 73"},
            display() { return "gives "+format(effBaseb73)+" free levels to building 72 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb73)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        74: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb74 = new Decimal(1)
                costStackb74 = new Decimal(x).add(1)

                return Decimal.times(linearCostb74, costStackb74).round()
            },
            effect(x) {
                effBaseb74 = new Decimal(2)
                effStackb74 = new Decimal(x)

                return Decimal.pow(effBaseb74, effStackb74)
            },
            title() { return "building 74"},
            display() { return "multiplies building 72 levels by "+format(effBaseb74)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb74)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        81: {
            unlocked() {return true},
            cost(x) {
                costStackb81 = new Decimal(x).add(buyableEffect('b', 82).spent)
                buyableTierb81 = new Decimal(80/2)
                constantCostb81 = Decimal.pow(1.04, buyableTierb81.pow(2)).times(Decimal.pow(10, buyableTierb81))

                linearCostb81 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb81 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))

                if (hasUpgrade('h', 21)) {linearCostb81 = linearCostb81.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb81 = quadraticCostb81.root(upgradeEffect('h', 21))}

                constantCostLogb81 = constantCostb81.log10()
                linearCostLogb81 = linearCostb81.log10()
                quadraticCostLogb81 = quadraticCostb81.log10()
                
                if (player.b.points.lte(constantCostb81.div(linearCostb81).times(quadraticCostb81))) {continuumb81 = new Decimal(0)} else {continuumb81 = player.b.points.log10().sub(constantCostLogb81).times(quadraticCostLogb81).times(4).add(linearCostLogb81.pow(2)).pow(1/2).sub(linearCostLogb81).div(quadraticCostLogb81).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb81.times(linearCostb81.pow(costStackb81)).times(quadraticCostb81.pow(costStackb81.pow(2))).floor(), continuum: continuumb81}
            },
            effect(x) {
                effBaseb81 = Decimal.dTen.pow(buyableTierb81).times(buyableEffect('b', 82).effect)

                if (hasMilestone('c', 1)) {effStackb81 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb81 = this.cost().continuum.sub(buyableEffect('b', 82).spent)} else {effStackb81 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+8).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+8).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb81 = effBaseb81.times(totalSynergyBoost)


                return Decimal.times(effBaseb81, effStackb81).max(0)
            },
            title() { return "building 81"},
            display() { return "increase cookie gain by "+format(effBaseb81)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb81)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        82: {
            unlocked() {return true},
            cost(x) {
                initialCostb82 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb82 = initialCostb82.div(upgradeEffect('h', 22))}

                costMultb82 = new Decimal(x).add(1)

                continuumb82 = layers.b.buyables[81].cost().continuum.div(initialCostb82).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 84))

                return {cost: Decimal.times(initialCostb82, costMultb82), continuum: continuumb82}

            },
            effect(x) {
                effBaseb82 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 18))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb82 = effBaseb82.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb82 = effBaseb82.times(upgradeEffect('h', 23))}
                effBaseb82 = effBaseb82.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb82 = this.cost().continuum} else {spentStackb82 = new Decimal(x)}
                effStackb82 = spentStackb82.times(buyableEffect('sf', 22)).add(buyableEffect('b', 83)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb82, effStackb82), spent: initialCostb82.times(spentStackb82).times(spentStackb82.add(1)).div(2)}
            },
            title() { return "building 82"},
            display() { return "multiply building 81 effect by "+format(effBaseb82)+" <br> cost: "+format(this.cost().cost)+" building 81s <br> owned: "+format(effStackb82)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[81].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[81].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[81] = player[this.layer].buyables[81].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        83: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb83 = new Decimal(x).add(1)

                continuumb83 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 84))

                return {cost: costStackb83, continuum: continuumb83}
            },
            effect(x) {
                effBaseb83 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb83 = this.cost().continuum} else {effStackb83 = new Decimal(x)}

                return Decimal.times(effBaseb83, effStackb83)
            },
            title() { return "building 83"},
            display() { return "gives "+format(effBaseb83)+" free levels to building 82 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb83)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        84: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb84 = new Decimal(1)
                costStackb84 = new Decimal(x).add(1)

                return Decimal.times(linearCostb84, costStackb84).round()
            },
            effect(x) {
                effBaseb84 = new Decimal(2)
                effStackb84 = new Decimal(x)

                return Decimal.pow(effBaseb84, effStackb84)
            },
            title() { return "building 84"},
            display() { return "multiplies building 82 levels by "+format(effBaseb84)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb84)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        91: {
            unlocked() {return true},
            cost(x) {
                costStackb91 = new Decimal(x).add(buyableEffect('b', 92).spent)
                buyableTierb91 = new Decimal(90/1)
                constantCostb91 = Decimal.pow(1.04, buyableTierb91.pow(2)).times(Decimal.pow(10, buyableTierb91))

                linearCostb91 = new Decimal(1.1).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                quadraticCostb91 = new Decimal(1.001).root(clickableEffect('h', (this.id % 10)*10+Math.floor(this.id/10)))
                
                if (hasUpgrade('h', 21)) {linearCostb91 = linearCostb91.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb91 = quadraticCostb91.root(upgradeEffect('h', 21))}

                constantCostLogb91 = constantCostb91.log10()
                linearCostLogb91 = linearCostb91.log10()
                quadraticCostLogb91 = quadraticCostb91.log10()
                
                if (player.b.points.lte(constantCostb91.div(linearCostb91).times(quadraticCostb91))) {continuumb91 = new Decimal(0)} else {continuumb91 = player.b.points.log10().sub(constantCostLogb91).times(quadraticCostLogb91).times(4).add(linearCostLogb91.pow(2)).pow(1/2).sub(linearCostLogb91).div(quadraticCostLogb91).div(2).add(1).max(0).times(buyableEffect('c', 22))} //ok
                
                return {cost: constantCostb91.times(linearCostb91.pow(costStackb91)).times(quadraticCostb91.pow(costStackb91.pow(2))).floor(), continuum: continuumb91}
            },
            effect(x) {
                effBaseb91 = Decimal.dTen.pow(buyableTierb91).times(buyableEffect('b', 92).effect)

                if (hasMilestone('c', 1)) {effStackb91 = this.cost().continuum} else if (hasMilestone('c', 0)) {effStackb91 = this.cost().continuum.sub(buyableEffect('b', 92).spent)} else {effStackb91 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+9).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+9).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb91 = effBaseb91.times(totalSynergyBoost)


                return Decimal.times(effBaseb91, effStackb91).max(0)
            },
            title() { return "building 91"},
            display() { return "increase cookie gain by "+format(effBaseb91)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb91)+" <br> effect: "+format(this.effect())},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { 
                if (hasMilestone('c', 0)) {return false} else {return player[this.layer].points.gte(this.cost().cost)} },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        92: {
            unlocked() {return true},
            cost(x) {
                initialCostb92 = new Decimal(5).div(clickableEffect('h', (this.id % 10)*10+10+Math.floor(this.id/10)))
                if (hasUpgrade('h', 22)) {initialCostb92 = initialCostb92.div(upgradeEffect('h', 22))}

                costMultb92 = new Decimal(x).add(1)

                continuumb92 = layers.b.buyables[91].cost().continuum.div(initialCostb92).times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('c', 32)).times(buyableEffect('b', 94))

                return {cost: Decimal.times(initialCostb92, costMultb92), continuum: continuumb92}
            },
            effect(x) {
                effBaseb92 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 19))
                if ((getClickableState('au', 16) * 10 + 2 == this.id)&&(getBuyableAmount('au', 16).gt(0))) {effBaseb92 = effBaseb92.add(getClickableState('au', 17))}
                if (hasUpgrade('h', 23)) {effBaseb92 = effBaseb92.times(upgradeEffect('h', 23))}
                effBaseb92 = effBaseb92.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 22))}

                if (hasMilestone('c', 1)) {spentStackb92 = this.cost().continuum} else {spentStackb92 = new Decimal(x)}
                effStackb92 = spentStackb92.times(buyableEffect('sf', 22)).add(buyableEffect('b', 93)).times(buyableEffect('b', 14))

                return {effect: Decimal.pow(effBaseb92, effStackb92), spent: initialCostb92.times(spentStackb92).times(spentStackb92.add(1)).div(2)}
            },
            title() { return "building 92"},
            display() { return "multiply building 91 effect by "+format(effBaseb92)+" <br> cost: "+format(this.cost().cost)+" building 91s <br> owned: "+format(effStackb92)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            style() {const size = {width: "160px", height: "160px"}
            return size},
            canAfford() { if (hasMilestone('c', 1)) {return false} else if (hasMilestone('c', 0)) {return layers.b.buyables[91].cost().continuum.sub(this.effect().spent).gte(this.cost().cost)} else {return player[this.layer].buyables[91].gte(this.cost().cost)} },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[91] = player[this.layer].buyables[91].sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        93: {
            unlocked() {return buyableEffect('p', 31).gte(1)},
            cost(x) {
                costStackb93 = new Decimal(x).add(1)

                continuumb93 = player.s.best.times(8).add(1).pow(1/2).sub(1).div(2).times(buyableEffect('b', 94))

                return {cost: costStackb93, continuum: continuumb93}
            },
            effect(x) {
                effBaseb93 = new Decimal(1).times(buyableEffect('sf', 21))
                if (hasMilestone('c', 1)) {effStackb93 = this.cost().continuum} else {effStackb93 = new Decimal(x)}

                return Decimal.times(effBaseb93, effStackb93)
            },
            title() { return "building 93"},
            display() { return "gives "+format(effBaseb93)+" free levels to building 92 <br> cost: "+format(this.cost().cost)+" sugar <br> owned: "+format(effStackb93)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.s.points.gte(this.cost().cost)&&(!hasMilestone('c', 1))) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#e1f09b", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        94: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                linearCostb94 = new Decimal(1)
                costStackb94 = new Decimal(x).add(1)

                return Decimal.times(linearCostb94, costStackb94).round()
            },
            effect(x) {
                effBaseb94 = new Decimal(2)
                effStackb94 = new Decimal(x)

                return Decimal.pow(effBaseb94, effStackb94)
            },
            title() { return "building 94"},
            display() { return "multiplies building 92 levels by "+format(effBaseb94)+" <br> cost: "+format(this.cost())+" hypersugar <br> owned: "+format(effStackb94)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.hs.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) {return { background: "#d9e894", width: "160px", height: "160px" }} else {return {width: "160px", height: "160px"}}
            },
            buy() {
                player.hs.points = player.hs.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        101: {
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                return Decimal.dInf
            },
            canAfford() { 
                return false},
            buy() {
            },
            buyMax() {

            },
        },
    },
})

addLayer("s", {
    name: "sugar", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#e1f09b",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "sugar", // Name of prestige currency
    baseResource: "none", // Name of resource prestige is based on
    baseAmount() {return new Decimal(0)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mults = new Decimal(1/180).times(buyableEffect('p', 31).add(buyableEffect('sf', 11)))
        if (hasUpgrade('h', 14)) {mults = mults.times(upgradeEffect('h', 14))}
        if (hasUpgrade('h', 44)) {mults = mults.times(upgradeEffect('h', 44))}
        mults = mults.times(buyableEffect('c', 13))
        mults = mults.times(buyableEffect('sf', 101))

        return mults
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exps = new Decimal(1).times(buyableEffect('sf', 31))


        return exps
    },
    getResetGain() {
        if (player.s.points.gte(1)) { return mults.pow(exps)} else {return mults}

    },
    getNextAt() {

        return new Decimal(1)
    },
    canReset() {return false}, //change false to autogain trigger
    update(diff) { 
        addPoints('s', getResetGain('s').times(diff))
    },
    prestigeNotify() {return true},
    prestigeButtonText() { 
        texts = "You cannot reset this layer. You are gaining "
        if (getResetGain('s').eq(0)) {texts += " no sugar"} 
        else if (getResetGain('s').gte(1)) {texts += format(getResetGain('s'))+" sugar every second"}
        else {texts += " a sugar every "+formatTime(getResetGain('s').pow(-1))}
        return texts
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 1,
    hotkeys: [

    ],
    layerShown() {return buyableEffect('p', 31).gte(1)||player.sf.total.gte(1)||player.s.total.gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) { //change false to keep building trigger
        keepSugarRow = 2
        if (hasMilestone('c', 0)) {keepSugarRow = 3}
        if (hasMilestone('m', 0)) {keepSugarRow = 999}
        if ((layers[resettingLayer].row > keepSugarRow)) {
            layerDataReset(this.layer, [""])
        } else {

        }
        
    },
    clickables: {

    },
    buyables: {
        11: {
            unlocked() {return buyableEffect('c', 33).gte(1)},
            cost(x) {
                costStacks11 = new Decimal(x).add(1).div(buyableEffect('c', 33)).sub(1)
                costBases11 = new Decimal(2)
                costExps11 = new Decimal(2)

                return costBases11.pow(costExps11.pow(costStacks11))
            },
            effect(x) {
                effBases11 = new Decimal(1)
                effStacks11 = new Decimal(x)

                return Decimal.times(effBases11, effStacks11)
            },
            title() { return "sugar buyable 11"},
            display() { return "grant "+format(effBases11)+" hypersugar. <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())+" total hypersugar"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                addPoints('hs', new Decimal(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
    },
    upgrades: {
    }
})

addLayer("hs", {
    name: "hypersugar", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HS", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d9e894",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "hypersugar", // Name of prestige currency
    baseResource: "none", // Name of resource prestige is based on
    baseAmount() {return new Decimal(0)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mulths = new Decimal(1)


        return mulths
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    getResetGain() {


        return mulths
    },
    getNextAt() {

        return new Decimal(1)
    },
    canReset() {return false}, //change false to autogain trigger
    prestigeNotify() {return true},
    prestigeButtonText() { 
        texths = "You cannot reset this layer. "
        return texths
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 1,
    hotkeys: [

    ],
    layerShown() {return buyableEffect('c', 33).gte(1)||player.hs.total.gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) { //change false to keep building trigger
        keepSugarRow = 2
        if (hasMilestone('c', 0)) {keepSugarRow = 3}
        if (hasMilestone('m', 0)) {keepSugarRow = 999}
        if ((layers[resettingLayer].row > keepSugarRow)) {
            layerDataReset(this.layer, [""])
        } else {

        }
        
    },
    clickables: {

    },
    buyables: {
    },
    upgrades: {
    }
})

addLayer("p", {
    name: "prestige points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#6bc658",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "cookies", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multp = new Decimal(0.001)


        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1/3).add(buyableEffect('h', 14))
        if (hasUpgrade('h', 12)) {expp = expp.times(upgradeEffect('h', 12))}
        if (hasUpgrade('h', 42)) {expp = expp.times(upgradeEffect('h', 42))}
        expp = expp.times(buyableEffect('c', 21))
        return expp
    },
    getResetGain() {
        basep = player.points

        pp = basep.times(multp).pow(expp)

        return pp.sub(player.p.total).floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1).add(player.p.total)
        nextp = nextp.root(expp).div(multp)

        return nextp
    },
    canReset() {return getResetGain('p').gte(0)&&!(hasMilestone('c', 0))}, //change false to autogain trigger
    update(diff) { if (hasMilestone('c', 0)) {

        pgainPerSecond = getPointGen().times(multp).pow(expp)
        
        setBuyableAmount('p', 101, pgainPerSecond)
        addPoints('p', pgainPerSecond.times(diff))
        } else {}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {
        if (hasMilestone('c', 0)) {
            return "The automatic resets are giving you "+format(getBuyableAmount('p', 101))+" prestige points every second"
        } else {
            return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" cookies"
        }
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return player.points.gte(1e3)||player.p.total.gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}
        if (hasMilestone('c', 2)) {
            setBuyableAmount('p', 21, new Decimal(9))
            setBuyableAmount('p', 22, new Decimal(9))
        }

    },
    clickables: {

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costStackp11 = new Decimal(x)
                constantCostp11 = new Decimal(1)
                linearCostp11 = new Decimal(1.85)
                quadraticCostp11 = new Decimal(1.082)


                constantCostLogp11 = constantCostp11.log10()
                linearCostLogp11 = linearCostp11.log10()
                quadraticCostLogp11 = quadraticCostp11.log10()

                if (player.p.points.lte(constantCostp11.div(linearCostp11).times(quadraticCostp11))) {continuump11 = new Decimal(0)} else {continuump11 = player.p.points.log10().sub(constantCostLogp11).times(quadraticCostLogp11).times(4).add(linearCostLogp11.pow(2)).pow(1/2).sub(linearCostLogp11).div(quadraticCostLogp11).div(2).add(1).max(0)}
                
                return {cost: constantCostp11.times(linearCostp11.pow(costStackp11)).times(quadraticCostp11.pow(costStackp11.pow(2))).floor(), continuum: continuump11}
            },
            effect(x) {
                effBasep11 = new Decimal(0.1)

                crunchcomponent = player.c.total.add(10).log10().pow(1/3).pow10().div(10)
                if (crunchcomponent.gte(3)) {crunchcomponent = crunchcomponent.div(3).pow(1.5).times(3).min(10)}
                //if (crunchcomponent.gte(6)) {crunchcomponent = crunchcomponent.div(6).pow(0.66666666666666666).times(6).min(10)}

                if (player.h.total.lte(10)) {heavenlycomponent = player.h.total.add(1)}
                else {
                    heavenlycomponent = player.h.total.add(1).log10().log10()
                    if (heavenlycomponent.gte(1e10)) {heavenlycomponent = heavenlycomponent.pow(0.9)}
                    if (heavenlycomponent.gte(1e50)) {heavenlycomponent = heavenlycomponent.div(1.6989700043360188).pow(8/9).times(1.6989700043360188)}
                    if (heavenlycomponent.gte('e250')) {heavenlycomponent = heavenlycomponent.div(2.3979400086720376).pow(5/8).times(2.3979400086720376)}
                    heavenlycomponent = heavenlycomponent.pow10().pow10().min('e1000')
                }

                if (player.p.total.lte(10)) {prestigecomponent = player.p.total.div(10)}
                else {
                    prestigecomponent = player.p.total.div(10).log10().log10()
                    if (prestigecomponent.gte(2)) {prestigecomponent = prestigecomponent.div(2).pow(0.9).times(2)}
                    if (prestigecomponent.gte(2.6989700043360188)) {prestigecomponent = prestigecomponent.div(2.6989700043360188).pow(8/9).times(2.6989700043360188)}
                    if (prestigecomponent.gte(3.3010299956639812)) {prestigecomponent = prestigecomponent.div(3.3010299956639812).pow(5/8).times(3.3010299956639812)}
                    prestigecomponent = prestigecomponent.pow10().pow10().min('e9000')
                }


                effPerBuyable = Decimal.times(heavenlycomponent, prestigecomponent)
                if (effPerBuyable.gte(1)) {effPerBuyable = effPerBuyable.pow(crunchcomponent)}

                if (hasMilestone('c', 1)) {effStackp11 = this.cost().continuum} else {effStackp11 = new Decimal(x)}

                return effPerBuyable.times(effStackp11).add(1)
            },
            title() { return "prestige buyable 11"},
            display() { 
                textone = "increase cookie gain by "+format(effBasep11)+" times cookie gain per total prestige point <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackp11)+" <br> effect: "+format(this.effect())
                if (prestigecomponent.gte('1e9000')) {textone += "<br> capped at e9000 effect "}  
                else if (prestigecomponent.gte('1e2000')) {textone += "<br> beyond e2000 effect, effect second exponent ^0.5"}  
                else if (prestigecomponent.gte('1e500')) {textone += "<br> beyond e500 effect, effect second exponent ^0.8"}  
                else if (prestigecomponent.gte(1e100)) {textone += "<br> beyond 1e100 prestige points, effect second exponent ^0.9"} else {}
                textone += "<br> x"+format(heavenlycomponent)+" from heavenly cookies"
                textone += "<br> ^"+format(crunchcomponent)+" from crunch"
            return textone},
            canAfford() { return (player[this.layer].points.gte(this.cost().cost))&&(!hasMilestone('c', 1)) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costStackp12 = new Decimal(x)
                constantCostp12 = new Decimal(3)
                linearCostp12 = new Decimal(2.5)
                quadraticCostp12 = new Decimal(2)


                constantCostLogp12 = constantCostp12.log10()
                linearCostLogp12 = linearCostp12.log10()
                quadraticCostLogp12 = quadraticCostp12.log10()

                if (player.p.points.lte(constantCostp12.div(linearCostp12).times(quadraticCostp12))) {continuump12 = new Decimal(0)} else {continuump12 = player.p.points.log10().sub(constantCostLogp12).times(quadraticCostLogp12).times(4).add(linearCostLogp12.pow(2)).pow(1/2).sub(linearCostLogp12).div(quadraticCostLogp12).div(2).add(1).max(0)}
                
                return {cost: constantCostp12.times(linearCostp12.pow(costStackp12)).times(quadraticCostp12.pow(costStackp12.pow(2))).floor(), continuum: continuump12}
            },
            effect(x) {
                effBasep12 = Decimal.dOne
                if (hasUpgrade('h', 24)) {effBasep12 = effBasep12.add(upgradeEffect('h', 24))}
                if (hasUpgrade('c', 23)) {effBasep12 = effBasep12.add(upgradeEffect('c', 23))}
                if (hasMilestone('c', 1)) {effStackp12 = this.cost().continuum} else {effStackp12 = new Decimal(x)}

                return Decimal.times(effBasep12, effStackp12)
            },
            title() { return "prestige buyable 12"},
            display() { return "increase building ?2 effects by "+format(effBasep12)+" <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player[this.layer].points.gte(this.cost().cost))&&(!hasMilestone('c', 1)) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costStackp13 = new Decimal(x)
                constantCostp13 = new Decimal(10)
                linearCostp13 = new Decimal(7)
                quadraticCostp13 = new Decimal(7)
                limiterCostp13 = new Decimal(79)

                constantCostLogp13 = constantCostp13.log10()
                linearCostLogp13 = linearCostp13.log10()
                quadraticCostLogp13 = quadraticCostp13.log10()

                if (player.p.points.lte(10)) {continuump13 = Decimal.dZero} else {continuump13 = limiterCostp13.times(linearCostLogp13).add(player.p.points.log10()).pow(2).sub(limiterCostp13.pow(2).times(quadraticCostLogp13).times(4).times(quadraticCostLogp13.sub(player.p.points.log10()))).pow(1/2).sub(limiterCostp13.times(linearCostLogp13)).sub(player.p.points.log10()).div(limiterCostp13.times(quadraticCostLogp13).times(2)).max(0).min(limiterCostp13.sub(1))}

                return {cost: constantCostp13.times(linearCostp13.pow(costStackp13)).times(quadraticCostp13.pow(costStackp13.pow(2))).pow(limiterCostp13.div(limiterCostp13.sub(costStackp13))).round(), continuum: continuump13}
            },
            effect(x) {
                effBasep13 = new Decimal(1/18)
                if (hasMilestone('c', 1)) {effStackp13 = this.cost().continuum} else {effStackp13 = new Decimal(x)}

                return Decimal.times(effBasep13, effStackp13)
            },
            purchaseLimit: new Decimal(78),
            title() { return "prestige buyable 13"},
            display() { return "increase the building gain exponent by "+format(effBasep13)+" <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player[this.layer].points.gte(this.cost().cost))&&(!hasMilestone('c', 1)) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costStackp21 = new Decimal(x).add(1)
                costStackp21 = Decimal.div(costStackp21, Decimal.dTen.sub(costStackp21)).times(10)
                constantCostp21 = new Decimal(1)
                linearCostp21 = new Decimal(1e4)
                quadraticCostp21 = new Decimal(1.16985856)


                return constantCostp21.times(linearCostp21.pow(costStackp21)).times(quadraticCostp21.pow(costStackp21.pow(2))).floor()
            },
            purchaseLimit: new Decimal(9),
            effect(x) {
                effBasep21 = new Decimal(2.5)
                if (hasUpgrade('c', 24)) {effBasep21 = effBasep21.times(upgradeEffect('c', 24))}
                effStackp21 = new Decimal(1)

                return Decimal.times(effBasep21, effStackp21)
            },
            title() { return "prestige buyable 21"},
            display() { return "raise the building ?2 strength by "+format(this.effect())+" for building "+format(getBuyableAmount(this.layer, this.id).add(1), 0)+"2 <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costStackp22 = new Decimal(x).add(1)
                costStackp22 = Decimal.div(costStackp22, Decimal.dTen.sub(costStackp22)).times(10)
                constantCostp22 = new Decimal(1)
                linearCostp22 = new Decimal('1e1600')
                quadraticCostp22 = new Decimal(1.04).pow(1600)


                return constantCostp22.times(linearCostp22.pow(costStackp22)).times(quadraticCostp22.pow(costStackp22.pow(2))).floor()
            },
            purchaseLimit: new Decimal(9),
            effect(x) {
                effBasep22 = new Decimal(1.5)
                if (hasUpgrade('c', 32)) {effBasep22 = effBasep22.times(upgradeEffect('c', 32))}
                effStackp22 = new Decimal(1)

                return Decimal.times(effBasep22, effStackp22)
            },
            title() { return "prestige buyable 22"},
            display() { return "raise the building ?2 strength by "+format(this.effect())+" again for building "+format(getBuyableAmount(this.layer, this.id).add(1), 0)+"2 <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costStackp31 = new Decimal(x)
                constantCostp31 = new Decimal(1e6)
                linearCostp31 = new Decimal(1e4)
                quadraticCostp31 = new Decimal(1e2)


                constantCostLogp31 = constantCostp31.log10()
                linearCostLogp31 = linearCostp31.log10()
                quadraticCostLogp31 = quadraticCostp31.log10()

                if (player.p.points.lte(constantCostp31.div(linearCostp31).times(quadraticCostp31))) {continuump31 = new Decimal(0)} else {continuump31 = player.p.points.log10().sub(constantCostLogp31).times(quadraticCostLogp31).times(4).add(linearCostLogp31.pow(2)).pow(1/2).sub(linearCostLogp31).div(quadraticCostLogp31).div(2).add(1).max(0)}
                
                return {cost: constantCostp31.times(linearCostp31.pow(costStackp31)).times(quadraticCostp31.pow(costStackp31.pow(2))).floor(), continuum: continuump31}
            },
            effect(x) {
                effBasep31 = new Decimal(1)
                effBasep31 = effBasep31.add(buyableEffect('sf', 12))
                if (hasMilestone('c', 1)) {effStackp31 = this.cost().continuum} else {effStackp31 = new Decimal(x)}

                return Decimal.times(effBasep31, effStackp31)
            },
            title() { return "prestige buyable 31"},
            display() { return "add sugar gain by "+format(effBasep31)+" every 3 minutes <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackp31)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player[this.layer].points.gte(this.cost().cost))&&(!hasMilestone('c', 1)) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        101: {
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                return Decimal.dInf
            },
            canAfford() { 
                return false},
            buy() {
            },
            buyMax() {

            },
        },
    },
})

addLayer("h", {
    name: "heavenly", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#f8ead7",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "heavenly cookies", // Name of prestige currency
    baseResource: "cookies", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multh = new Decimal(1e-30)


        return multh
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exph = new Decimal(1/12)
        if (hasUpgrade('h', 13)) {exph = exph.times(upgradeEffect('h', 13))}
        if (hasUpgrade('h', 43)) {exph = exph.times(upgradeEffect('h', 43))}
        exph = exph.times(buyableEffect('c', 31))
        exp2h = new Decimal(1/2)

        return exph
    },
    getResetGain() {
        baseh = player.points

        hp = baseh.times(multh).pow(exph)
        if (hp.gte(1)) {hp = hp.log10().pow(exp2h).pow10()}

        return hp.sub(player.h.total).floor().max(0)
    },
    getNextAt() {
        nexth = getResetGain('h').add(1).add(player.h.total)
        if (nexth.gte(1)) {nexth = nexth.log10().root(exp2h).pow10()}
        nexth = nexth.root(exph).div(multh)

        return nexth
    },
    canReset() {return getResetGain('h').gte(0)&&!(hasMilestone('m', 0))}, //change false to autogain trigger
    update(diff) { if (hasMilestone('m', 0)) {

        hgainPerReset = getPointGen().times(multh).pow(exph)
        if (hgainPerReset.gte(1)) {hgainPerReset = hgainPerReset.log10().pow(exp2h).pow10()} 

        
        setBuyableAmount('h', 101, hgainPerReset)
        addPoints('h', hgainPerReset.times(diff))
        } else {}
    },

    prestigeNotify() {return true},
    prestigeButtonText() {
        if (hasMilestone('m', 0)) {
            hgainPerReset = getPointGen().times(multh).pow(exph)
            if (hgainPerReset.gte(1)) {hgainPerReset = hgainPerReset.log10().pow(exp2h).pow10()} 
            return "The automatic resets are giving you "+format(getBuyableAmount('h', 101))+" heavenly cookies every second"
        } else {
            return "Reset for "+formatWhole(getResetGain('h'))+" heavenly cookies. Next at "+format(getNextAt('h'))+" cookies"
        }
    },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for heavenly cookies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return getResetGain('h').gte(1)||player.h.total.gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}
    },

    infoboxes: {
        A: {
            body() {
                return "Each upgrade locks all other upgrades in the row"
            }
        }
    },
    milestones: {
        0: {
            requirementDescription: "heavenly milestone 0",
            effectDescription: "1 heavenly cookies: start with 14 building points, multiply prestige buyable 11 effect by total heavenly cookies, automatically reset for building points every 1 seconds",
            done() { return player.h.total.gte(1)||hasMilestone('c', 0)||hasMilestone('m', 0)  }
        }
    },

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costStackh11 = new Decimal(x)
                constantCosth11 = new Decimal(1)
                linearCosth11 = new Decimal(1.2)
                quadraticCosth11 = new Decimal(1.002)

                constantCostLogh11 = constantCosth11.log10()
                linearCostLogh11 = linearCosth11.log10()
                quadraticCostLogh11 = quadraticCosth11.log10()

                if (player.h.points.lte(constantCosth11.div(linearCosth11).times(quadraticCosth11))) {continuumh11 = new Decimal(0)} else {continuumh11 = player.h.points.log10().sub(constantCostLogh11).times(quadraticCostLogh11).times(4).add(linearCostLogh11.pow(2)).pow(1/2).sub(linearCostLogh11).div(quadraticCostLogh11).div(2).add(1).max(0)}
                
                return {cost: constantCosth11.times(linearCosth11.pow(costStackh11)).times(quadraticCosth11.pow(costStackh11.pow(2))).floor(), continuum: continuumh11}

            },
            effect(x) {
                effBaseh11 = new Decimal(360)
                if (hasMilestone('m', 0)) {effStackh11 = this.cost().continuum} else {effStackh11 = new Decimal(x)}

                return Decimal.pow(effBaseh11, effStackh11)
            },
            title() { return "heavenly buyable 11"},
            display() { return "multiply the building automatic reset period by "+format(effBaseh11)+" <br> cost: "+format(this.cost().cost)+" <br>owned: "+format(effStackh11)+"<br> effect: "+formatTime(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost().cost)&&(!hasMilestone('m', 0)) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costStackh12 = new Decimal(x)
                constantCosth12 = new Decimal(5)
                linearCosth12 = new Decimal(1.35)
                quadraticCosth12 = new Decimal(1.13)
                cubicCosth12 = new Decimal(1.002)

                constantCostLogh12 = constantCosth12.log10()
                linearCostLogh12 = linearCosth12.log10()
                quadraticCostLogh12 = quadraticCosth12.log10()
                cubicCostLogh12 = cubicCosth12.log10()
                pointsLogh = player.h.points.max(10).log10()

                if (player.h.points.lt(100)) {continuumh12 = Decimal.dZero} else { //solve cubic equation using cubic formula

                    tempvar11 = quadraticCostLogh12.div(cubicCostLogh12).pow(3).div(-27).add(quadraticCostLogh12.times(linearCostLogh12).div(cubicCostLogh12.pow(2)).div(6)).sub(constantCostLogh12.sub(pointsLogh).div(cubicCostLogh12).div(2)) //(-b^3/27a^3+bc/6a^2-d/2a)
                    tempvar12 = linearCostLogh12.div(cubicCostLogh12).div(3).sub(quadraticCostLogh12.div(cubicCostLogh12).pow(2).div(9)).pow(3).add(tempvar11.pow(2)) // (-b^3/27a^3+bc/6a^2-d/2a)^2+(c/3a-b^2/9a^2)^3
                    tempvar13C = croot([tempvar12, Decimal.dZero], new Decimal(2))[0] //sqrt(previous)
                    tempvar14C = [tempvar11.add(tempvar13C[0]), tempvar13C[1]] //(-b^3/27a^3+bc/6a^2-d/2a)+sqrt(previous)
                    tempvar15C = [tempvar11.sub(tempvar13C[0]), Decimal.dZero.sub(tempvar13C[1])]//(-b^3/27a^3+bc/6a^2-d/2a)-sqrt(previous). this and above should be complex conjugate
                    tempvar16C = croot(tempvar14C, new Decimal(3))[0] //cbrt(first)
                    tempvar17C = croot(tempvar15C, new Decimal(3))[0] //cbrt(second) this and above should be complex conjugate
                    tempvar18C = [tempvar16C[0].add(tempvar17C[0]).sub(quadraticCostLogh12.div(cubicCostLogh12).div(3)), tempvar16C[1].add(tempvar17C[1])] //cbrt(first)+cbrt(second)-b/3a, generates maximum root. should have complex part of 0 (or floating point error)

                    continuumh12 = tempvar18C[0] //maximal cubic root


                }

                return {cost: constantCosth12.times(linearCosth12.pow(costStackh12)).times(quadraticCosth12.pow(costStackh12.pow(2))).times(cubicCosth12.pow(costStackh12.pow(3))).floor(), continuum: continuumh12}
            },
            effect(x) {
                effBaseh12 = new Decimal(1)
                if (hasMilestone('m', 0)) {effStackh12 = this.cost().continuum} else {effStackh12 = new Decimal(x)}

                return Decimal.times(effBaseh12, effStackh12)
            },
            title() { return "heavenly buyable 12"},
            display() { return "choose "+format(effBaseh12)+" buildings ?1 to divide its cost scaling by "+format(clickableEffect('h', 21))+"^(amount of times chosen^0.5). <br> <br> cost: "+format(this.cost().cost)+" <br> effect: "+format(this.effect())+" buildings assignable to cost group"},
            canAfford() { return player[this.layer].points.gte(this.cost().cost)&&(!hasMilestone('m', 0)) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costStackh13 = new Decimal(x)
                constantCosth13 = new Decimal(25)
                linearCosth13 = new Decimal(1.65)
                quadraticCosth13 = new Decimal(1.35)
                cubicCosth13 = new Decimal(1.003)

                constantCostLogh13 = constantCosth13.log10()
                linearCostLogh13 = linearCosth13.log10()
                quadraticCostLogh13 = quadraticCosth13.log10()
                cubicCostLogh13 = cubicCosth13.log10()
                pointsLogh = player.h.points.max(10).log10()

                if (player.h.points.lt(100)) {continuumh13 = Decimal.dZero} else { //solve cubic equation using cubic formula

                    tempvar21 = quadraticCostLogh13.div(cubicCostLogh13).pow(3).div(-27).add(quadraticCostLogh13.times(linearCostLogh13).div(cubicCostLogh13.pow(2)).div(6)).sub(constantCostLogh13.sub(pointsLogh).div(cubicCostLogh13).div(2)) //(-b^3/27a^3+bc/6a^2-d/2a)
                    tempvar22 = linearCostLogh13.div(cubicCostLogh13).div(3).sub(quadraticCostLogh13.div(cubicCostLogh13).pow(2).div(9)).pow(3).add(tempvar21.pow(2)) // (-b^3/27a^3+bc/6a^2-d/2a)^2+(c/3a-b^2/9a^2)^3
                    tempvar23C = croot([tempvar22, Decimal.dZero], new Decimal(2))[0] //sqrt(previous)
                    tempvar24C = [tempvar21.add(tempvar23C[0]), tempvar23C[1]] //(-b^3/27a^3+bc/6a^2-d/2a)+sqrt(previous)
                    tempvar25C = [tempvar21.sub(tempvar23C[0]), Decimal.dZero.sub(tempvar23C[1])]//(-b^3/27a^3+bc/6a^2-d/2a)-sqrt(previous). this and above should be complex conjugate
                    tempvar26C = croot(tempvar24C, new Decimal(3))[0] //cbrt(first)
                    tempvar27C = croot(tempvar25C, new Decimal(3))[0] //cbrt(second) this and above should be complex conjugate
                    tempvar28C = [tempvar26C[0].add(tempvar27C[0]).sub(quadraticCostLogh13.div(cubicCostLogh13).div(3)), tempvar26C[1].add(tempvar27C[1])] //cbrt(first)+cbrt(second)-b/3a, generates maximum root. should have complex part of 0 (or floating point error)

                    continuumh13 = tempvar28C[0] //maximal cubic root


                }

                return {cost: constantCosth13.times(linearCosth13.pow(costStackh13)).times(quadraticCosth13.pow(costStackh13.pow(2))).times(cubicCosth13.pow(costStackh13.pow(3))).floor(), continuum: continuumh13}
            },
            effect(x) {
                effBaseh13 = new Decimal(1)
                if (hasMilestone('m', 0)) {effStackh13 = this.cost().continuum} else {effStackh13 = new Decimal(x)}

                return Decimal.times(effBaseh13, effStackh13)
            },
            title() { return "heavenly buyable 13"},
            display() { return "choose "+format(effBaseh13)+" buildings ?2 to divide its cost scaling by "+format(clickableEffect('h', 41))+"^(amount of times chosen^0.5). <br> <br> cost: "+format(this.cost().cost)+" <br> effect: "+format(this.effect())+" buildings assignable to cost group"},
            canAfford() { return player[this.layer].points.gte(this.cost().cost)&&(!hasMilestone('m', 0)) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {
                costStackh14 = new Decimal(x)
                constantCosth14 = new Decimal(100)
                linearCosth14 = new Decimal(3)
                quadraticCosth14 = new Decimal(1.65)
                limiterCosth14 = new Decimal(61)

                constantCostLogh14 = constantCosth14.log10()
                linearCostLogh14 = linearCosth14.log10()
                quadraticCostLogh14 = quadraticCosth14.log10()

                if (player.h.points.lte(300)) {continuumh14 = Decimal.dZero} else {continuumh14 = limiterCosth14.times(linearCostLogh14).add(player.h.points.log10()).pow(2).sub(limiterCosth14.pow(2).times(quadraticCostLogh14).times(4).times(quadraticCostLogh14.sub(player.h.points.log10()))).pow(1/2).sub(limiterCosth14.times(linearCostLogh14)).sub(player.h.points.log10()).div(limiterCosth14.times(quadraticCostLogh14).times(2)).max(0).min(limiterCosth14.sub(1))}

                return {cost: constantCosth14.times(linearCosth14.pow(costStackh14)).times(quadraticCosth14.pow(costStackh14.pow(2))).pow(limiterCosth14.div(limiterCosth14.sub(costStackh14))).round(), continuum: continuumh14}
            },
            effect(x) {
                effBaseh14 = new Decimal(1/36)
                if (hasMilestone('m', 0)) {effStackh14 = this.cost().continuum} else {effStackh14 = new Decimal(x)}

                return Decimal.times(effBaseh14, effStackh14)
            },
            purchaseLimit: new Decimal(60),
            title() { return "heavenly buyable 14"},
            display() { return "increase the prestige gain exponent by "+format(effBaseh14)+" <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackh14)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player[this.layer].points.gte(this.cost().cost))&&(!hasMilestone('m', 0)) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        21: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                costStackh21 = new Decimal(x).add(1).div(buyableEffect('c', 23)).sub(1)
                constantCosth21 = new Decimal(100)
                linearCosth21 = new Decimal(5)
                quadraticCosth21 = new Decimal(2)

                constantCostLogh21 = constantCosth21.log10()
                linearCostLogh21 = linearCosth21.log10()
                quadraticCostLogh21 = quadraticCosth21.log10()

                if (player.h.points.lte(constantCosth21.div(linearCosth21).times(quadraticCosth21))) {continuumh21 = new Decimal(0)} else {continuumh21 = player.h.points.log10().sub(constantCostLogh21).times(quadraticCostLogh21).times(4).add(linearCostLogh21.pow(2)).pow(1/2).sub(linearCostLogh21).div(quadraticCostLogh21).div(2).add(1).max(0)}
                
                return {cost: constantCosth21.times(linearCosth21.pow(costStackh21)).times(quadraticCosth21.pow(costStackh21.pow(2))).floor(), continuum: continuumh21}
            },
            effect(x) {
                effBaseh21 = new Decimal(1)
                effStackh21 = new Decimal(x)

                return Decimal.times(effBaseh21, effStackh21)
            },
            title() { return "heavenly buyable 21"},
            display() { return "grant "+format(effBaseh21)+" synergy points. <br> cost: "+format(this.cost().cost)+" <br> effect: "+format(this.effect())+" total synergy point"},
            canAfford() { return player[this.layer].points.gte(this.cost().cost) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                addPoints('sy', new Decimal(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        22: {
            unlocked() {return hasUpgrade('h', 32)},
            cost(x) {
                costStackh22 = new Decimal(x).add(1).div(buyableEffect('c', 23)).sub(1)
                constantCosth22 = new Decimal(100)
                linearCosth22 = new Decimal(5)
                quadraticCosth22 = new Decimal(2)

                constantCostLogh22 = constantCosth22.log10()
                linearCostLogh22 = linearCosth22.log10()
                quadraticCostLogh22 = quadraticCosth22.log10()

                if (player.h.points.lte(constantCosth22.div(linearCosth22).times(quadraticCosth22))) {continuumh22 = new Decimal(0)} else {continuumh22 = player.h.points.log10().sub(constantCostLogh22).times(quadraticCostLogh22).times(4).add(linearCostLogh22.pow(2)).pow(1/2).sub(linearCostLogh22).div(quadraticCostLogh22).div(2).add(1).max(0)}
                
                return {cost: constantCosth22.times(linearCosth22.pow(costStackh22)).times(quadraticCosth22.pow(costStackh22.pow(2))).floor(), continuum: continuumh22}
            },
            effect(x) {
                effBaseh22 = new Decimal(1)
                effStackh22 = new Decimal(x)

                return Decimal.times(effBaseh22, effStackh22)
            },
            title() { return "heavenly buyable 22"},
            display() { return "grant "+format(effBaseh22)+" generators . <br> cost: "+format(this.cost().cost)+" <br> effect: "+format(this.effect())+" total generators"},
            canAfford() { return player[this.layer].points.gte(this.cost().cost) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                addPoints('g', new Decimal(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        23: {
            unlocked() {return hasUpgrade('h', 33)},
            cost(x) {
                costStackh23 = new Decimal(x).add(1).div(buyableEffect('c', 23)).sub(1)
                constantCosth23 = new Decimal(100)
                linearCosth23 = new Decimal(5)
                quadraticCosth23 = new Decimal(2)

                constantCostLogh23 = constantCosth23.log10()
                linearCostLogh23 = linearCosth23.log10()
                quadraticCostLogh23 = quadraticCosth23.log10()

                if (player.h.points.lte(constantCosth23.div(linearCosth23).times(quadraticCosth23))) {continuumh23 = new Decimal(0)} else {continuumh23 = player.h.points.log10().sub(constantCostLogh23).times(quadraticCostLogh23).times(4).add(linearCostLogh23.pow(2)).pow(1/2).sub(linearCostLogh23).div(quadraticCostLogh23).div(2).add(1).max(0)}
                
                return {cost: constantCosth23.times(linearCosth23.pow(costStackh23)).times(quadraticCosth23.pow(costStackh23.pow(2))).floor(), continuum: continuumh23}
            },
            effect(x) {
                effBaseh23 = new Decimal(1)
                effStackh23 = new Decimal(x)

                return Decimal.times(effBaseh23, effStackh23)
            },
            title() { return "heavenly buyable 23"},
            display() { return "gain "+format(effBaseh23)+" golden cookie factory . <br> cost: "+format(this.cost().cost)+" <br> effect: "+format(this.effect())+" total golden cookie factories"},
            canAfford() { return player[this.layer].points.gte(this.cost().cost) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                addPoints('au', new Decimal(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        24: {
            unlocked() {return hasUpgrade('h', 34)},
            cost(x) {
                costStackh24 = new Decimal(x).add(1).div(buyableEffect('c', 23)).sub(1)
                constantCosth24 = new Decimal(100)
                linearCosth24 = new Decimal(5)
                quadraticCosth24 = new Decimal(2)

                constantCostLogh24 = constantCosth24.log10()
                linearCostLogh24 = linearCosth24.log10()
                quadraticCostLogh24 = quadraticCosth24.log10()

                if (player.h.points.lte(constantCosth24.div(linearCosth24).times(quadraticCosth24))) {continuumh24 = new Decimal(0)} else {continuumh24 = player.h.points.log10().sub(constantCostLogh24).times(quadraticCostLogh24).times(4).add(linearCostLogh24.pow(2)).pow(1/2).sub(linearCostLogh24).div(quadraticCostLogh24).div(2).add(1).max(0)}
                
                return {cost: constantCosth24.times(linearCosth24.pow(costStackh24)).times(quadraticCosth24.pow(costStackh24.pow(2))).floor(), continuum: continuumh24}
            },
            effect(x) {
                effBaseh24 = new Decimal(1)
                effStackh24 = new Decimal(x)

                return Decimal.times(effBaseh24, effStackh24)
            },
            title() { return "heavenly buyable 24"},
            display() { return "grant "+format(effBaseh24)+" sugar factories. <br> cost: "+format(this.cost().cost)+" <br> effect: "+format(this.effect())+" total sugar factories"},
            canAfford() { return player[this.layer].points.gte(this.cost().cost) },
            style() {const size = {width: "160px", height: "160px"}
            return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                addPoints('sf', new Decimal(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        101: {
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                return Decimal.dInf
            },
            canAfford() { 
                return false},
            buy() {
            },
            buyMax() {

            },
        },
    },
    clickables: {
        11: {
            display() { return "building 11, assigned "+getClickableState('h', 11)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 11, getClickableState('h', 11)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 11)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        12: {
            display() { return "building 21, assigned "+getClickableState('h', 12)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 12, getClickableState('h', 12)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 12)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        13: {
            display() { return "building 31, assigned "+getClickableState('h', 13)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 13, getClickableState('h', 13)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 13)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        14: {
            display() { return "building 41, assigned "+getClickableState('h', 14)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 14, getClickableState('h', 14)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 14)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        15: {
            display() { return "building 51, assigned "+getClickableState('h', 15)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 15, getClickableState('h', 15)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 15)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        16: {
            display() { return "building 61, assigned "+getClickableState('h', 16)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 16, getClickableState('h', 16)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 16)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        17: {
            display() { return "building 71, assigned "+getClickableState('h', 17)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 17, getClickableState('h', 17) * 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 17)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        18: {
            display() { return "building 81, assigned "+getClickableState('h', 18)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 18, getClickableState('h', 18)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 18)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        19: {
            display() { return "building 91, assigned "+getClickableState('h', 19)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 19, getClickableState('h', 19)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lte(buyableEffect('h', 12).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 21).pow(new Decimal(getClickableState('h', 19)).pow(clickableEffect('h', 22)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        21: {
            display() { return "resets your building ?2"},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                for (let i = 1; i < 10; i++ ) {
                    setBuyableAmount('b', i*10+1, buyableEffect('b', i*10+2).spent.add(getBuyableAmount('b', i*10+1)))
                    setBuyableAmount('b', i*10+2, Decimal.dZero)
                }
                // for (let i = 11; i < 20; i++ ) {
                //     setClickableState('h', i, 0)
                // }
            },
            effect() { //eff
                eff = new Decimal(4/3)
                if (hasUpgrade('c', 33)) {eff = eff.add(upgradeEffect('c', 33))}

                return eff
            },
            canClick() {return true},
        },
        22: {
            display() { if (hasMilestone('c', 1)) {return "respec choices"} else return "respec choices, requires zero building ?2s"},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                for (let i = 11; i < 20; i++ ) {
                    setClickableState('h', i, 0)
                }
            },
            effect() { //pow
                eff = new Decimal(0.5)


                return eff
            },
            canClick() {
                canClickh22 = true 
                for (let i = 1; i < 10; i++ ) {
                    canClickh22 = canClickh22 && (getBuyableAmount('b', i*10+2).eq(0))
                }
                return canClickh22
            },
        },
        23: {
            display() { return "increase the amount of choices at once, currently "+getClickableState('h', 23)},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 23, Math.round(Math.min(getClickableState('h', 23) * 10, 10000)))
            },
            canClick() {
                return true
            },
        },
        24: {
            display() { return "decrease the amount of choices at once"},
            unlocked() {return buyableEffect('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 23, Math.round(Math.max(getClickableState('h', 23) / 10, 1)))
            },
            canClick() {
                return true
            },
        },
        31: {
            display() { return "building 12, assigned "+getClickableState('h', 31)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 31, getClickableState('h', 31)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 31)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        32: {
            display() { return "building 22, assigned "+getClickableState('h', 32)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 32, getClickableState('h', 32)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 32)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        33: {
            display() { return "building 32, assigned "+getClickableState('h', 33)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 33, getClickableState('h', 33)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 33)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        34: {
            display() { return "building 42, assigned "+getClickableState('h', 34)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 34, getClickableState('h', 34)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 34)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        35: {
            display() { return "building 52, assigned "+getClickableState('h', 35)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 35, getClickableState('h', 35)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 35)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        36: {
            display() { return "building 62, assigned "+getClickableState('h', 36)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 36, getClickableState('h', 36)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 36)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        37: {
            display() { return "building 72, assigned "+getClickableState('h', 37)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 37, getClickableState('h', 37)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 37)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        38: {
            display() { return "building 82, assigned "+getClickableState('h', 38)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 38, getClickableState('h', 38)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 38)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        39: {
            display() { return "building 92, assigned "+getClickableState('h', 39)+" times, scaling divided by "+formatShort(this.effect())},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                setClickableState('h', 39, getClickableState('h', 39)* 1 + getClickableState('h', 23))
            },
            canClick() { 
                alreadyAssigned2 = 0
                for (let i = 31; i < 40; i++ ) {
                    alreadyAssigned2 += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned2).lte(buyableEffect('h', 13).sub(getClickableState('h', 23)))
            },
            effect() {
                return clickableEffect('h', 41).pow(new Decimal(getClickableState('h', 39)).pow(clickableEffect('h', 42)))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        41: {
            display() { return "resets your building ?2"},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                for (let i = 1; i < 10; i++ ) {
                    setBuyableAmount('b', i*10+1, buyableEffect('b', i*10+2).spent.add(getBuyableAmount('b', i*10+1)))
                    setBuyableAmount('b', i*10+2, Decimal.dZero)
                }
                // for (let i = 11; i < 20; i++ ) {
                //     setClickableState('h', i, 0)
                // }
            },
            effect() { //eff
                eff = new Decimal(1.1)

                return eff
            },
            canClick() {return true},
        },
        42: {
            display() { if (hasMilestone('c', 1)) {return "respec choices "} else return "respec choices, requires zero building ?2s"},
            unlocked() {return buyableEffect('h', 13).gte(1)},
            onClick() {
                for (let i = 31; i < 40; i++ ) {
                    setClickableState('h', i, 0)
                }
            },
            effect() { //pow
                eff = new Decimal(0.5)


                return eff
            },
            canClick() {
                canClickh42 = true 
                for (let i = 1; i < 10; i++ ) {
                    canClickh42 = canClickh42 && (getBuyableAmount('b', i*10+2).eq(0))
                }
                return canClickh42
            },
        },
    },
    upgrades: {
        11: {
            title: "heavenly upgrade 11",
            description: "multiply building gain exponent by 1.5",
            cost() {
                maxPurchaseh1 = new Decimal(1)
                if (hasUpgrade('c', 11)) {maxPurchaseh1 = maxPurchaseh1.add(upgradeEffect('c', 11))}
                if (hasUpgrade('c', 21)) {maxPurchaseh1 = maxPurchaseh1.add(upgradeEffect('c', 21))}
                actualPurchaseh1 = new Decimal(hasUpgrade('h', 11)+hasUpgrade('h', 12)+hasUpgrade('h', 13))
                if (maxPurchaseh1.lte(actualPurchaseh1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "heavenly upgrade 12",
            description: "multiply prestige gain exponent by 1.5",
            cost() {
                if (maxPurchaseh1.lte(actualPurchaseh1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "heavenly upgrade 13",
            description: "multiply heavenly gain exponent by 1.5",
            cost() {
                if (maxPurchaseh1.lte(actualPurchaseh1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasMilestone('c', 0)}
        },
        14: {
            title: "heavenly upgrade 14",
            description: "multiply sugar gain by 1.5",
            cost() {
                if (maxPurchaseh1.lte(actualPurchaseh1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasMilestone('c', 1)}
        },
        21: {
            title: "heavenly upgrade 21",
            description: "divide all building ?1 cost scaling by 1.33",
            cost() {
                maxPurchaseh2 = new Decimal(1)
                if (hasUpgrade('c', 12)) {maxPurchaseh2 = maxPurchaseh2.add(upgradeEffect('c', 12))}
                if (hasUpgrade('c', 22)) {maxPurchaseh2 = maxPurchaseh2.add(upgradeEffect('c', 22))}
                actualPurchaseh2 = new Decimal(hasUpgrade('h', 21)+hasUpgrade('h', 22)+hasUpgrade('h', 23)+hasUpgrade('h', 24))
                if (maxPurchaseh2.lte(actualPurchaseh2)) {return new Decimal('eeee10')} else {return new Decimal(10)}
            },
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 11)||hasUpgrade('h', 12)||hasUpgrade('h', 13)},
        },
        22: {
            title: "heavenly upgrade 22",
            description: "divide all building ?2 cost by 1.25",
            cost() {
                if (maxPurchaseh2.lte(actualPurchaseh2)) {return new Decimal('eeee10')} else {return new Decimal(10)}
            },
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 11)||hasUpgrade('h', 12)||hasUpgrade('h', 13)},
        },
        23: {
            title: "heavenly upgrade 23",
            description: "multiply all building ?2 effects by 4",
            cost() {
                if (maxPurchaseh2.lte(actualPurchaseh2)) {return new Decimal('eeee10')} else {return new Decimal(10)}
            },
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 11)||hasUpgrade('h', 12)||hasUpgrade('h', 13)},
        },
        24: {
            title: "heavenly upgrade 24",
            description: "add prestige buyable 12 effect base by 0.05",
            cost() {
                if (maxPurchaseh2.lte(actualPurchaseh2)) {return new Decimal('eeee10')} else {return new Decimal(10)}
            },
            effect() {
                eff = new Decimal(0.05)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 11)||hasUpgrade('h', 12)||hasUpgrade('h', 13)},
        },
        31: {
            title: "heavenly upgrade 31",
            description: "unlock synergy points",
            cost() {
                maxPurchaseh3 = new Decimal(1)
                if (hasMilestone('m', 0)) {maxPurchaseh3 = maxPurchaseh3.add(1)}
                actualPurchaseh3 = new Decimal(hasUpgrade('h', 31)+hasUpgrade('h', 32)+hasUpgrade('h', 33)+hasUpgrade('h', 34))

                if (maxPurchaseh3.lte(actualPurchaseh3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            pay() {
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 23)||hasUpgrade('h', 24)},
        },
        32: {
            title: "heavenly upgrade 32",
            description: "unlock generators",
            cost() {
                if (maxPurchaseh3.lte(actualPurchaseh3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            pay() {
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 23)||hasUpgrade('h', 24)},
        },
        33: {
            title: "heavenly upgrade 33",
            description: "unlock golden cookies",
            cost() {
                if (maxPurchaseh3.lte(actualPurchaseh3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            pay() {
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 23)||hasUpgrade('h', 24)},
        },
        34: {
            title: "heavenly upgrade 34",
            description: "unlock sugar factory",
            cost() {
                if (maxPurchaseh3.lte(actualPurchaseh3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            pay() {
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 23)||hasUpgrade('h', 24)},
        },
        41: {
            title: "heavenly upgrade 41",
            description: "multiply building gain exponent by 1.2",
            cost() {
                maxPurchaseh4 = new Decimal(1)
                if (hasUpgrade('c', 34)) {maxPurchaseh4 = maxPurchaseh4.add(upgradeEffect('c', 34))}
                if (hasUpgrade('c', 43)) {maxPurchaseh4 = maxPurchaseh4.add(upgradeEffect('c', 43))}
                actualPurchaseh4 = new Decimal(hasUpgrade('h', 41)+hasUpgrade('h', 42)+hasUpgrade('h', 43)+hasUpgrade('h', 44))
                if (maxPurchaseh4.lte(actualPurchaseh4)) {return new Decimal('eeee10')} else {return new Decimal(1000)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 31)||hasUpgrade('h', 32)||hasUpgrade('h', 33)||hasUpgrade('h', 34)},
        },
        42: {
            title: "heavenly upgrade 42",
            description: "multiply prestige gain exponent by 1.2",
            cost() {
                if (maxPurchaseh4.lte(actualPurchaseh4)) {return new Decimal('eeee10')} else {return new Decimal(1000)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 31)||hasUpgrade('h', 32)||hasUpgrade('h', 33)||hasUpgrade('h', 34)},
        },
        43: {
            title: "heavenly upgrade 43",
            description: "multiply heavenly gain exponent by 1.2",
            cost() {
                if (maxPurchaseh4.lte(actualPurchaseh4)) {return new Decimal('eeee10')} else {return new Decimal(1000)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return (hasUpgrade('h', 31)||hasUpgrade('h', 32)||hasUpgrade('h', 33)||hasUpgrade('h', 34))&&hasMilestone('c', 0)},
        },
        44: {
            title: "heavenly upgrade 44",
            description: "multiply sugar gain by 1.2",
            cost() {
                if (maxPurchaseh4.lte(actualPurchaseh4)) {return new Decimal('eeee10')} else {return new Decimal(1000)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return (hasUpgrade('h', 31)||hasUpgrade('h', 32)||hasUpgrade('h', 33)||hasUpgrade('h', 34))&&hasMilestone('c', 1)},
        },
    },
})
  
addLayer("sy", {
    name: "synergy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SY", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#689cef",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "synergy points", // Name of prestige currency

    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 3, // Row the layer is in on the tree (0 is the first row)

    layerShown() {return buyableEffect('h', 21).gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {

        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}
    },
    infoboxes: {
        A: {
            body() {

                return "On each synergy, the boost amount is "+format(player.effBasesy(), 4)+" per boosting building per synergy level. effect shown is per boosting building, all synergy levels"
            }
        }
    },
    milestones: {

    },
    update(diff) {
    },
    buyables: {
        11: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {
                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        13: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        14: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        15: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        16: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        17: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        18: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        19: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        21: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        22: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        23: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        24: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        25: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        26: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        27: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        28: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        29: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        31: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        32: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        33: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        34: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        35: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        36: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        37: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        38: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        39: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        41: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        42: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        43: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        44: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        45: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        46: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        47: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        48: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        49: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        51: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        52: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        53: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        54: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        55: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        56: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        57: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        58: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        59: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        61: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        62: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        63: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        64: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        65: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        66: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        67: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        68: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        69: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        71: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        72: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        73: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        74: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        75: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        76: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        77: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        78: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        79: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        81: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        82: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        83: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        84: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        85: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        86: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        87: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        88: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        89: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        91: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        92: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        93: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        94: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        95: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        96: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        97: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        98: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        99: {
            unlocked() {return buyableEffect('h', 21).gte(1)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id).add(getClickableState('au', 15)*(getClickableState('au', 14)==this.id)*(getBuyableAmount('au', 14).gt(0))))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
    },
    clickables: {

    },
    upgrades: {

    },
})

addLayer("g", {
    name: "generate", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#69efc9",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "generators", // Name of prestige currency

    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown() {
        if (getClickableState('g', 11) == "") {setClickableState('g', 11, 12)}
        return buyableEffect('h', 22).gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {

        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}
    },
    update(diff) { 
        setBuyableAmount('g', getClickableState('g', 11), getBuyableAmount('g', getClickableState('g', 11)).add(buyableEffect('g', 21).times(diff)))
    },
    infoboxes: {

    },
    milestones: {
        0: {
            requirementDescription: "generator milestone 0",
            effectDescription: "8 generators: extra generators scale proportionally to current generators",
            done() { return player.g.total.gte(8)  }
        },
        1: {
            requirementDescription: "generator milestone 1",
            effectDescription: "10 generators: generation rate is multiplied by effect^(1-10/generators), capped at 30 generators",
            done() { return player.g.total.gte(10)  }
        },
        3: {
            requirementDescription: "generator milestone 3",
            effectDescription: "30 generators: generation rate is multiplied by extra (total effect^(3/5))^(1-30/generators), capped at 80 generators",
            done() { return player.g.total.gte(30) }
        }
    },

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        15: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        16: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        17: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        18: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        19: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x)
            },
            display() { return "assign generator to building "+Math.round(this.id * 10 - 98, 1).toString()+"<br> effect: "+formatShort(this.effect())},
            canAfford() { return true },
            style() {const size = {width: "67px", height: "110px"}
                return size},
            buy() {
                setClickableState('g', 11, this.id)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costBaseg21 = new Decimal(5)
                costStackg21 = new Decimal(x).add(1)


                continuumg21 = player.s.best.times(8).add(5).pow(1/2).times(2.2360679774997896964091736687312762354406183596115257242708972454).sub(5).div(10)

                return {cost: costStackg21.times(costBaseg21), continuum: continuumg21}
            },
            effect(x) {
                if (hasMilestone('m', 0)) {effStackg21 = this.cost().continuum} else {effStackg21 = new Decimal(x)}
                effBaseg21 = new Decimal(0.25)

                baseGaingenerator = new Decimal(0.666666666666666666666666666666)
                if (hasUpgrade('c', 14)) {baseGaingenerator = baseGaingenerator.times(upgradeEffect('c', 14))}

                effectivegenerators = player.g.points
                if (hasMilestone('g', 0)) {effectivegenerators = Decimal.pow(1.125, effectivegenerators.sub(8)).times(8)}

                milestone1power = Decimal.dOne.sub(Decimal.div(10, player.g.points.max(10).min(30)))
                milestone1mult = getBuyableAmount('g', getClickableState('g', 11)).pow(milestone1power).max(1)
                milestone3mult = new Decimal(0)
                for (ig21 = 11; ig21 < 20; ig21++) {
                    milestone3mult = milestone3mult.add(getBuyableAmount('g', ig21).pow(0.6))
                }
                milestone3power = Decimal.sub(1/3, Decimal.div(10, player.g.points.max(30).min(80)))
                milestone3mult = milestone3mult.pow(milestone3power)

                baseeffectg21 = Decimal.times(effBaseg21, effStackg21).add(1).times(baseGaingenerator).times(player.g.points)
                if (hasMilestone('g', 1)) {baseeffectg21 = baseeffectg21.times(milestone1mult)}
                if (hasMilestone('g', 3)) {baseeffectg21 = baseeffectg21.times(milestone3mult)}
                return baseeffectg21
            },
            title() { return "generator buyable 21"},
            display() { return "your "+format(effectivegenerators)+" generators are generating "+format(this.effect(), 3)+" effect to all assigned buildings every second. <br> this buyable adds generator effect by "+format(effBaseg21)+"x. <br> cost: "+formatShort(this.cost().cost)+" sugar. <br> owned: "+format(effStackg21)+"<br> assigned to: <br>"+Math.round(getClickableState('g', 11) * 10 - 98, 1).toString()},
            canAfford() { return player.s.points.gte(this.cost().cost)&&(!hasMilestone('m', 0)) },

            buy() {
                player.s.points = player.s.points.sub(this.cost().cost)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
    },
    clickables: {
        11: {
            unlocked: false,
            onClick() {
            },
            canClick() {return false},

        },
    },
    upgrades: {

    },
})

addLayer("au", {
    name: "golden", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#e9cf79",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "golden cookie factories", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown() {
        return buyableEffect('h', 23).gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {

        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}
    },
    update(diff) { 
        setBuyableAmount('au', 11, getBuyableAmount('au', 11).add(player[this.layer].points.times(1/90).times(diff)))
        if (getBuyableAmount('au', 14).gt(0)) {setBuyableAmount('au', 14, getBuyableAmount('au', 14).sub(diff).max(0))}
        if (getBuyableAmount('au', 16).gt(0)) {setBuyableAmount('au', 16, getBuyableAmount('au', 16).sub(diff).max(0))}
    },

    milestones: {

    },

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {

                
                return Decimal.dOne
            },
            effect(x) {


                return Decimal.dZero
            },
            title() { return "golden buyable 11"},
            display() { return "click here to spend one golden cookie"},
            canAfford() { return getBuyableAmount('au', 11).gte(this.cost()) },
            buy() {
                setBuyableAmount('au', 11, getBuyableAmount('au', 11).sub(this.cost()))

                auLuckyWeight = 10 //instant cookies
                if (hasUpgrade('c', 31)) {auLuckyWeight /= 2}
                auLuckyCumu = auLuckyWeight
                
                auAltLuckyWeight = 10 //instant bp
                if (hasUpgrade('c', 31)) {auAltLuckyWeight /= 2}
                auAltLuckyCumu = auLuckyCumu + auAltLuckyWeight

                auFrenzyWeight = 20 //cps multiplier
                auFrenzyCumu = auAltLuckyCumu + auFrenzyWeight

                auClickFrenzyWeight = 20 //click multiplier
                auClickFrenzyCumu = auFrenzyCumu + auClickFrenzyWeight

                auBuildingSpecialWeight = 7 //free synergy; time limited
                if (hasUpgrade('c', 31)) {auBuildingSpecialWeight *= 2}
                auBuildingSpecialCumu = auClickFrenzyCumu + auBuildingSpecialWeight

                auUpgradesSpecialWeight = 5 //free b?2 strength; time limited
                if (hasUpgrade('c', 31)) {auUpgradesSpecialWeight *= 2}
                auUpgradesSpecialCumu = auBuildingSpecialCumu + auUpgradesSpecialWeight

                auDoubleWeight = 3 //free golden cookies
                auDoubleCumu = auUpgradesSpecialCumu + auDoubleWeight

                auSweetWeight = 1 //instant sugar
                auSweetCumu = auDoubleCumu + auSweetWeight

                auTotalWeight = auSweetCumu

                auGeneratedEffect = Math.floor(Math.random() * auTotalWeight) 
                auGeneratedStrength = Math.random() * 6 

                if (auGeneratedEffect < auLuckyCumu) {
                    if (auGeneratedStrength < 1) { 
                        autextbox = "Instantly gain "+format(player.points.times(10 ** (auGeneratedStrength * 8 + 8) - 1))+" cookies"
                        player.points = player.points.times(10 ** (auGeneratedStrength * 8 + 8))
                    } else { 
                        autextbox = "Instantly gain "+format(getPointGen().times(86400))+" cookies"
                        player.points = player.points.add(getPointGen().times(86400))

                    }
                } else if (auGeneratedEffect < auAltLuckyCumu) {
                    if (auGeneratedStrength < 1) { 
                        autextbox = "Instantly gain "+format(player.b.points.times(10 ** (auGeneratedStrength * 8 + 8) - 1))+" building points"
                        addPoints('b', player.b.points.times(10 ** (auGeneratedStrength * 8 + 8) - 1))

                    } else { 
                        autextbox = "Instantly gain "+format(bgainPerReset.div(resetTimePeriod).times(86400))+" building points"
                        addPoints('b', bgainPerReset.div(resetTimePeriod).times(86400))
                    }
                } else if (auGeneratedEffect < auFrenzyCumu) {
                    auContribToProduction = getBuyableAmount('au', 12).div(getPointGenBeforePow().max(10).log10())
                    baseaueffect = getPointGenBeforePow().max(10).log10().sub(getBuyableAmount('au', 12)).max(10).times(1/25)
                    totalaueffect = baseaueffect.times(Decimal.dOne.sub(auContribToProduction).pow(2))
                    if (auGeneratedStrength < 1) { 
                        setBuyableAmount('au', 12, getBuyableAmount('au', 12).add(totalaueffect.times(auGeneratedStrength * 4 + 2)))
                        autextbox = "Multiply cookie production by "+format(totalaueffect.times(auGeneratedStrength * 4 + 2).pow10())
                    } else { 
                        setBuyableAmount('au', 12, getBuyableAmount('au', 12).add(totalaueffect))
                        autextbox = "Multiply cookie production by "+format(totalaueffect.pow10())
                    }
                } else if (auGeneratedEffect < auClickFrenzyCumu) {
                    auContribToProduction = getBuyableAmount('au', 13).div(player.clickgain().max(10).log10())
                    baseaueffect = player.clickgain().max(10).log10().sub(getBuyableAmount('au', 13)).max(10).times(1/25)
                    totalaueffect = baseaueffect.times(Decimal.dOne.sub(auContribToProduction).pow(2))
                    if (auGeneratedStrength < 1) { 
                        setBuyableAmount('au', 13, getBuyableAmount('au', 13).add(totalaueffect.times(auGeneratedStrength * 4 + 2)))
                        autextbox = "Multiply cookie click by "+format(totalaueffect.times(auGeneratedStrength * 4 + 2).pow10())
                    } else { 
                        setBuyableAmount('au', 13, getBuyableAmount('au', 13).add(totalaueffect))
                        autextbox = "Multiply cookie click by "+format(totalaueffect.pow10())
                    }
                } else if (auGeneratedEffect < auBuildingSpecialCumu) {
                    setClickableState('au', 14, parseInt(Math.floor(Math.random()*81).toString(9), 10)+11)
                    setBuyableAmount('au', 14, new Decimal(180))
                    setBuyableAmount('au', 16, new Decimal(0))
                    if (auGeneratedStrength < 1) { 
                        setClickableState('au', 15, new Decimal(4) )
                    } else { 
                        setClickableState('au', 15, new Decimal(2) )
                    }
                    autextbox = ", building "+Math.floor(getClickableState('au', 14)/10)+"1 boosts building "+(getClickableState('au', 14) % 10)+" production by x"+format(player.effBasesy().pow(getClickableState('au', 15)))
                } else if (auGeneratedEffect < auUpgradesSpecialCumu) {
                    setClickableState('au', 16, Math.floor(Math.random()*9+1))
                    setBuyableAmount('au', 16, new Decimal(180))
                    setBuyableAmount('au', 14, new Decimal(0))
                    if (auGeneratedStrength < 1) { 
                        setClickableState('au', 17, new Decimal(20) )
                    } else { 
                        setClickableState('au', 17, new Decimal(4) )
                    }
                    autextbox = ", building "+(getClickableState('au', 16))+"2 effect is added by "+(getClickableState('au', 17))
                } else if (auGeneratedEffect < auDoubleCumu) {
                    if (auGeneratedStrength < 1) { 
                        setBuyableAmount('au', 11, getBuyableAmount('au', 11).add(auGeneratedStrength * 6 + 4))
                        autextbox = "Get "+Math.round(auGeneratedStrength * 6 + 4)+" golden cookies for free"
                    } else { 
                        setBuyableAmount('au', 11, getBuyableAmount('au', 11).add(2))
                        autextbox = "Get 2 golden cookies for free"
                    }

                } else if (auGeneratedEffect < auSweetCumu) {
                    if (auGeneratedStrength < 1) { 
                        addPoints('s', getResetGain('s').times(auGeneratedStrength * 360 + 180))
                        autextbox = "Get "+format(getResetGain('s').times(auGeneratedStrength * 360 + 180))+" sugar for free"
                    } else { 
                        addPoints('s', getResetGain('s').times(45))
                        autextbox = "Get "+format(getResetGain('s').times(45))+" sugar for free"
                    }

                }

                


            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x).pow10()
            },
            display() { return "multiply cookie production by 10^amount"},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        13: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(x).pow10()
            },
            display() { return "multiply cookie click by 10^amount"},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        14: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return 
            },
            display() { return "free synergy duration"},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        16: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {

                return 
            },
            display() { return "free b?2 strength duration"},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
    },
    clickables: {
        14: { //free syn id
            unlocked: false,
            onClick() {
            },
            canClick() {return false},

        },
        15: { //free syn amt
            unlocked: false,
            onClick() {
            },
            canClick() {return false},

        },
        16: { //free b?2 strength id
            unlocked: false,
            onClick() {
            },
            canClick() {return false},

        },
        17: { //free b?2 strength amt
            unlocked: false,
            onClick() {
            },
            canClick() {return false},

        },
    },
    upgrades: {

    },
    infoboxes: {
        A: {
            body() {
                autext = "You have "+format(getBuyableAmount('au', 11))+" golden cookies <br>"
                if (player[this.layer].points.gte(90)) {autext += "You are gaining "+format(player[this.layer].points.div(90))+" golden cookies every second <br>"} else {autext += "You are gaining a golden cookie every "+formatTime(player[this.layer].points.pow(-1).times(90))+" <br>"}
                if (typeof(auGeneratedEffect)=="number") {if ((auGeneratedEffect >= auClickFrenzyCumu)&&(auGeneratedEffect < auUpgradesSpecialCumu)) {autext += "For the next "+formatTime(getBuyableAmount('au', 14).max(getBuyableAmount('au', 16)))}}
                if (typeof(autextbox)=="string") {autext += autextbox}
                return autext
            }
        }
    },
})

addLayer("sf", {
    name: "sugar production", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SF", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#d7c2ba",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "sugar factories", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown() {
        return buyableEffect('h', 24).gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {

        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}
    },
    update(diff) { 


    },
    milestones: {
    },

    buyables: {
        11: { 
            unlocked() {return true},
            cost(x) {
                costStacksf11 = new Decimal(x).add(1).div(buyableEffect('sf', 102)).sub(1)
                constantCostsf11 = new Decimal(1.65)
                linearCostsf11 = new Decimal(1.05)
                quadraticCostsf11 = new Decimal(1.05)

                return constantCostsf11.times(linearCostsf11.pow(costStacksf11)).times(quadraticCostsf11.pow(costStacksf11.pow(2))).floor()
            },
            effect(x) {
                effBasesf11 = new Decimal(1).add(buyableEffect('sf', 13))
                effStacksf11 = new Decimal(x)

                return Decimal.times(effBasesf11, effStacksf11)
            },
            title() { return "sugar factory buyable 11"},
            display() { return "increase sugar production by "+format(effBasesf11)+" per 3 minutes <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStacksf11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
            },
        },
        12: { 
            unlocked() {return true},
            cost(x) {
                costStacksf12 = new Decimal(x).add(1).div(buyableEffect('sf', 102)).sub(1)
                constantCostsf12 = new Decimal(3.3)
                linearCostsf12 = new Decimal(1.1)
                quadraticCostsf12 = new Decimal(1.1)

                return constantCostsf12.times(linearCostsf12.pow(costStacksf12)).times(quadraticCostsf12.pow(costStacksf12.pow(2))).floor()
            },
            effect(x) {
                effBasesf12 = new Decimal(0.25)
                effStacksf12 = new Decimal(x)

                return Decimal.times(effBasesf12, effStacksf12)
            },
            title() { return "sugar factory buyable 12"},
            display() { return "add prestige buyable 31 effect by "+format(effBasesf12)+" <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStacksf12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
            },
        },
        13: { 
            unlocked() {return true},
            cost(x) {
                costStacksf13 = new Decimal(x).add(1).div(buyableEffect('sf', 102)).sub(1)
                constantCostsf13 = new Decimal(5)
                linearCostsf13 = new Decimal(1.2)
                quadraticCostsf13 = new Decimal(1.2)

                return constantCostsf13.times(linearCostsf13.pow(costStacksf13)).times(quadraticCostsf13.pow(costStacksf13.pow(2))).floor()
            },
            effect(x) {
                effBasesf13 = new Decimal(1)
                effStacksf13 = new Decimal(x)

                return Decimal.times(effBasesf13, effStacksf13)
            },
            title() { return "sugar factory buyable 13"},
            display() { return "add sugar factory buyable 11 effect by "+format(effBasesf13)+" <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStacksf13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
            },
        },
        21: { 
            unlocked() {return true},
            cost(x) {
                costStacksf21 = new Decimal(x)
                constantCostsf21 = new Decimal(100)
                linearCostsf21 = new Decimal(10)
                quadraticCostsf21 = new Decimal(10)

                return constantCostsf21.times(linearCostsf21.pow(costStacksf21)).times(quadraticCostsf21.pow(costStacksf21.pow(2))).floor()
            },
            effect(x) {
                effBasesf21 = new Decimal(0.05)
                effStacksf21 = new Decimal(x)

                return Decimal.times(effBasesf21, effStacksf21).add(1)
            },
            title() { return "sugar factory buyable 21"},
            display() { return "add building ?3 multiplier by "+format(effBasesf21)+" <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStacksf21)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
            },
        },
        22: { 
            unlocked() {return true},
            cost(x) {
                costStacksf22 = new Decimal(x)
                constantCostsf22 = new Decimal(1e4)
                linearCostsf22 = new Decimal(100)
                quadraticCostsf22 = new Decimal(100)

                return constantCostsf22.times(linearCostsf22.pow(costStacksf22)).times(quadraticCostsf22.pow(costStacksf22.pow(2))).floor()
            },
            effect(x) {
                effBasesf22 = new Decimal(0.05)
                effStacksf22 = new Decimal(x)

                return Decimal.times(effBasesf22, effStacksf22).add(1)
            },
            title() { return "sugar factory buyable 22"},
            display() { return "add building ?2 multiplier by "+format(effBasesf22)+" <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStacksf22)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
            },
        },
        31: { 
            unlocked() {return true},
            cost(x) {
                costStacksf31 = new Decimal(x)
                constantCostsf31 = new Decimal(1000)
                linearCostsf31 = new Decimal(60)
                quadraticCostsf31 = new Decimal(10)
                limiterCostsf31 = new Decimal(37)

                return constantCostsf31.times(linearCostsf31.pow(costStacksf31)).times(quadraticCostsf31.pow(costStacksf31.pow(2))).pow(limiterCostsf31.div(limiterCostsf31.sub(costStacksf31))).floor()
            },
            effect(x) {
                effBasesf31 = new Decimal(1/36)
                effStacksf31 = new Decimal(x)

                return Decimal.times(effBasesf31, effStacksf31).add(1)
            },
            purchaseLimit: new Decimal(36),
            title() { return "sugar factory buyable 31"},
            display() { return "add sugar gain power by "+format(effBasesf31)+" <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStacksf31)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
            },
        },
        101: { 
            unlocked() {return false},
            cost(x) { //sugar mult
                return Decimal.dInf
            },
            effect(x) {
                effe = player.sf.points.add(1)
                return effe
            },
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        102: { 
            unlocked() {return false},
            cost(x) { // buyable scaling
                return Decimal.dInf
            },
            effect(x) {
                effe = player.sf.points.add(1).pow(1/3)
                if (effe.gte(100)) {effe = effe.div(100).pow(1/2).times(100)}
                return effe
            },
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
    },
    clickables: {

    },
    infoboxes: {
        A:{        
            body() {
                sftext = "your sugar factories multiply sugar gain by "+format(buyableEffect('sf', 101))+" and sf buyable 1? amount by "+format(buyableEffect('sf', 102))+" (^0.33 below 100, ^0.16 above 100)"

                sftext += "<br> your sugar production is "+format(getResetGain('s').times(180))+" every 3 minutes"
                sftext += "<br> you have "+format(player.s.points)+" sugar"
                return sftext

            }
        }
    },
    upgrades: {

    },
})

addLayer("c", {
    name: "crunch", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#ff9800",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "crunch", // Name of prestige currency
    baseResource: "cookies", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multc = new Decimal(1/1024) 
        multc = multc.times(Decimal.dTwo.pow(player.m.total))


        return multc
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expc = new Decimal(2) 


        return expc
    },
    getResetGain() {
        basec = player.points.max(1).log2()

        cp = basec.times(multc).pow(expc)


        return cp.sub(player.c.total).floor().max(0)
    },
    getNextAt() {
        nextc = getResetGain('c').add(1).add(player.c.total)

        nextc = Decimal.pow(2, nextc.root(expc).div(multc))

        return nextc
    },
    canReset() {return getResetGain('c').gte(0)&&!(false)}, //change false to autogain trigger

    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('c'))+" crunch. Next at "+format(getNextAt('c'))+" cookies" },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for crunch", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return player.points.gte(1e300)||player.c.total.gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}

    },
    infoboxes: {

    },
    milestones: {
        0: {
            requirementDescription: "crunch milestone 0",
            effectDescription: "1 crunch: continuum all building ?1s, raise prestige buyable 11 effect to 10^log10(crunch+10)^0.33, automatically gain prestige points",
            done() { return player.c.total.gte(1)||hasMilestone('m', 0)  }
        },
        1: {
            requirementDescription: "crunch milestone 1",
            effectDescription: "1,000 total crunch: continuum all building ?2s, prestige buyables 1? and 31",
            done() { return player.c.total.gte(1e3)||hasMilestone('m', 0)  }
        },
        2: {
            requirementDescription: "crunch milestone 2",
            effectDescription: "purchase 9 prestige buyable 22: prestige buyables 21 and 22 are always maxed",
            done() { return getBuyableAmount('p', 22).gte(9)||hasMilestone('m', 0)  }
        }
    },

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costStackc11 = new Decimal(x)
                constantCostc11 = new Decimal(1)
                linearCostc11 = new Decimal(1.22)
                quadraticCostc11 = new Decimal(1.08)


                return constantCostc11.times(linearCostc11.pow(costStackc11)).times(quadraticCostc11.pow(costStackc11.pow(2))).floor()
            },
            effect(x) {
                effBasec11 = new Decimal(1.12345678987654321)
                effStackc11 = new Decimal(x)

                return Decimal.pow(effBasec11, effStackc11)
            },
            title() { return "crunch buyable 11"},
            display() { return "multiply building exponent by "+format(effBasec11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costStackc12 = new Decimal(x)
                constantCostc12 = new Decimal(2)
                linearCostc12 = new Decimal(1.35)
                quadraticCostc12 = new Decimal(1.17)


                return constantCostc12.times(linearCostc12.pow(costStackc12)).times(quadraticCostc12.pow(costStackc12.pow(2))).floor()
            },
            effect(x) {
                effBasec12 = new Decimal(1.12345678987654321)
                effStackc12 = new Decimal(x)

                return Decimal.pow(effBasec12, effStackc12)
            },
            title() { return "crunch buyable 12"},
            display() { return "multiply the building ?2 effect by "+format(effBasec12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costStackc13 = new Decimal(x)
                constantCostc13 = new Decimal(3)
                linearCostc13 = new Decimal(1.5)
                quadraticCostc13 = new Decimal(1.25)


                return constantCostc13.times(linearCostc13.pow(costStackc13)).times(quadraticCostc13.pow(costStackc13.pow(2))).floor()
            },
            effect(x) {
                effBasec13 = new Decimal(1.12345678987654321)
                effStackc13 = new Decimal(x)

                return Decimal.pow(effBasec13, effStackc13)
            },
            title() { return "crunch buyable 13"},
            display() { return "multiply sugar production by "+format(effBasec13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costStackc21 = new Decimal(x)
                constantCostc21 = new Decimal(10)
                linearCostc21 = new Decimal(2)
                quadraticCostc21 = new Decimal(1.35)


                return constantCostc21.times(linearCostc21.pow(costStackc21)).times(quadraticCostc21.pow(costStackc21.pow(2))).floor()
            },
            effect(x) {
                effBasec21 = new Decimal(1.12345678987654321)
                effStackc21 = new Decimal(x)

                return Decimal.pow(effBasec21, effStackc21)
            },
            title() { return "crunch buyable 21"},
            display() { return "multiply the prestige exponent by "+format(effBasec21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc21)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costStackc22 = new Decimal(x)
                constantCostc22 = new Decimal(100)
                linearCostc22 = new Decimal(3)
                quadraticCostc22 = new Decimal(1.5)


                return constantCostc22.times(linearCostc22.pow(costStackc22)).times(quadraticCostc22.pow(costStackc22.pow(2))).floor()
            },
            effect(x) {
                effBasec22 = new Decimal(1.12345678987654321)
                effStackc22 = new Decimal(x)

                return Decimal.pow(effBasec22, effStackc22)
            },
            title() { return "crunch buyable 22"},
            display() { return "multiply building ?1 continuum by "+format(effBasec22)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc22)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costStackc23 = new Decimal(x)
                constantCostc23 = new Decimal(1000)
                linearCostc23 = new Decimal(5)
                quadraticCostc23 = new Decimal(2)


                return constantCostc23.times(linearCostc23.pow(costStackc23)).times(quadraticCostc23.pow(costStackc23.pow(2))).floor()
            },
            effect(x) {
                effBasec23 = new Decimal(1.12345678987654321)
                effStackc23 = new Decimal(x)

                return Decimal.pow(effBasec23, effStackc23)
            },
            title() { return "crunch buyable 23"},
            display() { return "multiply heavenly sublayers gain by "+format(effBasec23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costStackc31 = new Decimal(x)
                constantCostc31 = new Decimal(1e4)
                linearCostc31 = new Decimal(50)
                quadraticCostc31 = new Decimal(5)


                return constantCostc31.times(linearCostc31.pow(costStackc31)).times(quadraticCostc31.pow(costStackc31.pow(2))).floor()
            },
            effect(x) {
                effBasec31 = new Decimal(1.12345678987654321)
                effStackc31 = new Decimal(x)

                return Decimal.pow(effBasec31, effStackc31)
            },
            title() { return "crunch buyable 31"},
            display() { return "multiply heavenly exponent by "+format(effBasec31)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc31)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costStackc32 = new Decimal(x)
                constantCostc32 = new Decimal(1e5)
                linearCostc32 = new Decimal(100)
                quadraticCostc32 = new Decimal(10)


                return constantCostc32.times(linearCostc32.pow(costStackc32)).times(quadraticCostc32.pow(costStackc32.pow(2))).floor()
            },
            effect(x) {
                effBasec32 = new Decimal(1.12345678987654321)
                effStackc32 = new Decimal(x)

                return Decimal.pow(effBasec32, effStackc32)
            },
            title() { return "crunch buyable 32"},
            display() { return "multiply building ?2 continuum by "+format(effBasec32)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc32)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costStackc33 = new Decimal(x)
                constantCostc33 = new Decimal(1e6)
                linearCostc33 = new Decimal(1e4)
                quadraticCostc33 = new Decimal(100)


                return constantCostc33.times(linearCostc33.pow(costStackc33)).times(quadraticCostc33.pow(costStackc33.pow(2))).floor()
            },
            effect(x) {
                effBasec33 = new Decimal(1)
                effStackc33 = new Decimal(x)

                return Decimal.times(effBasec33, effStackc33)
            },
            title() { return "crunch buyable 33"},
            display() { return "add hypersugar gain by "+format(effBasec33)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackc33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
    },

    clickables: {

    },
    upgrades: {
        11: {
            title: "crunch upgrade 11",
            description: "buy one more upgrade on heavenly row 1",
            cost() {
                maxPurchasec1 = new Decimal(1)
                if (hasUpgrade('c', 41)) {maxPurchasec1 = maxPurchasec1.add(upgradeEffect('c', 41))}
                actualPurchasec1 = new Decimal(hasUpgrade('c', 11)+hasUpgrade('c', 12)+hasUpgrade('c', 13)+hasUpgrade('c', 14))
                if (maxPurchasec1.lte(actualPurchasec1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "crunch upgrade 12",
            description: "buy one more upgrade on heavenly row 2",
            cost() {
                if (maxPurchasec1.lte(actualPurchasec1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "crunch upgrade 13",
            description: "synergy base is +0.005",
            cost() {
                if (maxPurchasec1.lte(actualPurchasec1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(0.005)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "crunch upgrade 14",
            description: "generator base is *1.25",
            cost() {
                if (maxPurchasec1.lte(actualPurchasec1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "crunch upgrade 21",
            description: "buy two more upgrades on heavenly row 1",
            cost() {
                maxPurchasec2 = new Decimal(1)
                if (hasUpgrade('c', 42)) {maxPurchasec2 = maxPurchasec2.add(upgradeEffect('c', 42))}
                actualPurchasec2 = new Decimal(hasUpgrade('c', 21)+hasUpgrade('c', 22)+hasUpgrade('c', 23)+hasUpgrade('c', 24))
                if (maxPurchasec2.lte(actualPurchasec2)) {return new Decimal('eeee10')} else {return new Decimal(3)}
            },
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "crunch upgrade 22",
            description: "buy two more upgrade on heavenly row 2",
            cost() {
                if (maxPurchasec2.lte(actualPurchasec2)) {return new Decimal('eeee10')} else {return new Decimal(3)}
            },
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "crunch upgrade 23",
            description: "add prestige buyable 12 effect by 0.1",
            cost() {
                if (maxPurchasec2.lte(actualPurchasec2)) {return new Decimal('eeee10')} else {return new Decimal(3)}
            },
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "crunch upgrade 24",
            description: "multiply prestige buyable 21 effect by 1.2",
            cost() {
                if (maxPurchasec2.lte(actualPurchasec2)) {return new Decimal('eeee10')} else {return new Decimal(3)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        31: {
            title: "crunch upgrade 31",
            description: "in golden cookie, divide instant cookie weight by 2 and multiply specials weight by 2",
            cost() {
                maxPurchasec3 = new Decimal(1)
                if (hasUpgrade('c', 43)) {maxPurchasec3 = maxPurchasec3.add(upgradeEffect('c', 43))}
                actualPurchasec3 = new Decimal(hasUpgrade('c', 31)+hasUpgrade('c', 32)+hasUpgrade('c', 33)+hasUpgrade('c', 34))
                if (maxPurchasec3.lte(actualPurchasec3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        32: {
            title: "crunch upgrade 32",
            description: "multiply prestige buyable 22 effect by 1.33",
            cost() {
                if (maxPurchasec3.lte(actualPurchasec3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        33: {
            title: "crunch upgrade 33",
            description: "add 0.16 to heavenly buyable 12 effect",
            cost() {
                if (maxPurchasec3.lte(actualPurchasec3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(1/6)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        34: {
            title: "crunch upgrade 34",
            description: "buy two more upgrade from heavenly row 4",
            cost() {
                if (maxPurchasec3.lte(actualPurchasec3)) {return new Decimal('eeee10')} else {return new Decimal(100)}
            },
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        41: {
            title: "crunch upgrade 41",
            description: "buy unlimited upgrades on crunch row 1",
            cost() {
                return new Decimal(1e3)
            },
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        42: {
            title: "crunch upgrade 42",
            description: "buy unlimited upgrades on crunch row 2",
            cost() {
                return new Decimal(5e3)
            },
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        43: {
            title: "crunch upgrade 43",
            description: "buy unlimited upgrades on crunch row 3",
            cost() {
                return new Decimal(25e3)
            },
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        44: {
            title: "crunch upgrade 44",
            description: "multiply cookie gain exponent by log(total crunch/2000+10)^0.5",
            cost() {
                return new Decimal(125e3)
            },
            effect() {
                eff = player.c.total.div(2000).add(10).log10().pow(0.5)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    },
})

addLayer("m", {
    name: "magic", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#eb34c0",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "unlocked spells", // Name of prestige currency
    baseResource: "cookies", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addm = new Decimal(-5.69897000433601880478626110527550697323181011853789145868957253877289181073) //-5-ln5/ln10

        multm = new Decimal(3.32192809488736234787031942948939017586483139302458061205475639581593477660) //ln10/ln4

        return multm
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expm = new Decimal(1)

        return expm
    },
    getResetGain() {
        mp = player.points.max(10).log10().log10().add(addm).times(multm).pow(expm)

        return mp.floor().sub(player.m.total).max(0)
    },
    getNextAt() {
        nextm = getResetGain('m').add(1).add(player.m.total)
        return nextm.root(expm).div(multm).sub(addm).pow10().pow10()
    },
    canReset() {return getResetGain('m').gte(0)&&!(false)}, //change false to autogain trigger
    prestigeNotify() {return true},
    prestigeButtonText() {
        if (false ){
            return "The automatic resets are giving you "+format(buyableEffect('h', 11).times(getPointGen()).times(multb).pow(expb).div(buyableEffect('h', 11)))+" building points every second"
        } else {
            return "Reset to unlock "+formatWhole(getResetGain('m'))+" spells. Next at "+format(getNextAt('m'))+" cookies" 
        }
    },
    onPrestige() {
        setBuyableAmount('m', 101, Decimal.dOne)
    },
    row: 5, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [

    ],
    layerShown() {return player.points.gte('e4e5')||player.m.total.gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    update(diff) {
        magicGain = getBuyableAmount('m', 101).times(buyableEffect('m', 101).magicCap.sub(getBuyableAmount('m', 101))).div(60)
        setBuyableAmount('m', 101, getBuyableAmount('m', 101).add(magicGain.times(diff)).min(buyableEffect('m', 101).magicCap.max(1)).max(0)) 
        if (getBuyableAmount('m', 11).gt(0)) {setBuyableAmount('m', 11, getBuyableAmount('m', 11).sub(diff).max(0))}
    
    },
    infoboxes: {
        A: {
            body() {
                textm = "your "+format(layers.b.buyables[11].cost().continuum)+" buildings 11s are giving you "+format(buyableEffect('m', 101).magicCap, 4)+" magic cap. <br> you currently have "+format(getBuyableAmount('m', 101), 4)+" magic. "
                textm += " <br> your magic gain is proportional to your owned magic and your unowned magic. to prevent loss of all magic, you are stopped from using the last "+format(buyableEffect('m', 101).magicMin, 4)+" of your magic"
                return textm
            }
        }
    },
    clickables: {
        11: {
            display() { return "increase the magic use limit greatly"},
            unlocked() {return player.m.points.gte(1)},
            onClick() {
                setClickableState('m', 11, getClickableState('m', 11)* 1 + getClickableState('h', 23))
            },
            canClick() {return true},
        },
        12: {
            display() { return "increase the magic use limit slightly"},
            unlocked() {return player.m.points.gte(1)},
            onClick() {
                setClickableState('m', 11, getClickableState('m', 11)*1+0.1)
            },
            canClick() {return true},
        },
        13: {
            display() { return "decrease the magic use limit slightly"},
            unlocked() {return player.m.points.gte(1)},
            onClick() {
                setClickableState('m', 11, getClickableState('m', 11)*1-0.1)
            },
            canClick() {return true},
        },
        14: {
            display() { return "decrease the magic use limit greatly"},
            unlocked() {return player.m.points.gte(1)},
            onClick() {
                setClickableState('m', 11, getClickableState('m', 11)*1-1)
            },
            canClick() {return true},
        },
    },
    buyables: {
        11: {
            unlocked() {return player.m.points.gte(1)},
            cost(x) {
                costm11 = new Decimal(1)
                return costm11
            },
            effect(x) {
                effBasem11 = new Decimal(1.2)
                effStackm11 = new Decimal(1)

                effTimem11 = new Decimal(0.5)
                effTimeStackm11 = new Decimal(1)

                return {eff: Decimal.pow(effBasem11, effStackm11), time: Decimal.times(effTimem11, effTimeStackm11)}
            },
            title() { return "spell 11"},
            display() { return "your cookie/sec is raised to "+format(this.effect().eff)+" for "+format(this.effect().time)+" sec <br> cost: "+format(this.cost())+" magic"},
            canAfford() { return player[this.layer].buyables[101].sub(buyableEffect('m', 101).magicMin).gte(this.cost()) },
            buy() {
                player[this.layer].buyables[101] = player[this.layer].buyables[101].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.effect().time))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        101: { //the amount owned of this buyable is held magic
            unlocked() {return false},
            cost(x) {


                return Decimal.dInf
            },
            effect(x) {
                magicCap = layers.b.buyables[11].cost().continuum.max(1).log10().sqrt()
                magicMinProporNum = new Decimal(getClickableState('m', 11)).max(0).add(1)
                magicMinProporDim = new Decimal(getClickableState('m', 11)).abs().add(2)
                magicMin = magicCap.times(magicMinProporNum).div(magicMinProporDim)

                return {magicCap: magicCap, magicMin: magicMin}
            },

            title() { return "magic buyable 101"},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
    },
    upgrades: {
    },
    milestones: {
        0: {
            requirementDescription: "magic milestone 0",
            effectDescription() {return  "1 spells unlocked: continuum heavenly buyables, keep sugar on reset, double crunch multiplier for every spell unlocked, buy one more upgrade on heavenly row 3, currently "+format(Decimal.dTwo.pow(player.m.total))+"x"},
            done() { return player.m.total.gte(1) }
        },
    },
})