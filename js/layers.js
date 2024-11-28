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
        expb = new Decimal(0.75)

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
    canReset() {return getResetGain('b').gte(0)&&!(false)}, //change false to autogain trigger
    passiveGeneration() {
        if (false) { //change false to autogain trigger
            return new Decimal(0.1)
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('b'))+" building points. Next at "+format(getNextAt('b'))+" cookies" },
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
    doReset(resettingLayer) { //
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}

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
                buyableTierb11 = new Decimal(1)
                constantCostb11 = Decimal.pow(1.06, buyableTierb11.pow(2)).times(Decimal.pow(10, buyableTierb11))
                linearCostb11 = new Decimal(1.1)
                quadraticCostb11 = new Decimal(1.0025)


                return constantCostb11.times(linearCostb11.pow(costStackb11)).times(quadraticCostb11.pow(costStackb11.pow(2))).floor()
            },
            effect(x) {
                effBaseb11 = new Decimal(1).times(buyableEffect('b', 12).effect)
                effStackb11 = new Decimal(x)

                return Decimal.times(effBaseb11, effStackb11)
            },
            title() { return "building 11"},
            display() { return "increase point gain by "+format(effBaseb11)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb11)+" <br> effect: "+format(this.effect())},
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
                costMultb12 = new Decimal(x).add(1)

                return Decimal.times(initialCostb12, costMultb12).floor()
            },
            effect(x) {
                effBaseb12 = new Decimal(2)
                effStackb12 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb12, effStackb12), spent: initialCostb12.times(effStackb12).times(effStackb12.add(1)).div(2)}
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
        21: {
            unlocked() {return true},
            cost(x) {
                costStackb21 = new Decimal(x).add(buyableEffect('b', 22).spent)
                buyableTierb21 = new Decimal(2)
                constantCostb21 = Decimal.pow(1.06, buyableTierb21.pow(2)).times(Decimal.pow(10, buyableTierb21))
                linearCostb21 = new Decimal(1.1)
                quadraticCostb21 = new Decimal(1.0025)


                return constantCostb21.times(linearCostb21.pow(costStackb21)).times(quadraticCostb21.pow(costStackb21.pow(2))).floor()
            },
            effect(x) {
                effBaseb21 = new Decimal(10).times(buyableEffect('b', 22).effect)
                effStackb21 = new Decimal(x)

                return Decimal.times(effBaseb21, effStackb21)
            },
            title() { return "building 21"},
            display() { return "increase point gain by "+format(effBaseb21)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb21)+" <br> effect: "+format(this.effect())},
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
                costMultb22 = new Decimal(x).add(1)

                return Decimal.times(initialCostb22, costMultb22).floor()
            },
            effect(x) {
                effBaseb22 = new Decimal(2)
                effStackb22 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb22, effStackb22), spent: initialCostb22.times(effStackb22).times(effStackb22.add(1)).div(2)}
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
        31: {
            unlocked() {return true},
            cost(x) {
                costStackb31 = new Decimal(x).add(buyableEffect('b', 32).spent)
                buyableTierb31 = new Decimal(3)
                constantCostb31 = Decimal.pow(1.06, buyableTierb31.pow(2)).times(Decimal.pow(10, buyableTierb31))
                linearCostb31 = new Decimal(1.12)
                quadraticCostb31 = new Decimal(1.0025)


                return constantCostb31.times(linearCostb31.pow(costStackb31)).times(quadraticCostb31.pow(costStackb31.pow(2))).floor()
            },
            effect(x) {
                effBaseb31 = new Decimal(100)
                effStackb31 = new Decimal(x)

                return Decimal.times(effBaseb31, effStackb31)
            },
            title() { return "building 31"},
            display() { return "increase point gain by "+format(effBaseb31)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb31)+" <br> effect: "+format(this.effect())},
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
                costMultb32 = new Decimal(x).add(1)

                return Decimal.times(initialCostb32, costMultb32).floor()
            },
            effect(x) {
                effBaseb32 = new Decimal(2)
                effStackb32 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb32, effStackb32), spent: initialCostb32.times(effStackb32).times(effStackb32.add(1)).div(2)}
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
        41: {
            unlocked() {return true},
            cost(x) {
                costStackb41 = new Decimal(x).add(buyableEffect('b', 42).spent)
                buyableTierb41 = new Decimal(4)
                constantCostb41 = Decimal.pow(1.06, buyableTierb41.pow(2)).times(Decimal.pow(10, buyableTierb41))
                linearCostb41 = new Decimal(1.1)
                quadraticCostb41 = new Decimal(1.0025)


                return constantCostb41.times(linearCostb41.pow(costStackb41)).times(quadraticCostb41.pow(costStackb41.pow(2))).floor()
            },
            effect(x) {
                effBaseb41 = new Decimal(1000)
                effStackb41 = new Decimal(x)

                return Decimal.times(effBaseb41, effStackb41)
            },
            title() { return "building 41"},
            display() { return "increase point gain by "+format(effBaseb41)+" per second <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackb41)+" <br> effect: "+format(this.effect())},
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
                costMultb42 = new Decimal(x).add(1)

                return Decimal.times(initialCostb42, costMultb42).floor()
            },
            effect(x) {
                effBaseb42 = new Decimal(2)
                effStackb42 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb42, effStackb42), spent: initialCostb42.times(effStackb42).times(effStackb42.add(1)).div(2)}
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
    },
})

addLayer("p", {
    name: "prestige points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
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
        expp = new Decimal(0.5)

        return expp
    },
    getResetGain() {
        pp = player.points.times(multp).pow(expp)

        return pp.sub(player.p.total).floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1).add(player.p.total)
        return nextp.root(expp).div(multp)
    },
    canReset() {return getResetGain('p').gte(0)&&!(false)}, //change false to autogain trigger
    passiveGeneration() {
        if (false) { //change false to autogain trigger
            return new Decimal(0.1)
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
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
    doReset(resettingLayer) { //
        if ((layers[resettingLayer].row > this.row)&&(!false)) {layerDataReset(this.layer, [])}

    },
    clickables: {
    },
    buyables: {
    },
    upgrades: {
        11: {
            title: "prestige upgrade 11",
            description: "multiplies cookie gain by 1+total prestige points/100",
            cost: Decimal.dZero,
            effect() {
                eff = player.p.total.div(100).add(1)

                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    }
})
