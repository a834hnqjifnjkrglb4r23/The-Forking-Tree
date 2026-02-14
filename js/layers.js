addLayer("l", {
    name: "layers", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffffff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "layers", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    getResetGain() {
        thresholdsl = [
            new Decimal('10'),
            new Decimal('ee1'), new Decimal('ee2'), new Decimal('ee4'), new Decimal('ee6'),
            new Decimal('eee1'), new Decimal('eee2'), new Decimal('eee5'), 
            new Decimal('eeee1'), new Decimal('eeee3'), 
            Decimal.dTen.tetrate(5), Decimal.dTen.tetrate(6), 
            Decimal.dTen.tetrate('1e1'), Decimal.dTen.tetrate('1e2'), Decimal.dTen.tetrate('1e4'), Decimal.dTen.tetrate('1e6'), 
            Decimal.dTen.tetrate('1e10'),
            Decimal.dInf
        ]
        for (ilp = 0; ilp < 19; ilp++){
            if (player.points.lt(thresholdsl[ilp])) {
                return new Decimal(ilp)
            } 
        }
    },
    getNextAt() {
        return thresholdsl[getResetGain('l').mag]
    },
    canReset() {return getResetGain('l').gte(0)}, //change false to autogain trigger
    prestigeNotify() {return true},
    prestigeButtonText() {
        return "Reset for "+formatWhole(getResetGain('l'))+" layers. Next at "+format(getNextAt('l'))+" points"
    },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for layers", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            associatedLayer: "p",
            title: "layers upgrade 11",
            description: "unlock prestige points",
            cost: Decimal.dOne,
            effect: Decimal.dOne,
            effectDisplay() {return hasUpgrade(this.layer, this.id)},
            unlocked() {return true}
        },
    }
})

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return  hasUpgrade('l', 11)},
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    assignedto() {return ""},
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource() {return determineResourceName(this.assignedto())}, // Name of resource prestige is based on
    baseAmount() {return determinePointCount(this.assignedto())}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multp = new Decimal(0.1)
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(0.5)
        return expp
    },
    getResetGain() {
        pp = this.baseAmount().times(multp).pow(expp)

        return pp.floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1)
        return nextp.root(expp).div(multp)
    },
    canReset() {return getResetGain('p').gte(0)}, //change false to autogain trigger
    prestigeNotify() {return true},
    prestigeButtonText() {
        return "Reset for "+formatWhole(getResetGain('p'))+" "+this.resource+". Next at "+format(getNextAt('p'))+" "+this.baseResource()
    },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade('l', 11)},
    buyables: {
        11: {
            cost(x) { 
                costBasep11 = new Decimal(2)
                costStackp11 = new Decimal(x)
                return costBasep11.pow(costStackp11.add(1))
            },
            effect(x) {
                effBasep11 = new Decimal(1)
                effStackp11 = new Decimal(x)
                return effBasep11.times(effStackp11)
            },
            display() { return "Increases point gain by +"+format(effBasep11)+". <br> Cost: "+format(this.cost())+" points <br> Cost formula: "+format(costBasep11)+"^(n+1)"+"<br> Purchased: "+format(costStackp11)+"<br> Owned: "+format(effStackp11)+"<br> Effect: "+format(this.effect())+"<br> Effect formula: "+format(effBasep11)+"*n" },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    }
})



