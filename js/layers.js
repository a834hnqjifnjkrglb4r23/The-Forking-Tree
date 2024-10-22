addLayer("j", {
    name: "job", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "J", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        clickedAmount: 0,
    }},
    color: "#e6d200",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "money", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "This layer cannot be reset" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(resettingLayer) {
        return;
    },
    buyables: {
    },
    clickables: {
        11: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
            }
        }
    }

})

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addp = new Decimal(0)
        addp = addp.add(buyableEffect('p', 13))
        addp = addp.add(buyableEffect('sp', 13))

        multp = new Decimal(1)
        multp = multp.times(buyableEffect('p', 14))
        multp = multp.times(buyableEffect('sp', 14))
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(3)
        expp = expp.add(buyableEffect('p', 16))
        expp = expp.add(buyableEffect('sp', 19))

        exp2p = new Decimal(0.6)
        exp2p = exp2p.add(buyableEffect('p', 17))
        exp2p = exp2p.add(buyableEffect('sp', 21))
        return expp
    },
    getResetGain() {
        pp = player.points.add(addp).times(multp).pow(expp)
        if (pp.gte(1)) {pp = pp.log10().pow(exp2p).pow10()}

        return pp.floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1)
        if (nextp.gte(1)) {nextp = nextp.log10().pow(exp2p.pow(-1)).pow10()}
        return nextp.root(expp).div(multp).sub(addp)
    },
    canReset() {return getResetGain('p').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" seconds" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costBasep11 = new Decimal(1.5).root(buyableEffect('bp', 15))
                

                costExpp11 = new Decimal(x).add(1).pow(1.1)
                return Decimal.pow(costBasep11, costExpp11).floor()
            },
            effect(x) {
                effBasep11 = new Decimal(0.1)
                effStackp11 = new Decimal(x)

                return Decimal.times(effBasep11, effStackp11)
            },
            title() { return "prestige buyable 11"},
            display() { return "increase base point gain by "+format(effBasep11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costBasep12= new Decimal(1.9).root(buyableEffect('bp', 15))

                costExpp12 = new Decimal(x).add(1).pow(1.28)
                return Decimal.pow(costBasep12, costExpp12).floor()
            },
            effect(x) {
                effBasep12 = new Decimal(1.1)
                effStackp12 = new Decimal(x)

                return Decimal.pow(effBasep12, effStackp12)
            },
            title() { return "prestige buyable 12"},
            display() { return "multiply base point gain by "+format(effBasep12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costBasep13 = new Decimal(1.55).root(buyableEffect('bp', 15))

                costExpp13 = new Decimal(x).add(1).pow(1.2)
                return Decimal.pow(costBasep13, costExpp13).floor()
            },
            effect(x) {
                effBasep13 = new Decimal(0.1)
                effStackp13 = new Decimal(x)

                return Decimal.times(effBasep13, effStackp13)
            },
            title() { return "prestige buyable 13"},
            display() { return "add prestige point gain by "+format(effBasep13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {
                costBasep14 = new Decimal(1.95).root(buyableEffect('bp', 15))

                costExpp14 = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBasep14, costExpp14).floor()
            },
            effect(x) {
                effBasep14 = new Decimal(1.1)
                effStackp14 = new Decimal(x)

                return Decimal.pow(effBasep14, effStackp14)
            },
            title() { return "prestige buyable 14"},
            display() { return "multiply prestige point gain by "+format(effBasep14)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp14)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        15: {
            unlocked() {return true},
            cost(x) {
                costBasep15 = new Decimal(7).root(buyableEffect('bp', 15))

                costExpp15 = new Decimal(1).sub(x/10).pow(-1.3)
                return Decimal.pow(costBasep15, costExpp15).floor()
            },
            purchaseLimit: new Decimal(10),
            effect(x) {
                effBasep15 = new Decimal(0.1)
                effStackp15 = new Decimal(x)

                return Decimal.times(effBasep15, effStackp15)
            },
            title() { return "prestige buyable 15"},
            display() { return "reduce the first point softcap strength by "+format(effBasep15)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp15)+"/10 <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        16: {
            unlocked() {return true},
            cost(x) {
                costBasep16 = new Decimal(2.25).root(buyableEffect('bp', 15))

                costExpp16 = new Decimal(x).add(1).pow(1.75).log10().pow(1.25).pow10()
                return Decimal.pow(costBasep16, costExpp16).floor()
            },
            effect(x) {
                effBasep16 = new Decimal(0.05)
                effStackp16 = new Decimal(x)

                return Decimal.times(effBasep16, effStackp16)
            },
            title() { return "prestige buyable 16"},
            display() { return "add prestige point exponent by "+format(effBasep16)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp16)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        17: {
            unlocked() {return true},
            cost(x) {
                costBasep17 = new Decimal(15).root(buyableEffect('bp', 15))

                costExpp17 = new Decimal(1).sub(x/10).pow(-2.3)
                return Decimal.pow(costBasep17, costExpp17).floor()
            },
            purchaseLimit: new Decimal(10),
            effect(x) {
                effBasep17 = new Decimal(0.01)
                effStackp17 = new Decimal(x)

                return Decimal.times(effBasep17, effStackp17)
            },
            title() { return "prestige buyable 17"},
            display() { return "add prestige point exponent power to "+format(effBasep17)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp17)+"/10 <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("sp", {
    name: "superprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#3ba80f",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "superprestige points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addsp = new Decimal(0)
        addsp = addsp.add(buyableEffect('sp', 15))

        multsp = new Decimal(0.01)
        multsp = multsp.times(buyableEffect('sp', 16))
        return multsp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expsp = new Decimal(0.6)
        //expsp = expp.times(buyableEffect('p', 16))

        exp2sp = new Decimal(0.6)
        //exp2sp = exp2sp.add(buyableEffect('p', 17))
        return expsp
    },
    getResetGain() {
        spp = player.p.points.add(addsp).times(multsp).pow(expsp)
        if (spp.gte(1)) {spp = spp.log10().pow(exp2sp).pow10()}

        return spp.floor().max(0)
    },
    getNextAt() {
        nextsp = getResetGain('sp').add(1)
        if (nextsp.gte(1)) {nextsp = nextsp.log10().root(exp2sp).pow10()}
        return nextsp.root(expsp).div(multsp).sub(addsp)
    },
    canReset() {return getResetGain('sp').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('sp'))+" superprestige points. Next at "+format(getNextAt('sp'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for superprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costBasesp11 = new Decimal(1.4).root(buyableEffect('bp', 16))

                costExpsp11 = new Decimal(x).add(1).pow(1.1)
                return Decimal.pow(costBasesp11, costExpsp11).floor()
            },
            effect(x) {
                effBasesp11 = new Decimal(0.3)
                effStacksp11 = new Decimal(x)

                return Decimal.times(effBasesp11, effStacksp11)
            },
            title() { return "superprestige buyable 11"},
            display() { return "increase base point gain by "+format(effBasesp11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costBasesp12 = new Decimal(1.8).root(buyableEffect('bp', 16))

                costExpsp12 = new Decimal(x).add(1).pow(1.28)
                return Decimal.pow(costBasesp12, costExpsp12).floor()
            },
            effect(x) {
                effBasesp12 = new Decimal(1.3)
                effStacksp12 = new Decimal(x)

                return Decimal.pow(effBasesp12, effStacksp12)
            },
            title() { return "superprestige buyable 12"},
            display() { return "multiply base point gain by "+format(effBasesp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costBasesp13 = new Decimal(1.45).root(buyableEffect('bp', 16))

                costExpsp13 = new Decimal(x).add(1).pow(1.2)
                return Decimal.pow(costBasesp13, costExpsp13).floor()
            },
            effect(x) {
                effBasesp13 = new Decimal(0.2)
                effStacksp13 = new Decimal(x)

                return Decimal.times(effBasesp13, effStacksp13)
            },
            title() { return "superprestige buyable 13"},
            display() { return "add base prestige point gain by "+format(effBasesp13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {
                costBasesp14 = new Decimal(1.85).root(buyableEffect('bp', 16))

                costExpsp14 = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBasesp14, costExpsp14).floor()
            },
            effect(x) {
                effBasesp14 = new Decimal(1.2)
                effStacksp14 = new Decimal(x)

                return Decimal.pow(effBasesp14, effStacksp14)
            },
            title() { return "superprestige buyable 14"},
            display() { return "multiply prestige point gain by "+format(effBasesp14)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp16)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        15: {
            unlocked() {return true},
            cost(x) {
                costBasesp15 = new Decimal(1.5).root(buyableEffect('bp', 16))

                costExpsp15 = new Decimal(x).add(1).pow(1.3)
                return Decimal.pow(costBasesp15, costExpsp15).floor()
            },
            effect(x) {
                effBasesp15 = new Decimal(0.1)
                effStacksp15 = new Decimal(x)

                return Decimal.times(effBasesp15, effStacksp15)
            },
            title() { return "superprestige buyable 15"},
            display() { return "add base superprestige point gain by "+format(effBasesp15)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        16: {
            unlocked() {return true},
            cost(x) {
                costBasesp16 = new Decimal(1.9).root(buyableEffect('bp', 16))

                costExpsp16 = new Decimal(x).add(1).pow(1.48)
                return Decimal.pow(costBasesp16, costExpsp16).floor()
            },
            effect(x) {
                effBasesp16 = new Decimal(1.1)
                effStacksp16 = new Decimal(x)

                return Decimal.pow(effBasesp16, effStacksp16)
            },
            title() { return "superprestige buyable 16"},
            display() { return "multiply superprestige point gain by "+format(effBasesp16)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp16)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        17: {
            unlocked() {return true},
            cost(x) {
                costBasesp17 = new Decimal(3).root(buyableEffect('bp', 16))

                costExpsp17 = new Decimal(1).sub(x/10).pow(-1.3)
                return Decimal.pow(costBasesp17, costExpsp17).floor()
            },
            purchaseLimit: new Decimal(10),
            effect(x) {
                effBasesp17 = new Decimal(0.1)
                effStacksp17 = new Decimal(x)

                return Decimal.times(effBasesp17, effStacksp17)
            },
            title() { return "superprestige buyable 17"},
            display() { return "reduce the first point softcap strength by "+format(effBasesp17)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp17)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        18: {
            unlocked() {return true},
            cost(x) {
                costBasesp18 = new Decimal(4).root(buyableEffect('bp', 16))

                costExpsp18 = new Decimal(1).sub(x/10).pow(-1.8)
                return Decimal.pow(costBasesp18, costExpsp18).floor()
            },
            purchaseLimit: new Decimal(10),
            effect(x) {
                effBasesp18 = new Decimal(0.1)
                effStacksp18 = new Decimal(x)

                return Decimal.times(effBasesp18, effStacksp18)
            },
            title() { return "superprestige buyable 18"},
            display() { return "reduce the second point softcap strength by "+format(effBasesp18)+" <br> cost: "+format(this.cost())+"/10 <br> owned: "+format(effStacksp18)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        19: {
            unlocked() {return true},
            cost(x) {
                costBasesp19 = new Decimal(1.9).root(buyableEffect('bp', 16))

                costExpsp19 = new Decimal(x).add(1).pow(1.65).log10().pow(1.25).pow10()
                return Decimal.pow(costBasesp19, costExpsp19).floor()
            },
            effect(x) {
                effBasesp19 = new Decimal(0.05)
                effStacksp19 = new Decimal(x)

                return Decimal.times(effBasesp19, effStacksp19)
            },
            title() { return "superprestige buyable 19"},
            display() { return "add prestige point exponent by "+format(effBasesp19)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp19)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costBasesp21 = new Decimal(9).root(buyableEffect('bp', 16))

                costExpsp21 = new Decimal(1).sub(x/10).pow(-2.3)
                return Decimal.pow(costBasesp21, costExpsp21).floor()
            },
            effect(x) {
                effBasesp21 = new Decimal(0.01)
                effStacksp21 = new Decimal(x)

                return Decimal.times(effBasesp21, effStacksp21)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 21"},
            display() { return "add prestige point exponent power by "+format(effBasesp21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp21)+"/10 <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})

addLayer("bp", {
    name: "buyable points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#14dba3",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "buyable points", // Name of prestige currency
    baseResource: "prestige buyables", // Name of resource prestige is based on
    baseAmount() {
        totalPB = new Decimal(0)
        for (let i = 11; i < 18; i++) {
            totalPB = totalPB.add(player.p.buyables[i])
        }
        totalPBuyables = totalPB
        return totalPBuyables
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addbp = new Decimal(0)
        //addbp = addsp.add(buyableEffect('sp', 15))

        multbp = new Decimal(0.025)
        //multbp = multsp.times(buyableEffect('sp', 16))
        return multbp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expbp = new Decimal(1.6)
        //expbp = expp.times(buyableEffect('p', 16))

        exp2bp = new Decimal(0.6)
        //exp2sp = exp2sp.add(buyableEffect('p', 17))
        return expbp
    },
    getResetGain() {
        bpp = totalPBuyables.add(addbp).times(multbp).pow(expbp)
        if (bpp.gte(1)) {bpp = bpp.log10().pow(exp2bp).pow10()}

        return bpp.floor().max(0)
    },
    getNextAt() {
        nextbp = getResetGain('bp').add(1)
        if (nextbp.gte(1)) {nextbp = nextbp.log10().root(exp2bp).pow10()}
        return nextbp.root(expbp).div(multbp).sub(addbp)
    },
    canReset() {return getResetGain('bp').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('bp'))+" buyable points. Next at "+format(getNextAt('bp'))+" prestige buyables" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for buyable points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costBasebp11 = new Decimal(1.3)

                costExpbp11 = new Decimal(x).add(1).pow(1.1)
                return Decimal.pow(costBasebp11, costExpbp11).floor()
            },
            effect(x) {
                effBasebp11 = new Decimal(0.3)
                effStackbp11 = new Decimal(x)

                return Decimal.times(effBasebp11, effStackbp11)
            },
            title() { return "buyable buyable 11"},
            display() { return "increase base point gain by "+format(effBasebp11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costBasebp12 = new Decimal(1.7)

                costExpbp12 = new Decimal(x).add(1).pow(1.28)
                return Decimal.pow(costBasebp12, costExpbp12).floor()
            },
            effect(x) {
                effBasebp12 = new Decimal(1.3)
                effStackbp12 = new Decimal(x)

                return Decimal.pow(effBasebp12, effStackbp12)
            },
            title() { return "buyable buyable 12"},
            display() { return "multiply base point gain by "+format(effBasebp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costBasebp13 = new Decimal(4)

                costExpbp13 = new Decimal(1).sub(x/10).pow(-1.3)
                return Decimal.pow(costBasebp13, costExpbp13).floor()
            },
            purchaseLimit: new Decimal(10),
            effect(x) {
                effBasebp13 = new Decimal(0.1)
                effStackbp13 = new Decimal(x)

                return Decimal.times(effBasebp13, effStackbp13)
            },
            title() { return "buyable buyable 13"},
            display() { return "reduce the first point softcap strength by "+format(effBasebp13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {
                costBasebp14 = new Decimal(6)

                costExpbp14 = new Decimal(1).sub(x/10).pow(-1.8)
                return Decimal.pow(costBasebp14, costExpbp14).floor()
            },
            purchaseLimit: new Decimal(10),
            effect(x) {
                effBasebp14 = new Decimal(0.1)
                effStackbp14 = new Decimal(x)

                return Decimal.times(effBasebp14, effStackbp14)
            },
            title() { return "buyable buyable 14"},
            display() { return "reduce the second point softcap strength by "+format(effBasebp14)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        15: {
            unlocked() {return true},
            cost(x) {
                costBasebp15 = new Decimal(1.75)

                costExpbp15 = new Decimal(x).add(1).pow(1.75)
                return Decimal.pow(costBasebp15, costExpbp15).floor()
            },
            effect(x) {
                effBasebp15 = new Decimal(1.1)
                effStackbp15 = new Decimal(x)

                return Decimal.pow(effBasebp15, effStackbp15)
            },
            title() { return "buyable buyable 15"},
            display() { return "root the prestige buyables cost by "+format(effBasebp15)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        16: {
            unlocked() {return true},
            cost(x) {
                costBasebp16 = new Decimal(2)

                costExpbp16 = new Decimal(x).add(1).pow(1.75)
                return Decimal.pow(costBasebp16, costExpbp16).floor()
            },
            effect(x) {
                effBasebp16 = new Decimal(1.1)
                effStackbp16 = new Decimal(x)

                return Decimal.pow(effBasebp16, effStackbp16)
            },
            title() { return "buyable buyable 16"},
            display() { return "root the superprestige buyables cost by "+format(effBasebp16)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp16)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
})