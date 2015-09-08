var Router = ReactRouter;

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var Actions = Reflux.createActions([
    'viewInfo',
    'loadConnection',
    'search',
    'loadKey',
    'loadRelatedKeyInfo'
]);

var SEPARATORS = [':', '.', '/'];

function findPotentialKeys(o) {
    var keys = [];
    if (typeof o == 'object') {
        for (var k in o) {
            if (k.length > 2 && k.endsWith('Id') && k.indexOf("'") == -1) {
                var v = o[k];
                var ref = "urn:" + k.substring(0, k.length - 2).toLowerCase() + ":" + v;
                keys.push(ref);
            }
        }
    }
    return keys;
}

function isJsonObject(s) {
    if (typeof s != 'string')
        return false;

    var isComplexJson = s.indexOf('{') >= 0 || s.indexOf('[') >= 0;
    return isComplexJson;
}

//from jsonviewer
function date(s) { return new Date(parseFloat(/Date\(([^)]+)\)/.exec(s)[1])); }
function pad(d) { return d < 10 ? '0'+d : d; }
function dmft(d) { return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()); }
function valueFmt(v) {
    if (typeof v != "string")
        return v;

    var s = v.startsWith('/Date(') ? dmft(date(v)) : v;
    return s;
}

var SearchStore = Reflux.createStore({
    init: function () {
        this.listenTo(Actions.search, this.search);
        this.text = null;
        this.query = null;
        this.results = [];
    },
    search: function (searchText) {
        var $this = this;
        this.text = searchText;
        this.query = this.text || "*";

        var patternChars = ['*', '?', '[', ']'];
        var hasPattern = patternChars.some(function (c) {
            return $this.query.indexOf(c) >= 0;
        });

        if (this.query.endsWith('$')) {
            this.query = this.query.substring(0, this.query.length - 1);
            hasPattern = true;
        }

        if (!hasPattern)
            this.query += "*";

        Redis.search(this.query)
            .done(function (r) {
                if ($this.text != searchText) 
                    return;
                
                $this.results = r.results || [];
                $this.trigger({text: $this.text, query: $this.query, results: $this.results});
            });
    }
});

var InfoStore = Reflux.createStore({
    init: function () {
        this.listenTo(Actions.viewInfo, this.viewInfo);
        this.info = null;
    },
    viewInfo: function () {
        var $this = this;
        Redis.info()
            .done(function (r) {
                $this.trigger($this.info = r);
            });
    }
});

var ConnectionStore = Reflux.createStore({
    init: function () {
        this.listenTo(Actions.loadConnection, this.loadConnection);
        this.connection = null;
    },
    loadConnection: function () {
        var $this = this;
        Redis.getConnection()
            .done(function (r) {
                $this.trigger($this.connection = r);
            });
    }
});

var KeyStore = Reflux.createStore({
    init: function() {
        this.listenTo(Actions.loadKey, this.loadKey);
        this.listenTo(Actions.loadRelatedKeyInfo, this.loadRelatedKeyInfo);
        this.cache = {};
    },
    loadKey: function(id, type) {
        if (this.cache[id]) {
            this.trigger(this.cache[id]);
        }

        var $this = this;
        if (type == 'string') {
            Redis.getString(id)
                .done(function(r) {
                    $this.trigger($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'list') {
            Redis.getAllItemsFromList(id)
                .done(function(r) {
                    $this.trigger($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'set') {
            Redis.getAllItemsFromSet(id)
                .done(function(r) {
                    $this.trigger($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'zset') {
            Redis.getAllItemsFromSortedSet(id)
                .done(function(r) {
                    $this.trigger($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'hash') {
            Redis.getAllItemsFromHash(id)
                .done(function(r) {
                    $this.trigger($this.cache[id] = { id: id, type: type, value: r });
                });
        }
    },
    loadRelatedKeyInfo: function(result) {
        var $this = this;

        if (isJsonObject(result.value)) {
            try {
                var o = JSON.parse(result.value);
                var refKeys = findPotentialKeys(o);
                if (refKeys.length > 0) {
                    Redis.getStringValues(refKeys)
                        .then(function(r) {
                            result.relatedKeys = r;
                            $this.trigger(result);
                        });
                }
            } catch (e){}
        }

        var q = SearchStore.query;
        if (q && q != "*") {
            result.parent = q;
            Redis.cachedSearch(result.parent)
                .done(function(r) {
                    result.similarKeys = r.results;
                    $this.trigger(result);
                });
            return;
        }

        var id = result.id;
        var lastSep = Math.max.apply(null, SEPARATORS.map(function(x) {
            return id.lastIndexOf(x);
        }));
        if (lastSep >= 0) {
            result.parent = id.substring(0, lastSep + 1) + '*';
            Redis.cachedSearch(result.parent)
                .done(function(r) {
                    result.similarKeys = r.results;
                    $this.trigger(result);
                });
        }
    }
});
