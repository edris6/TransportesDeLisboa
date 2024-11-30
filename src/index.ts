import { status } from './metrolisboa.mjs';

async function MetroStatus():  Promise<Record<string, string> | string> {
  let status_: Record<string, string> | string =  await status()
  if (status_ == "oops"){
    throw new Error()
  }
}

MetroStatus();
