var KeyViewer = React.createClass({
    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(KeyStore, "onKeyLoaded")
    ],
    componentWillMount: function () {
        var q = this.getQuery();
        this.setState({ id: q.id, type: q.type, rawMode: false });
        Actions.loadKey(q.id, q.type);
        document.addEventListener('keyup', this.globalKeyUp);
    },
    componentWillUnmount: function () {
        document.removeEventListener('keyup', this.globalKeyUp);
    },
    componentWillReceiveProps: function () {
        var q = this.getQuery();
        this.setState({ id: q.id, type: q.type });
        Actions.loadKey(q.id, q.type);
    },
    onKeyLoaded: function (result) {
        this.setState({ result: result });

        if (!result.similarKeys)
            Actions.loadSimilarKeys(result);
    },
    toggleRawMode: function () {
        this.setState({ rawMode: !this.state.rawMode });
    },
    navToKey: function(e){
        var tr = $(e.target).parents("tr");
        this.viewKey(tr.data("id"), tr.data("type"));
    },
    viewKey: function(id, type){
        var args = { id: id, type: type };
        this.transitionTo("keys", null, args);
    },
    globalKeyUp: function (e) {
        var LEFT = 37, RIGHT = 39, T = 84;
        var shortcutKeys = [LEFT, RIGHT, T];
        if (e.altKey || e.ctrlKey || shortcutKeys.indexOf(e.which) == -1)
            return;

        if (e.which == T) {
            this.toggleRawMode();
            return;
        }

        var nextKeyPos = e.which == LEFT
            ? -1
            : 1;

        var id = this.state.id;
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
    onValueClick: function (e) {
        if ($(e.target).data('exists')) {
            //Causes Invariant Violation, eventually ends in inconsistent state breaking App
            //this.viewKey($(e.target).data('ref'), 'string');
            //var q = { id: $(e.target).data('ref'), type: 'string' };
            //this.setState(q);
            //Actions.loadKey(q.id, q.type);
        }
    },
    renderValue: function (s) {
        if (typeof s == 'undefined')
            s = '';
        var isComplexJson = s.indexOf('{') >= 0 || s.indexOf('[') >= 0;
        if (!isComplexJson)
            return <div>{s}</div>;

        if (this.state.rawMode)
            return <div className="rawview">{s}</div>;

        var $this = this;
        var refKeys = [];

        function valueFmt(k, v, vFmt) {
            if (k.length > 2 && k.endsWith('Id') && k.indexOf("'") == -1) {
                var ref = "urn:" + k.substring(0, k.length - 2).toLowerCase() + ":" + v;
                var existsAttr = Redis.existsCache[ref]
                    ? " data-exists='1'"
                    : "";
                refKeys.push(ref);
                return "<span data-ref='" + ref + "'" + existsAttr + ">" + vFmt + "</span>";
            }

            return vFmt;
        };

        try {
            var o = JSON.parse(s);
            var el = <div onClick={this.onValueClick} className="jsonviewer" 
                          dangerouslySetInnerHTML={{__html: jsonviewer(o, valueFmt)}} />;

            if (refKeys.length > 0) {
                Redis.cachedExists(refKeys);
            }

            return el;
        } catch (e) {
            return <div>{s}</div>;
        }
    },
    renderString: function(value){
        return (
            <div className="key-preview key-string wrap">
                <table className="table table-striped wrap">
                    <tr><td>{this.renderValue(value)}</td></tr>
                </table>
            </div>
        );
    },
    renderList: function (items) {
        var $this = this;
        return (
            <table className="table table-striped wrap">
                {items.map(function(x){
                    return (
                        <tr><td>{$this.renderValue(x)}</td></tr>
                    );
                })}
            </table>
        );
    },
    renderMap: function (values) {
        var $this = this;
        return (
            <table className="table table-striped wrap">
                {Object.keys(values).map(function(k){
                    return (
                        <tr><td>{$this.renderValue(k)}</td><td>{$this.renderValue(values[k])}</td></tr>
                    );
                })}
            </table>
        );
    },
    render: function () {
        var $this = this;
        var View = <div>Key does not exist</div>;
        var SimilarKeys = <div/>;

        var result = this.state.result;
        if (result) {
            if (result.type == 'string')
                View = this.renderString(result.value);
            else if (result.type == 'list')
                View = this.renderList(result.value);
            else if (result.type == 'set')
                View = this.renderList(result.value);
            else if (result.type == 'zset')
                View = this.renderMap(result.value);
            else if (result.type == 'hash')
                View = this.renderMap(result.value);

            if (result.similarKeys) {
                SimilarKeys = (
                    <table className="table">
                        <tr>
                            <th>{result.parent}</th>
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
                    </table>
                );
            }
        }

        return (
          <div id="keyviewer-page">
              <div className="content">
                <h3>
                  <span className="octicon octicon-key"></span>
                  <i>{this.state.type}</i>
                  <b>{this.state.id}</b>
                </h3>
                <div id="similarkeys" title="use left/right arrow keys">
                    {SimilarKeys}
                </div>
                <div id="keyview">
                    {View}
                    <a id="lnkToggleRaw" onClick={this.toggleRawMode} title="use 't' shortcut key">{this.state.rawMode ? 'hide raw' : 'view raw'}</a>
                </div>
              </div>
          </div>
        );
    }
});