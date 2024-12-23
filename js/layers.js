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
        expb = new Decimal(0.7).add(buyableEffect('p', 13))
        if (hasUpgrade('h', 11)) {expb = expb.times(upgradeEffect('h', 11))}
        if (hasUpgrade('h', 41)) {expb = expb.times(upgradeEffect('h', 41))}
        expb = expb.times(buyableEffect('c', 11))
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
        if (expb.lte(1)) {resetTimePeriod = new Decimal(1)}
        bgainPerReset = resetTimePeriod.times(getPointGen()).times(multb).pow(expb)
        addPoints('b', bgainPerReset.div(resetTimePeriod).times(diff))
        } else {}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {
        if (hasMilestone('h', 0)) {
            return "The automatic resets are giving you "+format(buyableEffect('h', 11).times(getPointGen()).times(multb).pow(expb).div(buyableEffect('h', 11)))+" building points every second"
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
            if (layers[resettingLayer].row == 2) {
                tempvar1 = [Decimal.dZero]
                for (let i = 1; i < 10; i++ ) {
                    tempvar1.push(getBuyableAmount('b', i*10+3))
                }
                layerDataReset(this.layer, [])
                for (let i = 1; i < 10; i++ ) {
                    setBuyableAmount('b', i*10+3, tempvar1[i])
                }
            } else {
                layerDataReset(this.layer, [])
            }
            if (hasMilestone('h', 0)||hasMilestone('c', 0)) {addPoints('b', 14)}
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

                linearCostb11 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 11)))
                quadraticCostb11 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 11)))

                if (hasUpgrade('h', 21)) {linearCostb11 = linearCostb11.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb11 = quadraticCostb11.root(upgradeEffect('h', 21))}

                constantCostLogb11 = constantCostb11.log10()
                linearCostLogb11 = linearCostb11.log10()
                quadraticCostLogb11 = quadraticCostb11.log10()
                
                return {cost: constantCostb11.times(linearCostb11.pow(costStackb11)).times(quadraticCostb11.pow(costStackb11.pow(2))).floor(), continuum: player.b.points.max(constantCostb11.div(linearCostb11).times(quadraticCostb11).pow(0.999)).log10().sub(constantCostLogb11).times(quadraticCostLogb11).times(4).add(linearCostLogb11.pow(2)).pow(1/2).sub(linearCostLogb11).div(quadraticCostLogb11).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb11 = Decimal.dTen.pow(buyableTierb11).times(buyableEffect('b', 12).effect)

                if (hasMilestone('c', 0)) {effStackb11 = this.cost().continuum.sub(buyableEffect('b', 12).spent)} else {effStackb11 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+1).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+1).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb11 = effBaseb11.times(totalSynergyBoost)


                return Decimal.times(effBaseb11, effStackb11)
            },
            title() { return "building 11"},
            display() { return "increase cookie gain by "+format(effBaseb11)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb11)+" <br> effect: "+format(this.effect())},
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
                initialCostb12 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb12 = initialCostb12.div(upgradeEffect('h', 22))}
                costMultb12 = new Decimal(x).add(1)

                return Decimal.times(initialCostb12, costMultb12).round()
            },
            effect(x) {
                effBaseb12 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 11))
                if (hasUpgrade('h', 23)) {effBaseb12 = effBaseb12.times(upgradeEffect('h', 23))}
                effBaseb12 = effBaseb12.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(1)) {effBaseb12 = effBaseb12.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(1)) {effBaseb12 = effBaseb12.pow(buyableEffect('p', 22))}
                spentStackb12 = new Decimal(x)
                effStackb12 = spentStackb12.add(buyableEffect('b', 13))

                return {effect: Decimal.pow(effBaseb12, effStackb12), spent: initialCostb12.times(spentStackb12).times(spentStackb12.add(1)).div(2)}
            },
            title() { return "building 12"},
            display() { return "multiply building 11 effect by "+format(effBaseb12)+" <br> cost: "+format(this.cost())+" building 11s <br> owned: "+format(effStackb12)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[11].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[11].gte(this.cost()) },
            buy() {
                if (!hasMilestone('c', 0)) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        13: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb13 = new Decimal(2)
                linearCostb13 = new Decimal(x)

                return Decimal.pow(initialCostb13, linearCostb13).round()
            },
            effect(x) {
                effBaseb13 = new Decimal(1)
                effStackb13 = new Decimal(x)

                return Decimal.times(effBaseb13, effStackb13)
            },
            title() { return "building 13"},
            display() { return "gives "+format(effBaseb13)+" free levels to building 12 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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
                constantCostb21 = Decimal.pow(1.0455, buyableTierb21.pow(2)).times(Decimal.pow(10, buyableTierb21))
                linearCostb21 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 12)))
                quadraticCostb21 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 12)))

                
                if (hasUpgrade('h', 21)) {linearCostb21 = linearCostb21.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb21 = quadraticCostb21.root(upgradeEffect('h', 21))}

                constantCostLogb21 = constantCostb21.log10()
                linearCostLogb21 = linearCostb21.log10()
                quadraticCostLogb21 = quadraticCostb21.log10()
                
                return {cost: constantCostb21.times(linearCostb21.pow(costStackb21)).times(quadraticCostb21.pow(costStackb21.pow(2))).floor(), continuum: player.b.points.max(constantCostb21.div(linearCostb21).times(quadraticCostb21).pow(0.999)).log10().sub(constantCostLogb21).times(quadraticCostLogb21).times(4).add(linearCostLogb21.pow(2)).pow(1/2).sub(linearCostLogb21).div(quadraticCostLogb21).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb21 = Decimal.dTen.pow(buyableTierb21).times(buyableEffect('b', 22).effect)

                if (hasMilestone('c', 0)) {effStackb21 = this.cost().continuum.sub(buyableEffect('b', 22).spent)} else {effStackb21 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+2).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+2).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb21 = effBaseb21.times(totalSynergyBoost)


                return Decimal.times(effBaseb21, effStackb21)
            },
            title() { return "building 21"},
            display() { return "increase cookie gain by "+format(effBaseb21)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb21)+" <br> effect: "+format(this.effect())},
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
                initialCostb22 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb22 = initialCostb22.div(upgradeEffect('h', 22))}
                costMultb22 = new Decimal(x).add(1)

                return Decimal.times(initialCostb22, costMultb22).round()
            },
            effect(x) {
                effBaseb22 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 12))
                if (hasUpgrade('h', 23)) {effBaseb22 = effBaseb22.times(upgradeEffect('h', 23))}
                effBaseb22 = effBaseb22.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 22))}
                spentStackb22 = new Decimal(x)
                effStackb22 = spentStackb22.add(buyableEffect('b', 23))

                return {effect: Decimal.pow(effBaseb22, effStackb22), spent: initialCostb22.times(spentStackb22).times(spentStackb22.add(1)).div(2)}
            },
            title() { return "building 22"},
            display() { return "multiply building 21 effect by "+format(effBaseb22)+" <br> cost: "+format(this.cost())+" building 21s <br> owned: "+format(effStackb22)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[21].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[21].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[21] = player[this.layer].buyables[21].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        23: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb23 = new Decimal(2)
                linearCostb23 = new Decimal(x)

                return Decimal.pow(initialCostb23, linearCostb23).round()
            },
            effect(x) {
                effBaseb23 = new Decimal(1)
                effStackb23 = new Decimal(x)

                return Decimal.times(effBaseb23, effStackb23)
            },
            title() { return "building 23"},
            display() { return "gives "+format(effBaseb23)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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
                linearCostb31 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 13)))
                quadraticCostb31 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 13)))

                
                if (hasUpgrade('h', 21)) {linearCostb31 = linearCostb31.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb31 = quadraticCostb31.root(upgradeEffect('h', 21))}

                constantCostLogb31 = constantCostb31.log10()
                linearCostLogb31 = linearCostb31.log10()
                quadraticCostLogb31 = quadraticCostb31.log10()
                
                return {cost: constantCostb31.times(linearCostb31.pow(costStackb31)).times(quadraticCostb31.pow(costStackb31.pow(2))).floor(), continuum: player.b.points.max(constantCostb31.div(linearCostb31).times(quadraticCostb31).pow(0.999)).log10().sub(constantCostLogb31).times(quadraticCostLogb31).times(4).add(linearCostLogb31.pow(2)).pow(1/2).sub(linearCostLogb31).div(quadraticCostLogb31).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb31 = Decimal.dTen.pow(buyableTierb31).times(buyableEffect('b', 32).effect)

                if (hasMilestone('c', 0)) {effStackb31 = this.cost().continuum.sub(buyableEffect('b', 32).spent)} else {effStackb31 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+3).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+3).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb31 = effBaseb31.times(totalSynergyBoost)


                return Decimal.times(effBaseb31, effStackb31)
            },
            title() { return "building 31"},
            display() { return "increase cookie gain by "+format(effBaseb31)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb31)+" <br> effect: "+format(this.effect())},
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
                initialCostb32 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb32 = initialCostb32.div(upgradeEffect('h', 22))}
                costMultb32 = new Decimal(x).add(1)

                return Decimal.times(initialCostb32, costMultb32).round()
            },
            effect(x) {
                effBaseb32 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 13))
                if (hasUpgrade('h', 23)) {effBaseb32 = effBaseb32.times(upgradeEffect('h', 23))}
                effBaseb32 = effBaseb32.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 22))}
                spentStackb32 = new Decimal(x)
                effStackb32 = spentStackb32.add(buyableEffect('b', 33))

                return {effect: Decimal.pow(effBaseb32, effStackb32), spent: initialCostb32.times(spentStackb32).times(spentStackb32.add(1)).div(2)}
            },
            title() { return "building 32"},
            display() { return "multiply building 31 effect by "+format(effBaseb32)+" <br> cost: "+format(this.cost())+" building 31s <br> owned: "+format(effStackb32)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[31].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[31].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[31] = player[this.layer].buyables[31].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        33: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb33 = new Decimal(2)
                linearCostb33 = new Decimal(x)

                return Decimal.pow(initialCostb33, linearCostb33).round()
            },
            effect(x) {
                effBaseb33 = new Decimal(1)
                effStackb33 = new Decimal(x)

                return Decimal.times(effBaseb33, effStackb33)
            },
            title() { return "building 33"},
            display() { return "gives "+format(effBaseb33)+" free levels to building 32 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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
                constantCostb41 = Decimal.pow(1.0455, buyableTierb41.pow(2)).times(Decimal.pow(10, buyableTierb41))

                linearCostb41 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 14)))
                quadraticCostb41 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 14)))

                if (hasUpgrade('h', 21)) {linearCostb41 = linearCostb41.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb41 = quadraticCostb41.root(upgradeEffect('h', 21))}

                constantCostLogb41 = constantCostb41.log10()
                linearCostLogb41 = linearCostb41.log10()
                quadraticCostLogb41 = quadraticCostb41.log10()
                
                return {cost: constantCostb41.times(linearCostb41.pow(costStackb41)).times(quadraticCostb41.pow(costStackb41.pow(2))).floor(), continuum: player.b.points.max(constantCostb41.div(linearCostb41).times(quadraticCostb41).pow(0.999)).log10().sub(constantCostLogb41).times(quadraticCostLogb41).times(4).add(linearCostLogb41.pow(2)).pow(1/2).sub(linearCostLogb41).div(quadraticCostLogb41).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb41 = Decimal.dTen.pow(buyableTierb41).times(buyableEffect('b', 42).effect)

                if (hasMilestone('c', 0)) {effStackb41 = this.cost().continuum.sub(buyableEffect('b', 42).spent)} else {effStackb41 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+4).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+4).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb41 = effBaseb41.times(totalSynergyBoost)


                return Decimal.times(effBaseb41, effStackb41)
            },
            title() { return "building 41"},
            display() { return "increase cookie gain by "+format(effBaseb41)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb41)+" <br> effect: "+format(this.effect())},
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
                initialCostb42 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb42 = initialCostb42.div(upgradeEffect('h', 22))}
                costMultb42 = new Decimal(x).add(1)

                return Decimal.times(initialCostb42, costMultb42).round()
            },
            effect(x) {
                effBaseb42 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 14))
                if (hasUpgrade('h', 23)) {effBaseb42 = effBaseb42.times(upgradeEffect('h', 23))}
                effBaseb42 = effBaseb42.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 22))}
                spentStackb42 = new Decimal(x)
                effStackb42 = spentStackb42.add(buyableEffect('b', 43))

                return {effect: Decimal.pow(effBaseb42, effStackb42), spent: initialCostb42.times(spentStackb42).times(spentStackb42.add(1)).div(2)}
            },
            title() { return "building 42"},
            display() { return "multiply building 41 effect by "+format(effBaseb42)+" <br> cost: "+format(this.cost())+" building 41s <br> owned: "+format(effStackb42)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[41].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[41].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[41] = player[this.layer].buyables[41].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        43: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb43 = new Decimal(2)
                linearCostb43 = new Decimal(x)

                return Decimal.pow(initialCostb43, linearCostb43).round()
            },
            effect(x) {
                effBaseb43 = new Decimal(1)
                effStackb43 = new Decimal(x)

                return Decimal.times(effBaseb43, effStackb43)
            },
            title() { return "building 43"},
            display() { return "gives "+format(effBaseb43)+" free levels to building 42 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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
                linearCostb51 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 15)))
                quadraticCostb51 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 15)))

                if (hasUpgrade('h', 21)) {linearCostb51 = linearCostb51.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb51 = quadraticCostb51.root(upgradeEffect('h', 21))}

                constantCostLogb51 = constantCostb51.log10()
                linearCostLogb51 = linearCostb51.log10()
                quadraticCostLogb51 = quadraticCostb51.log10()
                
                return {cost: constantCostb51.times(linearCostb51.pow(costStackb51)).times(quadraticCostb51.pow(costStackb51.pow(2))).floor(), continuum: player.b.points.max(constantCostb51.div(linearCostb51).times(quadraticCostb51).pow(0.999)).log10().sub(constantCostLogb51).times(quadraticCostLogb51).times(4).add(linearCostLogb51.pow(2)).pow(1/2).sub(linearCostLogb51).div(quadraticCostLogb51).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb51 = Decimal.dTen.pow(buyableTierb51).times(buyableEffect('b', 52).effect)

                if (hasMilestone('c', 0)) {effStackb51 = this.cost().continuum.sub(buyableEffect('b', 52).spent)} else {effStackb51 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+5).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+5).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb51 = effBaseb51.times(totalSynergyBoost)


                return Decimal.times(effBaseb51, effStackb51)
            },
            title() { return "building 51"},
            display() { return "increase cookie gain by "+format(effBaseb51)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb51)+" <br> effect: "+format(this.effect())},
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
                initialCostb52 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb52 = initialCostb52.div(upgradeEffect('h', 22))}
                costMultb52 = new Decimal(x).add(1)

                return Decimal.times(initialCostb52, costMultb52).round()
            },
            effect(x) {
                effBaseb52 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 15))
                if (hasUpgrade('h', 23)) {effBaseb52 = effBaseb52.times(upgradeEffect('h', 23))}
                effBaseb52 = effBaseb52.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 22))}
                spentStackb52 = new Decimal(x)
                effStackb52 = spentStackb52.add(buyableEffect('b', 53))

                return {effect: Decimal.pow(effBaseb52, effStackb52), spent: initialCostb52.times(spentStackb52).times(spentStackb52.add(1)).div(2)}
            },
            title() { return "building 52"},
            display() { return "multiply building 51 effect by "+format(effBaseb52)+" <br> cost: "+format(this.cost())+" building 51s <br> owned: "+format(effStackb52)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[51].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[51].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[51] = player[this.layer].buyables[51].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        53: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb53 = new Decimal(2)
                linearCostb53 = new Decimal(x)

                return Decimal.pow(initialCostb53, linearCostb53).round()
            },
            effect(x) {
                effBaseb53 = new Decimal(1)
                effStackb53 = new Decimal(x)

                return Decimal.times(effBaseb53, effStackb53)
            },
            title() { return "building 53"},
            display() { return "gives "+format(effBaseb53)+" free levels to building 52 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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
                linearCostb61 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 16)))
                quadraticCostb61 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 16)))

                if (hasUpgrade('h', 21)) {linearCostb61 = linearCostb61.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb61 = quadraticCostb61.root(upgradeEffect('h', 21))}

                constantCostLogb61 = constantCostb61.log10()
                linearCostLogb61 = linearCostb61.log10()
                quadraticCostLogb61 = quadraticCostb61.log10()
                
                return {cost: constantCostb61.times(linearCostb61.pow(costStackb61)).times(quadraticCostb61.pow(costStackb61.pow(2))).floor(), continuum: player.b.points.max(constantCostb61.div(linearCostb61).times(quadraticCostb61).pow(0.999)).log10().sub(constantCostLogb61).times(quadraticCostLogb61).times(4).add(linearCostLogb61.pow(2)).pow(1/2).sub(linearCostLogb61).div(quadraticCostLogb61).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb61 = Decimal.dTen.pow(buyableTierb61).times(buyableEffect('b', 62).effect)

                if (hasMilestone('c', 0)) {effStackb61 = this.cost().continuum.sub(buyableEffect('b', 62).spent)} else {effStackb61 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+6).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+6).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb61 = effBaseb61.times(totalSynergyBoost)


                return Decimal.times(effBaseb61, effStackb61)
            },
            title() { return "building 61"},
            display() { return "increase cookie gain by "+format(effBaseb61)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb61)+" <br> effect: "+format(this.effect())},
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
                initialCostb62 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb62 = initialCostb62.div(upgradeEffect('h', 22))}
                costMultb62 = new Decimal(x).add(1)

                return Decimal.times(initialCostb62, costMultb62).round()
            },
            effect(x) {
                effBaseb62 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 16))
                if (hasUpgrade('h', 23)) {effBaseb62 = effBaseb62.times(upgradeEffect('h', 23))}
                effBaseb62 = effBaseb62.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 22))}
                spentStackb62 = new Decimal(x)
                effStackb62 = spentStackb62.add(buyableEffect('b', 63))

                return {effect: Decimal.pow(effBaseb62, effStackb62), spent: initialCostb62.times(spentStackb62).times(spentStackb62.add(1)).div(2)}
            },
            title() { return "building 62"},
            display() { return "multiply building 61 effect by "+format(effBaseb62)+" <br> cost: "+format(this.cost())+" building 61s <br> owned: "+format(effStackb62)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[61].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[61].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[61] = player[this.layer].buyables[61].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        63: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb63 = new Decimal(2)
                linearCostb63 = new Decimal(x)

                return Decimal.pow(initialCostb63, linearCostb63).round()
            },
            effect(x) {
                effBaseb63 = new Decimal(1)
                effStackb63 = new Decimal(x)

                return Decimal.times(effBaseb63, effStackb63)
            },
            title() { return "building 63"},
            display() { return "gives "+format(effBaseb63)+" free levels to building 62 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb63)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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
                linearCostb71 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 17)))
                quadraticCostb71 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 17)))

                if (hasUpgrade('h', 21)) {linearCostb71 = linearCostb71.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb71 = quadraticCostb71.root(upgradeEffect('h', 21))}

                constantCostLogb71 = constantCostb71.log10()
                linearCostLogb71 = linearCostb71.log10()
                quadraticCostLogb71 = quadraticCostb71.log10()
                
                return {cost: constantCostb71.times(linearCostb71.pow(costStackb71)).times(quadraticCostb71.pow(costStackb71.pow(2))).floor(), continuum: player.b.points.max(constantCostb71.div(linearCostb71).times(quadraticCostb71).pow(0.999)).log10().sub(constantCostLogb71).times(quadraticCostLogb71).times(4).add(linearCostLogb71.pow(2)).pow(1/2).sub(linearCostLogb71).div(quadraticCostLogb71).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb71 = Decimal.dTen.pow(buyableTierb71).times(buyableEffect('b', 72).effect)

                if (hasMilestone('c', 0)) {effStackb71 = this.cost().continuum.sub(buyableEffect('b', 72).spent)} else {effStackb71 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+7).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+7).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb71 = effBaseb71.times(totalSynergyBoost)


                return Decimal.times(effBaseb71, effStackb71)
            },
            title() { return "building 71"},
            display() { return "increase cookie gain by "+format(effBaseb71)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb71)+" <br> effect: "+format(this.effect())},
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
                initialCostb72 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb72 = initialCostb72.div(upgradeEffect('h', 22))}
                costMultb72 = new Decimal(x).add(1)

                return Decimal.times(initialCostb72, costMultb72).round()
            },
            effect(x) {
                effBaseb72 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 17))
                if (hasUpgrade('h', 23)) {effBaseb72 = effBaseb72.times(upgradeEffect('h', 23))}
                effBaseb72 = effBaseb72.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 22))}
                spentStackb72 = new Decimal(x)
                effStackb72 = spentStackb72.add(buyableEffect('b', 73))

                return {effect: Decimal.pow(effBaseb72, effStackb72), spent: initialCostb72.times(spentStackb72).times(spentStackb72.add(1)).div(2)}
            },
            title() { return "building 72"},
            display() { return "multiply building 71 effect by "+format(effBaseb72)+" <br> cost: "+format(this.cost())+" building 71s <br> owned: "+format(effStackb72)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[71].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[71].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[71] = player[this.layer].buyables[71].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        73: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb73 = new Decimal(2)
                linearCostb73 = new Decimal(x)

                return Decimal.pow(initialCostb73, linearCostb73).round()
            },
            effect(x) {
                effBaseb73 = new Decimal(1)
                effStackb73 = new Decimal(x)

                return Decimal.times(effBaseb73, effStackb73)
            },
            title() { return "building 73"},
            display() { return "gives "+format(effBaseb73)+" free levels to building 72 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb73)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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

                linearCostb81 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 18)))
                quadraticCostb81 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 18)))

                if (hasUpgrade('h', 21)) {linearCostb81 = linearCostb81.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb81 = quadraticCostb81.root(upgradeEffect('h', 21))}

                constantCostLogb81 = constantCostb81.log10()
                linearCostLogb81 = linearCostb81.log10()
                quadraticCostLogb81 = quadraticCostb81.log10()
                
                return {cost: constantCostb81.times(linearCostb81.pow(costStackb81)).times(quadraticCostb81.pow(costStackb81.pow(2))).floor(), continuum: player.b.points.max(constantCostb81.div(linearCostb81).times(quadraticCostb81).pow(0.999)).log10().sub(constantCostLogb81).times(quadraticCostLogb81).times(4).add(linearCostLogb81.pow(2)).pow(1/2).sub(linearCostLogb81).div(quadraticCostLogb81).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb81 = Decimal.dTen.pow(buyableTierb81).times(buyableEffect('b', 82).effect)

                if (hasMilestone('c', 0)) {effStackb81 = this.cost().continuum.sub(buyableEffect('b', 82).spent)} else {effStackb81 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+8).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+8).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb81 = effBaseb81.times(totalSynergyBoost)


                return Decimal.times(effBaseb81, effStackb81)
            },
            title() { return "building 81"},
            display() { return "increase cookie gain by "+format(effBaseb81)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb81)+" <br> effect: "+format(this.effect())},
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
                initialCostb82 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb82 = initialCostb82.div(upgradeEffect('h', 22))}
                costMultb82 = new Decimal(x).add(1)

                return Decimal.times(initialCostb82, costMultb82).round()
            },
            effect(x) {
                effBaseb82 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 18))
                if (hasUpgrade('h', 23)) {effBaseb82 = effBaseb82.times(upgradeEffect('h', 23))}
                effBaseb82 = effBaseb82.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 22))}
                spentStackb82 = new Decimal(x)
                effStackb82 = spentStackb82.add(buyableEffect('b', 83))

                return {effect: Decimal.pow(effBaseb82, effStackb82), spent: initialCostb82.times(spentStackb82).times(spentStackb82.add(1)).div(2)}
            },
            title() { return "building 82"},
            display() { return "multiply building 81 effect by "+format(effBaseb82)+" <br> cost: "+format(this.cost())+" building 81s <br> owned: "+format(effStackb82)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[81].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[81].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[81] = player[this.layer].buyables[81].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        83: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb83 = new Decimal(2)
                linearCostb83 = new Decimal(x)

                return Decimal.pow(initialCostb83, linearCostb83).round()
            },
            effect(x) {
                effBaseb83 = new Decimal(1)
                effStackb83 = new Decimal(x)

                return Decimal.times(effBaseb83, effStackb83)
            },
            title() { return "building 83"},
            display() { return "gives "+format(effBaseb83)+" free levels to building 82 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb83)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
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

                linearCostb91 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 19)))
                quadraticCostb91 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 19)))
                
                if (hasUpgrade('h', 21)) {linearCostb91 = linearCostb91.root(upgradeEffect('h', 21))}
                if (hasUpgrade('h', 21)) {quadraticCostb91 = quadraticCostb91.root(upgradeEffect('h', 21))}

                constantCostLogb91 = constantCostb91.log10()
                linearCostLogb91 = linearCostb91.log10()
                quadraticCostLogb91 = quadraticCostb91.log10()
                
                return {cost: constantCostb91.times(linearCostb91.pow(costStackb91)).times(quadraticCostb91.pow(costStackb91.pow(2))).floor(), continuum: player.b.points.max(constantCostb91.div(linearCostb91).times(quadraticCostb91).pow(0.999)).log10().sub(constantCostLogb91).times(quadraticCostLogb91).times(4).add(linearCostLogb91.pow(2)).pow(1/2).sub(linearCostLogb91).div(quadraticCostLogb91).div(2).add(1).max(0)}
            },
            effect(x) {
                effBaseb91 = Decimal.dTen.pow(buyableTierb91).times(buyableEffect('b', 92).effect)

                if (hasMilestone('c', 0)) {effStackb91 = this.cost().continuum.sub(buyableEffect('b', 92).spent)} else {effStackb91 = new Decimal(x)}


                totalSynergyBoost = new Decimal(1)
                for (i = 1; i < 10; i++) {
                    if (hasMilestone('c', 0)) {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+9).pow(layers.b.buyables[i*10+1].cost().continuum))
                    } else {
                        totalSynergyBoost = totalSynergyBoost.times(buyableEffect('sy', i*10+9).pow(getBuyableAmount('b', i*10+1).add(buyableEffect('b', i*10+2).spent)))
                    }
                }
                effBaseb91 = effBaseb91.times(totalSynergyBoost)


                return Decimal.times(effBaseb91, effStackb91)
            },
            title() { return "building 91"},
            display() { return "increase cookie gain by "+format(effBaseb91)+" per second <br> cost: "+format(this.cost().cost)+" <br> owned: "+format(effStackb91)+" <br> effect: "+format(this.effect())},
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
                initialCostb92 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb92 = initialCostb92.div(upgradeEffect('h', 22))}
                costMultb92 = new Decimal(x).add(1)

                return Decimal.times(initialCostb92, costMultb92).round()
            },
            effect(x) {
                effBaseb92 = new Decimal(2).add(buyableEffect('p', 12)).add(buyableEffect('g', 19))
                if (hasUpgrade('h', 23)) {effBaseb92 = effBaseb92.times(upgradeEffect('h', 23))}
                effBaseb92 = effBaseb92.times(buyableEffect('c', 12))
                if (getBuyableAmount('p', 21).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 22))}
                spentStackb92 = new Decimal(x)
                effStackb92 = spentStackb92.add(buyableEffect('b', 93))

                return {effect: Decimal.pow(effBaseb92, effStackb92), spent: initialCostb92.times(spentStackb92).times(spentStackb92.add(1)).div(2)}
            },
            title() { return "building 92"},
            display() { return "multiply building 91 effect by "+format(effBaseb92)+" <br> cost: "+format(this.cost())+" building 91s <br> owned: "+format(effStackb92)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { if (hasMilestone('c', 0)) {return layers.b.buyables[91].cost().continuum.sub(this.effect().spent).gte(this.cost())} return player[this.layer].buyables[91].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[91] = player[this.layer].buyables[91].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        93: {
            unlocked() {return getBuyableAmount('p', 31).gte(1)},
            cost(x) {
                initialCostb93 = new Decimal(2)
                linearCostb93 = new Decimal(x)

                return Decimal.pow(initialCostb93, linearCostb93).round()
            },
            effect(x) {
                effBaseb93 = new Decimal(1)
                effStackb93 = new Decimal(x)

                return Decimal.times(effBaseb93, effStackb93)
            },
            title() { return "building 93"},
            display() { return "gives "+format(effBaseb93)+" free levels to building 92 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb93)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.s.points.gte(this.cost()) },
            style() {
                if (tmp[this.layer].buyables[this.id].canBuy) return { background: "#e1f09b" }
            },
            buy() {
                player.s.points = player.s.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
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
        total: new Decimal(0),
    }},
    color: "#e1f09b",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "sugar", // Name of prestige currency
    baseResource: "none", // Name of resource prestige is based on
    baseAmount() {return new Decimal(0)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mults = new Decimal(1/180).times(buyableEffect('p', 31))
        if (hasUpgrade('h', 24)) {mults = mults.times(upgradeEffect('h', 24))}
        mults = mults.times(buyableEffect('c', 13))

        return mults
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    getResetGain() {


        return mults
    },
    getNextAt() {

        return new Decimal(1)
    },
    canReset() {return false}, //change false to autogain trigger
    update(diff) { 
        addPoints('s', mults.times(diff))
    },
    prestigeNotify() {return true},
    prestigeButtonText() { 
        texts = "You cannot reset this layer. You are gaining "
        if (mults.gte(1)) {texts += format(mults)+" sugar every second"}
        else {texts += " a sugar every "+formatTime(mults.pow(-1))}
        return texts
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    displayRow: 1,
    hotkeys: [

    ],
    layerShown() {return getBuyableAmount('p', 31).gte(1)||player.s.total.gte(1)},
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
        multp = new Decimal(0.0001)


        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1/3)
        if (hasUpgrade('h', 12)) {expp = expp.times(upgradeEffect('h', 12))}
        if (hasUpgrade('h', 42)) {expp = expp.times(upgradeEffect('h', 42))}
        expp = expp.times(buyableEffect('c', 22))
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
    canReset() {return getResetGain('p').gte(0)&&!(false)}, //change false to autogain trigger
    passiveGeneration() {
        if (false) { //change false to autogain trigger
            return new Decimal(0.1)
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" cookies" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return player.points.gte(10000)||player.p.total.gte(1)},
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
    clickables: {

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costStackp11 = new Decimal(x)
                constantCostp11 = new Decimal(1)
                linearCostp11 = new Decimal(2)
                quadraticCostp11 = new Decimal(1.1)


                return constantCostp11.times(linearCostp11.pow(costStackp11)).times(quadraticCostp11.pow(costStackp11.pow(2))).round()
            },
            effect(x) {
                effBasep11 = new Decimal(0.1)

                crunchcomponent = player.c.total.div(10).add(1)

                heavenlycomponent = player.h.total.add(1)
                if (heavenlycomponent.gte(1e10)) {heavenlycomponent = heavenlycomponent.log10().log10().pow(0.75).pow10().pow10()}
                if (heavenlycomponent.gte(1e100)) {heavenlycomponent = heavenlycomponent.log10().log10().pow(2/3).pow10().pow10()}

                prestigecomponent = player.p.total
                if (prestigecomponent.gte(1e100)) {prestigecomponent = prestigecomponent.log10().log10().div(2).pow(0.75).times(2).pow10().pow10()}
                if (prestigecomponent.gte('e1000')) {prestigecomponent = prestigecomponent.log10().log10().div(3).pow(2/3).times(3).pow10().pow10()}

                effDisplay = effBasep11.times(heavenlycomponent) //add future prestige here

                effPerBuyable = Decimal.times(heavenlycomponent, prestigecomponent).pow(crunchcomponent).div(10)

                effStackp11 = new Decimal(x)

                return effPerBuyable.times(effStackp11).add(1)
            },
            title() { return "prestige buyable 11"},
            display() { 
                textone = "increase cookie gain by "+format(effDisplay)+" times cookie gain per total prestige point <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())
                if (prestigecomponent.gte(1e100)) {textone += "<br> beyond 1e100 prestige points, effect second exponent ^0.75"} else {}
            return textone},
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
                costStackp12 = new Decimal(x)
                constantCostp12 = new Decimal(5)
                linearCostp12 = new Decimal(2)
                quadraticCostp12 = new Decimal(3)


                return constantCostp12.times(linearCostp12.pow(costStackp12)).times(quadraticCostp12.pow(costStackp12.pow(2))).round()
            },
            effect(x) {
                effBasep12 = Decimal.dOne
                effStackp12 = new Decimal(x)

                return Decimal.times(effBasep12, effStackp12)
            },
            title() { return "prestige buyable 12"},
            display() { return "increase the 2nd column building effects by "+format(effBasep12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp12)+" <br> effect: "+format(this.effect())},
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
                costStackp13 = new Decimal(x)
                constantCostp13 = new Decimal(10)
                linearCostp13 = new Decimal(5)
                quadraticCostp13 = new Decimal(6)


                return constantCostp13.times(linearCostp13.pow(costStackp13)).times(quadraticCostp13.pow(costStackp13.pow(2))).round()
            },
            effect(x) {
                effBasep13 = new Decimal(0.05)
                effStackp13 = new Decimal(x)

                return Decimal.times(effBasep13, effStackp13)
            },
            title() { return "prestige buyable 13"},
            display() { return "increase the building gain exponent by "+format(effBasep13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp13)+" <br> effect: "+format(this.effect())},
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
                costStackp21 = new Decimal(x).add(1)
                costStackp21 = Decimal.div(costStackp21, Decimal.dTen.sub(costStackp21)).times(10)
                constantCostp21 = new Decimal(1)
                linearCostp21 = new Decimal(1e4)
                quadraticCostp21 = new Decimal(1.04).pow(4)


                return constantCostp21.times(linearCostp21.pow(costStackp21)).times(quadraticCostp21.pow(costStackp21.pow(2))).floor()
            },
            purchaseLimit: new Decimal(9),
            effect(x) {
                effBasep21 = new Decimal(2.5)
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
                effBasep22 = new Decimal(2)
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


                return constantCostp31.times(linearCostp31.pow(costStackp31)).times(quadraticCostp31.pow(costStackp31.pow(2))).floor()
            },
            effect(x) {
                effBasep31 = new Decimal(1)
                effStackp31 = new Decimal(x)

                return Decimal.times(effBasep31, effStackp31)
            },
            title() { return "prestige buyable 31"},
            display() { return "add sugar gain by "+format(this.effect())+" every 3 minutes <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
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
        multh = new Decimal(1e-31)


        return multh
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exph = new Decimal(1/12)
        if (hasUpgrade('h', 13)) {exph = exph.pow(upgradeEffect('h', 13))}
        if (hasUpgrade('h', 43)) {exph = exph.pow(upgradeEffect('h', 43))}

        exp2h = new Decimal(0.9)

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
    canReset() {return getResetGain('h').gte(0)&&!(false)}, //change false to autogain trigger
    passiveGeneration() {
        if (false) { //change false to autogain trigger
            return new Decimal(0.1)
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('h'))+" heavenly cookies. Next at "+format(getNextAt('h'))+" cookies" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for heavenly cookies", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() {return player.points.gte(1e31)||player.h.total.gte(1)},
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
    onPrestige(gain){
        if (getClickableState('h', 21)) 
            for (let i = 11; i < 20; i++ ) {
                    setClickableState('h', i, 0)
            }
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
            done() { return player.h.total.gte(1)||hasMilestone('c', 0) }
        }
    },

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costStackh11 = new Decimal(x)
                constantCosth11 = new Decimal(1)
                linearCosth11 = new Decimal(1.6180339887498948482)
                quadraticCosth11 = new Decimal(1)


                return constantCosth11.times(linearCosth11.pow(costStackh11)).times(quadraticCosth11.pow(costStackh11.pow(2))).floor()
            },
            effect(x) {
                effBaseh11 = new Decimal(360)
                effStackh11 = new Decimal(x)

                return Decimal.pow(effBaseh11, effStackh11)
            },
            title() { return "heavenly buyable 11"},
            display() { return "multiply the building automatic reset period by "+format(effBaseh11)+" <br> cost: "+format(this.cost())+" <br> effect: "+formatTime(this.effect())},
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
                costStackh12 = new Decimal(x)
                constantCosth12 = new Decimal(100)
                linearCosth12 = new Decimal(2)
                quadraticCosth12 = new Decimal(4)


                return constantCosth12.times(linearCosth12.pow(costStackh12)).times(quadraticCosth12.pow(costStackh12.pow(2))).floor()
            },
            effect(x) {
                effBaseh12 = new Decimal(1)
                effStackh12 = new Decimal(x)

                return Decimal.times(effBaseh12, effStackh12)
            },
            title() { return "heavenly buyable 12"},
            display() { return "assign "+format(effBaseh12)+" more buildings ?1 to cost group. buildings in cost group' cost scaling are divided by "+format(clickableEffect('h', 21))+". <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())+" buildings assignable to cost group"},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                costStackh21 = new Decimal(x)
                constantCosth21 = new Decimal(10000)
                linearCosth21 = new Decimal(2).root(buyableEffect('c', 21))
                quadraticCosth21 = new Decimal(5).root(buyableEffect('c', 21))


                return constantCosth21.times(linearCosth21.pow(costStackh21)).times(quadraticCosth21.pow(costStackh21.pow(2))).floor()
            },
            effect(x) {
                effBaseh21 = new Decimal(1)
                effStackh21 = new Decimal(x)

                return Decimal.times(effBaseh21, effStackh21)
            },
            title() { return "heavenly buyable 21"},
            display() { return "grant "+format(effBaseh21)+" synergy points. <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())+" total synergy point"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
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
                costStackh22 = new Decimal(x)
                constantCosth22 = new Decimal(10000)
                linearCosth22 = new Decimal(2).root(buyableEffect('c', 21))
                quadraticCosth22 = new Decimal(5).root(buyableEffect('c', 21))


                return constantCosth22.times(linearCosth22.pow(costStackh22)).times(quadraticCosth22.pow(costStackh22.pow(2))).floor()
            },
            effect(x) {
                effBaseh22 = new Decimal(1)
                effStackh22 = new Decimal(x)

                return Decimal.times(effBaseh22, effStackh22)
            },
            title() { return "heavenly buyable 22"},
            display() { return "grant "+format(effBaseh22)+" generators . <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())+" total generators"},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                addPoints('g', new Decimal(1))
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
            display() { return "assign building 11 to cost group, assigned "+getClickableState('h', 11)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 11, getClickableState('h', 11)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        12: {
            display() { return "assign building 21 to cost group, assigned "+getClickableState('h', 12)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 12, getClickableState('h', 12)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        13: {
            display() { return "assign building 31 to cost group, assigned "+getClickableState('h', 13)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 13, getClickableState('h', 13)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        14: {
            display() { return "assign building 41 to cost group, assigned "+getClickableState('h', 14)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 14, getClickableState('h', 14)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        15: {
            display() { return "assign building 51 to cost group, assigned "+getClickableState('h', 15)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 15, getClickableState('h', 15)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        16: {
            display() { return "assign building 61 to cost group, assigned "+getClickableState('h', 16)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 16, getClickableState('h', 16)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        17: {
            display() { return "assign building 71 to cost group, assigned "+getClickableState('h', 17)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 17, getClickableState('h', 17)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        18: {
            display() { return "assign building 81 to cost group, assigned "+getClickableState('h', 18)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 18, getClickableState('h', 18)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        19: {
            display() { return "assign building 91 to cost group, assigned "+getClickableState('h', 19)+" times"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 19, getClickableState('h', 19)*1+1)
            },
            canClick() { 
                alreadyAssigned = 0
                for (let i = 11; i < 20; i++ ) {
                    alreadyAssigned += getClickableState('h', i)

                }
                return new Decimal(alreadyAssigned).lt(getBuyableAmount('h', 12))
            },
            style() {const size1 = {width: "65px", height: "90px"}
            return size1},
        },
        21: {
            display() { return "unassign all buildings when you reset for heavenly cookies, currently "+getClickableState('h', 21)},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                setClickableState('h', 21, !getClickableState('h', 21))
            },
            effect() { 
                eff = new Decimal(1.25)
                return eff
            },
            canClick() {return true},
        },
    },
    upgrades: {
        11: {
            title: "heavenly upgrade 11",
            description: "multiply building gain exponent by 1.2",
            cost() {
                maxPurchaseh1 = new Decimal(1)
                if (hasUpgrade('c', 11)) {maxPurchaseh1 = maxPurchaseh1.add(upgradeEffect('c', 11))}
                if (hasUpgrade('c', 21)) {maxPurchaseh1 = maxPurchaseh1.add(upgradeEffect('c', 11))}
                actualPurchaseh1 = new Decimal(hasUpgrade('h', 11)+hasUpgrade('h', 12)+hasUpgrade('h', 13))
                if (maxPurchaseh1.lte(actualPurchaseh1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "heavenly upgrade 12",
            description: "multiply prestige gain exponent by 1.2",
            cost() {
                if (maxPurchaseh1.lte(actualPurchaseh1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "heavenly upgrade 13",
            description: "multiply heavenly gain exponent by 1.2",
            cost() {
                if (maxPurchaseh1.lte(actualPurchaseh1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasMilestone('c', 0)}
        },
        21: {
            title: "heavenly upgrade 21",
            description: "divide all building ?1 cost scaling by 1.25",
            cost() {
                maxPurchaseh2 = new Decimal(1)
                if (hasUpgrade('c', 12)) {maxPurchaseh2 = maxPurchaseh2.add(upgradeEffect('c', 12))}
                if (hasUpgrade('c', 22)) {maxPurchaseh2 = maxPurchaseh2.add(upgradeEffect('c', 22))}
                actualPurchaseh2 = new Decimal(hasUpgrade('h', 21)+hasUpgrade('h', 22)+hasUpgrade('h', 23)+hasUpgrade('h', 24))
                if (maxPurchaseh2.lte(actualPurchaseh2)) {return new Decimal('eeee10')} else {return new Decimal(10)}
            },
            effect() {
                eff = new Decimal(1.15)
                return eff
            },
            onPurchase() {
                for (let i = 11; i < 20; i++ ) {
                    setClickableState(getClickableState('h', i)*1+1)
                }
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
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
            description: "multiply sugar gain by 2",
            cost() {
                if (maxPurchaseh2.lte(actualPurchaseh2)) {return new Decimal('eeee10')} else {return new Decimal(10)}
            },
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 11)||hasUpgrade('h', 12)||hasUpgrade('h', 13)},
        },
        31: {
            title: "heavenly upgrade 31",
            description: "unlock synergy points",
            cost() {
                maxPurchaseh3 = new Decimal(1)
                if (hasUpgrade('c', 24)) {maxPurchaseh3 = maxPurchaseh3.add(upgradeEffect('c', 24))}
                actualPurchaseh3 = new Decimal(hasUpgrade('h', 31)+hasUpgrade('h', 32))
                if (maxPurchaseh3.lte(actualPurchaseh3)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 23)||hasUpgrade('h', 24)},
        },
        32: {
            title: "heavenly upgrade 32",
            description: "unlock generators",
            cost() {
                if (maxPurchaseh3.lte(actualPurchaseh3)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 23)||hasUpgrade('h', 24)},
        },
        41: {
            title: "heavenly upgrade 41",
            description: "multiply building gain exponent by 1.25",
            cost() {
                maxPurchaseh4 = new Decimal(1)
                //if (hasMilestone('c', 0)) {maxPurchaseh1 =}
                actualPurchaseh4 = new Decimal(hasUpgrade('h', 41)+hasUpgrade('h', 42))
                if (maxPurchaseh4.lte(actualPurchaseh4)) {return new Decimal('eeee10')} else {return new Decimal(1000)}
            },
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 31)||hasUpgrade('h', 32)},
        },
        42: {
            title: "heavenly upgrade 42",
            description: "multiply prestige gain exponent by 1.25",
            cost() {
                if (maxPurchaseh4.lte(actualPurchaseh4)) {return new Decimal('eeee10')} else {return new Decimal(1000)}
            },
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('h', 31)||hasUpgrade('h', 32)},
        },
        43: {
            title: "heavenly upgrade 43",
            description: "multiply heavenly gain exponent by 1.25",
            cost() {
                if (maxPurchaseh4.lte(actualPurchaseh4)) {return new Decimal('eeee10')} else {return new Decimal(1000)}
            },
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return (hasUpgrade('h', 31)||hasUpgrade('h', 32))&&hasMilestone('c', 0)},
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

    layerShown() {return getBuyableAmount('h', 21).gte(1)},
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

    buyables: {
        11: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {
                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        14: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        15: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        16: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        17: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        18: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        19: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        24: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        25: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        26: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        27: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        28: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        29: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        34: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        35: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        36: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        37: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        38: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        39: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        41: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        42: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        43: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        44: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        45: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        46: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        47: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        48: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        49: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        51: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        52: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        53: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        54: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        55: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        56: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        57: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        58: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        59: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        61: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        62: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        63: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        64: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        65: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        66: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        67: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        68: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        69: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        71: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        72: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        73: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        74: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        75: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        76: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        77: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        78: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        79: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        81: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        82: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        83: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        84: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        85: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        86: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        87: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        88: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        89: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        91: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        92: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        93: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        94: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        95: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        96: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        97: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        98: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        99: {
            unlocked() {return hasUpgrade('h', 31)},
            cost(x) {
                linearCostsy = new Decimal(2)
                return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
            },
            effect(x) {

                return Decimal.pow(player.effBasesy(), getBuyableAmount(this.layer, this.id))
            },
            title() { return this.id.toString()},
            display() { return "b"+Math.floor(this.id/10).toString()+"1->b"+Math.round(this.id % 10, 1).toString()+"1. cost: "+formatShort(this.cost(), 0)+" <br> effect: "+formatShort(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            style() {const size = {width: "67px", height: "67px"}
                return size},
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
        return getBuyableAmount('h', 22).gte(1)},
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
                costStackg11 = new Decimal(x)
                constantCostg11 = new Decimal(3)
                linearCostg11 = new Decimal(3)
                quadraticCostg11 = new Decimal(1.5)
                return constantCostg11.times(linearCostg11.pow(costStackg11)).times(quadraticCostg11.pow(costStackg11.pow(2)))
            },
            effect(x) {
                effStackg11 = new Decimal(x)
                effBaseg11 = new Decimal(0.25)

                baseGaingenerator = new Decimal(0.25)
                if (hasUpgrade('c', 14)) {baseGaingenerator = baseGaingenerator.times(upgradeEffect('c', 14))}

                return Decimal.times(effBaseg11, effStackg11).add(1).times(baseGaingenerator).times(player.g.points)
            },
            title() { return "generator buyable 21"},
            display() { return "your "+format(player.g.points)+" generators are generating "+format(this.effect(), 3)+" effect to all assigned buildings every second. <br> this buyable adds generator effect by "+format(effBaseg11)+"x. <br> cost: "+formatShort(this.cost())+" sugar. "+"assigned to: <br>"+Math.round(getClickableState('g', 11) * 10 - 98, 1).toString()},
            canAfford() { return player.s.points.gte(this.cost()) },

            buy() {
                player.s.points = player.s.points.sub(this.cost())
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

        multc = new Decimal(1/308.25471555991674389886862819788085941062643861719914630187772019415878) // = 1/(1024*log2)


        return multc
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expc = new Decimal(2) 


        return expc
    },
    getResetGain() {
        basec = player.points.max(1).log10()

        cp = basec.times(multc).pow(expc)


        return cp.sub(player.c.total).floor().max(0)
    },
    getNextAt() {
        nextc = getResetGain('c').add(1).add(player.c.total)

        nextc = nextc.root(expc).div(multc).pow10()

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
            effectDescription: "1 crunch: continuum all building ?1s, raise prestige buyable 11 effect by (crunch total)/10+1",
            done() { return player.c.total.gte(1) }
        }
    },

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costStackc11 = new Decimal(x)
                constantCostc11 = new Decimal(5)
                linearCostc11 = new Decimal(2)
                quadraticCostc11 = new Decimal(3)


                return constantCostc11.times(linearCostc11.pow(costStackc11)).times(quadraticCostc11.pow(costStackc11.pow(2))).floor()
            },
            effect(x) {
                effBasec11 = new Decimal(1.05)
                effStackc11 = new Decimal(x)

                return Decimal.pow(effBasec11, effStackc11)
            },
            title() { return "crunch buyable 11"},
            display() { return "multiply the building exponent by "+format(effBasec11)+" <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
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
                constantCostc12 = new Decimal(3)
                linearCostc12 = new Decimal(1.5)
                quadraticCostc12 = new Decimal(2)


                return constantCostc12.times(linearCostc12.pow(costStackc12)).times(quadraticCostc12.pow(costStackc12.pow(2))).floor()
            },
            effect(x) {
                effBasec12 = new Decimal(1.1)
                effStackc12 = new Decimal(x)

                return Decimal.pow(effBasec12, effStackc12)
            },
            title() { return "crunch buyable 12"},
            display() { return "multiply the building ?2 effect by "+format(effBasec12)+" <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
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
                constantCostc13 = new Decimal(1)
                linearCostc13 = new Decimal(2)
                quadraticCostc13 = new Decimal(1.1)


                return constantCostc13.times(linearCostc13.pow(costStackc13)).times(quadraticCostc13.pow(costStackc13.pow(2))).floor()
            },
            effect(x) {
                effBasec13 = new Decimal(1.2)
                effStackc13 = new Decimal(x)

                return Decimal.pow(effBasec13, effStackc13)
            },
            title() { return "crunch buyable 13"},
            display() { return "multiply sugar production by "+format(effBasec13)+" <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
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
                constantCostc21 = new Decimal(100)
                linearCostc21 = new Decimal(50)
                quadraticCostc21 = new Decimal(20)


                return constantCostc21.times(linearCostc21.pow(costStackc21)).times(quadraticCostc21.pow(costStackc21.pow(2))).floor()
            },
            effect(x) {
                effBasec21 = new Decimal(1.05)
                effStackc21 = new Decimal(x)

                return Decimal.pow(effBasec21, effStackc21)
            },
            title() { return "crunch buyable 21"},
            display() { return "multiply synergy and generator gain by "+format(effBasec21)+" <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
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
                constantCostc22 = new Decimal(10)
                linearCostc22 = new Decimal(5)
                quadraticCostc22 = new Decimal(2)


                return constantCostc22.times(linearCostc22.pow(costStackc22)).times(quadraticCostc22.pow(costStackc22.pow(2))).floor()
            },
            effect(x) {
                effBasec22 = new Decimal(1.05)
                effStackc22 = new Decimal(x)

                return Decimal.pow(effBasec22, effStackc22)
            },
            title() { return "crunch buyable 22"},
            display() { return "multiply the prestige exponent by "+format(effBasec22)+" <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
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
                if (hasUpgrade('c', 23)) {maxPurchasec1 = maxPurchasec1.add(upgradeEffect('c', 23))}
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
            description: "synergy base is +0.01",
            cost() {
                if (maxPurchasec1.lte(actualPurchasec1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(0.01)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "crunch upgrade 14",
            description: "generator base is *1.33",
            cost() {
                if (maxPurchasec1.lte(actualPurchasec1)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(4/3)
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
                //if (hasMilestone('c', 0)) {maxPurchaseh1 =}
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
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "crunch upgrade 23",
            description: "buy one more upgrade on crunch row 1",
            cost() {
                if (maxPurchasec2.lte(actualPurchasec2)) {return new Decimal('eeee10')} else {return new Decimal(3)}
            },
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "crunch upgrade 24",
            description: "buy one more upgrade on heavenly row 3",
            cost() {
                if (maxPurchasec2.lte(actualPurchasec2)) {return new Decimal('eeee10')} else {return new Decimal(1)}
            },
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    },
})

