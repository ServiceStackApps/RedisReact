var KeyView = React.createClass({
    renderValue: function (s) {
        if (typeof s == 'undefined')
            s = '';
        if (!isJsonObject(s))
            return <div>{s}</div>;

        if (this.props.rawMode)
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
    renderString: function(value){
        return (
            <div className="key-preview key-string wrap">
                <table className="table table-striped wrap">
                    <tbody><tr><td>{this.renderValue(value)}</td></tr></tbody>
                </table>
            </div>
        );
    },
    renderList: function (items) {
        var $this = this;
        return (
            <table className="table table-striped wrap">
            <tbody>
                {items.map(function(x){
                    return (
                        <tr><td>{$this.renderValue(x)}</td></tr>
                    );
                })}
            </tbody>
            </table>
        );
    },
    renderMap: function (values) {
        var $this = this;
        return (
            <table className="table table-striped wrap">
            <tbody>
                {Object.keys(values).map(function(k){
                    return (
                        <tr><td>{$this.renderValue(k)}</td><td>{$this.renderValue(values[k])}</td></tr>
                    );
                })}
            </tbody>
            </table>
        );
    },
    render: function () {
        var $this = this;
        var View = <div className="keyview-none">Key does not exist</div>;

        var result = this.props.result;
        if (!result) 
            return View;

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

        return (
            <div className="keyview">
                <h3>
                  <span className="octicon octicon-key"></span>
                  <i>{result.type}</i>
                  <b><Link to="keys" query={{id:result.id, type:result.type}}>{result.id}</Link></b>
                </h3>
                <div onClick={this.props.toggleRawMode} title="use 't' shortcut key">
                    {View}
                </div>
            </div>
        );
    }
});