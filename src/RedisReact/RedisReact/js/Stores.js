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
    'loadRelatedKeyInfo',
    'setConsole',
    'logEntry',
    'clearLogs',
    'addToHistory',
    'nextHistory'
]);

var SEPARATORS = [':', '.', '/'];
var Keys = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    T: 84
};

var DebugLogMixin = {
    componentWillUpdate: function(nextProps, nextState){
        //console.log("componentWillUpdate:", nextProps, nextState);
    }    
};

var SettingsStore = Reflux.createStore({
    init: function () {
        this.appRawMode = false;
        document.addEventListener('keyup', this.globalKeyUp);
    },
    notify: function() {
        this.trigger({ appRawMode: this.appRawMode });
    },
    globalKeyUp: function (e) {
        if (e.target && e.target.type == "text")
            return;

        var shortcutKeys = [Keys.T];
        if (e.altKey || e.ctrlKey || shortcutKeys.indexOf(e.which) == -1)
            return;

        if (e.which == Keys.T) {
            this.appRawMode = !this.appRawMode;
            this.notify();
        }
    }
});

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
                    $this.loadRelatedKeyInfo($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'list') {
            Redis.getAllItemsFromList(id)
                .done(function(r) {
                    $this.loadRelatedKeyInfo($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'set') {
            Redis.getAllItemsFromSet(id)
                .done(function(r) {
                    $this.loadRelatedKeyInfo($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'zset') {
            Redis.getAllItemsFromSortedSet(id)
                .done(function(r) {
                    $this.loadRelatedKeyInfo($this.cache[id] = { id: id, type: type, value: r });
                });
        } else if (type == 'hash') {
            Redis.getAllItemsFromHash(id)
                .done(function(r) {
                    $this.loadRelatedKeyInfo($this.cache[id] = { id: id, type: type, value: r });
                });
        }
    },
    loadRelatedKeyInfo: function(result) {
        var $this = this;

        var q = SearchStore.query;
        var id = result.id;
        var lastSep = Math.max.apply(null, SEPARATORS.map(function (x) {
            return id.lastIndexOf(x);
        }));
        result.query = lastSep >= 0
            ? id.substring(0, lastSep + 1) + '*'
            : q & q != "*" ? q : null;

        //Minimizing re-rendering till end reduces page jitter + increases perceived perf
        var count = 0;
        var trigger = function() {
            if (--count <= 0)
                $this.trigger(result);
        };

        if (isJsonObject(result.value)) {
            try {
                var o = JSON.parse(result.value);
                var refKeys = findPotentialKeys(o);
                if (refKeys.length > 0) {
                    count++;
                    Redis.getStringValues(refKeys)
                        .done(function(r) {
                            result.relatedKeys = r;
                            trigger();
                        });
                }
            } catch (e){}
        }

        if (result.query) {
            count++;
            Redis.cachedSearch(result.query)
                .done(function(r) {
                    result.similarKeys = r.results;
                    trigger();
                });
        }

        if (count == 0)
            trigger();
    }
});

var ConsoleStore = Reflux.createStore({
    init: function () {
        this.listenToMany(Actions);
        this.id = 0;
        this.command = null;
        this.logs = [];
        this.history = [];
        this.historyIndex = -1;
    },
    notify: function() {
        this.trigger({
            command: this.command,
            logs: this.logs,
            history: this.history,
            historyIndex: this.historyIndex
        });
    },
    addToHistory: function(cmd) {
        if (cmd != this.history[this.history.length - 1]) {
            this.history.push(cmd);
            this.historyIndex = this.history.length;
            this.notify();
        }
    },
    nextHistory: function(i) {
        var next = this.historyIndex + i;
        this.historyIndex = Math.max(Math.min(next, this.history.length), 0);
        this.command = this.history[this.historyIndex];
        this.notify();
    },
    clearLogs: function() {
        this.logs = [];
        this.notify();
    },
    logEntry: function(entry) {
        entry.id = ++this.id;
        this.logs.push(entry);
        this.command = null;
        this.notify();
    },
    setConsole: function(cmd) {
        this.command = cmd;
        this.notify();
    }
});
