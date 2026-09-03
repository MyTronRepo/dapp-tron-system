import contractAbi from "../contracts/contract-abi.json";


const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;



// CONNECT TRONLINK

export const connectTronLink = async () => {

    const tronWeb = window.tronWeb || window.tron?.tronWeb;


    if (!tronWeb) {
        throw new Error(
            "TronLink is not installed"
        );
    }


    const address =
        tronWeb.defaultAddress.base58;



    if (!address) {

        throw new Error(
            "Please unlock TronLink wallet first"
        );

    }



    console.log(
        "CONNECTED TRON ADDRESS:",
        address
    );


    return address;

};





// NETWORK CHECK

export const getTronNetwork = ()=>{


    const tronWeb =
        window.tron?.tronWeb;



    if(!tronWeb){
        throw new Error(
            "TronWeb unavailable"
        );
    }



    const host =
        tronWeb.fullNode.host;



    return {

        host,

        name:
        host.includes("nile")
        ?
        "Nile"
        :
        "Unknown",


        isCorrect:
        host.includes("nile")

    };


};






// CONTRACT

export const getContract = async()=>{


    const tronWeb =
        window.tron.tronWeb;



    if(!CONTRACT_ADDRESS){

        throw new Error(
            "Contract address missing"
        );

    }



    return await tronWeb.contract(
        contractAbi,
        CONTRACT_ADDRESS
    );

};






export const getPropertyIds = async()=>{


    const contract =
        await getContract();


    return await contract
        .getPropertyIds()
        .call();


};






export const getProperty = async(propertyId)=>{


    if(!propertyId){

        throw new Error(
            "Property ID required"
        );

    }


    const contract =
        await getContract();



    return await contract
        .getProperty(propertyId)
        .call();


};