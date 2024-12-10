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
            if (hasMilestone('h', 0)) {addPoints('b', 13)}
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
                if (hasUpgrade('h', 21)) {constantCostb11 = constantCostb11.div(upgradeEffect('h', 21))}
                linearCostb11 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 11)))
                quadraticCostb11 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 11)))


                return constantCostb11.times(linearCostb11.pow(costStackb11)).times(quadraticCostb11.pow(costStackb11.pow(2))).floor()
            },
            effect(x) {
                effBaseb11 = Decimal.dTen.pow(buyableTierb11).times(buyableEffect('b', 12).effect)
                effStackb11 = new Decimal(x)

                return Decimal.times(effBaseb11, effStackb11)
            },
            title() { return "building 11"},
            display() { return "increase cookie gain by "+format(effBaseb11)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb11)+" <br> effect: "+format(this.effect())},
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
                initialCostb12 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb12 = initialCostb12.div(upgradeEffect('h', 22))}
                costMultb12 = new Decimal(x).add(1)

                return Decimal.times(initialCostb12, costMultb12).round()
            },
            effect(x) {
                effBaseb12 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb12 = effBaseb12.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(1)) {effBaseb12 = effBaseb12.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(1)) {effBaseb12 = effBaseb12.pow(buyableEffect('p', 22))}
                spentStackb12 = new Decimal(x)
                effStackb12 = spentStackb12.add(buyableEffect('b', 13))

                return {effect: Decimal.pow(effBaseb12, effStackb12), spent: initialCostb12.times(spentStackb12).times(spentStackb12.add(1)).div(2)}
            },
            title() { return "building 12"},
            display() { return "multiply building 11 effect by "+format(effBaseb12)+" <br> cost: "+format(this.cost())+" building 11s <br> owned: "+format(effStackb12)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
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

                return Decimal.pow(initialCostb13, linearCostb13).floor()
            },
            effect(x) {
                effBaseb13 = new Decimal(1)
                effStackb13 = new Decimal(x)

                return Decimal.times(effBaseb13, effStackb13)
            },
            title() { return "building 13"},
            display() { return "gives "+format(effBaseb13)+" free levels to building 12 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb13)+" <br> effect: "+format(this.effect())},
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
        21: {
            unlocked() {return true},
            cost(x) {
                costStackb21 = new Decimal(x).add(buyableEffect('b', 22).spent)
                buyableTierb21 = new Decimal(20/8)
                constantCostb21 = Decimal.pow(1.0455, buyableTierb21.pow(2)).times(Decimal.pow(10, buyableTierb21))
                if (hasUpgrade('h', 21)) {constantCostb21 = constantCostb21.div(upgradeEffect('h', 21))}
                linearCostb21 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 12)))
                quadraticCostb21 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 12)))


                return constantCostb21.times(linearCostb21.pow(costStackb21)).times(quadraticCostb21.pow(costStackb21.pow(2))).floor()
            },
            effect(x) {
                effBaseb21 = Decimal.dTen.pow(buyableTierb21).times(buyableEffect('b', 22).effect)
                effStackb21 = new Decimal(x)

                return Decimal.times(effBaseb21, effStackb21)
            },
            title() { return "building 21"},
            display() { return "increase cookie gain by "+format(effBaseb21)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb21)+" <br> effect: "+format(this.effect())},
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
                initialCostb22 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb22 = initialCostb22.div(upgradeEffect('h', 22))}
                costMultb22 = new Decimal(x).add(1)

                return Decimal.times(initialCostb22, costMultb22).round()
            },
            effect(x) {
                effBaseb22 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb22 = effBaseb22.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 22))}
                spentStackb22 = new Decimal(x)
                effStackb22 = spentStackb22.add(buyableEffect('b', 23))

                return {effect: Decimal.pow(effBaseb22, effStackb22), spent: initialCostb22.times(spentStackb22).times(spentStackb22.add(1)).div(2)}
            },
            title() { return "building 22"},
            display() { return "multiply building 21 effect by "+format(effBaseb22)+" <br> cost: "+format(this.cost())+" building 21s <br> owned: "+format(effStackb22)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[21].gte(this.cost()) },
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

                return Decimal.pow(initialCostb23, linearCostb23).floor()
            },
            effect(x) {
                effBaseb23 = new Decimal(1)
                effStackb23 = new Decimal(x)

                return Decimal.times(effBaseb23, effStackb23)
            },
            title() { return "building 23"},
            display() { return "gives "+format(effBaseb23)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb23)+" <br> effect: "+format(this.effect())},
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
        31: {
            unlocked() {return true},
            cost(x) {
                costStackb31 = new Decimal(x).add(buyableEffect('b', 32).spent)
                buyableTierb31 = new Decimal(30/7)
                constantCostb31 = Decimal.pow(1.045, buyableTierb31.pow(2)).times(Decimal.pow(10, buyableTierb31))
                if (hasUpgrade('h', 21)) {constantCostb31 = constantCostb31.div(upgradeEffect('h', 21))}
                linearCostb31 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 13)))
                quadraticCostb31 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 13)))


                return constantCostb31.times(linearCostb31.pow(costStackb31)).times(quadraticCostb31.pow(costStackb31.pow(2))).floor()
            },
            effect(x) {
                effBaseb31 = Decimal.dTen.pow(buyableTierb31).times(buyableEffect('b', 32).effect)
                effStackb31 = new Decimal(x)

                return Decimal.times(effBaseb31, effStackb31)
            },
            title() { return "building 31"},
            display() { return "increase cookie gain by "+format(effBaseb31)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb31)+" <br> effect: "+format(this.effect())},
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
                initialCostb32 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb32 = initialCostb32.div(upgradeEffect('h', 22))}
                costMultb32 = new Decimal(x).add(1)

                return Decimal.times(initialCostb32, costMultb32).round()
            },
            effect(x) {
                effBaseb32 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb32 = effBaseb32.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 22))}
                spentStackb32 = new Decimal(x)
                effStackb32 = spentStackb32.add(buyableEffect('b', 33))

                return {effect: Decimal.pow(effBaseb32, effStackb32), spent: initialCostb32.times(spentStackb32).times(spentStackb32.add(1)).div(2)}
            },
            title() { return "building 32"},
            display() { return "multiply building 31 effect by "+format(effBaseb32)+" <br> cost: "+format(this.cost())+" building 31s <br> owned: "+format(effStackb32)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[31].gte(this.cost()) },
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

                return Decimal.pow(initialCostb33, linearCostb33).floor()
            },
            effect(x) {
                effBaseb33 = new Decimal(1)
                effStackb33 = new Decimal(x)

                return Decimal.times(effBaseb33, effStackb33)
            },
            title() { return "building 33"},
            display() { return "gives "+format(effBaseb33)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb33)+" <br> effect: "+format(this.effect())},
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
        41: {
            unlocked() {return true},
            cost(x) {
                costStackb41 = new Decimal(x).add(buyableEffect('b', 42).spent)
                buyableTierb41 = new Decimal(40/6)
                constantCostb41 = Decimal.pow(1.0455, buyableTierb41.pow(2)).times(Decimal.pow(10, buyableTierb41))
                if (hasUpgrade('h', 21)) {constantCostb41 = constantCostb41.div(upgradeEffect('h', 21))}
                linearCostb41 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 14)))
                quadraticCostb41 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 14)))


                return constantCostb41.times(linearCostb41.pow(costStackb41)).times(quadraticCostb41.pow(costStackb41.pow(2))).floor()
            },
            effect(x) {
                effBaseb41 =  Decimal.dTen.pow(buyableTierb41).times(buyableEffect('b', 42).effect)
                effStackb41 = new Decimal(x)

                return Decimal.times(effBaseb41, effStackb41)
            },
            title() { return "building 41"},
            display() { return "increase cookie gain by "+format(effBaseb41)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb41)+" <br> effect: "+format(this.effect())},
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
        42: {
            unlocked() {return true},
            cost(x) {
                initialCostb42 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb42 = initialCostb42.div(upgradeEffect('h', 22))}
                costMultb42 = new Decimal(x).add(1)

                return Decimal.times(initialCostb42, costMultb42).round()
            },
            effect(x) {
                effBaseb42 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb42 = effBaseb42.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 22))}
                spentStackb42 = new Decimal(x)
                effStackb42 = spentStackb42.add(buyableEffect('b', 43))

                return {effect: Decimal.pow(effBaseb42, effStackb42), spent: initialCostb42.times(spentStackb42).times(spentStackb42.add(1)).div(2)}
            },
            title() { return "building 42"},
            display() { return "multiply building 41 effect by "+format(effBaseb42)+" <br> cost: "+format(this.cost())+" building 41s <br> owned: "+format(effStackb42)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[41].gte(this.cost()) },
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

                return Decimal.pow(initialCostb43, linearCostb43).floor()
            },
            effect(x) {
                effBaseb43 = new Decimal(1)
                effStackb43 = new Decimal(x)

                return Decimal.times(effBaseb43, effStackb43)
            },
            title() { return "building 43"},
            display() { return "gives "+format(effBaseb43)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb43)+" <br> effect: "+format(this.effect())},
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
        51: {
            unlocked() {return true},
            cost(x) {
                costStackb51 = new Decimal(x).add(buyableEffect('b', 52).spent)
                buyableTierb51 = new Decimal(50/5)
                constantCostb51 = Decimal.pow(1.04, buyableTierb51.pow(2)).times(Decimal.pow(10, buyableTierb51))
                if (hasUpgrade('h', 21)) {constantCostb51 = constantCostb51.div(upgradeEffect('h', 21))}
                linearCostb51 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 15)))
                quadraticCostb51 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 15)))


                return constantCostb51.times(linearCostb51.pow(costStackb51)).times(quadraticCostb51.pow(costStackb51.pow(2))).floor()
            },
            effect(x) {
                effBaseb51 =  Decimal.dTen.pow(buyableTierb51).times(buyableEffect('b', 52).effect)
                effStackb51 = new Decimal(x)

                return Decimal.times(effBaseb51, effStackb51)
            },
            title() { return "building 51"},
            display() { return "increase cookie gain by "+format(effBaseb51)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb51)+" <br> effect: "+format(this.effect())},
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
        52: {
            unlocked() {return true},
            cost(x) {
                initialCostb52 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb52 = initialCostb52.div(upgradeEffect('h', 22))}
                costMultb52 = new Decimal(x).add(1)

                return Decimal.times(initialCostb52, costMultb52).round()
            },
            effect(x) {
                effBaseb52 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb52 = effBaseb52.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 22))}
                spentStackb52 = new Decimal(x)
                effStackb52 = spentStackb52.add(buyableEffect('b', 53))

                return {effect: Decimal.pow(effBaseb52, effStackb52), spent: initialCostb52.times(spentStackb52).times(spentStackb52.add(1)).div(2)}
            },
            title() { return "building 52"},
            display() { return "multiply building 51 effect by "+format(effBaseb52)+" <br> cost: "+format(this.cost())+" building 51s <br> owned: "+format(effStackb52)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[51].gte(this.cost()) },
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

                return Decimal.pow(initialCostb53, linearCostb53).floor()
            },
            effect(x) {
                effBaseb53 = new Decimal(1)
                effStackb53 = new Decimal(x)

                return Decimal.times(effBaseb53, effStackb53)
            },
            title() { return "building 53"},
            display() { return "gives "+format(effBaseb53)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb53)+" <br> effect: "+format(this.effect())},
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
        61: {
            unlocked() {return true},
            cost(x) {
                costStackb61 = new Decimal(x).add(buyableEffect('b', 62).spent)
                buyableTierb61 = new Decimal(60/4)
                constantCostb61 = Decimal.pow(1.04, buyableTierb61.pow(2)).times(Decimal.pow(10, buyableTierb61))
                if (hasUpgrade('h', 21)) {constantCostb61 = constantCostb61.div(upgradeEffect('h', 21))}
                linearCostb61 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 16)))
                quadraticCostb61 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 16)))


                return constantCostb61.times(linearCostb61.pow(costStackb61)).times(quadraticCostb61.pow(costStackb61.pow(2))).floor()
            },
            effect(x) {
                effBaseb61 =  Decimal.dTen.pow(buyableTierb61).times(buyableEffect('b', 62).effect)
                effStackb61 = new Decimal(x)

                return Decimal.times(effBaseb61, effStackb61)
            },
            title() { return "building 61"},
            display() { return "increase cookie gain by "+format(effBaseb61)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb61)+" <br> effect: "+format(this.effect())},
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
        62: {
            unlocked() {return true},
            cost(x) {
                initialCostb62 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb62 = initialCostb62.div(upgradeEffect('h', 22))}
                costMultb62 = new Decimal(x).add(1)

                return Decimal.times(initialCostb62, costMultb62).round()
            },
            effect(x) {
                effBaseb62 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb62 = effBaseb62.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 22))}
                spentStackb62 = new Decimal(x)
                effStackb62 = spentStackb62.add(buyableEffect('b', 63))

                return {effect: Decimal.pow(effBaseb62, effStackb62), spent: initialCostb62.times(spentStackb62).times(spentStackb62.add(1)).div(2)}
            },
            title() { return "building 62"},
            display() { return "multiply building 61 effect by "+format(effBaseb62)+" <br> cost: "+format(this.cost())+" building 61s <br> owned: "+format(effStackb62)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[61].gte(this.cost()) },
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

                return Decimal.pow(initialCostb63, linearCostb63).floor()
            },
            effect(x) {
                effBaseb63 = new Decimal(1)
                effStackb63 = new Decimal(x)

                return Decimal.times(effBaseb63, effStackb63)
            },
            title() { return "building 63"},
            display() { return "gives "+format(effBaseb63)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb63)+" <br> effect: "+format(this.effect())},
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
        71: {
            unlocked() {return true},
            cost(x) {
                costStackb71 = new Decimal(x).add(buyableEffect('b', 72).spent)
                buyableTierb71 = new Decimal(70/3)
                constantCostb71 = Decimal.pow(1.04, buyableTierb71.pow(2)).times(Decimal.pow(10, buyableTierb71))
                if (hasUpgrade('h', 21)) {constantCostb71 = constantCostb71.div(upgradeEffect('h', 21))}
                linearCostb71 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 17)))
                quadraticCostb71 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 17)))


                return constantCostb71.times(linearCostb71.pow(costStackb71)).times(quadraticCostb71.pow(costStackb71.pow(2))).floor()
            },
            effect(x) {
                effBaseb71 =  Decimal.dTen.pow(buyableTierb71).times(buyableEffect('b', 72).effect)
                effStackb71 = new Decimal(x)

                return Decimal.times(effBaseb71, effStackb71)
            },
            title() { return "building 71"},
            display() { return "increase cookie gain by "+format(effBaseb71)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb71)+" <br> effect: "+format(this.effect())},
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
        72: {
            unlocked() {return true},
            cost(x) {
                initialCostb72 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb72 = initialCostb72.div(upgradeEffect('h', 22))}
                costMultb72 = new Decimal(x).add(1)

                return Decimal.times(initialCostb72, costMultb72).round()
            },
            effect(x) {
                effBaseb72 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb72 = effBaseb72.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 22))}
                spentStackb72 = new Decimal(x)
                effStackb72 = spentStackb72.add(buyableEffect('b', 73))

                return {effect: Decimal.pow(effBaseb72, effStackb72), spent: initialCostb72.times(spentStackb72).times(spentStackb72.add(1)).div(2)}
            },
            title() { return "building 72"},
            display() { return "multiply building 71 effect by "+format(effBaseb72)+" <br> cost: "+format(this.cost())+" building 71s <br> owned: "+format(effStackb72)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[71].gte(this.cost()) },
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

                return Decimal.pow(initialCostb73, linearCostb73).floor()
            },
            effect(x) {
                effBaseb73 = new Decimal(1)
                effStackb73 = new Decimal(x)

                return Decimal.times(effBaseb73, effStackb73)
            },
            title() { return "building 73"},
            display() { return "gives "+format(effBaseb73)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb73)+" <br> effect: "+format(this.effect())},
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
        81: {
            unlocked() {return true},
            cost(x) {
                costStackb81 = new Decimal(x).add(buyableEffect('b', 82).spent)
                buyableTierb81 = new Decimal(80/2)
                constantCostb81 = Decimal.pow(1.04, buyableTierb81.pow(2)).times(Decimal.pow(10, buyableTierb81))
                if (hasUpgrade('h', 21)) {constantCostb81 = constantCostb81.div(upgradeEffect('h', 21))}
                linearCostb81 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 18)))
                quadraticCostb81 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 18)))


                return constantCostb81.times(linearCostb81.pow(costStackb81)).times(quadraticCostb81.pow(costStackb81.pow(2))).floor()
            },
            effect(x) {
                effBaseb81 =  Decimal.dTen.pow(buyableTierb81).times(buyableEffect('b', 82).effect)
                effStackb81 = new Decimal(x)

                return Decimal.times(effBaseb81, effStackb81)
            },
            title() { return "building 81"},
            display() { return "increase cookie gain by "+format(effBaseb81)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb81)+" <br> effect: "+format(this.effect())},
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
        82: {
            unlocked() {return true},
            cost(x) {
                initialCostb82 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb82 = initialCostb82.div(upgradeEffect('h', 22))}
                costMultb82 = new Decimal(x).add(1)

                return Decimal.times(initialCostb82, costMultb82).round()
            },
            effect(x) {
                effBaseb82 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb82 = effBaseb82.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 22))}
                spentStackb82 = new Decimal(x)
                effStackb82 = spentStackb82.add(buyableEffect('b', 83))

                return {effect: Decimal.pow(effBaseb82, effStackb82), spent: initialCostb82.times(spentStackb82).times(spentStackb82.add(1)).div(2)}
            },
            title() { return "building 82"},
            display() { return "multiply building 81 effect by "+format(effBaseb82)+" <br> cost: "+format(this.cost())+" building 81s <br> owned: "+format(effStackb82)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[81].gte(this.cost()) },
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

                return Decimal.pow(initialCostb83, linearCostb83).floor()
            },
            effect(x) {
                effBaseb83 = new Decimal(1)
                effStackb83 = new Decimal(x)

                return Decimal.times(effBaseb83, effStackb83)
            },
            title() { return "building 83"},
            display() { return "gives "+format(effBaseb83)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb83)+" <br> effect: "+format(this.effect())},
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
        91: {
            unlocked() {return true},
            cost(x) {
                costStackb91 = new Decimal(x).add(buyableEffect('b', 92).spent)
                buyableTierb91 = new Decimal(90/1)
                constantCostb91 = Decimal.pow(1.04, buyableTierb91.pow(2)).times(Decimal.pow(10, buyableTierb91))
                if (hasUpgrade('h', 21)) {constantCostb91 = constantCostb91.div(upgradeEffect('h', 21))}
                linearCostb91 = new Decimal(1.1).root(clickableEffect('h', 21).pow(getClickableState('h', 19)))
                quadraticCostb91 = new Decimal(1.001).root(clickableEffect('h', 21).pow(getClickableState('h', 19)))


                return constantCostb91.times(linearCostb91.pow(costStackb91)).times(quadraticCostb91.pow(costStackb91.pow(2))).floor()
            },
            effect(x) {
                effBaseb91 =  Decimal.dTen.pow(buyableTierb91).times(buyableEffect('b', 92).effect)
                effStackb91 = new Decimal(x)

                return Decimal.times(effBaseb91, effStackb91)
            },
            title() { return "building 91"},
            display() { return "increase cookie gain by "+format(effBaseb91)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb91)+" <br> effect: "+format(this.effect())},
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
        92: {
            unlocked() {return true},
            cost(x) {
                initialCostb92 = new Decimal(5)
                if (hasUpgrade('h', 22)) {initialCostb92 = initialCostb92.div(upgradeEffect('h', 22))}
                costMultb92 = new Decimal(x).add(1)

                return Decimal.times(initialCostb92, costMultb92).round()
            },
            effect(x) {
                effBaseb92 = new Decimal(2).add(buyableEffect('p', 12))
                if (hasUpgrade('h', 23)) {effBaseb92 = effBaseb92.times(upgradeEffect('h', 23))}
                if (getBuyableAmount('p', 21).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 22))}
                spentStackb92 = new Decimal(x)
                effStackb92 = spentStackb92.add(buyableEffect('b', 93))

                return {effect: Decimal.pow(effBaseb92, effStackb92), spent: initialCostb92.times(spentStackb92).times(spentStackb92.add(1)).div(2)}
            },
            title() { return "building 92"},
            display() { return "multiply building 91 effect by "+format(effBaseb92)+" <br> cost: "+format(this.cost())+" building 91s <br> owned: "+format(effStackb92)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
            canAfford() { return player[this.layer].buyables[91].gte(this.cost()) },
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

                return Decimal.pow(initialCostb93, linearCostb93).floor()
            },
            effect(x) {
                effBaseb93 = new Decimal(1)
                effStackb93 = new Decimal(x)

                return Decimal.times(effBaseb93, effStackb93)
            },
            title() { return "building 93"},
            display() { return "gives "+format(effBaseb93)+" free levels to building 22 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb93)+" <br> effect: "+format(this.effect())},
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
    passiveGeneration() {
        return Decimal.dOne

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
                if (hasMilestone('h', 0)) {effBasep11 = effBasep11.times(player.h.total.add(1))}
                effStackp11 = new Decimal(x).times(player.p.total)

                return Decimal.times(effBasep11, effStackp11).add(1)
            },
            title() { return "prestige buyable 11"},
            display() { return "increase cookie gain by "+format(effBasep11)+" times cookie gain per total prestige point <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
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
                linearCostp22 = new Decimal('1e800')
                quadraticCostp22 = new Decimal(1.04).pow(800)


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
            effectDescription: "1 heavenly cookies: start with 13 building points, multiply prestige buyable 11 effect by total heavenly cookies, automatically reset for building points every 1 seconds",
            done() { return player.h.total.gte(1) }
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
                linearCosth21 = new Decimal(10)
                quadraticCosth21 = new Decimal(10)


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
                linearCosth22 = new Decimal(10)
                quadraticCosth22 = new Decimal(10)


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
        },
        21: {
            display() { return "unassign all buildings and reset buildings"},
            unlocked() {return getBuyableAmount('h', 12).gte(1)},
            onClick() {
                for (let i = 11; i < 20; i++ ) {
                    setClickableState('h', i, 0)
                }
                tempvar1 = [Decimal.dZero]
                for (let i = 1; i < 10; i++ ) {
                    tempvar1.push(getBuyableAmount('b', i*10+3))
                }
                layerDataReset('b', [])
                for (let i = 1; i < 10; i++ ) {
                    setBuyableAmount('b', i*10+3, tempvar1[i])
                }
                player.points = new Decimal(0)
                addPoints('b', 13)
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
            cost() {if (hasUpgrade('h', 12)) {return new Decimal('eeee6')} else {return new Decimal(1)}} ,
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
            cost() {if (hasUpgrade('h', 11)) {return new Decimal('eeee6')} else {return new Decimal(1)}} ,
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "heavenly upgrade 21",
            description: "divide all building ?1 costs by 60",
            cost() {if (hasUpgrade('h', 22)||hasUpgrade('h', 23)||hasUpgrade('h', 24)) {return new Decimal('eeee6')} else {return new Decimal(10)}} ,
            effect() {
                eff = new Decimal(60)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "heavenly upgrade 22",
            description: "divide all building ?2 cost by 1.25",
            cost() {if (hasUpgrade('h', 21)||hasUpgrade('h', 23)||hasUpgrade('h', 24)) {return new Decimal('eeee6')} else {return new Decimal(10)}} ,
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "heavenly upgrade 23",
            description: "multiply all building ?2 effects by 4",
            cost() {if (hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 24)) {return new Decimal('eeee6')} else {return new Decimal(10)}} ,
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "heavenly upgrade 24",
            description: "multiply sugar gain by 2",
            cost() {if (hasUpgrade('h', 21)||hasUpgrade('h', 22)||hasUpgrade('h', 23)) {return new Decimal('eeee6')} else {return new Decimal(10)}} ,
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        31: {
            title: "heavenly upgrade 31",
            description: "unlock synergy points",
            cost() {if (hasUpgrade('h', 32)) {return new Decimal('eeee6')} else {return new Decimal(0)}} ,
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        32: {
            title: "heavenly upgrade 32",
            description: "unlock generators",
            cost() {if (hasUpgrade('h', 31)) {return new Decimal('eeee6')} else {return new Decimal(0)}} ,
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
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

    },
    milestones: {

    },

    buyables: {
        // 11: {
        //     unlocked() {return hasUpgrade('h', 31)},
        //     cost(x) {
        //         linearCostsy = new Decimal(2)
        //         return linearCostsy.pow(getBuyableAmount(this.layer, this.id))
        //     },
        //     effect(x) {
        //         effBasesy = new Decimal(1.05)
        //         return Decimal.pow(effBasesy, getBuyableAmount(this.layer, this.id))
        //     },
        //     title() { return "synergy building "+this.id.toString()},
        //     display() { return "building "+Math.floor(this.id/10).toString()+"1 cps is multiplied by "+format(effBasesy)+" for every building "+Math.round(this.id % 10, 1).toString()+"1. <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())+" per building "},
        //     canAfford() { return player[this.layer].points.gte(this.cost()) },
        //     buy() {
        //         player[this.layer].points = player[this.layer].points.sub(this.cost())
        //         setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        //     },
        //     buyMax() {
        //         while (canBuyBuyable([this.layer], [this.id])){
        //             buyBuyable([this.layer], [this.id])
        //         }
        //     },
        // },
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

    layerShown() {return getBuyableAmount('h', 22).gte(1)},
    automate() {//change to when player unlock autobuy
        if (false) {

        }
    },
    doReset(resettingLayer) { //change false to keep on reset trigger
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}
    },
    infoboxes: {

    },
    milestones: {

    },

    buyables: {

    },
    clickables: {

    },
    upgrades: {

    },
})