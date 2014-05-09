module.exports = function mergeAll(concurrent) {
    var onNext = this.onNext.bind(this),
        onError = this.onError.bind(this),
        onCompleted = this.onCompleted.bind(this),
        buffer = [];
    
    var i = 0;
    
    if(typeof concurrent === 'undefined') {
        concurrent = Number.Infinity;
    }
    
    return this.extend(
        function(x) {
            
            var j = ++i;
            console.log("merge onNext", j);
            
            var upstream = this;
            
            if(upstream.length >= concurrent) {
                buffer.push(x);
                return;
            }
            
            upstream.add(x.subscribe(function(x){
                console.log("merge inner onNext", j);
                onNext(x);
            }, function(e) {
                console.log("merge inner onError", j);
                onError(e);
            }, function() {
                console.log("merge inner onCompleted", j);
                if(upstream.remove(this).length >= concurrent) {
                    return;
                } else if(buffer.length > 0) {
                    upstream.onNext(buffer.shift());
                } else if(upstream.length === 0 && upstream.stopped === true) {
                    upstream.onCompleted();
                }
            }));
        },
        null,
        function() {
            console.log("merge onCompleted");
            if(this.length === 0 && buffer.length === 0) {
                try {
                    onCompleted();
                } catch(e) {
                    throw e;
                }
            }
        }
    );
}

/*

module.exports = function mergeAll() {
    var onNext = this.onNext.bind(this),
        onError = this.onError.bind(this),
        onCompleted = this.onCompleted.bind(this);
    return this.lift({
        onNext: function(x) {
            var upstream = this;
            upstream.add(x.subscribe(onNext, onError, function onCompleted() {
                this.stopped = true;
                if(upstream.remove(this).length === 0 && upstream.stopped === true) {
                    upstream.onCompleted();
                }
            }));
        },
        onCompleted: function() {
            this.stopped = true;
            if(this.length === 0) {
                try {
                    onCompleted();
                } catch(e) {
                    throw e;
                }
            }
        }
    });
}

*/