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
                buyableTierb11 = new Decimal(10/9)
                constantCostb11 = Decimal.pow(1.04, buyableTierb11.pow(2)).times(Decimal.pow(10, buyableTierb11))
                linearCostb11 = new Decimal(1.1)
                quadraticCostb11 = new Decimal(1.001)


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
                costMultb12 = new Decimal(x).add(1)

                return Decimal.times(initialCostb12, costMultb12).floor()
            },
            effect(x) {
                effBaseb12 = new Decimal(2).add(buyableEffect('p', 12))
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
            unlocked() {return true},
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
            display() { return "gives "+format(effBaseb13)+" free levels to building 12 <br> cost: "+format(this.cost())+" sugar <br> owned: "+format(effStackb13)+" <br> effect: "+format(this.effect().effect)+" <br> spent: "+format(this.effect().spent)},
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
                constantCostb21 = Decimal.pow(1.04, buyableTierb21.pow(2)).times(Decimal.pow(10, buyableTierb21))
                linearCostb21 = new Decimal(1.1)
                quadraticCostb21 = new Decimal(1.001)


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
                costMultb22 = new Decimal(x).add(1)

                return Decimal.times(initialCostb22, costMultb22).floor()
            },
            effect(x) {
                effBaseb22 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(2)) {effBaseb22 = effBaseb22.pow(buyableEffect('p', 22))}
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
                buyableTierb31 = new Decimal(30/7)
                constantCostb31 = Decimal.pow(1.04, buyableTierb31.pow(2)).times(Decimal.pow(10, buyableTierb31))
                linearCostb31 = new Decimal(1.12)
                quadraticCostb31 = new Decimal(1.001)


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
                costMultb32 = new Decimal(x).add(1)

                return Decimal.times(initialCostb32, costMultb32).floor()
            },
            effect(x) {
                effBaseb32 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(3)) {effBaseb32 = effBaseb32.pow(buyableEffect('p', 22))}
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
                buyableTierb41 = new Decimal(40/6)
                constantCostb41 = Decimal.pow(1.04, buyableTierb41.pow(2)).times(Decimal.pow(10, buyableTierb41))
                linearCostb41 = new Decimal(1.1)
                quadraticCostb41 = new Decimal(1.001)


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
                costMultb42 = new Decimal(x).add(1)

                return Decimal.times(initialCostb42, costMultb42).floor()
            },
            effect(x) {
                effBaseb42 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(4)) {effBaseb42 = effBaseb42.pow(buyableEffect('p', 22))}
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
        51: {
            unlocked() {return true},
            cost(x) {
                costStackb51 = new Decimal(x).add(buyableEffect('b', 52).spent)
                buyableTierb51 = new Decimal(50/5)
                constantCostb51 = Decimal.pow(1.04, buyableTierb51.pow(2)).times(Decimal.pow(10, buyableTierb51))
                linearCostb51 = new Decimal(1.1)
                quadraticCostb51 = new Decimal(1.001)


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
                costMultb52 = new Decimal(x).add(1)

                return Decimal.times(initialCostb52, costMultb52).floor()
            },
            effect(x) {
                effBaseb52 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(5)) {effBaseb52 = effBaseb52.pow(buyableEffect('p', 22))}
                effStackb52 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb52, effStackb52), spent: initialCostb52.times(effStackb52).times(effStackb52.add(1)).div(2)}
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
        61: {
            unlocked() {return true},
            cost(x) {
                costStackb61 = new Decimal(x).add(buyableEffect('b', 62).spent)
                buyableTierb61 = new Decimal(60/4)
                constantCostb61 = Decimal.pow(1.04, buyableTierb61.pow(2)).times(Decimal.pow(10, buyableTierb61))
                linearCostb61 = new Decimal(1.1)
                quadraticCostb61 = new Decimal(1.001)


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
                costMultb62 = new Decimal(x).add(1)

                return Decimal.times(initialCostb62, costMultb62).floor()
            },
            effect(x) {
                effBaseb62 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(6)) {effBaseb62 = effBaseb62.pow(buyableEffect('p', 22))}
                effStackb62 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb62, effStackb62), spent: initialCostb62.times(effStackb62).times(effStackb62.add(1)).div(2)}
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
        71: {
            unlocked() {return true},
            cost(x) {
                costStackb71 = new Decimal(x).add(buyableEffect('b', 72).spent)
                buyableTierb71 = new Decimal(70/3)
                constantCostb71 = Decimal.pow(1.04, buyableTierb71.pow(2)).times(Decimal.pow(10, buyableTierb71))
                linearCostb71 = new Decimal(1.1)
                quadraticCostb71 = new Decimal(1.001)


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
                costMultb72 = new Decimal(x).add(1)

                return Decimal.times(initialCostb72, costMultb72).floor()
            },
            effect(x) {
                effBaseb72 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(7)) {effBaseb72 = effBaseb72.pow(buyableEffect('p', 22))}
                effStackb72 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb72, effStackb72), spent: initialCostb72.times(effStackb72).times(effStackb72.add(1)).div(2)}
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
        81: {
            unlocked() {return true},
            cost(x) {
                costStackb81 = new Decimal(x).add(buyableEffect('b', 82).spent)
                buyableTierb81 = new Decimal(80/2)
                constantCostb81 = Decimal.pow(1.04, buyableTierb81.pow(2)).times(Decimal.pow(10, buyableTierb81))
                linearCostb81 = new Decimal(1.1)
                quadraticCostb81 = new Decimal(1.001)


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
                costMultb82 = new Decimal(x).add(1)

                return Decimal.times(initialCostb82, costMultb82).floor()
            },
            effect(x) {
                effBaseb82 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(8)) {effBaseb82 = effBaseb82.pow(buyableEffect('p', 22))}
                effStackb82 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb82, effStackb82), spent: initialCostb82.times(effStackb82).times(effStackb82.add(1)).div(2)}
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
        91: {
            unlocked() {return true},
            cost(x) {
                costStackb91 = new Decimal(x).add(buyableEffect('b', 92).spent)
                buyableTierb91 = new Decimal(90/1)
                constantCostb91 = Decimal.pow(1.04, buyableTierb91.pow(2)).times(Decimal.pow(10, buyableTierb91))
                linearCostb91 = new Decimal(1.1)
                quadraticCostb91 = new Decimal(1.001)


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
                costMultb92 = new Decimal(x).add(1)

                return Decimal.times(initialCostb92, costMultb92).floor()
            },
            effect(x) {
                effBaseb92 = new Decimal(2).add(buyableEffect('p', 12))
                if (getBuyableAmount('p', 21).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 21))}
                if (getBuyableAmount('p', 22).gte(9)) {effBaseb92 = effBaseb92.pow(buyableEffect('p', 22))}
                effStackb92 = new Decimal(x)

                return {effect: Decimal.pow(effBaseb92, effStackb92), spent: initialCostb92.times(effStackb92).times(effStackb92.add(1)).div(2)}
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
        mults = new Decimal(1/300).times(buyableEffect('p', 31))


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
        softcapStartp = new Decimal('ee9')
        softcapPowerp = new Decimal(1/2)

        return expp
    },
    getResetGain() {
        basep = player.points
        if (basep.gte(softcapStartp)) {basep = basep.pow(softcapPowerp).times(softcapStartp.pow(Decimal.dOne.sub(softcapPowerp)))}
        pp = basep.times(multp).pow(expp)

        return pp.sub(player.p.total).floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1).add(player.p.total)
        nextp = nextp.root(expp).div(multp)
        if (nextp.gte(softcapStartp)) {nextp = nextp.root(softcapPowerp).div(softcapStartp.pow(Decimal.dOne.sub(softcapPowerp)))}
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
                quadraticCostp11 = new Decimal(1.05)


                return constantCostp11.times(linearCostp11.pow(costStackp11)).times(quadraticCostp11.pow(costStackp11.pow(2))).floor()
            },
            effect(x) {
                effBasep11 = player.p.total.div(10)
                effStackp11 = new Decimal(x)

                return Decimal.times(effBasep11, effStackp11).add(1)
            },
            title() { return "prestige buyable 11"},
            display() { return "increase cookie gain by 0.1 times cookie gain per total prestige point <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp11)+" <br> effect: "+format(this.effect())},
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
                linearCostp12 = new Decimal(2.5)
                quadraticCostp12 = new Decimal(2.4)


                return constantCostp12.times(linearCostp12.pow(costStackp12)).times(quadraticCostp12.pow(costStackp12.pow(2))).floor()
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
                linearCostp13 = new Decimal(7.5)
                quadraticCostp13 = new Decimal(4)


                return constantCostp13.times(linearCostp13.pow(costStackp13)).times(quadraticCostp13.pow(costStackp13.pow(2))).floor()
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
                effBasep21 = new Decimal(2)
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
                linearCostp22 = new Decimal(1e8)
                quadraticCostp22 = new Decimal(1.04).pow(8)


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
                effStackp31 = new Decimal(1)

                return Decimal.times(effBasep31, effStackp31)
            },
            title() { return "prestige buyable 31"},
            display() { return "add sugar gain by "+format(this.effect())+" every 5 minutes <br> cost: "+format(this.cost())+" <br> effect: "+format(this.effect())},
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
