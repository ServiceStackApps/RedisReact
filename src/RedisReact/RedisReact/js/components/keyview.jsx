var KeyView = React.createClass({
    renderValue: function (s) {
        if (typeof s == 'undefined')
            s = '';
        if (!isJsonObject(s)) {
            if (typeof s == 'string' && s.startsWith('"') && s.endsWith('"'))
                s = s.substring(1, s.length -1);

            return <div>{s}</div>;
        }

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
        var i = 0;
        return (
            <table className="table table-striped wrap">
            <tbody>
                {items.map(function(x){
                    return (
                        <tr key={i++}><td>{$this.renderValue(x)}</td></tr>
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
                        <tr key={k}><td>{$this.renderValue(k)}</td><td>{$this.renderValue(values[k])}</td></tr>
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

        var Title = <b><Link to="keys" query={{id:result.id, type:result.type}}>{result.id}</Link></b>;
        if (this.props.isPrimary) {
            var key = result.id;
            var Links = [];

            var lastPos = 0;
            for (var i = 0; i < key.length; i++) {
                var c = key[i];
                if (SEPARATORS.indexOf(c) != -1) {
                    var pattern = key.substring(0,i+1) + '*';
                    Links.push(<Link key={pattern} to="search" query={{q: pattern}}>{key.substring(lastPos, i)}</Link>);
                    Links.push(<em key={i}>{key.substring(i, i+1)}</em>);
                    lastPos = i + 1;
                }
            }

            Links.push(<b key={lastPos}>{key.substring(lastPos)}</b>);

            Title = <b className="keycrumbs">{Links}</b>;
        }

        return (
            <div className="keyview">
                <h3>
                  <span className="octicon octicon-key"></span>
                  <i>{result.type}</i>
                  {Title}
                </h3>
                <div onClick={this.props.toggleRawMode} title="use 't' shortcut key">
                    {View}
                </div>
            </div>
        );
    }
});