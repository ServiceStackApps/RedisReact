var KeyViewer = React.createClass({
    mixins: [
        DebugLogMixin,
        Router.Navigation,
        Router.State,
        Reflux.listenTo(KeyStore, "onKeyLoaded")
    ],
    componentWillMount: function () {
        this.setState({ rawModes: [], relatedKeys:[] });
        var q = this.getQuery();
        Actions.loadKey(q.id, q.type);
        document.addEventListener('keyup', this.globalKeyUp);
    },
    componentWillUnmount: function () {
        document.removeEventListener('keyup', this.globalKeyUp);
    },
    componentWillReceiveProps: function () {
        var q = this.getQuery();
        Actions.loadKey(q.id, q.type);
    },
    onKeyLoaded: function (result) {
        this.setState({ result: result });
    },
    navToKey: function (e) {
        var tr = $(e.target).parents("tr");
        this.viewKey(tr.data("id"), tr.data("type"));
    },
    viewKey: function(id, type){
        var args = { id: id, type: type };
        this.transitionTo("keys", null, args);
    },
    console: function () {
        this.transitionTo("console");
        Actions.setConsole('GET ' + this.state.result.id);
    },
    edit: function () {
        this.transitionTo("console");
        Actions.setConsole('SET ' + this.state.result.id + ' ' + this.state.result.value);
    },
    toggleRawMode: function (pos, e) {
        if (hasTextSelected())
            return;

        if (this.state.rawModes[pos] && (e.shiftKey || e.ctrlKey)) {
            selectText(e.target);
            return;
        }

        var rawModes = this.state.rawModes;
        if (typeof pos == 'number') {
            rawModes[pos] = !rawModes[pos];
        } else {
            var rawMode = !rawModes[0];
            var len = Math.max(Object.keys(this.state.result.relatedKeys || {}).length + 1, rawModes.length);
            for (var i = 0; i < len; i++) {
                rawModes[i] = rawMode;
            }
        }

        this.setState({ rawModes: rawModes });
    },
    globalKeyUp: function (e) {
        var shortcutKeys = [Keys.LEFT, Keys.RIGHT, Keys.T];
        if (e.altKey || e.ctrlKey || shortcutKeys.indexOf(e.which) == -1)
            return;

        if (e.which == Keys.T) {
            this.toggleRawMode();
            return;
        }

        var nextKeyPos = e.which == Keys.LEFT
            ? -1
            : 1;

        var id = this.getQuery().id;
        var similarKeys = this.state.result.similarKeys || [];
        for (var i = 0; i < similarKeys.length; i++) {
            var key = similarKeys[i];
            if (key.id == id) {
                var nextKey = similarKeys[i + nextKeyPos];
                if (nextKey) {
                    this.viewKey(nextKey.id, nextKey.type);
                }
                return;
            }
        }
    },
    render: function () {
        var $this = this;
        var View = <div>Key does not exist</div>;
        var SimilarKeys = <div/>;

        var result = this.state.result;
        if (result && result.similarKeys) {
            SimilarKeys = (
                <table className="table">
                <tbody>
                <tr>
                    <th>{result.query}</th>
                </tr>
                    {result.similarKeys.map(function(r){
                        var activeClass = r.id == result.id ? 'active ' : '';
                        var activeIcon = activeClass
                            ? <b className="octicon octicon-chevron-right"></b>
                            : <b></b>;

                        return (
                            <tr key={r.id} className={activeClass} onClick={$this.navToKey} data-id={r.id} data-type={r.type}>
                                <td>
                                    {activeIcon}
                                    {r.id}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                </table>
            );
        }

        var relatedKeys = result && result.relatedKeys || {};
        var id = this.getQuery().id;
        var rawModes = this.state.rawModes;
        var i = 0;

        var Edit = null;
        if (result && result.type == 'string') {
            Edit = (<div className="action" onClick={this.edit}>
                        <span className="octicon octicon-pencil"></span><b>edit</b>
                    </div>);
        }

        return (
          <div id="keyviewer-page">
            <div className="actions">
                <div className="action" onClick={this.console}>
                    <span className="octicon octicon-terminal"></span>
                    <b>console</b>
                </div>
                {Edit}
            </div>
              <div className="content">
                <div id="similarkeys" title="use left/right arrow keys">
                    {SimilarKeys}
                </div>
                <div id="keyview">
                    <KeyView key={id} result={result} rawMode={rawModes[i]} toggleRawMode={this.toggleRawMode.bind(this, i)} isPrimary={true} />
                    {Object.keys(relatedKeys).map(function(id){
                        if (!relatedKeys[id]) return;
                        i++;
                        var result = {id: id, value:relatedKeys[id], type:'string'};
                        return (
                            <KeyView key={id} result={result} rawMode={rawModes[i]} toggleRawMode={$this.toggleRawMode.bind($this, i)} />
                        );
                    })}
                </div>
              </div>
          </div>
        );
    }
});