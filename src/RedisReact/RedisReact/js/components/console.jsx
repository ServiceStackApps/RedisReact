var Console = React.createClass({
    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(SettingsStore, "onSettingsUpdated"),
        Reflux.listenTo(ConsoleStore, "onConsoleChanged")
    ],
    getInitialState: function(){
        return {
            show: false,
            expand: false,
            command: ConsoleStore.command,
            history: ConsoleStore.history,
            historyIndex: ConsoleStore.historyIndex,
            logs: ConsoleStore.logs,
            appRawMode: SettingsStore.appRawMode,
            rawModes: {}
        };
    },
    componentWillMount: function () {
        var q = this.getQuery();
        this.setState({ expand: q.expand == "true" });
    },
    onSettingsUpdated: function (settings) {
        this.setState({ appRawMode: settings.appRawMode, rawModes: {} });
    },
    onConsoleChanged: function (store) {
        var txtPrompt = this.getTextInput();
        this.setState(store, function () {
            txtPrompt.focus();
        });
    },
    setCommand: function (cmd, e) {
        var txtPrompt = this.getTextInput();
        this.setState({ command: cmd }, function () {
            txtPrompt.focus();
        });
    },
    clearLogs: function(){
        Actions.clearLogs();
        this.refs.txtPrompt.getDOMNode().focus();
    },
    getTextInput: function(){
        var txt = !this.state.expand
            ? this.refs.txtPrompt
            : this.refs.txtExpandedPrompt;
        return txt.getDOMNode();
    },
    toggleExpand: function(e){
        var $this = this;
        this.setState({ expand: !this.state.expand }, function () {
            $this.getTextInput().focus();
        });
    },
    toggleHistory: function (e) {
        this.setState({ show: !this.state.show });
    },
    toggleRawMode: function (id, e) {
        if (hasTextSelected())
            return;

        if (this.state.rawModes[id] && (e.shiftKey || e.ctrlKey)) {
            selectText(e.target);
            return;
        }

        this.state.rawModes[id] = !this.state.rawModes[id];
        this.setState({ rawModes: this.state.rawModes });
    },
    renderResponse: function (r, rawMode) {
        if (typeof r == 'string')
            return (<div className="string">{this.renderValue(r, rawMode)}</div>);
        
        if (r.length) {
            var $this = this;
            var list = [];
            for (var i=0; i < r.length; i++){
                list.push(<div key={i} className="item">{$this.renderValue(r[i], rawMode)}</div>);
            }
            return (<div className="list">{list}</div>);
        }
    },
    renderValue: function (s, rawMode) {
        if (typeof s == 'undefined')
            s = '';

        if (!isJsonObject(s))
            return <div>{s}</div>;

        if (rawMode)
            return <div className="rawview">{s}</div>;

        try {
            var o = JSON.parse(s);
            var el = <div className="jsonviewer" 
                          dangerouslySetInnerHTML={{__html: jsonviewer(o)}} />;
            return el;
        } catch (e) {
            return <div>{s}</div>;
        }
    },
    onSubmit: function (e) {
        e.preventDefault();

        var cmd = this.state.command;
        if (!cmd)
            return;

        Actions.addToHistory(cmd);

        var $this = this;
        Redis.execCommandString(cmd)
            .then(function (r) {
                var result = JSON.stringify(r);
                var type = r === 'OK' ? 'ok' : r ? 'msg' : 'empty';
                Actions.logEntry({
                    cmd: cmd,
                    result: r || "(empty)",
                    type: type
                });
            })
            .fail(function (jq, jqStatus, statusDesc) {
                var status = $.ss.parseResponseStatus(jq.responseText, statusDesc);
                Actions.logEntry({
                    cmd: cmd,
                    result: status.message,
                    stackTrace: status.stackTrace,
                    type: 'err',
                });
            });
        ;
    },
    onKeyDown: function(e){
        var keycode = e.which;
        var shortcutKeys = [Keys.UP, Keys.DOWN];
        if (e.altKey || e.ctrlKey || shortcutKeys.indexOf(keycode) == -1)
            return;

        if (keycode == Keys.UP) {
            Actions.nextHistory(-1);
            e.preventDefault();
        }
        else if (keycode == Keys.DOWN) {
            Actions.nextHistory(1);
        }
    },
    onChange: function(e){
        this.setState({ command: e.target.value });
    },
    render: function () {
        var $this = this;
        var logs = this.state.logs;
        var ToggleLogs = null;

        if (logs.length > 0) {
            if (this.state.show) {
                ToggleLogs = (
                    <div id="btnToggleHistory" onClick={this.toggleHistory}>
                        <span className="octicon octicon-screen-normal"></span>
                        <b>hide history</b>
                    </div>);
            } else {
                ToggleLogs = (
                    <div id="btnToggleHistory" onClick={this.toggleHistory}>
                        <span className="octicon octicon-screen-full"></span>
                        <b>show history</b>
                    </div>);
            }
        }

        var Prompt, ExpandedPrompt = null;
        if (this.state.expand) {
            ExpandedPrompt = (
                <div id="expandedPrompt">
                    <div className="collapse-console" title="collapse">
                        <span className="octicon octicon-screen-normal" onClick={this.toggleExpand}></span>
                    </div>
                    <textarea ref="txtExpandedPrompt" id="txtExpandedPrompt"
                        spellCheck="false" autoComplete="off"
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                        value={this.state.command}
                        ></textarea>
                </div>);
        } else {
            Prompt = (
                <div id="prompt">
                    <div className="expand-console" title="expand">
                        <span className="octicon octicon-screen-full" onClick={this.toggleExpand}></span>
                    </div>
                    <div id="label">
                        <span className="octicon octicon-chevron-right"></span>
                    </div>
                    <input ref="txtPrompt" id="txtPrompt" type="text" className="input-lg"
                        placeholder="Redis Commands e.g: GET key"
                        spellCheck="false" autoComplete="off"
                        onChange={this.onChange}
                        onKeyDown={this.onKeyDown}
                        value={this.state.command}
                       />
                </div>);
        }

        var Logs = [];
        if (this.state.show) {
            Logs = logs.map(function(log) {
                var cls = "entry";
                if (log.type)
                    cls += " " + log.type;

                var rawMode = $this.state.appRawMode ? !$this.state.rawModes[log.id] : $this.state.rawModes[log.id];
                return (
                    <div key={log.id} className={cls}>
                        <div className="cmd" onClick={$this.setCommand.bind($this, log.cmd)}>
                            {log.cmd}
                        </div>
                        <div className="result" onClick={$this.toggleRawMode.bind($this, log.id)}>
                            {$this.renderResponse(log.result, rawMode)}
                            <div className="clear"></div>
                        </div>
                    </div>
                );
            });
            if (logs.length > 0) {
                Logs.push(
                    <div className="actions">
                        <div id="btnClearHistory" onClick={this.clearLogs}>
                            <span className="octicon octicon-x"></span>
                            <b>clear history</b>
                        </div>
                    </div>);
            }
        }

        return (
          <div id="console-page">
            <div id="console" className="content">
                <div id="log">
                    {Logs}
                </div>
                <div className="actions">
                    {ToggleLogs}
                </div>
                <form id="formConsole" onSubmit={this.onSubmit}>
                    {Prompt}
                </form>
            </div>
            {ExpandedPrompt}
          </div>
        );
    }
});

