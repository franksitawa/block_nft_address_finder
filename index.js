
const Web3 = require('web3');
const readline=require('readline')
require('dotenv').config()
const prompt = require("prompt-sync")({ sigint: true });
const cliProgress = require('cli-progress');

const ERC1155InterfaceId = "0xd9b67a26";
const ERC721InterfaceId = "0x80ac58cd";

let web3 = new Web3(Web3.givenProvider || process.env.PROVIDER_URL);
const ERC165Abi = [
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4",
        },
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  
  async function getBlockInfo(blockID){
    let blockInfo=await web3.eth.getBlock(blockID)
    let nfts=[]
    const addAddress=(address)=>nfts.push(address)
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(blockInfo.transactions.length-1, 0);
    for(let i=0;i<blockInfo.transactions.length;i++){
        bar.update(i)
        let txReceipt=await web3.eth.getTransactionReceipt(blockInfo.transactions[i]);
            if(txReceipt.contractAddress){
                const contract = new web3.eth.Contract(
                    ERC165Abi,
                    txReceipt.contractAddress
                  );
                let res=await contract.methods
                    .supportsInterface(ERC1155InterfaceId)
                    .call()
                if(res){
                    addAddress(txReceipt.contractAddress)
                }else{
                    res=await contract.methods
                    .supportsInterface(ERC721InterfaceId)
                    .call()
                    if(res){
                        addAddress(txReceipt.contractAddress)
                    }
                }   
            }
    } 
    bar.stop()
    return nfts
  }
(async() => {
    
    while(true){
        try{
            let block = prompt("Please Enter a Block Number(Type 0 to exit): ");
            if(block==0) process.exit()
            console.log("Processing Block: ",block)
            let blockNumber=parseInt(block.trim())
            if(blockNumber){
                await getBlockInfo(blockNumber).then((nfts)=>{
                    console.log(nfts)
                    console.log("End")
                    })
            }else{
                console.log("Invalid Block Number")
            }
        }catch(e){
            console.log(e)
            console.log("\nAn Error Occurred, Please try again")
        }
        
    }
         
})();

  
