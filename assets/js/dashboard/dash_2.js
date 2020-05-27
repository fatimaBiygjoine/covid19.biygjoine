window.addEventListener("load", () => {
    makeChart();
});

//makeChart(remplir liste,modifier le graphe,changer les statistiques)
async function makeChart() {
    const covidData = await getData();

    covidData.countryList.forEach(selectionCountry)

    function selectionCountry(country) {
        var x = document.getElementById("select");
        var option = document.createElement("option");
        option.text = country;
        x.add(option);
    }

    let y = $('table').find('tbody')
    for (let i= 0 ; i < covidData.countryList.length ; i++) {
        y.append(`<tr><td>${i+1}</td>
		<td>${covidData.countryList[i]}</td>
		<td>${covidData.confirmed_case_today[i]}</td>
		<td>${covidData.death_today[i]}</td></tr>`);
    }

    $(document).ready(function () {
        $('#zero-config').DataTable({
            "oLanguage": {
                "oPaginate": { "sPrevious": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-left"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>', "sNext": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' },
                "sInfo": "Showing page _PAGE_ of _PAGES_",
                "sSearch": '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-search"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
                "sSearchPlaceholder": "Search...",
               "sLengthMenu": "Results :  _MENU_",
            },
            "stripeClasses": [],
            "lengthMenu": [5, 10, 20, 50],
            "pageLength": 5 
        });
        $('.dataTables_length').addClass('bs-select');

		
		
	const database = firebase.database();

        async function storeData() {
            const covidData = await getData();
            for (let i= 0 ; i < covidData.countryList.length; i++) {
        
        const rootRef = database.ref(covidData.countryList[i]);
    

        
    
        rootRef.child(covidData.date.length-1).set({

            date : covidData.date[covidData.date.length-1] ,
            confirmed : covidData.confirmed_case_today[i],
            deaths:  covidData.death_today[i],
            recovered : covidData.recovered_until_today[i]
            
            

        });

        console.log("saveeeed "+covidData.countryList[i]);

        }
    

       }


      });
//modifier les statistiques
    document.getElementById("death").innerHTML = covidData.death_toll ;
    document.getElementById("report").innerHTML = covidData.reported_cases_now;

    //the graph
    var d_1options = {
        chart: {
            id: 'chart',
            height: 400,
            type: 'area',
            zoom: {
                enabled: true,
                type: 'xy',
            },
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 1,
                color: 'transparent',
                opacity: 0.3,
            }
        },
        colors: ['red', 'blue'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
            },
        },
        dataLabels: {
            enabled: false
        },
        legend: {
            position: 'top',
            horizontalAlign: 'center',
            fontSize: '14px',
            markers: {
                width: 50,
                height: 4,
            },
            itemMargin: {
                horizontal: 0,
                vertical: 8
            }
        },
        grid: {
            borderColor: 'transparent',
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['red','blue']
        },
        series: [{
            name: 'Death',
            data: covidData.death
        }, {
            name: 'Cases',
            data: covidData.confirmed
        }],
        xaxis: {
            type: 'datetime',
            categories: covidData.date,
        },
        fill: {
            type: 'gradient',
            gradient: {
                //shade: 'dark',
                type: 'vertical',
                //shadeIntensity: 0.3,
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100]
            }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function(val) {
                    return val
                }
            }
        }
    }



    var cases_deaths = new ApexCharts(
        document.getElementById("graph"),
        d_1options
    );
    cases_deaths.render();

    document.getElementById('select').addEventListener('change', () => {
        countryValue = document.getElementById('select').value
        const confirmed = [];
        const death = [];
        covidData.data[countryValue].forEach(function(item, index) {
            confirmed.push(item["confirmed"]);
            death.push(item["deaths"]);
        });
        var death_toll = death[death.length - 1];
        var reported_cases_now = confirmed[confirmed.length - 1];


        ApexCharts.exec('chart', "updateSeries", [{
            data: death
			
        },{
            data: confirmed
			
        }
		]);
        document.getElementById("death").innerHTML = (death_toll );
        document.getElementById("report").innerHTML = reported_cases_now;
    })

}


async function getData() {
    let response = await fetch(
        "https://pomber.github.io/covid19/timeseries.json"
    );
    let data = await response.json();
    const labels = Object.keys(data);
    const date = [];
    const confirmed = [];
    const death = [];
    const confirmed_case_today = []
    const death_today = []
    data['Afghanistan'].forEach(function(item, index) {
        date.push(item["date"]);
        confirmed.push(item["confirmed"]);
        death.push(item["deaths"]);
    });
    var death_toll = death[death.length - 1];//death de dernier jour de Afghanistan
    var reported_cases_now = confirmed[confirmed.length - 1];//confirmed de dernier jour de Afghanistan
    var countryList = Object.keys(data)


    countryList.forEach(function(country,index) {
        confirmed_case_today.push(data[country][data[country].length - 1]['confirmed'])//confirmed de dernier jour de chaque pays
        death_today.push(data[country][data[country].length - 1]['deaths'])//death de dernier jour de chaque pays
    })

    const newArr = [countryList, confirmed_case_today,death_today]
    console.log(newArr)

    return {
        countryList,
        data,
        date,
        confirmed,
        death,
        death_toll,
        reported_cases_now,
        confirmed_case_today,
        death_today
    };
}

