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
    search: function (query) {
        return $.ajax({
            url: "/search-redis",
            dataType: "json",
            data: { query: query }
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