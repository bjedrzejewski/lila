lichess.movetimeChart = function(data) {
  var log1p = Math.log1p || function(x) { return Math.log(x + 1); };

  lichess.loadScript('/assets/javascripts/chart/common.js').done(function() {
    lichess.loadScript('/assets/javascripts/chart/division.js').done(function() {
      lichess.chartCommon('highchart').done(function() {
        lichess.movetimeChart.render = function() {
          $('#movetimes_chart:not(.rendered)').each(function() {
            var $this = $(this).addClass('rendered');

            var series = {
              white: [],
              black: []
            };

            var tree = data.treeParts;
            var moveCentis = data.game.moveCentis ||
                 data.game.moveTimes.map(function(i) { return i * 10; });
            var ply = 0;
            var max = 0;

            moveCentis.forEach(function(time, i) {
              var node = tree[i + 1];
              ply = node ? node.ply : ply + 1;
              var san = node ? node.san : '-';

              var turn = (ply + 1) >> 1;
              var color = ply & 1;
              var y = Math.pow(log1p(.005 * Math.min(time, 12e4)), 2);
              max = Math.max(y, max);

              series[color ? 'white' : 'black'].push({
                name: turn + (color ? '. ' : '... ') + san,
                x: i,
                y: color ? y : -y
              });
            });

            var disabled = {
              enabled: false
            };
            var noText = {
              text: null
            };
            $this.highcharts({
              credits: disabled,
              legend: disabled,
              series: [{
                name: 'White',
                data: series.white
              }, {
                name: 'Black',
                data: series.black
              }],
              chart: {
                type: 'area',
                spacing: [2, 0, 2, 0],
                animation: false
              },
              tooltip: {
                formatter: function() {
                  var seconds = moveCentis[this.x] / 100;
                  if (seconds) seconds = seconds.toFixed(seconds >= 2 ? 1 : 2);
                  return this.point.name + '<br /><strong>' + seconds + '</strong> seconds';
                }
              },
              plotOptions: {
                series: {
                  animation: false
                },
                area: {
                  fillColor: Highcharts.theme.lichess.area.white,
                  negativeFillColor: Highcharts.theme.lichess.area.black,
                  fillOpacity: 1,
                  threshold: 0,
                  lineWidth: 1,
                  color: '#3893E8',
                  allowPointSelect: true,
                  cursor: 'pointer',
                  states: {
                    hover: {
                      lineWidth: 1
                    }
                  },
                  events: {
                    click: function(event) {
                      if (event.point) {
                        event.point.select();
                        lichess.analyse.jumpToIndex(event.point.x);
                      }
                    }
                  },
                  marker: {
                    radius: 1,
                    states: {
                      hover: {
                        radius: 3,
                        lineColor: '#3893E8',
                        fillColor: '#ffffff'
                      },
                      select: {
                        radius: 4,
                        lineColor: '#3893E8',
                        fillColor: '#ffffff'
                      }
                    }
                  }
                }
              },
              title: noText,
              xAxis: {
                title: noText,
                labels: disabled,
                lineWidth: 0,
                tickWidth: 0,
                plotLines: lichess.divisionLines(data.game.division)
              },
              yAxis: {
                title: noText,
                min: -max,
                max: max,
                labels: disabled,
                gridLineWidth: 0
              }
            });
          });
          lichess.analyse.onChange();
        };
        lichess.movetimeChart.render();
      });
    });
  });
};
