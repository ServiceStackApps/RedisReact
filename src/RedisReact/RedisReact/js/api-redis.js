var Redis = bindAll({
    call: function (args) {
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
    execCommandString: function (cmd) {
        var $this = this;
        var args = this.parseCommandString(cmd);
        return Redis.call(args)
            .then(function (r) {
                return $this.toObject(r.result);
            });
    },
    toObject: function (r) {
        if (!r)
            return null;

        if (r.children && r.children.length > 0) {
            var to = [];
            for (var i = 0, len = r.children.length; i < len; i++) {
                var child = r.children[i];
                var value = child.text || this.toObject(child.children);
                to.push(value);
            }
            return to;
        }
        return r.text;
    },
    parseCommandString: function(cmd) {
        var args = [];
        var lastPos = 0;
        for (var i = 0; i < cmd.length; i++) {
            var c = cmd[i];
            if (c == "{" || c == "[") { 
                break; //stop splitting args if value is complex type
            }
            if (c == " ") {
                var arg = cmd.substring(lastPos, i);
                args.push(arg);
                lastPos = i + 1;
            }
        }
        args.push(cmd.substring(lastPos));
        return args;
    },
    getConnection: function () {
        return $.ajax({
            url: "/connection",
            dataType: "json"
        });
    },
    search: function (query) {
        var $this = this;
        return $.ajax({
            url: "/search-redis",
            dataType: "json",
            data: { query: query }
        })
        .then(function (r) {
            return $this.searchCache[query] = r;
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
            .then(function (r) {
                return $this.searchCache[query] = r;
            });
    },
    getStringValues: function (keys) {
        var args = keys.slice(0);
        args.unshift('MGET');
        return this.call(args)
            .then(function (r) {
                var to = {};
                for (var i = 0; i < keys.length; i++) {
                    to[keys[i]] = r.result.children[i].text;
                }
                return to;
            });
    },
    exists: function (keys) {
        return this.getStringValues(keys)
            .then(function (r) {
                var to = {};
                for (var k in r) {
                    to[k] = !!r[k];
                }
                return to;
            });
    },
    info: function () {
        return this.call(['INFO'])
            .then(function (r) {
                var s = r.result.text;

                var to = {}, o = {}, lines = s.split('\n');
                lines.forEach(function (line) {
                    if (!line.trim())
                        return;
                    if (line.startsWith("# ")) {
                        var group = line.substring(2);
                        to[group] = o = {};
                    } else {
                        var parts = $.ss.splitOnFirst(line, ':');
                        o[parts[0]] = parts[1];
                    }
                });

                return to;
            });
    },
    getString: function (key) {
        return this.call(['GET', key])
            .then(function (r) {
                var s = r.result.text;
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
        var children = r.result && r.result.children || [];
        var to = children.map(function (x) {
            return x.text;
        });
        return to;
    },
    asKeyValues: function (r) {
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
    Object.keys(o).forEach(function (k) {
        if (typeof o[k] == 'function')
            o[k] = o[k].bind(o);
    });
    return o;
}