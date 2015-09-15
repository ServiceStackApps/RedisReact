var Connections = React.createClass({
    mixins: [
        Reflux.listenTo(ConnectionStore, "onConnection")
    ],
    getInitialState: function () {
        return { connection: ConnectionStore.connection, successMessage: null };
    },
    componentDidMount: function () {
        this.refs.txtHost.getDOMNode().focus();
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
                        <input ref="txtHost" id="txtHost" name="host" type="text" className="form-control" placeholder="127.0.0.1" spellCheck="false"
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

