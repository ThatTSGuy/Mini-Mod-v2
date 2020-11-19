const plotly = require('plotly')('JackTemko', 'zTPsSDnjrIKWvgl7GDgu');
const fs = require('fs');

module.exports = {
    newGraph(data) {
        return new Promise((res, rej) => {
            let trace1 = {
                x: data.x,
                y: data.y,
                mode: "lines",
                type: "scatter",
                name: "API Ping",
                fill: "tonexty",
                fillcolor: "rgba(31, 119, 180, 0.5)",
                stackgroup: 1,
                lines: {
                    color: "1F77B4",
                    width: 2,
                    dash: "solid",
                    shape: "linear",
                    simplify: true
                }
            };

            let layout = {
                title: "Client Ping",
                xaxis: {
                    range: [1, 20],
                    showline: false
                },
                yaxis: {
                    range: [50, 250],
                    showline: false
                },
                margin: {
                    l: 30,
                    r: 20,
                    t: 40,
                    b: 20
                }
            };

            var figure = { 'data': [trace1], 'layout': layout };

            var imgOpts = {
                format: 'png',
                width: 500,
                height: 300
            };

            plotly.getImage(figure, imgOpts, function (error, imageStream) {
                if (error) rej(error);
                let fileName = `ping.png`;

                fileStream = fs.createWriteStream(fileName);
                imageStream.pipe(fileStream);

                fileStream.on('close', () => {
                    res(fileName);
                });
            });
        });
    }
};