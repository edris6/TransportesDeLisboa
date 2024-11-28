import fetch from 'node-fetch';
import https from 'https';

const url = "https://api.metrolisboa.pt:8243/estadoServicoML/1.0.1/";
const key = 'key';


//function generate_key(){}


async function request_from_metro(urls = url, location){
  const agent = new https.Agent({
    rejectUnauthorized: false,  // Disable SSL verification (use with caution)
  });

  const options = {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Authorization': 'Bearer ' + key,  // Replace with actual token
    },
    agent: agent,  // Add the agent to the fetch options
  };

  try {
    const response = await fetch(urls + location, options);
    
    // Check if the response is successful
    if (!response.ok) {
      throw new Error(JSON.stringify(response.status));
    }
    
    // Parse the response as JSON
    const data = await response.json();
    //console.log(data);  // Log the data to the console

    return data;  // Return the data to the calling function

  } catch (error) {
    console.error('Error:', error);  // Log any errors that occur
  }
}

export async function status() {
  let response = await request_from_metro(url,"estadoLinha/todos");
  //console.log(response)
  if (response.codigo == 200){
    const filteredresponse = {
      amarela: response.resposta.amarela,
      verde: response.resposta.verde,
      azul: response.resposta.azul,
      vermelha: response.resposta.vermelha,
    };
    return filteredresponse
  }else if (response.codigo != 200){
    return "oops"
  }
  
  

  
}
  

  

