var Connections = React.createClass({
    render: function () {
        return (
          <div id="connections-page">
            <div className="content"></div>
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
    mixins: [Router.Navigation],
    onSearchFocus: function (e) {
        this.transitionTo('search');
        Actions.search(e.target.value);
    },
    onSearchKeyUp: function(e){
        Actions.search(e.target.value);
    },
    render: function () {
        return (
            <div>
                <nav className="navbar navbar-default navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <Link to="app" title="Home" className="navbar-brand">
                                <img id="redislogo" alt="Brand" src="/img/redis-logo.png" />
                            </Link>
                            <h1>Redis React</h1>
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
                            <a href="https://servicestack.net" title="servicestack.net">
                                <img id="logo" alt="Brand" src="/img/logo-32.png" />
                            </a>
                        </div>
                    </div>
                </nav>
                <div>
                    <div className="sidebar left">
                        <ul id="menu">
                            <li className="list-group-item">
                                <Link to="connections" title="Connections">
                                    <span className="mega-octicon octicon-radio-tower"></span>
                                </Link>
                            </li>
                            <li className="list-group-item">
                                <Link to="search" title="Search">
                                    <span className="mega-octicon octicon-search"></span>
                                </Link>
                            </li>
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
                <div id="poweredby">powered by <a href="https://servicestack.net">servicestack.net</a></div>
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