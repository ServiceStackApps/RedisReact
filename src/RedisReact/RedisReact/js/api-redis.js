var Redis = bindAll({
    call: function(args) {
        var request = {
            args: args
        };
        return $.ajax({
            url: "/call-redis",
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(request)
        });
    },
    getConnection: function () {
        return $.ajax({
            url: "/connection",
            dataType: "json"
        });
    },
    search: function (query) {
        return $.ajax({
            url: "/search-redis",
            dataType: "json",
            data: { query: query }
        });
    },
    searchCache: {},
    cachedSearch: function (query) {
        if (this.searchCache[query]) {
            var deferred = $.Deferred();
            deferred.resolve(this.searchCache[query]);
            return deferred.promise();
        }
        var $this = this;
        return this.search(query)
            .then(function(r) {
                return $this.searchCache[query] = r;
            });
    },
    exists: function (keys) {
        var args = keys.slice(0);
        args.unshift('MGET');
        return this.call(args)
            .then(function(r) {
                var to = {};
                for (var i = 0; i < keys.length; i++) {
                    to[keys[i]] = !!r.redisText.children[i].text;
                }
                return to;
            });
    },
    existsCache: {},
    cachedExists: function (keys) {
        var to = {};
        var missingKeys = [];
        var cache = this.existsCache;
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key in cache) {
                to[key] = cache[key];
            } else {
                missingKeys.push(key);
            }
        }

        if (missingKeys.length == 0) {
            var deferred = $.Deferred();
            deferred.resolve(to);
            return deferred.promise();
        }

        return this.exists(missingKeys)
            .then(function (r) {
                for (var k in r) {
                    cache[k] = to[k] = r[k];
                }
                return to;
            });
    },
    info: function () {
        return this.call(['INFO'])
            .then(function(r) {
                var s = r.redisText.text;

                var to = {}, o = {}, lines = s.split('\n');
                lines.forEach(function(line) {
                    if (!line.trim())
                        return;
                    if (line.startsWith("# ")) {
                        var group = line.substring(2);
                        to[group] = o = {};
                    } else {
                        var parts = $.ss.splitOnFirst(line,':');
                        o[parts[0]] = parts[1];
                    }
                });

                return to;
            });
    },
    getString: function(key) {
        return this.call(['GET', key])
            .then(function(r) {
                var s = r.redisText.text;
                return s;
            });
    },
    getAllItemsFromList: function (key) {
        var $this = this;
        return this.call(['LRANGE', key, '0', '-1'])
            .then(function (r) {
                return $this.asList(r);
            });
    },
    getAllItemsFromSet: function (key) {
        var $this = this;
        return this.call(['SMEMBERS', key])
            .then(function (r) {
                return $this.asList(r);
            });
    },
    getAllItemsFromSortedSet: function (key) {
        var $this = this;
        return this.call(['ZRANGE', key, '0', '-1', 'WITHSCORES'])
            .then(function (r) {
                return $this.asKeyValues(r);
            });
    },
    getAllItemsFromHash: function (key) {
        var $this = this;
        return this.call(['HGETALL', key])
            .then(function (r) {
                return $this.asKeyValues(r);
            });
    },
    asList: function (r) {
        var children = r.redisText && r.redisText.children || [];
        var to = children.map(function (x) {
            return x.text;
        });
        return to;
    },
    asKeyValues: function(r) {
        var list = this.asList(r);
        var to = {};
        for (var i = 0; i < list.length; i += 2) {
            var key = list[i];
            var val = list[i + 1];
            to[key] = val;
        }
        return to;
    }
});

function bindAll(o) {
    Object.keys(o).forEach(function(k) {
        if (typeof o[k] == 'function')
            o[k] = o[k].bind(o);
    });
    return o;
}