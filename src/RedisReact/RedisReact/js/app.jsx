var Connections = React.createClass({
    mixins: [
        Reflux.listenTo(ConnectionStore, "onConnection")
    ],
    getInitialState: function () {
        return { connection: ConnectionStore.connection, successMessage: null };
    },
    onConnection: function (connection) {
        this.setState({ connection: connection });
    },
    selectText: function (e) {
        var target = e.target;
        setTimeout(function () {
            target.select();
        }, 0);
    },
    onChange: function (e) {
        var conn = this.state.connection || {};
        conn[e.target.name] = e.target.value;
        this.setState({ connection: conn });
    },
    onSubmit: function (e) {
        e.preventDefault();

        this.setState({ successMessage: null });

        var $this = this;
        $(e.target).ajaxSubmit({
            onSubmitDisable: $("#btnConnect"),
            success: function () {
                $this.setState({ successMessage: "Connection was changed" });
                Actions.loadConnection();
            }
        });
    },
    render: function () {
        var conn = this.state.connection;
        return (
          <div id="connections-page">
            <div className="content">
                <form id="formConnection" className="form-inline" onSubmit={this.onSubmit}
                      action="/connection">
                    <h2>Redis Connection</h2>
                    <div className="form-group">
                        <label className="octicon octicon-radio-tower"></label>
                        <input id="txtHost" name="host" type="text" className="form-control" placeholder="127.0.0.1" spellCheck="false"
                               onChange={this.onChange} onFocus={this.selectText}
                               value={conn ? conn.host : ""}
                               />
                        <label>:</label>
                        <input id="txtPort" name="port" type="text" className="form-control" placeholder="6379" spellCheck="false"
                               onChange={this.onChange} onFocus={this.selectText}
                               value={conn ? conn.port : ""}
                               />
                        <label>db</label>
                        <input id="txtDb" name="db" type="text" className="form-control" placeholder="0" spellCheck="false"
                               onChange={this.onChange} onFocus={this.selectText}
                               value={conn ? conn.db : ""}
                               />
                    </div>
                    <p className="actions">
                        <img className="loader" src="/img/ajax-loader.gif" />
                        <button id="btnConnect" className="btn btn-default btn-primary">Change Connection</button>
                    </p>
                    <p className="bg-success">{this.state.successMessage}</p>
                    <p className="bg-danger error-summary"></p>
                </form>
            </div>
          </div>
        );
    }
});

var Console = React.createClass({
    render: function () {
        return (
          <div id="console-page">
            <div className="content"></div>
          </div>
        );
    }
});

var Monitor = React.createClass({
    render: function () {
        return (
          <div id="monitor-page">
            <div className="content"></div>
          </div>
        );
    }
});

var App = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(ConnectionStore, "onConnection")
    ],
    getInitialState: function() {
        return { connection: null };
    },
    onConnection: function (connection) {
        this.setState({ connection: connection });
    },
    onSearchFocus: function (e) {
        this.transitionTo('search');
        Actions.search(e.target.value);
    },
    onSearchKeyUp: function(e){
        Actions.search(e.target.value);
    },
    render: function () {
        var Connection = <b>not connected</b>;
        var conn = this.state.connection;
        if (conn != null) {
            Connection = <b>{conn.host}:{conn.port} db={conn.db}</b>;
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
                                <span className="octicon octicon-search"></span>
                                <input id="txtSearch" type="text" className="input-lg" placeholder="Search Keys" spellCheck="false"
                                       onFocus={this.onSearchFocus} 
                                       onKeyUp={this.onSearchKeyUp} />
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
                    <div className="sidebar left">
                        <ul id="menu">
                            <li className="list-group-item">
                                <Link to="console" title="Console">
                                    <span className="mega-octicon octicon-terminal"></span>
                                </Link>
                            </li>
                            <li className="list-group-item">
                                <Link to="monitor" title="Monitor">
                                    <span className="mega-octicon octicon-megaphone"></span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div id="body">
                        {/* this is the important part */}
                        <RouteHandler />
                    </div>
                </div>
                <div id="poweredby">powered by <a href="https://servicestack.net" target="_blank">servicestack.net</a></div>
            </div>
      );
    }
});

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="connections" handler={Connections} />
    <Route name="search" handler={Search} />
    <Route name="keys" handler={KeyViewer} />
    <Route name="console" handler={Console} />
    <Route name="monitor" handler={Monitor} />
    <DefaultRoute handler={Dashboard} />
  </Route>
);

Router.run(routes, function (Handler, state) {
    React.render(<Handler />, document.body);

    var name = state.pathname.substring(1);
    document.body.className = name + '-active';
});


Actions.viewInfo();
Actions.loadConnection();