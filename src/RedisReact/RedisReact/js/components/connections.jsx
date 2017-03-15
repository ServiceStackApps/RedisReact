var Connections = React.createClass({
    mixins: [
        Reflux.listenTo(ConnectionStore, "onConnection")
    ],
    getInitialState: function () {
        return { connections: ConnectionStore.connections, connection: null, successMessage: null };
    },
    onConnection: function () {
        this.setState({ connections: ConnectionStore.connections });
    },
    selectText: function (e) {
        var target = e.target;
        setTimeout(function () {
            target.select();
        }, 0);
    },
    onChange: function(e) {
        var conn = this.state.connection || {};
        conn[e.target.name] = e.target.value;
        this.setState({ connection: conn });
    },
    onClear: function(e) {
        e.preventDefault();
        this.setState({ connection: null });
    },
    onSubmit: function(e) {
        e.preventDefault();

        this.setState({ successMessage: null });

        var $this = this;
        $(e.target).ajaxSubmit({
            onSubmitDisable: $("#btnSave"),
            success: function() {
                $this.setState({ successMessage: "Connections updated" });
                Actions.loadConnections();
            }
        });
    },
    onDelete: function(e, conn) {
        e.preventDefault();

        var $this = this;
        Redis.deleteConnection(conn)
            .then(function (r) {
                $this.setState({ successMessage: "Deleted " + conn.host + ":" + conn.port, connections: r.connections });
            });
    },
    onConnect: function (e, conn) {
        e.preventDefault();

        var $this = this;
        Redis.setConnection(conn)
            .then(function (r) {
                $this.setState({ successMessage: "Connected to " + conn.host + ":" + conn.port, connections: r.connections });
            });
    },
    onUpdate: function (e, conn) {
        e.preventDefault();
        this.setState({ connection: conn });
    },
    render: function () {
        const conn = this.state.connection;
        var $this = this;

        var ExistingConnections = {};
        if (this.state.connections !== null) {
            ExistingConnections = (
                    <table className="table table-striped wrap">
                        <thead>
                            <tr>
                                <td></td>
                                <td>Host</td>
                                <td>Port</td>
                                <td>Db</td>
                                <td>Role</td>
                                <td>Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.connections.map(function (conn) {
                                var Status = null;
                                var Buttons = [];
                                const onUpdate = (e) => {
                                    $this.onUpdate(e, conn);
                                };
                                Buttons.push(<button className="btn btn-default btn-primary" onClick={onUpdate}>Update</button>);
                                if (!conn.isActive) {
                                    Status = <label className="octicon octicon-radio-tower"></label>;
                                    const onConnect = (e) => {
                                        $this.onConnect(e, conn);
                                    };
                                    Buttons.push(<button className="btn btn-default btn-success octicon octicon-radio-tower" onClick={onConnect}></button>);
                                    const onDelete = (e) => {
                                        $this.onDelete(e, conn);
                                    };
                                    Buttons.push(<button className="btn btn-default btn-danger octicon octicon-x" onClick={onDelete}></button>);
                                } else {
                                    Status = <label className="octicon octicon-radio-tower" style={{ color: "#2cbe4e" }}></label>;
                                }
                                return (
                                    <tr key={conn.host + ":" + conn.port}>
                                        <td>{Status}</td>
                                        <td>{conn.host}</td>
                                        <td>{conn.port}</td>
                                        <td>{conn.db}</td>
                                        <td>{conn.isMaster ? "master" : ""}</td>
                                        <td>{Buttons}</td>
                                    </tr>
                                    );
                                })}
                        </tbody>
                </table>
            );
        }

        return (
          <div id="connections-page">
            <div className="content">
                <h2>Redis Connections</h2>
                {ExistingConnections}
                <form id="formConnection" className="form-inline" onSubmit={this.onSubmit} action="/connections">
                    <div className="form-group">
                        <label className="octicon octicon-radio-tower"></label>
                        <input ref="txtHost" id="txtHost" name="host" type="text" className="form-control" placeholder="127.0.0.1" spellCheck="false"
                               onChange={this.onChange} onFocus={this.selectText}
                               value={conn ? conn.host : ""} />
                        <label>:</label>
                        <input id="txtPort" name="port" type="text" className="form-control" placeholder="6379" spellCheck="false"
                               onChange={this.onChange} onFocus={this.selectText}
                               value={conn ? conn.port : ""} />
                        <label>db</label>
                        <input id="txtDb" name="db" type="text" className="form-control" placeholder="0" spellCheck="false"
                               onChange={this.onChange} onFocus={this.selectText}
                               value={conn ? conn.db : ""} />
                        <label>auth</label>
                        <input id="txtPassword" name="password" type="password" className="form-control" placeholder="password" spellCheck="false"
                               onChange={this.onChange} onFocus={this.selectText}
                               value={conn ? conn.password : ""} />
                    </div>
                    <p className="actions">
                        <img className="loader" src="/img/ajax-loader.gif" />
                        <button id="btnSave" className="btn btn-default btn-primary">{conn != null ? "Save" : "Add"}</button>
                        <button id="btnCancel" className="btn btn-default" onClick={this.onClear}>Cancel</button>
                    </p>
                    <p className="bg-success">{this.state.successMessage}</p>
                    <p className="bg-danger error-summary"></p>
                </form>
            </div>
          </div>
        );
    }
});

