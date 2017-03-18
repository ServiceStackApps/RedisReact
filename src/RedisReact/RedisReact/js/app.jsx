var App = React.createClass({
    mixins: [
        DebugLogMixin,
        Router.Navigation,
        Router.State,
        Reflux.listenTo(SearchStore, "onSearchUpdated"),
        Reflux.listenTo(ConnectionStore, "onConnection"),
        Reflux.listenTo(ConsoleStore, "onConsole")
    ],
    getInitialState: function() {
        return { connection: null, query: this.getQuery().q };
    },
    onConnection: function (connection) {
        this.setState({ connection: connection });
    },
    onSearchUpdated: function(search){
        if (search.text != this.state.query) {
            this.setState({ query: search.text });
        }
    },
    onSearchFocus: function (e) {
        this.transitionTo('search', null, { q: e.target.value });
    },
    onSearchKeyUp: function (e) {
        if (e.target.value != this.state.query) {
            this.setState({ query: e.target.value });
            this.replaceWith("search", null, { q: e.target.value });
        }
    },
    clearSearch: function(e){
        this.refs.txtSearch.getDOMNode().focus();
        this.replaceWith("search", null, { q: null });
    },
    render: function () {
        var Connection = <b>not connected</b>;
        var conn = this.state.connection;
        if (conn != null) {
            Connection = <b>{conn.host}:{conn.port} db={conn.db}</b>;
        }

        var ClearSearch = null;
        if (this.state.query) {
            ClearSearch = (<div className="clear-search">
                <span className="octicon octicon-x" onClick={this.clearSearch} title="clear search"></span>
            </div>);
        }

        return (
            <div>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <Link to="app" title="Home" className="navbar-brand">
                                <img id="redislogo" alt="Brand" src="/img/redis-logo.png" />
                            </Link>
                            <h1>Redis React</h1>
                            <Link id="connection" to="connections" title="Connections">
                                <span className="octicon octicon-radio-tower"></span>
                                {Connection}
                            </Link>
                        </div>
                        <form id="formSearch" className="navbar-form navbar-left" role="search">
                            <div>
                                {ClearSearch}
                                <span className="octicon octicon-search"></span>
                                <input ref="txtSearch" id="txtSearch" type="text" className="input-lg" 
                                       placeholder="Search Keys" 
                                       spellCheck="false" autoComplete="off"
                                       onFocus={this.onSearchFocus} 
                                       onChange={this.onSearchKeyUp}
                                       value={this.state.query} />
                            </div>
                        </form>
                        <div className="nav navbar-nav navbar-right">
                            <a href="https://servicestack.net" title="servicestack.net" target="_blank">
                                <img id="logo" alt="Brand" src="/img/logo-32.png" />
                            </a>
                        </div>
                    </div>
                </nav>
                <div>
                    {
                    //<div id="sidebar">
                    //    <ul id="menu">
                    //        <li className="list-group-item">
                    //        </li>
                    //    </ul>
                    //</div>
                    }
                    <div id="body">
                        {/* this is the important part */}
                        <RouteHandler />
                    </div>
                    <Console />
                </div>
                <div id="poweredby"><a href="https://servicestack.net" target="_blank">servicestack.net</a></div>
            </div>
      );
    }
});

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="connections" handler={Connections} />
    <Route name="search" handler={Search} />
    <Route name="keys" handler={KeyViewer} />
    <DefaultRoute handler={Dashboard} />
  </Route>
);

Router.run(routes, function (Handler, state) {
    React.render(<Handler />, document.body);

    var name = state.pathname.substring(1);
    document.body.className = (name || 'home') + '-active';
});


Actions.viewInfo();
Actions.loadConnection();