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
        multik = new Decimal(1)

        if (hasUpgrade('p', 51)){multik = multik.add(upgradeEffect('p', 51))}
        if (hasUpgrade('p', 74)){multik = multik.add(upgradeEffect('p', 74))}
        if (hasUpgrade('p', 101)){multik = multik.add(upgradeEffect('p', 101))}
        if (hasUpgrade('p', 123)){multik = multik.add(upgradeEffect('p', 123))}

        if (hasUpgrade('cg', 12)){multik = multik.times(upgradeEffect('cg', 12))}

        ilnum = toNumber(player.il.points.add(0.1).trunc()) //floating point asf
        return multik
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expik = new Decimal(1)
        return expik
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    update(diff) {
        
        addPoints("ik", player.points.add(getPointGen().times(diff)).pow(ilnum).sub(player.points.pow(ilnum)).div(factorial(ilnum)).times(multik.pow(ilnum)))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textik = "the unit of integration is "+format(multik.pow(-1))+" seconds <br>"
                textik += "you have "+format(player.ik.total)+" total integral points <br>"
                textik += "you gain "+format(player.points.pow(ilnum - 1).div(factorial(ilnum - 1)).times(multik.pow(ilnum)))+" integral points per second <br>"                
                textik += "your time integral is of layer "+format(ilnum)+"<br>"
                return textik
            }
        },
    },

    upgrades: {
        11: {
            title: "integral kinematics upgrade 11",
            description: "unlockes 3 integral kinematics upgrades",
            cost: Decimal.dTen,
            effect() {
                eff = new Decimal(3)
                return eff
            },
            effectDisplay() {return "+"+formatWhole(upgradeEffect(this.layer, this.id))}
        },
        12: {
            title: "integral kinematics upgrade 12",
            description: "multiplies prestige point gain by 1.3",
            cost: Decimal.dTwo,
            effect() {
                if (hasMilestone('i', 0)) {eff = Decimal.dTen} else {eff = new Decimal(1.3)}
                if (hasMilestone('cg', 0)) {eff = new Decimal(1000000)} 
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 11)}
        },
        13: {
            title: "integral kinematics upgrade 13",
            description:"multiplies prestige point gain by (total ik points +1)^0.5",
            cost: new Decimal(4),
            effect() {
                eff = player.ik.total.add(1).pow(0.5)
                if (hasUpgrade('ik', 51)){eff = eff.pow(upgradeEffect('ik', 51))}
                if (hasUpgrade('f', 14)){eff = eff.pow(upgradeEffect('f', 14))}
                if (hasUpgrade('p', 93)){eff = eff.pow(upgradeEffect('p', 93))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 11)}
        },
        14: {
            title: "integral kinematics upgrade 14",
            description: "unlockes 4 integral kinematics upgrades",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 11)}
        },
        21: {
            title: "integral kinematics upgrade 21",
            description: "multiplies prestige point gain by log(total p points +11)",
            cost: new Decimal(50),
            effect() {
                eff = player.p.total.add(11).log10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        22: {
            title: "integral kinematics upgrade 22",
            description: "multiplies prestige point gain by 3.8",
            cost: new Decimal(50),
            effect() {
                if (hasMilestone('i', 0)) {eff = Decimal.dTen} else {eff = new Decimal(50/13)}
                if (hasMilestone('cg', 0)) {eff = new Decimal(1e16)} 
                if (hasMilestone('cg', 1)) {eff = new Decimal(1e36)} 

                if (hasUpgrade('e', 23)){eff = eff.pow(upgradeEffect('e', 23))}
                if (hasUpgrade('p', 121)){eff = eff.pow(upgradeEffect('p', 121))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        23: {
            title: "integral kinematics upgrade 23",
            description: "multiplies prestige point gain by ( ik points +1)",
            cost: new Decimal(50),
            effect() {
                eff = player.ik.points.add(1)
                if (hasUpgrade('f', 14)){eff = eff.pow(upgradeEffect('f', 14))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        24: {
            title: "integral kinematics upgrade 24",
            description: "unlockes 4 integral kinematics upgrades",
            cost: new Decimal(1000),
            effect() {
                eff = Decimal.dOne
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        31: {
            title: "integral kinematics upgrade 31",
            description: "multiples prestige gain by 10^(-10*cos(time*pi))",
            cost: new Decimal(1000),
            effect() {
                
                if (hasUpgrade('ik', 41)) {eff = player.points.times(3.14159265358979323846).cos().times(-100).pow10()} else {eff = player.points.times(3.14159265358979323846).cos().times(-10).pow10()}
                //eff = Decimal.dTen.pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        32: {
            title: "integral kinematics upgrade 32",
            description: "raises prestige upgrade 11 to 1.25, before softcaps",
            cost: new Decimal(2000),
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        33: {
            title: "integral kinematics upgrade 33",
            description: "raises prestige upgrade 11 to 1.2, before softcaps",
            cost: new Decimal(2000),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        34: {
            title: "integral kinematics upgrade 34",
            description: "unlocks 4 integral kinematics upgrades",
            cost: new Decimal(1e5),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        41: {
            title: "integral kinematics upgrade 41",
            description: "raise integral kinematics upgrade 31 to 10",
            cost: new Decimal(2e5),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 34)}
        },
        42: {
            title: "integral kinematics upgrade 42",
            description: "raise prestige point gain to 1.2",
            cost: new Decimal(4e5),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 34)}
        },
        43: {
            title: "integral kinematics upgrade 43",
            description: "raise prestige point gain to 1.33",
            cost: new Decimal(2e6),
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 34)}
        },
        44: {
            title: "integral kinematics upgrade 44",
            description: "unlock 4 integral kinematics upgrades",
            cost: new Decimal(1e9),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 34)}
        },
        51: {
            title: "integral kinematics upgrade 51",
            description: "raise integral kinematics upgrade 13 effect to 10",
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

        if (hasUpgrade('cg', 13)){multe = multe.times(upgradeEffect('cg', 13))}
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
                texte += "you gain "+format(player.pw.total.times(multe))+" energy per second <br>"
                proportiontoVolts = player.pw.buyables[11].sub(player.pw.buyables[12]).add(10).max(0).min(20).div(20)
                Evoltage = player.pw.total.times(multe).pow(proportiontoVolts)
                Ecurrent = player.pw.total.times(multe).pow(proportiontoVolts.times(-1).add(1))
                if (hasMilestone('pw', 0)) {texte += "the voltage is "+format(Evoltage)+" and the current is "+format(Ecurrent)}
                return texte
            }
        },
    },
    upgrades: {
        11: {
            title: "energy upgrade 11",
            description: "multiplies prestige point gain by 10^(energy/10)",
            cost: new Decimal(2),
            effect() {
                eff = player.e.points.div(10)
                if (hasUpgrade('e', 22)) {eff = eff.times(upgradeEffect('e', 22))}
                if (hasUpgrade('f', 14)){eff = eff.times(upgradeEffect('f', 14))}
                if (hasUpgrade('c', 11)){eff = eff.times(upgradeEffect('c', 11))}
                eff = eff.pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "energy upgrade 12",
            description: "removes the first softcap of prestige upgrade 11 and inverts that of prestige upgrade 22",
            cost: new Decimal(4),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "energy upgrade 13",
            description: "raises prestige upgrade 12 effect by 1.05",
            cost: new Decimal(6),
            effect() {
                if (hasMilestone('i', 0)) {eff = new Decimal(1.5)} else {eff = new Decimal(1.05)}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "energy upgrade 14",
            description: "raises the prestige upgrade 21 by 10",
            cost: new Decimal(8),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "energy upgrade 21",
            description: "prestige upgrade 11 copy but all the numbers in the mantissa are 1 more and the exponent is 1 less. increases price of energy upgrade 22 and 23",
            cost() {
                cost = new Decimal(24).times((1+hasUpgrade('e', 22)+hasUpgrade('e', 23))**0.84).trunc()
                return cost
            },
            effect() {
                if (upgradeEffect('p', 11).lte(100)) return Decimal.dOne
                logeff = upgradeEffect('p', 11).log10().trunc().sub(2)
                eff = upgradeEffect('p', 11).div(logeff.pow10()).trunc().add(111).min(999).times(logeff.sub(1).pow10())
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "energy upgrade 22",
            description: "raise energy upgrade 11 effect by 10. increases price of energy upgrade 21 and 23",
            cost() {
                cost = new Decimal(24).times((1+hasUpgrade('e', 21)+hasUpgrade('e', 23))**0.84).trunc()
                return cost
            },
            effect() {
                eff = new Decimal(10)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "energy upgrade 23",
            description: "raise integral kinematics upgrade 22 effect by 2. increases price of energy upgrade 21 and 23",
            cost() {
                cost = new Decimal(24).times((1+hasUpgrade('e', 21)+hasUpgrade('e', 22))**0.84).trunc()
                return cost
            },
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "energy upgrade 24",
            description: "raise prestige gain to voltage^0.25",
            cost: new Decimal(8),
            effect() {
                eff = Evoltage.root(4)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasMilestone('pw', 0)}
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
        multf = new Decimal(1)
        if (hasUpgrade('p', 64)){multf = multf.add(upgradeEffect('p', 64))} 
        if (hasUpgrade('p', 82)){multf = multf.add(upgradeEffect('p', 82))} 
        if (hasUpgrade('i', 23)){multf = multf.add(upgradeEffect('i', 23))} 
        multf = multf.add(buyableEffect('f', 11)).add(buyableEffect('i', 11))


        multf = multf.times(buyableEffect('f', 12)).times(buyableEffect('i', 12))


        if (hasUpgrade('cg', 14)){multf = multf.pow(upgradeEffect('cg', 14))}


        firstFireSoftcapStartLogTen = new Decimal(10)
        firstFireSoftcapStartLogTen = firstFireSoftcapStartLogTen.add(buyableEffect('f', 13)).add(buyableEffect('i', 13))
        firstFireSoftcapStrengthLogTen = new Decimal(0.2) 
        firstFirePenaltyLogTen = player.f.points.max(1).log10().div(firstFireSoftcapStartLogTen).sub(1).max(0).times(firstFireSoftcapStrengthLogTen)

        totalFirePenaltyLogTen = firstFirePenaltyLogTen.times(1) //times(1) replace with later softcaps
        totalFirePenalty = totalFirePenaltyLogTen.pow10()
        multf = multf.root(totalFirePenalty)

        multf = multf.max(1)
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
        
        addPoints("f", player.f.points.times(multf.pow(getPointGen().times(diff)).sub(1)))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textf = "you have "+format(player.f.points)+" fire <br>"
                textf += "you gain "+format(player.f.points.times(multf.sub(1)))+" fire per second, which is "
                if (multf.gte(10)) {textf += "+"+format(multf.log(10))+" OoM of your fire <br>"} else {textf += format(multf.sub(1))+"x of your fire <br>"}
                if (player.f.points.gte(firstFireSoftcapStartLogTen.pow10())) {textf += "first fire softcap: after "+format(firstFireSoftcapStartLogTen.pow10())+" fire, slow down time for this layer by "+format(firstFirePenaltyLogTen.pow10())+"x"}
                textf += "<br> you have "+format(player.f.total)+" total fire <br>"
                return textf
            }
        },
    },
    upgrades: {
        11: {
            title: "fire upgrade 11",
            description: "multiply the effects of prestige upgrade 51, 52, 54 by 2",
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
            description: "multiply the effects of prestige upgrade 41 and 42 by 1.2",
            cost: new Decimal(2),
            effect() {
                eff = new Decimal(1.2)
                if (hasUpgrade('f', 13)){eff = eff.times(upgradeEffect('f', 13))} 
                if (hasUpgrade('f', 21)) {eff = eff.times(upgradeEffect('f', 21))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "fire upgrade 13",
            description: "multiply the effects of fire upgrade 12 by 1.25",
            cost: new Decimal(3),
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "fire upgrade 14",
            description: "raise integral kinematics upgrades 13, 23, energy upgrade 11 by 3",
            cost: new Decimal(4),
            effect() {
                eff = new Decimal(3)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "fire upgrade 21",
            description: "multiply fire upgrade 12 by 4",
            cost: new Decimal(3e3),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "fire upgrade 22",
            description: "raise prestige gain by 1.25",
            cost: new Decimal(1e6),
            effect() {
                eff = new Decimal(1.25)
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
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('i', 84)}
        },
    },
    buyables: {
        11: {
            unlocked() {return hasUpgrade('i', 84)},
            cost(x) {
                costbasef11 = Decimal.dTen

                logcostf11 = new Decimal(x).pow(1.1)


                ownedf11 = player.f.points.log10()

                ownedf11 = ownedf11.root(1.1)

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
            unlocked() {return hasUpgrade('i', 84)},
            cost(x) {
                costbasef12 = Decimal.dTen

                logcostf12 = new Decimal(x).add(1).pow(1.4)


                ownedf12 = player.f.points.log10()
                ownedf12 = ownedf12.root(1.4).sub(1)

                return Decimal.pow(costbasef12, logcostf12)
            },
            effect(x) {
                effbasef12 = new Decimal(1.01)

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
            unlocked() {return hasUpgrade('i', 84)},
            cost(x) {
                costbasef13 = Decimal.dTen

                logcostf13 = new Decimal(x).add(1).times(6.81292069057961285).pow(1.2) //6.812 = 10^(5/6)


                ownedf13 = player.f.points.log10()
                ownedf13 = ownedf13.root(1.2).div(6.81292069057961285).sub(1)//6.812 = 10^(5/6)

                return Decimal.pow(costbasef13, logcostf13)
            },
            effect(x) {
                effbasef13 = new Decimal(10)

                divefff13 = new Decimal(x)

                return Decimal.times(effbasef13, divefff13)
            },
            title() { return "fire buyable 13"},
            display() { return "increase the first fire softcap exponent by "+format(effbasef13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
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
        if (hasUpgrade('ik', 12)){multp = multp.times(upgradeEffect('ik', 12))}
        if (hasUpgrade('ik', 13)){multp = multp.times(upgradeEffect('ik', 13))}
        if (hasUpgrade('ik', 21)){multp = multp.times(upgradeEffect('ik', 21))}
        if (hasUpgrade('ik', 22)){multp = multp.times(upgradeEffect('ik', 22))}
        if (hasUpgrade('ik', 23)){multp = multp.times(upgradeEffect('ik', 23))}
        if (hasUpgrade('ik', 31)){multp = multp.times(upgradeEffect('ik', 31))}

        if (hasUpgrade('e', 11)){multp = multp.times(upgradeEffect('e', 11))}
        if (hasUpgrade('e', 21)){multp = multp.times(upgradeEffect('e', 21))}

        if (hasUpgrade('c', 12)){multp = multp.times(upgradeEffect('c', 12))}

        if (hasUpgrade('p', 11)){multp = multp.times(upgradeEffect('p', 11))}
        if (hasUpgrade('p', 12)){multp = multp.times(upgradeEffect('p', 12))}
        if (hasUpgrade('p', 14)){multp = multp.times(upgradeEffect('p', 14))}
        if (hasUpgrade('p', 21)){multp = multp.times(upgradeEffect('p', 21))}
        if (hasUpgrade('p', 22)){multp = multp.times(upgradeEffect('p', 22))}
        if (hasUpgrade('p', 61)){multp = multp.times(upgradeEffect('p', 61))}
        if (hasUpgrade('p', 62)){multp = multp.times(upgradeEffect('p', 62))}
        if (hasUpgrade('p', 91)){multp = multp.times(upgradeEffect('p', 91))}
        if (hasUpgrade('p', 112)){multp = multp.times(upgradeEffect('p', 112))}        

        if (hasMilestone('p', 0)){multp = multp.times(1000)}
        multp = multp.times(buyableEffect('p', 11))

        if (hasUpgrade('i', 11)){multp = multp.times(upgradeEffect('i', 11))}
        if (hasUpgrade('i', 12)){multp = multp.times(upgradeEffect('i', 12))}
        if (hasUpgrade('i', 21)){multp = multp.times(upgradeEffect('i', 21))}
        if (hasUpgrade('i', 24)){multp = multp.times(upgradeEffect('i', 24))}
        if (hasUpgrade('i', 31)){multp = multp.times(upgradeEffect('i', 31))}
        if (hasUpgrade('i', 32)){multp = multp.times(upgradeEffect('i', 32))}
        if (hasUpgrade('i', 61)){multp = multp.times(upgradeEffect('i', 61))}
        if (hasUpgrade('i', 62)){multp = multp.times(upgradeEffect('i', 62))}

    


        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1)
        if (hasUpgrade('ik', 42)){expp = expp.times(upgradeEffect('ik', 42))}
        if (hasUpgrade('ik', 43)){expp = expp.times(upgradeEffect('ik', 43))}
        if (hasUpgrade('ik', 52)){expp = expp.times(upgradeEffect('ik', 52))}
        if (hasUpgrade('ik', 53)){expp = expp.times(upgradeEffect('ik', 53))}

        if (hasUpgrade('e', 24)){expp = expp.times(upgradeEffect('e', 24))}

        if (hasUpgrade('f', 22)){expp = expp.times(upgradeEffect('f', 22))}

        if (hasUpgrade('p', 71)){expp = expp.times(upgradeEffect('p', 71))}
        if (hasUpgrade('p', 72)){expp = expp.times(upgradeEffect('p', 72))}
        if (hasUpgrade('p', 92)){expp = expp.times(upgradeEffect('p', 92))}
        if (hasUpgrade('p', 102)){expp = expp.times(upgradeEffect('p', 102))}

        if (hasUpgrade('p', 114)){expp = expp.times(upgradeEffect('p', 114))}

        if (hasUpgrade('i', 14)){expp = expp.times(upgradeEffect('i', 14))}
        if (hasUpgrade('i', 34)){expp = expp.times(upgradeEffect('i', 34))}
        if (hasUpgrade('i', 42)){expp = expp.times(upgradeEffect('i', 42))}
        if (hasUpgrade('i', 43)){expp = expp.times(upgradeEffect('i', 43))}
        if (hasUpgrade('i', 54)){expp = expp.times(upgradeEffect('i', 54))}
        if (hasUpgrade('i', 63)){expp = expp.times(upgradeEffect('i', 63))}
        if (hasUpgrade('i', 64)){expp = expp.times(upgradeEffect('i', 64))}


        if (hasUpgrade('cg', 11)){expp = expp.times(upgradeEffect('cg', 11))}
        return expp
        
    },
    getResetGain() {
        return player.points.max(1).log10().times(multp).pow(expp).floor().sub(player.p.total).max(0)
    },
    getNextAt() {
        nextp = player.p.total.add(getResetGain('p')).add(1)
        return nextp.root(expp).div(multp).pow10()
    },
    canReset() {return getResetGain('p').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer) {
        let keep = [];
        if (hasMilestone("i", 1)) {
            keep.push("upgrades")
            keep.push("points")
            keep.push("best")
            keep.push("total")
            keep.push("buyables")
        } 
 

        if (resettingLayer=='i') {layerDataReset("p", keep)} else if (layers[resettingLayer].row > this.row) {layerDataReset("p", [])}
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = ""
                if (hasUpgrade('i', 64)&&(!hasUpgrade('i', 71))) text += "== IT IS HIGHLY RECOMMENDED TO EXPORT A SAVE OF YOUR CURRENT PROGRESS (e277,425~e585,675 prestige points, 900~1,900 total infinity points) FOR LATER IMPORTING. == <br> <br>"
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

                if (hasMilestone('cg', 0)) logcostp11 = logcostp11.div(2)

                if (logcostp11.gte(11)) logcostp11 = logcostp11.div(11).pow(4/3).times(11) //atp, price = x^(4/3)*11^(-1/3)
                if (logcostp11.gte(26.05122588537749)) logcostp11 = logcostp11.div(26.05122588537749).pow(3/2).times(26.05122588537749) // 26.051 = 21^(4/3)*11(-1/3), atp, price = x^2*21^(-2/3)*11^(-1/3)
                if (logcostp11.gte(56.769224661786325)) logcostp11 = logcostp11.div(56.769224661786325).pow(2).times(56.769224661786325) // 56.769 = 31^2*21^(-2/3)*11^(-1/3), atp, price = x^2*31^(-2)*21^(-2/3)*11^(-1/3)
                if (logcostp11.gte(173.70071828308614)) logcostp11 = logcostp11.div(173.70071828308614).pow(2).times(173.70071828308614) // 173.7 = 41^4*31^2*21^(-2/3)*11^(-1/3), atp, price = x^8*41^(-8)*31^(-2)*21^(-2/3)*11^(-1/3)

                logcostp11 = logcostp11.div(buyableEffect('cg', 11))



                ownedp11 = player.p.points.log(costbasep11)

                ownedp11 = ownedp11.times(buyableEffect('cg', 11))

                if (ownedp11.gte(173.70071828308614)) ownedp11 = ownedp11.div(173.70071828308614).root(2).times(173.70071828308614)
                if (ownedp11.gte(56.769224661786325)) ownedp11 = ownedp11.div(56.769224661786325).root(2).times(56.769224661786325)
                if (ownedp11.gte(26.05122588537749)) ownedp11 = ownedp11.div(26.05122588537749).root(3/2).times(26.05122588537749)
                if (ownedp11.gte(11)) ownedp11 = ownedp11.div(11).root(4/3).times(11)

                if (hasMilestone('cg', 0)) ownedp11 = ownedp11.times(2)

                return Decimal.pow(costbasep11, logcostp11).trunc()
            },
            effect(x) {
                effbasep11 = new Decimal(1.2)
                if (hasUpgrade('p', 34)){effbasep11 = effbasep11.add(upgradeEffect('p', 34))}
                if (hasUpgrade('p', 54)){effbasep11 = effbasep11.add(upgradeEffect('p', 54))}
                if (hasUpgrade('p', 94)){effbasep11 = effbasep11.add(upgradeEffect('p', 94))}



                if (hasMilestone('i', 0)){effbasep11 = effbasep11.add(0.2)}


                if (hasMilestone('cg', 0)){effbasep11 = effbasep11.add(0.5)}
                if (hasMilestone('cg', 1)){effbasep11 = effbasep11.add(0.5)}

                logeffp11 = new Decimal(x)

                if (hasMilestone('cg', 2)) {return Decimal.pow(effbasep11, ownedp11)} else {return Decimal.pow(effbasep11, logeffp11)}
            },
            title() { if (hasUpgrade('p', 103)||player.cg.total.gte(1)) {return ""} else {return "prestige buyable 11"}},
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
                if (hasMilestone('cg', 2)) {text = "x"+format(effbasep11)+" <br> owned: "+format(ownedp11)+" <br> effect: "+format(this.effect())} else {text = "x"+format(effbasep11)+"<br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())}
                if (hasUpgrade('p', 103)&&player.cg.total.gte(2)) {return upgradedcat+text} else if (hasUpgrade('p', 103)||player.cg.total.gte(1)) {return cat+text} else {return nocat+text}},
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
                text = "multiplies prestige point gain by log(total p points+20)^4"
                if (player.p.total.gte(199)) text += "<br> (softcapped)"
                return text},
            cost: Decimal.dOne,
            effect() {
                eff = player.p.total.add(20).log10().pow(4)
                if (eff.gte(384160000)) eff = eff.div(384160000).root(2).times(384160000)
                
                if (hasUpgrade('ik', 32)){eff = eff.pow(upgradeEffect('ik', 32))}    
                if (hasUpgrade('ik', 33)){eff = eff.pow(upgradeEffect('ik', 33))}    

                if (eff.gte(30)&&!(hasUpgrade('e', 12))) eff = eff.div(30).root(10).times(30)
                if (eff.gte(1e30)) eff = eff.div(1e30).root(2).times(1e30)

                eff = eff.min('e100')
                if (hasUpgrade('p', 31)){eff = eff.pow(upgradeEffect('p', 31))}    
                if (hasUpgrade('p', 32)){eff = eff.pow(upgradeEffect('p', 32))}    
                if (hasUpgrade('p', 41)){eff = eff.pow(upgradeEffect('p', 41))}    
                if (hasUpgrade('i', 22)){eff = eff.pow(upgradeEffect('i', 22))}   
                if (hasUpgrade('i', 33)){eff = eff.pow(upgradeEffect('i', 33))}   
                if (hasUpgrade('i', 53)){eff = eff.pow(upgradeEffect('i', 53))}  
                if (hasUpgrade('i', 71)){eff = eff.pow(upgradeEffect('i', 71))}  
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        12: {
            title: "prestige upgrade 12",
            description() { 
                text = "multiplies prestige point gain by log(total p points+12)^3"
                if (player.p.total.gte(130)) text += "<br> (softcapped)"
                return text},
            cost: Decimal.dTwo,
            effect() {
                eff = player.p.total.add(12).log10().pow(3)
                if (eff.gte(10)) {if (hasUpgrade('e', 12)) {eff = eff.div(10).root(0.75).times(10)} else {eff = eff.div(10).pow(0.75).times(10)}}
                eff = eff.min('e100')
                if (hasUpgrade('e', 13)){eff = eff.pow(upgradeEffect('e', 13))}  

                if (hasUpgrade('p', 42)){eff = eff.pow(upgradeEffect('p', 42))}  
                if (hasUpgrade('i', 71)){eff = eff.pow(upgradeEffect('i', 71))}  

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
                if (hasUpgrade('i', 71)){eff = eff.times(upgradeEffect('i', 71))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        14: {
            title: "prestige upgrade 14",
            description() { 
                text = "multiplies prestige point gain by (total p points +1)^0.1"
                if (player.p.total.gte(22025)) text += "<br> (softcapped)"
                return text},
            cost: new Decimal(20),
            effect() {
                eff = player.p.total.add(1).pow(0.1)
                if (eff.gte(2.718281828459045)) eff = eff.ln().pow(0.8).exp()
                if (eff.gte('e100')) eff = eff.log10().div(100).pow(0.625).times(100).pow10()
                eff = eff.min('e1000')
                if (hasUpgrade('i', 71)){eff = eff.pow(upgradeEffect('i', 71))}  
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        21: {
            title: "prestige upgrade 21",
            description: "multiplies prestige point gain by (total ik points +1)^0.1",
            cost: new Decimal(400),
            effect() {
                eff = player.ik.total.add(1).pow(0.1)
                if (hasUpgrade('e', 14)){eff = eff.pow(upgradeEffect('e', 14))}
                if (hasUpgrade('i', 72)){eff = eff.pow(upgradeEffect('i', 72))}  
                if (hasUpgrade('i', 51)){eff = eff.pow(upgradeEffect('i', 51))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        22: {
            title: "prestige upgrade 22",
            description: "multiplies prestige point gain by log(total p points+11)^0.75",
            cost: new Decimal(3000),
            effect() {
                eff = player.p.total.add(11).log10().pow(0.75)
                eff = eff.min('e1000')
                if (hasUpgrade('i', 52)){eff = eff.pow(upgradeEffect('i', 52))}  
                if (hasUpgrade('i', 72)){eff = eff.pow(upgradeEffect('i', 72))}  
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        23: {
            title: "prestige upgrade 23",
            description: "adds total time by 2",
            cost: new Decimal(20000),
            effect() {
                eff = Decimal.dTwo
                if (hasUpgrade('i', 72)){eff = eff.times(upgradeEffect('i', 72))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        24: {
            title: "prestige upgrade 24",
            description: "unlockes integral layers for integral kinematics, and 8 prestige upgrades",
            cost: new Decimal('8e4'),
            effect() {
                eff = new Decimal(1)
                if (hasUpgrade('i', 72)){eff = eff.times(upgradeEffect('i', 72))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        31: {
            title: "prestige upgrade 31",
            description: "raises prestige upgrade 11 effect by 1.5, after softcaps",
            cost: new Decimal('5e6'),
            effect() {
                eff = new Decimal(1.5)
                if (hasUpgrade('i', 73)){eff = eff.pow(upgradeEffect('i', 73))}  
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
                if (hasUpgrade('i', 73)){eff = eff.pow(upgradeEffect('i', 73))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        33: {
            title: "prestige upgrade 33",
            description: "adds total time by 4",
            cost: new Decimal('3e8'),
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('i', 73)){eff = eff.times(upgradeEffect('i', 73))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        34: {
            title: "prestige upgrade 34",
            description: "adds prestige buyable 11 effect base by 0.1",
            cost: new Decimal('8e8'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 73)){eff = eff.times(upgradeEffect('i', 73))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        41: {
            title: "prestige upgrade 41",
            description: "raises prestige upgrade 11 effect by 1.25, after softcaps",
            cost: new Decimal('2e9'),
            effect() {
                eff = new Decimal(1.25)
                if (hasUpgrade('f', 12)) {eff = eff.times(upgradeEffect('f', 12))}
                if (hasUpgrade('i', 74)){eff = eff.pow(upgradeEffect('i', 74))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        42: {
            title: "prestige upgrade 42",
            description: "raises prestige upgrade 12 effect by 1.25, after softcaps",
            cost: new Decimal('5e10'),
            effect() {
                eff = new Decimal(1.25)
                if (hasUpgrade('f', 12)) {eff = eff.times(upgradeEffect('f', 12))}
                if (hasUpgrade('i', 74)){eff = eff.pow(upgradeEffect('i', 74))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        43: {
            title: "prestige upgrade 43",
            description: "adds total time by 4",
            cost: new Decimal('5e12'),
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('i', 74)){eff = eff.times(upgradeEffect('i', 74))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        44: {
            title: "prestige upgrade 44",
            description: "unlocks electricity, and 8 prestige upgrades",
            cost: new Decimal('1e15'),
            effect() {
                eff = new Decimal(1)
                if (hasUpgrade('i', 74)){eff = eff.times(upgradeEffect('i', 74))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        51: {
            title: "prestige upgrade 51",
            description: "adds base integral points gain by 0.1",
            cost: new Decimal('1e20'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                if (hasUpgrade('i', 81)){eff = eff.times(upgradeEffect('i', 81))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "prestige upgrade 52",
            description: "adds the energy timespeed by 0.1",
            cost: new Decimal('1e30'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                if (hasUpgrade('i', 81)){eff = eff.times(upgradeEffect('i', 81))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "prestige upgrade 53",
            description: "adds total time by 6",
            cost: new Decimal('1e40'),
            effect() {
                eff = new Decimal(6)
                if (hasUpgrade('i', 81)){eff = eff.times(upgradeEffect('i', 81))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        54: {
            title: "prestige upgrade 54",
            description: "adds prestige buyable 11 effect by 0.2",
            cost: new Decimal('1e50'),
            effect() {
                eff = new Decimal(0.2)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                if (hasUpgrade('i', 81)){eff = eff.times(upgradeEffect('i', 81))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        61: {
            title: "prestige upgrade 61",
            description: "multiplies prestige point gain by log(total p points +11)^6",
            cost: new Decimal('1e60'),
            effect() {
                eff = player.p.total.add(11).log10().pow(6)
                eff = eff.min('e10000')
                if (hasUpgrade('i', 82)){eff = eff.pow(upgradeEffect('i', 82))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        62: {
            title: "prestige upgrade 62",
            description() { 
                text = "multiplies prestige point gain by (p points +1)^0.13"
                if (player.p.points.gte('1e75')) text += "<br> (softcapped)"
                return text},
            cost: new Decimal('1e80'),
            effect() {
                upgp62 = new Decimal(1/7.5)
                if (hasUpgrade('i', 41)) upgp62 = upgp62.add(upgradeEffect('i', 41))
                eff = player.p.points.add(1).pow(upgp62)
                if (eff.gte('1e10')) {eff = eff.log10().log10().pow(11/12).pow10().pow10()}
                if (eff.gte('1e1000')) {eff = eff.log10().log10().div(3).pow(10/11).times(3).pow10().pow10()}
                eff = eff.min('e100000')
                if (hasUpgrade('i', 82)){eff = eff.pow(upgradeEffect('i', 82))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "prestige upgrade 63",
            description: "adds total time by 6 ",
            cost: new Decimal('1e100'),
            effect() {
                eff = new Decimal(6)
                if (hasUpgrade('i', 82)){eff = eff.times(upgradeEffect('i', 82))} 
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
                if (hasUpgrade('i', 82)){eff = eff.times(upgradeEffect('i', 82))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        71: {
            title: "prestige upgrade 71",
            description: "raise prestige point gain to 1.1",
            cost: new Decimal('1e160'),
            effect() {
                eff = new Decimal(1.1)
                if (hasUpgrade('i', 83)){eff = eff.pow(upgradeEffect('i', 83))} 
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
                if (hasUpgrade('i', 83)){eff = eff.pow(upgradeEffect('i', 83))} 
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
                if (hasUpgrade('i', 83)){eff = eff.times(upgradeEffect('i', 83))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        74: {
            title: "prestige upgrade 74",
            description: "adds integral point timespeed by 0.2",
            cost: new Decimal('1e220'),
            effect() {
                eff = new Decimal(0.2)
                if (hasUpgrade('i', 83)){eff = eff.times(upgradeEffect('i', 83))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        81: {
            title: "prestige upgrade 81",
            description: "adds the energy timespeed by 0.3",
            cost: new Decimal('1e240'),
            effect() {
                eff = new Decimal(0.3)
                if (hasUpgrade('i', 84)){eff = eff.times(upgradeEffect('i', 84))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        82: {
            title: "prestige upgrade 82",            
            description: "adds fire gain by 0.05",
            cost: new Decimal('1e280'),
            effect() {
                eff = new Decimal(0.05)
                if (hasUpgrade('i', 84)){eff = eff.times(upgradeEffect('i', 84))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        83: {
            title: "prestige upgrade 83",
            description: "adds total time by 8",
            cost: new Decimal('1e300'),
            effect() {
                eff = new Decimal(8)
                if (hasUpgrade('i', 84)){eff = eff.times(upgradeEffect('i', 84))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        84: {
            title: "prestige upgrade 84",
            description: "unlocks infinity, and 8 prestige upgrades",
            cost: new Decimal('1e305'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        91: {
            title: "prestige upgrade 91",
            description: "multiply prestige point gain by log(p points)^24",
            cost: new Decimal('e500'),
            effect() {
                eff = player.p.points.max(10).log10().pow(24)
                if (hasUpgrade('p', 122)) eff = eff.pow(upgradeEffect('p', 122))
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        92: {
            title: "prestige upgrade 92",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal('e1000'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        93: {
            title: "prestige upgrade 93",
            description: "raise integral kinematics upgrade 13 to 8",
            cost: new Decimal('e2000'),
            effect() {
                eff = new Decimal(8)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        94: {
            title: "prestige upgrade 94",
            description: "add prestige buyable 11 effect base by 0.5",
            cost: new Decimal('e4000'),
            effect() {
                eff = new Decimal(0.5)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        101: {
            title: "prestige upgrade 101",
            description: "add integral point timespeed by 0.1",
            cost: new Decimal('e1e4'),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        102: {
            title: "prestige upgrade 102",
            description: "raise prestige point gain by 1.3",
            cost: new Decimal('e4e4'),
            effect() {
                eff = new Decimal(1.3)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        103: {
            title: "prestige upgrade 103",
            description: "change the prestige buyable 11 description",
            cost: new Decimal('e1e5'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        104: {
            title: "prestige upgrade 104",
            description: "unlock a new layer and the next 8 prestige upgrades",
            cost: new Decimal('e2e5'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        111: {
            title: "prestige upgrade 111",
            description() {
                if (hasUpgrade('p', 111)) {return "here's the cat images buyable! wait, you already have it? sorry... i got nothing for you."} else {return "unlock another prestige buyable"}
            },
            cost: new Decimal('e10000'),
            effect() {
                eff = new Decimal(1-(hasUpgrade('p', 111)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        112: {
            title: "prestige upgrade 112",
            description() { 
                text = "multiply prestige gain by (prestige points)^0.01"
                if (player.p.points.gte('e4e4')) text += ", but i can't seem to put my best effort into anything recently..."
                return text},
            cost: new Decimal('e20000'),
            effect() {
                eff = player.p.points.max(1).root(100)
                if (eff.gte('e1e3')) {eff = eff.log10().div(1e3).pow(0.1).times(1e3).pow10()}
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        113: {
            title: "prestige upgrade 113",
            description() {
                if (hasUpgrade('p', 113)) {return "20 seconds? how much is a second? where am i?"} else {return "adds 20 seconds to game time"}
            },
            cost: new Decimal('e40000'),
            effect() {
                eff = new Decimal(20-20*(hasUpgrade('p', 111)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        114: {
            title: "prestige upgrade 114",
            description() { 
                text = "tries to raise prestige gain by 1.5"
                if (hasUpgrade('p', 114)) text += ", but fails"
                return text},
            cost: new Decimal('e60000'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 111)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        121: {
            title: "prestige upgrade 121",
            description: "raise integral kinematics upgrade 22 by 10",
            cost: new Decimal('e100000'),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        122: {
            title: "prestige upgrade 122",
            description: "raise prestige upgrade 91 by 10",
            cost: new Decimal('e200000'),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        123: {
            title: "prestige upgrade 123",
            description: "add integral point timespeed by 0.1",
            cost: new Decimal('e400000'),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
    },
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


        return multil
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expil = new Decimal(1)
        return expil
    },
    getResetGain() {
        return player.p.points.max(37).log10().log(6).log(2).add(addil).times(multil).pow(expil).floor().sub(player.il.total)
    },
    getNextAt() {
        nextil = player.il.total.add(getResetGain('il')).add(1)
        return new Decimal(6).pow(Decimal.dTwo.pow(nextil.root(expil).div(multil).sub(addil))).pow10()
    },
    canReset() {return getResetGain('il').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('il'))+" integral layers. Next at "+format(getNextAt('il'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return hasUpgrade('p', 24)||player.il.total.gte(2)||player.cg.total.gte(1)},
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
    color: "#1A53FF",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "power", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addpw = new Decimal(-1)
        multpw = new Decimal(1)


        return multpw
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exppw = new Decimal(1)
        return exppw
    },
    getResetGain() {
        return player.p.points.max(10000).log10().log(2).log(2).add(addpw).times(multpw).pow(exppw).floor().sub(player.pw.total)
    },
    getNextAt() {
        nextpw = player.pw.total.add(getResetGain('pw')).add(1)
        return Decimal.dTwo.pow(Decimal.dTwo.pow(nextpw.root(exppw).div(multpw).sub(addpw))).pow10()
    },
    canReset() {return getResetGain('pw').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('pw'))+" power. Next at "+format(getNextAt('pw'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 44)||player.pw.total.gte(1)||player.cg.total.gte(1)},
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
            effectDescription: "3 power, unlock a certain energy upgrade",
            done() { return player[this.layer].points.gte(3) }
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
        return player.p.points.max(1).root(441.00604902612340787).div(5).times(multi).pow(expi).floor().sub(player.i.total).max(0) //441.0 = 308.25*ln10/ln5
    },
    getNextAt() {
        nexti = player.i.total.add(getResetGain('i')).add(1)
        return nexti.root(expi).div(multi).times(5).pow(441.00604902612340787)
    },
    canReset() {return getResetGain('i').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('i'))+" infinity points. Next at "+format(getNextAt('i'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 84)||player.i.total.gte(1)||player.cg.total.gte(1)},
    milestones:{
        0: {
            requirementDescription: "infinity milestone 0",
            effectDescription: "1 infinity point, small bonuses to upgrades",
            done() { return player[this.layer].total.gte(1)||hasMilestone('cg', 0) }
        },
        1: {
            requirementDescription: "infinity milestone 1",
            effectDescription: "100 total infinity point, prestige layer is not reset by row 2 resets",
            done() { return player[this.layer].total.gte(1)||hasMilestone('cg', 0) }
        }
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
            unlocked() {return hasUpgrade('i', 84)},
            cost(x) {
                costbasei11 = Decimal.dTen

                logcosti11 = new Decimal(x).add(4.5).pow(2).add(119.75)


                ownedi11 = player.i.points.sub(119.75).root(2).sub(4.5)

                return Decimal.pow(costbasei11, logcosti11)
            },
            effect(x) {
                effbasei11 = new Decimal(0.01)

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
            unlocked() {return hasUpgrade('i', 84)},
            cost(x) {
                costbasei12 = Decimal.dTen


                logcosti12 = new Decimal(x).add(1.5).pow(2).times(5).add(128.75)


                ownedi12 = player.i.points.log(costbasei12).sub(128.75).div(5).root(2).sub(1.5)


                return Decimal.pow(costbasei12, logcosti12).round()
            },
            effect(x) {
                effbasei12 = new Decimal(1.01)

                logeffi12 = new Decimal(x)

                return Decimal.pow(effbasei12, logeffi12)
            },
            title() { return "fire buyable 12"},
            display() { return "multiply fire gain by "+format(effbasei12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return hasUpgrade('i', 84)},
            cost(x) {
                costbasei13 = Decimal.dTen


                logcosti13 = new Decimal(x).add(9/2).pow(2).times(1/50).add(519/200)


                ownedi13 = player.i.points.log(costbasei13).sub(519/200).div(1/50).root(2).sub(9/2)


                return Decimal.pow(costbasei13, logcosti13).round()
            },
            effect(x) {
                effbasei13 = new Decimal(10)

                diveffi13 = new Decimal(x)

                return Decimal.times(effbasei13, diveffi13)
            },
            title() { return "fire buyable 13"},
            display() { return "increase the first fire softcap start exponent by "+format(effbasei13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())},
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
            description: "multiplies prestige point gain by 10^(total time)",
            cost: new Decimal(1),
            effect() {
                eff = player.totalGameTime().pow10()
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "infinity upgrade 12",
            description() { 
                text = "multiplies prestige point gain by 10^(log(1+total i points)^0.75*100)"
                if (player.i.points.gte(354715146)) text += "(softcapped)" //3.5e8 = 10^(5^(4/3))-1
                return text},
            cost: new Decimal(2),
            effect() {
                eff = player.i.total.add(1).log10().pow(0.75)
                if (eff.gte(5)) eff = eff.div(5).pow(1/3).times(5) //effective pow: 0.25
                if (eff.gte(25)) eff = eff.div(25).pow(1/5).times(25) //effective pow: 0.05
                eff = eff.min(100).times(100).pow10()

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
            cost: new Decimal(10),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "infinity upgrade 21",
            description: "multiply prestige point gain by log(p point)^60",
            cost: new Decimal(100),
            effect() {
                eff = player.p.points.add(11).log10().pow(60)
                eff = eff.min('e10000')
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "infinity upgrade 22",
            description: "raise prestige upgrade 11 by ^1.6",
            cost: new Decimal(10000),
            effect() {
                eff = new Decimal(1.6)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "infinity upgrade 23",
            description: "add fire gain by 0.05",
            cost: new Decimal(1e6),
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
            cost: new Decimal(1e8),
            effect() {
                eff = infmult.max(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        31: {
            title: "infinity upgrade 31",
            description() { 
                text = "multiplies prestige point gain by 10^(log(p points)^0.5)"
                if (player.p.points.gte('ee8')) text += "(hardcapped)" //ee8 = 10^(10000^(1/0.5))
                return text},
            cost: new Decimal(1e9),
            effect() {
                eff = player.p.points.max(10).log10().pow(0.5).min(10000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        32: {
            title: "infinity upgrade 32",
            description: "multiplies prestige point gain by log(total i points)^100",
            cost: new Decimal(1e10),
            effect() {
                eff = player.i.total.max(1).log10().pow(100)
                eff = eff.min('e10000')
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        33: {
            title: "infinity upgrade 33",
            description: "raises prestige upgrade 11 effect by 1.5",
            cost: new Decimal(1e11),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        34: {
            title: "infinity upgrade 34",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(1e12),
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
            cost: new Decimal(1e13),
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
            cost: new Decimal(1e14),
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
            cost: new Decimal(1e16),
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
            cost: new Decimal(1e18),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        51: {
            title: "infinity upgrade 51",
            description: "raise prestige upgrade 21 to 200",
            cost: new Decimal(1e20),
            effect() {
                eff = new Decimal(200)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "infinity upgrade 52",
            description: "raise prestige upgrade 22 to 60",
            cost: new Decimal(1e25),
            effect() {
                eff = new Decimal(60)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "infinity upgrade 53",
            description: "raise prestige upgrade 11 to 1.5",
            cost: new Decimal(1e30),
            effect() {
                eff = new Decimal(1.5)
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
                text = "multiply prestige point gain by 10^(log(i points)^2*800)"
                if (player.i.points.gte(316.2277660168379332)) {text += " (softcapped)"} // 316.22 = 10^(6.25^0.5)
                return text
            },
            cost: new Decimal(1e40),
            effect() {
                eff = player.i.points.max(1).log10().pow(2).times(800)
                if (eff.gte(5000)) {eff = eff.div(5000).pow(0.25).times(5000)}
                eff = eff.min(10000)
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
                if (player.p.points.gte('e353553.3905932737622')) {text += " (softcapped)"} // 353553 = 5000^(3/2)
                return text
            },
            cost: new Decimal(1e45),
            effect() {
                eff = player.p.points.max(1).log10().root(2)
                if (eff.gte(5000)) {eff = eff.div(5000).pow(0.25).times(5000)}
                eff = eff.min(10000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "infinity upgrade 63",
            description: "raise prestige point gain by 1.3",
            cost: new Decimal(1e50),
            effect() {
                eff = new Decimal(1.3)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        64: {
            title: "infinity upgrade harmonized",
            description: "raise prestige point gain by 1.3, and unlock the 3rd infinity dimension and 8 infinity upgrades",
            cost: new Decimal(1e58),
            effect() {
                eff = new Decimal(1.3)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        71: {
            title: "infinity upgrade 71",
            description: "double the effects of prestige upgrade 11 to 14",
            cost: new Decimal(1e70),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        72: {
            title: "infinity upgrade 72",
            description: "double the effects of prestige upgrade 21 to 24",
            cost: new Decimal(1e80),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        73: {
            title: "infinity upgrade 73",
            description: "double the effects of prestige upgrade 31 to 34",
            cost: new Decimal(1e90),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        74: {
            title: "infinity upgrade 74",
            description: "double the effects of prestige upgrade 41 to 44",
            cost: new Decimal(1e100),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        81: {
            title: "infinity upgrade 81",
            description: "double the effects of prestige upgrade 51 to 54",
            cost: new Decimal(1e110),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        82: {
            title: "infinity upgrade 82",
            description: "double the effects of prestige upgrade 61 to 64",
            cost: new Decimal(1e120),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        83: {
            title: "infinity upgrade 83",
            description: "double the effects of prestige upgrade 71 to 74",
            cost: new Decimal(1e130),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        84: {
            title: "infinity upgrade 84",
            description: "double the effects of prestige upgrade 81 to 84, unlock the 4th infinity dimension, a fire upgrade, and some infinity buyables",
            cost: new Decimal(1e140),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
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
    baseAmount() {return player.p.buyables[11]}, // Get the current amount of baseResource
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
        return player.p.buyables[11].div(100).root(2).times(multcg).pow(expcg).trunc().sub(player.cg.total)
    },
    getNextAt() {
        nextcg = player.cg.total.add(getResetGain('cg')).add(1)
        return nextcg.root(expcg).div(multcg).pow(2).times(100)
    },
    canReset() {return getResetGain('cg').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('cg'))+" cat gifs. Next at "+format(getNextAt('cg'))+" prestige buyable 11s" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 104)||player.cg.total.gte(1)},
    milestones:{
        0: {
            requirementDescription: "cat gif milestone 0",
            effectDescription: "1 total cat gif, always unlock previous milestones, improve some upgrades, double prestige buyable 11 amount, and unlock 1 cat gif upgrade",
            done() { return player[this.layer].total.gte(1) }
        },
        1: {
            requirementDescription: "cat gif milestone 1",
            effectDescription: "2 total cat gifs, improve some upgrades, and unlock 3 cat gif upgrade",
            done() { return player[this.layer].total.gte(2) }
        },
        2: {
            requirementDescription: "cat gif milestone 2",
            effectDescription: "3 total cat gifs, continuum prestige buyable 11",
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
                effbasecg11 = new Decimal(10/9)

                logeffcg11 = new Decimal(x)

                return Decimal.pow(effbasecg11, logeffcg11)
            },
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
            unlocked() {return hasMilestone('cg', 1)},
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
            unlocked() {return hasMilestone('cg', 1)},
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
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
    }
})