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
        multp = new Decimal(0.001)
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(0.5)
        return expp
        exp2p = new Decimal(0.96)
        return exp2p
    },
    getResetGain() {
        pp = player.points.times(multp).pow(expp)
        if (pp.gte(10)) {pp = pp.log10().pow(exp2p).pow10()}

        return pp.floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1)
        if (nextp.gte(10)) {nextp = nextp.log10().root(exp2p).pow10()}
        return nextp.root(expp).div(multp)
    },
    canReset() {return getResetGain('p').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            cost(x) { 
                costTypep11 = "normal"
                costBasep11 = new Decimal(1.5)
                costMultp11 = new Decimal(2)
                costStackp11 = new Decimal(x)
                return player.buyablePrice(costTypep11, costStackp11, costBasep11, Decimal.dOne,costMultp11, Decimal.dInf )
            },
            effect(x){
                effBasep11 = new Decimal(1)
                effStackp11 = new Decimal(x)
                return effBasep11.times(effStackp11)
            },
            title() { 
                return "prestige buyable 11" 
            },
            display() {
                return "increase point gain by "+format(effBasep11)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep11 == "asymptote")||player.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep11, player.points, costBasep11, costExpp11, costLimitp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep11, player.points, costBasep11, costExpp11, costLimitp11))
                        if (player.points.lt('e100')) {player.points = player.points.sub(player.buyablePrice(costTypep11, player.buyableMaxPurchaseable(costTypep11, player.points, costBasep11, costExpp11, costLimitp11), costBasep11, costExpp11, costLimitp11))}
                    }
                }
            },
        },
    }
})
