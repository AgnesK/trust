var PD = {};
PD.COOPERATE = "COOPERATE";
PD.CHEAT = "CHEAT";

PD.PAYOFFS_DEFAULT = {
	P:  0, 	// punishment: neither of you get anything
	S: -1, 	// sucker: you put in coin, other didn't.
	R:  2, 	// reward: you both put 1 coin in, both got 3 back
	T:  3 	// temptation: you put no coin, got 3 coins anyway
};

PD.PAYOFFS = JSON.parse(JSON.stringify(PD.PAYOFFS_DEFAULT));

PD.getPayoffs = function(move1, move2){
	var payoffs = PD.PAYOFFS;
	if(move1==PD.CHEAT && move2==PD.CHEAT) return [payoffs.P, payoffs.P]; // both punished
	if(move1==PD.COOPERATE && move2==PD.CHEAT) return [payoffs.S, payoffs.T]; // sucker - temptation
	if(move1==PD.CHEAT && move2==PD.COOPERATE) return [payoffs.T, payoffs.S]; // temptation - sucker
	if(move1==PD.COOPERATE && move2==PD.COOPERATE) return [payoffs.R, payoffs.R]; // both rewarded
};

PD.playOneGame = function(strategyA, strategyB){

    var playerA = new player(strategyA);
    var playerB = new player(strategyB);

	// Make your moves!
	var A = playerA.play();
	var B = playerB.play();
	
	// Get payoffs
	var payoffs = PD.getPayoffs(A,B);

	// // Remember own & other's moves (or mistakes)
	// playerA.remember(A, B);
	// playerB.remember(B, A);

	// Add to scores (only in tournament?)
	// playerA.addPayoff(payoffs[0]);
	// playerB.addPayoff(payoffs[1]);

	// Return the payoffs...
	console.log(payoffs)
    document.getElementById("result").innerHTML = payoffs;
	return payoffs;
};

PD.playRepeatedGame = function(playerA, playerB, turns){

	// I've never met you before, let's pretend
	playerA.resetLogic();
	playerB.resetLogic();

	// Play N turns
	var scores = {
		totalA:0,
		totalB:0,
		payoffs:[]
	};
	for(var i=0; i<turns; i++){
		var p = PD.playOneGame(playerA, playerB);
		scores.payoffs.push(p);
		scores.totalA += p[0];
		scores.totalB += p[1];
	}

	// Return the scores...
	return scores;

};

PD.playOneTournament = function(agents, turns){

	// Reset everyone's coins
	for(var i=0; i<agents.length; i++){
		agents[i].resetCoins();
	}

	// Round robin!
	for(var i=0; i<agents.length; i++){
		var playerA = agents[i];
		for(var j=i+1; j<agents.length; j++){
			var playerB = agents[j];
			PD.playRepeatedGame(playerA, playerB, turns);
		}	
	}

};

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

const strategies = {};

function Logic_all_d(){
	var self = this;
	self.play = function(){
		return PD.CHEAT;
	};
	self.remember = function(own, other){
		// nah
	};
}
strategies.all_d = Logic_all_d;

function Logic_all_c(){
	var self = this;
	self.play = function(){
		return PD.COOPERATE;
	};
	self.remember = function(own, other){
		// nah
	};
}
strategies.all_c = Logic_all_c;

function Logic_random(){
	var self = this;
	self.play = function(){
		return (Math.random()>0.5 ? PD.COOPERATE : PD.CHEAT);
	};
	self.remember = function(own, other){
		// nah
	};
}
strategies.random = Logic_random;

function Logic_tft(){
    var self = this;
    var otherMove = PD.COOPERATE;
    self.play = function(){
        return otherMove;
    };
    self.remember = function(own, other){
        otherMove = other;
    };
}
strategies.tft = Logic_tft;

function Logic_grudge(){
    var self = this;
    var everCheatedMe = false;
    self.play = function(){
        if(everCheatedMe) return PD.CHEAT;
        return PD.COOPERATE;
    };
    self.remember = function(own, other){
        if(other==PD.CHEAT) everCheatedMe=true;
    };
}
strategies.grudge = Logic_grudge;

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

function player(strategy) {

    var self = this;
    self.strategyName = strategy;

    // Number of coins
    self.coins = 0;
    self.addPayoff = function (payoff) {
        self.coins += payoff;
        self.updateScore();
    };

    // What's the play logic?
    const LogicClass = strategies[self.strategyName];
    self.logic = new LogicClass();
    self.play = function () {
        return self.logic.play();
    };
    self.remember = function (own, other) {
        self.logic.remember(own, other);
    };
}
