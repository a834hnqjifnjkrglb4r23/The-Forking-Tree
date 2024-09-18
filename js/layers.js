addLayer("ik", {
    name: "integral kinematics", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IK", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#fff5eb",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "integral points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        if (typeof(ikLastReset)=="undefined") ikLastReset = Decimal.dZero
        multik = new Decimal(1)

        if (hasUpgrade('ik', 31)){multik = multik.add(upgradeEffect('ik', 31))}
        if (hasUpgrade('ik', 34)){multik = multik.add(upgradeEffect('ik', 34))}

        if (hasUpgrade('p', 14)){multik = multik.add(upgradeEffect('p', 14))}
        if (hasUpgrade('p', 34)){multik = multik.add(upgradeEffect('p', 34))}
        if (hasUpgrade('p', 121)){multik = multik.add(upgradeEffect('p', 121))}

        multik = multik.times(buyableEffect('ik', 11))


        speedik = new Decimal(1)

        if (hasUpgrade('p', 51)){speedik = speedik.add(upgradeEffect('p', 51))}
        if (hasUpgrade('p', 74)){speedik = speedik.add(upgradeEffect('p', 74))}



        if (hasUpgrade('i', 83)){speedik = speedik.add(upgradeEffect('i', 83))}

        speedik = speedik.times(buyableEffect('ik', 13))

        if (hasUpgrade('cg', 12)){speedik = speedik.times(upgradeEffect('cg', 12))}

        if (hasUpgrade('et', 21)){speedik = speedik.times(upgradeEffect('et', 21))}

        ilnum = toNumber(player.il.points.add(0.1).trunc()) //floating point asf
        return multik
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expik = new Decimal(1)
        return expik
    },
    canReset() {return false},
    doReset(resettingLayer) {

        if (layers[resettingLayer].row > this.row) {
            ikLastReset = Decimal.dZero
            layerDataReset("ik", [])
        }
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    update(diff) {
        if (!canGenPoints()) {return;} else {

            currentIKTime = player.points.sub(ikLastReset).times(speedik)
            nextTickIKTime = player.points.sub(ikLastReset).add(player.gamespeed().times(diff)).times(speedik)

            addPoints('ik', nextTickIKTime.pow(ilnum).sub(currentIKTime.pow(ilnum)).times(multik).div(factorial(ilnum)))
        }

    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textik = "the multiplier to integral kinematics point gain is "+format(multik)+"x <br>"
                textik += "the unit of integration is 1/"+format(speedik)+" seconds <br>"
                textik += "you have "+format(player.ik.total)+" total integral points <br>"
                textik += "you gain "+format(player.points.sub(ikLastReset).times(speedik).pow(ilnum - 1).times(multik).div(factorial(ilnum - 1)))+" integral points per second <br>"                
                textik += "your time integral is of layer "+format(ilnum)+"<br>"
                textik += "<br> this mechanic is stolen from Distance Incremental from jacorb90, but i promise there are original mechanics down the line (i also promise there are more stolen mechanics down the line too) <br>"
                return textik
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                baseCost = new Decimal(2.5)
                if (hasUpgrade('p', 44)) {baseCost = baseCost.div(upgradeEffect('p', 44))}
                freeRank = Decimal.dNegOne
                rankMult = buyableEffect('ik', 12).times(4)
                if (hasUpgrade('p', 24)) {rankMult = rankMult.times(upgradeEffect('p', 24))}
                scaling = new Decimal(2.5)

                costik11 = Decimal.dTen.pow(x.minus(freeRank).div(rankMult).pow(scaling)).times(baseCost)

                ownedik11 = player.ik.points.div(baseCost).max(1).log10().root(scaling).times(rankMult).add(freeRank.add(1)).max(0)
                if (hasUpgrade('q', 22)) {return Decimal.dInf} else {return costik11}
            },
            effect(x) {
                effbaseik11 = new Decimal(1.2)
                if (hasUpgrade('q', 22)) {logeffik11 = ownedik11} else {logeffik11 = new Decimal(x)}
                Decimal.pow(effbaseik11, logeffik11)
                return Decimal.pow(effbaseik11, logeffik11)
            },
            title() { return "integral points buyable 11" },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            display() { 
                bodytext = "multiply integral point gain by "+(format(effbaseik11))+"<br> req: "+format(this.cost())+"<br> owned: "
                if (hasUpgrade('q', 22)) {bodytext = bodytext+=format(ownedik11)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())
                if (hasUpgrade('q', 11)) {} else {bodytext = "resets time in this layer to"+bodytext}
            return bodytext},
            canAfford() { return (player.ik.points).gte(this.cost()) },
            buy() {
                if (hasUpgrade('q', 11)) {} else {
                    ikLastReset = player.points
                    layerDataReset('ik', [player.points, 'buyables'])
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return true},
            cost(x) { 
                baseCost = new Decimal(1.5)
                if (hasUpgrade('p', 44)) {baseCost = baseCost.div(upgradeEffect('p', 44))}
                rankCheapenerMult = new Decimal(1.5)
                if (hasUpgrade('p', 24)) {rankCheapenerMult = rankCheapenerMult.times(upgradeEffect('p', 24))}
                freeRankCheapener = Decimal.dNegOne
                scaling = new Decimal(4)
                costik12 = Decimal.dTen.pow(x.sub(freeRankCheapener).div(rankCheapenerMult).pow(scaling)).times(baseCost)

                ownedik12 = player.ik.points.div(baseCost).max(1).log10().root(scaling).times(rankCheapenerMult).add(freeRankCheapener.add(1)).max(0)
                if (hasUpgrade('q', 22)) {return Decimal.dInf} else {return costik12}
            },
            effect(x) {
                rankCheapenerBase = new Decimal(1.2)
                if (hasUpgrade('q', 22)) {logeffik12 = ownedik12} else {logeffik12 = new Decimal(x)}
                effeik12 = Decimal.pow(rankCheapenerBase, logeffik12)
                return effeik12
            },
            title() { return "integral kinematics buyable 12" },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            display() { 
                bodytext = "multiply your integral kinematics buyable 11 amount by "+format(rankCheapenerBase)+"<br> req: "+format(this.cost())+"<br> owned: "
                if (hasUpgrade('q', 22)) {bodytext = bodytext+=format(ownedik12)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())
                if (hasUpgrade('q', 11)) {} else {bodytext = "resets time in this layer to"+bodytext}
            return bodytext},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (hasUpgrade('q', 11)) {} else {
                    ikLastReset = player.points
                    layerDataReset('ik', [player.points, 'buyables'])
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return hasUpgrade('p', 44)},
            cost(x) { 
                baseCost = Decimal.dTwo
                freeTiers = Decimal.dNegOne
                tierMult = Decimal.dOne
                scaling = new Decimal(1.5)
                costik13 = baseCost.times(x.minus(freeTiers).div(tierMult).pow(scaling))

                ownedik13 = player.ik.points.div(baseCost).max(1).log10().root(scaling).times(tierMult).add(freeTiers.add(1)).max(0)
                if (hasUpgrade('q', 22)) {return Decimal.dInf} else {return costik13}
            },
            effect(x) {
                effbaseik13 = new Decimal(1.2)
                if (hasUpgrade('f', 13)) {effbaseik13 = new Decimal(1.5)}
                if (hasUpgrade('q', 22)) {logeffik13 = ownedik13} else {logeffik13 = new Decimal(x)}
                return Decimal.pow(effbaseik13, logeffik13)
            },
            title() { return "integral kinematics buyable 13" },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            display() { 
                bodytext = "resets your time in this layer and the previous two buyables to increase the layer's timespeed by x".concat(format(effbaseik13))+"<br> req: "+format(this.cost())+" integral kinematic buyable 11s <br> owned: "
                if (hasUpgrade('q', 22)) {bodytext = bodytext+=format(ownedik13)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())

            return bodytext},
            canAfford() { return (player.ik.buyables[11]).gte(this.cost()) },
            buy() {
                if (hasUpgrade('q', 13)) {} else {
                    ikLastReset = player.points
                    layerDataReset('ik', [player.points, 'buyables'])
                }
                if (hasUpgrade('q', 12)) {} else {
                    player.ik.buyables[11] = new Decimal(0)
                    player.ik.buyables[12] = new Decimal(0)
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {
            title: "integral kinematics upgrade 11",
            description: "multiplies prestige point gain by (ik points +1)^0.33",
            cost: Decimal.dOne,
            effect() {
                eff = player.ik.points.add(1).root(3)
                if (hasUpgrade('p', 111)){eff = eff.pow(upgradeEffect('p', 111))}


                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "integral kinematics upgrade 12",
            description: "multiplies prestige point gain by 10^(total ik buyable 11s *0.2)",
            cost: Decimal.dTwo,
            effect() {
                if (hasUpgrade('q', 22)) {eff = ownedik11.times(0.2).pow10()} else {eff = player.ik.buyables[11].times(0.2).pow10()}
                if (hasUpgrade('ik', 41)) {eff = eff.pow(upgradeEffect('ik', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "integral kinematics upgrade 13",
            description: "multiplies prestige point gain by 10^(total ik buyable 12s *0.12)",
            cost: Decimal.dTwo,
            effect() {
                if (hasUpgrade('q', 22)) {eff = ownedik12.times(0.12).pow10()} else {eff = player.ik.buyables[12].times(0.12).pow10()}
                if (hasUpgrade('ik', 41)) {eff = eff.pow(upgradeEffect('ik', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "integral kinematics upgrade 14",
            description: "multiplies prestige point gain by 10^(total ik buyable 13s *0.4)",
            cost: new Decimal(4),
            effect() {
                if (hasUpgrade('q', 22)) {eff = ownedik13.times(0.4).pow10()} else {eff = player.ik.buyables[13].times(0.4).pow10()}
                if (hasUpgrade('ik', 41)) {eff = eff.pow(upgradeEffect('ik', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "integral kinematics upgrade 21",
            description: "multiplies prestige point gain by log(total p points +1)",
            cost: new Decimal(20),
            effect() {
                eff = player.p.total.add(11).log10()
                
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "integral kinematics upgrade 22",
            description: "multiplies prestige point gain by (ik points +1)^0.33",
            cost: new Decimal(40),
            effect() {
                eff = player.ik.points.add(1).root(3)

                if (hasUpgrade('p', 111)){eff = eff.pow(upgradeEffect('p', 111))}
                if (hasUpgrade('p', 121)){eff = eff.pow(upgradeEffect('p', 121))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "integral kinematics upgrade 23",
            description: "multiplies prestige point gain by 10^( il points *0.5)",
            cost: new Decimal(100),
            effect() {
                eff = player.il.points.times(0.5).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "integral kinematics upgrade 24",
            description: "unlocks 8 integral kinematics upgrades",
            cost: new Decimal(200),
            effect() {
                eff = Decimal.dOne
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        31: {
            title: "integral kinematics upgrade 31",
            description: "add 0.1 to integral point gain multiplier",
            cost: new Decimal(500),
            effect() {
                eff = new Decimal(0.1)

                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        32: {
            title: "integral kinematics upgrade 32",
            description: "raises prestige upgrade 11 to 1.25",
            cost: new Decimal(1000),
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        33: {
            title: "integral kinematics upgrade 33",
            description: "adds total time by 2",
            cost: new Decimal(1000),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        34: {
            title: "integral kinematics upgrade 34",
            description: "add 0.1 to integral point gain multiplier",
            cost: new Decimal(20000),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        41: {
            title: "integral kinematics upgrade 41",
            description: "raise integral kinematics upgrade 12 to 14 to ^2.5 ",
            cost: new Decimal(5000),
            effect() {
                eff = new Decimal(2.5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        42: {
            title: "integral kinematics upgrade 42",
            description: "raise prestige point gain to 1.05",
            cost: new Decimal(5000),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        43: {
            title: "integral kinematics upgrade 43",
            description: "adds total time by 2",
            cost: new Decimal(10000),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        44: {
            title: "integral kinematics upgrade 44",
            description: "unlock 4 integral kinematics upgrades",
            cost: new Decimal(1e20),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        51: {
            title: "integral kinematics upgrade 51",
            description: "raise integral kinematics upgrade 11 effect to 10",
            cost: new Decimal(3e9),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 44)}
        },
        52: {
            title: "integral kinematics upgrade 52",
            description: "raise prestige point gain to ^1.2",
            cost: new Decimal(6e9),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 44)}
        },
        53: {
            title: "integral kinematics upgrade 53",
            description: "raise prestige point gain to ^1.3",
            cost: new Decimal(9e9),
            effect() {
                eff = new Decimal(1.3)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 44)}
        },
    },
})

addLayer("e", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#668CFF",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "energy", // Name of prestige currency
    baseResource: "power", // Name of resource prestige is based on
    baseAmount() {return player.pw.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multe = new Decimal(1)
        if (hasUpgrade('p', 52)){multe = multe.add(upgradeEffect('p', 52))}
        if (hasUpgrade('p', 81)){multe = multe.add(upgradeEffect('p', 81))}

        if (hasUpgrade('i', 82)){multe = multe.add(upgradeEffect('i', 82))}

        if (hasUpgrade('cg', 13)){multe = multe.times(upgradeEffect('cg', 13))}

        if (hasUpgrade('et', 21)){multe = multe.times(upgradeEffect('et', 21))}
        return multe
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expe = new Decimal(1)
        return expe
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 44)||player.pw.total.gte(1)||player.cg.total.gte(1)},
    update(diff) {
        
        addPoints("e", player.pw.points.times(multe).times(diff).times(getPointGen()))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                texte = "you have "+format(player.e.total)+" total energy <br>"
                texte += "you gain "+format(player.pw.points.times(multe))+" energy per second <br>"
                proportiontoVolts = player.pw.buyables[11].sub(player.pw.buyables[12]).add(10).max(0).min(20).div(20)
                Evoltage = player.pw.points.times(multe).pow(proportiontoVolts)
                Ecurrent = player.pw.points.times(multe).pow(proportiontoVolts.times(-1).add(1))
                if (hasMilestone('pw', 0)) {texte += "the voltage is "+format(Evoltage)+" and the current is "+format(Ecurrent)}
                return texte
            }
        },
    },
    upgrades: {
        11: {
            title: "energy upgrade 11",
            description: "multiplies prestige point gain by (remaining time +1)",
            cost: new Decimal(2),
            effect() {
                eff = player.totalGameTime().sub(player.points).add(1).max(1)

        
                if (hasUpgrade('c', 11)){eff = eff.pow(upgradeEffect('c', 11))}

                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "energy upgrade 12",
            description: "raise prestige upgrade 11 effect to 2",
            cost: new Decimal(4),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "energy upgrade 13",
            description: "multiply prestige point gain by 10^(power *0.5)",
            cost: new Decimal(10),
            effect() {
                eff = player.pw.points.times(0.5).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "energy upgrade 14",
            description: "multiply prestige point gain by ungained integral points +1",
            cost: new Decimal(20),
            effect() {

                eff = totalGameTime.sub(ikLastReset).times(speedik).pow(ilnum).times(multik).div(factorial(ilnum)).sub(player.ik.total).add(1).max(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "energy upgrade 21",
            description() {
                text = "prestige upgrade 11 copy but all the numbers in the mantissa are 1 more and the exponent is 1 less"
                if (upgradeEffect('p', 11).gte('e201')) {text = text+" (softcapped)"}
                return text
            },
            cost() {
                cost = new Decimal(40)
                return cost
            },
            effect() {
                if (upgradeEffect('p', 11).lte(100)) return Decimal.dOne
                logeff = upgradeEffect('p', 11).log10().trunc()
                eff = upgradeEffect('p', 11).div(logeff.pow10()).add(10/9).times(logeff.sub(1).pow10())
                if (eff.gte('e200')) {eff = eff.div('e200').root(2).times('e200')}
                eff = eff.min('e2500')
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "energy upgrade 22",
            description: "multiplies prestige point gain by (remaining time +1)^2",
            cost() {
                cost = new Decimal(20)
                return cost
            },
            effect() {
                eff = player.totalGameTime().sub(player.points).add(1).max(1).pow(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "energy upgrade 23",
            description: "multiplies prestige point by 10^(-60cos(time*pi))",
            cost() {
                cost = new Decimal(75)
                return cost
            },
            effect() {
                eff = player.points.times(3.14159265358979323846).cos().times(-60).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "energy upgrade 24",
            description: "multiply prestige gain by (energy upgrade 21 effect)*log10(energy upgrade 21 effect) // todo with voltage: row 0 timespeed, charge: prestige upgrade -> power effect",
            cost: new Decimal(100),
            effect() {
                eff = upgradeEffect('e', 21).log10().times(upgradeEffect('e', 21)).min('e2500')
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    },
})

addLayer("c", {
    name: "charge", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#99a8ff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "charge", // Name of prestige currency
    baseResource: "current", // Name of resource prestige is based on
    baseAmount() {return Ecurrent}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses



        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone('pw', 0)},
    update(diff) {
        
        if (hasMilestone('pw', 0)) {addPoints("c", Ecurrent.times(diff).times(getPointGen()))}
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textc = "You gain "+format(Ecurrent)+" charge per second"
                return textc
            }
        },
    },

    upgrades: {
        11: {
            title: "charge upgrade 11",
            description: "multiply energy upgrade 11 effect exponent by charge^0.5*1.5",
            cost: new Decimal(200),
            effect() {
                eff = player.c.points.max(4/9).root(2).times(1.5)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "charge upgrade 12",
            description: "multiply prestige point gain by log(prestige points)^(1000*charge^0.5)",
            cost: new Decimal(600),
            effect() {
                eff = player.p.points.max(1).log10().pow(player.c.points.max(1).root(2).times(1000))
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    },
})

addLayer("f", {
    name: "fire", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        total: new Decimal(1),
    }},
    color: "#ffec42",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "fire", // Name of prestige currency
    baseResource: "fire", // Name of resource prestige is based on
    baseAmount() {return player.f.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multf = new Decimal(0)
        if (hasUpgrade('p', 64)){multf = multf.add(upgradeEffect('p', 64))} 
        if (hasUpgrade('p', 82)){multf = multf.add(upgradeEffect('p', 82))} 
        if (hasUpgrade('i', 23)){multf = multf.add(upgradeEffect('i', 23))} 
        multf = multf.add(buyableEffect('f', 11)).add(buyableEffect('i', 11))


        multf = multf.times(buyableEffect('f', 12)).times(buyableEffect('i', 12))


        if (hasUpgrade('cg', 14)){multf = multf.times(upgradeEffect('cg', 14))}

        if (hasUpgrade('et', 21)){multf = multf.times(upgradeEffect('et', 21))}


        firstFireSoftcapStart = new Decimal(1e10).times(buyableEffect('f', 13)) //** */

        firstFireSoftcapStrength = new Decimal(0.1) 
        firstFirePenalty = player.f.points.div(firstFireSoftcapStart).pow(firstFireSoftcapStrength).max(1)


        totalFirePenalty = firstFirePenalty.times(1) //times(1) replace with later softcaps

        multfAfterPenalty = multf.root(totalFirePenalty)


        return multf
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expf = new Decimal(1)
        return expf
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 64)||player.f.total.gt(1)||player.cg.total.gte(1)},
    update(diff) {
        if (canGenPoints()) {
            if (multf.eq(0)) {return;} else {
                if (totalFirePenalty.eq(1)) {
                    currentFireTime = player.f.points.max(0.0001).ln().div(multf) //unsoftcapped: dx/xdt = mx
                    nextTickFireTime = currentFireTime.add(player.gamespeed().times(diff))
                    addPoints('f', nextTickFireTime.times(multf).exp().sub(player.f.points))
                }
                else {
                    currentFireTime = player.f.points.div(firstFireSoftcapStart).pow(firstFireSoftcapStrength).div(multf).div(firstFireSoftcapStrength) // softcapped: dx/dt = m * s^(-p) * x^(1+p) where m = multiplier, s = start (not logten), p = strength logten per oom, x = fire amount, t = real time
                    nextTickFireTime = currentFireTime.add(player.gamespeed().times(diff))      
                    addPoints('f', multf.times(firstFireSoftcapStrength).times(nextTickFireTime).pow(firstFireSoftcapStrength.pow(-1)).times(firstFireSoftcapStart).sub(player.f.points))
                }
            }
        }
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textf = "you have "+format(player.f.points)+" fire <br>"
                textf += "you gain "+format(player.f.points.times(multfAfterPenalty))+" fire per second, which is "
                if (multfAfterPenalty.gte(10)) {textf += "+"+format(multfAfterPenalty.log(10))+" OoM of your fire <br>"} else {textf += format(multfAfterPenalty)+"x of your fire <br>"}
                if (player.f.points.gte(firstFireSoftcapStart)) {textf += "first fire softcap: after "+format(firstFireSoftcapStart)+" fire, slow down time for this layer by "+format(firstFirePenalty)+"x"}
                textf += "<br> you have "+format(player.f.total)+" total fire <br>"
                
                if (hasUpgrade('i', 74)) {textf += "<br> <br> this mechanic is from Replicanti Incremental from MrRedShark77"}
                return textf
            }
        },
    },
    upgrades: {
        11: {
            title: "fire upgrade 11",
            description: "multiply the effects of prestige upgrade 51 and 52 by 2",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "fire upgrade 12",
            description: "raise the effects of prestige upgrade 11 by 3",
            cost: new Decimal(2),
            effect() {
                eff = new Decimal(3)
                if (hasUpgrade('f', 21)) {eff = eff.times(upgradeEffect('f', 21))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "fire upgrade 13",
            description: "improve integral kinematics buyables 13 to 1.5",
            cost: new Decimal(3),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "fire upgrade 14",
            description: "multiply prestige point gain by log(p points)^10",
            cost: new Decimal(4),
            effect() {
                eff = player.p.points.max(1).log10().pow(10)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "fire upgrade 21",
            description: "multiply fire upgrade 12 by 2",
            cost: new Decimal(3e3),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "fire upgrade 22",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(1e6),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "fire upgrade 23",
            description: "multiply infinity dimensions by log(fire)^2",
            cost: new Decimal(1),
            effect() {
                eff = player.f.points.max(10).log10().pow(2)
                if (hasUpgrade('et', 11)) {eff = eff.pow(upgradeEffect('et', 11))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('i', 74)}
        },
    },
    buyables: {
        11: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasef11 = Decimal.dTen

                logcostf11 = new Decimal(x).pow(1.1)
                if (logcostf11.gte(30)) {logcostf11 = logcostf11.div(30).pow(1.2).times(30)}
                if (logcostf11.gte(308.2547155599167438)) {logcostf11 = logcostf11.div(308.2547155599167438).pow(1.5).times(308.2547155599167438)}
                logcostf11 = logcostf11.sub(buyableEffect('i', 13).log10())


                effectiveFireForBuyables = player.f.points.times(buyableEffect('i', 13)).max(1).log10()
                if (effectiveFireForBuyables.gte(30)) {effectiveFireForBuyables = effectiveFireForBuyables.div(30).root(1.2).times(30)}
                if (effectiveFireForBuyables.gte(308.2547155599167438)) {effectiveFireForBuyables = effectiveFireForBuyables.div(308.2547155599167438).root(1.5).times(308.2547155599167438)} //308.2 = 1024*log2/log10

                ownedf11 = effectiveFireForBuyables.root(1.1).max(0)

                return Decimal.pow(costbasef11, logcostf11)
            },
            effect(x) {
                effbasef11 = new Decimal(0.05)

                divefff11 = new Decimal(x)

                return Decimal.times(effbasef11, divefff11)
            },
            title() { return "fire buyable 11"},
            display() { return "increase fire gain by "+format(effbasef11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasef12 = Decimal.dTen

                logcostf12 = new Decimal(x).times(2).add(1).pow(1.2)
                if (logcostf12.gte(30)) {logcostf12 = logcostf12.div(30).pow(1.2).times(30)}
                if (logcostf12.gte(308.2547155599167438)) {logcostf12 = logcostf12.div(308.2547155599167438).pow(1.5).times(308.2547155599167438)}
                if (logcostf12.gte(100)) {logcostf12 = logcostf12.div(100).pow(1.5).times(100)}
                logcostf12 = logcostf12.sub(buyableEffect('i', 13).log10())

                if (effectiveFireForBuyables.gte(100)) {effectiveFireForBuyable12 = effectiveFireForBuyables.div(100).root(1.5).times(100)} else {effectiveFireForBuyable12 = effectiveFireForBuyables}
                ownedf12 = effectiveFireForBuyable12.root(1.2).sub(1).div(2).max(0)

                return Decimal.pow(costbasef12, logcostf12).div(buyableEffect('i', 13))
            },
            effect(x) {
                effbasef12 = new Decimal(1.05)

                logefff12 = new Decimal(x)

                return Decimal.pow(effbasef12, logefff12)
            },
            title() { return "fire buyable 12"},
            display() { return "multiply fire gain by "+format(effbasef12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasef13 = Decimal.dTen

                logcostf13 = new Decimal(x).add(5).pow(1.4)
                if (logcostf13.gte(30)) {logcostf13 = logcostf13.div(30).pow(1.2).times(30)}
                if (logcostf13.gte(308.2547155599167438)) {logcostf13 = logcostf13.div(308.2547155599167438).pow(1.5).times(308.2547155599167438)}
                logcostf13 = logcostf13.sub(buyableEffect('i', 13).log10())


                ownedf13 = effectiveFireForBuyables.root(1.4).sub(5).max(0)


                return Decimal.pow(costbasef13, logcostf13).div(buyableEffect('i', 13))
            },
            effect(x) {
                effbasef13 = new Decimal(10)

                logefff13 = new Decimal(x)

                return Decimal.pow(effbasef13, logefff13)
            },
            title() { return "fire buyable 13"},
            display() { return "multiply the first fire softcap start by "+format(effbasef13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
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
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multp = new Decimal(1)
        if (hasUpgrade('ik', 11)){multp = multp.times(upgradeEffect('ik', 11))}
        if (hasUpgrade('ik', 12)){multp = multp.times(upgradeEffect('ik', 12))}
        if (hasUpgrade('ik', 13)){multp = multp.times(upgradeEffect('ik', 13))}
        if (hasUpgrade('ik', 14)){multp = multp.times(upgradeEffect('ik', 14))}
        if (hasUpgrade('ik', 21)){multp = multp.times(upgradeEffect('ik', 21))}
        if (hasUpgrade('ik', 22)){multp = multp.times(upgradeEffect('ik', 22))}
        if (hasUpgrade('ik', 23)){multp = multp.times(upgradeEffect('ik', 23))}

        if (hasUpgrade('e', 11)){multp = multp.times(upgradeEffect('e', 11))}
        if (hasUpgrade('e', 12)){multp = multp.times(upgradeEffect('e', 12))}
        if (hasUpgrade('e', 13)){multp = multp.times(upgradeEffect('e', 13))}
        if (hasUpgrade('e', 14)){multp = multp.times(upgradeEffect('e', 14))}
        if (hasUpgrade('e', 21)){multp = multp.times(upgradeEffect('e', 21))}
        if (hasUpgrade('e', 24)){multp = multp.times(upgradeEffect('e', 24))}

        if (hasUpgrade('e', 23)){multp = multp.times(upgradeEffect('e', 23))}

        if (hasUpgrade('c', 12)){multp = multp.times(upgradeEffect('c', 12))}

        if (hasUpgrade('f', 14)){multp = multp.times(upgradeEffect('f', 14))}

        if (hasUpgrade('p', 11)){multp = multp.times(upgradeEffect('p', 11))}
        if (hasUpgrade('p', 12)){multp = multp.times(upgradeEffect('p', 12))}

        if (hasUpgrade('p', 21)){multp = multp.times(upgradeEffect('p', 21))}

        if (hasUpgrade('p', 61)){multp = multp.times(upgradeEffect('p', 61))}
        if (hasUpgrade('p', 62)){multp = multp.times(upgradeEffect('p', 62))}
        if (hasUpgrade('p', 91)){multp = multp.times(upgradeEffect('p', 91))}
        if (hasUpgrade('p', 92)){multp = multp.times(upgradeEffect('p', 92))}
        if (hasUpgrade('p', 93)){multp = multp.times(upgradeEffect('p', 93))}
        if (hasUpgrade('p', 94)){multp = multp.times(upgradeEffect('p', 94))}
        if (hasUpgrade('p', 113)){multp = multp.times(upgradeEffect('p', 113))}
        if (hasUpgrade('p', 132)){multp = multp.times(upgradeEffect('p', 132))}


        multp = multp.times(buyableEffect('p', 11))

        if (hasUpgrade('i', 11)){multp = multp.times(upgradeEffect('i', 11))}
        if (hasUpgrade('i', 12)){multp = multp.times(upgradeEffect('i', 12))}
        if (hasUpgrade('i', 21)){multp = multp.times(upgradeEffect('i', 21))}
        if (hasUpgrade('i', 24)){multp = multp.times(upgradeEffect('i', 24))}
        if (hasUpgrade('i', 31)){multp = multp.times(upgradeEffect('i', 31))}
        if (hasUpgrade('i', 32)){multp = multp.times(upgradeEffect('i', 32))}
        if (hasUpgrade('i', 61)){multp = multp.times(upgradeEffect('i', 61))}
        if (hasUpgrade('i', 62)){multp = multp.times(upgradeEffect('i', 62))}
        if (hasUpgrade('i', 71)){multp = multp.times(upgradeEffect('i', 71))}
        if (hasUpgrade('i', 81)){multp = multp.times(upgradeEffect('i', 81))}    


        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1)
        if (hasUpgrade('ik', 42)){expp = expp.times(upgradeEffect('ik', 42))}




        if (hasUpgrade('f', 22)){expp = expp.times(upgradeEffect('f', 22))}

        if (hasUpgrade('p', 71)){expp = expp.times(upgradeEffect('p', 71))}
        if (hasUpgrade('p', 72)){expp = expp.times(upgradeEffect('p', 72))}

        if (hasUpgrade('p', 101)){expp = expp.times(upgradeEffect('p', 101))}
        if (hasUpgrade('p', 102)){expp = expp.times(upgradeEffect('p', 102))}
        if (hasUpgrade('p', 103)){expp = expp.times(upgradeEffect('p', 103))}
        if (hasUpgrade('p', 112)){expp = expp.times(upgradeEffect('p', 112))}
        if (hasUpgrade('p', 114)){expp = expp.times(upgradeEffect('p', 114))}
        if (hasUpgrade('p', 134)){expp = expp.times(upgradeEffect('p', 134))}

        if (hasUpgrade('i', 14)){expp = expp.times(upgradeEffect('i', 14))}
        if (hasUpgrade('i', 34)){expp = expp.times(upgradeEffect('i', 34))}
        if (hasUpgrade('i', 42)){expp = expp.times(upgradeEffect('i', 42))}
        if (hasUpgrade('i', 43)){expp = expp.times(upgradeEffect('i', 43))}
        if (hasUpgrade('i', 54)){expp = expp.times(upgradeEffect('i', 54))}
        if (hasUpgrade('i', 63)){expp = expp.times(upgradeEffect('i', 63))}
        if (hasUpgrade('i', 72)){expp = expp.times(upgradeEffect('i', 72))}
        if (hasUpgrade('i', 73)){expp = expp.times(upgradeEffect('i', 73))}


        if (hasUpgrade('cg', 11)){expp = expp.times(upgradeEffect('cg', 11))}
        return expp
        
    },
    getResetGain() {
        return player.points.log10().times(multp).pow(expp).floor().sub(player.p.total).max(0)
    },
    getNextAt() {
        nextp = player.p.total.add(getResetGain('p')).add(1)
        return nextp.root(expp).div(multp).pow10()
    },
    canReset() {return getResetGain('p').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" seconds" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer) {
        let keep = [];
        
        keep.push("upgrades")
        keep.push("points")
        keep.push("best")
        keep.push("total")
        keep.push("buyables")
        
        maxkeeprow = 1
        if (hasUpgrade('q', 14)) {maxkeeprow = maxkeeprow + 1}
        if (hasUpgrade('q', 24)) {maxkeeprow = maxkeeprow + 1}

        if (layers[resettingLayer].row <= maxkeeprow) {layerDataReset("p", keep)} else if (layers[resettingLayer].row > this.row) {
            ikLastReset = new Decimal(0)
            layerDataReset("p", [])
        }
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = ""
                
                text += "points will be sometimes referred to by their layer symbol; upgrades will be always referred to by their upgrade layer, row and column <br> log stands for log10, ln stands for loge, any other log base will be explicitly written out <br>"
                text += "you have "+formatWhole(player.p.total)+" total prestige points <br>"
                if (multp.gt(1)){text += "your prestige point gain multiplier is "+format(multp)+"<br>"}
                if (expp.gt(1)){text += "your prestige point gain exponent is "+format(expp)+"<br>"}
                if (hasUpgrade('p', 103)){text += "Cat Ascii Art was made by Blazej Kozlowski "}
                return text
            }
        },
    },
    milestones:{

    },
    buyables: {
        11: {
            cost(x) {
                costbasep11 = Decimal.dTen

                logcostp11 = new Decimal(x).add(1)
                if (hasUpgrade('cg', 21)) {logcostp11 = logcostp11.div(upgradeEffect('cg', 21))}

                if (logcostp11.gte(10)) logcostp11 = logcostp11.div(10).pow(4/3).times(10) //atp, price = x^(4/3)*11^(-1/3)
                if (logcostp11.gte(25.19842099789746)) logcostp11 = logcostp11.div(25.19842099789746).pow(3/2).times(25.19842099789746) // 25.2 = 20^(4/3)*10^(-1/3), atp, price = x^2*20^(-2/3)*10^(-1/3)
                if (logcostp11.gte(56.69644724526929)) logcostp11 = logcostp11.div(56.69644724526929).pow(2).times(56.69644724526929) // 56.69 = 30^2*20^(-2/3)*10^(-1/3), atp, price = x^2*30^(-2)*20^(-2/3)*10^(-1/3)
                

                logcostp11 = logcostp11.div(buyableEffect('cg', 11))



                ownedp11 = player.p.points.max(1).log(costbasep11)

                ownedp11 = ownedp11.times(buyableEffect('cg', 11))

                
                if (ownedp11.gte(56.69644724526929)) ownedp11 = ownedp11.div(56.69644724526929).root(2).times(56.69644724526929)
                if (ownedp11.gte(25.19842099789746)) ownedp11 = ownedp11.div(25.19842099789746).root(3/2).times(25.19842099789746)
                if (ownedp11.gte(10)) ownedp11 = ownedp11.div(10).root(4/3).times(10)

                if (hasUpgrade('cg', 21)) {ownedp11 = ownedp11.times(upgradeEffect('cg', 21))}

                ownedp11 = ownedp11.max(0)

                if (hasUpgrade('q', 21)) {return Decimal.dInf} else {return Decimal.pow(costbasep11, logcostp11).trunc()}
            },
            effect(x) {
                effbasep11 = new Decimal(1.2)
                if (hasUpgrade('p', 22)){effbasep11 = effbasep11.add(upgradeEffect('p', 22))}
                if (hasUpgrade('p', 54)){effbasep11 = effbasep11.add(upgradeEffect('p', 54))}

                if (hasUpgrade('p', 122)){effbasep11 = effbasep11.add(upgradeEffect('p', 122))}



                if (hasUpgrade('cg', 22)) {effbasep11 = effbasep11.times(upgradeEffect('cg', 22))}


                

                logeffp11 = new Decimal(x)

                if (hasUpgrade('q', 21)) {return Decimal.pow(effbasep11, ownedp11)} else {return Decimal.pow(effbasep11, logeffp11)}
            },
            title() { if (hasUpgrade('p', 123)||player.cg.total.gte(1)) {return ""} else {return "prestige buyable 11"}},
            display() { 
                cat = "\xa0\xa0\xa0\xa0\xa0\xa0_\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\\\`*-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\)\xa0\xa0_`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0:\xa0`.\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0:\xa0_\xa0\xa0\xa0\'\xa0\xa0\\\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0;\xa0*`\xa0_.\xa0\xa0\xa0`*-._\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0`-.-\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0`\xa0\xa0\xa0\xa0\xa0\xa0\xa0`.\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:.\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\\\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\\\xa0\xa0.\xa0\xa0\xa0:\xa0\xa0\xa0.-\'\xa0\xa0\xa0.\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\'\xa0\xa0`+.;\xa0\xa0;\xa0\xa0\'\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\'\xa0\xa0|\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0;-.\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\'\xa0\xa0\xa0:\xa0:`-:\xa0\xa0\xa0\xa0\xa0_.`*\xa0;<br>\
                \xa0\xa0\xa0\xa0\xa0.*\'\xa0/\xa0\xa0.*\'\xa0;\xa0.*`-\xa0+\'\xa0\xa0`*\'\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0`*-*\xa0\xa0\xa0`*-*\xa0\xa0`*-*\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\xa0"
                upgradedcat = "\xa0\xa0\xa0\xa0\xa0\xa0_\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\\\`*-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\)\xa0\xa0_`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0:\xa0`.\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0:\xa0_\xa0\xa0\xa0\'\xa0\xa0\\\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0meow~;\xa0*`\xa0_.\xa0\xa0\xa0`*-._\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0`-.-\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0`\xa0\xa0\xa0\xa0\xa0\xa0\xa0`.\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:.\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\\\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\\\xa0\xa0.\xa0\xa0\xa0:\xa0\xa0\xa0.-\'\xa0\xa0\xa0.\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\'\xa0\xa0`+.;\xa0\xa0;\xa0\xa0\'\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\'\xa0\xa0|\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0;-.\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\'\xa0\xa0\xa0:\xa0:`-:\xa0\xa0\xa0\xa0\xa0_.`*\xa0;<br>\
                \xa0\xa0\xa0\xa0\xa0.*\'\xa0/\xa0\xa0.*\'\xa0;\xa0.*`-\xa0+\'\xa0\xa0`*\'\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0`*-*\xa0\xa0\xa0`*-*\xa0\xa0`*-*\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\xa0"
                nocat = "multiplies your prestige point gain by "
                if (hasUpgrade('q', 21)) {text = "x"+format(effbasep11)+" <br> owned: "+format(ownedp11)+" <br> effect: "+format(this.effect())} else {text = "x"+format(effbasep11)+"<br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())}
                if (hasUpgrade('p', 123)&&player.cg.total.gte(2)) {return upgradedcat+text} else if (hasUpgrade('p', 123)||player.cg.total.gte(1)) {return cat+text} else {return nocat+text}},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {
            title: "prestige upgrade 11",
            description() { 
                text = "multiplies prestige point gain by log(total p points+11)^2"
                if (player.p.total.gte(171.21)) text += "<br> (softcapped)" //43 = sol to log10(x+1)^2 = 3
                return text},
            cost: new Decimal(1),
            effect() {
                eff = player.p.total.add(11).log10().pow(2)  

                if (eff.gte(5)) eff = eff.div(5).root(2).times(5)
                if (eff.gte(1000)) eff = eff.div(1000).root(2).times(1000)

                eff = eff.min('e100')

                if (hasUpgrade('ik', 32)){eff = eff.pow(upgradeEffect('ik', 32))}    

                if (hasUpgrade('e', 12)){eff = eff.pow(upgradeEffect('e', 12))}    

                if (hasUpgrade('f', 12)){eff = eff.pow(upgradeEffect('f', 12))}    


                if (hasUpgrade('p', 31)){eff = eff.pow(upgradeEffect('p', 31))}    
                if (hasUpgrade('p', 32)){eff = eff.pow(upgradeEffect('p', 32))}    
                if (hasUpgrade('p', 41)){eff = eff.pow(upgradeEffect('p', 41))}    
                if (hasUpgrade('p', 42)){eff = eff.pow(upgradeEffect('p', 42))}  
                if (hasUpgrade('i', 22)){eff = eff.pow(upgradeEffect('i', 22))}   
                if (hasUpgrade('i', 33)){eff = eff.pow(upgradeEffect('i', 33))}   
                if (hasUpgrade('i', 53)){eff = eff.pow(upgradeEffect('i', 53))}  
                if (hasUpgrade('i', 91)){eff = eff.pow(upgradeEffect('i', 91))}  

                if (hasUpgrade('et', 12)){eff = eff.pow(upgradeEffect('et', 12))}  
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        12: {
            title: "prestige upgrade 12",
            description() { 
                text = "multiplies prestige point gain by log(total p points+12)^2"
                if (player.p.total.gte(7452.2)) text += "<br> (softcapped)" //7e3 = sol to log(x+12)^2 = 15
                return text},
            cost: new Decimal(2),
            effect() {
                eff = player.p.total.add(12).log10().pow(2)
                if (eff.gte(15)) {eff = eff.div(15).root(2).times(15)} 
                eff = eff.min('e100')


                if (hasUpgrade('i', 52)){eff = eff.pow(upgradeEffect('i', 52))}  
                if (hasUpgrade('i', 91)){eff = eff.pow(upgradeEffect('i', 91))}  

                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        13: {
            title: "prestige upgrade 13",
            description: "adds total time by 2",
            cost: new Decimal(4),
            effect() {
                eff = Decimal.dTwo
                if (hasUpgrade('i', 91)){eff = eff.times(upgradeEffect('i', 91))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        14: {
            title: "prestige upgrade 14",
            description: "add +0.1 to the integral point gain multiplier",
            cost: new Decimal(20),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        21: {
            title: "prestige upgrade 21",
            description: "multiplies prestige point gain by (total ik points +1)^0.33",
            cost: new Decimal(400),
            effect() {
                eff = player.ik.total.add(1).root(3)

                if (hasUpgrade('p', 111)){eff = eff.pow(upgradeEffect('p', 111))}
                if (hasUpgrade('i', 92)){eff = eff.pow(upgradeEffect('i', 92))}  
                if (hasUpgrade('i', 51)){eff = eff.pow(upgradeEffect('i', 51))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        22: {
            title: "prestige upgrade 22",
            description: "adds prestige buyable 11 effect base by 0.1",
            cost: new Decimal(4000),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        23: {
            title: "prestige upgrade 23",
            description: "adds total time by 2",
            cost: new Decimal(20000),
            effect() {
                eff = Decimal.dTwo
                if (hasUpgrade('i', 92)){eff = eff.times(upgradeEffect('i', 92))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        24: {
            title: "prestige upgrade 24",
            description: "amount of integral kinematics buyables 11 and 12 and x1.2, and unlock electricity",
            cost: new Decimal('1e5'),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        31: {
            title: "prestige upgrade 31",
            description: "raises prestige upgrade 11 effect by 1.5, after softcaps",
            cost: new Decimal('5e6'),
            effect() {
                eff = new Decimal(1.5)
                if (hasUpgrade('i', 93)){eff = eff.pow(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        32: {
            title: "prestige upgrade 32",
            description: "raises prestige upgrade 11 effect by 1.33, after softcaps",
            cost: new Decimal('5e7'),
            effect() {
                eff = new Decimal(4/3)
                if (hasUpgrade('i', 93)){eff = eff.pow(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        33: {
            title: "prestige upgrade 33",
            description: "adds total time by 4",
            cost: new Decimal('5e8'),
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('i', 93)){eff = eff.times(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        34: {
            title: "prestige upgrade 34",
            description: "add +0.1 to the integral point gain multiplier",
            cost: new Decimal('5e9'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 93)){eff = eff.times(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        41: {
            title: "prestige upgrade 41",
            description: "raises prestige upgrade 11 effect by 1.25, after softcaps",
            cost: new Decimal('5e10'),
            effect() {
                eff = new Decimal(1.25)
                if (hasUpgrade('i', 94)){eff = eff.pow(upgradeEffect('i', 94))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        42: {
            title: "prestige upgrade 42",
            description: "raises prestige upgrade 11 effect by 1.2, after softcaps",
            cost: new Decimal('5e11'),
            effect() {
                eff = new Decimal(1.2)
                if (hasUpgrade('i', 94)){eff = eff.pow(upgradeEffect('i', 94))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        43: {
            title: "prestige upgrade 43",
            description: "adds total time by 4",
            cost: new Decimal('1e13'),
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('i', 94)){eff = eff.times(upgradeEffect('i', 94))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        44: {
            title: "prestige upgrade 44",
            description: "divide integral kinematics buyable 11 and 12 cost by 4 and unlock integral kinematics buyable 13",
            cost: new Decimal('1e15'),
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('i', 94)){eff = eff.times(upgradeEffect('i', 94))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        51: {
            title: "prestige upgrade 51",
            description: "adds integral point timespeed by 0.1",
            cost: new Decimal('e20'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "prestige upgrade 52",
            description: "adds the energy timespeed by 0.1",
            cost: new Decimal('e25'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "prestige upgrade 53",
            description: "adds total time by 6",
            cost: new Decimal('e30'),
            effect() {
                eff = new Decimal(6)
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        54: {
            title: "prestige upgrade 54",
            description: "adds prestige buyable 11 effect by 0.2",
            cost: new Decimal('e40'),
            effect() {
                eff = new Decimal(0.2)
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        61: {
            title: "prestige upgrade 61",
            description: "multiplies prestige point gain by log(total p points +11)^6",
            cost: new Decimal('e50'),
            effect() {
                eff = player.p.total.add(11).log10().pow(6)
                eff = eff.min('e10000')
                if (hasUpgrade('i', 102)){eff = eff.pow(upgradeEffect('i', 102))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        62: {
            title: "prestige upgrade 62",
            description() { 
                text = "multiplies prestige point gain by (p points)^0.16"
                if (player.p.points.gte('1e150')) text += "<br> (softcapped)"
                return text},
            cost: new Decimal('e70'),
            effect() {
                upgp62 = new Decimal(1/6)
                if (hasUpgrade('i', 41)) upgp62 = upgp62.add(upgradeEffect('i', 41))
                eff = player.p.points.max(1e6).pow(upgp62).log10().log10().sub(0.3979400086720375) //1e6 = 10^6, 0.39 = log2.5/log10
                if (eff.gte(1)) {eff = eff.pow(4/5)}
                if (eff.gte(2)) {eff = eff.div(2).pow(3/4).times(2)}
                if (eff.gte(3)) {eff = eff.div(3).pow(2/3).times(3)}
                if (eff.gte(4)) {eff = eff.div(4).pow(1/2).times(4)}
                eff = eff.add(0.3979400086720375).min(5).pow10().pow10() //4.69 = log5/log10+4, cap at e100000
                if (hasUpgrade('i', 102)){eff = eff.pow(upgradeEffect('i', 102))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "prestige upgrade 63",
            description: "adds total time by 6 ",
            cost: new Decimal('e90'),
            effect() {
                eff = new Decimal(6)
                if (hasUpgrade('i', 102)){eff = eff.times(upgradeEffect('i', 102))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        64: {
            title: "prestige upgrade harmonized",
            description: "unlocks fire, and 8 prestige upgrades",
            cost: new Decimal('1e140'),
            effect() {
                eff = new Decimal(0.05)
                if (hasUpgrade('i', 102)){eff = eff.times(upgradeEffect('i', 102))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        71: {
            title: "prestige upgrade 71",
            description: "raise prestige point gain to 1.05",
            cost: new Decimal('1e160'),
            effect() {
                eff = new Decimal(1.05)
                if (hasUpgrade('i', 103)){eff = eff.pow(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        72: {
            title: "prestige upgrade 72",
            description: "raise prestige point gain to 1.05",
            cost: new Decimal('1e180'),
            effect() {
                eff = new Decimal(1.05) 
                if (hasUpgrade('i', 103)){eff = eff.pow(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        73: {
            title: "prestige upgrade 73",
            description: "adds total time by 8",
            cost: new Decimal('1e200'),
            effect() {
                eff = new Decimal(8)
                if (hasUpgrade('i', 103)){eff = eff.times(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        74: {
            title: "prestige upgrade 74",
            description: "adds integral point timespeed by 0.1",
            cost: new Decimal('1e220'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 103)){eff = eff.times(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        81: {
            title: "prestige upgrade 81",
            description: "adds the energy timespeed by 0.1",
            cost: new Decimal('1e240'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 104)){eff = eff.times(upgradeEffect('i', 104))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        82: {
            title: "prestige upgrade 82",            
            description: "adds fire gain by 0.05",
            cost: new Decimal('1e260'),
            effect() {
                eff = new Decimal(0.05)
                if (hasUpgrade('i', 104)){eff = eff.times(upgradeEffect('i', 104))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        83: {
            title: "prestige upgrade 83",
            description: "adds total time by 8",
            cost: new Decimal('1e280'),
            effect() {
                eff = new Decimal(8)
                if (hasUpgrade('i', 104)){eff = eff.times(upgradeEffect('i', 104))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        84: {
            title: "prestige upgrade 84",
            description: "unlocks infinity, and 8 prestige upgrades",
            cost: new Decimal('1e300'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        91: {
            title: "prestige upgrade 91",
            description: "multiply prestige point gain by log(p points)^2",
            cost: new Decimal('e350'),
            effect() {
                eff = player.p.points.max(10).log10().pow(2).min('e500')
                

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        92: {
            title: "prestige upgrade 92",
            description: "multiply prestige point gain by log(p points)^4",
            cost: new Decimal('e400'),
            effect() {
                eff = player.p.points.max(10).log10().pow(4).min('e500')
                

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        93: {
            title: "prestige upgrade 93",
            description: "multiply prestige point gain by log(p points)^6",
            cost: new Decimal('e450'),
            effect() {
                eff = player.p.points.max(10).log10().pow(6).min('e500')
                

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        94: {
            title: "prestige upgrade 94",
            description: "multiply prestige point gain by log(p points)^16",
            cost: new Decimal('e500'),
            effect() {
                eff = player.p.points.max(10).log10().pow(16).min('e500')
                

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        101: {
            title: "prestige upgrade 101",
            description: "raise prestige point gain by 1.05",
            cost: new Decimal('e550'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        102: {
            title: "prestige upgrade 102",
            description: "raise prestige point gain by 1.05",
            cost: new Decimal('e600'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        103: {
            title: "prestige upgrade 103",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal('e700'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        104: {
            title: "prestige upgrade 104",
            description: "unlocks 8 prestige upgrades",
            cost: new Decimal('e800'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        111: {
            title: "prestige upgrade 111",
            description: "raise prestige upgrade 21 and integral kinematics upgrades 11 and 22 to 2",
            cost: new Decimal('e1000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        112: {
            title: "prestige upgrade 112",
            description: "raise prestige point gain by 1.05",
            cost: new Decimal('e1200'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        113: {
            title: "prestige upgrade 113",
            description: "multiply prestige point gain by log(p points)^8",
            cost: new Decimal('e1500'),
            effect() {
                eff = player.p.points.max(10).log10().pow(8)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        114: {
            title: "prestige upgrade 114",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal('e2000'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        121: {
            title: "prestige upgrade 121",
            description: "add integral point timespeed by 0.1",
            cost: new Decimal('e2500'),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        122: {
            title: "prestige upgrade 122",
            description: "add prestige buyable 11 effect base by 0.2",
            cost: new Decimal('e3000'),
            effect() {
                eff = new Decimal(0.2)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        123: {
            title: "prestige upgrade 123",
            description: "change the prestige buyable 11 description",
            cost: new Decimal('e4000'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        124: {
            title: "prestige upgrade 124",
            description: "unlock a new layer and the next 8 prestige upgrades",
            cost: new Decimal('e6000'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        131: {
            title: "prestige upgrade 131",
            description() {
                if (hasUpgrade('p', 131)) {return "here's the cat images buyable! wait, you already have it? sorry... i got nothing for you."} else {return "unlock another prestige buyable"}
            },
            cost: new Decimal('e10000'),
            effect() {
                eff = new Decimal(1-(hasUpgrade('p', 131)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        132: {
            title: "prestige upgrade 132",
            description() { 
                text = "multiply prestige gain by (prestige points)^0.1"
                if (hasUpgrade('p', 132)) text += ", but i can't seem to put my best effort into anything recently..."
                return text},
            cost: new Decimal('e20000'),
            effect() {
                eff = player.p.points.max(10).root(10)
                if (hasUpgrade('p', 132)) {eff = eff.log10().pow(0.1).pow10()}
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        133: {
            title: "prestige upgrade 133",
            description() {
                if (hasUpgrade('p', 133)) {return "20 seconds? how much is a second? where am i?"} else {return "adds 20 seconds to game time"}
            },
            cost: new Decimal('e40000'),
            effect() {
                eff = new Decimal(20-20*(hasUpgrade('p', 133)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        134: {
            title: "prestige upgrade 134",
            description() { 
                text = "tries to raise prestige gain by 1.5"
                if (hasUpgrade('p', 134)) text += ", but fails"
                return text},
            cost: new Decimal('e60000'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 134)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        141: {
            title: "prestige upgrade 141",
            description() { 
                text = "multiply integral layer gain by 1.5"
                if (hasUpgrade('p', 141)) {text = "it seems the layer this upgrade is in is too low to"+text}
                return text},
            cost: new Decimal('ee5'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 141)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        142: {
            title: "prestige upgrade 142",
            description() { 
                text = "multiply power gain by 1.5"
                if (hasUpgrade('p', 142)) {text = "it seems the layer this upgrade is in is too low to"+text}
                return text},
            cost: new Decimal('ee5'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 142)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        143: {
            title: "prestige upgrade 143",
            description() { 
                text = "multiply the version number by 1.5"
                if (hasUpgrade('p', 143)) {text = "sure enough, this upgrade works"}
                return text},
            cost: new Decimal('ee7'),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        144: {
            title: "prestige upgrade 144",
            description() { 
                text = "this upgrade does nothing"
                if (hasUpgrade('p', 144)) {text += ", but at least youll enjoy the quality points"}
                return text},
            cost: new Decimal('ee7'),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
    },
})

addLayer("q", {
    name: "quality", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#8fff17",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "quality points", // Name of prestige currency
    baseResource: "total quality points", // Name of resource prestige is based on
    baseAmount() {
        qualityPoints = new Decimal(0)
        if (hasUpgrade('p', 24)) {qualityPoints = qualityPoints.add(2)}
        if (hasUpgrade('p', 44)) {qualityPoints = qualityPoints.add(4)}
        if (hasUpgrade('p', 64)) {qualityPoints = qualityPoints.add(6)}
        if (hasUpgrade('p', 84)) {qualityPoints = qualityPoints.add(8)}
        if (hasUpgrade('p', 104)) {qualityPoints = qualityPoints.add(10)}
        if (hasUpgrade('p', 124)) {qualityPoints = qualityPoints.add(12)}
        if (hasUpgrade('p', 144)) {qualityPoints = qualityPoints.add(14)}
        if (hasUpgrade('q', 24)) {qualityPoints = qualityPoints.add(2)}
        if (hasUpgrade('i', 24)) {qualityPoints = qualityPoints.add(4)}
        if (hasUpgrade('i', 44)) {qualityPoints = qualityPoints.add(8)}
        if (hasUpgrade('i', 64)) {qualityPoints = qualityPoints.add(12)}
        if (hasUpgrade('i', 84)) {qualityPoints = qualityPoints.add(16)}
        if (hasUpgrade('i', 104)) {qualityPoints = qualityPoints.add(20)}
        if (hasUpgrade('cg', 24)) {qualityPoints = qualityPoints.add(6)}
        //add more here
        return qualityPoints
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multq = new Decimal(1)


        return multq
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expq = new Decimal(1)
        return expq
    },
    getResetGain() {
        
        return qualityPoints.sub(player.q.total)
    },
    getNextAt() {
        nextq = qualityPoints.add(1)
        return nextq
    },
    canReset() {return getResetGain('q').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('q'))+" quality points." },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 24)||player.q.total.gte(1)},
    shouldNotify() {return getResetGain('q').gte(1)},
    doReset(resettingLayer) {
        let keep = [];
        
        keep.push("upgrades")
        keep.push("points")
        keep.push("best")
        keep.push("total")
        keep.push("buyables")
        


        layerDataReset("p", keep)
    },
    glowColor: "#ff0000",
    milestones:{

    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = ""
                
                text += "you gain quality points when you buy the rightmost upgrades on even rows equal to upgrade row number times layer row number (prestige is row 1) <br> upgrades that make other upgrades obsolete reduce their cost when the upgrades that it makes obsolete are bought"

                return text
            }
        },
    },
    buyables: {

    },
    
    upgrades: {
        11: {
            title: "quality upgrade 11",
            description: "integral kinematics buyables 11 and 12 do not reset layer time",
            cost: new Decimal(7),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "quality upgrade 12",
            description: "integral kinematics buyables 13 do not reset previous buyables",
            cost: new Decimal(8),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "quality upgrade 13",
            description: "integral kinematics buyables 13 do not reset layer time",
            cost: new Decimal(9),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "quality upgrade 14///////",
            description: "row 2 resets do not reset prestige",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "quality upgrade 21",
            description: "unlock continuum for prestige buyable 11",
            cost: new Decimal(10),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "quality upgrade 22",
            description: "unlock continuum for integral kinematics buyables 11 to 13",
            cost() {return new Decimal(34-7*hasUpgrade('q', 11)-8*hasUpgrade('q', 12)-9*hasUpgrade('q', 13))},
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "quality upgrade 23",
            description: "unlock continuum for fire buyables 11 to 13 [NOT IMP] (requires fire buyables unlock)",
            cost: new Decimal(45),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "quality upgrade 24",
            description: "with the upgrade above this, row 3 resets do not reset prestige",
            cost: new Decimal(30),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
    }
})

addLayer("il", {
    name: "integral layer", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        total: new Decimal(1),
    }},
    color: "#ffe6cc",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "integral layers", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addil = new Decimal(2)
        multil = new Decimal(1)
        if (hasUpgrade('p', 141)) {multil = multil.times(upgradeEffect('p', 141))}

        return multil
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expil = new Decimal(1)
        return expil
    },
    getResetGain() {
        return player.p.points.max(25.96).log10().log(2).log(2).add(addil).times(multil).pow(expil).floor().sub(player.il.total) //25.96 = 10^(2^(2^(-1)))
    },
    getNextAt() {
        nextil = player.il.total.add(getResetGain('il')).add(1)
        return Decimal.dTwo.pow(Decimal.dTwo.pow(nextil.root(expil).div(multil).sub(addil))).pow10()
    },
    canReset() {return getResetGain('il').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('il'))+" integral layers. Next at "+format(getNextAt('il'))+" prestige points" },
    shouldNotify() {return getResetGain('il').gte(1)},
    glowColor: "#ff0000",
    row: 2, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return true},
    infoboxes: {
    },
    upgrades: {
    },
})

addLayer("pw", {
    name: "power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PW", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#1a53ff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "power", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addpw = new Decimal(1)
        multpw = new Decimal(1)
        if (hasUpgrade('p', 142)) {multil = multil.times(upgradeEffect('p', 142))}

        return multpw
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exppw = new Decimal(1)
        return exppw
    },
    getResetGain() {
        return player.p.points.max(1000000).log10().log(6).log(2).add(addpw).times(multpw).pow(exppw).floor().sub(player.pw.total)
    },
    getNextAt() {
        nextpw = player.pw.total.add(getResetGain('pw')).add(1)
        return new Decimal(6).pow(Decimal.dTwo.pow(nextpw.root(exppw).div(multpw).sub(addpw))).pow10()
    },
    canReset() {return getResetGain('pw').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('pw'))+" power. Next at "+format(getNextAt('pw'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 24)||player.pw.total.gte(1)||player.cg.total.gte(1)},
    shouldNotify() {return getResetGain('pw').gte(1)},
    glowColor: "#ff0000",
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textpw = "you gain "+format(player.pw.total.times(multe))+" energy per second <br>"
                proportiontoVolts = player.pw.buyables[11].sub(player.pw.buyables[12]).add(10).max(0).min(20).div(20)
                Evoltage = player.pw.total.times(multe).pow(proportiontoVolts)
                Ecurrent = player.pw.total.times(multe).pow(proportiontoVolts.times(-1).add(1))
                if (hasMilestone('pw', 0)) {textpw += "the voltage is "+format(Evoltage)+" and the current is "+format(Ecurrent)}
                return textpw
            }
        },
    },
    milestones:{
        0: {
            requirementDescription: "power milestone 0",
            effectDescription: "4 power, unlock a certain energy upgrade",
            done() { return player[this.layer].points.gte(4) }
        }
    },
    buyables: {
        11: {
            unlocked() {return hasMilestone('pw', 0)},
            cost(x) {
            

                return Decimal.dZero
            },
            effect(x) {
                voltageEachClick = player.pw.total.times(multe).root(20)

                return Decimal.dZero
            },
            title() { return "power buyable 11"},
            display() { return "increases the resistance by x"+format(voltageEachClick)+" and performs a row 1 reset" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                doReset('p')
            },
        },
        12: {
            unlocked() {return hasMilestone('pw', 0)},
            cost(x) {
            

                return Decimal.dZero
            },
            effect(x) {
                voltageEachClick = player.pw.total.times(multe).root(20)

                return Decimal.dZero
            },
            title() { return "power buyable 12"},
            display() { return "decreases the resistance by x"+format(voltageEachClick)+" and performs a row 1 reset" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                doReset('p')
            },
        },
    },
    upgrades: {
    },
})

addLayer("i", {
    name: "infinity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ff9800",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "infinity points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multi = new Decimal(1)


        return multi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expi = new Decimal(1)
        return expi
    },
    getResetGain() {
        return player.p.points.max(1).root(441.01279546715448).div(5).times(multi).pow(expi).floor().sub(player.i.total).max(0) //441.0 = 1024*ln2/ln5
    },
    getNextAt() {
        nexti = player.i.total.add(getResetGain('i')).add(1)
        return nexti.root(expi).div(multi).times(5).pow(441.01279546715448)
    },
    canReset() {return getResetGain('i').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('i'))+" infinity points. Next at "+format(getNextAt('i'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 84)||player.i.total.gte(1)||player.cg.total.gte(1)},
    milestones:{


    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = "you have "+formatWhole(player.i.total)+" total infinity points <br>"
                if (multi.gt(1)){text += "your infinity point gain multiplier is "+format(multi)+"<br>"}
                if (expi.gt(1)){text += "your infinity point gain exponent is "+format(expi)+"<br>"}

                logip = player.i.points.max(1).log10().div(10)

                idmult = new Decimal(1)
                if (hasUpgrade('f', 23)) idmult = idmult.times(upgradeEffect('f', 23))
                if (hasUpgrade('et', 13)) idmult = idmult.times(upgradeEffect('et', 13))

                idtime = player.points.times(player.gamespeed()).times(idmult)

                if (logip.lt(1)||(!hasUpgrade('i', 24))) {infd1 = Decimal.dZero} else {infd1 = logip.div(1)}
                if (logip.lt(2)||(!hasUpgrade('i', 44))) {infd2 = Decimal.dZero} else {infd2 = logip.div(2)}
                if (logip.lt(6)||(!hasUpgrade('i', 64))) {infd3 = Decimal.dZero} else {infd3 = logip.div(6)}
                if (logip.lt(24)||(!hasUpgrade('i', 84))) {infd4 = Decimal.dZero} else {infd4 = logip.div(24)}

                infpow = Decimal.dZero
                infpow = infpow.add(idtime.pow(1).div(1).times(infd1))
                infpow = infpow.add(idtime.pow(2).div(2).times(infd2))
                infpow = infpow.add(idtime.pow(3).div(6).times(infd3))
                infpow = infpow.add(idtime.pow(4).div(24).times(infd4))

                infpowcv = new Decimal(224)
                infmult = infpow.max(1).pow(infpowcv)

                if (infpow.gte(1)) {text += "<br> you have "+format(infpow)+" infinity power, raised to ^"+format(infpowcv)+" to multiply your prestige point gain by "+format(infmult)}
                if (infd1.gt(0)) {text += "<br> you have "+format(infd1)+" first infinity dimension"}
                if (infd2.gt(0)) {text += "<br> you have "+format(infd2)+" second infinity dimension"}
                if (infd3.gt(0)) {text += "<br> you have "+format(infd3)+" third infinity dimension"}
                if (infd4.gt(0)) {text += "<br> you have "+format(infd4)+" fourth infinity dimension"}

                return text
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasei11 = Decimal.dTen

                logcosti11 = new Decimal(x).add(4.5).pow(2).add(119.75)
                if (hasUpgrade('et', 14)) {logcosti11 = logcosti11.sub(upgradeEffect('et', 11).log10())}


                ownedi11 = player.i.points.sub(119.75).root(2).sub(4.5).max(0)

                return Decimal.pow(costbasei11, logcosti11)
            },
            effect(x) {
                effbasei11 = new Decimal(0.05)

                diveffi11 = new Decimal(x)

                return Decimal.times(effbasei11, diveffi11)
            },
            title() { return "infinity buyable 11"},
            display() { return "increase fire gain by "+format(effbasei11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasei12 = Decimal.dTen


                logcosti12 = new Decimal(x).add(1.5).pow(2).times(5).add(128.75)
                if (hasUpgrade('et', 14)) {logcosti12 = logcosti12.sub(upgradeEffect('et', 11).log10())}


                ownedi12 = player.i.points.log(costbasei12).sub(128.75).div(5).root(2).sub(1.5).max(0)


                return Decimal.pow(costbasei12, logcosti12).round()
            },
            effect(x) {
                effbasei12 = new Decimal(1.05)

                logeffi12 = new Decimal(x)

                return Decimal.pow(effbasei12, logeffi12)
            },
            title() { return "infinity buyable 12"},
            display() { return "multiply fire gain by "+format(effbasei12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasei13 = Decimal.dTen


                logcosti13 = new Decimal(x).add(0.5).pow(2).times(50).add(187.5)
                if (hasUpgrade('et', 14)) {logcosti13 = logcosti13.sub(upgradeEffect('et', 11).log10())}


                ownedi13 = player.i.points.log(costbasei13).sub(187.5).div(50).root(2).sub(0.5).max(0)


                return Decimal.pow(costbasei13, logcosti13).round()
            },
            effect(x) {
                effbasei13 = new Decimal(10)

                logeffi13 = new Decimal(x)

                return Decimal.pow(effbasei13, logeffi13)
            },
            title() { return "infinity buyable 13"},
            display() { return "divide all fire buyable costs by "+format(effbasei13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {
            title: "infinity upgrade 11",
            description: "multiplies prestige point gain by 10^(2*total time)",
            cost: new Decimal(1),
            effect() {
                eff = player.totalGameTime().times(2).pow10()
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "infinity upgrade 12",
            description() { 
                text = "multiplies prestige point gain by 10^(log(1+total i points)^0.8*100)"
                if (player.i.points.gte(2.997394400216383e7)) text += "(softcapped)" //3e7 = 10^(5^(5/4))-1
                return text},
            cost: new Decimal(2),
            effect() {
                eff = player.i.total.add(1).log10().pow(0.8)
                if (eff.gte(5)) eff = eff.div(5).pow(1/3).times(5) //effective pow: 0.25
                if (eff.gte(20)) eff = eff.div(20).pow(1/5).times(20) //effective pow: 0.05
                if (eff.gte(100)) eff = eff.div(100).pow(1/5).times(100) //effective pow: 0.01
                eff = eff.min(200).times(100).pow10()
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "infinity upgrade 13",
            description: "adds total time by 10",
            cost: new Decimal(4),
            effect() {
                eff = Decimal.dTen
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "infinity upgrade 14",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(20),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "infinity upgrade 21",
            description:"multiply prestige point gain by 10^(log(log(p point))^1.25*50)",
            cost: new Decimal(400),
            effect() {
                eff = player.p.points.max(1e10).log10().log10().pow(1.25).times(50).min(10000).pow10()



                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "infinity upgrade 22",
            description: "raise prestige upgrade 11 by ^1.1",
            cost: new Decimal(4000),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "infinity upgrade 23",
            description: "add fire gain by 0.05",
            cost: new Decimal(20000),
            effect() {
                eff = new Decimal(0.05)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "infinity upgrade 24",
            description: "unlock the 1st infinity dimension and the next 8 infinity upgrades",
            cost: new Decimal(1e5),
            effect() {
                eff = infmult.max(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        31: {
            title: "infinity upgrade 31",
            description: "multiplies prestige point gain by log(total i points)^120",
            cost: new Decimal(5e6),
            effect() {
                eff = player.i.total.max(1).log10().pow(120)
                eff = eff.min('e10000')
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        32: {
            title: "infinity upgrade 32",
            description() {
                text = "multiply prestige point gain by 10^(log(p points)^0.5)"
                if (player.p.points.gte('e2.5e5')) {text += " (softcapped)"} // e2.5e4 = 10^(500^(1/0.5))
                return text
            },
            cost: new Decimal(5e7),
            effect() {
                eff = player.p.points.max(10).log10().pow(0.5)
                if (eff.gte(500)) {eff = eff.div(500).pow(0.5).times(500)}
                if (eff.gte(2500)) {eff = eff.div(2500).pow(0.5).times(2500)}
                eff = eff.min(10000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        33: {
            title: "infinity upgrade 33",
            description: "raises prestige upgrade 11 effect by 1.25",
            cost: new Decimal(5e8),
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        34: {
            title: "infinity upgrade 34",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(5e9),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        41: {
            title: "infinity upgrade 41",
            description: "add 0.03 to the prestige upgrade 62 power",
            cost: new Decimal(5e10),
            effect() {
                eff = new Decimal(1/30)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        42: {
            title: "infinity upgrade 42",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(5e11),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        43: {
            title: "infinity upgrade 43",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(1e13),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        44: {
            title: "infinity upgrade 44",
            description: "unlock the 2nd infinity dimension and next 8 infinity upgrades",
            cost: new Decimal(1e15),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        51: {
            title: "infinity upgrade 51",
            description: "raise prestige upgrade 21 to 10",
            cost: new Decimal(1e20),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "infinity upgrade 52",
            description: "raise prestige upgrade 12 to 10",
            cost: new Decimal(1e25),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "infinity upgrade 53",
            description: "raise prestige upgrade 11 to 1.33",
            cost: new Decimal(1e30),
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        54: {
            title: "infinity upgrade 54",
            description: "raise prestige point gain to 1.1",
            cost: new Decimal(1e35),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        61: {
            title: "infinity upgrade 61",
            description() {
                text = "multiply prestige point gain by 10^(log(i points)^0.5*8)"
                if (player.i.points.gte(1.78e156)) {text += " (softcapped)"} // 1.78e156 = 10^((100/8)^(1/0.5))
                return text
            },
            cost: new Decimal(1e40),
            effect() {
                eff = player.i.points.max(1).log10().pow(0.5).times(8)
                if (eff.gte(100)) {eff = eff.div(100).pow(0.25).times(100)}
                eff = eff.min(500)
                eff = eff.pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        62: {
            title: "infinity upgrade 62",
            description() {
                text = "multiply prestige point gain by 10^(log(p points)^0.5)"
                if (player.p.points.gte('e4e4')) {text += " (softcapped)"} // e4e4 = 10^(200^(1/0.5))
                return text
            },
            cost: new Decimal(1e45),
            effect() {
                eff = player.p.points.max(1).log10().root(2)
                if (eff.gte(200)) {eff = eff.div(200).pow(0.5).times(200)}
                if (eff.gte(1000)) {eff = eff.div(1000).pow(0.5).times(1000)}
                eff = eff.min(5000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "infinity upgrade 63",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(1e50),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        64: {
            title: "infinity upgrade harmonized",
            description: "unlock the 3rd infinity dimension and 8 infinity upgrades",
            cost: new Decimal(1e58),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        71: {
            title: "infinity upgrade 71",
            description: "multiply prestige point gain by 10^(log(log(p points))^4.2)",
            cost: new Decimal(1e70),
            effect() {
                eff = player.p.points.max(1e10).log10().log10().pow(4.2).min(5000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        72: {
            title: "infinity upgrade 72",
            description: "raise prestige point gain by 1.15",
            cost: new Decimal(1e90),
            effect() {
                eff = new Decimal(1.15)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        73: {
            title: "infinity upgrade 73",
            description: "raise prestige point gain to 1.2",
            cost: new Decimal(1e110),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        74: {
            title: "infinity upgrade 74",
            description: "unlock a fire upgrade and some buyables",
            cost: new Decimal(1e140),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        81: {
            title: "infinity upgrade 81",
            description: "multiply prestige point gain by 10^(log(i points)^0.5)",
            cost: new Decimal(1e160),
            effect() {
                eff = player.i.points.max(10).log10().pow(0.5).min(10000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        82: {
            title: "infinity upgrade 82",
            description: "add the energy timespeed by 0.1",
            cost: new Decimal(1e190),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        83: {
            title: "infinity upgrade 83",
            description: "add the integral point timespeed by 0.1",
            cost: new Decimal(1e210),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        84: {
            title: "infinity upgrade 84",
            description: "unlock the 4th infinity dimension",
            cost: new Decimal(1e240),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        91: {
            title: "infinity upgrade 91",
            description: "double the effects of prestige upgrade 11 to 14",
            cost: new Decimal('e500'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        92: {
            title: "infinity upgrade 92",
            description: "double the effects of prestige upgrade 21 to 24",
            cost: new Decimal('e1000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        93: {
            title: "infinity upgrade 93",
            description: "double the effects of prestige upgrade 31 to 34",
            cost: new Decimal('e2000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        94: {
            title: "infinity upgrade 94",
            description: "double the effects of prestige upgrade 41 to 44, and unlock a fire upgrade and some infinity buyables",
            cost: new Decimal('e4000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        101: {
            title: "infinity upgrade 101",
            description: "double the effects of prestige upgrade 51 to 54",
            cost: new Decimal('e10000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        102: {
            title: "infinity upgrade 102",
            description: "double the effects of prestige upgrade 61 to 84",
            cost: new Decimal('e20000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        103: {
            title: "infinity upgrade 103",
            description: "double the effects of prestige upgrade 71 to 74",
            cost: new Decimal('e40000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        104: {
            title: "infinity upgrade 104",
            description: "double the effects of prestige upgrade 81 to 84, unlock the 4th infinity dimension",
            cost: new Decimal('e80000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
    },
})

addLayer("cg", {
    name: "catgif", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CG", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#f197ac",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "cat gifs", // Name of prestige currency
    baseResource: "prestige buyable 11s", // Name of resource prestige is based on
    baseAmount() {
        if (hasUpgrade('q', 21)) {return ownedp11} else {return player.p.buyables[11]}}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multcg = new Decimal(1)


        return multcg
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expcg = new Decimal(1)
        return expcg
    },
    getResetGain() {
        if (hasUpgrade('q', 21)) {basecurrencycg = ownedp11} else {basecurrencycg = player.p.buyables[11]}
        return basecurrencycg.div(100).root(2).times(multcg).pow(expcg).trunc().sub(player.cg.total)
    },
    getNextAt() {
        nextcg = player.cg.total.add(getResetGain('cg')).add(1)
        return nextcg.root(expcg).div(multcg).pow(2).times(100)
    },
    canReset() {return getResetGain('cg').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('cg'))+" cat gifs. Next at "+format(getNextAt('cg'))+" prestige buyable 11s" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 124)||player.cg.total.gte(1)},
    shouldNotify() {return getResetGain('cg').gte(1)},
    glowColor: "#ff0000",
    milestones:{
        0: {
            requirementDescription: "cat gif milestone 0",
            effectDescription: "1 total cat gif, unlock 4 cat gif upgrades",
            done() { return player[this.layer].total.gte(1) }
        },
        1: {
            requirementDescription: "cat gif milestone 1",
            effectDescription: "3 total cat gifs, unlock 4 cat gif upgrades",
            done() { return player[this.layer].total.gte(3) }
        },
    },
    infoboxes: {
    },
    buyables: {
        11: {
            cost(x) {
                costbasecg11 = Decimal.dTwo

                logcostcg11 = new Decimal(x)

                return Decimal.pow(costbasecg11, logcostcg11).trunc() //lb(x.max(1))+1
            },
            effect(x) {
                effbasecg11 = new Decimal(1.5)

                logeffcg11 = new Decimal(x)

                return Decimal.pow(effbasecg11, logeffcg11)
            },
            unlocked() {return hasUpgrade('cg', 24)},
            title() { return "cat gif buyable 11"},
            display() { return "root prestige buyable cost by "+format(effbasecg11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    
    upgrades: {
        11: {
            title: "cat gif upgrade 11",
            description: "raise prestige point gain by (cg points +1)^0.33",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(3)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "cat gif upgrade 12",
            description: "multiply integral point timespeed by (cg points +1)^0.16",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(6)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "cat gif upgrade 13",
            description: "multiply energy timespeed by (cg points +1)^0.16",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(6)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "cat gif upgrade 14",
            description: "multiply fire timespeed by (cg points +1)^0.16",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(6)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "cat gif upgrade 21",
            description: "multiply prestige buyable amount by 2",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "cat gif upgrade 22",
            description: "multiply prestige buyable effect by 2",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "cat gif upgrade 23",
            description: "adds total time by 10",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "cat gif upgrade 24",
            description: "unlock cat gif buyable 11",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
    }
})

addLayer("et", {
    name: "eternity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ET", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#b341e0",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "eternity points", // Name of prestige currency
    baseResource: "infinity points", // Name of resource prestige is based on
    baseAmount() {return player.i.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multet = new Decimal(1)


        return multet
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expet = new Decimal(1)
        return expet
    },
    getResetGain() {
        return player.i.points.max(1).root(646.07206765717242).div(3).times(multet).pow(expet).floor().sub(player.et.total).max(0) //646.1 = 1024*ln2/ln3
    },
    getNextAt() {
        nextet = player.et.total.add(getResetGain('et')).add(1)
        return nextet.root(expet).div(multet).times(3).pow(646.07206765717242)
    },
    canReset() {return getResetGain('et').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('et'))+" eternity points. Next at "+format(getNextAt('et'))+" infinity points" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return player.i.points.gte(Decimal.dTwo.pow(1024))||player.et.total.gte(1)},
    milestones:{

    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = "you have "+formatWhole(player.et.total)+" total eternity points <br>"
                if (multet.gt(1)){text += "your eternity point gain multiplier is "+format(multet)+"<br>"}
                if (expet.gt(1)){text += "your eternity point gain exponent is "+format(expet)+"<br>"}

                loget = player.et.points.max(1).log(3)

                tdmult = new Decimal(1)


                tdtime = player.points.times(player.gamespeed()).times(tdmult)

                if (loget.lt(1)) {timed1 = Decimal.dZero} else {timed1 = loget.div(1)}
                if (loget.lt(2)) {timed2 = Decimal.dZero} else {timed2 = loget.div(2)}
                if (loget.lt(6)) {timed3 = Decimal.dZero} else {timed3 = loget.div(6)}
                if (loget.lt(24)) {timed4 = Decimal.dZero} else {timed4 = loget.div(24)}
                if (loget.lt(120)) {timed5 = Decimal.dZero} else {timed5 = loget.div(120)}
                if (loget.lt(720)) {timed6 = Decimal.dZero} else {timed6 = loget.div(720)}
                if (loget.lt(5040)) {timed7 = Decimal.dZero} else {timed7 = loget.div(5040)}
                if (loget.lt(40320)) {timed8 = Decimal.dZero} else {timed8 = loget.div(40320)}

                timepow = Decimal.dZero
                timepow = timepow.add(tdtime.pow(1).div(1).times(timed1))
                timepow = timepow.add(tdtime.pow(2).div(2).times(timed2))
                timepow = timepow.add(tdtime.pow(3).div(6).times(timed3))
                timepow = timepow.add(tdtime.pow(4).div(24).times(timed4))
                timepow = timepow.add(tdtime.pow(5).div(120).times(timed5))
                timepow = timepow.add(tdtime.pow(6).div(720).times(timed6))
                timepow = timepow.add(tdtime.pow(7).div(5040).times(timed7))
                timepow = timepow.add(tdtime.pow(8).div(40320).times(timed8))
                timepow = timepow.max(1)

                tickspeedboost = new Decimal(1.03)

                tickspeedcost = new Decimal(4/3)
                tickspeedcostLogTen = new Decimal(0.1249387366083000)
                tickspeedScalingStart = new Decimal(60) //number of free tickspeeds reached
                tickspeedScalingStrength = new Decimal(1.06) // multiplier to time shards requirement per tickspeed each tickspeed after scaling starts
                tickspeedScalingStrengthLogTen = new Decimal(0.02530586526477024)

                if (Decimal.log(timepow, tickspeedcost).gt(tickspeedScalingStart)) {
                    tempvar1 = tickspeedcostLogTen.times(2).add(tickspeedScalingStrengthLogTen)
                    tempvar2 = tickspeedScalingStrengthLogTen.times(timepow.log10().sub(tickspeedcostLogTen.times(tickspeedScalingStart))).times(8)
                    tickspeeds = tempvar1.pow(2).add(tempvar2).root(2).sub(tempvar1).div(tickspeedScalingStrengthLogTen).div(2).add(tickspeedScalingStart)
                    marginaltickspeedcost = tickspeedScalingStrength.pow(tickspeeds.sub(tickspeedScalingStart)).times(tickspeedcost)
                } 
                else {
                    tickspeeds = Decimal.log(timepow, tickspeedcost)
                    marginaltickspeedcost = tickspeedcost
                }


                timemult = Decimal.pow(tickspeedboost, tickspeeds)
                if (timepow.gt(1)) {text += "<br> you have "+format(timepow)+" time shards, the next tickspeed upgrade costs "+format(marginaltickspeedcost)+"x more than this one"}
                if (timepow.gt(1)) {text += "<br> you have "+format(tickspeeds)+" tickspeed upgrades, each giving a "+format(tickspeedboost)+"x boost to your row 0 timespeed to multiply it by "+format(timemult)+" in total"}
                if (timepow.gte(tickspeedcost.pow(tickspeedScalingStart))) {text += "<br> after "+format(tickspeedScalingStart)+" tickspeed upgrades, each upgrade is "+format(tickspeedScalingStrength)+"x more expensive than the last"}
                if (timed1.gt(0)) {text += "<br> you have "+format(timed1)+" first time dimension"}
                if (timed2.gt(0)) {text += "<br> you have "+format(timed2)+" second time dimension"}
                if (timed3.gt(0)) {text += "<br> you have "+format(timed3)+" third time dimension"}
                if (timed4.gt(0)) {text += "<br> you have "+format(timed4)+" fourth time dimension"}
                if (timed5.gt(0)) {text += "<br> you have "+format(timed5)+" fifth time dimension"}
                if (timed6.gt(0)) {text += "<br> you have "+format(timed6)+" sixth time dimension"}
                if (timed7.gt(0)) {text += "<br> you have "+format(timed7)+" seventh time dimension"}
                if (timed8.gt(0)) {text += "<br> you have "+format(timed8)+" eighth time dimension"}


                return text
            }
        },
    },
    buyables: {
    },
    
    upgrades: {
        11: {
            title: "eternity upgrade 11",
            description: "raise fire upgrade 23 to 1.5",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "eternity upgrade 12",
            description: "raise prestige upgrade 11 by 2.5",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(2.5)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "eternity upgrade 13",
            description: "multiply infinity dimensions by (eternity points +1)",
            cost: new Decimal(1),
            effect() {
                eff = player.et.points.add(1).max(1)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "eternity upgrade 14",
            description: "divide the first 3 infinity buyable costs by 1e10",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1e10)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "eternity upgrade 21",
            description: "unlock time dimensions at 3 eternity points",
            cost: new Decimal(0),
            effect() {
                eff = timemult
                return eff
            },
            unlocked() {return player.et.total.gte(3)}, //req for 1 of 1st time dimenson
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
    }
})