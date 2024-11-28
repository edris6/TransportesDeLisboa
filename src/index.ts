import { status } from './metrolisboa.mjs';

async function main(): Promise<void> {
  console.log(await status());
}

main();
