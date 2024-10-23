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
        if (getClickableState('j', 12) == '') {setClickableState('j', 12, 0)}
        if (getClickableState('j', 13) == '') {setClickableState('j', 13, 0)}
        if (getClickableState('j', 14) == '') {setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))}
        if (getClickableState('j', 15) == '') {setClickableState('j', 15, 11.75)}
        return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "This layer cannot be reset" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
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
                clicksGoal = getClickableState('j', 15)*4800
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
        14: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 3}
        },
        15: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 4}
        },
        16: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 5}
        },
        17: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 6}
        },
        18: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 7}
        },
        19: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 8}
        },
        21: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 9}
        },
        22: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 10}
        },
        23: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 11}
        },
        24: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 12}
        },
        25: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 13}
        },
        26: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 14}
        },
        27: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 15}
        },
        28: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 16}
        },
        29: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 17}
        },
        31: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 18}
        },
        32: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 19}
        },
        33: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 20}
        },
        34: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 21}
        },
        35: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 22}
        },
        36: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 23}
        },
        37: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 24}
        },
        38: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 25}
        },
        39: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 26}
        },
    }
})

addLayer("g", {
    name: "in-game shop", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
    row: 0, // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > 1.5) {setBuyableAmount('g', 51, Decimal.dZero)}
        if (layers[resettingLayer].row > 1.5) {setBuyableAmount('g', 52, Decimal.dZero)}
        if (layers[resettingLayer].row > 1.5) {setBuyableAmount('g', 53, Decimal.dZero)}
        if (layers[resettingLayer].row > 2.5) {setBuyableAmount('g', 61, Decimal.dZero)}
        if (layers[resettingLayer].row > 2.5) {setBuyableAmount('g', 62, Decimal.dZero)}
        if (layers[resettingLayer].row > 2.5) {setBuyableAmount('g', 63, Decimal.dZero)}
        return;
    },
    layerShown(){return true},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(0.49)
            },
            effect(x) {
                baseGems1 = new Decimal(60)
                purchaseMultiplier1 = Decimal.div(this.cost(), 0.49)
                gemMultiplier1 = Decimal.log10(purchaseMultiplier1).div(6.2).add(1).times(60).times(purchaseMultiplier1).div(baseGems1)

                return Decimal.times(baseGems1, gemMultiplier1).floor()
            },
            title() { return "gems pack 1"},
            display() { 
                text = "gives "+format(baseGems1, 0)+" gems "
                if (gemMultiplier1.gt(1)) {text += "with "+format(gemMultiplier1.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(0.99)
            },
            effect(x) {
                baseGems2 = new Decimal(120)
                purchaseMultiplier2 = Decimal.div(this.cost(), 0.49)
                gemMultiplier2 = Decimal.log10(purchaseMultiplier2).div(6.2).add(1).times(60).times(purchaseMultiplier2).div(baseGems2)

                return Decimal.times(baseGems2, gemMultiplier2).floor()
            },
            title() { return "gems pack 2"},
            display() { 
                text = "gives "+format(baseGems2, 0)+" gems "
                if (gemMultiplier2.gt(1)) {text += "with "+format(gemMultiplier2.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(1.99)
            },
            effect(x) {
                baseGems3 = new Decimal(240)
                purchaseMultiplier3 = Decimal.div(this.cost(), 0.49)
                gemMultiplier3 = Decimal.log10(purchaseMultiplier3).div(6.2).add(1).times(60).times(purchaseMultiplier3).div(baseGems3)

                return Decimal.times(baseGems3, gemMultiplier3).floor()
            },
            title() { return "gems pack 3"},
            display() { 
                text = "gives "+format(baseGems3, 0)+" gems "
                if (gemMultiplier3.gt(1)) {text += "with "+format(gemMultiplier3.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(4.99)
            },
            effect(x) {
                baseGems4 = new Decimal(600)
                purchaseMultiplier4 = Decimal.div(this.cost(), 0.49)
                gemMultiplier4 = Decimal.log10(purchaseMultiplier4).div(6.2).add(1).times(60).times(purchaseMultiplier4).div(baseGems4)

                return Decimal.times(baseGems4, gemMultiplier4).floor()
            },
            title() { return "gems pack 4"},
            display() { 
                text = "gives "+format(baseGems4, 0)+" gems "
                if (gemMultiplier4.gt(1)) {text += "with "+format(gemMultiplier4.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(9.99)
            },
            effect(x) {
                baseGems5 = new Decimal(1200)
                purchaseMultiplier5 = Decimal.div(this.cost(), 0.49)
                gemMultiplier5 = Decimal.log10(purchaseMultiplier5).div(6.2).add(1).times(60).times(purchaseMultiplier5).div(baseGems5)

                return Decimal.times(baseGems5, gemMultiplier5).floor()
            },
            title() { return "gems pack 5"},
            display() { 
                text = "gives "+format(baseGems5, 0)+" gems "
                if (gemMultiplier5.gt(1)) {text += "with "+format(gemMultiplier5.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(19.99)
            },
            effect(x) {
                baseGems6 = new Decimal(2400)
                purchaseMultiplier6 = Decimal.div(this.cost(), 0.49)
                gemMultiplier6 = Decimal.log10(purchaseMultiplier6).div(6.2).add(1).times(60).times(purchaseMultiplier6).div(baseGems6)

                return Decimal.times(baseGems6, gemMultiplier6).floor()
            },
            title() { return "gems pack 6"},
            display() { 
                text = "gives "+format(baseGems6, 0)+" gems "
                if (gemMultiplier6.gt(1)) {text += "with "+format(gemMultiplier6.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(49.99)
            },
            effect(x) {
                baseGems7 = new Decimal(6000)
                purchaseMultiplier7 = Decimal.div(this.cost(), 0.49)
                gemMultiplier7 = Decimal.log10(purchaseMultiplier7).div(6.2).add(1).times(60).times(purchaseMultiplier7).div(baseGems7)

                return Decimal.times(baseGems7, gemMultiplier7).floor()
            },
            title() { return "gems pack 7"},
            display() { 
                text = "gives "+format(baseGems7, 0)+" gems "
                if (gemMultiplier7.gt(1)) {text += "with "+format(gemMultiplier7.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(99.99)
            },
            effect(x) {
                baseGems8 = new Decimal(12000)
                purchaseMultiplier8 = Decimal.div(this.cost(), 0.49)
                gemMultiplier8 = Decimal.log10(purchaseMultiplier8).div(6.2).add(1).times(60).times(purchaseMultiplier8).div(baseGems8)

                return Decimal.times(baseGems8, gemMultiplier8).floor()
            },
            title() { return "gems pack 8"},
            display() { 
                text = "gives "+format(baseGems8, 0)+" gems "
                if (gemMultiplier8.gt(1)) {text += "with "+format(gemMultiplier8.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(199.99)
            },
            effect(x) {
                baseGems9 = new Decimal(24000)
                purchaseMultiplier9 = Decimal.div(this.cost(), 0.49)
                gemMultiplier9 = Decimal.log10(purchaseMultiplier9).div(6.2).add(1).times(60).times(purchaseMultiplier9).div(baseGems9)

                return Decimal.times(baseGems9, gemMultiplier9).floor()
            },
            title() { return "gems pack 9"},
            display() { 
                text = "gives "+format(baseGems9, 0)+" gems "
                if (gemMultiplier9.gt(1)) {text += "with "+format(gemMultiplier9.sub(1).times(100), 0)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(20)
            },
            effect(x) {

                return new Decimal(1)
            },
            title() { return "1 hour timelapse"},
            display() { return "instantly gain "+format(this.effect(), 0)+" hours of offline time but loses currently owned offline time <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                const timelapseobject1 = {remain: 3600}
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player.offTime = timelapseobject1
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(50)
            },
            effect(x) {


                return new Decimal(4)
            },
            title() { return "4 hour timelapse"},
            display() { return "instantly gain "+format(this.effect(), 0)+" hours of offline time but loses currently owned offline time <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                const timelapseobject2 = {remain: 14400}
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player.offTime = timelapseobject2
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(150)
            },
            effect(x) {


                return new Decimal(24)
            },
            title() { return "24 hour timelapse"},
            display() { return "instantly gain "+format(this.effect(), 0)+" hours of offline time but loses currently owned offline time <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                const timelapseobject3 = {remain: 86400}
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                player.offTime = timelapseobject3
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(50).add(x*10)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "double prestige points"},
            display() { return "instantly double your prestige points  <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('p', player.p.points)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(50).add(x*10)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "free prestige buyable 16"},
            display() { return "instantly get 1 free level on prestige buyable 16 that loses on reset <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(50).add(x*10)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "free prestige buyable 17"},
            display() { return "instantly get 1 free level on prestige buyable 17 that loses on reset <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        61: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(100).add(x*20)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "double metaprestige points"},
            display() { return "instantly double your metaprestige points  <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('mp', player.mp.points)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        62: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(100).add(x*20)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "double buyable points"},
            display() { return "instantly double your buyable points  <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('bp', player.bp.points)
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        63: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(100).add(x*20)
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "double superprestige points"},
            display() { return "instantly double your superprestige points  <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('sp', player.sp.points)
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
    color: "#6cdb40",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addp = new Decimal(0)
        addp = addp.add(buyableEffect('p', 13))
        addp = addp.add(buyableEffect('mp', 13))

        multp = new Decimal(2.5)
        multp = multp.times(buyableEffect('p', 14))
        multp = multp.times(buyableEffect('mp', 14))
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1)
        expp = expp.add(buyableEffect('p', 16))
        expp = expp.add(buyableEffect('mp', 19))

        exp2p = new Decimal(0.6)
        exp2p = exp2p.add(buyableEffect('p', 17))
        exp2p = exp2p.add(buyableEffect('mp', 21))
        exp2p = exp2p.min(1)
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
                effStackp16 = new Decimal(x).add(getBuyableAmount('g', 52))

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
                effStackp17 = new Decimal(x).add(getBuyableAmount('g', 53))

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
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addmp = new Decimal(0)
        addmp = addmp.add(buyableEffect('mp', 15))

        multmp = new Decimal(0.01)
        multmp = multmp.times(buyableEffect('mp', 16))
        return multmp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expmp = new Decimal(0.6)
        //expsp = expp.times(buyableEffect('p', 16))

        exp2mp = new Decimal(0.6)
        //exp2sp = exp2sp.add(buyableEffect('p', 17))
        return expmp
    },
    getResetGain() {
        mpp = player.p.points.add(addmp).times(multmp).pow(expmp)
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
        {key: "s", description: "S: Reset for metaprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
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
            title() { return "metaprestige buyable 11"},
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
            title() { return "metaprestige buyable 12"},
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
            title() { return "metaprestige buyable 13"},
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
            title() { return "metaprestige buyable 14"},
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
            title() { return "metaprestige buyable 15"},
            display() { return "add base metaprestige point gain by "+format(effBasesp15)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp15)+" <br> effect: "+format(this.effect())},
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
            title() { return "metaprestige buyable 16"},
            display() { return "multiply metaprestige point gain by "+format(effBasesp16)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp16)+" <br> effect: "+format(this.effect())},
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
            title() { return "metaprestige buyable 17"},
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
            title() { return "metaprestige buyable 18"},
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
            title() { return "metaprestige buyable 19"},
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
            title() { return "metaprestige buyable 21"},
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
        //addbp = addsp.add(buyableEffect('mp', 15))

        multbp = new Decimal(0.025)
        //multbp = multsp.times(buyableEffect('mp', 16))
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
            display() { return "root the metaprestige buyables cost by "+format(effBasebp16)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp16)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
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
        //addbp = addsp.add(buyableEffect('mp', 15))

        multsp = new Decimal(0.333333333333333)
        //multbp = multsp.times(buyableEffect('mp', 16))
        return multsp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expsp = new Decimal(2.5)
        //expbp = expp.times(buyableEffect('p', 16))

        exp2sp = new Decimal(0.6)
        //exp2sp = exp2sp.add(buyableEffect('p', 17))
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
        {key: "b", description: "B: Reset for buyable points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
    },
})