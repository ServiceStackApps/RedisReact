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
    onChange: function (e) {
        var oldIndex = this.state.index || 0;
        var index = e.target.parentElement.id.split('_')[1];
        var conn = (index != oldIndex) ? {} : this.state.connection || {};
        conn[e.target.name] = e.target.value;
        this.setState({ connection: conn, index: index });
    },
    onSubmit: function (e) {
        e.preventDefault();
        var index = e.target.parentElement.id.split('_')[1];

        this.setState({ successMessage: null });

        var $this = this;
        $(e.target).ajaxSubmit({
            onSubmitDisable: $("#btnConnect"),
            success: function () {
                $this.setState({ successMessage: index === 0 ? "Connection was added" : "Connection was updated" });
                Actions.loadConnections();
            }
        });
    },
    //onAdd: function (e) {
    //    e.preventDefault();
    //    this.setState({ successMessage: null });

    //    var $this = this;
    //    $(e.target).ajaxSubmit({
    //        onSubmitDisable: $("#btnConnect"),
    //        success: function () {
    //            $this.setState({ successMessage: "Connection was added" });
    //            Actions.loadConnections();
    //        }
    //    });

    //},
    renderConnection: function(i) {
        var $this = this;
        var connection = this.state.connections[i] || this.state.connection;

        var color = "#000";
        var Buttons = [];
        if (!this.state.connections[i]) {
            Buttons.push(<button id="btnConnect" className="btn btn-default btn-primary">Add</button>);
        } else {
            if (!connection.isActive) {
                Buttons.push(<button id="btnConnect" className="btn btn-default btn-primary">Update & Connect</button>);
            } else {
                color = "#2cbe4e";
                Buttons.push(<button id="btnConnect" className="btn btn-default btn-primary">Update</button>);
            }
            Buttons.push(<button id="btnDelete" className="btn btn-default btn-danger" onClick={$this.onDelete}>X</button>);
        }

        let groupId = "connection_" + i;
        return (
            <form id="formConnection" className="form-inline" onSubmit={this.onSubmit} action="/connections">
                <div className="form-group" id={groupId}>
                    <label className="octicon octicon-radio-tower" style={{color: color}}></label>
                    <input id="txtHost" name="host" type="text" className="form-control" placeholder="127.0.0.1" spellCheck="false" onChange={$this.onChange} onFocus={$this.selectText} value={connection ? connection.host : ""} />
                    <label>:</label>
                    <input id="txtPort" name="port" type="text" className="form-control" placeholder="6379" spellCheck="false" onChange={$this.onChange} onFocus={$this.selectText} value={connection ? connection.port : ""} />
                    <label>auth</label>
                    <input id="txtPassword" name="password" type="password" className="form-control" placeholder="password" spellCheck="false" onChange={this.onChange} onFocus={this.selectText} value={connection ? connection.password : ""} />
                    <label>db</label>
                    <input id="txtDb" name="db" type="text" className="form-control" placeholder="0" spellCheck="false" onChange={$this.onChange} onFocus={this.selectText} value={connection ? connection.db : ""} />
                    {Buttons}
                </div>
            </form>
        );
    },
    render: function () {
        var Connections = [];
        if (this.state.connections != null && this.state.connections.length > 0) {
            for (let i = 0; i < this.state.connections.length; i++) {
                Connections.push(this.renderConnection(i));
            }
        }
        Connections.push(this.renderConnection(Connections.length)); // the connection that hasn't been added to the server yet

        //<form id="formConnection" className="form-inline" onSubmit={this.onSubmit} action="/connections">
        //    <p className="actions">
        //        <img className="loader" src="/img/ajax-loader.gif" />
        //        <button id="btnConnect" className="btn btn-default btn-primary">Update Connections</button>
        //    </p>
        //</form>

        return (
          <div id="connections-page">
            <div className="content">
                <h2>Redis Connections</h2>
                {Connections}
                <p className="bg-success">{this.state.successMessage}</p>
                <p className="bg-danger error-summary"></p>
            </div>
          </div>
        );
    }
});

