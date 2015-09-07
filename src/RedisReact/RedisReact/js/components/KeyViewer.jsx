var KeyViewer = React.createClass({
    mixins: [
        Router.Navigation,
        Router.State,
        Reflux.listenTo(KeyStore, "onKeyLoaded")
    ],
    init: function () {
    },
    getInitialState: function () {
        var q = this.getQuery();
        Actions.loadKey(q.id, q.type);
        return { id: q.id, type: q.type, rawMode: false };
    },
    onKeyLoaded: function (result) {
        this.setState({ result: result });
    },
    toggleRawMode: function () {
        this.setState({ rawMode: !this.state.rawMode });
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
        var isComplexJson = s.indexOf('{') >= 0 || s.indexOf('[') >= 0;
        if (!isComplexJson)
            return <div>{s}</div>;

        if (this.state.rawMode)
            return <div className="rawview">{s}</div>;

        try {
            var o = JSON.parse(s);
            return <div className="jsonviewer" dangerouslySetInnerHTML={{__html: jsonviewer(o)}} />;
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
        var View = <div>Key does not exist</div>;
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
        }
        var title = this.state.rawMode ? 'click for preview' : 'click for raw view';

        return (
          <div id="keyviewer-page">
              <div className="content">
                <h3>
                  <span className="octicon octicon-key"></span>
                  <i>{this.state.type}</i>
                  <b>{this.state.id}</b>
                </h3>
                  <div onClick={this.toggleRawMode} title={title}>
                      {View}
                  </div>
              </div>
          </div>
        );
    }
});