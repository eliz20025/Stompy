function entity(x, y, w, h) {
    this.x = x;
    this.y = y;
	
    this.width = w;
    this.height = h;
	
	this.halfWidth = this.width / 2;
	this.halfHeight = this.height /2;
	
	this.vx = 0;
	this.vy = 0;
	
    this.getLeft = function() {
        return this.x;
    };

    this.getTop = function() {
        return this.y;
    };

    this.getRight = function() {
        return this.x + this.width;
    };

    this.getBottom = function() {
        return this.y + this.height;
    };

	this.getMidX = function() {
	return this.x + this.halfWidth;
	}; 
	
	this.getMidY = function() {
	return this.y + this.halfHeight;
	}; 
	
    this.setLeft = function(val) {
        this.x = val;
    };

    this.setTop = function(val) {
        this.y = val;
    };

    this.setRight = function(val) {
        this.x = val - this.width;
    };

    this.setBottom = function(val) {
        this.y = val - this.height;
    };
	this.setMidX = function(val){
		this.x = val - this.halfWidth;
	};	
		
	this.setMidY = function(val){
		this.y = val - this.halfHeight;
	};	
}
