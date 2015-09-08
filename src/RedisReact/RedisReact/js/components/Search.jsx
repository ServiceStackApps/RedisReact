var Search = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(SearchStore, "onSearchResults")
    ],
    getInitialState: function () {
        return { results: SearchStore.searchResults, viewGrid: false, gridResults:[] };
    },
    onSearchResults: function (searchResults) {
        this.setState({ results: searchResults, viewGrid: false, gridResults: [] });
    },
    onKeyClick: function (e) {
        var tr = $(e.target).parent("tr");
        this.transitionTo("keys", null, { id: tr.data("id"), type: tr.data("type") });
    },
    toggleGridView: function (e) {
        var viewGrid = !this.state.viewGrid;

        var keys = this.state.results.map(function (r) {
            return r.id;
        });
        var $this = this;
        Redis.getStringValues(keys)
            .then(function (r) {
                var to = [];
                Object.keys(r).forEach(function (k) {
                    try {
                        var o = JSON.parse(r[k]);
                        o.__id = k;
                        to.push(o);
                    } catch (e) { }
                });

                $this.setState({ viewGrid:viewGrid, gridResults: to })
            });

    },
    render: function () {
        var SearchResults;
        var $this = this;
        if (this.state.results.length > 0) {
            var ViewGrid = null;

            if (SearchStore.searchText.length > 3) {
                var ViewGrid = (
                    <caption className="actions">
                        <div className="viewgrid" onClick={this.toggleGridView}>
                            <span className="octicon octicon-list-unordered"></span>
                            <b>{this.state.viewGrid ? 'view summary' : 'view as grid'}</b>
                        </div>
                    </caption>);
            }

            var gridResults = this.state.gridResults || [];
            if (this.state.viewGrid && gridResults.length > 0) {
                var headers = Object.keys(gridResults[0]).filter(function (k) {
                    return !k.startsWith("__");
                });

                SearchResults = (
                    <table className="table table-striped table-wrap search-results">
                      {ViewGrid}
                      <thead>
                          <tr>
                              {headers.map(function(k){
                                return <th>{k}</th>;
                              })}
                          </tr>
                      </thead>
                      <tbody>
                          {gridResults.map(function(o){
                            return (
                                <tr key={o.__id} onClick={$this.onKeyClick} data-id={o.__id} data-type="string">
                                  {headers.map(function(k){
                                    var v = o[k];
                                    return <td>{valueFmt(v)}</td>;
                                  })}
                                </tr>
                            );
                          })}
                      </tbody>
                    </table>);
            } else {
                SearchResults = (
                    <table className="table table-striped table-wrap search-results">
                      {ViewGrid}
                      <thead>
                          <tr>
                              <th>Key</th>
                              <th>Type</th>
                              <th>Size</th>
                              <th>Expires</th>
                          </tr>
                      </thead>
                      <tbody>
                          {this.state.results.map(function(r){
                              return (
                                  <tr key={r.id} onClick={$this.onKeyClick} data-id={r.id} data-type={r.type}>
                                      <td>{r.id}</td>
                                      <td>{r.type}</td>
                                      <td>{r.size + (r.type == 'string' ? ' byte' : ' element') + (r.size > 1 ? 's' : '') }</td>
                                      <td>{r.ttl == -1 ? 'never' : Math.round(r.ttl / 1000) + 's'}</td>
                                  </tr>
                              );
                          })}
                      </tbody>
                    </table>);
            }

        } else if ($("#txtSearch").val()) {
            SearchResults = <div>Sorry No Results :(</div>
        }

        return (
          <div id="search-page">
              <div className="content">
                  {SearchResults}
              </div>
          </div>
        );
    }
});
