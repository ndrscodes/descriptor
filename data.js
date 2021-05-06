Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

String.prototype.containsAny = function(haystack) {
    for(var i=0; i<haystack.length; i++){
        if(this.includes(haystack[i])){
            return true;
        }
    }
    return false;
};