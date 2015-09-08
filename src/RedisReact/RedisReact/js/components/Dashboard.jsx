var Dashboard = React.createClass({
    mixins: [
        Reflux.listenTo(InfoStore, "onInfoResults")
    ],
    getInitialState: function () {
        return { info: InfoStore.info };
    },
    onInfoResults: function (info) {
        this.setState({ info: info });
    },
    render: function () {
        var Info = <div/>;

        var info = this.state.info;
        if (info) {
            Info = (
                <table className="table table-striped table-wrap">
                    {
                        [].concat.apply(Object.keys(info).map(function(group){
                            var to = [<tr><th colSpan="2">{group}</th></tr>];
                            var infoGroup = info[group];
                            Object.keys(infoGroup).forEach(function(k){
                                to.push(<tr><td>{k}</td><td>{infoGroup[k]}</td></tr>)
                        });
                            return to;
                        }))
                        }
                </table>
            );
        }

        return (
          <div id="dashboard-page">
              <div className="content">
                  {Info}
              </div>
          </div>
        );
    }
});
