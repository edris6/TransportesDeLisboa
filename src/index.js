import {status} from './metrolisboa.mjs';

async function main(){
    console.log(await status())
}
main()