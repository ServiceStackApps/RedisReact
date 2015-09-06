var Search = React.createClass({
    mixins: [
        Router.Navigation,
        Reflux.listenTo(SearchStore, "onSearchResults")
    ],
    getInitialState: function () {
        return { results: SearchStore.searchResults };
    },
    onSearchResults: function (searchResults) {
        this.setState({ results: searchResults });
    },
    onKeyClick: function (e) {
        var tr = $(e.target).parent("tr");
        this.transitionTo("keys", null, { id: tr.data("id"), type: tr.data("type") });
    },
    render: function () {
        var SearchResults;
        var $this = this;
        if (this.state.results.length > 0) {
            SearchResults = (
                <table className="table table-striped table-wrap search-results">
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
