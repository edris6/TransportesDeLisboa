import fetch, { Response } from 'node-fetch';
import https from 'https';

const url = "https://api.metrolisboa.pt:8243/estadoServicoML/1.0.1/";
const key = '4462e2b1-6436-3910-ad7c-4c9bf387ab3e';

interface MetroResponse {
  codigo: number;
  resposta: {
    amarela: string;
    verde: string;
    azul: string;
    vermelha: string;
  };
}

async function requestFromMetro(
  urls: string = url,
  location: string
): Promise<MetroResponse | undefined> {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer ' + key,
    },
    agent: agent,
  };

  try {
    const response: Response = await fetch(urls + location, options);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data: any = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return undefined;
  }
}

export async function status(): Promise<Record<string, string> | string> {
  const response = await requestFromMetro(url, "estadoLinha/todos");
  if (response && response.codigo == 200) {
    const { amarela, verde, azul, vermelha } = response.resposta;
    return { amarela, verde, azul, vermelha };
  } else {
    return "oops";
  }
}
