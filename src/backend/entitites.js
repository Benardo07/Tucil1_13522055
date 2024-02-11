class TokenInfo {
    constructor(value, pos) {
      this.value = value;
      this.pos = pos;
    }
  }
  
  class Position {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }
  
  class Sequence {
    constructor(tokens, reward) {
      this.tokens = tokens;
      this.reward = reward;
    }
  }
  
  module.exports = { TokenInfo, Position, Sequence };
  