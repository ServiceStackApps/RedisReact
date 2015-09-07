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
    'loadSimilarKeys'
]);

var SearchStore = Reflux.createStore({
    init: function () {
        this.listenTo(Actions.search, this.search);
        this.searchResults = [];
    },
    search: function (searchText) {
        if (!searchText)
            searchText = "*";

        var patternChars = ['*', '?', '[', ']'];
        var hasPattern = patternChars.some(function (c) {
            return searchText.indexOf(c) >= 0;
        });

        if (searchText.endsWith('$')) {
            searchText = searchText.substring(0, searchText.length - 1);
            hasPattern = true;
        }

        if (!hasPattern)
            searchText += "*";

        var $this = this;
        Redis.search(searchText)
            .done(function (r) {
                $this.trigger($this.searchResults = r.results || []);
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
        this.listenTo(Actions.loadSimilarKeys, this.loadSimilarKeys);
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
    loadSimilarKeys: function(result) {
        var separators = [':', '.', '/'];

        var id = result.id;
        var lastSep = Math.max.apply(null, separators.map(function(x) {
            return id.lastIndexOf(x);
        }));
        if (lastSep >= 0) {
            var $this = this;
            result.parent = id.substring(0, lastSep + 1);
            Redis.cachedSearch(result.parent + '*')
                .done(function(r) {
                    result.similarKeys = r.results;
                    $this.trigger(result);
                });
        }
    }
});
