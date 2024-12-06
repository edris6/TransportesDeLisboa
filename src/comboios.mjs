import comboios from 'comboios';


async function station_exists(name){
    let available_stations = await comboios.stations()
    for(let i = 0;i < available_stations.length; i++){
        if (available_stations[i].station == name){
            return true
        }
    }
    return false
}
  
(async () => {
    const exists = await station_exists("123");
    console.log(exists); 
})();