addLayer("j", {
    name: "job", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "J", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffff33",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "dollars", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {
        if (typeof(lastClickedTime)=="undefined") {lastClickedTime = Date.now()}
        if (getClickableState('j', 11) == '') {setClickableState('j', 11, 0)}
        if (typeof(getClickableState('j', 11)) == 'undefined') {setClickableState('j', 11, 0)}
        if (getClickableState('j', 12) == '') {setClickableState('j', 12, 0)}
        if (typeof(getClickableState('j', 12)) == 'undefined') {setClickableState('j', 12, 0)}
        if (getClickableState('j', 13) == '') {setClickableState('j', 13, 0)}
        if (typeof(getClickableState('j', 13)) == 'undefined') {setClickableState('j', 13, 0)}
        if (getClickableState('j', 14) == '') {setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))}
        if (typeof(getClickableState('j', 14)) == 'undefined') {setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))}
        if (getClickableState('j', 15) == '') {setClickableState('j', 15, 14.75)}
        if (typeof(getClickableState('j', 15)) == 'undefined') {setClickableState('j', 15, 14.75)}
        return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "This layer cannot be reset" },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(resettingLayer) {
        return;
    },
    infoboxes: {
        11: {
            body() {return "you have $"+format(player.j.points, 2)+" left"}
        }
    }, 
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                wages = getClickableState('j', 15)
                clicksPerHour = 4800
                owedMoney = Math.floor(getClickableState('j', 11)*wages/clicksPerHour*100)/100
                return Decimal.dZero
            },
            title() { return "get paid for all the work you did"},
            display() { return "you have clicked "+getClickableState('j', 11)+" times <br> your wages are $"+wages.toFixed(2)+" per "+clicksPerHour+" clicks <br> you are owed $"+owedMoney+"<br> you may get a payday after "+timeUntilPayday+" seconds"},
            canAfford() { 
                nextPaydayTime = getClickableState('j', 12) + 86400000
                timeUntilPayday = Math.ceil(Math.max(nextPaydayTime - Date.now(), 0)/1000)
                return timeUntilPayday == 0},
            buy() {
                player[this.layer].points = player[this.layer].points.add(owedMoney)
                clicksToBeTotalled = getClickableState('j', 11)
                setClickableState('j', 11, 0)
                setClickableState('j', 12, Date.now())

                if (getClickableState('j', 14) == Math.floor((Date.now()-342000000)/604800000)) {setClickableState('j', 13, getClickableState('j', 13)+clicksToBeTotalled)} else {setClickableState('j', 13, clicksToBeTotalled)}
                setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))
                
                //states:
                //11 is the amount of clicks unpaid
                //12 is the last time player got paid
                //13 is the amount of total paid clicks this week
                //14 is the week number 
                //15 is the raise
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                clicksGoal = getClickableState('j', 15)*2400
                raiseChance = Math.tanh(getClickableState('j', 13)/4800-getClickableState('j', 15))

                return Decimal.dZero
            },
            title() { return "apply for a 25c raise"},
            display() { return "you have clicked "+getClickableState('j', 13)+" times this week <br> your productivity goal is "+clicksGoal+" clicks each week <br> if you apply for a raise now, there's a "+Math.floor(raiseChance*10000)/100+"% chance you'll get it"},
            canAfford() { 
                return true},
            buy() {
                if (Math.random() <= raiseChance) {setClickableState('j', 15, getClickableState('j', 15)+0.25)}
                setClickableState('j', 13, 0)
                
            },
        },
    },
    clickables: {
        11: {
            display: "click me",
            onClick() {
                
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 0}
        },
        12: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 1}
        },
        13: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 2}
        },
        21: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 3}
        },
        22: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 4}
        },
        23: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 5}
        },
        31: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 6}
        },
        32: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 7}
        },
        33: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 8}
        },
        41: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 9}
        },
        42: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 10}
        },
        43: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 11}
        },
        51: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 12}
        },
        52: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 13}
        },
        53: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 14}
        },
        61: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 15}
        },
        62: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 16}
        },
        63: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 17}
        },
        71: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 18}
        },
        72: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 19}
        },
        73: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 20}
        },
        81: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 21}
        },
        82: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 22}
        },
        83: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 23}
        },
        91: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 24}
        },
        92: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 25}
        },
        93: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 26}
        },
    }
})

addLayer("sj", {
    name: "superjob", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SJ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#c08c8c",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "nothing", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {
        if (typeof(lastClickedTimeS)=="undefined") {lastClickedTimeS = Date.now()}
        return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "This layer cannot be reset" },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(resettingLayer) {
        return;
    },
    infoboxes: {
        11: {
            body() {return "each click in the superjob counts as 5 clicks in the job"}
        }
    }, 
    buyables: {
    },
    clickables: {
        11: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 0}
        },
        12: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 1}
        },
        13: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 2}
        },
        21: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 3}
        },
        22: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 4}
        },
        23: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 5}
        },
        31: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 6}
        },
        32: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 7}
        },
        33: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 8}
        },
        41: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 9}
        },
        42: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 10}
        },
        43: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 11}
        },
        51: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 12}
        },
        52: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 13}
        },
        53: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 14}
        },
        61: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 15}
        },
        62: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 16}
        },
        63: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 17}
        },
        71: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 18}
        },
        72: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 19}
        },
        73: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 20}
        },
        81: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 21}
        },
        82: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 22}
        },
        83: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 23}
        },
        91: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 24}
        },
        92: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 25}
        },
        93: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 26}
        },
    }
})

addLayer("g", {
    name: "in-game shop", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#3333ff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "gems", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {return false},
    prestigeNotify() {return true},
    row: "side", // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer) {

        return;
    },
    infoboxes: {
        11: {
            body() {
                vipLevel = getBuyableAmount('g', 11).div(1000).pow(0.5).floor()
                vipEffect = vipLevel.div(60).add(1)
                text = "you have "+formatWhole(getBuyableAmount('g', 11))+" vip points, which gives you vip level "+formatWhole(vipLevel)
                text += "<br> your vip levels gives you "+format(vipEffect.sub(1).times(100), 1)+"% free gems on gem purchases"
                text += "<br> you need "+formatWhole(vipLevel.add(1).pow(2).times(1000).sub(getBuyableAmount('g', 11)))+" vip points to get the next level"
                return text
            
            }
        }
    }, 
    layerShown(){return true},

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(0.49)
            },
            effect(x) {
                baseGems1 = new Decimal(6000)
                gemMultiplier1 = new Decimal(1).times(vipEffect)
                vipPoints1 = new Decimal(200)

                return Decimal.times(baseGems1, gemMultiplier1).round()
            },
            title() { return "gems pack 1"},
            display() { 
                text = "gives "+format(baseGems1, 0)+" gems "
                if (gemMultiplier1.gt(1)) {text += "with "+format(gemMultiplier1.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems. "}
                text += "<br> also gives "+format(vipPoints1, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints1))
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(0.99)
            },
            effect(x) {
                baseGems2 = new Decimal(12000)
                gemMultiplier2 = new Decimal(1.05).times(vipEffect)
                vipPoints2 = new Decimal(405)

                return Decimal.times(baseGems2, gemMultiplier2).round()
            },
            title() { return "gems pack 2"},
            display() { 
                text = "gives "+format(baseGems2, 0)+" gems "
                if (gemMultiplier2.gt(1)) {text += "with "+format(gemMultiplier2.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints2, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints2))
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(1.99)
            },
            effect(x) {
                baseGems3 = new Decimal(24000)
                gemMultiplier3 = new Decimal(1.1).times(vipEffect)
                vipPoints3 = new Decimal(1025)

                return Decimal.times(baseGems3, gemMultiplier3).round()
            },
            title() { return "gems pack 3"},
            display() { 
                text = "gives "+format(baseGems3, 0)+" gems "
                if (gemMultiplier3.gt(1)) {text += "with "+format(gemMultiplier3.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints3, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints3))
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(4.99)
            },
            effect(x) {
                baseGems4 = new Decimal(60000)
                gemMultiplier4 = new Decimal(1.166).times(vipEffect)
                vipPoints4 = new Decimal(2083)

                return Decimal.times(baseGems4, gemMultiplier4).round()
            },
            title() { return "gems pack 4"},
            display() { 
                text = "gives "+format(baseGems4, 0)+" gems "
                if (gemMultiplier4.gt(1)) {text += "with "+format(gemMultiplier4.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints4, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints4))
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(9.99)
            },
            effect(x) {
                baseGems5 = new Decimal(120000)
                gemMultiplier5 = new Decimal(1.216).times(vipEffect)
                vipPoints5 = new Decimal(4216)

                return Decimal.times(baseGems5, gemMultiplier5).round()
            },
            title() { return "gems pack 5"},
            display() { 
                text = "gives "+format(baseGems5, 0)+" gems "
                if (gemMultiplier5.gt(1)) {text += "with "+format(gemMultiplier5.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints5, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints5))
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(19.99)
            },
            effect(x) {
                baseGems6 = new Decimal(240000)
                gemMultiplier6 = new Decimal(1.266).times(vipEffect)
                vipPoints6 = new Decimal(10665)

                return Decimal.times(baseGems6, gemMultiplier6).round()
            },
            title() { return "gems pack 6"},
            display() { 
                text = "gives "+format(baseGems6, 0)+" gems "
                if (gemMultiplier6.gt(1)) {text += "with "+format(gemMultiplier6.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints6, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints6))
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(49.99)
            },
            effect(x) {
                baseGems7 = new Decimal(600000)
                gemMultiplier7 = new Decimal(1.332).times(vipEffect)
                vipPoints7 = new Decimal(21660)

                return Decimal.times(baseGems7, gemMultiplier7).round()
            },
            title() { return "gems pack 7"},
            display() { 
                text = "gives "+format(baseGems7, 0)+" gems "
                if (gemMultiplier7.gt(1)) {text += "with "+format(gemMultiplier7.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints7, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints7))
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(99.99)
            },
            effect(x) {
                baseGems8 = new Decimal(1200000)
                gemMultiplier8 = new Decimal(1.382).times(vipEffect)
                vipPoints8 = new Decimal(43820)

                return Decimal.times(baseGems8, gemMultiplier8).round()
            },
            title() { return "gems pack 8"},
            display() { 
                text = "gives "+format(baseGems8, 0)+" gems "
                if (gemMultiplier8.gt(1)) {text += "with "+format(gemMultiplier8.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints8, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints8))
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(199.99)
            },
            effect(x) {
                baseGems9 = new Decimal(2400000)
                gemMultiplier9 = new Decimal(1.432).times(vipEffect)
                vipPoints9 = new Decimal(110880)

                return Decimal.times(baseGems9, gemMultiplier9).round()
            },
            title() { return "gems pack 9"},
            display() { 
                text = "gives "+format(baseGems9, 0)+" gems "
                if (gemMultiplier9.gt(1)) {text += "with "+format(gemMultiplier9.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints9, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints9))
            },
        },
        // 41: {
        //     unlocked() {return true},
        //     cost(x) {
                

        //         return new Decimal(360)
        //     },
        //     effect(x) {

        //         return new Decimal(1)
        //     },
        //     title() { return "1 hour timelapse"},
        //     display() { return "instantly gain "+format(this.effect(), 0)+" hours of offline time <br> cost: "+format(this.cost())},
        //     canAfford() { return player[this.layer].points.gte(this.cost()) },
        //     buy() {
        //         const timelapseobject1 = {remain: 3600}
        //         player[this.layer].points = player[this.layer].points.sub(this.cost())
        //         if (typeof(player.offTime) == "undefined") {player.offTime = timelapseobject1} else {player.offTime.remain += 3600}
        //     },
        // },
        // 42: {
        //     unlocked() {return true},
        //     cost(x) {
                

        //         return new Decimal(7776)
        //     },
        //     effect(x) {


        //         return new Decimal(4)
        //     },
        //     title() { return "24 hour timelapse"},
        //     display() { return "instantly gain "+format(this.effect(), 0)+" hours of offline time <br> cost: "+format(this.cost())},
        //     canAfford() { return player[this.layer].points.gte(this.cost()) },
        //     buy() {
        //         const timelapseobject2 = {remain: 86400}
        //         player[this.layer].points = player[this.layer].points.sub(this.cost())
        //         if (typeof(player.offTime) == "undefined") {player.offTime = timelapseobject2} else {player.offTime.remain += 86400}
        //     },
        // },
        // 43: {
        //     unlocked() {return true},
        //     cost(x) {
                

        //         return new Decimal(48384)
        //     },
        //     effect(x) {


        //         return new Decimal(168)
        //     },
        //     title() { return "168 hour timelapse"},
        //     display() { return "instantly gain "+format(this.effect(), 0)+" hours of offline time but offline time caps at 4 weeks <br> cost: "+format(this.cost())},
        //     canAfford() { return player[this.layer].points.gte(this.cost()) },
        //     buy() {
        //         const timelapseobject3 = {remain: 604800}
        //         player[this.layer].points = player[this.layer].points.sub(this.cost())
        //         if (typeof(player.offTime) == "undefined") {player.offTime = timelapseobject3} else {player.offTime.remain += 604800}
        //     },
        // },
        51: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(800)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant prestige"},
            display() { return "instantly gain your prestige points on prestige <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('p', getResetGain('p'))

            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costBaseg52 = new Decimal(160)

                costMultg52 = new Decimal(x).add(5)
                return Decimal.times(costBaseg52, costMultg52).floor()
            },
            effect(x) {
                effBaseg52 = new Decimal(0.1)
                effStackg52 = new Decimal(x)

                return Decimal.times(effBaseg52, effStackg52)
            },
            title() { return "free prestige points"},
            display() { return "add prestige point gain by "+format(effBaseg52)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackg52)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costBaseg53 = new Decimal(1.21)

                costExpg53 = new Decimal(x).add(35.0677)
                return Decimal.pow(costBaseg53, costExpg53).floor()
            },
            effect(x) {
                effBaseg53 = new Decimal(0.1)
                effStackg53 = new Decimal(x)

                return Decimal.times(effBaseg53, effStackg53)
            },
            title() { return "free prestige point multi"},
            display() { return "add prestige point gain multiplier by "+format(effBaseg53)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackg53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        61: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(4250)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant metaprestige"},
            display() { return "instantly gain your metaprestige points on metaprestige <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('mp', getResetGain('mp'))
            },
        },
        62: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(4500)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant buyable points"},
            display() { return "instantly gain your buyable points on buyable <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('bp', getResetGain('bp'))
            },
        },
        63: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(4750)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant superprestige"},
            display() { return "instantly gain your superprestige points on superprestige <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('sp', getResetGain('sp'))
            },
        },
        71: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(49000)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant lootbox"},
            display() { return "instantly gain your lootbox points on lootbox reset <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('l', getResetGain('l'))
            },
        },
    },
})

addLayer("m", {
    name: "milestones", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#e08080",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "milestones", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {return false},
    prestigeNotify() {return true},
    row: "side", // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer) {

        return;
    },
    layerShown(){return true},
    milestones: {
        0: {
            requirementDescription: "2.00 points",
            effectDescription: "automates prestige buyables",
            done() { return player.points.gte(2) },
            toggles: [["p", "autoBuy"]]
        },
        1: {
            requirementDescription: "2.50 points",
            effectDescription: "gain prestige gain on reset per 10 seconds",
            done() { return player.points.gte(2.5) },
            toggles: [["p", "autoGain"]]

        },
        2: {
            requirementDescription: "3.00 points",
            effectDescription: "prestige doesnt get reset",
            done() { return player.points.gte(3) },

        },
    },
})

addLayer("a", {
    name: "alternative points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#f0f0f0",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "alternative points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        return Decimal.dOne
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return Decimal.dOne
    },
    getResetGain() {
        baseagain = buyableEffect('l', 21)

        again = baseagain
        again = again.times(player.points.add(1).pow(buyableEffect('l', 22).add(1)))

        afirstSoftcapStrength = new Decimal(20)
        if (player.a.points.gte(1)) {again = again.div(player.a.points.pow(afirstSoftcapStrength))}

        asecondSoftcapStrength = new Decimal(20)
        if (player.a.points.gte(2)) {again = again.div(player.a.points.div(2).pow(asecondSoftcapStrength))}

        athirdSoftcapStrength = new Decimal(30)
        if (player.a.points.gte(3)) {again = again.div(player.a.points.div(3).pow(asecondSoftcapStrength))}

        afourthSoftcapStrength = new Decimal(60)
        if (player.a.points.gte(5)) {again = again.div(player.a.points.div(5).pow(asecondSoftcapStrength))}
        
        if (player.a.points.gte(9)) {gain = gain.times(player.a.points.sub(10).times(-1))}
        return again
    },
    getNextAt() {

        return Decimal.dOne
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    passiveGeneration() {
        return Decimal.dOne
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return true},
    infoboxes: {
        11: {
            body() {return "you have "+format(player.a.points, 4)+" alternative points, which multiply point gain by "+format(player.a.points.add(1).pow(buyableEffect('l', 23).add(1)), 4)}
        }
    }, 
    buyables: {
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
    color: "#6cdb40",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addp = new Decimal(0)
        addp = addp.add(buyableEffect('p', 21))
        addp = addp.add(buyableEffect('mp', 21))
        addp = addp.add(buyableEffect('bp', 21))
        addp = addp.add(buyableEffect('sp', 21))

        multp = new Decimal(1)
        multp = multp.add(buyableEffect('p', 22))
        multp = multp.add(buyableEffect('mp', 22))
        multp = multp.add(buyableEffect('bp', 22))
        multp = multp.add(buyableEffect('sp', 22))
        multp = multp.times(buyableEffect('l', 24))

        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(4)
        expp = expp.add(buyableEffect('p', 23))
        expp = expp.add(buyableEffect('mp', 23))
        expp = expp.add(buyableEffect('bp', 23))
        expp = expp.add(buyableEffect('sp', 23))
        expp = expp.times(buyableEffect('l', 25))

        exp2p = new Decimal(0.5)
        exp2p = exp2p.add(buyableEffect('p', 24))
        exp2p = exp2p.add(buyableEffect('mp', 24))
        exp2p = exp2p.add(buyableEffect('bp', 24))
        exp2p = exp2p.add(buyableEffect('sp', 24))
        exp2p = exp2p.add(buyableEffect('l', 26))

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
    canReset() {return getResetGain('p').gte(0)&&!(hasMilestone('m', 1)&&player.p.autoGain)},
    passiveGeneration() {
        if (hasMilestone('m', 1)) {
            if (player.p.autoGain) {return new Decimal(0.1)} else {return Decimal.dZero}
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    automate() {
        if (hasMilestone('m', 0)&&player.p.autoBuy) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) {
        if ((layers[resettingLayer].row > this.row)&&(!hasMilestone('m', 2))) {layerDataReset(this.layer, [])}

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costBasep11 = new Decimal(1.3)
                

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
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costBasep12 = new Decimal(1.5)
                

                costExpp12 = new Decimal(x).add(1).pow(1.2)
                return Decimal.pow(costBasep12, costExpp12).floor()
            },
            effect(x) {
                effBasep12 = new Decimal(0.1)
                effStackp12 = new Decimal(x)

                return Decimal.times(effBasep12, effStackp12)
            },
            title() { return "prestige buyable 12"},
            display() { return "add point gain mult by "+format(effBasep12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp12)+" <br> effect: "+format(this.effect())},
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
                costBasep13 = new Decimal(1.7)
                

                costExpp13 = new Decimal(40).div(40-x).times(x+1).pow(1.3)
                return Decimal.pow(costBasep13, costExpp13).floor()
            },
            effect(x) {
                effBasep13 = new Decimal(0.1)
                effStackp13 = new Decimal(x)

                return Decimal.times(effBasep13, effStackp13)
            },
            purchaseLimit: new Decimal(40),
            title() { return "prestige buyable 13"},
            display() { return "subtract first point softcap by "+format(effBasep13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp13)+" <br> effect: "+format(this.effect())},
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
                costBasep21 = new Decimal(1.5)
                

                costExpp21 = new Decimal(x).add(1).pow(1.1)
                return Decimal.pow(costBasep21, costExpp21).floor()
            },
            effect(x) {
                effBasep21 = new Decimal(0.1)
                effStackp21 = new Decimal(x)

                return Decimal.times(effBasep21, effStackp21)
            },
            title() { return "prestige buyable 21"},
            display() { return "add base prestige point gain by "+format(effBasep21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp21)+" <br> effect: "+format(this.effect())},
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
                costBasep22 = new Decimal(1.7)
                

                costExpp22 = new Decimal(x).add(1).pow(1.2)
                return Decimal.pow(costBasep22, costExpp22).floor()
            },
            effect(x) {
                effBasep22 = new Decimal(0.1)
                effStackp22 = new Decimal(x)

                return Decimal.times(effBasep22, effStackp22)
            },
            title() { return "prestige buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBasep22)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp22)+" <br> effect: "+format(this.effect())},
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
                costBasep23 = new Decimal(1.9)
                

                costExpp23 = new Decimal(x).add(1).pow(1.4)
                return Decimal.pow(costBasep23, costExpp23).floor()
            },
            effect(x) {
                effBasep23 = new Decimal(0.2)
                effStackp23 = new Decimal(x)

                return Decimal.times(effBasep23, effStackp23)
            },
            title() { return "prestige buyable 23"},
            display() { return "add prestige point gain power by "+format(effBasep23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp23)+" <br> effect: "+format(this.effect())},
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
        24: {
            unlocked() {return true},
            cost(x) {
                costBasep24 = new Decimal(2.1)
                

                costExpp24 = new Decimal(10).div(10-x).times(x+1).pow(1.6)
                return Decimal.pow(costBasep24, costExpp24).floor()
            },
            effect(x) {
                effBasep24 = new Decimal(0.01)
                effStackp24 = new Decimal(x)

                return Decimal.times(effBasep24, effStackp24)
            },
            purchaseLimit: new Decimal(10),
            title() { return "prestige buyable 22"},
            display() { return "add prestige point gain second power by "+format(effBasep24)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp24)+" <br> effect: "+format(this.effect())},
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

addLayer("mp", {
    name: "metaprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#52db40",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "metaprestige points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.best}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addmp = new Decimal(0)
        addmp = addmp.add(buyableEffect('mp', 31))
        addmp = addmp.add(buyableEffect('bp', 31))
        addmp = addmp.add(buyableEffect('sp', 31))

        multmp = new Decimal(0.01)
        multmp = multmp.add(buyableEffect('mp', 32))
        multmp = multmp.add(buyableEffect('bp', 32))
        multmp = multmp.add(buyableEffect('sp', 32))
        multmp = multmp.times(buyableEffect('l', 27))
        return multmp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expmp = new Decimal(0.5)
        expmp = expmp.add(buyableEffect('mp', 33))
        expmp = expmp.add(buyableEffect('bp', 33))
        expmp = expmp.add(buyableEffect('sp', 33))
        expmp = expmp.times(buyableEffect('l', 28))

        exp2mp = new Decimal(0.5)
        exp2mp = exp2mp.add(buyableEffect('mp', 34))
        exp2mp = exp2mp.add(buyableEffect('bp', 34))
        exp2mp = exp2mp.add(buyableEffect('sp', 34))
        exp2mp = exp2mp.add(buyableEffect('l', 29))

        return expmp
    },
    getResetGain() {
        mpp = player.p.best.add(addmp).times(multmp).pow(expmp)
        if (mpp.gte(1)) {mpp = mpp.log10().pow(exp2mp).pow10()}

        return mpp.floor().max(0)
    },
    getNextAt() {
        nextmp = getResetGain('mp').add(1)
        if (nextmp.gte(1)) {nextmp = nextmp.log10().root(exp2mp).pow10()}
        return nextmp.root(expmp).div(multmp).sub(addmp)
    },
    canReset() {return getResetGain('mp').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('mp'))+" metaprestige points. Next at "+format(getNextAt('mp'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for metaprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.2)
                

                costExp = new Decimal(x).add(1).pow(1.1)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 11"},
            display() { return "increase base point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.4)
                

                costExp = new Decimal(x).add(1).pow(1.2)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 12"},
            display() { return "add point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.6)
                

                costExp = new Decimal(40).div(40-x).times(x+1).pow(1.3)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(40),
            title() { return "metaprestige buyable 13"},
            display() { return "subtract first point softcap by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        14: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.8)
                

                costExp = new Decimal(40).div(40-x).times(x+1).pow(1.4)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(40),
            title() { return "metaprestige buyable 14"},
            display() { return "subtract second point softcap by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.3)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 21"},
            display() { return "add base prestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.5)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.001)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.7)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 23"},
            display() { return "add prestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        24: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.9)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 24"},
            display() { return "add prestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.5)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 31"},
            display() { return "add base metaprestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.7)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.001)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 32"},
            display() { return "add metaprestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.9)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.025)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 33"},
            display() { return "add metaprestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        34: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.1)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 34"},
            display() { return "add metaprestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        41: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.55)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 41"},
            display() { return "add base buyable point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.75)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.025)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 42"},
            display() { return "add buyable point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        43: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.95)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.15)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 43"},
            display() { return "add buyable point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        44: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.15)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 44"},
            display() { return "add buyable point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        51: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.6)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 51"},
            display() { return "add base superprestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.8)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.05)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 52"},
            display() { return "add superprestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        53: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "metaprestige buyable 53"},
            display() { return "add superprestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        54: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.2)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 54"},
            display() { return "add superprestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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

addLayer("bp", {
    name: "buyable points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#40d4db",
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
        addbp = addbp.add(buyableEffect('mp', 41))
        addbp = addbp.add(buyableEffect('bp', 41))
        addbp = addbp.add(buyableEffect('sp', 41))

        multbp = new Decimal(0.025)
        multbp = multbp.add(buyableEffect('mp', 42))
        multbp = multbp.add(buyableEffect('bp', 42))
        multbp = multbp.add(buyableEffect('sp', 42))
        multbp = multbp.times(buyableEffect('l', 31))

        return multbp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expbp = new Decimal(3)
        expbp = expbp.add(buyableEffect('mp', 43))
        expbp = expbp.add(buyableEffect('bp', 43))
        expbp = expbp.add(buyableEffect('sp', 43))
        expbp = expbp.times(buyableEffect('l', 32))

        exp2bp = new Decimal(0.5)
        exp2bp = exp2bp.add(buyableEffect('mp', 44))
        exp2bp = exp2bp.add(buyableEffect('bp', 44))
        exp2bp = exp2bp.add(buyableEffect('sp', 44))
        exp2bp = exp2bp.add(buyableEffect('l', 33))

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
                costBase = new Decimal(1.2)
                

                costExp = new Decimal(x).add(1).pow(1.1)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 11"},
            display() { return "increase base point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.4)
                

                costExp = new Decimal(x).add(1).pow(1.2)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 12"},
            display() { return "add point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.6)
                

                costExp = new Decimal(40).div(40-x).times(x+1).pow(1.3)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(40),
            title() { return "buyable buyable 13"},
            display() { return "subtract first point softcap by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        14: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.8)
                

                costExp = new Decimal(40).div(40-x).times(x+1).pow(1.4)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(40),
            title() { return "buyable buyable 14"},
            display() { return "subtract second point softcap by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.3)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 21"},
            display() { return "add base prestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.5)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.001)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.7)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 23"},
            display() { return "add prestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        24: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.9)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "buyable buyable 24"},
            display() { return "add prestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.45)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 31"},
            display() { return "add base metaprestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.65)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.001)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 32"},
            display() { return "add metaprestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.85)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.025)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 33"},
            display() { return "add metaprestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        34: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.05)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "buyable buyable 34"},
            display() { return "add metaprestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        41: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.5)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 41"},
            display() { return "add base buyable point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.7)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.025)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 42"},
            display() { return "add buyable point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        43: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.9)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.15)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 43"},
            display() { return "add buyable point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        44: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.1)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "buyable buyable 44"},
            display() { return "add buyable point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        51: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.55)
                

                costExp = new Decimal(x).add(1).pow(1.08)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 51"},
            display() { return "add base superprestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.75)
                

                costExp = new Decimal(x).add(1).pow(1.18)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.05)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 52"},
            display() { return "add superprestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        53: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.95)
                

                costExp = new Decimal(x).add(1).pow(1.38)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "buyable buyable 53"},
            display() { return "add superprestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        54: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.15)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.58)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 54"},
            display() { return "add superprestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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

addLayer("sp", {
    name: "superprestige points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#5cdb2a",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "superprestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addsp = new Decimal(0)
        addsp = addsp.add(buyableEffect('mp', 51))
        addsp = addsp.add(buyableEffect('bp', 51))
        addsp = addsp.add(buyableEffect('sp', 51))

        multsp = new Decimal(0.5)
        multsp = multsp.add(buyableEffect('mp', 52))
        multsp = multsp.add(buyableEffect('bp', 52))
        multsp = multsp.add(buyableEffect('sp', 52))
        multsp = multsp.times(buyableEffect('l', 34))

        return multsp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expsp = new Decimal(2)
        expsp = expsp.times(buyableEffect('mp', 53))
        expsp = expsp.times(buyableEffect('bp', 53))
        expsp = expsp.times(buyableEffect('sp', 53))
        expsp = expsp.times(buyableEffect('l', 35))


        exp2sp = new Decimal(0.5)
        exp2sp = exp2sp.times(buyableEffect('mp', 54))
        exp2sp = exp2sp.times(buyableEffect('bp', 54))
        exp2sp = exp2sp.times(buyableEffect('sp', 54))
        exp2sp = exp2sp.add(buyableEffect('l', 36))

        return expsp
    },
    getResetGain() {
        spp = player.points.add(addsp).times(multsp).pow(expsp)
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
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('sp'))+" superprestige points. Next at "+format(getNextAt('sp'))+" points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for superprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.2)
                

                costExp = new Decimal(x).add(1).pow(1.1)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 11"},
            display() { return "increase base point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.4)
                

                costExp = new Decimal(x).add(1).pow(1.2)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 12"},
            display() { return "add point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.6)
                

                costExp = new Decimal(40).div(40-x).times(x+1).pow(1.3)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(40),
            title() { return "superprestige buyable 13"},
            display() { return "subtract first point softcap by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        14: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.8)
                

                costExp = new Decimal(40).div(40-x).times(x+1).pow(1.4)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(40),
            title() { return "superprestige buyable 14"},
            display() { return "subtract second point softcap by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.3)
                

                costExp = new Decimal(x).add(1).pow(1.07)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 21"},
            display() { return "add base prestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.5)
                

                costExp = new Decimal(x).add(1).pow(1.17)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.001)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.7)
                

                costExp = new Decimal(x).add(1).pow(1.37)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 23"},
            display() { return "add prestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        24: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.9)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.57)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 24"},
            display() { return "add prestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.4)
                

                costExp = new Decimal(x).add(1).pow(1.07)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 31"},
            display() { return "add base metaprestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.6)
                

                costExp = new Decimal(x).add(1).pow(1.17)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.001)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 32"},
            display() { return "add metaprestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.8)
                

                costExp = new Decimal(x).add(1).pow(1.37)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.025)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 33"},
            display() { return "add metaprestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        34: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.57)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 34"},
            display() { return "add metaprestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        41: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.45)
                

                costExp = new Decimal(x).add(1).pow(1.07)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 41"},
            display() { return "add base buyable point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.65)
                

                costExp = new Decimal(x).add(1).pow(1.17)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.025)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 42"},
            display() { return "add buyable point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        43: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.85)
                

                costExp = new Decimal(x).add(1).pow(1.37)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.15)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 43"},
            display() { return "add buyable point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        44: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.05)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.57)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 44"},
            display() { return "add buyable point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        51: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.5)
                

                costExp = new Decimal(x).add(1).pow(1.07)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 51"},
            display() { return "add base superprestige point gain by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
                costBase = new Decimal(1.7)
                

                costExp = new Decimal(x).add(1).pow(1.17)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.05)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 52"},
            display() { return "add superprestige point gain mult by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        53: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(1.9)
                

                costExp = new Decimal(x).add(1).pow(1.37)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.1)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            title() { return "superprestige buyable 53"},
            display() { return "add superprestige point gain power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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
        54: {
            unlocked() {return true},
            cost(x) {
                costBase = new Decimal(2.1)
                

                costExp = new Decimal(10).div(10-x).times(x+1).pow(1.57)
                return Decimal.pow(costBase, costExp).floor()
            },
            effect(x) {
                effBase = new Decimal(0.01)
                effStack = new Decimal(x)

                return Decimal.times(effBase, effStack)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 54"},
            display() { return "add superprestige point gain second power by "+format(effBase)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStack)+" <br> effect: "+format(this.effect())},
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

addLayer("l", {
    name: "lootboxes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#e6c72e",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "lootboxes", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addl = new Decimal(0)


        multl = new Decimal(0.333333333333333333)
        

        return multsp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expl = new Decimal(1)


        exp2l = new Decimal(0.5)

        return expl
    },
    getResetGain() {
        lp = player.points.add(addl).times(multl).pow(expl)
        if (lp.gte(1)) {lp = lp.log10().pow(exp2l).pow10()}

        return lp.floor().max(0)
    },
    getNextAt() {
        nextl = getResetGain('l').add(1)
        if (nextl.gte(1)) {nextl = nextl.log10().root(exp2l).pow10()}
        return nextl.root(expl).div(multl).sub(addl)
    },
    canReset() {return getResetGain('l').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('l'))+" lootboxes. Next at "+format(getNextAt('l'))+" points" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for lootboxes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dOne
            },
            effect(x) {


                return Decimal.dOne
            },
            title() { return "open a lootbox"},
            display() { 
                text = "to get a random effect"
                if (typeof(lastEffectText)=="undefined") {} else {text += "<br> "+lastEffectText}
                return text},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                lootboxseed = Math.random() * 10000
                LBlayerDeterminer = parseInt(lootboxseed.toString().slice(0, 2))
                LBoperationDeterminer = parseInt(lootboxseed.toString().slice(2, 4))
                LBintensityDeterminer = lootboxseed % 1 + 2**-52
                APweight = 40
                PPweight = 20
                MPweight = 10
                BPweight = 10
                SPweight = 10
                //softcap weight is automatically the rest of the weight

                
                if (LBlayerDeterminer<APweight) {finalBuyableIndex = 21} else if (LBlayerDeterminer<APweight+PPweight) {finalBuyableIndex = 24} else if (LBlayerDeterminer<APweight+PPweight+MPweight) {finalBuyableIndex = 27} else if (LBlayerDeterminer<APweight+PPweight+MPweight+BPweight) {finalBuyableIndex = 31} else if (LBlayerDeterminer<APweight+PPweight+MPweight+BPweight+SPweight) {finalBuyableIndex = 34} else {finalBuyableIndex = 37}
                if (LBoperationDeterminer<70) {} else if (LBoperationDeterminer<90) {finalBuyableIndex += 1} else {finalBuyableIndex += 2}

                LBdeterministicIntensity = 10
                if (hasUpgrade('l', 12)) LBdeterministicIntensity = LBdeterministicIntensity * 3
                LBrandomIntensity = Math.log(LBintensityDeterminer) * -10 //the average of ln(U(0, 1)) is -1
                if (hasUpgrade('l', 11)) LBrandomIntensity = LBrandomIntensity * 2
                LBintensity = Math.floor(LBdeterministicIntensity + LBrandomIntensity)

                setBuyableAmount('l', finalBuyableIndex, getBuyableAmount('l', finalBuyableIndex).add(LBintensity))
                lastEffectText = formatWhole(LBintensity)+" amount, index "+finalBuyableIndex+"<br> this text will be improved"
            },
        },
        21: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel21 = new Decimal(0.01)
                effStackl21 = new Decimal(x)
                if (hasUpgrade('l', 13)) {effStackl21 = effStackl21.times(1.5)}

                return Decimal.times(effBasel21, effStackl21)
            },
            display() { return "add ap gain" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        22: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel22 = new Decimal(0.001)
                effStackl22 = new Decimal(x)
                if (hasUpgrade('l', 13)) {effStackl22 = effStackl22.times(1.5)}

                return Decimal.times(effBasel22, effStackl22)
            },
            display() { return "add ap gain power to point gain" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        23: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel23 = new Decimal(0.001)
                effStackl23 = new Decimal(x)
                if (hasUpgrade('l', 13)) {effStackl23 = effStackl23.times(1.5)}

                return Decimal.times(effBasel23, effStackl23)
            },
            display() { return "add point gain power to ap gain" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        24: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel24 = new Decimal(1.1)
                effStackl24 = new Decimal(x)
                if (hasUpgrade('l', 13)) {effStackl24 = effStackl24.times(1.5)}

                return Decimal.pow(effBasel24, effStackl24)
            },
            display() { return "multiply prestige points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        25: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel25 = new Decimal(1.02)
                effStackl25 = new Decimal(x).pow(0.5)
                if (hasUpgrade('l', 13)) {effStackl25 = effStackl25.times(1.5)}

                return Decimal.pow(effBasel25, effStackl25)
            },
            display() { return "raise prestige points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        26: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effMaxl26 = new Decimal(0.2)
                effStackl26 = Decimal.dOne.sub(new Decimal(x).div(-300).exp()) //exponential approach
                

                return Decimal.times(effMaxl26, effStackl26)
            },
            display() { return "raise prestige points power" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        27: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel27 = new Decimal(1.05)
                effStackl27 = new Decimal(x)
                if (hasUpgrade('l', 13)) {effStackl27 = effStackl27.times(1.5)}

                return Decimal.pow(effBasel27, effStackl27)
            },
            display() { return "multiply metaprestige points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        28: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel28 = new Decimal(1.01)
                effStackl28 = new Decimal(x).pow(0.5)
                if (hasUpgrade('l', 13)) {effStackl28 = effStackl28.times(1.5)}

                return Decimal.pow(effBasel28, effStackl28)
            },
            display() { return "raise metaprestige points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        29: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effMaxl29 = new Decimal(0.5)
                effStackl29 = Decimal.dOne.sub(new Decimal(x).div(-1000).exp()) //exponential approach

                return Decimal.times(effMaxl29, effStackl29)
            },
            display() { return "raise metaprestige points power" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        31: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel31 = new Decimal(1.05)
                effStackl31 = new Decimal(x)
                if (hasUpgrade('l', 13)) {effStackl31 = effStackl31.times(1.5)}

                return Decimal.pow(effBasel31, effStackl31)
            },
            display() { return "multiply buyable points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        32: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel32 = new Decimal(1.01)
                effStackl32 = new Decimal(x).pow(0.5)
                if (hasUpgrade('l', 13)) {effStackl32 = effStackl32.times(1.5)}

                return Decimal.pow(effBasel32, effStackl32)
            },
            display() { return "raise buyable points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        33: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effMaxl33 = new Decimal(0.5)
                effStackl33 = Decimal.dOne.sub(new Decimal(x).div(-1000).exp()) //exponential approach

                return Decimal.times(effMaxl33, effStackl33)
            },
            display() { return "raise buyable points power" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        34: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel34 = new Decimal(1.05)
                effStackl34 = new Decimal(x)
                if (hasUpgrade('l', 13)) {effStackl34 = effStackl34.times(1.5)}

                return Decimal.pow(effBasel34, effStackl34)
            },
            display() { return "multiply metaprestige points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setsuperprestigeAmount(this.layer, this.id, getsuperprestigeAmount(this.layer, this.id).add(1))
            },
        },
        35: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effBasel35 = new Decimal(1.01)
                effStackl35 = new Decimal(x).pow(0.5)
                if (hasUpgrade('l', 13)) {effStackl35 = effStackl35.times(1.5)}

                return Decimal.pow(effBasel35, effStackl35)
            },
            display() { return "raise metaprestige points" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setsuperprestigeAmount(this.layer, this.id, getsuperprestigeAmount(this.layer, this.id).add(1))
            },
        },
        36: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effMaxl36 = new Decimal(0.5)
                effStackl36 = Decimal.dOne.sub(new Decimal(x).div(-1000).exp()) //exponential approach


                return Decimal.times(effMaxl36, effStackl36)
            },
            display() { return "raise metaprestige points power" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setsuperprestigeAmount(this.layer, this.id, getsuperprestigeAmount(this.layer, this.id).add(1))
            },
        },
        37: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effMaxl37 = new Decimal(1.03)
                effStackl37 = new Decimal(x) 
                if (hasUpgrade('l', 13)) {effStackl37 = effStackl37.times(1.5)}

                return Decimal.pow(effMaxl37, effStackl37)
            },
            display() { return "multiply points gain" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setsuperprestigeAmount(this.layer, this.id, getsuperprestigeAmount(this.layer, this.id).add(1))
            },
        },
        38: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effMaxl38 = new Decimal(8)
                effStackl38 = Decimal.dOne.sub(new Decimal(x).div(-240).exp()) //exponential approach

                return Decimal.times(effMaxl38, effStackl38)
            },
            display() { return "lower second points softcap" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setsuperprestigeAmount(this.layer, this.id, getsuperprestigeAmount(this.layer, this.id).add(1))
            },
        },
        39: {
            unlocked() {return false},
            cost(x) {

                return Decimal.dInf
            },
            effect(x) {
                effMaxl39 = new Decimal(40)
                effStackl39 = Decimal.dOne.sub(new Decimal(x).div(-1200).exp()) //exponential approach

                return Decimal.times(effMaxl39, effStackl39)
            },
            display() { return "lower third points softcap" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setsuperprestigeAmount(this.layer, this.id, getsuperprestigeAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {


            fullDisplay: "<big> <b> lootbox upgrade 11 </b> </big> <br> multiplies the random amount in the lootbox by 2 <br> <br> <br> Req: 3.25 points",
            canAfford() {return player.points.gte(3.25)},

            effect() {

                return new Decimal(2)
            },

            unlocked() {return true}
        },
        12: {


            fullDisplay: "<big> <b> lootbox upgrade 12 </b> </big> <br> multiplies the deterministic amount in the lootbox by 3 <br> <br> <br> Req: 3.5 points",
            canAfford() {return player.points.gte(3.5)},

            effect() {

                return new Decimal(3)
            },

            unlocked() {return true}
        },
        13: {


            fullDisplay: "<big> <b> lootbox upgrade 13 </b> </big> <br> multiplies the effects of items opened from lootboxes by 1.5 <br> <br> <br> Req: 3.75 points",
            canAfford() {return player.points.gte(3.75)},

            effect() {

                return new Decimal(1.5)
            },

            unlocked() {return true}
        },

    },
})